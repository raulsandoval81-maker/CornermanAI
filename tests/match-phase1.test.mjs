import assert from "node:assert/strict";

class Storage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
}

globalThis.localStorage = new Storage();
let backend = [];
let authenticated = true;
let available = true;

globalThis.fetch = async (path, options = {}) => {
  if (!available) return new Response(JSON.stringify({ error: "Unavailable" }), { status: 503 });
  if (!authenticated) return new Response(JSON.stringify({ error: "Authentication required." }), { status: 401 });
  const method = options.method || "GET";
  if (path === "/api/matches" && method === "GET") return Response.json({ matches: backend });
  if (path === "/api/matches" && method === "POST") {
    const match = JSON.parse(options.body).match;
    const index = backend.findIndex(item => item.id === match.id || (match.legacyId && item.legacyId === match.legacyId));
    if (index >= 0) backend[index] = { ...backend[index], ...match };
    else backend.push(match);
    return Response.json({ match: index >= 0 ? backend[index] : match }, { status: index >= 0 ? 200 : 201 });
  }
  const id = decodeURIComponent(String(path).split("/").pop());
  const match = backend.find(item => item.id === id);
  return match ? Response.json({ match }) : Response.json({ error: "Match not found." }, { status: 404 });
};

const repository = await import("../shared/match-repository.js");
localStorage.setItem(repository.MATCH_CACHE_KEY, JSON.stringify([{ id: 17, athlete: "Legacy", opponent: "Opponent", athleteScore: 4, opponentScore: 2, customField: "preserved" }]));
let result = await repository.listMatches();
assert.equal(result.source, "backend");
assert.equal(result.matches.length, 1);
assert.equal(result.matches[0].customField, "preserved");
assert.equal(result.matches[0].pointsFor, 4);
assert.equal(localStorage.getItem(repository.MATCH_MIGRATION_KEY), "complete");

await repository.saveMatch({ id: "bout-a", athlete: "Same", opponent: "Same", pointsFor: 2, pointsAgainst: 0 });
await repository.saveMatch({ id: "bout-b", athlete: "Same", opponent: "Same", pointsFor: 2, pointsAgainst: 0 });
assert.equal(backend.filter(item => item.athlete === "Same").length, 2);

await repository.saveMatch({ id: "bout-a", athlete: "Same", opponent: "Same", pointsFor: 4, pointsAgainst: 0 });
assert.equal(backend.filter(item => item.id === "bout-a").length, 1);
assert.equal(backend.find(item => item.id === "bout-a").pointsFor, 4);

available = false;
result = await repository.saveMatch({ id: "offline", athlete: "Cached", opponent: "Bout" });
assert.equal(result.synced, false);
assert.equal(JSON.parse(localStorage.getItem(repository.MATCH_OUTBOX_KEY)).length, 1);
assert.ok(repository.getCachedMatches().some(item => item.id === "offline"));

available = true;
result = await repository.getMatch("offline");
assert.equal(result.source, "backend");
assert.ok(backend.some(item => item.id === "offline"));
assert.equal(JSON.parse(localStorage.getItem(repository.MATCH_OUTBOX_KEY)).length, 0);

authenticated = false;
result = await repository.listMatches();
assert.equal(result.authenticated, false);
assert.equal(result.source, "cache");

console.log("Match repository Phase 1 tests: PASS");
