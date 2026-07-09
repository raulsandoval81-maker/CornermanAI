export function publishLiveState({
  state,
  events,
  athleteName,
  opponentName
}) {
  const lastEvent =
    events[events.length - 1] || null;

  const liveState = {
    athleteName,
    opponentName,

    athleteScore: state.athleteScore,
    opponentScore: state.opponentScore,

    position: state.position,
    round: state.currentRound,
    clock: state.time,

    winner: state.winner,
    resultType: state.resultType,
    matchFinished: !!state.resultLocked,

    lastEvent,
    events
  };

  console.log(
    "PUBLISH LIVE STATE:",
    liveState
  );

  localStorage.setItem(
    "cornerman-live-state",
    JSON.stringify(liveState)
  );
}