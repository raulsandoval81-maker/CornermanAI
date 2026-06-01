import {
  buildAthleteFeedbackPayload
} from "../recon/athlete-feedback.js";

export function exportToSandman({
  athlete,
  latestMatch,
  patterns = []
}) {

  return buildAthleteFeedbackPayload({
    athlete,
    latestMatch,
    patterns
  });
}