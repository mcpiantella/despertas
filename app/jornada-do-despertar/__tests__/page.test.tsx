import { describe, expect, it } from "vitest";
import LegacyJornadaDoDespertarPage from "../page";

describe("LegacyJornadaDoDespertarPage", () => {
  it("redirects the old route to the new jornada-despertas route", () => {
    let caught: unknown;

    try {
      LegacyJornadaDoDespertarPage();
    } catch (error) {
      caught = error;
    }

    expect(caught).toMatchObject({
      digest: expect.stringContaining("/jornada-despertas")
    });
  });
});
