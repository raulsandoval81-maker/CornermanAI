export function buildAthleteFeedback(patterns = []) {

  if (patterns.includes("neutral-defense")) {
    return "Protect your lead leg and keep your hands inside.";
  }

  if (patterns.includes("neutral-offense")) {
    return "Keep attacking. Your setups are working.";
  }

  if (patterns.includes("strong-bottom")) {
    return "Your escapes are creating points. Keep building from bottom.";
  }

  if (patterns.includes("back-exposure-risk")) {
    return "Fight hands and belly down sooner.";
  }

  return "Stay disciplined and win the next position.";
}

export function buildAthleteFeedbackPayload({
  athlete = "Athlete",
  latestMatch = {},
  patterns = []
} = {}) {

  return {
    type: "athlete-feedback",

    source:
      "cornerman-intelligence",

    athlete,

    match: {
      opponent:
        latestMatch.opponent || "Opponent",

      result:
        latestMatch.result || "Result",

      method:
        latestMatch.method || "Decision",

      score:
        `${latestMatch.pointsFor || 0}-${latestMatch.pointsAgainst || 0}`
    },

    patterns,

    feedback:
      buildAthleteFeedback(patterns),

    bridgeReady: true,

    createdAt:
      new Date().toISOString()
  };
}