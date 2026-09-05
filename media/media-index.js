import {
  getMedia,
  saveMedia
} from "./media-library.js";
const { escapeHtml, safeUrl } = window.CornermanSafe;

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

/* ==========================
   DATA
========================== */

function getMatches() {
  return JSON.parse(
    localStorage.getItem(MATCH_STORAGE_KEY) || "[]"
  );
}

/* ==========================
   RENDER
========================== */

function render() {
  const media =
    getMedia();

  const matches =
    getMatches();

  populateEventFilter(media);

  const visibleMedia =
    getFilteredMedia(media);

  renderStats(media);
  renderMediaList(visibleMedia, matches);
}

function getFilteredMedia(media) {
  const query =
    (mediaSearch?.value || "")
      .toLowerCase()
      .trim();

  const selectedEvent =
    mediaEventFilter?.value || "";

  const selectedStatus =
    mediaStatusFilter?.value || "all";

  return media.filter(item => {
    const searchText =
      [
        item.title,
        item.videoUrl,
        item.linkedMatchId,
        item.linkedAthlete,
        item.linkedOpponent,
        item.linkedEvent
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    const matchesSearch =
      !query ||
      searchText.includes(query);

    const matchesEvent =
      !selectedEvent ||
      item.linkedEvent === selectedEvent;

    const matchesStatus =
      selectedStatus === "all" ||
      (
        selectedStatus === "linked" &&
        item.linkedMatchId
      ) ||
      (
        selectedStatus === "unlinked" &&
        !item.linkedMatchId
      );

    return (
      matchesSearch &&
      matchesEvent &&
      matchesStatus
    );
  });
}

function renderStats(media) {
  if (!mediaStats) return;

  const linked =
    media.filter(item =>
      item.linkedMatchId
    ).length;

  const unlinked =
    media.length - linked;

  mediaStats.innerHTML = `
    <p>Total Media: ${media.length}</p>
    <p>Linked: ${linked}</p>
    <p>Unlinked: ${unlinked}</p>
  `;
}

function renderMediaList(media, matches) {
  if (!mediaList) return;

  if (!media.length) {
    mediaList.innerHTML =
      "<p>No media found.</p>";
    return;
  }

  mediaList.innerHTML =
    media
      .map(item =>
        renderMediaRow(item, matches)
      )
      .join("");
}

function renderMediaRow(item, matches) {
  const videoUrl = safeUrl(item.videoUrl);
  const createdAt =
    item.createdAt
      ? new Date(item.createdAt).toLocaleString()
      : "";

  return `
    <div class="media-row">

      <strong>
        ${escapeHtml(item.title || "Untitled Video")}
      </strong>

      ${
        videoUrl
          ? `
            <p class="muted">
              ${escapeHtml(videoUrl)}
            </p>

            <a
              href="${escapeHtml(videoUrl)}"
              target="_blank"
              rel="noopener"
            >
              Watch Video
            </a>
          `
          : `
            <p class="muted">
              No video URL
            </p>
          `
      }

      ${renderLinkedStatus(item)}

      ${
        createdAt
          ? `<p class="muted">${createdAt}</p>`
          : ""
      }

      ${renderMediaActions(item, matches)}

    </div>
  `;
}

function renderLinkedStatus(item) {
  if (!item.linkedMatchId) {
    return `
      <p class="muted">
        Unlinked
      </p>
    `;
  }

  return `
    <p>
      <strong>Linked Match:</strong>
      ${escapeHtml(item.linkedAthlete || "Athlete")}
      vs
      ${escapeHtml(item.linkedOpponent || "Opponent")}
    </p>

    <p>
      <strong>Event:</strong>
      ${escapeHtml(item.linkedEvent || "—")}
    </p>
  `;
}

function renderMediaActions(item, matches) {
  if (item.linkedMatchId) {
    return `
      <div class="media-actions">

        <a
          href="../history/match-detail.html?id=${encodeURIComponent(String(item.linkedMatchId))}"
        >
          Open Match
        </a>

        <button
          type="button"
          data-media-action="unlink"
          data-media-id="${escapeHtml(item.id)}"
        >
          Unlink
        </button>

      </div>
    `;
  }

  return `
    <div class="media-actions">

      <select id="matchSelect-${escapeHtml(item.id)}">
        <option value="">
          Select Match
        </option>

        ${renderMatchOptions(matches)}
      </select>

      <button
        type="button"
        data-media-action="link"
        data-media-id="${escapeHtml(item.id)}"
      >
        Link To Match
      </button>

    </div>
  `;
}

function renderMatchOptions(matches) {
  return matches
    .map(match => `
      <option value="${escapeHtml(match.id)}">
        ${escapeHtml(match.athlete || "Athlete")}
        vs
        ${escapeHtml(match.opponent || "Opponent")}
        —
        ${escapeHtml(match.eventName || "No Event")}
        —
        ${escapeHtml(match.result || "Result")}
        ${match.pointsFor || 0}-${match.pointsAgainst || 0}
      </option>
    `)
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
        <option value="${escapeHtml(event)}">
          ${escapeHtml(event)}
        </option>
      `)
      .join("")
    }
  `;

  mediaEventFilter.value =
    currentValue;
}

/* ==========================
   ACTIONS
========================== */

window.linkMediaToMatch =
  function linkMediaToMatch(mediaId) {
    const matchId =
      document
        .getElementById(`matchSelect-${mediaId}`)
        ?.value || "";

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

    const match =
      matches[matchIndex];

    const selectedMedia =
      media[mediaIndex];

    media[mediaIndex] = {
      ...selectedMedia,
      linkedMatchId: String(match.id),
      linkedAthlete: match.athlete || "",
      linkedOpponent: match.opponent || "",
      linkedEvent: match.eventName || "",
      linkedAt: new Date().toISOString()
    };

    matches[matchIndex] = {
      ...match,
      videoUrl: selectedMedia.videoUrl || "",
      videoHost: "youtube",
      videoVisibility: "unlisted",
      videoAttachedAt: new Date().toISOString()
    };

    saveMedia(media);
    saveMatches(matches);

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
      linkedAthlete: "",
      linkedOpponent: "",
      linkedEvent: "",
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

        saveMatches(matches);
      }
    }

    saveMedia(media);

    render();
  };

function saveMatches(matches) {
  localStorage.setItem(
    MATCH_STORAGE_KEY,
    JSON.stringify(matches)
  );
}

mediaList?.addEventListener("click", event => {
  const button = event.target.closest("[data-media-action]");
  if (!button || !mediaList.contains(button)) return;

  const mediaId = button.dataset.mediaId || "";
  if (button.dataset.mediaAction === "link") window.linkMediaToMatch(mediaId);
  if (button.dataset.mediaAction === "unlink") window.unlinkMedia(mediaId);
});

/* ==========================
   EVENTS
========================== */

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
