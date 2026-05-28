import {
  setMode as setMatchMode,
  bindModeControls
}
from "./modules/match-mode.js";

export function bindScoringListeners({
  state,
  getMatchConfirmed,
  getMode,
  SCORING_RULES,
  isValidAction,
  getInvalidMessage,
  applyScore,
  updatePositionAfterScore,
  checkTechFall,
  createScoreEvent,
  getVideoTime,
  events,
  renderAll,
  saveLocalDraft,
  setStatus
}) {
  document
    .querySelectorAll("[data-code]")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        if (!getMatchConfirmed()) {
          setStatus("Confirm match before scoring");
          return;
        }

        if (getMode() === "review") return;

        if (!state.timer) {
          setStatus("Start match before scoring");
          return;
        }

        if (state.pendingChoice) {
          setStatus("Choose start position first");
          return;
        }

        const side =
          btn.dataset.side;

        const code =
          btn.dataset.code;

        const rule =
          SCORING_RULES[code];

        if (!rule) return;

        if (!isValidAction(state.position, side, code)) {
          setStatus(
            getInvalidMessage(state.position, side)
          );
          return;
        }

        applyScore(state, side, rule.points);

        updatePositionAfterScore(
          state,
          side,
          code
        );

        checkTechFall();

        events.push(
          createScoreEvent({
            state,
            side,
            code,
            rule,
            videoTime: getVideoTime()
          })
        );

        renderAll();
        saveLocalDraft();

        btn.style.transform =
          "scale(.95)";

        setTimeout(() => {
          btn.style.transform =
            "";
        }, 90);
      });
    });
}

export function bindUndoListener({
  state,
  events,
  undoScore,
  renderAll,
  saveLocalDraft
}) {
  document
    .getElementById("undoBtn")
    ?.addEventListener("click", () => {
      const last =
        events.pop();

      if (!last) return;

      if (last.type === "score") {
        undoScore(
          state,
          last.side,
          last.points
        );
      }

      state.position =
        events.reduce((pos, e) => {
          if (e.type !== "score") return pos;

          if (e.code === "td3") {
            return e.side === "athlete"
              ? "green_top"
              : "red_top";
          }

          if (e.code === "esc1") {
            return "neutral";
          }

          if (e.code === "rev2") {
            return e.side === "athlete"
              ? "green_top"
              : "red_top";
          }

          return pos;
        }, "neutral");

      renderAll();
      saveLocalDraft();
    });
}