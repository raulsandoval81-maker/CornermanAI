const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

process.env.CORNERMAN_SESSION_SECRET = "workspace-authorization-test-secret";
process.env.CORNERMAN_OWNER_USER_ID = "user_a";
process.env.CORNERMAN_OWNER_WORKSPACE_ID = "workspace_a";
process.env.CORNERMAN_WORKSPACE_MEMBERSHIPS_JSON = JSON.stringify([
  { id: "membership_b", userId: "user_b", workspaceId: "workspace_b", role: "coach" }
]);
process.env.KV_REST_API_URL = "https://kv.test";
process.env.KV_REST_API_TOKEN = "test-token";

let stored = null;
global.fetch = async (_url, options) => {
  const command = JSON.parse(options.body);
  if (command[0] === "GET") return Response.json({ result: stored });
  if (command[0] === "SET") { stored = command[2]; return Response.json({ result: "OK" }); }
  return Response.json({ error: "unsupported" });
};

const { COOKIE_NAME, createSession } = require("../api/_lib/http");
const authorization = require("../api/_lib/workspace-authorization");
const matches = require("../api/matches");
const matchDetail = require("../api/matches/[id]");

function cookie(userId) {
  return `${COOKIE_NAME}=${createSession(process.env.CORNERMAN_SESSION_SECRET, userId)}`;
}

function legacyOwnerCookie() {
  const expires = String(Date.now() + 60_000);
  const signature = crypto.createHmac("sha256", process.env.CORNERMAN_SESSION_SECRET).update(expires).digest("base64url");
  return `${COOKIE_NAME}=${expires}.${signature}`;
}

function response() {
  return {
    statusCode: 200, headers: {}, body: "",
    status(code) { this.statusCode = code; return this; },
    setHeader(key, value) { this.headers[key] = value; },
    end(value) { this.body = value || ""; }
  };
}

async function call(handler, request) {
  const res = response();
  await handler({ headers: {}, query: {}, ...request }, res);
  return { status: res.statusCode, body: res.body ? JSON.parse(res.body) : {} };
}

test("membership roles normalize and invalid roles are rejected", () => {
  for (const role of authorization.ROLES) {
    assert.equal(authorization.normalizeMembership({ id: role, userId: "user", workspaceId: "workspace", role }).role, role);
  }
  assert.equal(authorization.normalizeMembership({ id: "bad", userId: "user", workspaceId: "workspace", role: "admin" }), null);
  assert.equal(authorization.validWorkspaceId("../workspace"), false);
});

test("Match API enforces session user membership and workspace ownership", async () => {
  stored = null;
  const aCookie = cookie("user_a");
  const bCookie = cookie("user_b");

  let result = await call(matches, { method: "GET", query: { workspaceId: "workspace_a" } });
  assert.equal(result.status, 401);

  result = await call(matches, { method: "GET", headers: { cookie: aCookie }, query: {} });
  assert.equal(result.status, 400);
  result = await call(matches, { method: "GET", headers: { cookie: aCookie }, query: { workspaceId: "../bad" } });
  assert.equal(result.status, 400);
  result = await call(matches, { method: "GET", headers: { cookie: aCookie }, query: { workspaceId: "workspace_b" } });
  assert.equal(result.status, 403);

  result = await call(matches, {
    method: "POST", headers: { cookie: aCookie },
    body: { workspaceId: "workspace_a", match: { id: "match_a", workspaceId: "workspace_a", athlete: "A", opponent: "X" } }
  });
  assert.equal(result.status, 201);
  assert.equal(result.body.match.workspaceId, "workspace_a");

  result = await call(matches, {
    method: "POST", headers: { cookie: bCookie },
    body: { workspaceId: "workspace_b", match: { id: "match_b", workspaceId: "workspace_b", athlete: "B", opponent: "Y" } }
  });
  assert.equal(result.status, 201);

  result = await call(matches, { method: "GET", headers: { cookie: aCookie }, query: { workspaceId: "workspace_a" } });
  assert.deepEqual(result.body.matches.map(match => match.id), ["match_a"]);

  result = await call(matches, { method: "GET", headers: { cookie: legacyOwnerCookie() }, query: { workspaceId: "workspace_a" } });
  assert.equal(result.status, 200);

  result = await call(matchDetail, { method: "GET", headers: { cookie: aCookie }, query: { id: "match_b", workspaceId: "workspace_a" } });
  assert.equal(result.status, 404);
  result = await call(matchDetail, { method: "GET", headers: { cookie: aCookie }, query: { id: "match_b", workspaceId: "workspace_b" } });
  assert.equal(result.status, 403);

  result = await call(matches, {
    method: "POST", headers: { cookie: aCookie },
    body: { workspaceId: "workspace_b", match: { id: "attack_create", workspaceId: "workspace_b" } }
  });
  assert.equal(result.status, 403);

  result = await call(matches, {
    method: "POST", headers: { cookie: aCookie }, query: { workspaceId: "workspace_b" },
    body: { workspaceId: "workspace_a", match: { id: "query_attack", workspaceId: "workspace_a" } }
  });
  assert.equal(result.status, 403);

  result = await call(matches, {
    method: "POST", headers: { cookie: aCookie },
    body: { workspaceId: "workspace_a", match: { id: "body_attack", workspaceId: "workspace_b" } }
  });
  assert.equal(result.status, 403);

  result = await call(matches, {
    method: "POST", headers: { cookie: aCookie },
    body: { workspaceId: "workspace_b", match: { id: "match_a", workspaceId: "workspace_b" } }
  });
  assert.equal(result.status, 403);

  result = await call(matches, {
    method: "POST", headers: { cookie: aCookie },
    body: { workspaceId: "workspace_a", match: { id: "match_a", workspaceId: "workspace_a", athlete: "A Updated" } }
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.match.athlete, "A Updated");

  result = await call(matchDetail, {
    method: "PATCH", headers: { cookie: aCookie }, query: { id: "match_a", workspaceId: "workspace_a" },
    body: { workspaceId: "workspace_b", mediaReference: { videoUrl: "https://example.com/attack" } }
  });
  assert.equal(result.status, 403);

  result = await call(matchDetail, {
    method: "PATCH", headers: { cookie: aCookie }, query: { id: "match_b", workspaceId: "workspace_b" },
    body: { workspaceId: "workspace_b", mediaReference: { videoUrl: "https://example.com/attack" } }
  });
  assert.equal(result.status, 403);

  result = await call(matchDetail, {
    method: "PATCH", headers: { cookie: aCookie }, query: { id: "match_a", workspaceId: "workspace_a" },
    body: { workspaceId: "workspace_a", mediaReference: { videoUrl: "https://example.com/own" } }
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.match.videoUrl, "https://example.com/own");

  const records = JSON.parse(stored);
  records.push({ id: "legacy_match", athlete: "Legacy", opponent: "Opponent" });
  stored = JSON.stringify(records);
  result = await call(matches, { method: "GET", headers: { cookie: aCookie }, query: { workspaceId: "workspace_a" } });
  assert.equal(result.body.matches.some(match => match.id === "legacy_match"), true);
  result = await call(matches, { method: "GET", headers: { cookie: bCookie }, query: { workspaceId: "workspace_b" } });
  assert.equal(result.body.matches.some(match => match.id === "legacy_match"), false);
  result = await call(matchDetail, { method: "GET", headers: { cookie: bCookie }, query: { id: "legacy_match", workspaceId: "workspace_b" } });
  assert.equal(result.status, 404);

  result = await call(matchDetail, { method: "DELETE", headers: { cookie: aCookie }, query: { id: "match_a", workspaceId: "workspace_a" } });
  assert.equal(result.status, 405);
});
