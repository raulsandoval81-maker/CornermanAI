export function buildCoachSummary(patterns = []) {
  if (patterns.includes("neutral-defense")) {
    return "Athlete gave up multiple takedowns from neutral.";
  }

  if (patterns.includes("neutral-offense")) {
    return "Athlete created strong offense from neutral.";
  }

  return "No major pattern detected.";
}