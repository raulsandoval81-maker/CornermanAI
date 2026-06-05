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

const mediaSearch =
  document.getElementById("mediaSearch");

const mediaEventFilter =
  document.getElementById("mediaEventFilter");

const mediaStatusFilter =
  document.getElementById("mediaStatusFilter");

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

  populateEventFilter(media);

  const query =
    (mediaSearch?.value || "")
      .toLowerCase()
      .trim();

  const selectedEvent =
    mediaEventFilter?.value || "";

  const status =
    mediaStatusFilter?.value || "all";

  const visibleMedia =
    media.filter(item => {
      const searchText =
        `
          ${item.title || ""}
          ${item.videoUrl || ""}
          ${item.linkedMatchId || ""}
          ${item.linkedAthlete || ""}
          ${item.linkedOpponent || ""}
          ${item.linkedEvent || ""}
        `
          .toLowerCase();

      const searchMatch =
        !query ||
        searchText.includes(query);

      const eventMatch =
        !selectedEvent ||
        item.linkedEvent === selectedEvent;

      const statusMatch =
        status === "all" ||
        (
          status === "linked" &&
          item.linkedMatchId
        ) ||
        (
          status === "unlinked" &&
          !item.linkedMatchId
        );

      return (
        searchMatch &&
        eventMatch &&
        statusMatch
      );
    });

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

  if (!visibleMedia.length) {
    mediaList.innerHTML =
      "<p>No media found.</p>";
    return;
  }

  mediaList.innerHTML =
    visibleMedia
      .map(item => {
        const matchOptions =
          matches
            .map(match => `
              <option value="${match.id}">
                ${match.athlete} vs ${match.opponent}
                — ${match.eventName || "No Event"}
                — ${match.result || "Result"}
                ${match.pointsFor || 0}-${match.pointsAgainst || 0}
              </option>
            `)
            .join("");

        const linkedLabel =
          item.linkedMatchId
            ? `
              <p>
                <strong>Linked Match:</strong>
                ${item.linkedAthlete || "Athlete"}
                vs
                ${item.linkedOpponent || "Opponent"}
              </p>

              <p>
                <strong>Event:</strong>
                ${item.linkedEvent || "—"}
              </p>

              <p>
                <strong>Match ID:</strong>
                ${item.linkedMatchId}
              </p>
            `
            : `
              <p>
                Unlinked
              </p>
            `;

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
                  <option value="">
                    Select Match
                  </option>

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

            ${linkedLabel}

            <p>
              ${
                item.createdAt
                  ? new Date(
                      item.createdAt
                    ).toLocaleString()
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

function populateEventFilter(media) {
  if (!mediaEventFilter) return;

  const currentValue =
    mediaEventFilter.value;

  const events =
    [
      ...new Set(
        media
          .map(item => item.linkedEvent)
          .filter(Boolean)
      )
    ];

  mediaEventFilter.innerHTML = `
    <option value="">
      All Events
    </option>

    ${events
      .map(event => `
        <option value="${event}">
          ${event}
        </option>
      `)
      .join("")
    }
  `;

  mediaEventFilter.value =
    currentValue;
}

window.linkMediaToMatch =
  function linkMediaToMatch(mediaId) {
    const select =
      document.getElementById(
        `matchSelect-${mediaId}`
      );

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
        String(item.id) ===
        String(mediaId)
      );

    const matchIndex =
      matches.findIndex(match =>
        String(match.id) ===
        String(matchId)
      );

    if (
      mediaIndex < 0 ||
      matchIndex < 0
    ) {
      alert(
        "Media or match not found."
      );
      return;
    }

    const match =
      matches[matchIndex];

    media[mediaIndex] = {
      ...media[mediaIndex],
      linkedMatchId: matchId,
      linkedAthlete: match.athlete || "",
      linkedOpponent: match.opponent || "",
      linkedEvent: match.eventName || "",
      linkedAt:
        new Date().toISOString()
    };

    matches[matchIndex] = {
      ...matches[matchIndex],
      videoUrl:
        media[mediaIndex].videoUrl,
      videoHost: "youtube",
      videoVisibility: "unlisted",
      videoAttachedAt:
        new Date().toISOString()
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
        String(item.id) ===
        String(mediaId)
      );

    if (mediaIndex < 0) {
      return;
    }

    const linkedMatchId =
      media[mediaIndex]
        .linkedMatchId;

    media[mediaIndex] = {
      ...media[mediaIndex],
      linkedMatchId: "",
      linkedAthlete: "",
      linkedOpponent: "",
      linkedEvent: "",
      unlinkedAt:
        new Date().toISOString()
    };

    if (linkedMatchId) {
      const matchIndex =
        matches.findIndex(match =>
          String(match.id) ===
          String(linkedMatchId)
        );

      if (matchIndex >= 0) {
        matches[matchIndex] = {
          ...matches[matchIndex],
          videoUrl: "",
          videoHost: "",
          videoVisibility: "",
          videoAttachedAt: "",
          videoUnlinkedAt:
            new Date().toISOString()
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

mediaSearch?.addEventListener(
  "input",
  render
);

mediaEventFilter?.addEventListener(
  "change",
  render
);

mediaStatusFilter?.addEventListener(
  "change",
  render
);