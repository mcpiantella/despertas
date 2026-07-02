# Jornada do Despertar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first production-ready MVP of the Jornada do Despertar quiz at `/jornada-do-despertar`, with tested scoring, Supabase lead capture, consent, idempotency, tracking, WhatsApp CTA, and mobile-first UX.

**Architecture:** Create a new Next.js App Router project in this workspace. Keep quiz domain logic in focused `lib/jornada-do-despertar/*` modules and UI in `components/jornada-do-despertar/*`. Persist leads only through the server route `POST /api/quiz-jornada/leads`, which validates payloads, recalculates scores, writes to Supabase, and optionally notifies the CRM webhook.

**Tech Stack:** Next.js, TypeScript, React, Supabase JS server client, Vitest, Testing Library, CSS Modules or global CSS with plain CSS variables.

---

## Pre-Implementation State

Git has already been initialized.

Current branch for implementation:

```bash
feature/jornada-do-despertar
```

Initial documentation commit:

```bash
c0b5db0 docs: add jornada do despertar design spec
```

Do not start application code until this plan is reviewed.

## Review Package

These are the exact items to review before implementation.

### Final SQL Schema

```sql
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
```

No public read policy will be created. Inserts are made from the server route with `SUPABASE_SERVICE_ROLE_KEY`.

### Exact Lead Payload

```ts
type JourneyArea = "CD" | "VP" | "FL" | "SR" | "IP";

type JourneyAnswerPayload = {
  questionId: string;
  optionId: string;
};

type JourneyLeadPayload = {
  submissionId: string;
  name: string;
  whatsapp: string;
  email: string;
  answers: JourneyAnswerPayload[];
  consentAccepted: boolean;
  consentVersion: "jornada-do-despertar-v1";
  privacyPolicyUrl: string;
  landingUrl: string;
  referrer: string;
  utm: {
    source: string;
    medium: string;
    campaign: string;
    term: string;
    content: string;
  };
  origin: string;
  campaign: string;
  honeypot: string;
};

type JourneyLeadResponse = {
  ok: true;
  duplicate: boolean;
  leadId: string;
  result: {
    key: JourneyArea;
    label: string;
    scores: Record<JourneyArea, number>;
  };
};
```

The API recalculates `result` from `answers`. The frontend result is never trusted as the source of truth for persistence.

### Scoring Function Contract

```ts
type ScoreMap = Record<"CD" | "VP" | "FL" | "SR" | "IP", number>;

type ScoringResult = {
  resultKey: "CD" | "VP" | "FL" | "SR" | "IP";
  resultLabel: string;
  scores: ScoreMap;
};

function scoreJourneyQuiz(
  answers: Array<{ questionId: string; optionId: string }>
): ScoringResult;
```

Rules:

- Throw a validation error if the payload does not contain exactly one answer for each of the 10 questions.
- Sum points from the option matrix.
- Resolve ties by key questions first:
  - `IP`: questions 8, 9, 10.
  - `FL`: questions 4, 6, 9.
  - `VP`: questions 3, 5, 6, 7.
  - `SR`: questions 2, 3, 6, 9.
- Resolve remaining ties by priority: `IP`, `FL`, `VP`, `SR`, `CD`.

### Test Structure

```txt
lib/jornada-do-despertar/__tests__/
  scoring.test.ts
  validation.test.ts
  whatsapp.test.ts
  lead-payload.test.ts
app/api/quiz-jornada/leads/__tests__/
  route.test.ts
```

Core tests:

- Scores add points from selected options.
- Rejects missing/duplicate question answers.
- Applies `IP`, `FL`, `VP`, `SR` key-question tie breakers.
- Applies final priority tie breaker.
- Normalizes Brazilian WhatsApp numbers.
- Rejects invalid name, WhatsApp, email, missing consent, filled honeypot.
- Builds WhatsApp URLs with encoded messages.
- API returns success for first insert.
- API treats duplicate `submission_id` as safe success.
- API does not call CRM webhook before Supabase insert succeeds.

### Mobile Wireframe

```txt
┌─────────────────────────────┐
│ Jornada do Despertar     42%│
│ ────────────────░░░░░░░░░░░ │
│                             │
│ [small eyebrow]             │
│ Pergunta 4 de 10            │
│                             │
│ Quando alguém precisa de... │
│                             │
│ ┌─────────────────────────┐ │
│ │ Eu ajudo, mesmo sabendo │ │
│ │ que vou me sobrecarregar│ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Eu digo sim rápido...   │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Eu sinto culpa...       │ │
│ └─────────────────────────┘ │
│                             │
│ Voltar        Continuar     │
└─────────────────────────────┘
```

Lead capture screen:

```txt
┌─────────────────────────────┐
│ Sua Jornada já acendeu...   │
│ Para gerar sua leitura...   │
│                             │
│ Nome                        │
│ [_________________________] │
│ WhatsApp                    │
│ [_________________________] │
│ E-mail                      │
│ [_________________________] │
│ [ ] Ao continuar, você...   │
│                             │
│ [ Ver minha leitura inicial]│
│                             │
│ texto pequeno de não        │
│ diagnóstico                 │
└─────────────────────────────┘
```

Result screen appears only after API success.

### Error And Retry Behavior

- While submitting, disable the submit button and show loading text.
- If validation fails, show field-level errors.
- If Supabase insert fails, show: `Não foi possível salvar suas informações agora. Revise os dados e tente novamente.`
- If duplicate `submission_id` exists, return the existing result and continue.
- If CRM webhook succeeds after insert, update the saved lead with `crm_webhook_status = 'success'`.
- If CRM webhook fails after insert, update the saved lead with `crm_webhook_status = 'failed'` and `crm_webhook_error`, return success to the user, and show result.
- If tracking scripts are missing, ignore silently.

---

## File Structure

Create or modify:

- Create: `package.json` - scripts and dependencies.
- Create: `tsconfig.json` - strict TypeScript configuration.
- Create: `next.config.mjs` - Next.js config.
- Create: `vitest.config.ts` - unit test config.
- Create: `app/layout.tsx` - root layout and metadata defaults.
- Create: `app/globals.css` - design tokens and base styles.
- Create: `app/jornada-do-despertar/page.tsx` - route metadata and page entry.
- Create: `app/api/quiz-jornada/leads/route.ts` - lead capture API.
- Create: `components/jornada-do-despertar/*` - quiz UI.
- Create: `lib/jornada-do-despertar/*` - quiz data, scoring, validation, payload, tracking, WhatsApp.
- Create: `lib/supabase/server.ts` - Supabase server client.
- Create: `supabase/migrations/20260702000000_create_quiz_jornada_leads.sql` - schema.
- Create: tests listed in the Test Structure section.
- Modify: `docs/superpowers/specs/2026-07-02-jornada-do-despertar-design.md` only if review changes are requested.

## Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `app/layout.tsx`
- Create: `app/globals.css`

- [ ] **Step 1: Create project config**

Use `apply_patch` to add:

```json
{
  "name": "juliana-psicanalista",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run --passWithNoTests",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.50.0",
    "next": "^15.3.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.25.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.0",
    "@types/node": "^22.15.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "jsdom": "^26.1.0",
    "typescript": "^5.8.0",
    "vitest": "^3.2.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:

```bash
npm install
```

Expected: lockfile created and dependencies installed.

- [ ] **Step 3: Add base app files**

Create root layout with default metadata, global CSS variables for off-white, wine, terracotta, gold, and dark text.

- [ ] **Step 4: Verify scaffold**

Run:

```bash
npm run typecheck
npm test
```

Expected: typecheck passes; test command passes before test files exist because Vitest is configured with `--passWithNoTests`.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.mjs vitest.config.ts .gitignore app
git commit -m "chore: scaffold next app for jornada quiz"
```

## Task 2: Add Quiz Data And Scoring With TDD

**Files:**
- Create: `lib/jornada-do-despertar/quiz-data.ts`
- Create: `lib/jornada-do-despertar/scoring.ts`
- Test: `lib/jornada-do-despertar/__tests__/scoring.test.ts`

- [ ] **Step 1: Write failing scoring tests**

Create tests for score summing, missing answer rejection, duplicate answer rejection, each key-question tie breaker, and final priority tie breaker.

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
npm test -- lib/jornada-do-despertar/__tests__/scoring.test.ts
```

Expected: tests fail because `scoreJourneyQuiz` and quiz data do not exist.

- [ ] **Step 3: Implement quiz data**

Add all opening screens, transition screens, 10 questions, option labels, and scoring matrix from the request.

- [ ] **Step 4: Implement scoring**

Implement `scoreJourneyQuiz(answers)` exactly per the contract in this plan.

- [ ] **Step 5: Run tests to verify GREEN**

Run:

```bash
npm test -- lib/jornada-do-despertar/__tests__/scoring.test.ts
```

Expected: all scoring tests pass.

- [ ] **Step 6: Commit**

```bash
git add lib/jornada-do-despertar/quiz-data.ts lib/jornada-do-despertar/scoring.ts lib/jornada-do-despertar/__tests__/scoring.test.ts
git commit -m "feat: add jornada quiz scoring"
```

## Task 3: Add Validation, Payload, And WhatsApp Utilities With TDD

**Files:**
- Create: `lib/jornada-do-despertar/validation.ts`
- Create: `lib/jornada-do-despertar/lead-payload.ts`
- Create: `lib/jornada-do-despertar/whatsapp.ts`
- Test: `lib/jornada-do-despertar/__tests__/validation.test.ts`
- Test: `lib/jornada-do-despertar/__tests__/lead-payload.test.ts`
- Test: `lib/jornada-do-despertar/__tests__/whatsapp.test.ts`

- [ ] **Step 1: Write failing utility tests**

Cover WhatsApp normalization, email/name validation, consent required, honeypot rejection, payload shape, UTM extraction, `landing_url`, `referrer`, and WhatsApp URL encoding.

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
npm test -- lib/jornada-do-despertar/__tests__/validation.test.ts lib/jornada-do-despertar/__tests__/lead-payload.test.ts lib/jornada-do-despertar/__tests__/whatsapp.test.ts
```

Expected: tests fail because utilities do not exist.

- [ ] **Step 3: Implement utilities**

Implement validation with Zod or small typed validators. Implement `normalizeBrazilianWhatsApp`, `buildJourneyLeadPayload`, and `buildWhatsAppUrl`.

- [ ] **Step 4: Run tests to verify GREEN**

Run:

```bash
npm test -- lib/jornada-do-despertar/__tests__/validation.test.ts lib/jornada-do-despertar/__tests__/lead-payload.test.ts lib/jornada-do-despertar/__tests__/whatsapp.test.ts
```

Expected: all utility tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/jornada-do-despertar
git commit -m "feat: add jornada lead validation utilities"
```

## Task 4: Add Supabase Migration And Server Client

**Files:**
- Create: `supabase/migrations/20260702000000_create_quiz_jornada_leads.sql`
- Create: `lib/supabase/server.ts`

- [ ] **Step 1: Add migration SQL**

Use the final SQL schema from this plan.

- [ ] **Step 2: Add Supabase server client**

Create a helper that reads:

```txt
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Throw a clear server-side error when missing.

- [ ] **Step 3: Verify static checks**

Run:

```bash
npm run typecheck
```

Expected: typecheck passes.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260702000000_create_quiz_jornada_leads.sql lib/supabase/server.ts
git commit -m "feat: add jornada lead database schema"
```

## Task 5: Add Lead Capture API With TDD

**Files:**
- Create: `app/api/quiz-jornada/leads/route.ts`
- Test: `app/api/quiz-jornada/leads/__tests__/route.test.ts`

- [ ] **Step 1: Write failing API tests**

Mock only the Supabase client boundary and CRM webhook boundary. Tests must cover valid insert, duplicate `submission_id`, validation failure, honeypot rejection, missing consent, and CRM webhook failure after insert.

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
npm test -- app/api/quiz-jornada/leads/__tests__/route.test.ts
```

Expected: tests fail because the route does not exist.

- [ ] **Step 3: Implement API route**

Route behavior:

1. Parse JSON.
2. Validate payload.
3. Reject honeypot.
4. Normalize WhatsApp.
5. Recalculate score from answers.
6. Insert into Supabase.
7. On duplicate `submission_id`, fetch existing lead and return `duplicate: true`.
8. Notify `CRM_WEBHOOK_URL` only after insert success, when configured.
9. If webhook succeeds, update that saved lead with `crm_webhook_status = 'success'`.
10. If webhook fails, update that saved lead with `crm_webhook_status = 'failed'` and `crm_webhook_error`.
11. Return result to frontend even when webhook update fails.

- [ ] **Step 4: Run tests to verify GREEN**

Run:

```bash
npm test -- app/api/quiz-jornada/leads/__tests__/route.test.ts
```

Expected: all API tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/api/quiz-jornada/leads lib/jornada-do-despertar lib/supabase
git commit -m "feat: add jornada lead capture api"
```

## Task 6: Build Mobile-First Quiz UI

**Files:**
- Create: `app/jornada-do-despertar/page.tsx`
- Create: `components/jornada-do-despertar/quiz-shell.tsx`
- Create: `components/jornada-do-despertar/quiz-step.tsx`
- Create: `components/jornada-do-despertar/progress-bar.tsx`
- Create: `components/jornada-do-despertar/lead-form.tsx`
- Create: `components/jornada-do-despertar/result-view.tsx`
- Create: `lib/jornada-do-despertar/results.ts`
- Create: `lib/jornada-do-despertar/tracking.ts`

- [ ] **Step 1: Add route metadata**

Set:

```txt
title: Jornada do Despertar | Juliana Piantella
description: Um caminho breve para perceber padroes que talvez estejam influenciando sua clareza, constancia e direcao.
```

- [ ] **Step 2: Build quiz shell**

Implement state machine for intro screens, questions, transitions, lead form, loading, and result.

- [ ] **Step 3: Add sessionStorage persistence**

Persist `submission_id`, current step, answers, and lead draft. Restore on reload.

- [ ] **Step 4: Add lead form**

Include fields, labels, consent checkbox, invisible honeypot, disabled loading state, and field-level errors.

- [ ] **Step 5: Add result view**

Render result only from API response. Add CTA buttons with tracking and WhatsApp URLs.

- [ ] **Step 6: Add tracking**

Fire required events through `trackQuizEvent`, without throwing when pixels are absent.

- [ ] **Step 7: Verify typecheck**

Run:

```bash
npm run typecheck
```

Expected: typecheck passes.

- [ ] **Step 8: Commit**

```bash
git add app components lib/jornada-do-despertar
git commit -m "feat: build jornada quiz experience"
```

## Task 7: Visual And Accessibility Pass

**Files:**
- Modify: `app/globals.css`
- Modify: `components/jornada-do-despertar/*`
- Modify: `app/jornada-do-despertar/page.tsx`

- [ ] **Step 1: Run dev server**

Run:

```bash
npm run dev
```

Expected: local server starts.

- [ ] **Step 2: Validate mobile**

Open `/jornada-do-despertar` and check small mobile width:

- one question per screen;
- large touch targets;
- no text clipping;
- progress visible;
- back button preserves answers;
- result appears only after `POST /api/quiz-jornada/leads` returns `ok: true`.

- [ ] **Step 3: Validate desktop**

Check medium desktop width:

- content remains centered;
- no oversized hero copy;
- no generic form look;
- warm brand direction remains intact.

- [ ] **Step 4: Validate accessibility**

Check:

- keyboard navigation;
- visible focus states;
- labels for all fields;
- error messages visible and connected to fields;
- adequate contrast.

- [ ] **Step 5: Commit**

```bash
git add app components
git commit -m "style: polish jornada quiz responsive ux"
```

## Task 8: Final Verification

**Files:**
- No planned edits unless verification finds issues.

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: no type errors.

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: production build passes.

- [ ] **Step 4: Check git diff**

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; only intended changes pending if not yet committed.

- [ ] **Step 5: Commit verification fixes if verification required edits**

If verification required edits, inspect the changed files and stage only the files touched by those fixes:

```bash
git status --short
git add app components lib supabase package.json package-lock.json tsconfig.json next.config.mjs vitest.config.ts
git commit -m "fix: complete jornada quiz verification"
```

If `git status --short` shows no changes after verification, skip this commit step.

## Open Review Items Before Implementation

- Confirm final SQL schema and status values.
- Confirm exact payload shape.
- Confirm scoring function contract and tie-break priority.
- Confirm test structure.
- Confirm mobile wireframe direction.
- Confirm error/retry behavior.
- Provide the production WhatsApp number for `NEXT_PUBLIC_JULIANA_WHATSAPP_NUMBER`.
- Provide Supabase project URL and server key only through environment variables, not in chat or committed files.
- Provide privacy policy URL if already available.
