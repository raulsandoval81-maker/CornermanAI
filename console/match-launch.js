const startMatchBtn =
  document.getElementById("startMatchBtn");

const fastStartBtn =
  document.getElementById("fastStartBtn");

function getCurrentTournament() {
  return JSON.parse(
    localStorage.getItem(
      "cornerman_current_tournament"
    ) || "{}"
  );
}

function applyTournamentContext(setup) {
  const currentTournament =
    getCurrentTournament();

  return {
    ...setup,

    eventName:
      setup.eventName ||
      currentTournament.name ||
      "Practice",

    tournamentDate:
      currentTournament.date || "",

    tournamentLocation:
      currentTournament.location || "",

    bracketRound:
      currentTournament.bracketRound || ""
  };
}

function launchConsole(setup) {
  const pendingMatch =
    applyTournamentContext(setup);

  localStorage.setItem(
    "cornerman_pending_match",
    JSON.stringify(pendingMatch)
  );

  window.location.href =
    "./compact-console.modular.html";
}

startMatchBtn?.addEventListener("click", () => {
  launchConsole({
    eventName:
      document
        .getElementById("eventNameInput")
        ?.value
        .trim() || "",

    athleteName:
      document
        .getElementById("manualAthleteName")
        ?.value
        .trim() || "",

    athleteSide:
      document
        .getElementById("sandmanColor")
        ?.value || "green",

    weightClass:
      document
        .getElementById("customWeightClassInput")
        ?.value
        .trim() ||
      document
        .getElementById("weightClassInput")
        ?.value ||
      "",

    opponentTeam:
      document
        .getElementById("redTeamInput")
        ?.value
        .trim() || "",

    opponentName:
      document
        .getElementById("opponentName")
        ?.value
        .trim() || "",

    source:
      "match-launch"
  });
});

fastStartBtn?.addEventListener("click", () => {
  launchConsole({
    eventName: "",
    athleteName: "Athlete B",
    athleteSide: "green",
    weightClass: "",
    opponentTeam: "",
    opponentName: "Athlete A",
    source: "fast-start"
  });
});