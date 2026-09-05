import { createDOM }
from "./modules/match-dom.js";

import { saveMatch as persistMatch }
from "../shared/match-repository.js";

import {
  getTournamentRoster,
  getTournamentEntry
} from "../data/tournament-roster.js";

import {
  WEIGHT_CLASSES
} from "../data/weight-classes.js";

import {
  initializeMatchConfirmAccordion
} from "./modules/match-confirm.js";

import {
  handleRoundFlow
} from "./modules/match-rounds.js";

import {
  setStatus,
  showFinishFlash,
  getVideoTarget
}
from "./modules/match-overlay.js";

import { publishLiveState }
from "../media/live/live-publisher.js";

import {
  getInvalidMessage,
  isValidAction,
  updatePositionAfterScore,
  setPositionFromRoundStart
}
from "./modules/match-scoring.js";

import {
  stopClock,
  resetClock,
  adjustClock,
  startClock
}
from "./modules/match-timer.js";

import {
  stopCameraStream,
  pauseVideoCapture,
  resumeVideoCapture,
  loadReplayFromCurrentChunks
}
from "./modules/match-video.js";

import {
  updateClock,
  updateScores,
  updatePositionIndicator,
  updateRoundDisplay,
  updateIdentityStrip,
  lockMatchSetup,
  renderControls,
  renderChoicePanel,
  updateStartButton,
  updateCompactVisibility
}
from "./modules/match-render.js";

import {
  renderEventList,
  renderEvents,
  renderBoutBoardTarget,
  renderBoutBoard,
  renderBoutRailTarget,
  renderBoutRail
}
from "./modules/match-events.js";
import {
  getWinnerLabel,
  getResultLabel,
  updateMatchSummary,
  syncSummaryButtons,
  getResultTypeFromMargin,
  checkTechFall,
  syncAutoResult,
  updateReviewResult
}
from "./modules/match-summary.js";


import {
  updateRefButtonLabels
}
from "./modules/match-refcalls.js";



import { MATCH_FORMATS } from "../shared/match-formats.js";
import {
  SCORING_RULES,
  RESULT_TYPES,
  REF_PROGRESSIONS,
  isRefCallAllowed
} from "../shared/scoring-rules.js";

import {
  createMatchState,
  setMatchFormat,
  advanceRound,
  applyRoundChoice,
  applyScore,
  undoScore,
  getRoundSeconds,
  getVisibleRounds,
  setMatchResult,
  setSecondPeriodFirstChooser
} from "../shared/match-state.js";

import {
  createScoreEvent,
  createRefCallEvent,
  createRoundStartEvent,
  groupEventsByRound,
  formatTime,
  formatRoundLabel,
  formatSide,
  sideClass
} from "../shared/event-log.js";

import {
  runIntelligence
} from "../analysis/intelligence-runner.js";

import {
  initYouTubeUploader,
  connectYouTubeUpload,
  uploadVideoToYouTube
} from "../media/youtube-uploader.js";

import {
  initializeAthleteDetailModal
} from "./modules/athlete-detail-modal.js";

import { handleRefProgression } from "../shared/progression-engine.js";
import { runRecon }
from "../recon/recon-runner.js";



const state = createMatchState();
state.position = "neutral";
const consoleMode = document.body.dataset.console || "classic";

let events = [];
let mode = "live";
let matchConfirmed = false;

let mediaRecorder;
window.__cornermanMediaRecorder = mediaRecorder;
let stream = null;
window.__cornermanStream = stream;
let chunks = [];
let lastVideoBlob = null;

/* DOM */
const statusEl = document.getElementById("status");
const preview = document.getElementById("preview");
const reviewPreview = document.getElementById("reviewPreview");

const liveBtn = document.getElementById("liveMode");
const reviewBtn = document.getElementById("reviewMode");

const athleteSelect = document.getElementById("athleteSelect");
const matchSetupEl = document.getElementById("matchSetup");
const weightGroupSelect = document.getElementById("weightGroupSelect");
const confirmMatchSetupBtn = document.getElementById("confirmMatchSetup");

const eventNameInput = document.getElementById("eventNameInput");
const weightClassInput = document.getElementById("weightClassInput");
const eventNameDisplay = document.getElementById("eventNameDisplay");
const weightGroupDisplay = document.getElementById("weightGroupDisplay");
const weightClassDisplay = document.getElementById("weightClassDisplay");
const manualEntryToggle = document.getElementById("manualEntryToggle");
const manualEntryFields = document.getElementById("manualEntryFields");

const redTeamInput = document.getElementById("redTeamInput");
const greenTeamInput = document.getElementById("greenTeamInput");
const athleteNameInput = document.getElementById("athleteName");
const opponentNameInput = document.getElementById("opponentName");

const redTeamEl = document.getElementById("redTeam");
const greenTeamEl = document.getElementById("greenTeam");
const redDisplayName = document.getElementById("redDisplayName");
const greenDisplayName = document.getElementById("greenDisplayName");

const athleteScoreEl = document.getElementById("athleteScore");
const opponentScoreEl = document.getElementById("opponentScore");
const clockEl = document.getElementById("clock");
const currentRoundEl = document.getElementById("currentRound");

const eventLogEl = document.getElementById("eventLog");

const boutBoardEl = document.getElementById("boutBoard");
const boutRailEl = document.getElementById("boutRail");
const reviewBoutBoardEl = document.getElementById("reviewBoutBoard");
const reviewBoutRailEl = document.getElementById("reviewBoutRail");

const matchFormatSelect = document.getElementById("matchFormat");
const choicePanel = document.getElementById("choicePanel");

const startBtn = document.getElementById("startRecord");
const pauseBtn = document.getElementById("pauseClock");
const stopBtn = document.getElementById("stopRecord");
const resetBtn = document.getElementById("resetClock");

const chooserPanel = document.getElementById("chooserPanel");
const greenChooserBtn = document.getElementById("greenChooserBtn");
const redChooserBtn = document.getElementById("redChooserBtn");

const toggleAdjustClockBtn = document.getElementById("toggleAdjustClock");
const adjustClockPanel = document.getElementById("adjustClockPanel");

const toggleAdjustScoreBtn = document.getElementById("toggleAdjustScore");
const adjustScorePanel = document.getElementById("adjustScorePanel");

const resetMatchBtn = document.getElementById("resetMatch");
const matchActionsBtn = document.getElementById("toggleMatchActions");
const matchActionsPanel = document.getElementById("matchActionsPanel");
const manualNextRoundBtn = document.getElementById("nextRound");

const matchSummaryModal = document.getElementById("matchSummaryModal");
const closeMatchSummaryBtn = document.getElementById("closeMatchSummary");
const finishBtn = document.getElementById("endMatch");
const saveMatchLogBtn = document.getElementById("saveMatchLogBtn");
const attachLastUploadBtn = document.getElementById("attachLastUploadBtn");


const reviewWinnerEl = document.getElementById("reviewWinner");
const reviewResultEl = document.getElementById("reviewResult");
const summaryScoreEl = document.getElementById("summaryScore");
const summarySuggestedResultEl = document.getElementById("summarySuggestedResult");
const sandmanColorSelect = document.getElementById("sandmanColor");


const connectYouTubeBtn = document.getElementById("connectYouTubeBtn");
const uploadMatchVideoBtn = document.getElementById("uploadMatchVideoBtn");


let matchContext = {
  eventName: "",
  weightClass: "",
  weightGroup: "",
  athleteName: "",
  opponentName: "",
  greenTeam: "",
  redTeam: "",
  tournamentDate: "",
  tournamentLocation: "",
  bracketRound: ""
};
/* HELPERS */

const DEFAULT_FORMAT_BY_WEIGHT_GROUP = {
  youth: "youth_1min",
  juniorHighBoys: "jv_90sec",
  juniorHighGirls: "jv_90sec",
  highSchoolBoys: "varsity_championship",
  highSchoolGirls: "varsity_championship",
  collegeMen: "college_3_2_2",
  collegeWomen: "college_3_2_2"
};

/* ROUND FLOW */
function handleRoundComplete() {

  handleRoundFlow({
    state,
    advanceRound,
    setStatus,
    pauseVideoCapture,
    stopClock: ({ statusText }) =>
      stopClock({
        state,
        setStatus,
        saveLocalDraft,
        statusText
      }),

    chooserPanel,
    choicePanel,
    matchSummaryModal,

    syncAutoResult: () =>
      syncAutoResult({
        state,
        getResultTypeFromMargin: diff =>
          getResultTypeFromMargin({
            RESULT_TYPES,
            diff
          }),
        setMatchResult
      }),

    renderAll,
    saveLocalDraft,

    updateStartButton: ({ text, disabled }) =>
      updateStartButton({
        startBtn,
        text,
        disabled
      }),

    setPositionFromRoundStart: position =>
      setPositionFromRoundStart(
        state,
        position
      ),

    createRoundStartEvent,
    events,
    preview,
    formatRoundLabel
  });

}

function renderAll() {
  updateClock({
    clockEl,
    formatTime,
    state
  });

  updateScores({
    athleteScoreEl,
    opponentScoreEl,
    state
  });

  updatePositionIndicator({
    state
  });

  if (consoleMode === "compact") {
    updateCompactVisibility({
      state,
      isValidAction
    });
  }

  updateRoundDisplay({
    currentRoundEl,
    formatRoundLabel,
    state
  });

  updateIdentityStrip({
    greenDisplayName,
    athleteNameInput,
    athleteName: matchContext.athleteName,
    redDisplayName,
    opponentNameInput,
    opponentName: matchContext.opponentName,
    greenTeamEl,
    greenTeamInput,
    greenTeam: matchContext.greenTeam,
    redTeamEl,
    redTeamInput,
    redTeam: matchContext.redTeam,
    eventNameDisplay,
    eventNameInput,
    eventName: matchContext.eventName,
    weightClassDisplay,
    weightClassInput,
    weightClass: matchContext.weightClass
  });

  if (weightGroupDisplay) {
    const division =
      String(matchContext.weightGroup || "").trim();

    weightGroupDisplay.textContent =
      division
        ? `Division: ${division}`
        : "Division: —";
  }


syncAutoResult({
  state,
  getResultTypeFromMargin: diff =>
    getResultTypeFromMargin({
      RESULT_TYPES,
      diff
    }),
  setMatchResult
});
updateReviewResult({
  reviewWinnerEl,
  reviewResultEl,
  state,
  getWinnerLabel: winner =>
    getWinnerLabel({
      winner,
      greenDisplayName,
      redDisplayName
    }),
  getResultLabel
});

  renderEvents({
    eventLogEl,
    events,
    getVideoTarget: () =>
      getVideoTarget(mode, reviewPreview, preview),
    formatRoundLabel,
    formatSide,
    sideClass
  });

  renderBoutBoard({
    boutBoardEl,
    reviewBoutBoardEl,
    state,
    events,
    getVideoTarget: () =>
      getVideoTarget(mode, reviewPreview, preview),
    groupEventsByRound,
    getVisibleRounds,
    formatRoundLabel,
    formatSide
  });

  renderBoutRail({
    boutRailEl,
    reviewBoutRailEl,
    state,
    events,
    getVideoTarget: () =>
      getVideoTarget(mode, reviewPreview, preview),
    groupEventsByRound,
    getVisibleRounds,
    formatRoundLabel,
    formatSide
  });

  renderControls({
    matchFormatSelect,
    MATCH_FORMATS,
    state
  });

  renderChoicePanel({
    choicePanel,
    state,
    mode
  });

updateMatchSummary({
  summaryScoreEl,
  summarySuggestedResultEl,
  state,
  getWinnerLabel: winner =>
    getWinnerLabel({
      winner,
      greenDisplayName,
      redDisplayName
    }),
  getResultLabel
});

syncSummaryButtons({
  state
});

}
function loadTournamentRosterSelect() {
  if (!athleteSelect) return;

  const roster = getTournamentRoster();

  athleteSelect.innerHTML = `
    <option value="">Select Athlete</option>
  `;

  roster.forEach(entry => {
    const option = document.createElement("option");

    option.value = entry.entryId;
    option.textContent =
      `${entry.name} · ${entry.weight} · ${entry.division}`;

    athleteSelect.appendChild(option);
  });
}

function buildMatchPayload(videoUrl = "") {
    const takedowns =
    countMatchEvents("athlete", "TD");

  const escapes =
    countMatchEvents("athlete", "ESC");

  const reversals =
    countMatchEvents("athlete", "REV");

  const nearfall =
    countNearfallEvents("athlete");

  const result =
    state.winner === "athlete"
      ? "Win"
      : state.winner === "opponent"
        ? "Loss"
        : "Result";

  const method =
    getResultLabel(state.resultType) || "Decision";
  return {
    id:
      persistedMatchId ||
      (
        window.crypto?.randomUUID
          ? window.crypto.randomUUID()
          : `match-${Date.now()}-${Math.random().toString(36).slice(2)}`
      ),
    eventName:
      eventNameInput?.value.trim() ||
      matchContext.eventName ||
      "",

    weightClass:
      weightClassInput?.value.trim() ||
      matchContext.weightClass ||
      "",
    formatKey: state.formatKey,
    formatLabel: state.format.label,

    athlete:
      athleteNameInput?.value.trim() ||
      matchContext.athleteName ||
      "Athlete B",

    opponent:
      opponentNameInput?.value.trim() ||
      matchContext.opponentName ||
      "Athlete A",

    greenTeam:
      greenTeamInput?.value.trim() ||
      matchContext.greenTeam ||
      "",

    redTeam:
      redTeamInput?.value.trim() ||
      matchContext.redTeam ||
      "",

    tournamentDate:
      matchContext.tournamentDate || "",

    tournamentLocation:
      matchContext.tournamentLocation || "",

    bracketRound:
      matchContext.bracketRound || "",

    athleteScore: state.athleteScore,
    opponentScore: state.opponentScore,

    currentRound: state.currentRound,
    roundStarts: state.roundStarts,
    choiceHistory: state.choiceHistory,

    position: state.position,

    winner: state.winner,
    resultType: state.resultType,

        result,
    method,

    pointsFor:
      state.athleteScore,

    pointsAgainst:
      state.opponentScore,

    takedowns,
    escapes,
    reversals,
    nearfall,

    clock: formatTime(state.time),
    timeRemaining: state.time,

    rounds: getVisibleRounds(state, events),
    events,

    notes:
      document
        .getElementById("coachNotes")
        ?.value.trim() || "",


videoUrl:
  (
    document.querySelector("#videoUrlInput")?.value ||
    document.querySelector("[name='videoUrl']")?.value ||
    ""
  ).trim(),

    videoHost: "youtube",
    videoVisibility: "unlisted",
    uploadedAt: "",

    savedAt:
      new Date().toISOString(),

    source: "coach-console"
  };
}
function countMatchEvents(side, shortCode) {
  return events.filter(event =>
    event.side === side &&
    String(event.short || event.code || "")
      .toUpperCase()
      .startsWith(shortCode)
  ).length;
}

function countNearfallEvents(side) {
  return events.filter(event =>
    event.side === side &&
    String(event.short || event.code || "")
      .toUpperCase()
      .startsWith("NF")
  ).length;
}

function saveLocalDraft() {
  localStorage.setItem(
    "coach_console_active_match",
    JSON.stringify(buildMatchPayload())
  );
}

function attachUploadedVideoUrl(videoUrl) {
  const videoInput =
    document.getElementById("videoUrlInput");

  if (!videoInput || !videoUrl) return;

  videoInput.value =
    videoUrl;

  saveLocalDraft();

  setStatus("YouTube URL attached.");
}

window.attachUploadedVideoUrl =
  attachUploadedVideoUrl;

let persistedMatchId = "";

async function saveMatchToHistory() {
  console.log("SAVE MATCH TO HISTORY FIRED");

  if (!persistedMatchId) {
    persistedMatchId = globalThis.crypto?.randomUUID?.() || String(Date.now());
  }

  const match = {
    ...buildMatchPayload(),
    id: persistedMatchId,
    videoUrl:
      document
        .getElementById("videoUrlInput")
        ?.value
        ?.trim() || ""
  };

  const intelligence =
    runIntelligence(match);

  const matchWithIntelligence = {
    ...match,
    intelligence,
    intelligenceRanAt:
      new Date().toISOString()
  };

  const result = await persistMatch({
    ...matchWithIntelligence,
    savedToMatchLogAt:
      new Date().toISOString()
  });
  persistedMatchId = result.match.id;

  localStorage.setItem(
    "coach_console_last_match",
    JSON.stringify(result.match)
  );

  setStatus(result.synced ? "Saved to match log." : "Saved locally — sync pending.");
  return result.match;
}

/* MODE */
function setMode(newMode) {
  if (newMode === "review" && mediaRecorder && mediaRecorder.state === "recording") {
    alert("Pause or finish recording before entering review mode.");
    return;
  }

  mode = newMode;

  liveBtn?.classList.toggle("active", mode === "live");
  reviewBtn?.classList.toggle("active", mode === "review");
  document.body.classList.toggle("review-mode", mode === "review");

  if (mode === "review") {
    setStatus("Review mode");
    if (preview) preview.controls = true;
    if (reviewPreview) reviewPreview.controls = true;
  } else {
    setStatus("Live mode");
    if (preview) preview.controls = false;
  }

  renderAll();
}

liveBtn?.addEventListener("click", () => setMode("live"));
reviewBtn?.addEventListener("click", () => setMode("review"));



/* FORMAT */
matchFormatSelect?.addEventListener("change", e => {
  setMatchFormat(state, e.target.value);
  state.position = "neutral";
  events = [];

  resetClock({
  state,
  getRoundSeconds,
  updateClock: () =>
    updateClock({ clockEl, formatTime, state }),
  setStatus,
  saveLocalDraft
});
  renderAll();
  saveLocalDraft();
});


weightGroupSelect?.addEventListener("change", () => {
  loadWeightClasses(weightGroupSelect.value);
});

athleteSelect?.addEventListener("change", () => {
  const entry = getTournamentEntry(athleteSelect.value);
  if (!entry) return;

  const side = sandmanColorSelect?.value || "green";

  eventNameInput.value = entry.eventName;
  weightGroupSelect.value = entry.weightGroup;

  loadWeightClasses(entry.weightGroup);
  weightClassInput.value = entry.weight;
const formatKey =
  DEFAULT_FORMAT_BY_WEIGHT_GROUP[entry.weightGroup];

if (formatKey) {
  matchFormatSelect.value = formatKey;
  setMatchFormat(state, formatKey);
}



  if (side === "red") {
    opponentNameInput.value = entry.name;
    redTeamInput.value = entry.team;

    athleteNameInput.value = "";
    greenTeamInput.value = "";
  } else {
    athleteNameInput.value = entry.name;
    greenTeamInput.value = entry.team;

    opponentNameInput.value = "";
    redTeamInput.value = "";
  }

  renderAll();
  saveLocalDraft();
});




function loadWeightClasses(group) {
  if (!weightClassInput) return;

  weightClassInput.innerHTML = `
    <option value="">
      Select Weight
    </option>
  `;

  const weights =
    WEIGHT_CLASSES[group] || [];

  weights.forEach(weight => {
    const option =
      document.createElement("option");

    option.value = String(weight);
    option.textContent = `${weight} lb`;

    weightClassInput.appendChild(option);
  });
}


/* MATCH SETUP */
confirmMatchSetupBtn?.addEventListener("click", () => {
  matchConfirmed = true;
  state.position = "neutral";

  const chosenColor = sandmanColorSelect?.value || "green";

  state.sandmanSide =
    chosenColor === "green" ? "athlete" : "opponent";

  const manualAthleteNameInput =
    document.getElementById("manualAthleteName");

  const manualAthlete =
    manualAthleteNameInput?.value.trim();

  if (
    manualAthlete &&
    !athleteNameInput?.value.trim()
  ) {
    athleteNameInput.value =
      manualAthlete;
  }

  updateIdentityStrip({
    greenDisplayName,
    athleteNameInput,
    athleteName: matchContext.athleteName,
    redDisplayName,
    opponentNameInput,
    opponentName: matchContext.opponentName,
    greenTeamEl,
    greenTeamInput,
    greenTeam: matchContext.greenTeam,
    redTeamEl,
    redTeamInput,
    redTeam: matchContext.redTeam,
    eventNameDisplay,
    eventNameInput,
    eventName: matchContext.eventName,
    weightClassDisplay,
    weightClassInput,
    weightClass: matchContext.weightClass
  });

  if (weightGroupDisplay) {
    const division =
      String(matchContext.weightGroup || "").trim();

    weightGroupDisplay.textContent =
      division
        ? `Division: ${division}`
        : "Division: —";
  }

  lockMatchSetup({
    locked: true,
    eventNameInput,
    weightClassInput,
    redTeamInput,
    greenTeamInput,
    athleteNameInput,
    opponentNameInput,
    matchFormatSelect
  });

  matchSetupEl?.classList.add("hidden");

  updateStartButton({
    startBtn,
    text: "Start",
    disabled: false
  });

  setStatus("Match confirmed — ready to start");

  saveLocalDraft();
});

/* START */
startBtn?.addEventListener("click", async () => {

    if (!matchConfirmed) {
    setStatus("Confirm match before starting");
    return;
  }
  try {
    // --- CAMERA (only runs on user click) ---
    if (!stream) {
      stream = await navigator.mediaDevices.getUserMedia({
        
        video: { facingMode: { ideal: "environment" } },
        audio: false // safer for iPhone
      });
         window.__cornermanStream = stream;

      if (preview) {
        preview.srcObject = stream;
        preview.controls = false;
      }

      chunks = [];

      const mimeType =
  MediaRecorder.isTypeSupported("video/mp4")
    ? "video/mp4"
    : MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
      ? "video/webm;codecs=vp8"
      : "";

mediaRecorder = mimeType
  ? new MediaRecorder(stream, { mimeType })
  : new MediaRecorder(stream);
console.log("Recorder MIME:", mediaRecorder.mimeType);

      window.__cornermanMediaRecorder = mediaRecorder;

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, {
  type: mediaRecorder?.mimeType || "video/mp4"
});
lastVideoBlob = blob;

        const videoUrl = URL.createObjectURL(blob);

        if (preview) {
          preview.srcObject = null;
          preview.src = videoUrl;
          preview.controls = true;
        }

        if (reviewPreview) {
          reviewPreview.srcObject = null;
          reviewPreview.src = videoUrl;
          reviewPreview.controls = true;
        }

        setMode("review");
        renderAll();


console.log("video captured", videoUrl);

localStorage.setItem(
  "coach_console_last_match",
  JSON.stringify(buildMatchPayload())
);

        setStatus("Recording saved locally.");
updateStartButton({
  startBtn,
  text: "Start",
  disabled: true
});

      };

mediaRecorder.start(1000);
      setStatus("Camera ready.");
    }

// --- CLOCK (separate, always runs on click) ---
startClock({
  state,

  updateClock: () =>
    updateClock({ clockEl, formatTime, state }),

  saveLocalDraft,

  publishLiveState: () =>
    publishLiveState({
      state,
      events,
      athleteName:
        athleteNameInput?.value || "Green",
      opponentName:
        opponentNameInput?.value || "Red"
    }),

  handleRoundComplete,
  setStatus,
  formatRoundLabel
});

updateStartButton({
  startBtn,
  text: "Running",
  disabled: true
});

setStatus(`${formatRoundLabel(state.currentRound)} started`);

  } catch (err) {
    console.error("Camera error:", err);
    setStatus("Camera access failed.");
  }
});
greenChooserBtn?.addEventListener("click", () => {
  setSecondPeriodFirstChooser(state, "athlete");

  choicePanel?.classList.remove("red-choice");
  choicePanel?.classList.add("green-choice");

  chooserPanel?.classList.add("hidden");

  renderAll();
  saveLocalDraft();
});

redChooserBtn?.addEventListener("click", () => {
  setSecondPeriodFirstChooser(state, "opponent");

  choicePanel?.classList.remove("green-choice");
  choicePanel?.classList.add("red-choice");

  chooserPanel?.classList.add("hidden");

  renderAll();
  saveLocalDraft();
});

/* PAUSE */
pauseBtn?.addEventListener("click", () => {

  stopClock({
    state,
    setStatus,
    saveLocalDraft,
    statusText: "Match paused"
  });

  pauseVideoCapture({
    getMediaRecorder: () => mediaRecorder
  });

loadReplayFromCurrentChunks({
  getChunks: () => chunks,
  reviewPreview,
  setStatus
});

// stay in live mode

setStatus("Match paused — still live");

updateStartButton({
  startBtn,
  text: "Resume",
  disabled: false
});


});

/* STOP */
stopBtn?.addEventListener("click", () => {
  clearInterval(state.timer);
  state.timer = null;

  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }

  stopCameraStream();
  mediaRecorder = null;

updateStartButton({
  startBtn,
  text: "Start",
  disabled: true
});

  setStatus("Match stopped — open Match Summary");

syncAutoResult({
  state,
  getResultTypeFromMargin: diff =>
    getResultTypeFromMargin({
      RESULT_TYPES,
      diff
    }),
  setMatchResult
});

  matchSummaryModal?.classList.remove("hidden");

  renderAll();
  saveLocalDraft();
});

/* RESET CLOCK */
resetBtn?.addEventListener("click", resetClock);

/* RESET MATCH */
resetMatchBtn?.addEventListener("click", () => {
  clearInterval(state.timer);
  state.timer = null;

  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }

  stopCameraStream();
  mediaRecorder = null;
  chunks = [];

  events = [];
  persistedMatchId = "";

  state.athleteScore = 0;
  state.opponentScore = 0;
  state.currentRound = "1";
  state.roundStarts = { "1": "neutral" };
  state.choiceHistory = [];
  state.winner = null;
  state.resultType = null;
  state.resultLocked = false;
  state.pendingChoice = null;
  state.position = "neutral";
  state.time = getRoundSeconds(state, state.currentRound);

  matchConfirmed = false;
lockMatchSetup({
  locked: false,
  eventNameInput,
  weightClassInput,
  redTeamInput,
  greenTeamInput,
  athleteNameInput,
  opponentNameInput,
  matchFormatSelect
});

  matchSetupEl?.classList.remove("hidden");
  chooserPanel?.classList.add("hidden");
  choicePanel?.classList.add("hidden");

  if (preview) {
    preview.srcObject = null;
    preview.removeAttribute("src");
    preview.load();
  }

  if (reviewPreview) {
    reviewPreview.removeAttribute("src");
    reviewPreview.load();
  }

updateStartButton({
  startBtn,
  text: "Start",
  disabled: true
});

  setStatus("Match reset — confirm match");
saveMatchLogBtn.disabled = false;
saveMatchLogBtn.textContent = "Save to Match Log";

  renderAll();
  saveLocalDraft();
});

/* MATCH ACTIONS */
matchActionsBtn?.addEventListener("click", () => {
  matchActionsPanel?.classList.toggle("hidden");
});

/* MANUAL NEXT ROUND */
manualNextRoundBtn?.addEventListener("click", () => {
  handleRoundComplete();
});

/* ROUND CHOICE */
choicePanel?.querySelectorAll("[data-choice]").forEach(btn => {
  btn.addEventListener("click", () => {
    const choice = btn.dataset.choice;

    const applied = applyRoundChoice(state, choice);
    if (!applied) return;

    const startPosition = state.roundStarts[state.currentRound];
setPositionFromRoundStart(state, startPosition);
    events.push(createRoundStartEvent({
      state,
      round: state.currentRound,
      position: startPosition,
      videoTime: preview?.currentTime || 0
    }));

    pauseVideoCapture();
updateStartButton({
  startBtn,
  text: "Start",
  disabled: false
});

    setStatus(`${formatRoundLabel(state.currentRound)} ready — press Start`);

    renderAll();
    saveLocalDraft();
  });
});

/* CLOCK ADJUST */
toggleAdjustClockBtn?.addEventListener("click", () => {
  adjustClockPanel?.classList.toggle("hidden");
});

document.querySelectorAll("[data-adjust-time]").forEach(btn => {
  btn.addEventListener("click", () => {

    adjustClock({
  state,
  seconds: Number(btn.dataset.adjustTime || 0),
  updateClock: () =>
    updateClock({ clockEl, formatTime, state }),
  saveLocalDraft
});
  });
});

/* SCORE ADJUST */
toggleAdjustScoreBtn?.addEventListener("click", () => {
  adjustScorePanel?.classList.toggle("hidden");
});

document.querySelectorAll("[data-adjust-score]").forEach(btn => {
  btn.addEventListener("click", () => {
    const side = btn.dataset.adjustScoreSide;
    const val = Number(btn.dataset.adjustScore);

    if (!side || !val) return;

    if (side === "athlete") {
      state.athleteScore = Math.max(0, state.athleteScore + val);
    } else if (side === "opponent") {
      state.opponentScore = Math.max(0, state.opponentScore + val);
    }

    renderAll();
    saveLocalDraft();
    setStatus("Score adjusted");
  });
});

/* SCORING */
document.querySelectorAll("[data-code]").forEach(btn => {
  btn.addEventListener("click", () => {
    if (!matchConfirmed) {
      setStatus("Confirm match before scoring");
      return;
    }

    if (mode === "review") return;
    if (!state.timer) {
  setStatus("Start match before scoring");
  return;
}

    if (state.pendingChoice) {
      setStatus("Choose start position first");
      return;
    }

    const side = btn.dataset.side;
    const code = btn.dataset.code;
    const rule = SCORING_RULES[code];

    if (!rule) return;

    if (!isValidAction(state.position, side, code)) {
      setStatus(getInvalidMessage(state.position, side));
      return;
    }

    applyScore(state, side, rule.points);
    updatePositionAfterScore(state, side, code);

checkTechFall({
  state,
  setMatchResult,
  showFinishFlash,
  stopClock: ({ statusText }) =>
    stopClock({
      state,
      setStatus,
      saveLocalDraft,
      statusText
    }),
  pauseVideoCapture,
  updateStartButton: ({ text, disabled }) =>
    updateStartButton({
      startBtn,
      text,
      disabled
    }),
  matchSummaryModal
});

events.push(createScoreEvent({
  state,
  side,
  code,
  rule,
  videoTime: preview?.currentTime || 0
}));

renderAll();
saveLocalDraft();

publishLiveState({
  state,
  events,
  athleteName:
    athleteNameInput?.value || "Green",

  opponentName:
    opponentNameInput?.value || "Red"
});

    btn.style.transform = "scale(.95)";
    setTimeout(() => {
      btn.style.transform = "";
    }, 90);
  });
});
/* REF CALLS */
document.querySelectorAll("[data-ref-call]").forEach(btn => {
  btn.addEventListener("click", () => {
    if (!matchConfirmed) {
      setStatus("Confirm match before ref calls");
      return;
    }

    if (mode === "review") return;

    if (!state.timer) {
      setStatus("Start match before ref calls");
      return;
    }

    const side = btn.dataset.side;
    const callType = btn.dataset.refCall;

    // 👉 THIS IS YOUR PLACEMENT
    const ruleCheck = isRefCallAllowed(state, side, callType);

    if (!ruleCheck.allowed) {
      setStatus(ruleCheck.message || "Invalid ref call");
      return;
    }

    const result = handleRefProgression(state, side, callType);
    updateRefButtonLabels();

    if (result?.dq) {
      setMatchResult(state, result.winner, "dq", true);
stopClock({
  state,
  setStatus,
  saveLocalDraft,
  statusText: "DQ — match stopped"
});

      pauseVideoCapture();
updateStartButton({
  startBtn,
  text: "Start",
  disabled: true
});


      matchSummaryModal?.classList.remove("hidden");
    }

    events.push(createRefCallEvent({
      state,
      side,
      callType,
      result,
      videoTime: preview?.currentTime || 0
    }));

checkTechFall({
  state,
  setMatchResult,
  showFinishFlash,
  stopClock: ({ statusText }) =>
    stopClock({
      state,
      setStatus,
      saveLocalDraft,
      statusText
    }),
  pauseVideoCapture,
  updateStartButton: ({ text, disabled }) =>
    updateStartButton({
      startBtn,
      text,
      disabled
    }),
  matchSummaryModal
});

    setStatus(result?.message || "Ref call recorded");

    renderAll();
    saveLocalDraft();
  });
});
/* UNDO */
document.getElementById("undoBtn")?.addEventListener("click", () => {
  const last = events.pop();
  if (!last) return;

  if (last.type === "score") {
    undoScore(state, last.side, last.points);
  }

  // position rebuild is intentionally simple for v1
  state.position = events.reduce((pos, e) => {
    if (e.type !== "score") return pos;
    if (e.code === "td3") return e.side === "athlete" ? "green_top" : "red_top";
    if (e.code === "esc1") return "neutral";
    if (e.code === "rev2") return e.side === "athlete" ? "green_top" : "red_top";
    return pos;
  }, "neutral");

  renderAll();
  saveLocalDraft();
});

/* MATCH SUMMARY */
closeMatchSummaryBtn?.addEventListener("click", () => {
  matchSummaryModal?.classList.add("hidden");
});

document.querySelectorAll("[data-winner]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-winner]").forEach(b => {
      b.classList.remove("active");
    });

    btn.classList.add("active");

    setMatchResult(state, btn.dataset.winner, state.resultType, true);
    renderAll();
    saveLocalDraft();
  });
});

document.querySelectorAll("[data-finish-type]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-finish-type]").forEach(b => {
      b.classList.remove("active");
    });

    btn.classList.add("active");

    setMatchResult(state, state.winner, btn.dataset.finishType, true);

    if (btn.dataset.finishType === "pin") {
      showFinishFlash("PIN", state.winner);
    }

    if (btn.dataset.finishType === "major") {
      showFinishFlash("MAJOR", state.winner);
    }

    renderAll();
    saveLocalDraft();
  });
});
saveMatchLogBtn?.addEventListener("click", async () => {
  console.log(
    "VIDEO INPUT BEFORE SAVE:",
    document.getElementById("videoUrlInput")?.value
  );

  const match = await saveMatchToHistory();

  console.log(
    "MATCH VIDEO URL AFTER SAVE:",
    match.videoUrl
  );

  saveMatchLogBtn.disabled = true;
  saveMatchLogBtn.textContent = "Saved";

});
connectYouTubeBtn?.addEventListener("click", () => {
  connectYouTubeUpload();
});

uploadMatchVideoBtn?.addEventListener("click", async () => {
  if (!lastVideoBlob) {
    setStatus("No match video ready to upload.");
    return;
  }

  try {
    setStatus("Uploading match video...");

    const result = await uploadVideoToYouTube({
      videoBlob: lastVideoBlob,
      title: `${athleteNameInput?.value || "Green"} vs ${opponentNameInput?.value || "Red"}`,
      description: "Uploaded from CornermanAI match console",
      tags: ["CornermanAI", "wrestling"]
    });

    attachUploadedVideoUrl(result.videoUrl);

    setStatus("YouTube upload complete.");
  } catch (error) {
    console.error("YouTube upload failed:", error);
    setStatus("YouTube upload failed.");
  }
});

attachLastUploadBtn?.addEventListener("click", () => {
  const videoUrl =
    localStorage.getItem(
      "cornerman_last_uploaded_video_url"
    );

  if (!videoUrl) {
    setStatus("No uploaded video URL found.");
    return;
  }

  attachUploadedVideoUrl(videoUrl);
});
/* FINISH & SAVE */
finishBtn?.addEventListener("click", async () => {
stopClock({
  state,
  setStatus,
  saveLocalDraft,
  statusText: "Match finished"
});


  if (!state.winner || !state.resultType) {
    setStatus("Choose winner and win type before saving");
    matchSummaryModal?.classList.remove("hidden");
    return;
  }

  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }

  stopCameraStream();
const match = await saveMatchToHistory();
  console.log("MATCH PAYLOAD", match);


  const recon =
  runRecon(match);

console.log("RECON", recon);

localStorage.setItem(
  "coach_console_last_recon",
  JSON.stringify(recon)
);

  matchSummaryModal?.classList.add("hidden");

publishLiveState({
  state,
  events,
  athleteName:
    athleteNameInput?.value || "Green",

  opponentName:
    opponentNameInput?.value || "Red"
});

const shouldFlash = ["pin", "tech"].includes(state.resultType);

if (shouldFlash) {
  showFinishFlash(getResultLabel(state.resultType).toUpperCase(), state.winner);
}

setStatus("Finalizing video for review...");}
);
/* ARENA MODE */
const arenaModeToggle = document.getElementById("arenaModeToggle");

arenaModeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("arena-mode");

  const isArena = document.body.classList.contains("arena-mode");
  arenaModeToggle.textContent = isArena ? "Normal" : "Arena";
});

function loadPendingMatchSetup() {
  const pendingMatch =
    JSON.parse(
      localStorage.getItem(
        "cornerman_pending_match"
      ) || "{}"
    );

  if (!pendingMatch.source) return;

  matchContext = {
    eventName:
      pendingMatch.eventName || "",

    weightClass:
      pendingMatch.weightClass || "",

    weightGroup:
      pendingMatch.weightGroup || "",

    athleteName:
      pendingMatch.athleteName || "Athlete B",

    opponentName:
      pendingMatch.opponentName || "Athlete A",

    greenTeam:
      pendingMatch.teamA || "",

    redTeam:
      pendingMatch.opponentTeam || "",

    tournamentDate:
      pendingMatch.tournamentDate || "",

    tournamentLocation:
      pendingMatch.tournamentLocation || "",

    bracketRound:
      pendingMatch.bracketRound || ""
  };

  const formatKey =
    pendingMatch.matchFormat ||
    DEFAULT_FORMAT_BY_WEIGHT_GROUP[
      pendingMatch.weightGroup
    ];

  if (
    formatKey &&
    MATCH_FORMATS[formatKey]
  ) {
    matchFormatSelect.value = formatKey;
    setMatchFormat(state, formatKey);
  }

  if (sandmanColorSelect) {
    sandmanColorSelect.value =
      pendingMatch.athleteSide || "green";
  }

  matchConfirmed = true;

  matchSetupEl?.classList.add("hidden");

  updateStartButton({
    startBtn,
    text: "Start",
    disabled: false
  });

  renderAll();

  setStatus(
    "Match loaded from launcher"
  );
}
loadPendingMatchSetup();

/* INIT */
renderControls({
  matchFormatSelect,
  MATCH_FORMATS,
  state
});

renderAll();

saveLocalDraft();
publishLiveState({
  state,
  events,
  athleteName:
    athleteNameInput?.value || "Green",

  opponentName:
    opponentNameInput?.value || "Red"
});

setMode("live");
if (!matchConfirmed) {
  updateStartButton({
    startBtn,
    text: "Start",
    disabled: true
  });
}

updateRefButtonLabels({
  state
});

initYouTubeUploader({
  onConnected: () =>
    console.log("YouTube connected"),
  onError: console.error
});

initializeAthleteDetailModal();
loadTournamentRosterSelect();
initializeMatchConfirmAccordion();
