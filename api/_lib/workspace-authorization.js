const { getSessionUser } = require("./http");

const ROLES = Object.freeze(["owner", "coach", "viewer", "parent", "athlete"]);
const LEGACY_OWNER_USER_ID = process.env.CORNERMAN_OWNER_USER_ID || "user_local_owner";
const LEGACY_WORKSPACE_ID = process.env.CORNERMAN_OWNER_WORKSPACE_ID || "workspace_local_owner";

function authorizationError(status, message) {
  return Object.assign(new Error(message), { status });
}

function validWorkspaceId(value) {
  return typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value);
}

function normalizeMembership(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (!value.id || !value.userId || !validWorkspaceId(value.workspaceId) || !ROLES.includes(value.role)) return null;
  const now = new Date().toISOString();
  return {
    id: String(value.id),
    userId: String(value.userId),
    workspaceId: String(value.workspaceId),
    role: value.role,
    createdAt: value.createdAt || now,
    updatedAt: value.updatedAt || now
  };
}

function configuredMemberships() {
  let configured = [];
  try {
    const parsed = JSON.parse(process.env.CORNERMAN_WORKSPACE_MEMBERSHIPS_JSON || "[]");
    if (Array.isArray(parsed)) configured = parsed.map(normalizeMembership).filter(Boolean);
  } catch {
    configured = [];
  }
  const ownerMembership = normalizeMembership({
    id: "membership_local_owner",
    userId: LEGACY_OWNER_USER_ID,
    workspaceId: LEGACY_WORKSPACE_ID,
    role: "owner",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  });
  if (!configured.some(item => item.userId === ownerMembership.userId && item.workspaceId === ownerMembership.workspaceId)) {
    configured.push(ownerMembership);
  }
  return configured;
}

function getMembershipForUserWorkspace(userId, workspaceId, memberships = configuredMemberships()) {
  return memberships.find(item => item.userId === String(userId) && item.workspaceId === String(workspaceId)) || null;
}

function getWorkspacesForUser(userId, memberships = configuredMemberships()) {
  return memberships.filter(item => item.userId === String(userId)).map(item => item.workspaceId);
}

function isWorkspaceMember(userId, workspaceId, memberships = configuredMemberships()) {
  return Boolean(getMembershipForUserWorkspace(userId, workspaceId, memberships));
}

function requireWorkspaceMembership(userId, workspaceId, memberships = configuredMemberships()) {
  if (!validWorkspaceId(workspaceId)) throw authorizationError(400, "A valid workspaceId is required.");
  const membership = getMembershipForUserWorkspace(userId, workspaceId, memberships);
  if (!membership) throw authorizationError(403, "Workspace access denied.");
  return membership;
}

function requireWorkspaceAccess(request, workspaceId, memberships = configuredMemberships()) {
  const session = getSessionUser(request);
  if (!session) throw authorizationError(401, "Authentication required.");
  const membership = requireWorkspaceMembership(session.userId, workspaceId, memberships);
  return { userId: session.userId, workspaceId: membership.workspaceId, membership };
}

function canMembershipPerform(membership, _action) {
  return Boolean(membership && ROLES.includes(membership.role));
}

function resolveMatchWorkspaceId(match) {
  return validWorkspaceId(match?.workspaceId) ? match.workspaceId : LEGACY_WORKSPACE_ID;
}

module.exports = {
  LEGACY_OWNER_USER_ID,
  LEGACY_WORKSPACE_ID,
  ROLES,
  canMembershipPerform,
  configuredMemberships,
  getMembershipForUserWorkspace,
  getWorkspacesForUser,
  isWorkspaceMember,
  normalizeMembership,
  requireWorkspaceAccess,
  requireWorkspaceMembership,
  resolveMatchWorkspaceId,
  validWorkspaceId
};
