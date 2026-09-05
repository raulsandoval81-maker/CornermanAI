import test from "node:test";
import assert from "node:assert/strict";

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

globalThis.localStorage = new MemoryStorage();

const workspace = await import("../shared/cornerman-workspace.js");
const entitlements = await import("../shared/cornerman-entitlements.js");
const athleteLibrary = await import("../shared/athlete-library.js");
const repository = await import("../shared/match-repository.js");

function resetStorage() { globalThis.localStorage.clear(); }

test("default and invalid workspaces resolve to the stable owner workspace", () => {
  resetStorage();
  const fallback = workspace.getCurrentWorkspace();
  assert.equal(fallback.id, "workspace_local_owner");
  assert.equal(fallback.type, "team");
  assert.equal(fallback.tier, "pro");
  assert.deepEqual(fallback.integrations, ["sandman"]);
  assert.equal(workspace.normalizeWorkspace({ type: "sandman" }).type, "team");
  assert.equal(workspace.WORKSPACE_TYPES.includes("sandman"), false);
});

test("individual and team workspace helpers remain ownership concepts", () => {
  resetStorage();
  workspace.setDevelopmentWorkspace({ id: "workspace_parent", name: "Parent", type: "individual", tier: "basic", integrations: [] });
  assert.equal(workspace.isIndividualWorkspace(), true);
  assert.equal(workspace.isTeamWorkspace(), false);
  assert.equal(workspace.getWorkspaceTier(), "basic");
  assert.deepEqual(workspace.getWorkspaceIntegrations(), []);

  workspace.setDevelopmentWorkspace({ id: "workspace_team", name: "Team", type: "team", tier: "plus" });
  assert.equal(workspace.isTeamWorkspace(), true);
});

test("workspace is authoritative with legacy tier and integration fallback", () => {
  resetStorage();
  localStorage.setItem("cornerman_dev_tier", "basic");
  localStorage.setItem("cornerman_dev_integrations", "[]");
  assert.equal(entitlements.getCurrentTier(), "basic");
  assert.deepEqual(entitlements.getCurrentIntegrations(), []);

  workspace.setDevelopmentWorkspace({ tier: "pro", integrations: ["sandman"] });
  localStorage.setItem("cornerman_dev_tier", "free");
  assert.equal(entitlements.getCurrentTier(), "pro");
  assert.equal(entitlements.hasIntegration("sandman"), true);
});

test("athlete libraries resolve legacy ownership without rewriting records", () => {
  resetStorage();
  workspace.setDevelopmentWorkspace({ id: "workspace_a", type: "individual", tier: "free" });
  const legacy = { id: "athlete_legacy", name: "Legacy Athlete" };
  const other = { id: "athlete_b", name: "Other", workspaceId: "workspace_b" };
  assert.equal(athleteLibrary.belongsToWorkspace(legacy, "workspace_a"), true);
  assert.deepEqual(athleteLibrary.getAthletesForWorkspace([legacy, other], "workspace_a"), [
    { ...legacy, workspaceId: "workspace_a" }
  ]);
  assert.equal("workspaceId" in legacy, false);
});

test("new and legacy Matches normalize to the current workspace", () => {
  resetStorage();
  workspace.setDevelopmentWorkspace({ id: "workspace_a", type: "individual", tier: "free" });
  assert.equal(repository.normalizeMatch({ id: "new_match" }).workspaceId, "workspace_a");
  const legacy = repository.normalizeMatch({ id: "legacy_match", athlete: "A" }, { migrating: true });
  assert.equal(legacy.workspaceId, "workspace_a");
  assert.equal(legacy.legacyId, "legacy_match");
});

test("workspace-scoped Match listing isolates Free library counts", async () => {
  resetStorage();
  workspace.setDevelopmentWorkspace({ id: "workspace_a", type: "individual", tier: "free" });
  localStorage.setItem(repository.MATCH_MIGRATION_KEY, "complete");
  localStorage.setItem(repository.MATCH_CACHE_KEY, JSON.stringify([
    { id: "a1", workspaceId: "workspace_a" },
    { id: "a2", workspaceId: "workspace_a" },
    { id: "a3", workspaceId: "workspace_a" },
    { id: "b1", workspaceId: "workspace_b" }
  ]));
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("offline"); };
  try {
    const a = await repository.listMatches({ workspaceId: "workspace_a" });
    const b = await repository.listMatchesForWorkspace("workspace_b");
    assert.equal(a.matches.length, 3);
    assert.equal(b.matches.length, 1);
    assert.equal(entitlements.canSaveNewMatch(a.matches.length, "free"), false);
    assert.equal(entitlements.canSaveNewMatch(b.matches.length, "free"), true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("athlete limits continue to come from workspace tier entitlements", () => {
  resetStorage();
  workspace.setDevelopmentWorkspace({ type: "individual", tier: "free" });
  assert.equal(entitlements.getLimit("athletes"), 1);
  workspace.setDevelopmentWorkspace({ type: "team", tier: "plus" });
  assert.equal(entitlements.getLimit("athletes"), null);
});

