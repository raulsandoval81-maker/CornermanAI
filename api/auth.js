const { COOKIE_NAME, createSession, json, readJson, isAuthorized, timingSafeEqual } = require("./_lib/http");

module.exports = async function handler(request, response) {
  if (request.method === "GET") return json(response, 200, { authenticated: isAuthorized(request) });
  if (request.method === "DELETE") {
    response.setHeader("Set-Cookie", `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`);
    return json(response, 200, { authenticated: false });
  }
  if (request.method !== "POST") return json(response, 405, { error: "Method not allowed." });

  try {
    const body = await readJson(request, 4096);
    const expected = process.env.CORNERMAN_ACCESS_PASSWORD;
    const secret = process.env.CORNERMAN_SESSION_SECRET;
    if (!expected || !secret) return json(response, 503, { error: "Authentication is not configured." });
    if (!timingSafeEqual(body.password, expected)) return json(response, 401, { error: "Invalid credentials." });
    response.setHeader("Set-Cookie", `${COOKIE_NAME}=${createSession(secret)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=43200`);
    return json(response, 200, { authenticated: true });
  } catch (error) {
    return json(response, error.status || 400, { error: error.message || "Invalid request." });
  }
};
