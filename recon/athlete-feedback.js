export function buildAthleteFeedback(
  match = {},
  analysis = {}
) {
  const patterns =
    analysis.patterns || [];

  let win =
    "You competed hard and gave us valuable match data.";

  let fix =
    "Keep building complete wrestling.";

  if (patterns.includes("neutral-offense")) {
    win =
      "You created offense from neutral and attacked first.";
  }

  if (patterns.includes("strong-bottom")) {
    win =
      "Your bottom wrestling created scoring opportunities.";
  }

  if (patterns.includes("top-pressure")) {
    win =
      "You converted control into offensive pressure.";
  }

  if (patterns.includes("scores-first")) {
    win =
      "You established momentum by scoring first.";
  }

  if (patterns.includes("neutral-defense")) {
    fix =
      "Improve neutral defense and protect your lead leg.";
  }

  if (patterns.includes("back-exposure-risk")) {
    fix =
      "Protect your back and improve recovery from danger.";
  }

  if (patterns.includes("gives-up-first-score")) {
    fix =
      "Start matches stronger and fight for the first score.";
  }

  if (patterns.includes("reversal-threat")) {
    fix =
      "Continue turning defense into offense with reversal chains.";
  }

  return {
    athlete:
      match.athlete || "Athlete",

    headline:
      "1 Win / 1 Fix",

    win,
    fix,

    patterns
  };
}

export function buildAthleteFeedbackPayload({
  match = {},
  feedback = {}
} = {}) {
  return {
    matchId:
      match.id || "",

    athlete:
      match.athlete || "",

    feedback,

    createdAt:
      new Date().toISOString()
  };
}