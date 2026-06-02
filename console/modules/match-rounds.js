
export function handleRoundComplete({
  state,
  events,
  advanceRound,
  createRoundStartEvent,
  preview,
  chooserPanel,
  choicePanel,
  matchSummaryModal,
  stopClock,
  pauseVideoCapture,
  updateStartButton,
  setStatus,
  syncAutoResult,
  renderAll,
  saveLocalDraft,
  formatRoundLabel,
  setPositionFromRoundStart
}) {
  stopClock({
    statusText: "Round complete"
  });

  pauseVideoCapture();

  const result =
    advanceRound(state);
if (
  state.currentRound === "UTB" &&
  !result.advanced
) {
  const topSide =
    state.roundStarts?.UTB === "green_top"
      ? "athlete"
      : "opponent";

  const bottomSide =
    topSide === "athlete"
      ? "opponent"
      : "athlete";

  const bottomScored =
    events.some(event =>
      event.round === "UTB" &&
      event.side === bottomSide &&
      ["esc1", "rev2"].includes(event.code)
    );

  if (bottomScored) {
    state.winner = bottomSide;
  } else {
    state.winner = topSide;
  }

  state.resultType = "decision";

  setStatus("Ultimate tiebreaker complete — open Match Summary");

  matchSummaryModal?.classList.remove("hidden");

  syncAutoResult();
  renderAll();
  saveLocalDraft();

  return;
}
  if (
    result.round === "2" &&
    !state.secondPeriodFirstChooser
  ) {
    setStatus("Who has choice?");

    chooserPanel
      ?.classList.remove("hidden");

    choicePanel
      ?.classList.add("hidden");

    return;
  }
const isTied =
  state.athleteScore === state.opponentScore;

if (
  !result.advanced &&
  isTied
) {
  setStatus(
    "Regulation tied — overtime required"
  );

  matchSummaryModal
    ?.classList.add("hidden");

  updateStartButton({
    text: "Start OT",
    disabled: false
  });

  renderAll();
  saveLocalDraft();

  return;
}
  if (!result.advanced) {
    setStatus(
      "Match complete — open Match Summary"
    );

    matchSummaryModal
      ?.classList.remove("hidden");

    syncAutoResult();
    renderAll();
    saveLocalDraft();

    return;
  }

  if (result.requiresChoice) {
    updateStartButton({
      text: "Start",
      disabled: true
    });

    setStatus("Choice required");

    renderAll();
    saveLocalDraft();

    return;
  }

  const startPosition =
    state.roundStarts[state.currentRound] ||
    "neutral";

  setPositionFromRoundStart(
    state,
    startPosition
  );

  events.push(
    createRoundStartEvent({
      state,
      round: state.currentRound,
      position: startPosition,
      videoTime: preview?.currentTime || 0
    })
  );

  pauseVideoCapture();

  updateStartButton({
    text: "Start",
    disabled: false
  });

  setStatus(
    `${formatRoundLabel(state.currentRound)} ready — press Start`
  );

  renderAll();
  saveLocalDraft();
}

export function bindChooserControls({
  greenChooserBtn,
  redChooserBtn,
  chooserPanel,
  setSecondPeriodFirstChooser,
  state,
  renderAll,
  saveLocalDraft
}) {
  greenChooserBtn?.addEventListener("click", () => {
    setSecondPeriodFirstChooser(
      state,
      "athlete"
    );

    chooserPanel
      ?.classList.add("hidden");

    renderAll();
    saveLocalDraft();
  });

  redChooserBtn?.addEventListener("click", () => {
    setSecondPeriodFirstChooser(
      state,
      "opponent"
    );

    chooserPanel
      ?.classList.add("hidden");

    renderAll();
    saveLocalDraft();
  });
}

export function bindRoundChoiceControls({
  choicePanel,
  state,
  events,
  preview,
  applyRoundChoice,
  createRoundStartEvent,
  setPositionFromRoundStart,
  pauseVideoCapture,
  updateStartButton,
  setStatus,
  renderAll,
  saveLocalDraft,
  formatRoundLabel
}) {
  choicePanel
    ?.querySelectorAll("[data-choice]")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        const choice =
          btn.dataset.choice;

        const applied =
          applyRoundChoice(
            state,
            choice
          );

        if (!applied) return;

        const startPosition =
          state.roundStarts[
            state.currentRound
          ];

        setPositionFromRoundStart(
          state,
          startPosition
        );

        events.push(
          createRoundStartEvent({
            state,
            round: state.currentRound,
            position: startPosition,
            videoTime:
              preview?.currentTime || 0
          })
        );

        pauseVideoCapture();

        updateStartButton({
          text: "Start",
          disabled: false
        });

        setStatus(
          `${formatRoundLabel(state.currentRound)} ready — press Start`
        );

        renderAll();
        saveLocalDraft();
      });
    });
}
export {
  handleRoundComplete as handleRoundFlow
};