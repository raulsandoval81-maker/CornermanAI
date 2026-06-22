export function getInvalidMessage(position, side) {
  if (position === "neutral") {
    return "Neutral — only takedowns allowed";
  }

  if (position === "green_top") {
    return side === "athlete"
      ? "Green top — use Nearfall/Pin"
      : "Red bottom — Escape or Reversal";
  }

  if (position === "red_top") {
    return side === "opponent"
      ? "Red top — use Nearfall/Pin"
      : "Green bottom — Escape or Reversal";
  }

  return "Invalid";
}

export function isValidAction(position, side, code) {
  if (["penalty", "stall", "caution"].includes(code)) {
    return true;
  }

  if (position === "neutral") {
    return code === "td3";
  }

  if (position === "green_top") {
    if (side === "athlete") {
      return ["nf2", "nf3", "nf4"].includes(code);
    }

    if (side === "opponent") {
      return ["esc1", "rev2"].includes(code);
    }
  }

  if (position === "green_nearfall") {
  return side === "athlete"
    ? ["nf2", "nf3", "nf4"].includes(code)
    : ["esc1", "rev2"].includes(code);
}

if (position === "red_nearfall") {
  return side === "opponent"
    ? ["nf2", "nf3", "nf4"].includes(code)
    : ["esc1", "rev2"].includes(code);
}

if (position === "green_reversal") {
  if (side === "athlete") return ["nf2", "nf3", "nf4"].includes(code);
  if (side === "opponent") return ["esc1", "rev2"].includes(code);
  return false;
}

if (position === "red_reversal") {
  if (side === "opponent") return ["nf2", "nf3", "nf4"].includes(code);
  if (side === "athlete") return ["esc1", "rev2"].includes(code);
  return false;
}
  if (position === "red_top") {
    if (side === "opponent") {
      return ["nf2", "nf3", "nf4"].includes(code);
    }

    if (side === "athlete") {
      return ["esc1", "rev2"].includes(code);
    }
  }

  return true;
}

export function updatePositionAfterScore(state, side, code) {
  if (code === "td3") {
    state.position =
      side === "athlete"
        ? "green_top"
        : "red_top";
  }

  if (code === "esc1") {
    state.position = "neutral";
  }

  if (code === "rev2") {
    state.position =
      side === "athlete"
        ? "green_reversal"
        : "red_reversal";
  }

  if (["nf2", "nf3", "nf4"].includes(code)) {
    state.position =
      side === "athlete"
        ? "green_nearfall"
        : "red_nearfall";
  }
}

export function setPositionFromRoundStart(state, position) {
  if (position === "neutral") {
    state.position =
      "neutral";
    return;
  }

  if (
    position === "green_top" ||
    position === "red_bottom"
  ) {
    state.position =
      "green_top";
    return;
  }

  if (
    position === "red_top" ||
    position === "green_bottom"
  ) {
    state.position =
      "red_top";
    return;
  }

  state.position =
    "neutral";
}