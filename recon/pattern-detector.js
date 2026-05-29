export function detectPatterns(matchPayload = {}) {
  const events = matchPayload.events || [];
  const patterns = [];

  const takedownsAllowed = events.filter(
    e => e.type === "score" &&
      e.code === "td3" &&
      e.side === "opponent"
  ).length;

  const takedownsScored = events.filter(
    e => e.type === "score" &&
      e.code === "td3" &&
      e.side === "athlete"
  ).length;

  const escapesScored = events.filter(
    e => e.type === "score" &&
      e.code === "esc1" &&
      e.side === "athlete"
  ).length;

  const nearfallAllowed = events.filter(
    e => e.type === "score" &&
      (e.code === "nf2" || e.code === "nf3" || e.code === "nf4") &&
      e.side === "opponent"
  ).length;

  if (takedownsAllowed >= 2) {
    patterns.push("neutral-defense");
  }

  if (takedownsScored >= 2) {
    patterns.push("neutral-offense");
  }

  if (escapesScored >= 2) {
    patterns.push("strong-bottom");
  }

  if (nearfallAllowed >= 2) {
    patterns.push("back-exposure-risk");
  }

  return patterns;
}