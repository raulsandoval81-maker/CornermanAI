export const DEV_WORKSPACE_KEY = "cornerman_dev_workspace";
export const LEGACY_DEV_TIER_KEY = "cornerman_dev_tier";
export const LEGACY_DEV_INTEGRATIONS_KEY = "cornerman_dev_integrations";
export const WORKSPACE_TYPES = Object.freeze(["individual", "team"]);
export const WORKSPACE_TIERS = Object.freeze(["free", "basic", "plus", "pro"]);

export const DEFAULT_DEVELOPMENT_WORKSPACE = Object.freeze({
  id: "workspace_local_owner",
  name: "CornermanAI Development",
  type: "team",
  tier: "pro",
  integrations: Object.freeze(["sandman"]),
  ownerUserId: "user_local_owner",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z"
});

function safeStorage() {
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

function normalizeIntegrations(value, fallback = []) {
  return Array.isArray(value)
    ? [...new Set(value.filter(item => typeof item === "string" && item.trim()).map(item => item.trim()))]
    : [...fallback];
}

export function normalizeWorkspace(value, fallback = DEFAULT_DEVELOPMENT_WORKSPACE) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ...fallback, integrations: [...fallback.integrations] };
  const id = typeof value.id === "string" && value.id.trim() ? value.id.trim() : fallback.id;
  const type = WORKSPACE_TYPES.includes(value.type) ? value.type : fallback.type;
  const tier = WORKSPACE_TIERS.includes(value.tier) ? value.tier : fallback.tier;
  return {
    id,
    name: typeof value.name === "string" && value.name.trim() ? value.name.trim() : fallback.name,
    type,
    tier,
    integrations: normalizeIntegrations(value.integrations, fallback.integrations),
    ownerUserId: typeof value.ownerUserId === "string" && value.ownerUserId.trim() ? value.ownerUserId.trim() : fallback.ownerUserId,
    createdAt: typeof value.createdAt === "string" && value.createdAt ? value.createdAt : fallback.createdAt,
    updatedAt: typeof value.updatedAt === "string" && value.updatedAt ? value.updatedAt : fallback.updatedAt
  };
}

function legacyWorkspace() {
  const storage = safeStorage();
  const legacyTier = storage?.getItem(LEGACY_DEV_TIER_KEY);
  let integrations = DEFAULT_DEVELOPMENT_WORKSPACE.integrations;
  try {
    const parsed = JSON.parse(storage?.getItem(LEGACY_DEV_INTEGRATIONS_KEY) || "null");
    if (Array.isArray(parsed)) integrations = parsed;
  } catch {
    // Invalid legacy development data falls back to the owner workspace.
  }
  return normalizeWorkspace({
    ...DEFAULT_DEVELOPMENT_WORKSPACE,
    tier: WORKSPACE_TIERS.includes(legacyTier) ? legacyTier : DEFAULT_DEVELOPMENT_WORKSPACE.tier,
    integrations
  });
}

export function getCurrentWorkspace() {
  const storage = safeStorage();
  const raw = storage?.getItem(DEV_WORKSPACE_KEY);
  if (!raw) return legacyWorkspace();
  try {
    return normalizeWorkspace(JSON.parse(raw), legacyWorkspace());
  } catch {
    return legacyWorkspace();
  }
}

export function setDevelopmentWorkspace(workspace) {
  const current = getCurrentWorkspace();
  const normalized = normalizeWorkspace({
    ...current,
    ...workspace,
    id: workspace?.id || current.id,
    createdAt: workspace?.createdAt || current.createdAt,
    updatedAt: new Date().toISOString()
  }, current);
  safeStorage()?.setItem(DEV_WORKSPACE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function getCurrentWorkspaceId() { return getCurrentWorkspace().id; }
export function getWorkspaceType() { return getCurrentWorkspace().type; }
export function getWorkspaceTier() { return getCurrentWorkspace().tier; }
export function getWorkspaceIntegrations() { return [...getCurrentWorkspace().integrations]; }
export function isIndividualWorkspace() { return getWorkspaceType() === "individual"; }
export function isTeamWorkspace() { return getWorkspaceType() === "team"; }

