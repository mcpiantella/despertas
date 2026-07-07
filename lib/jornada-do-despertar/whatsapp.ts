import { normalizeBrazilianWhatsApp } from "./validation";

type BuildWhatsAppUrlInput =
  | {
      phoneNumber: string;
      variant: "identification";
      resultLabel: string;
    }
  | {
      phoneNumber: string;
      variant: "doubt";
      resultLabel?: string;
    };

export function buildWhatsAppUrl(input: BuildWhatsAppUrlInput): string {
  const phoneNumber = normalizeBrazilianWhatsApp(input.phoneNumber);
  const message =
    input.variant === "identification"
      ? `Oi, Juliana! Fiz a Jornada Despertas e meu resultado foi "${input.resultLabel}". Quero saber mais sobre a Sessão de Identificação de Travas Mentais.`
      : "Oi, Juliana! Fiz a Jornada Despertas e fiquei com uma dúvida antes de agendar a Sessão de Identificação.";

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
