create extension if not exists pgcrypto;

create table if not exists public.quiz_jornada_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  submission_id uuid not null unique,
  name text not null,
  whatsapp_raw text not null,
  whatsapp_normalized text not null,
  email text not null,
  result_key text not null,
  result_label text not null,
  score_cd integer not null,
  score_vp integer not null,
  score_fl integer not null,
  score_sr integer not null,
  score_ip integer not null,
  answers jsonb not null,
  consent_accepted boolean not null default false,
  consent_accepted_at timestamptz,
  consent_version text,
  privacy_policy_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  landing_url text,
  referrer text,
  origin text,
  campaign text,
  status text not null default 'Novo lead',
  crm_webhook_status text,
  crm_webhook_error text,
  constraint quiz_jornada_leads_result_key_check
    check (result_key in ('CD', 'VP', 'FL', 'SR', 'IP')),
  constraint quiz_jornada_leads_score_cd_check check (score_cd >= 0),
  constraint quiz_jornada_leads_score_vp_check check (score_vp >= 0),
  constraint quiz_jornada_leads_score_fl_check check (score_fl >= 0),
  constraint quiz_jornada_leads_score_sr_check check (score_sr >= 0),
  constraint quiz_jornada_leads_score_ip_check check (score_ip >= 0),
  constraint quiz_jornada_leads_status_check check (status in (
    'Novo lead',
    'Chamou no WhatsApp',
    'Explicacao enviada',
    'Interessada',
    'Aguardando pagamento',
    'Sessao agendada',
    'Nao respondeu',
    'Perdida',
    'Virou acompanhamento'
  )),
  constraint quiz_jornada_leads_consent_check check (consent_accepted = true)
);

alter table public.quiz_jornada_leads enable row level security;

revoke all on public.quiz_jornada_leads from anon;
revoke all on public.quiz_jornada_leads from authenticated;
