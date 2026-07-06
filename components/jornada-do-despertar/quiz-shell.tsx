"use client";

import { useEffect, useMemo, useState } from "react";
import { buildJourneyLeadPayload } from "@/lib/jornada-do-despertar/lead-payload";
import {
  INTRO_STEPS,
  QUIZ_QUESTIONS,
  TRANSITION_STEPS,
  type JourneyArea,
  type ScoreMap
} from "@/lib/jornada-do-despertar/quiz-data";
import type { JourneyAnswer } from "@/lib/jornada-do-despertar/scoring";
import { createSubmissionId } from "@/lib/jornada-do-despertar/submission-id";
import { trackQuizEvent } from "@/lib/jornada-do-despertar/tracking";
import { validateJourneyLeadPayload } from "@/lib/jornada-do-despertar/validation";
import { LeadForm, type LeadFormData } from "./lead-form";
import { ProgressBar } from "./progress-bar";
import { QuizStep } from "./quiz-step";
import { ResultView } from "./result-view";

type QuizShellProps = {
  privacyPolicyUrl: string;
  whatsappNumber: string;
};

type ApiResult = {
  key: JourneyArea;
  label: string;
  scores: ScoreMap;
};

type FlowStep =
  | { type: "intro"; id: string; index: number }
  | { type: "question"; id: string; questionIndex: number }
  | { type: "transition"; id: "family" | "identity" }
  | { type: "lead"; id: "lead" }
  | { type: "loading"; id: "loading" }
  | { type: "result"; id: "result" };

const STORAGE_KEY = "jornada-do-despertar-progress";
const EMPTY_LEAD_DRAFT: LeadFormData = {
  name: "",
  whatsapp: "",
  email: "",
  consentAccepted: false,
  honeypot: ""
};

const FLOW_STEPS: FlowStep[] = [
  ...INTRO_STEPS.map((step, index) => ({ type: "intro" as const, id: step.id, index })),
  { type: "question", id: "q1", questionIndex: 0 },
  { type: "question", id: "q2", questionIndex: 1 },
  { type: "question", id: "q3", questionIndex: 2 },
  { type: "question", id: "q4", questionIndex: 3 },
  { type: "question", id: "q5", questionIndex: 4 },
  { type: "transition", id: "family" },
  { type: "question", id: "q6", questionIndex: 5 },
  { type: "question", id: "q7", questionIndex: 6 },
  { type: "transition", id: "identity" },
  { type: "question", id: "q8", questionIndex: 7 },
  { type: "question", id: "q9", questionIndex: 8 },
  { type: "question", id: "q10", questionIndex: 9 },
  { type: "lead", id: "lead" },
  { type: "loading", id: "loading" },
  { type: "result", id: "result" }
];

export function QuizShell({ privacyPolicyUrl, whatsappNumber }: QuizShellProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [leadDraft, setLeadDraft] = useState<LeadFormData>(EMPTY_LEAD_DRAFT);
  const [submissionId, setSubmissionId] = useState("");
  const [landingUrl, setLandingUrl] = useState("");
  const [referrer, setReferrer] = useState("");
  const [result, setResult] = useState<ApiResult | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const step = FLOW_STEPS[stepIndex];

  useEffect(() => {
    const saved = readSavedState();
    if (saved) {
      setStepIndex(saved.stepIndex);
      setAnswers(saved.answers);
      setLeadDraft(saved.leadDraft ?? EMPTY_LEAD_DRAFT);
      setSubmissionId(saved.submissionId);
      setLandingUrl(saved.landingUrl || window.location.href);
      setReferrer(saved.referrer ?? document.referrer);
      return;
    }

    setSubmissionId(createSubmissionId());
    setLandingUrl(window.location.href);
    setReferrer(document.referrer);
  }, []);

  useEffect(() => {
    if (!submissionId || typeof window === "undefined") {
      return;
    }

    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ stepIndex, answers, leadDraft, submissionId, landingUrl, referrer })
      );
    } catch {
      // Storage may be full or blocked (e.g. private mode); losing the
      // saved progress must never break the quiz itself.
    }
  }, [answers, landingUrl, leadDraft, referrer, stepIndex, submissionId]);

  const progress = useMemo(() => {
    const answeredCount = Object.keys(answers).length;
    return Math.min(100, (answeredCount / QUIZ_QUESTIONS.length) * 100);
  }, [answers]);

  function goNext() {
    if (stepIndex === 0) {
      trackQuizEvent("quiz_started");
    }
    setStepIndex((current) => Math.min(current + 1, FLOW_STEPS.length - 1));
  }

  function goBack() {
    setSubmitError("");
    setStepIndex((current) => Math.max(current - 1, 0));
  }

  function selectOption(questionId: string, optionId: string) {
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
  }

  function continueQuestion(question: (typeof QUIZ_QUESTIONS)[number]) {
    trackQuizEvent("quiz_question_answered", {
      question_id: question.id,
      option_id: answers[question.id]
    });

    if (question.id === "q10") {
      trackQuizEvent("quiz_completed");
    }

    goNext();
  }

  async function submitLead(formData: LeadFormData) {
    setSubmitError("");
    setIsSubmitting(true);

    const payload = buildJourneyLeadPayload({
      submissionId,
      name: formData.name,
      whatsapp: formData.whatsapp,
      email: formData.email,
      answers: answersToPayload(answers),
      consentAccepted: formData.consentAccepted,
      privacyPolicyUrl,
      landingUrl,
      referrer,
      honeypot: formData.honeypot
    });

    try {
      validateJourneyLeadPayload(payload);
      setStepIndex(FLOW_STEPS.findIndex((item) => item.type === "loading"));

      const response = await fetch("/api/quiz-jornada/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = await response.json();

      if (!response.ok || !body.ok) {
        throw new Error(body.error ?? "Não foi possível salvar suas informações agora.");
      }

      trackQuizEvent("lead_captured", { result_key: body.result.key });
      await wait(3000);
      setResult(body.result);
      trackQuizEvent("result_viewed", { result_key: body.result.key });
      setStepIndex(FLOW_STEPS.findIndex((item) => item.type === "result"));
    } catch (error) {
      setStepIndex(FLOW_STEPS.findIndex((item) => item.type === "lead"));
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar suas informações agora. Revise os dados e tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="jd-page">
      <div className="jd-shell">
        <ProgressBar value={progress} />
        {renderStep()}
      </div>
    </main>
  );

  function renderStep() {
    if (step.type === "intro") {
      const intro = INTRO_STEPS[step.index];
      return (
        <QuizStep
          title={intro.title}
          body={intro.body}
          image={intro.image}
          buttonLabel={intro.buttonLabel}
          onContinue={goNext}
          onBack={stepIndex > 0 ? goBack : undefined}
        />
      );
    }

    if (step.type === "transition") {
      const transition = step.id === "family" ? TRANSITION_STEPS.family : TRANSITION_STEPS.identity;
      return (
        <QuizStep
          title={transition.title}
          body={transition.body}
          buttonLabel={transition.buttonLabel}
          onContinue={goNext}
          onBack={goBack}
        />
      );
    }

    if (step.type === "question") {
      const question = QUIZ_QUESTIONS[step.questionIndex];
      const selectedOptionId = answers[question.id];
      return (
        <QuizStep
          eyebrow={`Pergunta ${question.number} de ${QUIZ_QUESTIONS.length}`}
          title={question.prompt}
          options={question.options}
          selectedOptionId={selectedOptionId}
          onSelectOption={(optionId) => selectOption(question.id, optionId)}
          onContinue={() => continueQuestion(question)}
          onBack={goBack}
          continueDisabled={!selectedOptionId}
        />
      );
    }

    if (step.type === "lead") {
      return (
        <LeadForm
          data={leadDraft}
          error={submitError}
          isSubmitting={isSubmitting}
          privacyPolicyUrl={privacyPolicyUrl}
          onChange={setLeadDraft}
          onBack={goBack}
          onSubmit={submitLead}
        />
      );
    }

    if (step.type === "loading") {
      return (
        <section className="jd-card jd-card--center">
          <p className="jd-eyebrow">Organizando suas respostas</p>
          <h1>Analisando sua Jornada...</h1>
          <p>Suas respostas estão sendo organizadas para gerar uma leitura inicial.</p>
          <p>
            Lembre-se: este não é um diagnóstico. É apenas um primeiro espelho para te
            ajudar a perceber áreas que talvez mereçam mais atenção.
          </p>
        </section>
      );
    }

    if (result) {
      return (
        <ResultView
          result={result}
          whatsappNumber={whatsappNumber}
          onPrimaryClick={() => {
            trackQuizEvent("cta_identificacao_clicked", { result_key: result.key });
            trackQuizEvent("whatsapp_clicked", { cta: "identification", result_key: result.key });
          }}
          onSecondaryClick={() => {
            trackQuizEvent("whatsapp_clicked", { cta: "doubt", result_key: result.key });
          }}
        />
      );
    }

    return null;
  }
}

function answersToPayload(answers: Record<string, string>): JourneyAnswer[] {
  return QUIZ_QUESTIONS.map((question) => ({
    questionId: question.id,
    optionId: answers[question.id] ?? ""
  }));
}

type SavedQuizState = {
  stepIndex: number;
  answers: Record<string, string>;
  leadDraft?: LeadFormData;
  submissionId: string;
  landingUrl?: string;
  referrer?: string;
};

function readSavedState(): SavedQuizState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const saved = window.sessionStorage.getItem(STORAGE_KEY);
    return saved ? sanitizeSavedState(JSON.parse(saved)) : null;
  } catch {
    return null;
  }
}

function sanitizeSavedState(value: unknown): SavedQuizState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (typeof record.stepIndex !== "number" || !Number.isInteger(record.stepIndex)) {
    return null;
  }

  if (typeof record.submissionId !== "string" || record.submissionId.length === 0) {
    return null;
  }

  const answers = sanitizeAnswers(record.answers);

  if (!answers) {
    return null;
  }

  // A saved step is never restored past the lead form: the loading and result
  // steps depend on an in-flight request and in-memory result that no longer exist.
  const leadStepIndex = FLOW_STEPS.findIndex((item) => item.type === "lead");
  const stepIndex = Math.min(Math.max(record.stepIndex, 0), leadStepIndex);

  return {
    stepIndex,
    answers,
    leadDraft: sanitizeLeadDraft(record.leadDraft),
    submissionId: record.submissionId,
    landingUrl: typeof record.landingUrl === "string" ? record.landingUrl : undefined,
    referrer: typeof record.referrer === "string" ? record.referrer : undefined
  };
}

function sanitizeAnswers(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const knownQuestionIds = new Set(QUIZ_QUESTIONS.map((question) => question.id));
  const entries = Object.entries(value as Record<string, unknown>).filter(
    (entry): entry is [string, string] =>
      knownQuestionIds.has(entry[0]) && typeof entry[1] === "string"
  );

  return Object.fromEntries(entries);
}

function sanitizeLeadDraft(value: unknown): LeadFormData | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const record = value as Record<string, unknown>;

  if (
    typeof record.name !== "string" ||
    typeof record.whatsapp !== "string" ||
    typeof record.email !== "string" ||
    typeof record.consentAccepted !== "boolean" ||
    typeof record.honeypot !== "string"
  ) {
    return undefined;
  }

  return {
    name: record.name,
    whatsapp: record.whatsapp,
    email: record.email,
    consentAccepted: record.consentAccepted,
    honeypot: record.honeypot
  };
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
