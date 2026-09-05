const assert = require("node:assert/strict");
process.env.CORNERMAN_ACCESS_PASSWORD = "test-password";
process.env.CORNERMAN_SESSION_SECRET = "test-session-secret-with-sufficient-entropy";
process.env.KV_REST_API_URL = "https://kv.test";
process.env.KV_REST_API_TOKEN = "test-token";

let stored = null;
global.fetch = async (_url, options) => {
  const command = JSON.parse(options.body);
  if (command[0] === "GET") return Response.json({ result: stored });
  if (command[0] === "SET") { stored = command[2]; return Response.json({ result: "OK" }); }
  return Response.json({ error: "unsupported" });
};

function response() {
  return { statusCode: 200, headers: {}, body: "", status(code) { this.statusCode = code; return this; }, setHeader(key, value) { this.headers[key] = value; }, end(value) { this.body = value || ""; } };
}

const auth = require("../api/auth");
const matches = require("../api/matches");
const matchDetail = require("../api/matches/[id]");
const workspaceId = "workspace_local_owner";

(async () => {
  let res = response();
  await matches({ method: "GET", headers: {} }, res);
  assert.equal(res.statusCode, 401);

  res = response();
  await auth({ method: "POST", headers: { "x-forwarded-proto": "https" }, body: { password: "wrong" } }, res);
  assert.equal(res.statusCode, 401);

  res = response();
  await auth({ method: "POST", headers: { "x-forwarded-proto": "https" }, body: { password: "test-password" } }, res);
  assert.equal(res.statusCode, 200);
  assert.match(res.headers["Set-Cookie"], /HttpOnly/);
  assert.match(res.headers["Set-Cookie"], /Secure/);
  const cookie = res.headers["Set-Cookie"].split(";")[0];

  res = response();
  await matches({ method: "POST", headers: { cookie }, body: { workspaceId, match: { id: "one", workspaceId, athlete: "A", opponent: "B" } } }, res);
  assert.equal(res.statusCode, 201);
  const created = JSON.parse(res.body).match;

  res = response();
  await matches({ method: "POST", headers: { cookie }, body: { workspaceId, match: { ...created, athlete: "Updated", createdAt: "tampered", updatedAt: "stale" } } }, res);
  assert.equal(res.statusCode, 200);
  const resaved = JSON.parse(res.body).match;
  assert.equal(resaved.id, created.id);
  assert.equal(resaved.createdAt, created.createdAt);
  assert.notEqual(resaved.updatedAt, "stale");

  res = response();
  await matchDetail({ method: "PATCH", headers: { cookie }, query: { id: "one", workspaceId }, body: { workspaceId, mediaReference: { videoUrl: "https://example.com/match" } } }, res);
  assert.equal(res.statusCode, 200);
  const patched = JSON.parse(res.body).match;
  assert.equal(patched.id, created.id);
  assert.equal(patched.createdAt, created.createdAt);
  assert.equal(patched.videoUrl, "https://example.com/match");
  assert.ok(Date.parse(patched.updatedAt) >= Date.parse(resaved.updatedAt));

  res = response();
  await matches({ method: "GET", headers: { cookie }, query: { workspaceId } }, res);
  assert.equal(JSON.parse(res.body).matches.length, 1);

  res = response();
  await matchDetail({ method: "GET", headers: { cookie }, query: { id: "one", workspaceId } }, res);
  assert.equal(JSON.parse(res.body).match.id, "one");

  console.log("Match API authentication tests: PASS");
})().catch(error => { console.error(error); process.exitCode = 1; });
