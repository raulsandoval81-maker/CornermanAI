import {
  detectPatterns
} from "./pattern-detector.js";

import {
  buildCoachSummary
} from "./coach-summary.js";

import {
  buildAthleteFeedback
} from "./athlete-feedback.js";

import {
  buildRecommendations
} from "./recommendation-engine.js";

import {
  buildPracticeFocus
} from "./practice-focus.js";

export function runRecon(match = {}) {

  const patterns =
    detectPatterns(match);

  const analysis = {
    patterns
  };

  const coach =
    buildCoachSummary(match, analysis);

  const athlete =
    buildAthleteFeedback(match, analysis);

  const recommendations =
    buildRecommendations(match, analysis);

  const practice =
    buildPracticeFocus(match, analysis);

  return {
    generatedAt:
      new Date().toISOString(),

    patterns,
    analysis,

    coach,
    athlete,
    recommendations,
    practice
  };
}