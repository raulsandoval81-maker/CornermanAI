const CONSOLE_MATCH_KEY = "coach_console_last_match";
const TOURNAMENT_MATCHES_KEY = "cornerman_matches";

const importBtn = document.getElementById("importLastMatchBtn");
const importStatus = document.getElementById("importStatus");
const lastConsoleMatchEl = document.getElementById("lastConsoleMatch");

renderLastConsoleMatch();

importBtn.addEventListener("click", importLastConsoleMatch);

function importLastConsoleMatch() {
  const consoleMatch = getLastConsoleMatch();

  if (!consoleMatch) {
    setStatus("No console match found. Run and save a match first.");
    return;
  }

  const matches = getTournamentMatches();

  const alreadyImported = matches.some((match) =>
    String(match.sourceId) === String(consoleMatch.id)
  );

  if (alreadyImported) {
    setStatus("This console match is already imported.");
    return;
  }

  const importedMatch = convertConsoleMatch(consoleMatch);

  matches.push(importedMatch);

  localStorage.setItem(
    TOURNAMENT_MATCHES_KEY,
    JSON.stringify(matches)
  );

  setStatus(
    `Imported: ${importedMatch.athlete} vs ${importedMatch.opponent} — ${importedMatch.result} by ${importedMatch.method}`
  );

  renderLastConsoleMatch();
}

function getLastConsoleMatch() {
  const raw = localStorage.getItem(CONSOLE_MATCH_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Bad console match payload:", error);
    return null;
  }
}

function getTournamentMatches() {
  return JSON.parse(
    localStorage.getItem(TOURNAMENT_MATCHES_KEY) || "[]"
  );
}

function convertConsoleMatch(consoleMatch) {
  return {
    id: Date.now(),
    sourceId: consoleMatch.id,
    source: "coach-console-import",

    athlete: consoleMatch.athlete || "Athlete",
    opponent: consoleMatch.opponent || "Opponent",
    tournament: consoleMatch.eventName || "",
    weight: consoleMatch.weightClass || "",

    result:
      consoleMatch.winner === "athlete"
        ? "Win"
        : "Loss",

    method: normalizeMethod(consoleMatch.resultType),

    pointsFor: Number(consoleMatch.athleteScore || 0),
    pointsAgainst: Number(consoleMatch.opponentScore || 0),

    takedowns: countEvents(consoleMatch, "athlete", "TD"),
    escapes: countEvents(consoleMatch, "athlete", "ESC"),
    reversals: countEvents(consoleMatch, "athlete", "REV"),
    nearfall: countNearfall(consoleMatch, "athlete"),

    notes: consoleMatch.notes || "",
    importedAt: new Date().toISOString()
  };
}

function normalizeMethod(method) {
  if (!method) return "Decision";

  const value = String(method).toLowerCase();

  if (value.includes("pin")) return "Pin";
  if (value.includes("tech")) return "Tech";
  if (value.includes("major")) return "Major";
  if (value.includes("forfeit")) return "Forfeit";

  return "Decision";
}

function countEvents(match, side, shortCode) {
  return (match.events || []).filter((event) =>
    event.side === side &&
    event.short === shortCode
  ).length;
}

function countNearfall(match, side) {
  return (match.events || []).filter((event) =>
    event.side === side &&
    String(event.short || "").startsWith("NF")
  ).length;
}

function renderLastConsoleMatch() {
  const consoleMatch = getLastConsoleMatch();

  if (!consoleMatch) {
    lastConsoleMatchEl.innerHTML = "<p>No console match found.</p>";
    return;
  }

  const converted = convertConsoleMatch(consoleMatch);

  lastConsoleMatchEl.innerHTML = `
    <div class="match-preview">
      <strong>${converted.athlete} vs ${converted.opponent}</strong>
      <p>${converted.result} by ${converted.method} · ${converted.pointsFor}-${converted.pointsAgainst}</p>
      <p>Tournament: ${converted.tournament || "Not set"} · Weight: ${converted.weight || "Not set"}</p>
    </div>
  `;
}

function setStatus(message) {
  importStatus.textContent = message;
}