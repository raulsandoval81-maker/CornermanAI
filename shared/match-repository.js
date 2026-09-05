import { normalizeMatchPayload } from "../payloads/match-schema.js";
import { getCurrentWorkspaceId } from "./cornerman-workspace.js";

export const MATCH_CACHE_KEY = "cornerman_matches";
export const MATCH_MIGRATION_KEY = "cornerman_matches_backend_migration_v1";
export const MATCH_OUTBOX_KEY = "cornerman_matches_outbox_v1";

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch (error) {
    return [];
  }
}

function writeCache(matches) {
  localStorage.setItem(MATCH_CACHE_KEY, JSON.stringify(matches));
}

export function normalizeMatch(match = {}, { migrating = false } = {}) {
  const normalized = normalizeMatchPayload(match);
  const now = new Date().toISOString();
  return {
    ...match,
    ...normalized,
    workspaceId: String(match.workspaceId || getCurrentWorkspaceId()),
    id: String(match.id || normalized.id),
    schemaVersion: "cornerman-match-v1",
    legacyId: match.legacyId ?? (migrating && match.id != null ? String(match.id) : null),
    createdAt: match.createdAt || match.savedAt || match.savedToMatchLogAt || normalized.createdAt || now,
    updatedAt: match.updatedAt || now
  };
}

export function getCachedMatches() {
  return readArray(MATCH_CACHE_KEY).map(match => normalizeMatch(match, { migrating: true }));
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || "Match service request failed.");
    error.status = response.status;
    throw error;
  }
  return payload;
}

function addToOutbox(match) {
  const outbox = readArray(MATCH_OUTBOX_KEY);
  const index = outbox.findIndex(item => String(item.id) === String(match.id));
  if (index >= 0) outbox[index] = match;
  else outbox.push(match);
  localStorage.setItem(MATCH_OUTBOX_KEY, JSON.stringify(outbox));
}

function removeFromOutbox(id) {
  const outbox = readArray(MATCH_OUTBOX_KEY).filter(item => String(item.id) !== String(id));
  localStorage.setItem(MATCH_OUTBOX_KEY, JSON.stringify(outbox));
}

function cacheOne(match) {
  const matches = getCachedMatches();
  const index = matches.findIndex(item => String(item.id) === String(match.id));
  if (index >= 0) matches[index] = match;
  else matches.push(match);
  writeCache(matches);
}

async function importLegacyOnce() {
  if (localStorage.getItem(MATCH_MIGRATION_KEY) === "complete") return;
  const legacy = getCachedMatches();
  for (const match of legacy) {
    await request("/api/matches", { method: "POST", body: JSON.stringify({ match }) });
  }
  localStorage.setItem(MATCH_MIGRATION_KEY, "complete");
}

async function flushOutbox() {
  for (const match of readArray(MATCH_OUTBOX_KEY)) {
    const payload = await request("/api/matches", { method: "POST", body: JSON.stringify({ match }) });
    cacheOne(payload.match);
    removeFromOutbox(match.id);
  }
}

function forWorkspace(matches, workspaceId) {
  if (!workspaceId) return matches;
  return matches.filter(match => String(match.workspaceId || getCurrentWorkspaceId()) === String(workspaceId));
}

export async function listMatches({ workspaceId = getCurrentWorkspaceId() } = {}) {
  try {
    await importLegacyOnce();
    await flushOutbox();
    const payload = await request(`/api/matches?workspaceId=${encodeURIComponent(String(workspaceId))}`);
    const matches = (payload.matches || []).map(match => normalizeMatch(match));
    writeCache(matches);
    return { matches: forWorkspace(matches, workspaceId), source: "backend", authenticated: true, pending: 0 };
  } catch (error) {
    return { matches: forWorkspace(getCachedMatches(), workspaceId), source: "cache", authenticated: error.status !== 401, pending: readArray(MATCH_OUTBOX_KEY).length, error };
  }
}

export function listMatchesForWorkspace(workspaceId) {
  return listMatches({ workspaceId });
}

export async function getMatch(id) {
  const workspaceId = getCurrentWorkspaceId();
  try {
    await importLegacyOnce();
    await flushOutbox();
    const payload = await request(`/api/matches/${encodeURIComponent(String(id))}?workspaceId=${encodeURIComponent(workspaceId)}`);
    const match = normalizeMatch(payload.match);
    cacheOne(match);
    return { match, source: "backend", authenticated: true };
  } catch (error) {
    const match = getCachedMatches().find(item =>
      String(item.id) === String(id) && String(item.workspaceId) === String(workspaceId)
    ) || null;
    return { match, source: "cache", authenticated: error.status !== 401, error };
  }
}

export async function saveMatch(match) {
  const normalized = normalizeMatch(match);
  cacheOne(normalized);
  try {
    const payload = await request("/api/matches", { method: "POST", body: JSON.stringify({ workspaceId: normalized.workspaceId, match: normalized }) });
    const saved = normalizeMatch(payload.match);
    cacheOne(saved);
    removeFromOutbox(normalized.id);
    return { match: saved, synced: true };
  } catch (error) {
    addToOutbox(normalized);
    return { match: normalized, synced: false, authenticated: error.status !== 401, error };
  }
}

export async function updateMatchMedia(id, mediaReference) {
  const workspaceId = getCurrentWorkspaceId();
  const cached = getCachedMatches().find(item => String(item.id) === String(id));
  if (cached) cacheOne(normalizeMatch({ ...cached, ...mediaReference, updatedAt: new Date().toISOString() }));
  try {
    const payload = await request(`/api/matches/${encodeURIComponent(String(id))}?workspaceId=${encodeURIComponent(workspaceId)}`, { method: "PATCH", body: JSON.stringify({ workspaceId, mediaReference }) });
    const match = normalizeMatch(payload.match);
    cacheOne(match);
    return { match, synced: true };
  } catch (error) {
    if (cached) addToOutbox(normalizeMatch({ ...cached, ...mediaReference }));
    return { match: cached || null, synced: false, authenticated: error.status !== 401, error };
  }
}
