const startBtn = document.getElementById("startRecord");
const pauseBtn = document.getElementById("pauseClock");
const resetMatchBtn = document.getElementById("resetMatch");
const statusEl = document.getElementById("status");
const connectYouTubeBtn = document.getElementById("connectYouTubeBtn");

let arming = false;
let initialArmed = false;
let matchStarted = false;

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

startBtn?.addEventListener("click", () => {
  const label = String(startBtn.textContent || "").trim().toLowerCase();

  if (label === "resume" || matchStarted) {
    return;
  }

  if (initialArmed) {
    initialArmed = false;
    matchStarted = true;
    return;
  }

  if (arming) return;

  arming = true;
  startBtn.disabled = true;
  setStatus("Preparing camera — hold for READY");
  armAfterCameraStarts();
});

resetMatchBtn?.addEventListener("click", () => {
  arming = false;
  initialArmed = false;
  matchStarted = false;
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