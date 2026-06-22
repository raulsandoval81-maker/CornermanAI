export function stopClock({
  state,
  setStatus,
  saveLocalDraft,
  statusText = "Clock paused"
}) {
  clearInterval(state.timer);

  state.timer = null;

  setStatus(statusText);
  saveLocalDraft();
}

export function resetClock({
  state,
  getRoundSeconds,
  updateClock,
  setStatus,
  saveLocalDraft
}) {
  clearInterval(state.timer);

  state.timer = null;

  state.time =
    getRoundSeconds(state, state.currentRound);

  updateClock();

  setStatus("Clock reset");
  saveLocalDraft();
}

export function adjustClock({
  state,
  seconds,
  updateClock,
  saveLocalDraft
}) {
  state.time =
    Math.max(0, state.time + seconds);

  updateClock();
  saveLocalDraft();
}

export function startClock({
  state,
  updateClock,
  saveLocalDraft,
  publishLiveState,
  handleRoundComplete,
  setStatus,
  formatRoundLabel
}) {
  if (state.timer) return;

  state.timer = setInterval(() => {
    state.time -= 1;

    if (state.time < 0) {
      state.time = 0;
    }

    updateClock();
    saveLocalDraft();

    if (publishLiveState) {
      publishLiveState();
    }

    if (state.time === 0) {
      handleRoundComplete();
    }
  }, 1000);

  setStatus(
    `${formatRoundLabel(state.currentRound)} running`
  );
}