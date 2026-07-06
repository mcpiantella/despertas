import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LeadForm } from "../lead-form";

const emptyData = {
  name: "",
  whatsapp: "",
  email: "",
  consentAccepted: false,
  honeypot: ""
};

describe("LeadForm", () => {
  it("links the consent text to the provided privacy policy url", () => {
    render(
      <LeadForm
        data={emptyData}
        isSubmitting={false}
        privacyPolicyUrl="https://www.julianapiantella.com.br/politica-de-privacidade"
        onChange={vi.fn()}
        onBack={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const link = screen.getByRole("link", { name: "Política de Privacidade" });

    expect(link).toHaveAttribute(
      "href",
      "https://www.julianapiantella.com.br/politica-de-privacidade"
    );
  });

  it("falls back to the internal privacy policy route when no url is provided", () => {
    render(
      <LeadForm
        data={emptyData}
        isSubmitting={false}
        privacyPolicyUrl=""
        onChange={vi.fn()}
        onBack={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByRole("link", { name: "Política de Privacidade" })).toHaveAttribute(
      "href",
      "/politica-de-privacidade"
    );
  });
});
