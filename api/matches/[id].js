const { json, readJson, requireAuth } = require("../_lib/http");
const { normalizeMatch } = require("../_lib/match");
const { listStoredMatches, writeStoredMatches } = require("../_lib/store");

module.exports = async function handler(request, response) {
  if (!requireAuth(request, response)) return;
  try {
    const id = String(request.query.id || "");
    const matches = await listStoredMatches();
    const index = matches.findIndex(item => String(item.id) === id);
    if (index < 0) return json(response, 404, { error: "Match not found." });
    if (request.method === "GET") return json(response, 200, { match: matches[index] });
    if (request.method !== "PATCH") return json(response, 405, { error: "Method not allowed." });
    const body = await readJson(request, 64 * 1024);
    const existing = matches[index];
    const updated = normalizeMatch({ ...existing, videoUrl: body.mediaReference?.videoUrl ?? body.videoUrl ?? existing.videoUrl, videoHost: body.mediaReference?.videoHost ?? existing.videoHost, videoVisibility: body.mediaReference?.videoVisibility ?? existing.videoVisibility });
    updated.id = existing.id;
    updated.createdAt = existing.createdAt;
    updated.updatedAt = new Date().toISOString();
    matches[index] = updated;
    await writeStoredMatches(matches);
    return json(response, 200, { match: updated });
  } catch (error) {
    return json(response, error.status || 503, { error: error.status ? error.message : "Match persistence is unavailable." });
  }
};
