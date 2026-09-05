const {
  json,
  readJson,
  getSessionUser
} = require("../_lib/http");

const {
  normalizeMatch
} = require("../_lib/match");

const {
  listStoredMatches,
  writeStoredMatches
} = require("../_lib/store");

const {
  requireWorkspaceAccess,
  resolveMatchWorkspaceId
} = require("../_lib/workspace-authorization");

module.exports = async function handler(
  request,
  response
) {

  try {

    if (!getSessionUser(request)) {
      return json(response, 401, { error: "Authentication required." });
    }

    const workspaceId = request.query?.workspaceId;
    requireWorkspaceAccess(request, workspaceId);

    const id =
      String(request.query.id || "");

    const matches =
      await listStoredMatches();

    const index =
      matches.findIndex(
        item =>
          String(item.id) === id &&
          resolveMatchWorkspaceId(item) === workspaceId
      );

    if (index < 0) {
      return json(
        response,
        404,
        {
          error: "Match not found."
        }
      );
    }

    if (request.method === "GET") {
      return json(
        response,
        200,
        {
          match: matches[index]
        }
      );
    }

    if (request.method !== "PATCH") {
      return json(
        response,
        405,
        {
          error: "Method not allowed."
        }
      );
    }

    const body =
      await readJson(
        request,
        64 * 1024
      );

    if (body.workspaceId && body.workspaceId !== workspaceId) {
      return json(response, 403, { error: "Match workspace cannot be changed." });
    }

    if (body.match?.workspaceId && body.match.workspaceId !== workspaceId) {
      return json(response, 403, { error: "Match workspace cannot be changed." });
    }

    if (body.mediaReference?.workspaceId && body.mediaReference.workspaceId !== workspaceId) {
      return json(response, 403, { error: "Match workspace cannot be changed." });
    }

    const existing =
      matches[index];

    const mediaReference =
      body.mediaReference || {};

    const updated =
      normalizeMatch({
        ...existing,

        workspaceId,

        videoUrl:
          mediaReference.videoUrl ??
          body.videoUrl ??
          existing.videoUrl,

        videoHost:
          mediaReference.videoHost ??
          existing.videoHost,

        videoVisibility:
          mediaReference.videoVisibility ??
          existing.videoVisibility,

        videoAttachedAt:
          mediaReference.videoAttachedAt ??
          existing.videoAttachedAt,

        videoUnlinkedAt:
          mediaReference.videoUnlinkedAt ??
          existing.videoUnlinkedAt
      });

    /*
     * A PATCH must never create a new
     * Match identity or reset the original
     * creation timestamp.
     */
    updated.id =
      existing.id;

    updated.createdAt =
      existing.createdAt;

    /*
     * The server owns updatedAt.
     */
    updated.updatedAt =
      new Date().toISOString();

    matches[index] =
      updated;

    await writeStoredMatches(
      matches
    );

    return json(
      response,
      200,
      {
        match: updated
      }
    );

  } catch (error) {

    return json(
      response,
      error.status || 503,
      {
        error:
          error.status
            ? error.message
            : "Match persistence is unavailable."
      }
    );

  }

};
