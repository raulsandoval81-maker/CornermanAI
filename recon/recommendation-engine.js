export function buildRecommendations(
  match = {},
  analysis = {}
) {
  const recommendations = [];

  const patterns =
    analysis.patterns || [];

  if (patterns.includes("neutral-defense")) {
    recommendations.push({
      type: "skill",
      priority: "high",
      title: "Strengthen neutral defense",
      focus: "Improve stance, hand fighting, down-blocks, and sprawl reactions."
    });
  }

  if (patterns.includes("neutral-offense")) {
    recommendations.push({
      type: "maintain",
      priority: "medium",
      title: "Continue attacking first",
      focus: "Build setup-to-shot chains and finish cleanly."
    });
  }

  if (patterns.includes("strong-bottom")) {
    recommendations.push({
      type: "maintain",
      priority: "medium",
      title: "Keep developing bottom wrestling",
      focus: "Continue building first-move speed and stand-up finishes."
    });
  }

  if (patterns.includes("reversal-threat")) {
    recommendations.push({
      type: "skill",
      priority: "medium",
      title: "Develop reversal chains",
      focus: "Turn defensive positions into scoring opportunities."
    });
  }

  if (patterns.includes("top-pressure")) {
    recommendations.push({
      type: "skill",
      priority: "medium",
      title: "Expand top pressure",
      focus: "Turn rides into nearfall opportunities and pinning combinations."
    });
  }

  if (patterns.includes("back-exposure-risk")) {
    recommendations.push({
      type: "fix",
      priority: "high",
      title: "Protect against exposure",
      focus: "Improve hip awareness, fight hands, and recover safely."
    });
  }

  if (patterns.includes("gives-up-first-score")) {
    recommendations.push({
      type: "mindset",
      priority: "high",
      title: "Start matches aggressively",
      focus: "Win the opening exchange and score first."
    });
  }

  if (patterns.includes("scores-first")) {
    recommendations.push({
      type: "maintain",
      priority: "low",
      title: "Continue scoring first",
      focus: "Keep building matches from an early lead."
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      type: "maintain",
      priority: "low",
      title: "Continue current development",
      focus: "No major pattern detected. Continue reinforcing complete wrestling."
    });
  }

  return recommendations;
}