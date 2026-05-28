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