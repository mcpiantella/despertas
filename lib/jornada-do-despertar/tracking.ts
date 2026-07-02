type TrackingPayload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: TrackingPayload[];
    gtag?: (command: "event", eventName: string, payload?: TrackingPayload) => void;
    fbq?: (command: "trackCustom", eventName: string, payload?: TrackingPayload) => void;
  }
}

export function trackQuizEvent(eventName: string, payload: TrackingPayload = {}) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.dataLayer?.push({ event: eventName, ...payload });
    window.gtag?.("event", eventName, payload);
    window.fbq?.("trackCustom", eventName, payload);
  } catch {
    // Tracking must never break the quiz flow.
  }
}
