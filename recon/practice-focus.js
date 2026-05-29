export function buildPracticeFocus(patterns = []) {

  if (patterns.includes("neutral-defense")) {
    return "Sprawl reactions and single-leg defense.";
  }

  if (patterns.includes("neutral-offense")) {
    return "Continue offensive chain wrestling.";
  }

  if (patterns.includes("strong-bottom")) {
    return "Continue bottom work and first-move escapes.";
  }

  return "Fundamental position work.";

}