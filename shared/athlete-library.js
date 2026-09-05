import { getCurrentWorkspaceId } from "./cornerman-workspace.js";

export function resolveAthleteWorkspaceId(athlete, fallbackWorkspaceId = getCurrentWorkspaceId()) {
  return athlete?.workspaceId || fallbackWorkspaceId;
}

export function belongsToWorkspace(athlete, workspaceId = getCurrentWorkspaceId()) {
  return resolveAthleteWorkspaceId(athlete, workspaceId) === workspaceId;
}

export function normalizeAthleteOwnership(athlete, workspaceId = getCurrentWorkspaceId()) {
  return { ...athlete, workspaceId: resolveAthleteWorkspaceId(athlete, workspaceId) };
}

export function getAthletesForWorkspace(athletes, workspaceId = getCurrentWorkspaceId()) {
  return (Array.isArray(athletes) ? athletes : [])
    .filter(athlete => belongsToWorkspace(athlete, workspaceId))
    .map(athlete => normalizeAthleteOwnership(athlete, workspaceId));
}

