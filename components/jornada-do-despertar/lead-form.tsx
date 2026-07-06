"use client";

import { type FormEvent } from "react";

export type LeadFormData = {
  name: string;
  whatsapp: string;
  email: string;
  consentAccepted: boolean;
  honeypot: string;
};

type LeadFormProps = {
  data: LeadFormData;
  isSubmitting: boolean;
  error?: string;
  onChange: (data: LeadFormData) => void;
  onSubmit: (data: LeadFormData) => void;
  onBack: () => void;
};

export function LeadForm({ data, isSubmitting, error, onChange, onSubmit, onBack }: LeadFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(data);
  }

  return (
    <section className="jd-card">
      <p className="jd-eyebrow">Leitura inicial</p>
      <h1>Sua Jornada já acendeu algumas luzes.</h1>
      <p>Para gerar sua leitura inicial, preencha abaixo:</p>

      <form className="jd-form" onSubmit={handleSubmit}>
        <label>
          Nome
          <input
            autoComplete="name"
            name="name"
            onChange={(event) => onChange({ ...data, name: event.target.value })}
            required
            type="text"
            value={data.name}
          />
        </label>

        <label>
          WhatsApp
          <input
            autoComplete="tel"
            name="whatsapp"
            onChange={(event) => onChange({ ...data, whatsapp: event.target.value })}
            required
            type="tel"
            value={data.whatsapp}
          />
        </label>

        <label>
          E-mail
          <input
            autoComplete="email"
            name="email"
            onChange={(event) => onChange({ ...data, email: event.target.value })}
            required
            type="email"
            value={data.email}
          />
        </label>

        <label className="jd-honeypot" aria-hidden="true">
          Empresa
          <input
            autoComplete="off"
            name="company"
            onChange={(event) => onChange({ ...data, honeypot: event.target.value })}
            tabIndex={-1}
            type="text"
            value={data.honeypot}
          />
        </label>

        <label className="jd-consent">
          <input
            checked={data.consentAccepted}
            onChange={(event) =>
              onChange({ ...data, consentAccepted: event.target.checked })
            }
            required
            type="checkbox"
          />
          <span>
            Ao continuar, você autoriza o envio das suas informações para que a Juliana
            Piantella possa retornar sobre a Jornada do Despertar e a Sessão de
            Identificação de Travas Mentais.
          </span>
        </label>

        <p className="jd-small">
          Esta leitura não é diagnóstico e não substitui a Sessão de Identificação de
          Travas Mentais. Ela é apenas um primeiro espelho para te ajudar a perceber áreas
          que talvez mereçam mais atenção.
        </p>

        {error ? (
          <p className="jd-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="jd-actions">
          <button className="jd-button jd-button--ghost" onClick={onBack} type="button">
            Voltar
          </button>
          <button className="jd-button jd-button--primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Gerando sua leitura..." : "Ver minha leitura inicial"}
          </button>
        </div>
      </form>
    </section>
  );
}
