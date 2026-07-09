import {
  buildAthleteFeedbackPayload
} from "../recon/athlete-feedback.js";

import {
  mapPatternsToCards
} from "./card-mapper.js";

export function exportToSandman({

  match = {},
  intelligence = {}

}) {

  const patterns =
    intelligence.patterns || [];

  const feedback =
    intelligence.athleteFeedback || {};

  const payload =
    buildAthleteFeedbackPayload({

      match,

      feedback

    });

  return {

    ...payload,

    source:
      "cornerman-ai",

    exportType:
      "sandman-training-payload",

    athlete:
      match.athlete || "",

    opponent:
      match.opponent || "",

    event:
      match.eventName || "",

    result:
      match.result || "",

    patterns,

    recommendations:
      intelligence.recommendations || [],

    practiceFocus:
      intelligence.practiceFocus || {},

    cards:
      mapPatternsToCards(patterns),

    exportedAt:
      new Date().toISOString()

  };

}