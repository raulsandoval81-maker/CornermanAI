import {
  addTournamentEntry,
  getTournamentRoster
} from "../data/tournament-roster.js";

import {
  WEIGHT_CLASSES
} from "../data/weight-classes.js";
const { escapeHtml } = window.CornermanSafe;

import {
  saveMatch
} from "../shared/match-repository.js";

const CONSOLE_MATCH_KEY =
  "coach_console_last_match";


const CURRENT_TOURNAMENT_KEY =
  "cornerman_current_tournament";

const TOURNAMENT_HISTORY_KEY =
  "cornerman_tournament_history";

let currentTournament = {
  name: "",
  date: "",
  location: "",
  bracketRound: "",
  consolePreference: "compact"
};

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

const tournamentDateInput =
  document.getElementById("tournamentDateInput");

const tournamentLocationInput =
  document.getElementById("tournamentLocationInput");

const bracketRoundInput =
  document.getElementById("bracketRoundInput");

const consolePreferenceInput =
  document.getElementById("consolePreferenceInput");

const saveTournamentEventBtn =
  document.getElementById("saveTournamentEventBtn");

const currentTournamentEl =
  document.getElementById("currentTournament");

const archiveTournamentBtn =
  document.getElementById("archiveTournamentBtn");

init();

function init() {
  loadCurrentTournament();
  renderCurrentTournament();
  renderTournamentRoster();
  renderLastConsoleMatch();

  weightGroupSelect?.addEventListener(
    "change",
    () => loadWeightOptions(weightGroupSelect.value)
  );

  addTournamentAthleteBtn?.addEventListener(
    "click",
    addAthleteToTournamentRoster
  );

  saveTournamentEventBtn?.addEventListener(
    "click",
    saveTournamentEvent
  );

  archiveTournamentBtn?.addEventListener(
    "click",
    archiveCurrentTournament
  );

  importBtn?.addEventListener(
    "click",
    importLastConsoleMatch
  );
}

function saveTournamentEvent() {
  currentTournament = {
    name:
      eventNameInput?.value.trim() || "",

    date:
      tournamentDateInput?.value || "",

    location:
      tournamentLocationInput?.value.trim() || "",

    bracketRound:
      bracketRoundInput?.value || "",

    consolePreference:
      consolePreferenceInput?.value || "compact"
  };

  if (!currentTournament.name) {
    setRosterStatus("Enter tournament name first.");
    return;
  }

  localStorage.setItem(
    CURRENT_TOURNAMENT_KEY,
    JSON.stringify(currentTournament)
  );

  renderCurrentTournament();

  setRosterStatus(
    "Tournament event saved."
  );
}

function loadCurrentTournament() {
  const saved =
    localStorage.getItem(CURRENT_TOURNAMENT_KEY);

  if (!saved) {
    syncTournamentInputs();
    return;
  }

  try {
    currentTournament =
      JSON.parse(saved);

    syncTournamentInputs();
  } catch (error) {
    console.error(
      "Could not load tournament:",
      error
    );
  }
}

function syncTournamentInputs() {
  if (eventNameInput) {
    eventNameInput.value =
      currentTournament.name || "";
  }

  if (tournamentDateInput) {
    tournamentDateInput.value =
      currentTournament.date || "";
  }

  if (tournamentLocationInput) {
    tournamentLocationInput.value =
      currentTournament.location || "";
  }

  if (bracketRoundInput) {
    bracketRoundInput.value =
      currentTournament.bracketRound || "";
  }

  if (consolePreferenceInput) {
    consolePreferenceInput.value =
      currentTournament.consolePreference || "compact";
  }
}

function archiveCurrentTournament() {
  if (!currentTournament.name) {
    setRosterStatus(
      "No active tournament to archive."
    );
    return;
  }

  const roster =
    getTournamentRoster();

  const history =
    JSON.parse(
      localStorage.getItem(TOURNAMENT_HISTORY_KEY) || "[]"
    );

  history.push({
    id: Date.now(),
    event: { ...currentTournament },
    roster,
    archivedAt: new Date().toISOString()
  });

  localStorage.setItem(
    TOURNAMENT_HISTORY_KEY,
    JSON.stringify(history)
  );

  localStorage.removeItem(CURRENT_TOURNAMENT_KEY);
  localStorage.removeItem("cornerman_tournament_roster");

  currentTournament = {
    name: "",
    date: "",
    location: "",
    bracketRound: "",
    consolePreference: "compact"
  };

  syncTournamentInputs();
  renderCurrentTournament();
  renderTournamentRoster();

  setRosterStatus(
    "Tournament archived successfully."
  );
}

function addAthleteToTournamentRoster() {
  const eventName =
    currentTournament.name || "";

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

  const entry = {
    entryId:
      buildEntryId(
        athleteName,
        weightGroup,
        weight
      ),

    athleteId:
      slugify(athleteName),

    name:
      athleteName,

    team:
      teamName,

    eventName,

    division:
      formatDivision(weightGroup),

    weightGroup,
    weight,

    checkedIn:
      true,

    attendanceXp:
      10,

    placementXp:
      0,

    createdAt:
      new Date().toISOString()
  };

  addTournamentEntry(entry);

  athleteNameInput.value = "";
  teamNameInput.value = "";
  weightGroupSelect.value = "";

  weightInput.innerHTML = `
    <option value="">
      Select Weight
    </option>
  `;

  renderTournamentRoster();

  setRosterStatus(
    `${athleteName} added to tournament roster.`
  );
}

function renderCurrentTournament() {
  if (!currentTournamentEl) return;

  if (!currentTournament.name) {
    currentTournamentEl.innerHTML =
      "<p>No active tournament context.</p>";
    return;
  }

  currentTournamentEl.innerHTML = `
    <strong>
      ${escapeHtml(currentTournament.name)}
    </strong>

    <p>
      ${escapeHtml(currentTournament.date || "No date")}
      ·
      ${escapeHtml(currentTournament.location || "No location")}
    </p>

    <p>
      Bracket:
      ${escapeHtml(currentTournament.bracketRound || "General Event")}
    </p>

    <p>
      Console:
      ${escapeHtml(currentTournament.consolePreference || "compact")}
    </p>
  `;
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
            ${escapeHtml(entry.name)} · ${escapeHtml(entry.weight)}
          </strong>

          <p>
            ${escapeHtml(entry.team)} · ${escapeHtml(entry.division)}
          </p>

          <p>
            Event: ${escapeHtml(entry.eventName)}
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
async function importLastConsoleMatch() {
  const consoleMatch =
    getLastConsoleMatch();

  if (!consoleMatch) {
    setImportStatus(
      "No console match found. Run and save a match first."
    );
    return;
  }

  const importedMatch =
    convertConsoleMatch(consoleMatch);

  setImportStatus(
    "Importing match..."
  );

  const result =
    await saveMatch(importedMatch);

  if (!result.match) {
    setImportStatus(
      "Could not import match."
    );
    return;
  }

  if (result.synced) {
    setImportStatus(
      `Imported: ${result.match.athlete} vs ${result.match.opponent} — ${result.match.result} by ${result.match.method}`
    );
  } else if (result.authenticated === false) {
    setImportStatus(
      "Match imported locally. Sign in to Cornerman to sync."
    );
  } else {
    setImportStatus(
      "Match imported locally. Backend sync is pending."
    );
  }

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

function convertConsoleMatch(consoleMatch) {
  const intelligence =
    consoleMatch.intelligence || {};

  return {
    id:
      String(
        consoleMatch.id ||
        cryptoFallbackId()
      ),

    sourceId:
      consoleMatch.id || null,

    source:
      "coach-console-import",

    athlete:
      consoleMatch.athlete || "Athlete",

    opponent:
      consoleMatch.opponent || "Opponent",

    eventName:
      consoleMatch.eventName ||
      currentTournament.name ||
      "",

    tournament:
      consoleMatch.eventName ||
      currentTournament.name ||
      "",

    tournamentDate:
      currentTournament.date || "",

    tournamentLocation:
      currentTournament.location || "",

    bracketRound:
      currentTournament.bracketRound || "",

    weightClass:
      consoleMatch.weightClass || "",

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
      Number(consoleMatch.athleteScore || 0),

    pointsAgainst:
      Number(consoleMatch.opponentScore || 0),

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

    events:
      consoleMatch.events || [],

    notes:
      consoleMatch.notes || "",

    intelligence,

    patterns:
      intelligence.patterns || [],

    recommendations:
      intelligence.recommendations || [],

    practiceFocus:
      intelligence.practiceFocus || {},

    importedAt:
      new Date().toISOString()
  };
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
        ${escapeHtml(converted.athlete)}
        vs
        ${escapeHtml(converted.opponent)}
      </strong>

      <p>
        ${escapeHtml(converted.result)}
        by
        ${escapeHtml(converted.method)}
        ·
        ${converted.pointsFor}-${converted.pointsAgainst}
      </p>

      <p>
        Event:
        ${escapeHtml(converted.eventName || "Not set")}
        ·
        Weight:
        ${escapeHtml(converted.weightClass || "Not set")}
      </p>
    </div>
  `;
}

function setRosterStatus(message) {
  if (rosterStatus) {
    rosterStatus.textContent =
      message;
  }
}

function setImportStatus(message) {
  if (importStatus) {
    importStatus.textContent =
      message;
  }
}

function normalizeMethod(method) {
  if (!method) return "Decision";

  const value =
    String(method).toLowerCase();

  if (value.includes("pin")) return "Pin";
  if (value.includes("tech")) return "Tech";
  if (value.includes("major")) return "Major";
  if (value.includes("forfeit")) return "Forfeit";
  if (value.includes("dq")) return "DQ";

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


function cryptoFallbackId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return [
    "tournament-match",
    Date.now(),
    Math.random()
      .toString(36)
      .slice(2)
  ].join("-");
}

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
