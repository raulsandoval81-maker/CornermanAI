const STORAGE_KEY = "cornerman_live_state";

const state = {
  athleteName: "Green",
  opponentName: "Red",
  athleteScore: 0,
  opponentScore: 0,
  round: "1",
  clock: "2:00",
  position: "neutral",
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

const positionMap = {
  neutral: {
    className: "neutral",
    label: "NEUTRAL"
  },
  green_top: {
    className: "green-top",
    label: "GREEN ON TOP"
  },
  red_top: {
    className: "red-top",
    label: "RED ON TOP"
  },
  nearfall_green: {
    className: "nearfall-green",
    label: "NEAR FALL GREEN"
  },
  nearfall_red: {
    className: "pin-threat",
    label: "NEAR FALL RED"
  },
  pin_threat: {
    className: "pin-threat",
    label: "PIN THREAT"
  }
};

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
    state.position = live.position || "neutral";
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

  positionLabelEl.textContent = currentPosition.label;

  timelineEl.innerHTML = state.timeline
    .slice()
    .reverse()
    .map((item) => `<div class="timeline-item">${item}</div>`)
    .join("");
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