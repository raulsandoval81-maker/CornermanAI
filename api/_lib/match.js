const crypto = require("crypto");
const SCHEMA_VERSION = "cornerman-match-v1";

function normalizeMatch(match = {}) {
  const now = new Date().toISOString();
  const legacyId = match.legacyId ?? match.sourceId ?? match.id ?? null;
  return {
    ...match,
    id: String(match.id || crypto.randomUUID()),
    schemaVersion: SCHEMA_VERSION,
    legacyId: legacyId == null ? null : String(legacyId),
    createdAt: match.createdAt || match.savedAt || match.savedToMatchLogAt || now,
    updatedAt: match.updatedAt || now,
    eventName: match.eventName || "Practice",
    athlete: match.athlete || match.athleteName || "Athlete",
    opponent: match.opponent || match.opponentName || "Opponent",
    weightClass: match.weightClass || "",
    pointsFor: Number(match.pointsFor ?? match.athleteScore ?? 0),
    pointsAgainst: Number(match.pointsAgainst ?? match.opponentScore ?? 0),
    events: Array.isArray(match.events) ? match.events : []
  };
}

module.exports = { normalizeMatch, SCHEMA_VERSION };
