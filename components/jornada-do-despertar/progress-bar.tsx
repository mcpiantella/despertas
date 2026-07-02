type ProgressBarProps = {
  value: number;
};

export function ProgressBar({ value }: ProgressBarProps) {
  const boundedValue = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className="jd-progress" aria-label={`Progresso ${boundedValue}%`}>
      <div className="jd-progress__meta">
        <span>Jornada do Despertar</span>
        <span>{boundedValue}%</span>
      </div>
      <div className="jd-progress__track">
        <div className="jd-progress__bar" style={{ width: `${boundedValue}%` }} />
      </div>
    </div>
  );
}
