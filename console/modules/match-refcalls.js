import {
  REF_PROGRESSIONS
}
from "../../shared/scoring-rules.js";

export function updateRefButtonLabels({
  state
}) {
  document
    .querySelectorAll("[data-ref-call]")
    .forEach(btn => {

      const side =
        btn.dataset.side;

      const call =
        btn.dataset.refCall;

      const keyMap = {
        caution: "cautions",
        stall: "stalls",
        lockedHands: "lockedHands"
      };

      const count =
        state.refProgress?.[side]?.[
          keyMap[call]
        ] || 0;

      const progression =
        REF_PROGRESSIONS[call] || [];

      const next =
        progression[count] ?? "DQ";

      let suffix = "";

      if (next === 0) {
        suffix = "W";
      }

      else if (next === "DQ") {
        suffix = "DQ";
      }

      else {
        suffix = `+${next}`;
      }

      const sideText =
        side === "opponent"
          ? "RED"
          : "GRN";

      const labelMap = {
        caution: "CAU",
        stall: "STL",
        lockedHands: "LH"
      };

      btn.textContent =
        `${sideText} ${labelMap[call]} ${suffix}`;
    });
}

export function bindRefCallListeners({
  state,
  events,
  getMatchConfirmed,
  getMode,
  isRefCallAllowed,
  handleRefProgression,
  updateRefButtonLabels,
  setMatchResult,
  stopClock,
  pauseVideoCapture,
  updateStartButton,
  matchSummaryModal,
  createRefCallEvent,
  getVideoTime,
  checkTechFall,
  setStatus,
  renderAll,
  saveLocalDraft
}) {

  document
    .querySelectorAll("[data-ref-call]")
    .forEach(btn => {

      btn.addEventListener("click", () => {

        if (!getMatchConfirmed()) {
          setStatus("Confirm match before ref calls");
          return;
        }

        if (getMode() === "review") {
          return;
        }

        if (!state.timer) {
          setStatus("Start match before ref calls");
          return;
        }

        const side =
          btn.dataset.side;

        const callType =
          btn.dataset.refCall;

        const ruleCheck =
          isRefCallAllowed(
            state,
            side,
            callType
          );

        if (!ruleCheck.allowed) {
          setStatus(
            ruleCheck.message ||
            "Invalid ref call"
          );

          return;
        }

        const result =
          handleRefProgression(
            state,
            side,
            callType
          );

        updateRefButtonLabels();

        if (result?.dq) {

          setMatchResult(
            state,
            result.winner,
            "dq",
            true
          );

          stopClock({
            statusText:
              "DQ — match stopped"
          });

          pauseVideoCapture();

          updateStartButton({
            text: "Start",
            disabled: false
          });

          matchSummaryModal
            ?.classList.remove("hidden");
        }

        events.push(
          createRefCallEvent({
            state,
            side,
            callType,
            result,
            videoTime:
              getVideoTime()
          })
        );

        checkTechFall();

        setStatus(
          result?.message ||
          "Ref call recorded"
        );

        renderAll();
        saveLocalDraft();
      });
    });
}