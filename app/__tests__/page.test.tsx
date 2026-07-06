import { describe, expect, it } from "vitest";
import RootPage from "../page";

describe("RootPage", () => {
  it("redirects the root route to the quiz", () => {
    let caught: unknown;

    try {
      RootPage();
    } catch (error) {
      caught = error;
    }

    expect(caught).toMatchObject({
      digest: expect.stringContaining("/jornada-do-despertar")
    });
  });
});
