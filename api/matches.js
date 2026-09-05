const { json, readJson, requireAuth } = require("./_lib/http");
const { normalizeMatch } = require("./_lib/match");
const { listStoredMatches, writeStoredMatches } = require("./_lib/store");

module.exports = async function handler(request, response) {
  if (!requireAuth(request, response)) return;
  try {
    const matches = await listStoredMatches();
    if (request.method === "GET") return json(response, 200, { matches });
    if (request.method !== "POST") return json(response, 405, { error: "Method not allowed." });
    const body = await readJson(request);
    if (!body.match || typeof body.match !== "object" || Array.isArray(body.match)) return json(response, 400, { error: "A Match object is required." });
    const normalized = normalizeMatch(body.match);
    const index = matches.findIndex(item => String(item.id) === normalized.id || (normalized.legacyId && String(item.legacyId) === normalized.legacyId));
    const serverUpdatedAt = new Date().toISOString();
    if (index >= 0) {
      const existing = matches[index];
      matches[index] = {
        ...existing,
        ...normalized,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: serverUpdatedAt
      };
    } else {
      normalized.updatedAt = serverUpdatedAt;
      matches.push(normalized);
    }
    await writeStoredMatches(matches);
    return json(response, index >= 0 ? 200 : 201, { match: index >= 0 ? matches[index] : normalized });
  } catch (error) {
    return json(response, error.status || 503, { error: error.status ? error.message : "Match persistence is unavailable." });
  }
};
