const { json, readJson, getSessionUser } = require("./_lib/http");
const { normalizeMatch } = require("./_lib/match");
const { listStoredMatches, writeStoredMatches } = require("./_lib/store");
const { requireWorkspaceAccess, resolveMatchWorkspaceId } = require("./_lib/workspace-authorization");

module.exports = async function handler(request, response) {
  try {
    if (!getSessionUser(request)) return json(response, 401, { error: "Authentication required." });
    const matches = await listStoredMatches();
    if (request.method === "GET") {
      const workspaceId = request.query?.workspaceId;
      requireWorkspaceAccess(request, workspaceId);
      return json(response, 200, {
        matches: matches.filter(match => resolveMatchWorkspaceId(match) === workspaceId)
      });
    }
    if (request.method !== "POST") return json(response, 405, { error: "Method not allowed." });
    const body = await readJson(request);
    if (!body.match || typeof body.match !== "object" || Array.isArray(body.match)) return json(response, 400, { error: "A Match object is required." });
    const workspaceId = body.workspaceId || body.match.workspaceId;
    requireWorkspaceAccess(request, workspaceId);
    if (body.match.workspaceId && body.match.workspaceId !== workspaceId) {
      return json(response, 403, { error: "Match workspace cannot be changed." });
    }
    if (request.query?.workspaceId && request.query.workspaceId !== workspaceId) {
      return json(response, 403, { error: "Workspace context does not match." });
    }
    const normalized = normalizeMatch(body.match);
    normalized.workspaceId = workspaceId;
    const index = matches.findIndex(item => String(item.id) === normalized.id || (normalized.legacyId && String(item.legacyId) === normalized.legacyId));
    const serverUpdatedAt = new Date().toISOString();
    if (index >= 0) {
      const existing = matches[index];
      if (resolveMatchWorkspaceId(existing) !== workspaceId) return json(response, 404, { error: "Match not found." });
      matches[index] = {
        ...existing,
        ...normalized,
        id: existing.id,
        workspaceId,
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
