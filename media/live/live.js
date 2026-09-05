const STORAGE_KEY = "cornerman-live-state";

const defaultState = {
  greenName: "Maximus",
  redName: "Opponent",
  greenScore: 0,
  redScore: 0,
  period: 1,
  clock: "2:00",
  position: "neutral",
  lastEvent: "Match ready.",
  timeline: ["0:00 Match ready."]
};

let state = loadState();

const greenNameInput = document.getElementById("greenNameInput");
const redNameInput = document.getElementById("redNameInput");
const greenScoreText = document.getElementById("greenScoreText");
const redScoreText = document.getElementById("redScoreText");
const clockInput = document.getElementById("clockInput");
const periodInput = document.getElementById("periodInput");

function formatClock(value) {
  if (typeof value !== "number") return value || "0:00";
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return { ...defaultState, timeline: [...defaultState.timeline] };

  try {
    const stored = JSON.parse(saved);
    const eventTimeline = Array.isArray(stored.events)
      ? stored.events.map(event => {
          if (typeof event === "string") return event;
          const side = event.side === "athlete" ? "Green" : event.side === "opponent" ? "Red" : "";
          const label = event.label || event.short || event.code || event.type || "Event";
          return `${event.clock || ""} ${side} ${label}${event.points ? ` +${event.points}` : ""}`.trim();
        })
      : [];

    return {
      ...stored,
      greenName: stored.greenName || stored.athleteName || defaultState.greenName,
      redName: stored.redName || stored.opponentName || defaultState.redName,
      greenScore: Number(stored.greenScore ?? stored.athleteScore ?? 0),
      redScore: Number(stored.redScore ?? stored.opponentScore ?? 0),
      period: stored.period || stored.round || defaultState.period,
      clock: formatClock(stored.clock || defaultState.clock),
      position: stored.position || defaultState.position,
      lastEvent: stored.lastEvent || defaultState.lastEvent,
      timeline: Array.isArray(stored.timeline) ? stored.timeline : eventTimeline.length ? eventTimeline : [...defaultState.timeline]
    };
  } catch {
    return { ...defaultState, timeline: [...defaultState.timeline] };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("cornerman-live-update"));
  renderControl();
}

function addEvent(text) {
  state.lastEvent = text;
  state.timeline.push(`${state.clock} ${text}`);
}

function renderControl() {
  greenNameInput.value = state.greenName;
  redNameInput.value = state.redName;
  greenScoreText.textContent = state.greenScore;
  redScoreText.textContent = state.redScore;
  clockInput.value = state.clock;
  periodInput.value = state.period;
}

document.getElementById("saveNamesBtn").addEventListener("click", () => {
  state.greenName = greenNameInput.value || "Green";
  state.redName = redNameInput.value || "Red";
  addEvent("Names updated.");
  saveState();
});

document.getElementById("saveClockBtn").addEventListener("click", () => {
  state.clock = clockInput.value || "0:00";
  state.period = Number(periodInput.value || 1);
  addEvent("Clock updated.");
  saveState();
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;

    switch (action) {
      case "neutral":
        state.position = "neutral";
        addEvent("Neutral position.");
        break;

      case "greenTD":
        state.greenScore += 3;
        state.position = "green_top";
        addEvent("Green takedown +3.");
        break;

      case "redTD":
        state.redScore += 3;
        state.position = "red_top";
        addEvent("Red takedown +3.");
        break;

      case "greenEscape":
        state.greenScore += 1;
        state.position = "neutral";
        addEvent("Green escape +1.");
        break;

      case "redEscape":
        state.redScore += 1;
        state.position = "neutral";
        addEvent("Red escape +1.");
        break;

      case "greenReversal":
        state.greenScore += 2;
        state.position = "green_top";
        addEvent("Green reversal +2.");
        break;

      case "redReversal":
        state.redScore += 2;
        state.position = "red_top";
        addEvent("Red reversal +2.");
        break;

      case "nearfallGreen":
        state.position = "green_nearfall";
        addEvent("Green near fall pressure.");
        break;

      case "nearfallRed":
        state.position = "red_nearfall";
        addEvent("Red near fall pressure.");
        break;

      case "pinThreat":
        state.position = "red_pin";
        addEvent("Pin threat.");
        break;

      case "reset":
        state = { ...defaultState };
        break;
    }

    saveState();
  });
});

renderControl();
