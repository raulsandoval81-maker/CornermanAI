export function updateClock({
  clockEl,
  formatTime,
  state
}) {
  if (!clockEl) return;

  clockEl.textContent =
    formatTime(state.time);
}

export function updateScores({
  athleteScoreEl,
  opponentScoreEl,
  state
}) {
  if (athleteScoreEl) {
    athleteScoreEl.textContent =
      state.athleteScore;
  }

  if (opponentScoreEl) {
    opponentScoreEl.textContent =
      state.opponentScore;
  }
}

export function updatePositionIndicator({
  state
}) {
  const el =
    document.getElementById("positionIndicator");

  if (!el) return;

  if (state.position === "neutral") {
    el.textContent = "NEUTRAL";
    el.className = "position-indicator";
  }

  else if (state.position === "green_top") {
    el.textContent = "GREEN TOP";
    el.className =
      "position-indicator green-top";
  }

  else {
    el.textContent = "RED TOP";
    el.className =
      "position-indicator red-top";
  }
}

export function updateRoundDisplay({
  currentRoundEl,
  formatRoundLabel,
  state
}) {
  if (!currentRoundEl) return;

  currentRoundEl.textContent =
    formatRoundLabel(state.currentRound);
}

export function updateIdentityStrip({
  greenDisplayName,
  athleteNameInput,
  redDisplayName,
  opponentNameInput,
  greenTeamEl,
  greenTeamInput,
  redTeamEl,
  redTeamInput,
  eventNameDisplay,
  eventNameInput,
  weightClassDisplay,
  weightClassInput
}) {
  if (greenDisplayName) {
    greenDisplayName.textContent =
      athleteNameInput?.value.trim()
      || "Athlete B";
  }

  if (redDisplayName) {
    redDisplayName.textContent =
      opponentNameInput?.value.trim()
      || "Athlete A";
  }

  if (greenTeamEl) {
    greenTeamEl.textContent =
      greenTeamInput?.value.trim()
      || "Team";
  }

  if (redTeamEl) {
    redTeamEl.textContent =
      redTeamInput?.value.trim()
      || "Team";
  }

  if (eventNameDisplay) {
    eventNameDisplay.textContent =
      `Event: ${
        eventNameInput?.value.trim() || "—"
      }`;
  }

  if (weightClassDisplay) {
    weightClassDisplay.textContent =
      `Weight: ${
        weightClassInput?.value.trim() || "—"
      }`;
  }
}

export function lockMatchSetup({
  locked,
  eventNameInput,
  weightClassInput,
  redTeamInput,
  greenTeamInput,
  athleteNameInput,
  opponentNameInput,
  matchFormatSelect
}) {
  [
    eventNameInput,
    weightClassInput,
    redTeamInput,
    greenTeamInput,
    athleteNameInput,
    opponentNameInput,
    matchFormatSelect
  ].forEach(el => {
    if (el) el.disabled = locked;
  });
}

export function renderControls({
  matchFormatSelect,
  MATCH_FORMATS,
  state
}) {
  if (
    matchFormatSelect &&
    !matchFormatSelect.dataset.ready
  ) {
    Object
      .entries(MATCH_FORMATS)
      .forEach(([key, format]) => {
        const option =
          document.createElement("option");

        option.value =
          key;

        option.textContent =
          format.label;

        matchFormatSelect
          .appendChild(option);
      });

    matchFormatSelect.value =
      state.formatKey;

    matchFormatSelect.dataset.ready =
      "true";
  }
}

export function renderChoicePanel({
  choicePanel,
  state,
  mode
}) {
  if (!choicePanel) return;

  const label =
    document.getElementById("choiceOwnerLabel");

  const buttons =
    choicePanel.querySelectorAll("[data-choice]");

  document
    .querySelectorAll("[data-code]")
    .forEach(btn => {
      btn.disabled =
        state.resultLocked ||
        !!state.pendingChoice ||
        mode === "review";
    });

  if (!state.pendingChoice) {
    choicePanel.classList.add("hidden");
    choicePanel.classList.remove(
      "red-choice",
      "green-choice"
    );
    return;
  }

  choicePanel.classList.remove("hidden");

  const chooser =
    state.pendingChoice.chooser;

  if (chooser === "athlete") {
    label.textContent =
      "GREEN CHOICE";
  }

  else if (chooser === "opponent") {
    label.textContent =
      "RED CHOICE";
  }

  else {
    label.textContent =
      "CHOICE";
  }

  choicePanel.classList.remove(
    "red-choice",
    "green-choice"
  );

  if (chooser === "athlete") {
    choicePanel.classList.add("green-choice");
  }

  else if (chooser === "opponent") {
    choicePanel.classList.add("red-choice");
  }

  const allowed =
    state.pendingChoice.options || [];

  buttons.forEach(btn => {
    const val =
      btn.dataset.choice;

    btn.style.display =
      allowed.includes(val)
        ? "inline-block"
        : "none";
  });
}

export function updateStartButton({
  startBtn,
  text = "Start",
  disabled = false
}) {
  if (!startBtn) return;

  startBtn.textContent =
    text;

  startBtn.disabled =
    disabled;
}

export function updateCompactVisibility({
  state,
  isValidAction
}) {
  document
    .querySelectorAll("[data-code]")
    .forEach(btn => {
      const side =
        btn.dataset.side;

      const code =
        btn.dataset.code;

      const valid =
        isValidAction(
          state.position,
          side,
          code
        );

      btn.style.display =
        valid ? "" : "none";
    });
}