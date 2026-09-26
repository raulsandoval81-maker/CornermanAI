import { listMatches } from "../shared/match-repository.js";
const { escapeHtml, safeUrl } = window.CornermanSafe;

const RECENT_LIMIT = 12;
const PLACEHOLDER_NAMES = new Set([
  "wrestler a",
  "wrestler b",
  "athlete a",
  "athlete b",
  "green wrestler",
  "red wrestler",
  "green",
  "red"
]);

const historyList = document.getElementById("historyList");
const historyStats = document.getElementById("historyStats");
const historySearch = document.getElementById("historySearch");
const eventFilter = document.getElementById("eventFilter");
const videoFilter = document.getElementById("videoFilter");

let showAll = false;
let matches = [];
loadHistory();

function isPlaceholderName(value) {
  return PLACEHOLDER_NAMES.has(String(value || "").trim().toLowerCase());
}

function needsIdentityAssignment(match) {
  return isPlaceholderName(match?.athlete) || isPlaceholderName(match?.opponent);
}

async function loadHistory() {
  const result = await listMatches();
  matches = result.matches;
  if (!result.authenticated) console.info("Match backend sign-in required; showing local cache.");

  populateEventFilter(matches);
  render(matches);
}

function populateEventFilter(matches) {
  if (!eventFilter) return;

  const currentValue = eventFilter.value;
  const events = [...new Set(matches.map(match => match.eventName).filter(Boolean))];

  eventFilter.innerHTML = `
    <option value="">All Events</option>
    ${events.map(event => `
      <option value="${escapeHtml(event)}">${escapeHtml(event)}</option>
    `).join("")}
  `;

  eventFilter.value = currentValue;
}

function getFilteredMatches(matches) {
  const query = (historySearch?.value || "").toLowerCase().trim();
  const selectedEvent = eventFilter?.value || "";
  const selectedVideo = videoFilter?.value || "all";

  return matches.filter(match => {
    const nameText = `${match.athlete || ""} ${match.opponent || ""}`.toLowerCase();
    const nameMatch = !query || nameText.includes(query);
    const eventMatch = !selectedEvent || match.eventName === selectedEvent;
    const videoMatch = selectedVideo === "all" ||
      (selectedVideo === "withVideo" && match.videoUrl) ||
      (selectedVideo === "needsVideo" && !match.videoUrl);

    return nameMatch && eventMatch && videoMatch;
  });
}

function render(matches) {
  if (!historyList) return;

  const filteredMatches = getFilteredMatches(matches);
  const visibleMatches = showAll ? filteredMatches : filteredMatches.slice(0, RECENT_LIMIT);
  const needsAssignmentCount = filteredMatches.filter(needsIdentityAssignment).length;

  if (historyStats) {
    historyStats.innerHTML = `
      <strong>${filteredMatches.length}</strong>
      match${filteredMatches.length === 1 ? "" : "es"}
      ${needsAssignmentCount ? ` · <strong>${needsAssignmentCount}</strong> need athlete assignment` : ""}
    `;
  }

  if (!visibleMatches.length) {
    historyList.innerHTML = `<p class="muted">No matches found.</p>`;
    return;
  }

  historyList.innerHTML = visibleMatches.slice().reverse().map(renderMatchRow).join("");
}

function renderMatchRow(match) {
  const safeVideo = safeUrl(match.videoUrl);
  const videoButton = safeVideo
    ? `<a href="${escapeHtml(safeVideo)}" target="_blank" rel="noopener">🎥 Watch Video</a>`
    : `<span class="muted">No video</span>`;

  const identityBadge = needsIdentityAssignment(match)
    ? `<p><strong>⚠ Needs Athlete Assignment</strong></p>`
    : "";

  const openLabel = needsIdentityAssignment(match) ? "Assign / Edit Match" : "Open Match";

  return `
    <div class="match-row">
      <strong>${escapeHtml(match.athlete || "Wrestler A")}</strong>
      <p>vs ${escapeHtml(match.opponent || "Wrestler B")}</p>
      ${identityBadge}
      <p>
        ${escapeHtml(match.result || "Result")}
        by
        ${escapeHtml(match.method || "Decision")}
      </p>
      <p>${match.pointsFor || 0} - ${match.pointsAgainst || 0}</p>
      <a href="./match-detail.html?id=${encodeURIComponent(String(match.id ?? ""))}${needsIdentityAssignment(match) ? "&edit=1" : ""}">${openLabel}</a>
      ${videoButton}
    </div>
  `;
}

window.showAllMatches = function showAllMatches() {
  showAll = true;
  render(matches);
};

historySearch?.addEventListener("input", () => {
  showAll = true;
  render(matches);
});

eventFilter?.addEventListener("change", () => {
  showAll = true;
  render(matches);
});

videoFilter?.addEventListener("change", () => {
  showAll = true;
  render(matches);
});
