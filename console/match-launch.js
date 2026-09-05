import {
  WEIGHT_CLASSES
} from "../data/weight-classes.js";
const consoleViewSelect =
  document.getElementById("consoleViewSelect");
const startMatchBtn =
  document.getElementById("startMatchBtn");

const fastStartBtn =
  document.getElementById("fastStartBtn");

const athleteMode =
  document.getElementById("athleteMode");

const athleteSelect =
  document.getElementById("athleteSelect");

const manualAthleteName =
  document.getElementById("manualAthleteName");

const teamAInput =
  document.getElementById("teamAInput");

const opponentMode =
  document.getElementById("opponentMode");

const knownOpponentSelect =
  document.getElementById("knownOpponentSelect");

const opponentName =
  document.getElementById("opponentName");

const opponentTeam =
  document.getElementById("redTeamInput");

const eventNameInput =
  document.getElementById("eventNameInput");

const weightGroupSelect =
  document.getElementById("weightGroupSelect");

const weightClassInput =
  document.getElementById("weightClassInput");

const customWeightClassInput =
  document.getElementById("customWeightClassInput");

const matchTimeInput =
  document.getElementById("matchTimeInput");

const sandmanColor =
  document.getElementById("sandmanColor");

const opponentColor =
  document.getElementById("opponentColor");

const DEFAULT_FORMAT_BY_WEIGHT_GROUP = {
  youth: "youth_1min",
  juniorHighBoys: "jv_90sec",
  juniorHighGirls: "jv_90sec",
  highSchoolBoys: "varsity_championship",
  highSchoolGirls: "varsity_championship",
  collegeMen: "college_3_2_2",
  collegeWomen: "college_3_2_2"
};

const DEFAULT_TIME_BY_WEIGHT_GROUP = {
  youth: "1-1-1",
  juniorHighBoys: "1.5-1.5-1.5",
  juniorHighGirls: "1.5-1.5-1.5",
  highSchoolBoys: "2-2-2",
  highSchoolGirls: "2-2-2",
  collegeMen: "3-2-2",
  collegeWomen: "3-2-2"
};

function getCurrentTournament() {
  return JSON.parse(
    localStorage.getItem("cornerman_current_tournament") || "{}"
  );
}

function renderTournamentContext() {
  const el =
    document.getElementById("currentTournamentContext");

  if (!el) return;

  const tournament =
    getCurrentTournament();

  if (!tournament.name) {
    el.textContent =
      "No active tournament context.";
    return;
  }

  el.innerHTML = `
    <strong>${escapeHtml(tournament.name)}</strong>
    <p>
      ${escapeHtml(tournament.date || "No date")}
      ·
      ${escapeHtml(tournament.location || "No location")}
    </p>
    <p>
      Bracket:
      ${escapeHtml(tournament.bracketRound || "General Event")}
    </p>
  `;

  if (eventNameInput && !eventNameInput.value) {
    eventNameInput.value =
      tournament.name || "";
  }

  if (
    consoleViewSelect &&
    tournament.consolePreference
  ) {
    consoleViewSelect.value =
      tournament.consolePreference;
  }
}

function applyTournamentContext(setup) {
  const tournament = getCurrentTournament();

  return {
    ...setup,

    eventName:
      setup.eventName ||
      tournament.name ||
      "Practice",

    tournamentDate:
      tournament.date || "",

    tournamentLocation:
      tournament.location || "",

    bracketRound:
      tournament.bracketRound || ""
  };
}

function launchConsole(setup) {

  localStorage.setItem(
    "cornerman_pending_match",
    JSON.stringify(
      applyTournamentContext(setup)
    )
  );

const consoleRoutes = {
  compact: "./compact-console.modular.html",
  classic: "./classic-console.modular.html",
  overlay: "./overlay-console.modular.html"
};

  const consoleView =
    setup.consoleView || "compact";

  // Remember coach preference
  localStorage.setItem(
    "cornerman_console_preference",
    consoleView
  );

  window.location.href =
    consoleRoutes[consoleView] ||
    consoleRoutes.compact;

}

function loadWeightClasses(group) {
  if (!weightClassInput) return;

  weightClassInput.innerHTML = `
    <option value="">
      Select Weight
    </option>
  `;

  const weights =
    WEIGHT_CLASSES[group] || [];

  weights.forEach(weight => {
    const option =
      document.createElement("option");

    option.value = String(weight);
    option.textContent = `${weight} lb`;

    weightClassInput.appendChild(option);
  });
}

function syncWeightGroupDefaults() {
  const group =
    weightGroupSelect?.value || "";

  loadWeightClasses(group);

  const defaultTime =
    DEFAULT_TIME_BY_WEIGHT_GROUP[group];

  if (matchTimeInput && defaultTime) {
    matchTimeInput.value = defaultTime;
  }
}

function getAthleteAName() {
  if (athleteMode?.value === "manual") {
    return manualAthleteName?.value.trim() || "";
  }

  if (!athleteSelect?.value) {
    return "";
  }

  const option =
    athleteSelect.options[
      athleteSelect.selectedIndex
    ];

  return option?.textContent.trim() || "";
}

function syncAthleteMode() {
  const roster =
    athleteMode?.value !== "manual";

  if (athleteSelect) {
    athleteSelect.hidden = !roster;
  }

  if (manualAthleteName) {
    manualAthleteName.hidden = roster;
  }
}

function getOpponentName() {
  if (opponentMode?.value === "known") {
    if (!knownOpponentSelect?.value) {
      return "";
    }

    const option =
      knownOpponentSelect.options[
        knownOpponentSelect.selectedIndex
      ];

    return option?.textContent.trim() || "";
  }

  return opponentName?.value.trim() || "";
}

function syncOpponentMode() {
  const known =
    opponentMode?.value === "known";

  if (knownOpponentSelect) {
    knownOpponentSelect.hidden = !known;
  }

  if (opponentName) {
    opponentName.hidden = known;
  }
}

function syncColorsFromA() {
  if (!sandmanColor || !opponentColor) return;

  opponentColor.value =
    sandmanColor.value === "green"
      ? "red"
      : "green";
}

function syncColorsFromB() {
  if (!sandmanColor || !opponentColor) return;

  sandmanColor.value =
    opponentColor.value === "green"
      ? "red"
      : "green";
}

athleteMode?.addEventListener(
  "change",
  syncAthleteMode
);

opponentMode?.addEventListener(
  "change",
  syncOpponentMode
);

weightGroupSelect?.addEventListener(
  "change",
  syncWeightGroupDefaults
);

sandmanColor?.addEventListener(
  "change",
  syncColorsFromA
);

opponentColor?.addEventListener(
  "change",
  syncColorsFromB
);

syncAthleteMode();
syncOpponentMode();
syncColorsFromA();
syncWeightGroupDefaults();
renderTournamentContext();

startMatchBtn?.addEventListener("click", () => {
  const weightGroup =
    weightGroupSelect?.value || "";

  const weightClass =
    customWeightClassInput?.value.trim() ||
    weightClassInput?.value ||
    "";

  const athleteName =
    getAthleteAName();

  const selectedOpponentName =
    getOpponentName();

  if (!athleteName) {
    alert("Select or enter Wrestler A.");
    return;
  }

  if (!selectedOpponentName) {
    alert("Select or enter Wrestler B.");
    return;
  }

  if (!weightGroup) {
    alert("Select a weight group.");
    return;
  }

  if (!weightClass) {
    alert("Select or enter a weight.");
    return;
  }

  launchConsole({
    eventName:
      eventNameInput?.value.trim() || "",

      consoleView:
  consoleViewSelect?.value || "compact",

    athleteMode:
      athleteMode?.value || "roster",

    athleteName,

    teamA:
      teamAInput?.value.trim() || "",

    athleteSide:
      sandmanColor?.value || "green",

    opponentMode:
      opponentMode?.value || "manual",

    opponentName:
      selectedOpponentName,

    opponentTeam:
      opponentTeam?.value.trim() || "",

    opponentSide:
      opponentColor?.value || "red",

    weightGroup,

    weightClass,

    matchTime:
      matchTimeInput?.value || "",

    matchFormat:
      DEFAULT_FORMAT_BY_WEIGHT_GROUP[weightGroup] || "",

    source:
      "match-launch"
  });
});

fastStartBtn?.addEventListener("click", () => {
  launchConsole({
    eventName: "",

    athleteMode: "manual",
    athleteName: "Wrestler A",

    consoleView:
    consoleViewSelect?.value || "compact",

    opponentMode: "manual",
    opponentName: "Wrestler B",

    athleteSide: "green",
    opponentSide: "red",

    teamA: "",
    opponentTeam: "",

    weightGroup: "",
    weightClass: "",
    matchTime: "",
    matchFormat: "",

    source: "fast-start"
  });
});