import { detectPatterns } from "./pattern-detector.js";
import { buildCoachSummary } from "./coach-summary.js";
import { buildAthleteFeedback } from "./athlete-feedback.js";
import { buildPracticeFocus } from "./practice-focus.js";

export function runRecon(matchPayload) {

  const patterns =
    detectPatterns(matchPayload);

  return {
    coach:
      buildCoachSummary(patterns),

    athlete:
      buildAthleteFeedback(patterns),

    practice:
      buildPracticeFocus(patterns)
  };
}