import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../route";

const { createSupabaseServerClientMock } = vi.hoisted(() => ({
  createSupabaseServerClientMock: vi.fn()
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: createSupabaseServerClientMock
}));

const validAnswers = Array.from({ length: 10 }, (_, index) => ({
  questionId: `q${index + 1}`,
  optionId: "a"
}));

const validPayload = {
  submissionId: "6f99f74b-6cef-4d79-bdc8-b4e18ed75db1",
  name: "Maria Silva",
  whatsapp: "(11) 91234-5678",
  email: "maria@example.com",
  answers: validAnswers,
  consentAccepted: true,
  consentVersion: "jornada-do-despertar-v1",
  privacyPolicyUrl: "https://example.com/privacidade",
  landingUrl: "https://juliana.example/jornada-do-despertar?utm_source=instagram",
  referrer: "https://instagram.com/",
  utm: {
    source: "instagram",
    medium: "",
    campaign: "",
    term: "",
    content: ""
  },
  origin: "",
  campaign: "",
  honeypot: ""
};

describe("POST /api/quiz-jornada/leads", () => {
  beforeEach(() => {
    vi.stubEnv("CRM_WEBHOOK_URL", "");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("saves a valid lead and returns the server-calculated result", async () => {
    const supabase = createSupabaseMock({
      insertResult: { data: { id: "lead-1" }, error: null }
    });
    createSupabaseServerClientMock.mockReturnValue(supabase);

    const response = await POST(requestWith(validPayload));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      duplicate: false,
      leadId: "lead-1",
      result: {
        key: "CD",
        label: "Clareza e Direcao",
        scores: {
          CD: 9,
          VP: 7,
          FL: 5,
          SR: 3,
          IP: 6
        }
      }
    });
    expect(supabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        submission_id: validPayload.submissionId,
        whatsapp_raw: "(11) 91234-5678",
        whatsapp_normalized: "5511912345678",
        result_key: "CD",
        status: "Novo lead",
        consent_accepted: true
      })
    );
  });

  it("treats duplicate submission_id as a safe success", async () => {
    const supabase = createSupabaseMock({
      insertResult: { data: null, error: { code: "23505", message: "duplicate" } },
      duplicateResult: {
        data: {
          id: "lead-existing",
          result_key: "CD",
          result_label: "Clareza e Direcao",
          score_cd: 9,
          score_vp: 7,
          score_fl: 5,
          score_sr: 3,
          score_ip: 6
        },
        error: null
      }
    });
    createSupabaseServerClientMock.mockReturnValue(supabase);

    const response = await POST(requestWith(validPayload));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.duplicate).toBe(true);
    expect(body.leadId).toBe("lead-existing");
  });

  it("rejects invalid payloads", async () => {
    createSupabaseServerClientMock.mockReturnValue(createSupabaseMock());

    const response = await POST(requestWith({ ...validPayload, email: "maria" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "E-mail invalido"
    });
  });

  it("rejects filled honeypot fields", async () => {
    createSupabaseServerClientMock.mockReturnValue(createSupabaseMock());

    const response = await POST(requestWith({ ...validPayload, honeypot: "bot" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "Solicitacao invalida"
    });
  });

  it("rejects missing consent", async () => {
    createSupabaseServerClientMock.mockReturnValue(createSupabaseMock());

    const response = await POST(requestWith({ ...validPayload, consentAccepted: false }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "Consentimento obrigatorio"
    });
  });

  it("updates webhook status after a successful CRM webhook", async () => {
    vi.stubEnv("CRM_WEBHOOK_URL", "https://crm.example/webhook");
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }));
    const supabase = createSupabaseMock({
      insertResult: { data: { id: "lead-1" }, error: null }
    });
    createSupabaseServerClientMock.mockReturnValue(supabase);

    const response = await POST(requestWith(validPayload));

    expect(response.status).toBe(200);
    expect(fetch).toHaveBeenCalledWith(
      "https://crm.example/webhook",
      expect.objectContaining({ method: "POST" })
    );
    expect(supabase.update).toHaveBeenCalledWith({ crm_webhook_status: "success" });
  });

  it("calls the CRM webhook with an abort signal so it cannot hang the response", async () => {
    vi.stubEnv("CRM_WEBHOOK_URL", "https://crm.example/webhook");
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }));
    const supabase = createSupabaseMock({
      insertResult: { data: { id: "lead-1" }, error: null }
    });
    createSupabaseServerClientMock.mockReturnValue(supabase);

    await POST(requestWith(validPayload));

    expect(fetch).toHaveBeenCalledWith(
      "https://crm.example/webhook",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it("returns success and stores webhook failure when CRM webhook fails after insert", async () => {
    vi.stubEnv("CRM_WEBHOOK_URL", "https://crm.example/webhook");
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));
    const supabase = createSupabaseMock({
      insertResult: { data: { id: "lead-1" }, error: null }
    });
    createSupabaseServerClientMock.mockReturnValue(supabase);

    const response = await POST(requestWith(validPayload));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(supabase.update).toHaveBeenCalledWith({
      crm_webhook_status: "failed",
      crm_webhook_error: "CRM webhook failed with status 500"
    });
  });

  it("rate limits repeated submissions from the same ip", async () => {
    const supabase = createSupabaseMock({
      insertResult: { data: { id: "lead-1" }, error: null }
    });
    createSupabaseServerClientMock.mockReturnValue(supabase);

    const responses = [];
    for (let attempt = 0; attempt < 6; attempt += 1) {
      responses.push(
        await POST(requestWith(validPayload, { "x-forwarded-for": "203.0.113.9" }))
      );
    }

    expect(responses.slice(0, 5).map((response) => response.status)).toEqual([
      200, 200, 200, 200, 200
    ]);
    expect(responses[5].status).toBe(429);
    await expect(responses[5].json()).resolves.toMatchObject({ ok: false });
  });

  it("rate limits requests that lack any client ip header", async () => {
    const supabase = createSupabaseMock({
      insertResult: { data: { id: "lead-1" }, error: null }
    });
    createSupabaseServerClientMock.mockReturnValue(supabase);

    const responses = [];
    for (let attempt = 0; attempt < 6; attempt += 1) {
      responses.push(await POST(requestWithoutIp(validPayload)));
    }

    expect(responses[5].status).toBe(429);
  });

  it("ignores spoofed client-controlled hops in x-forwarded-for", async () => {
    const supabase = createSupabaseMock({
      insertResult: { data: { id: "lead-1" }, error: null }
    });
    createSupabaseServerClientMock.mockReturnValue(supabase);

    const responses = [];
    for (let attempt = 0; attempt < 6; attempt += 1) {
      responses.push(
        await POST(
          requestWith(validPayload, {
            "x-forwarded-for": `10.0.0.${attempt}, 203.0.113.50`
          })
        )
      );
    }

    expect(responses[5].status).toBe(429);
  });
});

let ipSequence = 0;

function requestWith(payload: unknown, headers: Record<string, string> = {}): Request {
  // Each call simulates a distinct client unless the test overrides the header.
  ipSequence += 1;

  return new Request("http://localhost/api/quiz-jornada/leads", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": `198.51.${Math.floor(ipSequence / 200)}.${ipSequence % 200}`,
      ...headers
    }
  });
}

function requestWithoutIp(payload: unknown): Request {
  return new Request("http://localhost/api/quiz-jornada/leads", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "content-type": "application/json" }
  });
}

function createSupabaseMock(options?: {
  insertResult?: { data: { id: string } | null; error: { code?: string; message: string } | null };
  duplicateResult?: { data: Record<string, unknown> | null; error: { message: string } | null };
}) {
  const insertResult = options?.insertResult ?? { data: { id: "lead-1" }, error: null };
  const duplicateResult = options?.duplicateResult ?? { data: null, error: null };

  const mock = {
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(async () => insertResult)
      }))
    })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(async () => duplicateResult)
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(async () => ({ data: null, error: null }))
    })),
    from: vi.fn(() => mock)
  };

  return mock;
}
