type RateLimiterOptions = {
  limit: number;
  windowMs: number;
  maxKeys?: number;
};

export type RateLimiter = {
  check(key: string, now?: number): boolean;
  size(): number;
};

const DEFAULT_MAX_KEYS = 10_000;

// In-memory sliding window. State lives per server instance, which is enough
// for basic abuse protection on the MVP; a shared store (e.g. Upstash) can
// replace this without changing the call site.
export function createRateLimiter(options: RateLimiterOptions): RateLimiter {
  const maxKeys = options.maxKeys ?? DEFAULT_MAX_KEYS;
  const hitsByKey = new Map<string, number[]>();

  function sweepStaleKeys(now: number) {
    const windowStart = now - options.windowMs;

    for (const [key, hits] of hitsByKey) {
      const recentHits = hits.filter((timestamp) => timestamp > windowStart);

      if (recentHits.length === 0) {
        hitsByKey.delete(key);
      } else {
        hitsByKey.set(key, recentHits);
      }
    }
  }

  return {
    check(key: string, now: number = Date.now()): boolean {
      if (hitsByKey.size >= maxKeys) {
        sweepStaleKeys(now);
      }

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
    },
    size(): number {
      return hitsByKey.size;
    }
  };
}
