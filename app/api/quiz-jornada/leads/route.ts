import {
  JOURNEY_RESULT_DISPLAY_LABELS,
  type JourneyArea
} from "@/lib/jornada-do-despertar/quiz-data";
import { createRateLimiter } from "@/lib/jornada-do-despertar/rate-limit";
import { scoreJourneyQuiz } from "@/lib/jornada-do-despertar/scoring";
import { validateJourneyLeadPayload } from "@/lib/jornada-do-despertar/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const CRM_WEBHOOK_TIMEOUT_MS = 5000;
const RATE_LIMIT_PER_MINUTE = 5;

const rateLimiter = createRateLimiter({
  limit: RATE_LIMIT_PER_MINUTE,
  windowMs: 60_000
});

type SupabaseError = {
  code?: string;
  message: string;
};

type ExistingLead = {
  id: string;
  result_key: "CD" | "VP" | "FL" | "SR" | "IP";
  result_label: string;
  score_cd: number;
  score_vp: number;
  score_fl: number;
  score_sr: number;
  score_ip: number;
};

export async function POST(request: Request): Promise<Response> {
  if (!rateLimiter.check(resolveClientIp(request))) {
    return json(
      { ok: false, error: "Muitas tentativas. Aguarde um instante e tente novamente." },
      429
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Payload invalido" }, 400);
  }

  let payload: ReturnType<typeof validateJourneyLeadPayload>;

  try {
    payload = validateJourneyLeadPayload(body);
  } catch (error) {
    return json({ ok: false, error: errorMessage(error) }, 400);
  }

  let scoring;

  try {
    scoring = scoreJourneyQuiz(payload.answers);
  } catch (error) {
    return json({ ok: false, error: errorMessage(error) }, 400);
  }

  const supabase = createSupabaseServerClient();
  const row = {
    submission_id: payload.submissionId,
    name: payload.name,
    whatsapp_raw: payload.whatsappRaw,
    whatsapp_normalized: payload.whatsappNormalized,
    email: payload.email,
    result_key: scoring.resultKey,
    result_label: scoring.resultLabel,
    score_cd: scoring.scores.CD,
    score_vp: scoring.scores.VP,
    score_fl: scoring.scores.FL,
    score_sr: scoring.scores.SR,
    score_ip: scoring.scores.IP,
    answers: payload.answers,
    consent_accepted: payload.consentAccepted,
    consent_accepted_at: new Date().toISOString(),
    consent_version: payload.consentVersion,
    privacy_policy_url: payload.privacyPolicyUrl,
    utm_source: payload.utm.source,
    utm_medium: payload.utm.medium,
    utm_campaign: payload.utm.campaign,
    utm_term: payload.utm.term,
    utm_content: payload.utm.content,
    landing_url: payload.landingUrl,
    referrer: payload.referrer,
    origin: payload.origin,
    campaign: payload.campaign,
    status: "Novo lead"
  };

  const insertResult = await supabase
    .from("quiz_jornada_leads")
    .insert(row)
    .select("id")
    .single();

  if (insertResult.error) {
    if (isDuplicateSubmission(insertResult.error)) {
      return handleDuplicateSubmission(supabase, payload.submissionId);
    }

    return json({ ok: false, error: "Nao foi possivel salvar suas informacoes agora." }, 500);
  }

  const leadId = insertResult.data.id;
  await notifyCrmWebhook(supabase, leadId, row);

  return json({
    ok: true,
    duplicate: false,
    leadId,
    result: {
      key: scoring.resultKey,
      label: scoring.resultLabel,
      scores: scoring.scores
    }
  });
}

async function handleDuplicateSubmission(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  submissionId: string
): Promise<Response> {
  const existingResult = await supabase
    .from("quiz_jornada_leads")
    .select("id,result_key,result_label,score_cd,score_vp,score_fl,score_sr,score_ip")
    .eq("submission_id", submissionId)
    .single();

  if (existingResult.error || !existingResult.data) {
    return json({ ok: false, error: "Nao foi possivel recuperar o envio existente." }, 500);
  }

  const lead = existingResult.data as ExistingLead;

  return json({
    ok: true,
    duplicate: true,
    leadId: lead.id,
    result: {
      key: lead.result_key,
      label: lead.result_label,
      scores: {
        CD: lead.score_cd,
        VP: lead.score_vp,
        FL: lead.score_fl,
        SR: lead.score_sr,
        IP: lead.score_ip
      }
    }
  });
}

async function notifyCrmWebhook(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  leadId: string,
  row: Record<string, unknown>
) {
  const webhookUrl = process.env.CRM_WEBHOOK_URL;

  if (!webhookUrl) {
    return;
  }

  const secret = process.env.CRM_WEBHOOK_SECRET;
  const crmPayload = {
    submissionId: row.submission_id,
    name: row.name,
    whatsapp: row.whatsapp_normalized,
    email: row.email,
    resultKey: row.result_key,
    resultLabel: JOURNEY_RESULT_DISPLAY_LABELS[row.result_key as JourneyArea],
    utm: {
      source: row.utm_source,
      medium: row.utm_medium,
      campaign: row.utm_campaign,
      term: row.utm_term,
      content: row.utm_content
    },
    landingUrl: row.landing_url,
    referrer: row.referrer
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(secret ? { Authorization: `Bearer ${secret}` } : {})
      },
      body: JSON.stringify(crmPayload),
      signal: AbortSignal.timeout(CRM_WEBHOOK_TIMEOUT_MS)
    });

    if (!response.ok) {
      throw new Error(`CRM webhook failed with status ${response.status}`);
    }

    await supabase
      .from("quiz_jornada_leads")
      .update({ crm_webhook_status: "success" })
      .eq("id", leadId);
  } catch (error) {
    await supabase
      .from("quiz_jornada_leads")
      .update({
        crm_webhook_status: "failed",
        crm_webhook_error: errorMessage(error)
      })
      .eq("id", leadId);
  }
}

function resolveClientIp(request: Request): string {
  // Prefer proxy-set headers; in x-forwarded-for only the LAST hop is appended
  // by the trusted proxy, earlier hops are client-controlled and spoofable.
  const proxyIp =
    request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-real-ip");

  if (proxyIp) {
    return proxyIp.trim();
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const lastHop = forwardedFor?.split(",").pop()?.trim();

  // Requests with no resolvable ip share one bucket instead of bypassing the limit.
  return lastHop || "unknown";
}

function isDuplicateSubmission(error: SupabaseError): boolean {
  return error.code === "23505";
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Erro inesperado";
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}
