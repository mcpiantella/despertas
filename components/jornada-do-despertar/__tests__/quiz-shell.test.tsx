import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizShell } from "../quiz-shell";

describe("QuizShell", () => {
  it("renders the opening step", () => {
    vi.stubGlobal("crypto", {
      randomUUID: () => "6f99f74b-6cef-4d79-bdc8-b4e18ed75db1"
    });

    render(
      <QuizShell
        privacyPolicyUrl="https://example.com/privacidade"
        whatsappNumber="5511999999999"
      />
    );

    expect(screen.getByRole("heading", { name: "Jornada do Despertar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Começar minha Jornada" })).toBeInTheDocument();
  });
});
