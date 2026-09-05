import {
  getMedia,
  saveMedia
} from "./media-library.js";

import {
  listMatches,
  updateMatchMedia
} from "../shared/match-repository.js";

const { escapeHtml, safeUrl } = window.CornermanSafe;

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

let currentMatches = [];

render();

/* ==========================
   DATA
========================== */

async function loadMatches() {
  const result =
    await listMatches();

  currentMatches =
    Array.isArray(result.matches)
      ? result.matches
      : [];

  return result;
}

/* ==========================
   RENDER
========================== */

async function render() {
  const media =
    getMedia();

  await loadMatches();

  populateEventFilter(media);

  const visibleMedia =
    getFilteredMedia(media);

  renderStats(media);

  renderMediaList(
    visibleMedia,
    currentMatches
  );
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
  const videoUrl =
    safeUrl(item.videoUrl);

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
          ? `<p class="muted">${escapeHtml(createdAt)}</p>`
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
        ${Number(match.pointsFor) || 0}-${Number(match.pointsAgainst) || 0}
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
async function linkMediaToMatch(mediaId) {
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

  const mediaIndex =
    media.findIndex(item =>
      String(item.id) === String(mediaId)
    );

  const match =
    currentMatches.find(item =>
      String(item.id) === String(matchId)
    );

  if (mediaIndex < 0 || !match) {
    alert("Media or match not found.");
    return;
  }

  const selectedMedia =
    media[mediaIndex];

  const attachedAt =
    new Date().toISOString();

  const result =
    await updateMatchMedia(
      match.id,
      {
        videoUrl:
          selectedMedia.videoUrl || "",
        videoHost:
          "youtube",
        videoVisibility:
          "unlisted",
        videoAttachedAt:
          attachedAt,
        videoUnlinkedAt:
          ""
      }
    );

  /*
   * Keep the local Media record aligned
   * with the Match repository.
   *
   * If backend sync failed, the repository
   * already queued the Match in its outbox.
   */
  media[mediaIndex] = {
    ...selectedMedia,
    linkedMatchId:
      String(match.id),
    linkedAthlete:
      match.athlete || "",
    linkedOpponent:
      match.opponent || "",
    linkedEvent:
      match.eventName || "",
    linkedAt:
      attachedAt,
    unlinkedAt:
      ""
  };

  saveMedia(media);

  if (!result.synced) {
    if (result.authenticated === false) {
      alert(
        "Media linked locally. Sign in to Cornerman to sync the Match."
      );
    } else {
      alert(
        "Media linked locally. Match sync is pending."
      );
    }
  }

  await render();
}

async function unlinkMedia(mediaId) {
  const media =
    getMedia();

  const mediaIndex =
    media.findIndex(item =>
      String(item.id) === String(mediaId)
    );

  if (mediaIndex < 0) return;

  const selectedMedia =
    media[mediaIndex];

  const linkedMatchId =
    selectedMedia.linkedMatchId;

  if (!linkedMatchId) return;

  const unlinkedAt =
    new Date().toISOString();

  const result =
    await updateMatchMedia(
      linkedMatchId,
      {
        videoUrl: "",
        videoHost: "",
        videoVisibility: "",
        videoAttachedAt: "",
        videoUnlinkedAt:
          unlinkedAt
      }
    );

  /*
   * Keep Media's local state aligned
   * with the repository/outbox state.
   */
  media[mediaIndex] = {
    ...selectedMedia,
    linkedMatchId: "",
    linkedAthlete: "",
    linkedOpponent: "",
    linkedEvent: "",
    linkedAt: "",
    unlinkedAt
  };

  saveMedia(media);

  if (!result.synced) {
    if (result.authenticated === false) {
      alert(
        "Media unlinked locally. Sign in to Cornerman to sync the Match."
      );
    } else {
      alert(
        "Media unlinked locally. Match sync is pending."
      );
    }
  }

  await render();
}
/* ==========================
   ACTION DELEGATION
========================== */

mediaList?.addEventListener(
  "click",
  async event => {
    const button =
      event.target.closest(
        "[data-media-action]"
      );

    if (
      !button ||
      !mediaList.contains(button)
    ) {
      return;
    }

    const mediaId =
      button.dataset.mediaId || "";

    button.disabled = true;

    try {
      if (
        button.dataset.mediaAction ===
        "link"
      ) {
        await linkMediaToMatch(
          mediaId
        );
      }

      if (
        button.dataset.mediaAction ===
        "unlink"
      ) {
        await unlinkMedia(
          mediaId
        );
      }
    } finally {
      button.disabled = false;
    }
  }
);

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