import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Juliana Piantella",
    template: "%s | Juliana Piantella"
  },
  description:
    "Fé, maturidade emocional e despertar espiritual para mulheres que desejam caminhar com mais clareza."
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
