import { describe, expect, it } from "vitest";
import { createRateLimiter } from "../rate-limit";

describe("createRateLimiter", () => {
  it("allows requests up to the limit inside the window", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 });

    expect(limiter.check("ip-1", 1_000)).toBe(true);
    expect(limiter.check("ip-1", 2_000)).toBe(true);
    expect(limiter.check("ip-1", 3_000)).toBe(true);
  });

  it("blocks requests beyond the limit inside the window", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 });

    limiter.check("ip-1", 1_000);
    limiter.check("ip-1", 2_000);
    limiter.check("ip-1", 3_000);

    expect(limiter.check("ip-1", 4_000)).toBe(false);
  });

  it("allows requests again after the window slides past old hits", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 60_000 });

    limiter.check("ip-1", 1_000);
    limiter.check("ip-1", 2_000);

    expect(limiter.check("ip-1", 3_000)).toBe(false);
    expect(limiter.check("ip-1", 61_001)).toBe(true);
  });

  it("tracks each key independently", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });

    expect(limiter.check("ip-1", 1_000)).toBe(true);
    expect(limiter.check("ip-2", 1_000)).toBe(true);
    expect(limiter.check("ip-1", 2_000)).toBe(false);
  });

  it("sweeps stale keys so the map cannot grow without bound", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, maxKeys: 2 });

    limiter.check("ip-1", 1_000);
    limiter.check("ip-2", 2_000);

    expect(limiter.size()).toBe(2);

    limiter.check("ip-3", 70_000);

    expect(limiter.size()).toBe(1);
    expect(limiter.check("ip-3", 71_000)).toBe(false);
  });
});
