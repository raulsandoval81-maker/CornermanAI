function buildYouTubeTimestampUrl(videoUrl, seconds) {
  if (!videoUrl || typeof seconds !== "number") return "";

  const safeSeconds =
    Math.max(0, Math.floor(seconds));

  const cleanUrl =
    videoUrl.trim();

  if (!cleanUrl) return "";

  const shortsMatch =
    cleanUrl.match(/youtube\.com\/shorts\/([^?&/]+)/);

  if (shortsMatch?.[1]) {
    return `https://www.youtube.com/watch?v=${shortsMatch[1]}&t=${safeSeconds}s`;
  }

  const separator =
    cleanUrl.includes("?") ? "&" : "?";

  return `${cleanUrl}${separator}t=${safeSeconds}s`;
}

function getSavedVideoUrl() {
  try {
    return (
      document.querySelector("#videoUrlInput")?.value ||
      JSON.parse(localStorage.getItem("coach_console_active_match") || "{}")
        ?.videoUrl ||
      JSON.parse(localStorage.getItem("coach_console_last_match") || "{}")
        ?.videoUrl ||
      ""
    ).trim();
  } catch {
    return "";
  }
}

function seekLocalVideo({
  event,
  getVideoTarget
}) {
  const video =
    getVideoTarget?.();

  if (!video || typeof event.videoTime !== "number") return;

  video.currentTime =
    event.videoTime;

  video.play();
}

function getEventText({
  event,
  formatRoundLabel,
  formatSide
}) {
  if (event.type === "round_start") {
    return `${formatRoundLabel(event.round)} · START · ${event.position}`;
  }

  return `${event.clock} · ${formatRoundLabel(event.round)} · ${formatSide(event.side)} · ${event.label}${event.points ? " +" + event.points : ""}`;
}

function appendYouTubeLink({
  parent,
  event,
  videoUrl
}) {
  if (!videoUrl || typeof event.videoTime !== "number") return;

  const watchLink =
    document.createElement("a");

  watchLink.href =
    buildYouTubeTimestampUrl(videoUrl, event.videoTime);

  watchLink.target =
    "_blank";

  watchLink.rel =
    "noopener noreferrer";

  watchLink.textContent =
    " 🎥";

  watchLink.title =
    "Open YouTube video at this moment";

  watchLink.addEventListener("click", clickEvent => {
    clickEvent.stopPropagation();
  });

  parent.appendChild(watchLink);
}

export function renderEventList({
  target,
  events,
  limit = null,
  getVideoTarget,
  formatRoundLabel,
  formatSide,
  sideClass
}) {
  if (!target) return;

  target.innerHTML = "";

  const videoUrl =
    getSavedVideoUrl();

  const list =
    events.slice().reverse();

  const visible =
    limit ? list.slice(0, limit) : list;

  visible.forEach(event => {
    const div =
      document.createElement("div");

    div.className =
      `event ${event.side ? sideClass(event.side) : ""}`;

    const label =
      document.createElement("span");

    label.textContent =
      getEventText({
        event,
        formatRoundLabel,
        formatSide
      });

    div.appendChild(label);

    appendYouTubeLink({
      parent: div,
      event,
      videoUrl
    });

    div.addEventListener("click", () => {
      seekLocalVideo({
        event,
        getVideoTarget
      });
    });

    target.appendChild(div);
  });
}

export function renderEvents({
  eventLogEl,
  events,
  getVideoTarget,
  formatRoundLabel,
  formatSide,
  sideClass
}) {
  renderEventList({
    target: eventLogEl,
    events,
    getVideoTarget,
    formatRoundLabel,
    formatSide,
    sideClass
  });
}

export function renderBoutBoardTarget({
  target,
  state,
  events,
  getVideoTarget,
  groupEventsByRound,
  getVisibleRounds,
  formatRoundLabel,
  formatSide
}) {
  if (!target) return;

  const grouped =
    groupEventsByRound(events);

  const visibleRounds =
    getVisibleRounds(state, events);

  target.innerHTML = "";

  visibleRounds.forEach(round => {
    const roundEvents =
      grouped[round] || [];

    const block =
      document.createElement("div");

    block.className =
      "round-block";

    const title =
      document.createElement("div");

    title.className =
      "round-title";

    title.textContent =
      formatRoundLabel(round);

    const eventsWrap =
      document.createElement("div");

    eventsWrap.className =
      "round-events";

    if (!roundEvents.length) {
      const empty =
        document.createElement("span");

      empty.className =
        "round-empty";

      empty.textContent =
        "—";

      eventsWrap.appendChild(empty);
    } else {
      roundEvents.forEach(event => {
        const chip =
          document.createElement("span");

        if (event.type === "round_start") {
          chip.className =
            "flow-stamp setup";

          chip.textContent =
            `START ${event.position}`;
        } else {
          chip.className =
            "flow-stamp " +
            (event.side === "athlete" ? "green" : "red");

          const label =
            event.short || event.code.toUpperCase();

          chip.textContent =
            event.points
              ? `${label} +${event.points}`
              : label;

          chip.title =
            `${event.clock} • ${formatSide(event.side)} • ${event.label}`;
        }

        chip.addEventListener("click", () => {
          seekLocalVideo({
            event,
            getVideoTarget
          });
        });

        eventsWrap.appendChild(chip);
      });
    }

    block.appendChild(title);
    block.appendChild(eventsWrap);
    target.appendChild(block);
  });
}

export function renderBoutBoard({
  boutBoardEl,
  reviewBoutBoardEl,
  state,
  events,
  getVideoTarget,
  groupEventsByRound,
  getVisibleRounds,
  formatRoundLabel,
  formatSide
}) {
  renderBoutBoardTarget({
    target: boutBoardEl,
    state,
    events,
    getVideoTarget,
    groupEventsByRound,
    getVisibleRounds,
    formatRoundLabel,
    formatSide
  });

  renderBoutBoardTarget({
    target: reviewBoutBoardEl,
    state,
    events,
    getVideoTarget,
    groupEventsByRound,
    getVisibleRounds,
    formatRoundLabel,
    formatSide
  });
}

export function renderBoutRailTarget({
  target,
  state,
  events,
  getVideoTarget,
  groupEventsByRound,
  getVisibleRounds,
  formatRoundLabel,
  formatSide
}) {
  if (!target) return;

  const grouped =
    groupEventsByRound(events);

  const visibleRounds =
    getVisibleRounds(state, events);

  target.innerHTML = "";

  visibleRounds.forEach(round => {
    const row =
      document.createElement("div");

    row.className =
      "rail-row";

    const roundLabel =
      document.createElement("div");

    roundLabel.className =
      "rail-round";

    roundLabel.textContent =
      formatRoundLabel(round);

    const eventsWrap =
      document.createElement("div");

    eventsWrap.className =
      "rail-events";

    (grouped[round] || []).forEach(event => {
      const chip =
        document.createElement("span");

      if (event.type === "round_start") {
        chip.className =
          "rail-chip setup";

        chip.textContent =
          `START ${event.position}`;
      } else {
        chip.className =
          "rail-chip " +
          (event.side === "athlete" ? "green" : "red");

        const eventLabel =
          event.short || event.code.toUpperCase();

        chip.textContent =
          event.points
            ? `${eventLabel} +${event.points}`
            : eventLabel;

        chip.title =
          `${event.clock} • ${formatSide(event.side)} • ${event.label}`;
      }

      chip.addEventListener("click", () => {
        seekLocalVideo({
          event,
          getVideoTarget
        });
      });

      eventsWrap.appendChild(chip);
    });

    row.appendChild(roundLabel);
    row.appendChild(eventsWrap);
    target.appendChild(row);
  });
}

export function renderBoutRail({
  boutRailEl,
  reviewBoutRailEl,
  state,
  events,
  getVideoTarget,
  groupEventsByRound,
  getVisibleRounds,
  formatRoundLabel,
  formatSide
}) {
  renderBoutRailTarget({
    target: boutRailEl,
    state,
    events,
    getVideoTarget,
    groupEventsByRound,
    getVisibleRounds,
    formatRoundLabel,
    formatSide
  });

  renderBoutRailTarget({
    target: reviewBoutRailEl,
    state,
    events,
    getVideoTarget,
    groupEventsByRound,
    getVisibleRounds,
    formatRoundLabel,
    formatSide
  });
}