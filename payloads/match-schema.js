export const MATCH_SCHEMA_VERSION = "cornerman-match-v1";

export function normalizeMatchPayload(match = {}) {
  return {
    schemaVersion:
      match.schemaVersion || MATCH_SCHEMA_VERSION,

    id:
      match.id || globalThis.crypto?.randomUUID?.() || String(Date.now()),

    eventName:
      match.eventName || "Practice",

    athlete:
      match.athlete || match.athleteName || "Athlete",

    opponent:
      match.opponent || match.opponentName || "Opponent",

    weightClass:
      match.weightClass || "",

    result:
      match.result || "",

    method:
      match.method || "",

    pointsFor:
      Number(match.pointsFor || match.athleteScore || 0),

    pointsAgainst:
      Number(match.pointsAgainst || match.opponentScore || 0),

    takedowns:
      Number(match.takedowns || 0),

    escapes:
      Number(match.escapes || 0),

    reversals:
      Number(match.reversals || 0),

    nearfall:
      Number(match.nearfall || 0),

    events:
      Array.isArray(match.events) ? match.events : [],

    notes:
      match.notes || "",

    videoUrl:
      match.videoUrl || "",

    createdAt:
      match.createdAt || match.savedAt || match.savedToMatchLogAt || new Date().toISOString(),

    updatedAt:
      match.updatedAt || new Date().toISOString(),

    legacyId:
      match.legacyId ?? match.sourceId ?? null
  };
}
