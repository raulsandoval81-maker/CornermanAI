import {
  addTournamentEntry,
  getTournamentRoster
} from "../data/tournament-roster.js";

import {
  WEIGHT_CLASSES
} from "../data/weight-classes.js";

const CONSOLE_MATCH_KEY =
  "coach_console_last_match";

const TOURNAMENT_MATCHES_KEY =
  "cornerman_matches";

/* =========================
   DOM
========================= */

const importBtn =
  document.getElementById("importLastMatchBtn");

const importStatus =
  document.getElementById("importStatus");

const lastConsoleMatchEl =
  document.getElementById("lastConsoleMatch");

const eventNameInput =
  document.getElementById("eventNameInput");

const athleteNameInput =
  document.getElementById("athleteNameInput");

const teamNameInput =
  document.getElementById("teamNameInput");

const weightGroupSelect =
  document.getElementById("weightGroupSelect");

const weightInput =
  document.getElementById("weightInput");

const addTournamentAthleteBtn =
  document.getElementById("addTournamentAthleteBtn");

const rosterStatus =
  document.getElementById("rosterStatus");

const tournamentRosterList =
  document.getElementById("tournamentRosterList");

  

/* =========================
   INIT
========================= */

renderLastConsoleMatch();
renderTournamentRoster();

importBtn?.addEventListener(
  "click",
  importLastConsoleMatch
);

weightGroupSelect?.addEventListener(
  "change",
  () => {
    loadWeightOptions(
      weightGroupSelect.value
    );
  }
);

addTournamentAthleteBtn?.addEventListener(
  "click",
  addAthleteToTournamentRoster
);

/* =========================
   TOURNAMENT ROSTER
========================= */

function addAthleteToTournamentRoster() {
  const eventName =
    eventNameInput?.value.trim() || "";

  const athleteName =
    athleteNameInput?.value.trim() || "";

  const teamName =
    teamNameInput?.value.trim() || "";

  const weightGroup =
    weightGroupSelect?.value || "";

  const weight =
    weightInput?.value || "";

  if (
    !eventName ||
    !athleteName ||
    !teamName ||
    !weightGroup ||
    !weight
  ) {
    setRosterStatus(
      "Complete event, athlete, team, weight group, and weight."
    );

    return;
  }

  const entryId =
    buildEntryId(
      athleteName,
      weightGroup,
      weight
    );

  const entry = {
    entryId,
    athleteId: slugify(athleteName),
    name: athleteName,
    team: teamName,
    eventName,
    division: formatDivision(weightGroup),
    weightGroup,
    weight,
    checkedIn: true,
    attendanceXp: 10,
    placementXp: 0,
    createdAt: new Date().toISOString()
  };

  addTournamentEntry(entry);

  setRosterStatus(
    `${athleteName} added to tournament roster.`
  );

  athleteNameInput.value = "";
  teamNameInput.value = "";
  weightGroupSelect.value = "";
  weightInput.innerHTML = `
    <option value="">
      Select Weight
    </option>
  `;

  renderTournamentRoster();
}

function renderTournamentRoster() {
  if (!tournamentRosterList) return;

  const roster =
    getTournamentRoster();

  if (!roster.length) {
    tournamentRosterList.innerHTML =
      "<p>No athletes added yet.</p>";
    return;
  }

  tournamentRosterList.innerHTML =
    roster
      .map(entry => `
        <div class="match-preview">
          <strong>
            ${entry.name} · ${entry.weight}
          </strong>

          <p>
            ${entry.team} · ${entry.division}
          </p>

          <p>
            Event: ${entry.eventName}
          </p>
        </div>
      `)
      .join("");
}

function loadWeightOptions(group) {
  if (!weightInput) return;

  weightInput.innerHTML = `
    <option value="">
      Select Weight
    </option>
  `;

  const weights =
    WEIGHT_CLASSES[group] || [];

  weights.forEach(weight => {
    const option =
      document.createElement("option");

    option.value =
      String(weight);

    option.textContent =
      `${weight} lb`;

    weightInput.appendChild(option);
  });
}

function setRosterStatus(message) {
  if (rosterStatus) {
    rosterStatus.textContent =
      message;
  }
}

/* =========================
   MATCH IMPORT BRIDGE
========================= */

function importLastConsoleMatch() {
  const consoleMatch =
    getLastConsoleMatch();

  if (!consoleMatch) {
    setImportStatus(
      "No console match found. Run and save a match first."
    );

    return;
  }

  const matches =
    getTournamentMatches();

  const alreadyImported =
    matches.some(match =>
      String(match.sourceId) ===
      String(consoleMatch.id)
    );

  if (alreadyImported) {
    setImportStatus(
      "This console match is already imported."
    );

    return;
  }

  const importedMatch =
    convertConsoleMatch(consoleMatch);

  matches.push(importedMatch);

  localStorage.setItem(
    TOURNAMENT_MATCHES_KEY,
    JSON.stringify(matches)
  );

  setImportStatus(
    `Imported: ${importedMatch.athlete} vs ${importedMatch.opponent} — ${importedMatch.result} by ${importedMatch.method}`
  );

  renderLastConsoleMatch();
}

function getLastConsoleMatch() {
  const raw =
    localStorage.getItem(CONSOLE_MATCH_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error(
      "Bad console match payload:",
      error
    );

    return null;
  }
}

function getTournamentMatches() {
  return JSON.parse(
    localStorage.getItem(
      TOURNAMENT_MATCHES_KEY
    ) || "[]"
  );
}

function convertConsoleMatch(consoleMatch) {
  return {
    id: Date.now(),
    sourceId: consoleMatch.id,
    source: "coach-console-import",

    athlete:
      consoleMatch.athlete || "Athlete",

    opponent:
      consoleMatch.opponent || "Opponent",

    tournament:
      consoleMatch.eventName || "",

    weight:
      consoleMatch.weightClass || "",

    result:
      consoleMatch.winner === "athlete"
        ? "Win"
        : "Loss",

    method:
      normalizeMethod(
        consoleMatch.resultType
      ),

    pointsFor:
      Number(
        consoleMatch.athleteScore || 0
      ),

    pointsAgainst:
      Number(
        consoleMatch.opponentScore || 0
      ),

    takedowns:
      countEvents(
        consoleMatch,
        "athlete",
        "TD"
      ),

    escapes:
      countEvents(
        consoleMatch,
        "athlete",
        "ESC"
      ),

    reversals:
      countEvents(
        consoleMatch,
        "athlete",
        "REV"
      ),

    nearfall:
      countNearfall(
        consoleMatch,
        "athlete"
      ),

    notes:
      consoleMatch.notes || "",

    importedAt:
      new Date().toISOString()
  };
}

function normalizeMethod(method) {
  if (!method) return "Decision";

  const value =
    String(method).toLowerCase();

  if (value.includes("pin")) return "Pin";
  if (value.includes("tech")) return "Tech";
  if (value.includes("major")) return "Major";
  if (value.includes("forfeit")) return "Forfeit";

  return "Decision";
}

function countEvents(match, side, shortCode) {
  return (match.events || [])
    .filter(event =>
      event.side === side &&
      event.short === shortCode
    ).length;
}

function countNearfall(match, side) {
  return (match.events || [])
    .filter(event =>
      event.side === side &&
      String(event.short || "")
        .startsWith("NF")
    ).length;
}

function renderLastConsoleMatch() {
  if (!lastConsoleMatchEl) return;

  const consoleMatch =
    getLastConsoleMatch();

  if (!consoleMatch) {
    lastConsoleMatchEl.innerHTML =
      "<p>No console match found.</p>";
    return;
  }

  const converted =
    convertConsoleMatch(consoleMatch);

  lastConsoleMatchEl.innerHTML = `
    <div class="match-preview">
      <strong>
        ${converted.athlete}
        vs
        ${converted.opponent}
      </strong>

      <p>
        ${converted.result}
        by
        ${converted.method}
        ·
        ${converted.pointsFor}-${converted.pointsAgainst}
      </p>

      <p>
        Tournament:
        ${converted.tournament || "Not set"}
        ·
        Weight:
        ${converted.weight || "Not set"}
      </p>
    </div>
  `;
}

function setImportStatus(message) {
  if (importStatus) {
    importStatus.textContent =
      message;
  }
}

/* =========================
   HELPERS
========================= */

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildEntryId(
  athleteName,
  weightGroup,
  weight
) {
  return [
    slugify(athleteName),
    weightGroup,
    weight,
    Date.now()
  ].join("-");
}

function formatDivision(group) {
  const labels = {
    youth: "Youth",
    juniorHighBoys: "Junior High Boys",
    juniorHighGirls: "Junior High Girls",
    highSchoolBoys: "High School Boys",
    highSchoolGirls: "High School Girls",
    collegeMen: "College Men",
    collegeWomen: "College Women"
  };

  return labels[group] || "Open";
}