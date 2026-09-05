export function stopClock({
  state,
  setStatus,
  saveLocalDraft,
  statusText = "Clock paused"
}) {
  clearInterval(state.timer);

  state.timer = null;
  state.timerEndsAt = null;

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
  state.timerEndsAt = null;

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

  state.timerEndsAt = Date.now() + (state.time * 1000);
  let lastRenderedSecond = state.time;

  state.timer = setInterval(() => {
    state.time = Math.max(
      0,
      Math.ceil((state.timerEndsAt - Date.now()) / 1000)
    );

    if (state.time === lastRenderedSecond) return;
    lastRenderedSecond = state.time;

    updateClock();
    saveLocalDraft();

    if (publishLiveState) {
      publishLiveState();
    }

    if (state.time === 0) {
      handleRoundComplete();
    }
  }, 200);

  setStatus(
    `${formatRoundLabel(state.currentRound)} running`
  );
}
