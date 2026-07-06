import type { QuizOption, StepImage } from "@/lib/jornada-do-despertar/quiz-data";

type QuizStepProps = {
  eyebrow?: string;
  title: string;
  body?: string[];
  image?: StepImage;
  options?: QuizOption[];
  selectedOptionId?: string;
  buttonLabel?: string;
  onSelectOption?: (optionId: string) => void;
  onContinue: () => void;
  onBack?: () => void;
  continueDisabled?: boolean;
};

export function QuizStep({
  eyebrow,
  title,
  body,
  image,
  options,
  selectedOptionId,
  buttonLabel = "Continuar",
  onSelectOption,
  onContinue,
  onBack,
  continueDisabled
}: QuizStepProps) {
  return (
    <section className={`jd-card${options ? " jd-card--question" : ""}`} aria-live="polite">
      {eyebrow ? <p className="jd-eyebrow">{eyebrow}</p> : null}
      {image ? (
        <img
          alt={image.alt}
          className="jd-portrait"
          height={320}
          src={image.src}
          width={240}
        />
      ) : null}
      <h1>{title}</h1>
      {body?.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}

      {options ? (
        <div className="jd-options" role="radiogroup" aria-label={title}>
          {options.map((option) => (
            <button
              className="jd-option"
              data-selected={selectedOptionId === option.id}
              key={option.id}
              onClick={() => onSelectOption?.(option.id)}
              role="radio"
              aria-checked={selectedOptionId === option.id}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="jd-actions">
        {onBack ? (
          <button className="jd-button jd-button--ghost" onClick={onBack} type="button">
            Voltar
          </button>
        ) : null}
        <button
          className="jd-button jd-button--primary"
          disabled={continueDisabled}
          onClick={onContinue}
          type="button"
        >
          {buttonLabel}
        </button>
      </div>
    </section>
  );
}
