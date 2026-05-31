const STORAGE_KEY = "cornerman_matches";

const form = document.getElementById("matchForm");
const statusEl = document.getElementById("status");
const matchHistoryEl = document.getElementById("matchHistory");

updateScreen();

form.addEventListener("submit", saveMatch);

function saveMatch(event) {
  event.preventDefault();

  const match = {
    id: Date.now(),
    athlete: getValue("athlete"),
    opponent: getValue("opponent"),
    tournament: getValue("tournament"),
    weight: getValue("weight"),
    result: getValue("result"),
    method: getValue("method"),
    pointsFor: getNumber("pointsFor"),
    pointsAgainst: getNumber("pointsAgainst"),
    takedowns: getNumber("takedowns"),
    escapes: getNumber("escapes"),
    reversals: getNumber("reversals"),
    nearfall: getNumber("nearfall"),
    notes: getValue("notes")
  };

  const matches = getMatches();
  matches.push(match);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));

  form.reset();
  updateScreen();
}

function getMatches() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function getValue(id) {
  return document.getElementById(id).value.trim();
}

function getNumber(id) {
  return Number(document.getElementById(id).value || 0);
}

function updateScreen() {
  const matches = getMatches();

  statusEl.textContent = `${matches.length} Match(es) Saved`;

  renderMatchHistory(matches);
}

function renderMatchHistory(matches) {
  if (!matchHistoryEl) return;

  if (matches.length === 0) {
    matchHistoryEl.innerHTML =
      `<p class="empty-state">No saved matches yet.</p>`;
    return;
  }

  const recentMatches = matches.slice(-6).reverse();

  matchHistoryEl.innerHTML = recentMatches.map((match) => {
    return `
      <article class="match-row">
        <div>
          <strong>${match.athlete} vs ${match.opponent}</strong>
          <p>${match.result} by ${match.method} · ${match.pointsFor}-${match.pointsAgainst}</p>
        </div>

        <span>${match.weight || "No weight"}</span>
      </article>
    `;
  }).join("");
}