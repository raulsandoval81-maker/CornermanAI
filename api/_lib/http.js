const crypto = require("crypto");

const COOKIE_NAME = "cornerman_session";

function json(response, status, payload) {
  response.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function readJson(request, limit = 1024 * 1024) {
  if (request.body != null) {
    const body = typeof request.body === "string" ? request.body : JSON.stringify(request.body);
    if (Buffer.byteLength(body) > limit) return Promise.reject(Object.assign(new Error("Request too large."), { status: 413 }));
    try {
      return Promise.resolve(typeof request.body === "string" ? JSON.parse(request.body) : request.body);
    } catch (error) {
      return Promise.reject(Object.assign(new Error("Invalid JSON."), { status: 400 }));
    }
  }
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", chunk => {
      body += chunk;
      if (Buffer.byteLength(body) > limit) {
        reject(Object.assign(new Error("Request too large."), { status: 413 }));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(Object.assign(new Error("Invalid JSON."), { status: 400 }));
      }
    });
    request.on("error", reject);
  });
}

function signature(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function createSession(secret) {
  const expires = Date.now() + 12 * 60 * 60 * 1000;
  const value = String(expires);
  return `${value}.${signature(value, secret)}`;
}

function timingSafeEqual(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function isAuthorized(request) {
  const secret = process.env.CORNERMAN_SESSION_SECRET;
  if (!secret) return false;
  const cookies = Object.fromEntries(
    String(request.headers.cookie || "").split(";").map(value => {
      const [key, ...rest] = value.trim().split("=");
      return [key, rest.join("=")];
    })
  );
  const [expires, supplied] = String(cookies[COOKIE_NAME] || "").split(".");
  return Number(expires) > Date.now() && timingSafeEqual(supplied, signature(expires, secret));
}

function requireAuth(request, response) {
  if (isAuthorized(request)) return true;
  json(response, 401, { error: "Authentication required." });
  return false;
}

module.exports = { COOKIE_NAME, createSession, isAuthorized, json, readJson, requireAuth, timingSafeEqual };
