const STORAGE_KEY = "cornerman-live-state";

const state = {
  athleteName: "Green",
  opponentName: "Red",
  athleteScore: 0,
  opponentScore: 0,
  round: "1",
  clock: "2:00",
  position: "neutral",
  winner: null,
  resultType: null,
  matchFinished: false,
  lastEvent: "Match ready.",
  timeline: ["Match ready."]
};

const greenNameEl = document.getElementById("greenName");
const redNameEl = document.getElementById("redName");
const greenScoreEl = document.getElementById("greenScore");
const redScoreEl = document.getElementById("redScore");
const matchClockEl = document.getElementById("matchClock");
const matchPeriodEl = document.getElementById("matchPeriod");
const matVisualEl = document.getElementById("matVisual");
const positionLabelEl = document.getElementById("positionLabel");
const lastEventEl = document.getElementById("lastEvent");
const timelineEl = document.getElementById("timeline");
let resultBannerEl = document.getElementById("resultBanner");

const POSITION_ASSETS = {
  neutral: "./assets/positions/neutral.png",

  green_top: "./assets/positions/green-top.png",
  red_top: "./assets/positions/red-top.png",

  green_nearfall: "./assets/positions/green-nearfall.png",
  red_nearfall: "./assets/positions/red-nearfall.png",

  green_reversal: "./assets/positions/green-reversal.png",
  red_reversal: "./assets/positions/red-reversal.png",

  green_pin: "./assets/positions/green-pin.png",
  red_pin: "./assets/positions/red-pin.png"
};

const positionMap = {
  neutral: {
    className: "neutral",
    label: "NEUTRAL",
    asset: POSITION_ASSETS.neutral
  },

  green_top: {
    className: "green-top",
    label: "GREEN ON TOP",
    asset: POSITION_ASSETS.green_top
  },

  red_top: {
    className: "red-top",
    label: "RED ON TOP",
    asset: POSITION_ASSETS.red_top
  },

  green_nearfall: {
    className: "green-nearfall",
    label: "GREEN NEAR FALL",
    asset: POSITION_ASSETS.green_nearfall
  },

  red_nearfall: {
    className: "red-nearfall",
    label: "RED NEAR FALL",
    asset: POSITION_ASSETS.red_nearfall
  },

  green_reversal: {
    className: "green-reversal",
    label: "GREEN REVERSAL",
    asset: POSITION_ASSETS.green_reversal
  },

  red_reversal: {
    className: "red-reversal",
    label: "RED REVERSAL",
    asset: POSITION_ASSETS.red_reversal
  },

  green_pin: {
    className: "green-pin",
    label: "GREEN PIN",
    asset: POSITION_ASSETS.green_pin
  },

  red_pin: {
    className: "red-pin",
    label: "RED PIN",
    asset: POSITION_ASSETS.red_pin
  }
};

const imageClassMap = {
  neutral: "neutral-img",

  green_top: "green-top-img",
  red_top: "red-top-img",

  green_nearfall: "green-nearfall-img",
  red_nearfall: "red-nearfall-img",

  green_reversal: "green-reversal-img",
  red_reversal: "red-reversal-img",

  green_pin: "green-pin-img",
  red_pin: "red-pin-img"
};

function ensurePositionImage() {
  let img = document.getElementById("positionImage");

  if (!img) {
    img = document.createElement("img");
    img.id = "positionImage";
    img.className = "position-image";
    img.alt = "Current wrestling position";
    matVisualEl.innerHTML = "";
    matVisualEl.appendChild(img);
  }

  return img;
}

function formatClock(value) {
  if (typeof value === "number") {
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  return value || "0:00";
}

function formatLastEvent(event) {
  if (!event) return "Match ready.";

  if (typeof event === "string") return event;

  const side =
    event.side === "athlete"
      ? "Green"
      : event.side === "opponent"
        ? "Red"
        : "";

  const label =
    event.label ||
    event.short ||
    event.code ||
    event.type ||
    "Event";

  const points =
    event.points ? ` +${event.points}` : "";

  return `${side} ${label}${points}`.trim();
}

function getFinishPosition(live) {
  if (!live.matchFinished) return live.position || "neutral";

  if (live.resultType === "pin") {
    return live.winner === "athlete"
      ? "green_pin"
      : "red_pin";
  }

  return live.position || "neutral";
}

function loadLiveState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const live = JSON.parse(saved);

    state.athleteName = live.athleteName || "Green";
    state.opponentName = live.opponentName || "Red";

    state.athleteScore = Number(live.athleteScore || 0);
    state.opponentScore = Number(live.opponentScore || 0);

    state.round = live.round || "1";
    state.clock = formatClock(live.clock);

    state.winner = live.winner || null;
    state.resultType = live.resultType || null;
    state.matchFinished = !!live.matchFinished;

    state.position = getFinishPosition(live);

    state.lastEvent = formatLastEvent(live.lastEvent);

    const events =
      Array.isArray(live.events)
        ? live.events
        : live.lastEvent
          ? [live.lastEvent]
          : [];

    state.timeline =
      events.length
        ? events.map(formatLastEvent)
        : [state.lastEvent];

  } catch (error) {
    console.error("Could not parse Cornerman live state:", error);
  }
}

function getResultLabel(type) {
  const map = {
    decision: "DECISION",
    major: "MAJOR",
    tech: "TECH FALL",
    pin: "PIN",
    dq: "DQ",
    forfeit: "FORFEIT"
  };

  return map[type] || String(type || "").toUpperCase();
}

function getWinnerColor(winner) {
  return winner === "athlete" ? "GREEN" : "RED";
}

function ensureResultBanner() {
  if (resultBannerEl) return resultBannerEl;

  resultBannerEl = document.createElement("div");
  resultBannerEl.id = "resultBanner";
  resultBannerEl.className = "result-banner hidden";

  matVisualEl.appendChild(resultBannerEl);

  return resultBannerEl;
}

function render() {
  greenNameEl.textContent = state.athleteName;
  redNameEl.textContent = state.opponentName;

  greenScoreEl.textContent = state.athleteScore;
  redScoreEl.textContent = state.opponentScore;

  matchClockEl.textContent = state.clock;
  matchPeriodEl.textContent = `Period ${state.round}`;

  lastEventEl.textContent = state.lastEvent;

  const currentPosition =
    positionMap[state.position] || positionMap.neutral;

  matVisualEl.className =
    `mat-visual ${currentPosition.className}`;

  const positionImage = ensurePositionImage();

  positionImage.className = "position-image";

  if (imageClassMap[state.position]) {
    positionImage.classList.add(imageClassMap[state.position]);
  }

  if (positionImage.getAttribute("src") !== currentPosition.asset) {
    positionImage.src = currentPosition.asset;
  }
  const resultBanner = ensureResultBanner();

if (state.matchFinished && state.resultType && state.winner) {
  resultBanner.textContent =
    `${getWinnerColor(state.winner)} WINS BY ${getResultLabel(state.resultType)}`;

  resultBanner.classList.remove("hidden");
} else {
  resultBanner.classList.add("hidden");
}

  positionLabelEl.textContent = currentPosition.label;

  const timelineItems = state.timeline
    .slice()
    .reverse()
    .map(item => {
      const row = document.createElement("div");
      row.className = "timeline-item";
      row.textContent = item;
      return row;
    });

  timelineEl.replaceChildren(...timelineItems);
}

function syncViewer() {
  loadLiveState();
  render();
}

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY) {
    syncViewer();
  }
});

setInterval(syncViewer, 1000);

syncViewer();
