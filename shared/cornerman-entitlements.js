import {
  LEGACY_DEV_INTEGRATIONS_KEY as DEV_INTEGRATIONS_KEY,
  LEGACY_DEV_TIER_KEY as DEV_TIER_KEY,
  getWorkspaceIntegrations,
  getWorkspaceTier,
  setDevelopmentWorkspace
} from "./cornerman-workspace.js";
const PUBLIC_TIERS = Object.freeze(["free", "basic", "plus", "pro"]);

const FEATURE_MINIMUM_TIER = Object.freeze({
  match_capture: "free",
  match_history: "free",
  match_detail: "free",
  athlete_dashboard: "free",
  media_review: "free",
  media_library: "basic",
  reports: "basic",
  team_dashboard: "plus",
  tournament_manager: "plus",
  roster: "plus",
  recon_capture: "plus",
  opponent_dashboard: "plus",
  competition_trends: "plus",
  recommendations: "plus",
  advanced_reports: "pro",
  advanced_scouting: "pro",
  exports: "pro",
  ai_athlete_feedback: "pro",
  ai_team_feedback: "pro",
  sandman_handoff: "pro"
});

const TIER_LIMITS = Object.freeze({
  free: Object.freeze({ athletes: 1, savedMatches: 3 }),
  basic: Object.freeze({ athletes: 1, savedMatches: null }),
  plus: Object.freeze({ athletes: null, savedMatches: null }),
  pro: Object.freeze({ athletes: null, savedMatches: null })
});

const ROUTE_FEATURE_MAP = Object.freeze({
  "console/match-launch.html": "match_capture",
  "console/compact-console.modular.html": "match_capture",
  "console/classic-console.modular.html": "match_capture",
  "console/overlay-console.modular.html": "match_capture",
  "history/match-history.html": "match_history",
  "history/match-detail.html": "match_detail",
  "athletes/athlete-dashboard.html": "athlete_dashboard",
  "events/team-dashboard.html": "team_dashboard",
  "tournament/tournament-manager.html": "tournament_manager",
  "roster/athlete-stat-log.html": "roster",
  "recon/recon-notes.html": "recon_capture",
  "opponents/opponent-dashboard.html": "opponent_dashboard",
  "patterns/index.html": "competition_trends",
  "recon/index.html": "recommendations",
  "media/live/index.html": "media_review",
  "media/live/viewer.html": "media_review",
  "media/media-index.html": "media_library",
  "reports/index.html": "reports",
  "reports/athlete-feedback/index.html": "advanced_reports",
  "bridge/match-import.html": "sandman_handoff"
});

const TIER_INDEX = Object.freeze(Object.fromEntries(PUBLIC_TIERS.map((tier, index) => [tier, index])));

function safeStorage() {
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

export function normalizeTier(value) {
  return PUBLIC_TIERS.includes(value) ? value : "pro";
}

export function getCurrentTier() {
  return normalizeTier(getWorkspaceTier());
}

export function setDevelopmentTier(tier) {
  const normalized = normalizeTier(tier);
  setDevelopmentWorkspace({ tier: normalized });
  safeStorage()?.setItem(DEV_TIER_KEY, normalized);
  return normalized;
}

export function getCurrentIntegrations() {
  return getWorkspaceIntegrations();
}

export function hasIntegration(integrationKey) {
  return getCurrentIntegrations().includes(integrationKey);
}

export function canTierUse(tier, featureKey, integrations = []) {
  const currentTier = normalizeTier(tier);
  const requiredTier = FEATURE_MINIMUM_TIER[featureKey];
  if (!requiredTier || TIER_INDEX[currentTier] < TIER_INDEX[requiredTier]) return false;
  if (featureKey === "sandman_handoff") return integrations.includes("sandman");
  return true;
}

export function canUse(featureKey) {
  return canTierUse(getCurrentTier(), featureKey, getCurrentIntegrations());
}

export function getLimit(limitKey, tier = getCurrentTier()) {
  return TIER_LIMITS[normalizeTier(tier)][limitKey] ?? null;
}

export function getCurrentEntitlements() {
  const tier = getCurrentTier();
  const integrations = getCurrentIntegrations();
  return {
    tier,
    features: Object.keys(FEATURE_MINIMUM_TIER).filter(feature => canTierUse(tier, feature, integrations)),
    limits: { ...TIER_LIMITS[tier] },
    integrations: [...integrations]
  };
}

export function getFeatureForRoute(pathname) {
  const normalized = String(pathname || "")
    .split(/[?#]/)[0]
    .replace(/^\/+/, "")
    .replace(/\/$/, "/index.html");
  return ROUTE_FEATURE_MAP[normalized] || null;
}

export function getRequiredTier(featureKey) {
  return FEATURE_MINIMUM_TIER[featureKey] || null;
}

export function canSaveNewMatch(matchCount, tier = getCurrentTier()) {
  const limit = getLimit("savedMatches", tier);
  return limit == null || Number(matchCount) < limit;
}

export {
  DEV_INTEGRATIONS_KEY,
  DEV_TIER_KEY,
  FEATURE_MINIMUM_TIER,
  PUBLIC_TIERS,
  ROUTE_FEATURE_MAP,
  TIER_LIMITS
};
