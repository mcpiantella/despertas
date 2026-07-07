import type { Metadata } from "next";
import { TrackingScripts } from "@/components/analytics/tracking-scripts";
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
      <body>
        <TrackingScripts
          gtmId={process.env.NEXT_PUBLIC_GTM_ID}
          ga4Id={process.env.NEXT_PUBLIC_GA4_ID}
          metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID}
        />
        {children}
      </body>
    </html>
  );
}
