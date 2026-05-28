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

  const list =
    events.slice().reverse();

  const visible =
    limit ? list.slice(0, limit) : list;

  visible.forEach(e => {
    const div =
      document.createElement("div");

    div.className =
      `event ${e.side ? sideClass(e.side) : ""}`;

    if (e.type === "round_start") {
      div.textContent =
        `${formatRoundLabel(e.round)} · START · ${e.position}`;
    } else {
      div.textContent =
        `${e.clock} · ${formatRoundLabel(e.round)} · ${formatSide(e.side)} · ${e.label}${e.points ? " +" + e.points : ""}`;
    }

    div.addEventListener("click", () => {
      const video =
        getVideoTarget();

      if (!video || typeof e.videoTime !== "number") return;

      video.currentTime =
        e.videoTime;

      video.play();
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
      roundEvents.forEach(e => {
        const chip =
          document.createElement("span");

        if (e.type === "round_start") {
          chip.className =
            "flow-stamp setup";

          chip.textContent =
            `START ${e.position}`;
        } else {
          chip.className =
            "flow-stamp " +
            (e.side === "athlete" ? "green" : "red");

          const label =
            e.short || e.code.toUpperCase();

          chip.textContent =
            e.points
              ? `${label} +${e.points}`
              : label;

          chip.title =
            `${e.clock} • ${formatSide(e.side)} • ${e.label}`;
        }

        chip.addEventListener("click", () => {
          const video =
            getVideoTarget();

          if (!video || typeof e.videoTime !== "number") return;

          video.currentTime =
            e.videoTime;

          video.play();
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

    (grouped[round] || []).forEach(e => {
      const chip =
        document.createElement("span");

      if (e.type === "round_start") {
        chip.className =
          "rail-chip setup";

        chip.textContent =
          `START ${e.position}`;
      } else {
        chip.className =
          "rail-chip " +
          (e.side === "athlete" ? "green" : "red");

        const eventLabel =
          e.short || e.code.toUpperCase();

        chip.textContent =
          e.points
            ? `${eventLabel} +${e.points}`
            : eventLabel;

        chip.title =
          `${e.clock} • ${formatSide(e.side)} • ${e.label}`;
      }

      chip.addEventListener("click", () => {
        const video =
          getVideoTarget();

        if (!video || typeof e.videoTime !== "number") return;

        video.currentTime =
          e.videoTime;

        video.play();
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