import { z } from "zod";
import type { JourneyAnswer } from "./scoring";

export const CONSENT_VERSION = "jornada-do-despertar-v1" as const;

export type JourneyLeadPayload = {
  submissionId: string;
  name: string;
  whatsapp: string;
  email: string;
  answers: JourneyAnswer[];
  consentAccepted: boolean;
  consentVersion: typeof CONSENT_VERSION;
  privacyPolicyUrl: string;
  landingUrl: string;
  referrer: string;
  utm: {
    source: string;
    medium: string;
    campaign: string;
    term: string;
    content: string;
  };
  origin: string;
  campaign: string;
  honeypot: string;
};

export type ValidatedJourneyLeadPayload = Omit<JourneyLeadPayload, "whatsapp"> & {
  whatsappRaw: string;
  whatsappNormalized: string;
};

const journeyAnswerSchema = z.object({
  questionId: z.string().min(1),
  optionId: z.string().min(1)
});

const journeyLeadPayloadSchema = z.object({
  submissionId: z.string().uuid(),
  name: z.string().trim().min(2, "Nome obrigatorio"),
  whatsapp: z.string().min(1, "WhatsApp invalido"),
  email: z.string().email("E-mail invalido"),
  answers: z.array(journeyAnswerSchema),
  consentAccepted: z.literal(true, {
    errorMap: () => ({ message: "Consentimento obrigatorio" })
  }),
  consentVersion: z.literal(CONSENT_VERSION),
  privacyPolicyUrl: z.string(),
  landingUrl: z.string(),
  referrer: z.string(),
  utm: z.object({
    source: z.string(),
    medium: z.string(),
    campaign: z.string(),
    term: z.string(),
    content: z.string()
  }),
  origin: z.string(),
  campaign: z.string(),
  honeypot: z.string()
});

export function normalizeBrazilianWhatsApp(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, "");

  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) {
    return digits;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  throw new Error("WhatsApp invalido");
}

export function validateJourneyLeadPayload(payload: unknown): ValidatedJourneyLeadPayload {
  const parsed = journeyLeadPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados invalidos");
  }

  if (parsed.data.honeypot.trim().length > 0) {
    throw new Error("Solicitacao invalida");
  }

  return {
    ...parsed.data,
    name: parsed.data.name.trim(),
    whatsappRaw: parsed.data.whatsapp,
    whatsappNormalized: normalizeBrazilianWhatsApp(parsed.data.whatsapp)
  };
}
