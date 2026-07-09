export function buildAthleteFeedback(match = {}, analysis = {}) {
  const patterns = analysis.patterns || [];

  return {
    athlete: match.athlete || "Athlete",
    headline: "1 Win / 1 Fix",
    win: analysis.takedowns > 0 || analysis.nearfall > 0
      ? "You created scoring opportunities."
      : "You stayed in the match and gave the coach useful data.",
    fix: analysis.pointsAgainst > 0
      ? "Clean up defensive reactions after scoring exchanges."
      : "Keep improving position control.",
    patterns
  };
}

export function buildAthleteFeedbackPayload({
  match = {},
  feedback = {}
} = {}) {
  return {
    matchId: match.id || "",
    athlete: match.athlete || "",
    feedback,
    createdAt: new Date().toISOString()
  };
}
