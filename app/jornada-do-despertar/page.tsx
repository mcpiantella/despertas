import type { Metadata } from "next";
import { QuizShell } from "@/components/jornada-do-despertar/quiz-shell";

// Read NEXT_PUBLIC_* vars at request time instead of baking them into the
// build, so self-hosted deploys (EasyPanel/Docker) only need runtime env vars.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Jornada Despertas",
  description:
    "Um caminho breve para perceber padrões que talvez estejam influenciando sua clareza, constância e direção.",
  openGraph: {
    title: "Jornada Despertas | Juliana Piantella",
    description:
      "Um caminho breve para perceber padrões que talvez estejam influenciando sua clareza, constância e direção.",
    type: "website"
  }
};

export default function JornadaDoDespertarPage() {
  return (
    <QuizShell
      privacyPolicyUrl={process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL ?? ""}
      whatsappNumber={process.env.NEXT_PUBLIC_JULIANA_WHATSAPP_NUMBER ?? "5500000000000"}
    />
  );
}
