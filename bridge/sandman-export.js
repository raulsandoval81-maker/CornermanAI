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

  payload.cards =
    mapPatternsToCards(patterns);

  return payload;
}