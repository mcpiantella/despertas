import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { trackQuizEvent } from "../tracking";

describe("trackQuizEvent", () => {
  beforeEach(() => {
    window.dataLayer = [];
    window.gtag = vi.fn();
    window.fbq = vi.fn();
  });

  afterEach(() => {
    delete window.dataLayer;
    delete window.gtag;
    delete window.fbq;
  });

  it("fires the event on dataLayer, gtag and fbq", () => {
    trackQuizEvent("quiz_started", { foo: "bar" });

    expect(window.dataLayer).toEqual([{ event: "quiz_started", foo: "bar" }]);
    expect(window.gtag).toHaveBeenCalledWith("event", "quiz_started", { foo: "bar" });
    expect(window.fbq).toHaveBeenCalledWith("trackCustom", "quiz_started", { foo: "bar" });
  });

  it("also fires the standard Meta Lead event when a lead is captured", () => {
    trackQuizEvent("lead_captured", { result_key: "CD" });

    expect(window.fbq).toHaveBeenCalledWith("trackCustom", "lead_captured", {
      result_key: "CD"
    });
    expect(window.fbq).toHaveBeenCalledWith("track", "Lead", { result_key: "CD" });
  });

  it("does not throw when no tracking scripts are loaded", () => {
    delete window.dataLayer;
    delete window.gtag;
    delete window.fbq;

    expect(() => trackQuizEvent("quiz_started")).not.toThrow();
  });
});
