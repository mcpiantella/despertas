import { z } from "zod";
import { QUIZ_QUESTIONS } from "./quiz-data";
import type { JourneyAnswer } from "./scoring";

const MAX_NAME_LENGTH = 120;
const MAX_WHATSAPP_LENGTH = 40;
const MAX_EMAIL_LENGTH = 254;
const MAX_URL_LENGTH = 2048;
const MAX_TAG_LENGTH = 255;
const MAX_ANSWER_ID_LENGTH = 64;

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
  questionId: z.string().min(1).max(MAX_ANSWER_ID_LENGTH, "Dados invalidos"),
  optionId: z.string().min(1).max(MAX_ANSWER_ID_LENGTH, "Dados invalidos")
});

const boundedTextSchema = z.string().max(MAX_TAG_LENGTH, "Dados invalidos");
const boundedUrlSchema = z.string().max(MAX_URL_LENGTH, "Dados invalidos");

const journeyLeadPayloadSchema = z.object({
  submissionId: z.string().uuid(),
  name: z
    .string()
    .trim()
    .min(2, "Nome obrigatorio")
    .max(MAX_NAME_LENGTH, "Nome invalido"),
  whatsapp: z
    .string()
    .min(1, "WhatsApp invalido")
    .max(MAX_WHATSAPP_LENGTH, "WhatsApp invalido"),
  email: z.string().email("E-mail invalido").max(MAX_EMAIL_LENGTH, "E-mail invalido"),
  answers: z.array(journeyAnswerSchema).max(QUIZ_QUESTIONS.length, "Dados invalidos"),
  consentAccepted: z.literal(true, {
    errorMap: () => ({ message: "Consentimento obrigatorio" })
  }),
  consentVersion: z.literal(CONSENT_VERSION),
  privacyPolicyUrl: boundedUrlSchema,
  landingUrl: boundedUrlSchema,
  referrer: boundedUrlSchema,
  utm: z.object({
    source: boundedTextSchema,
    medium: boundedTextSchema,
    campaign: boundedTextSchema,
    term: boundedTextSchema,
    content: boundedTextSchema
  }),
  origin: boundedTextSchema,
  campaign: boundedTextSchema,
  honeypot: boundedTextSchema
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
