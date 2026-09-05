const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
process.env.CORNERMAN_SESSION_SECRET = "sandman-roster-test-secret";
process.env.CORNERMAN_OWNER_USER_ID = "user_a";
process.env.CORNERMAN_OWNER_WORKSPACE_ID = "workspace_a";
process.env.CORNERMAN_SANDMAN_WORKSPACE_LINKS_JSON = JSON.stringify([{ workspaceId: "workspace_a", sourceTeamId: "lompoc" }]);
process.env.SANDMAN_ROSTER_ENDPOINT = "https://sandman.test/roster";
process.env.SANDMAN_CORNERMAN_SHARED_SECRET = "shared-test-secret";
const roster = require("../api/_lib/sandman-roster.js");
const handler = require("../api/sandman-roster.js");
const { COOKIE_NAME, createSession } = require("../api/_lib/http.js");

function response() { return { statusCode: 200, body: "", headers: {}, status(code) { this.statusCode = code; return this; }, setHeader(key, value) { this.headers[key] = value; }, end(value) { this.body = value || ""; } }; }
async function call(request) { const res = response(); await handler({ headers: {}, query: {}, ...request }, res); return { status: res.statusCode, body: JSON.parse(res.body || "{}") }; }
test("normalizes Sandman athletes and binds them to a workspace", () => {
  const value = roster.normalizeSandmanAthlete({ sourceAthleteId: "F4_0001", sourceTeamId: "lompoc", displayName: "Athlete One", discipline: "Wrestling" }, "workspace_a");
  assert.equal(value.sourceSystem, "sandman"); assert.equal(value.workspaceId, "workspace_a");
});
test("rejects malformed records, wrong teams, and duplicate athlete IDs", () => {
  const values = [{ sourceAthleteId: "F4_0001", sourceTeamId: "lompoc", displayName: "One" }, { sourceAthleteId: "F4_0001", sourceTeamId: "lompoc", displayName: "Duplicate" }, { sourceAthleteId: "F4_0002", sourceTeamId: "other", displayName: "Wrong team" }, { sourceTeamId: "lompoc", displayName: "Missing ID" }];
  assert.deepEqual(roster.normalizeSandmanRoster(values, "workspace_a", "lompoc").map(x => x.displayName), ["One"]);
});
test("workspace links are exact and isolated", () => {
  const links = [{ workspaceId: "workspace_a", sourceTeamId: "lompoc" }];
  assert.equal(roster.getWorkspaceLink("workspace_a", links).sourceTeamId, "lompoc"); assert.equal(roster.getWorkspaceLink("workspace_b", links), null);
});

test("roster proxy requires workspace authentication and validates upstream team identity", async () => {
  global.fetch = async (url, options) => {
    assert.equal(new URL(url).searchParams.get("teamId"), "lompoc");
    assert.equal(options.headers.Authorization, "Bearer shared-test-secret");
    return Response.json({ athletes: [{ sourceAthleteId: "F4_0001", sourceTeamId: "lompoc", displayName: "One" }, { sourceAthleteId: "F4_9999", sourceTeamId: "other", displayName: "Injected" }] });
  };
  assert.equal((await call({ method: "GET", query: { workspaceId: "workspace_a" } })).status, 401);
  const cookie = `${COOKIE_NAME}=${createSession(process.env.CORNERMAN_SESSION_SECRET, "user_a")}`;
  const result = await call({ method: "GET", headers: { cookie }, query: { workspaceId: "workspace_a" } });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.athletes.map(item => item.sourceAthleteId), ["F4_0001"]);
  assert.equal(result.body.athletes[0].workspaceId, "workspace_a");
});

test("console keeps standalone fallback and writes linked identity into Match payload", () => {
  const rosterSource = fs.readFileSync(new URL("../shared/roster-repository.js", `file://${__dirname}/`), "utf8");
  const consoleSource = fs.readFileSync(new URL("../console/match-engine.modular.js", `file://${__dirname}/`), "utf8");
  assert.match(rosterSource, /if \(!canUse\("sandman_handoff"\)\).*localRosterEntries/);
  assert.match(consoleSource, /sourceAthleteId: entry\.sourceAthleteId/);
  assert.match(consoleSource, /\.\.\.\(matchContext\.athleteReference \|\| \{\}\)/);
});
