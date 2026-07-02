import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QuizShell } from "../quiz-shell";

const STORAGE_KEY = "jornada-do-despertar-progress";
const SAVED_SUBMISSION_ID = "6f99f74b-6cef-4d79-bdc8-b4e18ed75db1";

const fullAnswers = Object.fromEntries(
  Array.from({ length: 10 }, (_, index) => [`q${index + 1}`, "a"])
);

function renderShell() {
  return render(
    <QuizShell
      privacyPolicyUrl="https://example.com/privacidade"
      whatsappNumber="5511999999999"
    />
  );
}

function seedSavedState(state: Record<string, unknown>) {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

describe("QuizShell", () => {
  beforeEach(() => {
    vi.stubGlobal("crypto", {
      randomUUID: () => SAVED_SUBMISSION_ID
    });
  });

  afterEach(() => {
    window.sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it("renders the opening step", () => {
    renderShell();

    expect(screen.getByRole("heading", { name: "Jornada do Despertar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Começar minha Jornada" })).toBeInTheDocument();
  });

  it("restores to the lead step when saved progress points at the loading step", () => {
    seedSavedState({
      stepIndex: 17,
      answers: fullAnswers,
      submissionId: SAVED_SUBMISSION_ID
    });

    renderShell();

    expect(
      screen.getByRole("heading", { name: "Sua Jornada já acendeu algumas luzes." })
    ).toBeInTheDocument();
  });

  it("restores to the lead step when saved progress points past the flow end", () => {
    seedSavedState({
      stepIndex: 999,
      answers: fullAnswers,
      submissionId: SAVED_SUBMISSION_ID
    });

    renderShell();

    expect(
      screen.getByRole("heading", { name: "Sua Jornada já acendeu algumas luzes." })
    ).toBeInTheDocument();
  });

  it("starts fresh when saved progress has an invalid shape", () => {
    seedSavedState({
      stepIndex: "not-a-number",
      answers: "not-an-object",
      submissionId: 42
    });

    renderShell();

    expect(screen.getByRole("heading", { name: "Jornada do Despertar" })).toBeInTheDocument();
  });

  it("starts fresh when saved progress is not valid JSON", () => {
    window.sessionStorage.setItem(STORAGE_KEY, "{corrupted");

    renderShell();

    expect(screen.getByRole("heading", { name: "Jornada do Despertar" })).toBeInTheDocument();
  });

  it("drops answer keys that do not match quiz questions when restoring", () => {
    seedSavedState({
      stepIndex: 2,
      answers: { q1: "a", injected: "x".repeat(5000) },
      submissionId: SAVED_SUBMISSION_ID
    });

    renderShell();

    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "{}");

    expect(saved.answers).toEqual({ q1: "a" });
  });

  it("keeps rendering when session storage writes fail", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    renderShell();

    expect(screen.getByRole("heading", { name: "Jornada do Despertar" })).toBeInTheDocument();

    vi.restoreAllMocks();
  });

  it("captures the landing url at quiz start and persists it with the progress", () => {
    renderShell();

    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "{}");

    expect(saved.landingUrl).toBe(window.location.href);
  });

  it("keeps the original landing url when restoring saved progress", () => {
    seedSavedState({
      stepIndex: 2,
      answers: {},
      submissionId: SAVED_SUBMISSION_ID,
      landingUrl: "https://juliana.example/jornada-do-despertar?utm_source=instagram",
      referrer: "https://instagram.com/"
    });

    renderShell();

    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "{}");

    expect(saved.landingUrl).toBe(
      "https://juliana.example/jornada-do-despertar?utm_source=instagram"
    );
    expect(saved.referrer).toBe("https://instagram.com/");
  });
});
