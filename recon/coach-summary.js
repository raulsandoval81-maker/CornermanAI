export function buildCoachSummary(match = {}, analysis = {}) {
  const patterns =
    analysis.patterns || [];

  if (!patterns.length) {
    return {
      title: "Coach Summary",
      summary:
        "Match data is limited. Review the timeline and video evidence.",
      keyPoints: []
    };
  }

  const keyPoints =
    patterns.map(getPatternSummary);

  return {
    title: "Coach Summary",

    summary:
      keyPoints.join(" "),

    keyPoints
  };
}

function getPatternSummary(pattern) {
  const summaries = {
    "neutral-defense":
      "Neutral defense needs attention.",

    "neutral-offense":
      "Athlete is creating offense from neutral.",

    "strong-bottom":
      "Bottom wrestling showed positive movement.",

    "reversal-threat":
      "Athlete created reversal scoring threats.",

    "top-pressure":
      "Top pressure created control and scoring chances.",

    "back-exposure-risk":
      "Back exposure is a risk area.",

    "scores-first":
      "Athlete scored first and established early momentum.",

    "gives-up-first-score":
      "Athlete gave up the first score and needs stronger opening defense."
  };

  return summaries[pattern] ||
    String(pattern).replaceAll("-", " ");
}