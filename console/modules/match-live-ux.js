const startBtn = document.getElementById("startRecord");
const pauseBtn = document.getElementById("pauseClock");
const resetMatchBtn = document.getElementById("resetMatch");
const finishBtn = document.getElementById("endMatch");
const matchFormatSelect = document.getElementById("matchFormat");
const statusEl = document.getElementById("status");
const connectYouTubeBtn = document.getElementById("connectYouTubeBtn");

let arming = false;
let initialArmed = false;
let matchStarted = false;
let finalizingMatch = false;
let allowFinalSave = false;
let matchTypeConfirmed = false;
let applyingMatchTypeChoice = false;

function setStatus(message) {
  if (statusEl) statusEl.textContent = message;
}

function getMatchTypeConfig(formatKey) {
  if (["jv_90sec", "jv_consolation"].includes(formatKey)) {
    return {
      division: "JV",
      championship: {
        value: "jv_90sec",
        label: "Championship",
        detail: "R1 1:30"
      },
      consolation: {
        value: "jv_consolation",
        label: "Consolation",
        detail: "R1 1:00"
      }
    };
  }

  if (["varsity_championship", "varsity_consolation"].includes(formatKey)) {
    return {
      division: "Varsity",
      championship: {
        value: "varsity_championship",
        label: "Championship",
        detail: "R1 2:00"
      },
      consolation: {
        value: "varsity_consolation",
        label: "Consolation",
        detail: "R1 1:00"
      }
    };
  }

  return null;
}

function ensureMatchTypeGate() {
  let gate = document.getElementById("matchTypeGate");
  if (gate) return gate;

  gate = document.createElement("section");
  gate.id = "matchTypeGate";
  gate.className = "match-summary-modal hidden";
  gate.setAttribute("role", "dialog");
  gate.setAttribute("aria-modal", "true");
  gate.setAttribute("aria-labelledby", "matchTypeGateTitle");

  gate.innerHTML = `
    <div class="match-summary-card">
      <h2 id="matchTypeGateTitle">Confirm Match Type</h2>
      <p id="matchTypeGateDivision" class="muted"></p>
      <p>Choose the rule set before the camera arms. This sets the correct first-period clock.</p>
      <div class="winner-row">
        <button id="confirmChampionshipMatch" type="button" class="winner-btn green"></button>
        <button id="confirmConsolationMatch" type="button" class="winner-btn red"></button>
      </div>
    </div>
  `;

  document.body.appendChild(gate);
  return gate;
}

function hideMatchTypeGate() {
  document.getElementById("matchTypeGate")?.classList.add("hidden");
}

function applyMatchTypeChoice(value, label) {
  if (!matchFormatSelect) return;

  applyingMatchTypeChoice = true;
  matchFormatSelect.value = value;
  matchFormatSelect.dispatchEvent(new Event("change", { bubbles: true }));
  applyingMatchTypeChoice = false;

  matchTypeConfirmed = true;
  hideMatchTypeGate();
  setStatus(`${label} confirmed — tap START to prepare camera`);
}

function showMatchTypeGate(config) {
  const gate = ensureMatchTypeGate();
  const divisionEl = gate.querySelector("#matchTypeGateDivision");
  const championshipBtn = gate.querySelector("#confirmChampionshipMatch");
  const consolationBtn = gate.querySelector("#confirmConsolationMatch");

  if (divisionEl) {
    divisionEl.textContent = `${config.division} match`;
  }

  if (championshipBtn) {
    championshipBtn.textContent = `${config.championship.label} · ${config.championship.detail}`;
    championshipBtn.onclick = () =>
      applyMatchTypeChoice(config.championship.value, config.championship.label);
  }

  if (consolationBtn) {
    consolationBtn.textContent = `${config.consolation.label} · ${config.consolation.detail}`;
    consolationBtn.onclick = () =>
      applyMatchTypeChoice(config.consolation.value, config.consolation.label);
  }

  gate.classList.remove("hidden");
  setStatus("Confirm Championship or Consolation before START");
}

/*
 * Required pre-READY gate for divisions where championship and consolation
 * use different first-period clocks. Capture phase prevents the match engine
 * from arming the camera until the coach confirms the rule set.
 */
startBtn?.addEventListener(
  "click",
  event => {
    if (matchStarted || initialArmed || arming) return;

    const config = getMatchTypeConfig(matchFormatSelect?.value || "");
    if (!config || matchTypeConfirmed) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    showMatchTypeGate(config);
  },
  true
);

matchFormatSelect?.addEventListener("change", () => {
  if (applyingMatchTypeChoice || matchStarted || initialArmed || arming) return;
  matchTypeConfirmed = false;
});

function armAfterCameraStarts() {
  const startedAt = Date.now();

  const timer = setInterval(() => {
    const label = String(startBtn?.textContent || "").trim().toLowerCase();

    if (label === "running") {
      clearInterval(timer);

      pauseBtn?.click();

      setTimeout(() => {
        const recorder = window.__cornermanMediaRecorder;

        if (recorder?.state === "paused") {
          try {
            recorder.resume();
          } catch (error) {
            console.warn("Could not keep recorder armed:", error);
          }
        }

        arming = false;
        initialArmed = true;

        if (startBtn) {
          startBtn.disabled = false;
          startBtn.textContent = "START";
        }

        setStatus("READY — tap START on the referee whistle");
      }, 0);

      return;
    }

    if (Date.now() - startedAt > 8000) {
      clearInterval(timer);
      arming = false;

      if (startBtn) startBtn.disabled = false;
      setStatus("Could not arm camera cleanly — tap START again or continue without camera");
    }
  }, 25);
}

function resumePausedCapture() {
  const recorder = window.__cornermanMediaRecorder;

  if (recorder?.state !== "paused") return;

  try {
    recorder.resume();
  } catch (error) {
    console.warn("Could not resume match recording:", error);
  }
}

startBtn?.addEventListener("click", () => {
  const label = String(startBtn.textContent || "").trim().toLowerCase();

  if (label === "resume" || matchStarted) {
    // Round transitions pause capture. Keep video and clock moving together
    // whenever the coach starts/resumes the next period.
    setTimeout(resumePausedCapture, 0);
    return;
  }

  if (initialArmed) {
    initialArmed = false;
    matchStarted = true;
    setTimeout(resumePausedCapture, 0);
    return;
  }

  if (arming) return;

  arming = true;
  startBtn.disabled = true;
  setStatus("Preparing camera — hold for READY");
  armAfterCameraStarts();
});

/*
 * Match-end stability guard.
 * The engine's MediaRecorder.onstop callback owns creation of the final video
 * blob and transition into Review. Do not let the save pipeline race ahead of
 * that asynchronous callback on mobile browsers.
 */
finishBtn?.addEventListener(
  "click",
  event => {
    if (allowFinalSave) {
      allowFinalSave = false;
      return;
    }

    if (finalizingMatch) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    const winnerSelected = Boolean(
      document.querySelector("[data-winner].active")
    );
    const finishTypeSelected = Boolean(
      document.querySelector("[data-finish-type].active")
    );

    // Let the engine show its normal validation message before touching video.
    if (!winnerSelected || !finishTypeSelected) return;

    const recorder = window.__cornermanMediaRecorder;
    if (!recorder || recorder.state === "inactive") return;

    event.preventDefault();
    event.stopImmediatePropagation();

    finalizingMatch = true;
    finishBtn.disabled = true;
    finishBtn.textContent = "Finalizing…";
    setStatus("Finalizing video before saving match…");

    let completed = false;

    const continueFinalSave = () => {
      if (completed) return;
      completed = true;
      finalizingMatch = false;
      finishBtn.disabled = false;
      finishBtn.textContent = "Save Match";
      allowFinalSave = true;

      // Yield once so the engine's recorder onstop handler can finish creating
      // lastVideoBlob and Review state before the save handler continues.
      setTimeout(() => finishBtn.click(), 0);
    };

    recorder.addEventListener("stop", continueFinalSave, { once: true });

    try {
      recorder.stop();
    } catch (error) {
      console.warn("Could not finalize match recording cleanly:", error);
      finalizingMatch = false;
      finishBtn.disabled = false;
      finishBtn.textContent = "Save Match";
      setStatus("Video finalization paused — tap Save Match again.");
      return;
    }

    // Safety valve for browsers that report inactive before dispatching stop.
    setTimeout(() => {
      if (completed) return;

      if (recorder.state === "inactive") {
        continueFinalSave();
        return;
      }

      finalizingMatch = false;
      finishBtn.disabled = false;
      finishBtn.textContent = "Save Match";
      setStatus("Still finalizing video — tap Save Match again.");
    }, 3000);
  },
  true
);

resetMatchBtn?.addEventListener("click", () => {
  arming = false;
  initialArmed = false;
  matchStarted = false;
  finalizingMatch = false;
  allowFinalSave = false;
  matchTypeConfirmed = false;
  hideMatchTypeGate();

  if (finishBtn) {
    finishBtn.disabled = false;
    finishBtn.textContent = "Save Match";
  }
});

window.addEventListener("cornerman:youtube-status", event => {
  const detail = event.detail || {};
  const type = detail.type || "";
  const message = detail.message || "YouTube status changed.";

  if (type === "connected") {
    if (connectYouTubeBtn) {
      connectYouTubeBtn.textContent = "YouTube Connected ✓";
    }
    setStatus(message);
    return;
  }

  if (type === "connecting") {
    setStatus(message);
    return;
  }

  if (type === "uploading") {
    setStatus(message);
    return;
  }

  if (type === "uploaded") {
    setStatus(message);
    return;
  }

  if (type === "error") {
    if (connectYouTubeBtn) {
      connectYouTubeBtn.textContent = "Connect YouTube";
    }
    setStatus(`YouTube: ${message}`);
  }
});
