export function detectPatterns(matchPayload = {}) {
  const events = matchPayload.events || [];
  const patterns = [];

  const takedownsAllowed = events.filter(
    e => e.type === "takedown_allowed"
  ).length;

  const takedownsScored = events.filter(
    e => e.type === "takedown_scored"
  ).length;

  const escapesScored = events.filter(
  e => e.type === "escape_scored"
).length;

if (escapesScored >= 2) {
  patterns.push("strong-bottom");
}

  if (takedownsAllowed >= 3) {
    patterns.push("neutral-defense");
  }

  if (takedownsScored >= 3) {
    patterns.push("neutral-offense");
  }

  return patterns;
}