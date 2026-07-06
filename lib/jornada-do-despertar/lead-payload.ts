import type { JourneyAnswer } from "./scoring";
import { CONSENT_VERSION, type JourneyLeadPayload } from "./validation";

type BuildJourneyLeadPayloadInput = {
  submissionId: string;
  name: string;
  whatsapp: string;
  email: string;
  answers: JourneyAnswer[];
  consentAccepted: boolean;
  privacyPolicyUrl: string;
  landingUrl: string;
  referrer: string;
  honeypot: string;
};

export function buildJourneyLeadPayload(
  input: BuildJourneyLeadPayloadInput
): JourneyLeadPayload {
  const url = parseUrl(input.landingUrl);

  return {
    submissionId: input.submissionId,
    name: input.name,
    whatsapp: input.whatsapp,
    email: input.email,
    answers: input.answers,
    consentAccepted: input.consentAccepted,
    consentVersion: CONSENT_VERSION,
    privacyPolicyUrl: input.privacyPolicyUrl,
    landingUrl: input.landingUrl,
    referrer: input.referrer,
    utm: {
      source: getParam(url, "utm_source"),
      medium: getParam(url, "utm_medium"),
      campaign: getParam(url, "utm_campaign"),
      term: getParam(url, "utm_term"),
      content: getParam(url, "utm_content")
    },
    origin: getParam(url, "origin"),
    campaign: getParam(url, "campaign"),
    honeypot: input.honeypot
  };
}

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function getParam(url: URL | null, key: string): string {
  return url?.searchParams.get(key) ?? "";
}
