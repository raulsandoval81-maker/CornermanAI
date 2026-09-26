const startBtn = document.getElementById("startRecord");
const pauseBtn = document.getElementById("pauseClock");
const resetMatchBtn = document.getElementById("resetMatch");
const finishBtn = document.getElementById("endMatch");
const statusEl = document.getElementById("status");
const connectYouTubeBtn = document.getElementById("connectYouTubeBtn");

let arming = false;
let initialArmed = false;
let matchStarted = false;
let finalizingMatch = false;
let allowFinalSave = false;

function setStatus(message) {
  if (statusEl) statusEl.textContent = message;
}

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
