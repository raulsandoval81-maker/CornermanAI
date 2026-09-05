export const HANDOFF_SCHEMA_VERSION = "cornerman-sandman-handoff-v1";

const BLOCKED_FIELDS = ["cards", "cardId", "xp", "rank", "progression", "curriculum", "testing"];

export function formatSkillLabel(value = "") {
  return String(value).replaceAll("-", " ").replace(/\b\w/g, character => character.toUpperCase());
}

export function buildHandoffPayload({ match = {}, patternId = "", recommendation = {}, skillKey = "", skillLabel = "", discipline = "wrestling", notes = "", now = () => new Date().toISOString() } = {}) {
  const athleteId = String(match.athleteId || "").trim();
  const athleteName = String(match.athlete || match.athleteName || "").trim();
  const matchId = String(match.id || "").trim();
  const normalizedSkillKey = String(skillKey || "").trim();
  if (!athleteId && !athleteName) throw new TypeError("Select a match with an athlete before preparing a handoff.");
  if (!normalizedSkillKey) throw new TypeError("Select a development skill before preparing a handoff.");
  if (!matchId) throw new TypeError("The source match must have a stable Match ID.");

  return {
    schemaVersion: HANDOFF_SCHEMA_VERSION,
    source: "cornerman",
    athleteId: athleteId || null,
    athleteName,
    matchId,
    patternId: String(patternId || "").trim() || null,
    recommendationId: String(recommendation.id || recommendation.recommendationId || recommendation.key || "").trim() || null,
    skillKey: normalizedSkillKey,
    skillLabel: String(skillLabel || formatSkillLabel(normalizedSkillKey)).trim(),
    discipline: String(discipline || "wrestling").trim(),
    priority: String(recommendation.priority || "medium").trim(),
    evidence: {
      event: String(match.eventName || match.tournament || "").trim(),
      opponent: String(match.opponent || match.opponentName || "").trim(),
      result: String(match.result || "").trim(),
      method: String(match.method || "").trim(),
      pointsFor: Number(match.pointsFor ?? match.athleteScore ?? 0),
      pointsAgainst: Number(match.pointsAgainst ?? match.opponentScore ?? 0),
      recommendation: String(recommendation.title || "").trim(),
      focus: String(recommendation.focus || "").trim()
    },
    notes: String(notes || "").trim(),
    createdAt: now()
  };
}

export function validateHandoffPayload(payload = {}) {
  const errors = [];
  if (payload.schemaVersion !== HANDOFF_SCHEMA_VERSION) errors.push("Unsupported handoff schema.");
  if (payload.source !== "cornerman") errors.push("Invalid handoff source.");
  if (!payload.athleteId && !payload.athleteName) errors.push("Athlete is required.");
  if (!payload.matchId) errors.push("Match ID is required.");
  if (!payload.skillKey) errors.push("Development skill is required.");
  if (BLOCKED_FIELDS.some(field => Object.hasOwn(payload, field))) errors.push("Sandman-owned assignment fields are not allowed.");
  return { valid: errors.length === 0, errors };
}
