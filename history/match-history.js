const STORAGE_KEY =
  "cornerman_matches";

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
        <option value="${event}">
          ${event}
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
  const filtered =
    getFilteredMatches(matches)
      .slice()
      .reverse();

  const total =
    matches.length;

  const withVideo =
    matches.filter(match =>
      match.videoUrl
    ).length;

  const needsVideo =
    total - withVideo;

  if (historyStats) {
    historyStats.innerHTML = `
      <p>Total Matches: ${total}</p>
      <p>With Video: ${withVideo}</p>
      <p>Needs Video: ${needsVideo}</p>
    `;
  }

  if (!filtered.length) {
    historyList.innerHTML =
      "<p>No matches found.</p>";
    return;
  }

  const visible =
    showAll
      ? filtered
      : filtered.slice(0, RECENT_LIMIT);

  historyList.innerHTML =
    visible
      .map(renderMatchRow)
      .join("");

  if (!showAll && filtered.length > RECENT_LIMIT) {
    historyList.innerHTML += `
      <button
        type="button"
        onclick="showAllMatches()"
      >
        View All Matches
      </button>
    `;
  }
}

function renderMatchRow(match) {
  const videoButton =
    match.videoUrl
      ? `
        <a
          href="${match.videoUrl}"
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
        ${match.athlete}
      </strong>

      <p>
        vs ${match.opponent}
      </p>

      <p>
        ${match.result || "Result"}
        by
        ${match.method || "Decision"}
      </p>

      <p>
        ${match.pointsFor || 0}
        -
        ${match.pointsAgainst || 0}
      </p>

      <a
        href="./match-detail.html?id=${match.id}"
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