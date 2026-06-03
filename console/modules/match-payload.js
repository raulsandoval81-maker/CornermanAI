export function buildMatchPayload({
  videoUrl = "",
  state,
  events,
  getVisibleRounds,
  formatTime,
  eventNameInput,
  weightClassInput,
  athleteNameInput,
  opponentNameInput,
  greenTeamInput,
  redTeamInput
}) {
  const takedowns =
    countMatchEvents(events, "athlete", "TD");

  const escapes =
    countMatchEvents(events, "athlete", "ESC");

  const reversals =
    countMatchEvents(events, "athlete", "REV");

  const nearfall =
    countNearfallEvents(events, "athlete");

  const result =
    state.winner === "athlete"
      ? "Win"
      : state.winner === "opponent"
        ? "Loss"
        : "Result";

  const method =
    formatResultType(state.resultType);

  return {
    id: Date.now(),

    eventName:
      eventNameInput?.value.trim() || "",

    weightClass:
      weightClassInput?.value.trim() || "",

    formatKey:
      state.formatKey,

    formatLabel:
      state.format.label,

    athlete:
      athleteNameInput?.value.trim()
      || "Athlete B",

    opponent:
      opponentNameInput?.value.trim()
      || "Athlete A",

    greenTeam:
      greenTeamInput?.value.trim() || "",

    redTeam:
      redTeamInput?.value.trim() || "",

    athleteScore:
      state.athleteScore,

    opponentScore:
      state.opponentScore,

    result,
    method,

    pointsFor:
      state.athleteScore,

    pointsAgainst:
      state.opponentScore,

    takedowns,
    escapes,
    reversals,
    nearfall,

    currentRound:
      state.currentRound,

    roundStarts:
      state.roundStarts,

    choiceHistory:
      state.choiceHistory,

    position:
      state.position,

    winner:
      state.winner,

    resultType:
      state.resultType,

    clock:
      formatTime(state.time),

    timeRemaining:
      state.time,

    rounds:
      getVisibleRounds(state, events),

    events,

    notes:
      document
        .getElementById("coachNotes")
        ?.value.trim() || "",

    videoUrl,

    savedAt:
      new Date().toISOString(),

    source:
      "coach-console"
  };
}

function countMatchEvents(events, side, shortCode) {
  return (events || []).filter(event =>
    event.side === side &&
    String(event.short || event.code || "")
      .toUpperCase()
      .startsWith(shortCode)
  ).length;
}

function countNearfallEvents(events, side) {
  return (events || []).filter(event =>
    event.side === side &&
    String(event.short || event.code || "")
      .toUpperCase()
      .startsWith("NF")
  ).length;
}

function formatResultType(resultType) {
  const labels = {
    decision: "Decision",
    major: "Major",
    tech: "Tech Fall",
    pin: "Pin",
    dq: "DQ",
    forfeit: "Forfeit"
  };

  return labels[resultType] || "Decision";
}

export function saveLocalDraft({
  buildMatchPayload
} = {}) {
  const payloadBuilder =
    buildMatchPayload ||
    window.buildMatchPayload;

  if (!payloadBuilder) return;

  localStorage.setItem(
    "coach_console_active_match",
    JSON.stringify(
      payloadBuilder()
    )
  );
}

export function saveFinishedMatch({
  match
}) {
  const logs =
    JSON.parse(
      localStorage.getItem("coach_match_logs") || "[]"
    );

  logs.push(match);

  localStorage.setItem(
    "coach_match_logs",
    JSON.stringify(logs)
  );

  localStorage.setItem(
    "coach_console_last_match",
    JSON.stringify(match)
  );
}

export function saveVideoMatch({
  buildMatchPayload,
  base64Video
}) {
  localStorage.setItem(
    "coach_console_last_match",
    JSON.stringify(
      buildMatchPayload(base64Video)
    )
  );
}