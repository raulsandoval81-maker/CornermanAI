export function buildAthleteFeedback(patterns = []) {
  if (patterns.includes("neutral-defense")) {
    return "Protect your lead leg and keep your hands inside.";
  }

  if (patterns.includes("neutral-offense")) {
    return "Keep attacking. Your setups are working.";
  }

  return "Stay disciplined and win the next position.";
}