const STORAGE_KEY =
  "cornerman_matches";
const { escapeHtml, safeUrl } = window.CornermanSafe;

const RECENT_LIMIT =
  12;

const historyList =
  document.getElementById("historyList");

const historyStats =
  document.getElementById("historyStats");

const historySearch =
  document.getElementById("historySearch");

const eventFilter =
  document.getElementById("eventFilter");

const videoFilter =
  document.getElementById("videoFilter");

let showAll =
  false;

loadHistory();

function getMatches() {
  return JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );
}

function loadHistory() {
  const matches =
    getMatches();

  populateEventFilter(matches);
  render(matches);
}

function populateEventFilter(matches) {
  if (!eventFilter) return;

  const currentValue =
    eventFilter.value;

  const events =
    [...new Set(
      matches
        .map(match => match.eventName)
        .filter(Boolean)
    )];

  eventFilter.innerHTML = `
    <option value="">All Events</option>
    ${events
      .map(event => `
        <option value="${escapeHtml(event)}">
          ${escapeHtml(event)}
        </option>
      `)
      .join("")
    }
  `;

  eventFilter.value =
    currentValue;
}

function getFilteredMatches(matches) {
  const query =
    (historySearch?.value || "")
      .toLowerCase()
      .trim();

  const selectedEvent =
    eventFilter?.value || "";

  const selectedVideo =
    videoFilter?.value || "all";

  return matches.filter(match => {
    const nameText =
      `${match.athlete || ""} ${match.opponent || ""}`
        .toLowerCase();

    const nameMatch =
      !query || nameText.includes(query);

    const eventMatch =
      !selectedEvent ||
      match.eventName === selectedEvent;

    const videoMatch =
      selectedVideo === "all" ||
      (
        selectedVideo === "withVideo" &&
        match.videoUrl
      ) ||
      (
        selectedVideo === "needsVideo" &&
        !match.videoUrl
      );

    return nameMatch && eventMatch && videoMatch;
  });
}

function render(matches) {
  if (!historyList) return;

  const filteredMatches =
    getFilteredMatches(matches);

  const visibleMatches =
    showAll
      ? filteredMatches
      : filteredMatches.slice(0, RECENT_LIMIT);

  if (historyStats) {
    historyStats.innerHTML = `
      <strong>${filteredMatches.length}</strong>
      match${filteredMatches.length === 1 ? "" : "es"}
    `;
  }

  if (!visibleMatches.length) {
    historyList.innerHTML = `
      <p class="muted">
        No matches found.
      </p>
    `;
    return;
  }

  historyList.innerHTML =
    visibleMatches
      .slice()
      .reverse()
      .map(renderMatchRow)
      .join("");
}

function renderDetailedMatchRow(match) {
  const videoUrl = safeUrl(match.videoUrl);
  const videoButton =
    videoUrl
      ? `
        <a
          href="${escapeHtml(videoUrl)}"
          target="_blank"
          rel="noopener"
        >
          Watch Video
        </a>
      `
      : `
        <span class="muted">
          Needs Video
        </span>
      `;

  const eventName =
    match.eventName || "Practice";

  const weight =
    match.weightClass || "—";

  const savedDate =
    match.savedAt
      ? new Date(match.savedAt).toLocaleDateString()
      : "";

  return `
    <div class="match-row">

      <div>
        <strong>
          ${escapeHtml(match.athlete || "Green Wrestler")}
          vs
          ${escapeHtml(match.opponent || "Red Wrestler")}
        </strong>

        <p>
          ${escapeHtml(eventName)}
          ·
          ${escapeHtml(weight)}
          ${savedDate ? `· ${escapeHtml(savedDate)}` : ""}
        </p>
      </div>

      <div>
        <p>
          ${escapeHtml(match.result || "Result")}
          by
          ${escapeHtml(match.method || "Decision")}
        </p>

        <p>
          ${match.pointsFor || 0}
          -
          ${match.pointsAgainst || 0}
        </p>
      </div>

      <div class="match-row-actions">
        <a href="./match-detail.html?id=${encodeURIComponent(String(match.id ?? ""))}">
          Open Match
        </a>

        ${videoButton}
      </div>

    </div>
  `;
}
function renderMatchRow(match) {
  const videoButton =
    safeUrl(match.videoUrl)
      ? `
        <a
          href="${escapeHtml(safeUrl(match.videoUrl))}"
          target="_blank"
          rel="noopener"
        >
          🎥 Watch Video
        </a>
      `
      : `
        <span class="muted">
          No video
        </span>
      `;

  return `
    <div class="match-row">

      <strong>
        ${escapeHtml(match.athlete)}
      </strong>

      <p>
        vs ${escapeHtml(match.opponent)}
      </p>

      <p>
        ${escapeHtml(match.result || "Result")}
        by
        ${escapeHtml(match.method || "Decision")}
      </p>

      <p>
        ${match.pointsFor || 0}
        -
        ${match.pointsAgainst || 0}
      </p>

      <a
        href="./match-detail.html?id=${encodeURIComponent(String(match.id ?? ""))}"
      >
        Open Match
      </a>

      ${videoButton}

    </div>
  `;
}

window.showAllMatches =
  function showAllMatches() {
    showAll = true;
    render(getMatches());
  };

historySearch?.addEventListener("input", () => {
  showAll = true;
  render(getMatches());
});

eventFilter?.addEventListener("change", () => {
  showAll = true;
  render(getMatches());
});

videoFilter?.addEventListener("change", () => {
  showAll = true;
  render(getMatches());
});
