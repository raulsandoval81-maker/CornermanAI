const MATCH_KEY = "cornerman:matches:v1";

async function command(commandParts) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("Match store is not configured.");

  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commandParts)
  });
  if (!response.ok) throw new Error("Match store request failed.");
  const payload = await response.json();
  if (payload.error) throw new Error("Match store operation failed.");
  return payload.result;
}

async function listStoredMatches() {
  const raw = await command(["GET", MATCH_KEY]);
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

async function writeStoredMatches(matches) {
  await command(["SET", MATCH_KEY, JSON.stringify(matches)]);
  return matches;
}

module.exports = { listStoredMatches, writeStoredMatches };
