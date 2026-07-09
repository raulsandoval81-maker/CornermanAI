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

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : { ...defaultState };
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