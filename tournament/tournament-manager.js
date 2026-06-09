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

  const TOURNAMENT_HISTORY_KEY =
  "cornerman_tournament_history";


/* =========================
   TOURNAMENT EVENT
========================= */

let currentTournament = {
  name: "",
  date: "",
  location: "",
  bracketRound: "",
  consolePreference: "compact"
};

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

  const tournamentDateInput =
  document.getElementById("tournamentDateInput");

const tournamentLocationInput =
  document.getElementById("tournamentLocationInput");


const bracketRoundInput = 
  document.getElementById( "bracketRoundInput"   );

  const consolePreferenceInput =
  document.getElementById( "consolePreferenceInput" );

const saveTournamentEventBtn =
  document.getElementById("saveTournamentEventBtn");

const currentTournamentEl =
  document.getElementById("currentTournament");

  const archiveTournamentBtn =
  document.getElementById(
    "archiveTournamentBtn"
  );


  /* =========================
   INIT
========================= */

renderTournamentRoster();
loadCurrentTournament();
renderCurrentTournament();
setRosterStatus(
  "Tournament event saved."
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

saveTournamentEventBtn?.addEventListener(
  "click",
  saveTournamentEvent
);

archiveTournamentBtn?.addEventListener(
  "click",
  archiveCurrentTournament
);

/* =========================
   TOURNAMENT ROSTER
========================= */
function saveTournamentEvent() {
currentTournament = {
  name: eventNameInput?.value.trim() || "",
  date: tournamentDateInput?.value || "",
  location: tournamentLocationInput?.value.trim() || "",
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
    "cornerman_current_tournament",
    JSON.stringify(currentTournament)
  );

  renderCurrentTournament();
}
function loadCurrentTournament() {
  const saved =
    localStorage.getItem(
      "cornerman_current_tournament"
    );

    if (consolePreferenceInput) {
  consolePreferenceInput.value =
    currentTournament.consolePreference || "compact";
}

  if (!saved) return;

  try {
    currentTournament =
      JSON.parse(saved);

    eventNameInput.value =
      currentTournament.name || "";

    tournamentDateInput.value =
      currentTournament.date || "";

      if (bracketRoundInput) {
  bracketRoundInput.value =
    currentTournament.bracketRound || "";
}

    tournamentLocationInput.value =
      currentTournament.location || "";

  } catch (error) {
    console.error(error);
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
      localStorage.getItem(
        TOURNAMENT_HISTORY_KEY
      ) || "[]"
    );

  history.push({
    id: Date.now(),

    event: {
      ...currentTournament
    },

    roster,

    archivedAt:
      new Date().toISOString()
  });

  localStorage.setItem(
    TOURNAMENT_HISTORY_KEY,
    JSON.stringify(history)
  );

  localStorage.removeItem(
    "cornerman_current_tournament"
  );

  localStorage.removeItem(
    "cornerman_tournament_roster"
  );

currentTournament = {
  name: "",
  date: "",
  location: "",
  bracketRound: "",
  consolePreference: "compact"
};

  eventNameInput.value = "";
  tournamentDateInput.value = "";
  tournamentLocationInput.value = "";
if (bracketRoundInput) {
  bracketRoundInput.value = "";
}
if (consolePreferenceInput) {
  consolePreferenceInput.value =
    "compact";
}

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
function renderCurrentTournament() {
  if (!currentTournamentEl) return;

  if (!currentTournament.name) {
    currentTournamentEl.innerHTML =
      "<p>No tournament event created yet.</p>";
    return;
  }

currentTournamentEl.innerHTML = `
  <strong>${currentTournament.name}</strong>

  <p>
    ${currentTournament.date || "No date"}
    ·
    ${currentTournament.location || "No location"}
  </p>

  <p>
    Bracket:
    ${currentTournament.bracketRound || "General Event"}
  </p>

  <p>
    Console:
    ${currentTournament.consolePreference || "compact"}
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