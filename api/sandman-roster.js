const { json } = require("./_lib/http");
const { requireWorkspaceAccess } = require("./_lib/workspace-authorization");
const { getWorkspaceLink, normalizeSandmanRoster } = require("./_lib/sandman-roster");
module.exports = async function handler(request, response) {
  try {
    if (request.method !== "GET") return json(response, 405, { error: "Method not allowed." });
    const workspaceId = request.query?.workspaceId;
    requireWorkspaceAccess(request, workspaceId);
    const link = getWorkspaceLink(workspaceId);
    if (!link) return json(response, 404, { error: "This workspace is not linked to Sandman." });
    const endpoint = String(process.env.SANDMAN_ROSTER_ENDPOINT || "").trim();
    const secret = String(process.env.SANDMAN_CORNERMAN_SHARED_SECRET || "").trim();
    if (!endpoint || !secret) return json(response, 503, { error: "Sandman roster integration is not configured." });
    const url = new URL(endpoint);
    if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1", "::1"].includes(url.hostname))) return json(response, 503, { error: "Sandman roster integration is not configured safely." });
    url.searchParams.set("teamId", String(link.sourceTeamId));
    const upstream = await fetch(url, { headers: { Authorization: `Bearer ${secret}`, Accept: "application/json" }, signal: AbortSignal.timeout(8000) });
    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) return json(response, 502, { error: "Sandman roster could not be loaded." });
    return json(response, 200, { sourceSystem: "sandman", sourceTeamId: String(link.sourceTeamId), athletes: normalizeSandmanRoster(payload.athletes, workspaceId, String(link.sourceTeamId)) });
  } catch (error) { return json(response, error.status || 503, { error: error.status ? error.message : "Sandman roster is unavailable." }); }
};
