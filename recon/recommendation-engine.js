export function buildRecommendations(match = {}, analysis = {}) {
  const recommendations = [];

  const takedowns =
    Number(match.takedowns || analysis.takedowns || 0);

  const nearfall =
    Number(match.nearfall || analysis.nearfall || 0);

  const pointsAgainst =
    Number(match.pointsAgainst || 0);

  if (takedowns === 0) {
    recommendations.push({
      type: "skill",
      priority: "high",
      title: "Improve neutral offense",
      focus: "Create first scoring opportunities from neutral."
    });
  }

  if (nearfall === 0) {
    recommendations.push({
      type: "skill",
      priority: "medium",
      title: "Build top-turn offense",
      focus: "Convert takedowns into nearfall points."
    });
  }

  if (pointsAgainst > 0) {
    recommendations.push({
      type: "fix",
      priority: "high",
      title: "Clean up defensive reactions",
      focus: "Reduce points allowed after scoring exchanges."
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      type: "maintain",
      priority: "low",
      title: "Continue current focus",
      focus: "Match performance shows balanced scoring control."
    });
  }

  return recommendations;
}