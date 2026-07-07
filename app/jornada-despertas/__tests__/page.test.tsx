import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import JornadaDespertasPage from "../page";

describe("JornadaDespertasPage", () => {
  it("renders the quiz shell opening step", () => {
    vi.stubGlobal("crypto", {
      randomUUID: () => "6f99f74b-6cef-4d79-bdc8-b4e18ed75db1"
    });

    render(<JornadaDespertasPage />);

    expect(screen.getByRole("heading", { name: "Jornada Despertas" })).toBeInTheDocument();

    vi.unstubAllGlobals();
  });
});
