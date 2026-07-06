import { describe, expect, it } from "vitest";
import { buildWhatsAppUrl } from "../whatsapp";

describe("buildWhatsAppUrl", () => {
  it("builds the primary identification CTA with encoded result", () => {
    const url = buildWhatsAppUrl({
      phoneNumber: "5511999999999",
      variant: "identification",
      resultLabel: "Clareza e Direcao"
    });

    const parsed = new URL(url);
    expect(`${parsed.origin}${parsed.pathname}`).toBe("https://wa.me/5511999999999");
    expect(parsed.searchParams.get("text")).toBe(
      'Oi, Juliana! Fiz a Jornada do Despertar e meu resultado foi "Clareza e Direcao". Quero saber mais sobre a Sessão de Identificação de Travas Mentais.'
    );
  });

  it("builds the doubt CTA with encoded message", () => {
    const url = buildWhatsAppUrl({
      phoneNumber: "+55 (11) 99999-9999",
      variant: "doubt"
    });

    const parsed = new URL(url);
    expect(`${parsed.origin}${parsed.pathname}`).toBe("https://wa.me/5511999999999");
    expect(parsed.searchParams.get("text")).toBe(
      "Oi, Juliana! Fiz a Jornada do Despertar e fiquei com uma dúvida antes de agendar a Sessão de Identificação."
    );
  });
});
