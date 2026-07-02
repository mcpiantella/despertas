import { afterEach, describe, expect, it, vi } from "vitest";
import { createSubmissionId } from "../submission-id";

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("createSubmissionId", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses crypto.randomUUID when available", () => {
    vi.stubGlobal("crypto", {
      randomUUID: () => "6f99f74b-6cef-4d79-bdc8-b4e18ed75db1"
    });

    expect(createSubmissionId()).toBe("6f99f74b-6cef-4d79-bdc8-b4e18ed75db1");
  });

  it("generates a valid UUID v4 when crypto.randomUUID is unavailable", () => {
    vi.stubGlobal("crypto", {});

    expect(createSubmissionId()).toMatch(UUID_V4_PATTERN);
  });

  it("generates a valid UUID v4 when crypto is undefined", () => {
    vi.stubGlobal("crypto", undefined);

    expect(createSubmissionId()).toMatch(UUID_V4_PATTERN);
  });

  it("generates unique ids across calls without crypto.randomUUID", () => {
    vi.stubGlobal("crypto", {});

    const ids = new Set(Array.from({ length: 50 }, () => createSubmissionId()));

    expect(ids.size).toBe(50);
  });
});
