const SNAPSHOT_KEYS = [
  "athleteScore",
  "opponentScore",
  "refProgress",
  "position",
  "firstScorer",
  "winner",
  "resultType",
  "resultLocked",
  "roundStarts",
  "choiceHistory",
  "pendingChoice",
  "secondPeriodFirstChooser",
  "secondPeriodDeferred",
  "firstTieBreakerChooser"
];

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

export function captureActionSnapshot(state, eventCount) {
  const values = {};
  SNAPSHOT_KEYS.forEach(key => {
    values[key] = clone(state[key]);
  });
  return { eventCount, values };
}

export function restoreActionSnapshot(state, events, snapshot) {
  if (!snapshot) return false;
  SNAPSHOT_KEYS.forEach(key => {
    state[key] = clone(snapshot.values[key]);
  });
  events.splice(snapshot.eventCount);
  return true;
}

export function pushActionSnapshot(stack, state, events) {
  stack.push(captureActionSnapshot(state, events.length));
}

export function undoAction(stack, state, events) {
  return restoreActionSnapshot(state, events, stack.pop());
}
