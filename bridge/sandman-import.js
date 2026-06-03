import {
  buildAthleteFeedbackPayload
} from "../recon/athlete-feedback.js";

import {
  mapPatternsToCards
} from "./card-mapper.js";

export function exportToSandman({
  athlete,
  latestMatch,
  patterns = []
}) {
  const payload =
    buildAthleteFeedbackPayload({
      athlete,
      latestMatch,
      patterns
    });

  return {
    ...payload,

    source:
      "cornerman-ai",

    exportType:
      "sandman-training-payload",

    cards:
      mapPatternsToCards(patterns),

    exportedAt:
      new Date().toISOString()
  };
}