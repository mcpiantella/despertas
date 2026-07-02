import { describe, expect, it } from "vitest";
import { buildJourneyLeadPayload } from "../lead-payload";
import { CONSENT_VERSION } from "../validation";

describe("buildJourneyLeadPayload", () => {
  it("builds the API payload with UTMs, origin, campaign, landing URL, and referrer", () => {
    const payload = buildJourneyLeadPayload({
      submissionId: "6f99f74b-6cef-4d79-bdc8-b4e18ed75db1",
      name: "Maria Silva",
      whatsapp: "(11) 91234-5678",
      email: "maria@example.com",
      answers: [{ questionId: "q1", optionId: "a" }],
      consentAccepted: true,
      privacyPolicyUrl: "https://example.com/privacidade",
      landingUrl:
        "https://juliana.example/jornada-do-despertar?utm_source=instagram&utm_medium=cpc&utm_campaign=despertar&utm_term=quiz&utm_content=story&origin=bio&campaign=lançamento",
      referrer: "https://instagram.com/",
      honeypot: ""
    });

    expect(payload).toEqual({
      submissionId: "6f99f74b-6cef-4d79-bdc8-b4e18ed75db1",
      name: "Maria Silva",
      whatsapp: "(11) 91234-5678",
      email: "maria@example.com",
      answers: [{ questionId: "q1", optionId: "a" }],
      consentAccepted: true,
      consentVersion: CONSENT_VERSION,
      privacyPolicyUrl: "https://example.com/privacidade",
      landingUrl:
        "https://juliana.example/jornada-do-despertar?utm_source=instagram&utm_medium=cpc&utm_campaign=despertar&utm_term=quiz&utm_content=story&origin=bio&campaign=lançamento",
      referrer: "https://instagram.com/",
      utm: {
        source: "instagram",
        medium: "cpc",
        campaign: "despertar",
        term: "quiz",
        content: "story"
      },
      origin: "bio",
      campaign: "lançamento",
      honeypot: ""
    });
  });
});
