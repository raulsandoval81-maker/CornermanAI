export function getWinnerLabel({
  winner,
  greenDisplayName,
  redDisplayName
}) {
  if (winner === "athlete") {
    return `GREEN — ${
      greenDisplayName?.textContent ||
      "Athlete B"
    }`;
  }

  if (winner === "opponent") {
    return `RED — ${
      redDisplayName?.textContent ||
      "Athlete A"
    }`;
  }

  return "—";
}

export function getResultLabel(type) {
  const map = {
    decision: "Decision",
    major: "Major",
    tech: "Tech Fall",
    pin: "Pin",
    dq: "DQ",
    forfeit: "Forfeit"
  };

  return map[type] || type || "—";
}

export function getResultTypeFromMargin({
  RESULT_TYPES,
  diff
}) {
  return RESULT_TYPES.find(r => {

    if (!r.minDiff) {
      return false;
    }

    if (r.maxDiff) {
      return (
        diff >= r.minDiff &&
        diff <= r.maxDiff
      );
    }

    return diff >= r.minDiff;

  })?.key || "decision";
}

export function syncAutoResult({
  state,
  getResultTypeFromMargin,
  setMatchResult
}) {
  if (state.resultLocked) {
    return;
  }

  const red =
    state.opponentScore;

  const green =
    state.athleteScore;

  if (red === green) {
    return;
  }

  const winner =
    green > red
      ? "athlete"
      : "opponent";

  const margin =
    Math.abs(green - red);

  const resultType =
    getResultTypeFromMargin(margin);

  setMatchResult(
    state,
    winner,
    resultType,
    false
  );
}

export function updateReviewResult({
  reviewWinnerEl,
  reviewResultEl,
  state,
  getWinnerLabel,
  getResultLabel
}) {

  if (reviewWinnerEl) {
    reviewWinnerEl.textContent =
      `Winner: ${
        getWinnerLabel(state.winner)
      }`;
  }

  if (reviewResultEl) {
    reviewResultEl.textContent =
      `Result: ${
        getResultLabel(state.resultType)
      }`;
  }
}

export function updateMatchSummary({
  summaryScoreEl,
  summarySuggestedResultEl,
  state,
  getWinnerLabel,
  getResultLabel
}) {

  if (summaryScoreEl) {
    summaryScoreEl.textContent =
      `RED ${state.opponentScore} — GREEN ${state.athleteScore}`;
  }

  if (summarySuggestedResultEl) {
    summarySuggestedResultEl.textContent =
      `Suggested: ${
        getWinnerLabel(state.winner)
      } by ${
        getResultLabel(state.resultType)
      }`;
  }
}

export function syncSummaryButtons({
  state
}) {
  document
    .querySelectorAll("[data-winner]")
    .forEach(btn => {

      btn.classList.toggle(
        "active",
        btn.dataset.winner === state.winner
      );
    });

  document
    .querySelectorAll("[data-finish-type]")
    .forEach(btn => {

      btn.classList.toggle(
        "active",
        btn.dataset.finishType === state.resultType
      );
    });
}

export function checkTechFall({
  state,
  setMatchResult,
  showFinishFlash,
  stopClock,
  pauseVideoCapture,
  updateStartButton,
  matchSummaryModal
}) {

  if (state.resultLocked) {
    return;
  }

  const margin =
    Math.abs(
      state.athleteScore -
      state.opponentScore
    );

  if (margin < 15 || state.resultLocked) {
    return;
  }

  const winner =
    state.athleteScore >
    state.opponentScore
      ? "athlete"
      : "opponent";

  setMatchResult(
    state,
    winner,
    "tech",
    true
  );

  showFinishFlash(
    "TECH FALL",
    winner
  );

  stopClock({
    statusText:
      "Tech Fall — match stopped"
  });

  pauseVideoCapture();

  updateStartButton({
    text: "Start",
    disabled: false
  });

  matchSummaryModal
    ?.classList.remove("hidden");
}