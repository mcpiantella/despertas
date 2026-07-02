import { describe, expect, it } from "vitest";
import {
  CONSENT_VERSION,
  normalizeBrazilianWhatsApp,
  validateJourneyLeadPayload
} from "../validation";

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
  consentVersion: CONSENT_VERSION,
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

describe("normalizeBrazilianWhatsApp", () => {
  it("removes punctuation and prefixes Brazil code for local mobile numbers", () => {
    expect(normalizeBrazilianWhatsApp("(11) 91234-5678")).toBe("5511912345678");
  });

  it("keeps plausible numbers that already include Brazil code", () => {
    expect(normalizeBrazilianWhatsApp("+55 21 99876-5432")).toBe("5521998765432");
  });

  it("rejects numbers with implausible length", () => {
    expect(() => normalizeBrazilianWhatsApp("12345")).toThrow("WhatsApp invalido");
  });
});

describe("validateJourneyLeadPayload", () => {
  it("returns a normalized payload when data is valid", () => {
    const result = validateJourneyLeadPayload(validPayload);

    expect(result.whatsappRaw).toBe("(11) 91234-5678");
    expect(result.whatsappNormalized).toBe("5511912345678");
    expect(result.name).toBe("Maria Silva");
  });

  it("requires a meaningful name", () => {
    expect(() =>
      validateJourneyLeadPayload({ ...validPayload, name: "M" })
    ).toThrow("Nome obrigatorio");
  });

  it("requires a valid email", () => {
    expect(() =>
      validateJourneyLeadPayload({ ...validPayload, email: "maria" })
    ).toThrow("E-mail invalido");
  });

  it("requires accepted consent", () => {
    expect(() =>
      validateJourneyLeadPayload({ ...validPayload, consentAccepted: false })
    ).toThrow("Consentimento obrigatorio");
  });

  it("rejects filled honeypot fields", () => {
    expect(() =>
      validateJourneyLeadPayload({ ...validPayload, honeypot: "bot value" })
    ).toThrow("Solicitacao invalida");
  });

  it("rejects oversized names", () => {
    expect(() =>
      validateJourneyLeadPayload({ ...validPayload, name: "a".repeat(121) })
    ).toThrow("Nome invalido");
  });

  it("rejects oversized emails", () => {
    const email = `${"a".repeat(250)}@example.com`;

    expect(() =>
      validateJourneyLeadPayload({ ...validPayload, email })
    ).toThrow("E-mail invalido");
  });

  it("rejects oversized whatsapp values", () => {
    expect(() =>
      validateJourneyLeadPayload({ ...validPayload, whatsapp: "9".repeat(41) })
    ).toThrow("WhatsApp invalido");
  });

  it("rejects oversized landing urls", () => {
    expect(() =>
      validateJourneyLeadPayload({
        ...validPayload,
        landingUrl: `https://example.com/?q=${"a".repeat(2050)}`
      })
    ).toThrow("Dados invalidos");
  });

  it("rejects oversized utm values", () => {
    expect(() =>
      validateJourneyLeadPayload({
        ...validPayload,
        utm: { ...validPayload.utm, source: "a".repeat(256) }
      })
    ).toThrow("Dados invalidos");
  });

  it("rejects answer lists with more entries than questions", () => {
    const answers = Array.from({ length: 100 }, (_, index) => ({
      questionId: `q${index}`,
      optionId: "a"
    }));

    expect(() =>
      validateJourneyLeadPayload({ ...validPayload, answers })
    ).toThrow("Dados invalidos");
  });
});
