import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PoliticaDePrivacidadePage from "../politica-de-privacidade/page";

describe("PoliticaDePrivacidadePage", () => {
  it("renders the privacy policy with the essential LGPD sections", () => {
    render(<PoliticaDePrivacidadePage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Política de Privacidade" })
    ).toBeInTheDocument();
    expect(screen.getByText(/Juliana Piantella/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Quais dados coletamos/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Seus direitos/i })).toBeInTheDocument();
  });
});
