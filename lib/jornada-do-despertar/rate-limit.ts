type RateLimiterOptions = {
  limit: number;
  windowMs: number;
};

export type RateLimiter = {
  check(key: string, now?: number): boolean;
};

// In-memory sliding window. State lives per server instance, which is enough
// for basic abuse protection on the MVP; a shared store (e.g. Upstash) can
// replace this without changing the call site.
export function createRateLimiter(options: RateLimiterOptions): RateLimiter {
  const hitsByKey = new Map<string, number[]>();

  return {
    check(key: string, now: number = Date.now()): boolean {
      const windowStart = now - options.windowMs;
      const recentHits = (hitsByKey.get(key) ?? []).filter(
        (timestamp) => timestamp > windowStart
      );

      if (recentHits.length >= options.limit) {
        hitsByKey.set(key, recentHits);
        return false;
      }

      hitsByKey.set(key, [...recentHits, now]);
      return true;
    }
  };
}
