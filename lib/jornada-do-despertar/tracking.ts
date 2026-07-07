type TrackingPayload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: TrackingPayload[];
    gtag?: (command: "event", eventName: string, payload?: TrackingPayload) => void;
    fbq?: (
      command: "trackCustom" | "track",
      eventName: string,
      payload?: TrackingPayload
    ) => void;
  }
}

// Meta optimizes ad delivery on standard events, so key funnel moments also
// fire their standard equivalent alongside the custom event.
const META_STANDARD_EVENTS: Record<string, string> = {
  lead_captured: "Lead"
};

export function trackQuizEvent(eventName: string, payload: TrackingPayload = {}) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.dataLayer?.push({ event: eventName, ...payload });
    window.gtag?.("event", eventName, payload);
    window.fbq?.("trackCustom", eventName, payload);

    const standardEvent = META_STANDARD_EVENTS[eventName];

    if (standardEvent) {
      window.fbq?.("track", standardEvent, payload);
    }
  } catch {
    // Tracking must never break the quiz flow.
  }
}
