export function bindMatchActionControls({
  matchActionsBtn,
  matchActionsPanel,
  manualNextRoundBtn,
  handleRoundComplete
}) {
  matchActionsBtn?.addEventListener("click", () => {
    matchActionsPanel?.classList.toggle("hidden");
  });

  manualNextRoundBtn?.addEventListener("click", () => {
    handleRoundComplete();
  });
}

export function bindClockAdjustControls({
  toggleAdjustClockBtn,
  adjustClockPanel,
  adjustClock
}) {
  toggleAdjustClockBtn?.addEventListener("click", () => {
    adjustClockPanel?.classList.toggle("hidden");
  });

  document
    .querySelectorAll("[data-adjust-time]")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        adjustClock(
          Number(btn.dataset.adjustTime || 0)
        );
      });
    });
}

export function bindScoreAdjustControls({
  toggleAdjustScoreBtn,
  adjustScorePanel,
  state,
  renderAll,
  saveLocalDraft,
  setStatus
}) {
  toggleAdjustScoreBtn?.addEventListener("click", () => {
    adjustScorePanel?.classList.toggle("hidden");
  });

  document
    .querySelectorAll("[data-adjust-score]")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        const side =
          btn.dataset.adjustScoreSide;

        const val =
          Number(btn.dataset.adjustScore);

        if (!side || !val) return;

        if (side === "athlete") {
          state.athleteScore =
            Math.max(0, state.athleteScore + val);
        }

        else if (side === "opponent") {
          state.opponentScore =
            Math.max(0, state.opponentScore + val);
        }

        renderAll();
        saveLocalDraft();
        setStatus("Score adjusted");
      });
    });
}

export function bindArenaModeControl() {
  const arenaModeToggle =
    document.getElementById("arenaModeToggle");

  arenaModeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("arena-mode");

    const isArena =
      document.body.classList.contains("arena-mode");

    arenaModeToggle.textContent =
      isArena ? "Normal" : "Arena";
  });
}