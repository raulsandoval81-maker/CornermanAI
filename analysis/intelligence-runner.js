import { detectPatterns } from "../recon/pattern-detector.js";
import { analyzeMatch } from "./match-analyzer.js";
import { buildCoachSummary } from "../recon/coach-summary.js";
import { buildAthleteFeedback } from "../recon/athlete-feedback.js";
import { buildRecommendations } from "../recon/recommendation-engine.js";
import { buildPracticeFocus } from "../recon/practice-focus.js";
import { buildReport } from "./report-builder.js";

export function runIntelligence(match) {

  const patterns =
    detectPatterns(match);

  const analysis =
    analyzeMatch(match, patterns);

  const coachSummary =
    buildCoachSummary(match, analysis);

  const athleteFeedback =
    buildAthleteFeedback(match, analysis);

  const recommendations =
    buildRecommendations(match, analysis);

  const practiceFocus =
    buildPracticeFocus(match, analysis);

  const report =
    buildReport({
      match,
      patterns,
      analysis,
      coachSummary,
      athleteFeedback,
      recommendations,
      practiceFocus
    });

  return {
    patterns,
    analysis,
    coachSummary,
    athleteFeedback,
    recommendations,
    practiceFocus,
    report
  };
}