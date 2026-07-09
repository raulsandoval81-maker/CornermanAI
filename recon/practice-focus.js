export function buildPracticeFocus(
  match = {},
  analysis = {}
) {
  const patterns =
    analysis.patterns || [];

  const focus = [];

  if (patterns.includes("neutral-defense")) {
    focus.push("Neutral defense");
  }

  if (patterns.includes("neutral-offense")) {
    focus.push("Neutral offense");
  }

  if (patterns.includes("strong-bottom")) {
    focus.push("Bottom wrestling");
  }

  if (patterns.includes("reversal-threat")) {
    focus.push("Reversal chains");
  }

  if (patterns.includes("top-pressure")) {
    focus.push("Top turns");
  }

  if (patterns.includes("back-exposure-risk")) {
    focus.push("Back defense");
  }

  if (patterns.includes("gives-up-first-score")) {
    focus.push("First-score situations");
  }

  if (patterns.includes("scores-first")) {
    focus.push("Protect early lead");
  }

  if (!focus.length) {
    focus.push("Maintain complete wrestling system");
  }

  return {
    title: "Practice Focus",

    priority:
      focus[0],

    focus,

    drillBlock: [
      "Technique",
      "Situational Wrestling",
      "Live Wrestling",
      "Review"
    ]
  };
}