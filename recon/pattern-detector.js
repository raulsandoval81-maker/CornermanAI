export function detectPatterns(matchPayload = {}) {

  const events =
    matchPayload.events || [];

  const patterns = [];

  const takedownsAllowed =
    events.filter(event =>
      event.type === "score" &&
      event.code === "td3" &&
      event.side === "opponent"
    ).length;

  const takedownsScored =
    events.filter(event =>
      event.type === "score" &&
      event.code === "td3" &&
      event.side === "athlete"
    ).length;

  const escapesScored =
    events.filter(event =>
      event.type === "score" &&
      event.code === "esc1" &&
      event.side === "athlete"
    ).length;

  const reversalsScored =
    events.filter(event =>
      event.type === "score" &&
      event.code === "rev2" &&
      event.side === "athlete"
    ).length;

  const nearfallAllowed =
    events.filter(event =>
      event.type === "score" &&
      ["nf2", "nf3", "nf4"].includes(event.code) &&
      event.side === "opponent"
    ).length;

  const nearfallScored =
    events.filter(event =>
      event.type === "score" &&
      ["nf2","nf3","nf4"].includes(event.code) &&
      event.side === "athlete"
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

  if (reversalsScored >= 2) {
    patterns.push("reversal-threat");
  }

  if (nearfallScored >= 2) {
    patterns.push("top-pressure");
  }

  if (nearfallAllowed >= 2) {
    patterns.push("back-exposure-risk");
  }

  const firstScore =
    events.find(event =>
      event.type === "score" &&
      Number(event.points || 0) > 0
    );

  if (firstScore?.side === "athlete") {
    patterns.push("scores-first");
  }

  if (firstScore?.side === "opponent") {
    patterns.push("gives-up-first-score");
  }

  return patterns;
}