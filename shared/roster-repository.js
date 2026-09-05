import { canUse } from "./cornerman-entitlements.js";
import { getCurrentWorkspaceId } from "./cornerman-workspace.js";
import { getTournamentRoster } from "../data/tournament-roster.js";
export function localRosterEntries() { return getTournamentRoster().map(entry => ({ ...entry, sourceSystem: "cornerman" })); }
export async function listRoster({ workspaceId = getCurrentWorkspaceId() } = {}) {
  if (!canUse("sandman_handoff")) return { athletes: localRosterEntries(), source: "cornerman" };
  try {
    const response = await fetch(`/api/sandman-roster?workspaceId=${encodeURIComponent(workspaceId)}`, { credentials: "same-origin" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(payload.error || "Roster unavailable."), { status: response.status });
    return { athletes: payload.athletes || [], source: "sandman" };
  } catch (error) { return { athletes: localRosterEntries(), source: "cornerman-fallback", error }; }
}
