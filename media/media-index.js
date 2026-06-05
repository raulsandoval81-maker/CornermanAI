import {
  getMedia,
  saveMedia
}
from "./media-library.js";

const MATCH_STORAGE_KEY =
  "cornerman_matches";

const mediaList =
  document.getElementById("mediaList");

const mediaStats =
  document.getElementById("mediaStats");

render();

function getMatches() {
  return JSON.parse(
    localStorage.getItem(MATCH_STORAGE_KEY) || "[]"
  );
}

function render() {
  const media =
    getMedia();

  const matches =
    getMatches();

  const linkedCount =
    media.filter(item =>
      item.linkedMatchId
    ).length;

  const unlinkedCount =
    media.length - linkedCount;

  mediaStats.innerHTML = `
    <p>Total Media: ${media.length}</p>
    <p>Linked: ${linkedCount}</p>
    <p>Unlinked: ${unlinkedCount}</p>
  `;

  if (!media.length) {
    mediaList.innerHTML =
      "<p>No media yet.</p>";
    return;
  }

  mediaList.innerHTML =
    media
      .map(item => {
        const matchOptions =
          matches
            .map(match => `
              <option value="${match.id}">
                ${match.athlete} vs ${match.opponent}
                — ${match.result || "Result"}
                ${match.pointsFor || 0}-${match.pointsAgainst || 0}
              </option>
            `)
            .join("");

        const linkedControls =
          item.linkedMatchId
            ? `
              <div class="media-actions">
                <a
                  href="../history/match-detail.html?id=${item.linkedMatchId}"
                >
                  Open Linked Match
                </a>

                <button
                  type="button"
                  onclick="unlinkMedia('${item.id}')"
                >
                  Unlink
                </button>
              </div>
            `
            : `
              <div class="media-actions">
                <select id="matchSelect-${item.id}">
                  <option value="">Select Match</option>
                  ${matchOptions}
                </select>

                <button
                  type="button"
                  onclick="linkMediaToMatch('${item.id}')"
                >
                  Link Media To Match
                </button>
              </div>
            `;

        return `
          <div class="media-row">

            <strong>
              ${item.title || "Untitled Video"}
            </strong>

            <p>
              ${item.videoUrl || ""}
            </p>

            <p>
              ${
                item.linkedMatchId
                  ? `Linked Match: ${item.linkedMatchId}`
                  : "Unlinked"
              }
            </p>

            <p>
              ${
                item.createdAt
                  ? new Date(item.createdAt).toLocaleString()
                  : ""
              }
            </p>

            ${
              item.videoUrl
                ? `
                  <a
                    href="${item.videoUrl}"
                    target="_blank"
                    rel="noopener"
                  >
                    🎥 Watch Video
                  </a>
                `
                : ""
            }

            ${linkedControls}

          </div>
        `;
      })
      .join("");
}

window.linkMediaToMatch =
  function linkMediaToMatch(mediaId) {
    const select =
      document.getElementById(`matchSelect-${mediaId}`);

    const matchId =
      select?.value || "";

    if (!matchId) {
      alert("Select a match first.");
      return;
    }

    const media =
      getMedia();

    const matches =
      getMatches();

    const mediaIndex =
      media.findIndex(item =>
        String(item.id) === String(mediaId)
      );

    const matchIndex =
      matches.findIndex(match =>
        String(match.id) === String(matchId)
      );

    if (mediaIndex < 0 || matchIndex < 0) {
      alert("Media or match not found.");
      return;
    }

    media[mediaIndex] = {
      ...media[mediaIndex],
      linkedMatchId: matchId,
      linkedAt: new Date().toISOString()
    };

    matches[matchIndex] = {
      ...matches[matchIndex],
      videoUrl: media[mediaIndex].videoUrl,
      videoHost: "youtube",
      videoVisibility: "unlisted",
      videoAttachedAt: new Date().toISOString()
    };

    saveMedia(media);

    localStorage.setItem(
      MATCH_STORAGE_KEY,
      JSON.stringify(matches)
    );

    render();
  };

window.unlinkMedia =
  function unlinkMedia(mediaId) {
    const media =
      getMedia();

    const matches =
      getMatches();

    const mediaIndex =
      media.findIndex(item =>
        String(item.id) === String(mediaId)
      );

    if (mediaIndex < 0) return;

    const linkedMatchId =
      media[mediaIndex].linkedMatchId;

    media[mediaIndex] = {
      ...media[mediaIndex],
      linkedMatchId: "",
      unlinkedAt: new Date().toISOString()
    };

    if (linkedMatchId) {
      const matchIndex =
        matches.findIndex(match =>
          String(match.id) === String(linkedMatchId)
        );

      if (matchIndex >= 0) {
        matches[matchIndex] = {
          ...matches[matchIndex],
          videoUrl: "",
          videoHost: "",
          videoVisibility: "",
          videoAttachedAt: "",
          videoUnlinkedAt: new Date().toISOString()
        };

        localStorage.setItem(
          MATCH_STORAGE_KEY,
          JSON.stringify(matches)
        );
      }
    }

    saveMedia(media);

    render();
  };