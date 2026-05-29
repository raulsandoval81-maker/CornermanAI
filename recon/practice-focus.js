export function buildPracticeFocus(patterns = []) {
  if (patterns.includes("neutral-defense")) {
    return "Sprawl reactions and single-leg defense.";
  }

  if (patterns.includes("neutral-offense")) {
    return "Continue offensive chain wrestling.";
  }

  return "Fundamental position work.";
}