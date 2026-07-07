import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizStep } from "../quiz-step";

describe("QuizStep", () => {
  it("renders the portrait image when the step has one", () => {
    render(
      <QuizStep
        title="Antes, deixa eu me apresentar."
        image={{ src: "/juliana-apresentacao.jpg", alt: "Juliana Piantella" }}
        onContinue={vi.fn()}
      />
    );

    const portrait = screen.getByRole("img", { name: "Juliana Piantella" });

    expect(portrait).toHaveAttribute("src", "/juliana-apresentacao.jpg");
  });

  it("renders no image when the step has none", () => {
    render(<QuizStep title="Jornada Despertas" onContinue={vi.fn()} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
