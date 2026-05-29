export function buildCoachSummary(patterns = []) {

  if (patterns.includes("neutral-defense")) {
    return "Athlete gave up multiple takedowns from neutral.";
  }

  if (patterns.includes("neutral-offense")) {
    return "Athlete created strong offense from neutral.";
  }

  if (patterns.includes("strong-bottom")) {
    return "Athlete showed strong bottom position skills.";
  }

  if (patterns.includes("back-exposure-risk")) {
    return "Athlete gave up multiple nearfall exposures.";
  }

  return "No major pattern detected.";

}