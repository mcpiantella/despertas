import type { JourneyArea, ScoreMap } from "@/lib/jornada-do-despertar/quiz-data";
import { JOURNEY_RESULTS } from "@/lib/jornada-do-despertar/results";
import { buildWhatsAppUrl } from "@/lib/jornada-do-despertar/whatsapp";

type ResultViewProps = {
  result: {
    key: JourneyArea;
    label: string;
    scores: ScoreMap;
  };
  whatsappNumber: string;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
};

export function ResultView({
  result,
  whatsappNumber,
  onPrimaryClick,
  onSecondaryClick
}: ResultViewProps) {
  const content = JOURNEY_RESULTS[result.key];
  const primaryUrl = buildWhatsAppUrl({
    phoneNumber: whatsappNumber,
    variant: "identification",
    resultLabel: result.label
  });
  const secondaryUrl = buildWhatsAppUrl({ phoneNumber: whatsappNumber, variant: "doubt" });

  return (
    <section className="jd-card jd-card--result">
      <p className="jd-eyebrow">Sua leitura inicial</p>
      <h1>{content.title}</h1>
      {content.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}

      <ul className="jd-observations">
        {content.observations.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <div className="jd-cta">
        <h2>Quer olhar para isso com mais profundidade?</h2>
        <p>Perceber um padrão é importante.</p>
        <p>
          Mas identificar quais travas mentais podem estar por trás dele exige um processo
          mais completo.
        </p>
        <p>
          A <strong>Sessão de Identificação de Travas Mentais</strong> é o próximo passo
          da Jornada do Despertar.
        </p>
        <p>
          <strong>O Quiz acendeu a luz.</strong>
          <br />
          <strong>A Sessão de Identificação mostra o mapa.</strong>
        </p>
      </div>

      <div className="jd-actions jd-actions--stacked">
        <a className="jd-button jd-button--primary" href={primaryUrl} onClick={onPrimaryClick}>
          Quero fazer minha Identificação de Travas
        </a>
        <a className="jd-button jd-button--secondary" href={secondaryUrl} onClick={onSecondaryClick}>
          Tenho uma dúvida antes
        </a>
      </div>
    </section>
  );
}
