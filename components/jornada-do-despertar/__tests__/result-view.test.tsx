import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ResultView } from "../result-view";

const baseResult = {
  key: "CD" as const,
  label: "Clareza e Direcao",
  scores: { CD: 9, VP: 7, FL: 5, SR: 3, IP: 6 }
};

function renderResultView() {
  return render(
    <ResultView
      result={baseResult}
      whatsappNumber="5511999999999"
      onPrimaryClick={vi.fn()}
      onSecondaryClick={vi.fn()}
    />
  );
}

describe("ResultView", () => {
  it("builds the WhatsApp message with the accented display label", () => {
    renderResultView();

    const primaryLink = screen.getByRole("link", {
      name: "Quero fazer minha Identificação de Travas"
    });

    expect(primaryLink).toHaveAttribute(
      "href",
      expect.stringContaining(encodeURIComponent("Clareza e Direção"))
    );
    expect(primaryLink.getAttribute("href")).not.toContain(
      encodeURIComponent("Clareza e Direcao")
    );
  });

  it("opens WhatsApp links in a new tab without leaking the opener", () => {
    renderResultView();

    const primaryLink = screen.getByRole("link", {
      name: "Quero fazer minha Identificação de Travas"
    });
    const secondaryLink = screen.getByRole("link", { name: "Tenho uma dúvida antes" });

    for (const link of [primaryLink, secondaryLink]) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
});
