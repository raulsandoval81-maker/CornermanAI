const STORAGE_KEY =
  "cornerman_matches";
const { escapeHtml } = window.CornermanSafe;

const athleteSelect =
  document.getElementById("athleteSelect");

let matches = [];

init();

function init() {
  matches =
    getMatches();

  loadAthletes();

  athleteSelect?.addEventListener(
    "change",
    buildDashboard
  );
}

function getMatches() {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
  } catch (error) {
    console.error(
      "Could not read cornerman_matches:",
      error
    );

    return [];
  }
}

function loadAthletes() {
  if (!athleteSelect) return;

  const athleteMap = new Map();

  matches.forEach(match => {
    const raw = String(match.athlete || "").trim();
    if (!raw) return;

    const key = raw.toLowerCase();

    if (!athleteMap.has(key)) {
      athleteMap.set(key, raw);
    }
  });

  const athletes =
    [...athleteMap.values()].sort();

  athleteSelect.innerHTML = `
    <option value="">
      Select Athlete
    </option>
  `;

  athletes.forEach(name => {
    const option = document.createElement("option");

    option.value = name;
    option.textContent = name;

    athleteSelect.appendChild(option);
  });
}

function buildDashboard() {
  const athlete =
    athleteSelect?.value || "";

  if (!athlete) {
    resetDashboard();
    return;
  }


  const athleteMatches =
  matches.filter(match =>
    String(match.athlete || "")
      .trim()
      .toLowerCase() === athlete.toLowerCase()
  );
  const wins =
    athleteMatches.filter(match =>
      match.result === "Win"
    ).length;

  const losses =
    athleteMatches.filter(match =>
      match.result === "Loss"
    ).length;

  const total =
    athleteMatches.length;

  const winPct =
    total
      ? Math.round((wins / total) * 100)
      : 0;
      

  setText(
    "record",
    `${wins}-${losses}`
  );

  setText(
    "winPct",
    `${winPct}%`
  );

  setText(
    "pointsFor",
    sum(athleteMatches, "pointsFor")
  );

  setText(
    "pointsAgainst",
    sum(athleteMatches, "pointsAgainst")
  );

  setText(
    "takedowns",
    sum(athleteMatches, "takedowns")
  );

  setText(
    "escapes",
    sum(athleteMatches, "escapes")
  );

  setText(
    "reversals",
    sum(athleteMatches, "reversals")
  );

  setText(
    "nearfall",
    sum(athleteMatches, "nearfall")
  );

  renderStatMeters({
    winPct,
    pointsFor: sum(athleteMatches, "pointsFor"),
    pointsAgainst: sum(athleteMatches, "pointsAgainst"),
    takedowns: sum(athleteMatches, "takedowns"),
    escapes: sum(athleteMatches, "escapes"),
    reversals: sum(athleteMatches, "reversals"),
    nearfall: sum(athleteMatches, "nearfall")
  });

  renderHistory(athleteMatches);
  renderAthleteInsights(athleteMatches);
  renderAthletePatterns(athleteMatches);
  renderAthleteRecommendations(athleteMatches);

}

function resetDashboard() {
  [
    "record",
    "winPct",
    "pointsFor",
    "pointsAgainst",
    "takedowns",
    "escapes",
    "reversals",
    "nearfall"
  ].forEach(id => {
    setText(id, "0");
  });

  setText("record", "0-0");
  setText("winPct", "0%");
  renderStatMeters({
    winPct: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    takedowns: 0,
    escapes: 0,
    reversals: 0,
    nearfall: 0
  });

  const history =
    document.getElementById("matchHistory");

  if (history) {
    history.innerHTML =
      "<p>Select an athlete.</p>";
  }

  renderAthleteInsights([]);
}

function renderHistory(athleteMatches) {
  const container =
    document.getElementById("matchHistory");

  if (!container) return;

  if (!athleteMatches.length) {
    container.innerHTML =
      "<p>No matches found.</p>";

    return;
  }

  container.innerHTML =
    athleteMatches
      .slice()
      .reverse()
      .map(match => `
<div class="match-row">

  <strong>
    ${escapeHtml(match.opponent || "Opponent")}
  </strong>

  <p>
    ${escapeHtml(match.result || "Result")}
    by
    ${escapeHtml(match.method || "Decision")}
    (${match.pointsFor || 0}-${match.pointsAgainst || 0})
  </p>

  <a
    href="../history/match-detail.html?id=${encodeURIComponent(String(match.id ?? ""))}"
  >
    View Match
  </a>

</div>

        `)
      .join("");
}

function renderAthleteInsights(athleteMatches) {
  const container =
    document.getElementById("athleteInsights");

  if (!container) return;

  if (!athleteMatches.length) {
    container.innerHTML =
      "<p>Select an athlete to generate insights.</p>";

    return;
  }

  const takedowns =
    sum(athleteMatches, "takedowns");

  const escapes =
    sum(athleteMatches, "escapes");

  const reversals =
    sum(athleteMatches, "reversals");

  const nearfall =
    sum(athleteMatches, "nearfall");

  const pointsFor =
    sum(athleteMatches, "pointsFor");

  const pointsAgainst =
    sum(athleteMatches, "pointsAgainst");

  const strength =
    getStrength({
      takedowns,
      escapes,
      reversals,
      nearfall,
      pointsFor
    });

  const focus =
    getFocus({
      takedowns,
      escapes,
      reversals,
      nearfall,
      pointsAgainst
    });

  const feedback =
    buildFeedback({
      strength,
      focus,
      athleteMatches
    });

  container.innerHTML = `
    <div class="match-row">
      <strong>Strength</strong>
      <p>${escapeHtml(strength)}</p>
    </div>

    <div class="match-row">
      <strong>Focus</strong>
      <p>${escapeHtml(focus)}</p>
    </div>

    <div class="match-row">
      <strong>Feedback Ready</strong>
      <p>${escapeHtml(feedback)}</p>
    </div>
  `;
}
 
function renderAthletePatterns(athleteMatches) {
  const container =
    document.getElementById("athletePatterns");

  if (!container) return;

  if (!athleteMatches.length) {
    container.innerHTML =
      "<p>Select an athlete to generate patterns.</p>";
    return;
  }

  const patternCounts = {};

  athleteMatches.forEach(match => {
    const patterns =
      match.intelligence?.patterns || [];

    patterns.forEach(pattern => {
      patternCounts[pattern] =
        (patternCounts[pattern] || 0) + 1;
    });
  });

  const rankedPatterns =
    Object.entries(patternCounts)
      .sort((a, b) => b[1] - a[1]);

  const primaryPattern =
    rankedPatterns[0];

  const secondaryPattern =
    rankedPatterns[1];

  const analyzedMatches =
    athleteMatches.filter(match =>
      match.intelligence
    ).length;

  container.innerHTML = `
    <div class="match-row">
      <strong>Primary Pattern</strong>
      <p>${escapeHtml(formatPattern(primaryPattern))}</p>
    </div>

    <div class="match-row">
      <strong>Secondary Pattern</strong>
      <p>${escapeHtml(formatPattern(secondaryPattern))}</p>
    </div>

    <div class="match-row">
      <strong>Pattern Signals</strong>
      <p>${rankedPatterns.length}</p>
    </div>

    <div class="match-row">
      <strong>Intelligence Ready</strong>
      <p>${analyzedMatches} analyzed match(es)</p>
    </div>
  `;
}
 
function renderAthleteRecommendations(athleteMatches) {
  const container =
    document.getElementById("athleteRecommendations");

  if (!container) return;

  if (!athleteMatches.length) {
    container.innerHTML =
      "<p>Select an athlete.</p>";
    return;
  }

  const takedowns =
    sum(athleteMatches, "takedowns");

  let recommendation =
    "Continue building scoring opportunities.";

  if (takedowns < 3) {
    recommendation =
      "Focus on first attacks and creating scoring opportunities.";
  }

  container.innerHTML = `
    <div class="match-row">
      <strong>Next Focus</strong>
      <p>${recommendation}</p>
    </div>
  `;
}

function getScoringPattern(takedowns, pointsFor) {
  if (takedowns >= 3) {
    return "Takedowns are driving offense.";
  }

  if (takedowns >= 1 && pointsFor >= 6) {
    return "Offense is creating scoring volume.";
  }

  if (pointsFor > 0) {
    return "Athlete is finding ways to score.";
  }

  return "Needs more first-score attacks.";
}

function getStrength({
  takedowns,
  escapes,
  reversals,
  nearfall,
  pointsFor
}) {
  if (takedowns >= 3) {
    return "Neutral offense is creating scoring chances.";
  }

  if (nearfall >= 2) {
    return "Top turns are creating exposure points.";
  }

  if (escapes >= 2) {
    return "Bottom movement is producing escapes.";
  }

  if (reversals >= 1) {
    return "Scramble recovery is creating reversals.";
  }

  if (pointsFor > 0) {
    return "Athlete is finding ways to score.";
  }

  return "More match data needed to identify a clear strength.";
}

function getFocus({
  takedowns,
  escapes,
  reversals,
  nearfall,
  pointsAgainst
}) {
  if (pointsAgainst >= 8) {
    return "Defensive control and damage prevention.";
  }

  if (takedowns > 0 && escapes > 0) {
    return "Ride pressure after takedowns.";
  }

  if (takedowns === 0) {
    return "Creating first scoring attacks.";
  }

  if (nearfall === 0) {
    return "Turning pressure from top position.";
  }

  return "Maintain pressure and clean up transitions.";
}
function buildFeedback({
  strength,
  focus,
  athleteMatches
}) {
  const latestMatch =
    athleteMatches
      .slice()
      .reverse()[0];

  const result =
    latestMatch?.result || "Match";

  return `${result}: ${strength} Next focus: ${focus}`;
}
function formatPattern(entry) {
  if (!entry) {
    return "No intelligence yet.";
  }

  const [pattern, count] = entry;

  const label =
    String(pattern)
      .replaceAll("-", " ")
      .replace(/\b\w/g, char =>
        char.toUpperCase()
      );

  return `${label} (${count})`;
}

function sum(matchList, key) {
  return matchList.reduce(
    (total, match) =>
      total + Number(match[key] || 0),
    0
  );
}

function setText(id, value) {
  const el =
    document.getElementById(id);

  if (el) {
    el.textContent =
      value;
  }
}

function renderStatMeters(stats) {
  const pointMax = Math.max(stats.pointsFor, stats.pointsAgainst, 1);
  const actionMax = Math.max(stats.takedowns, stats.escapes, stats.reversals, stats.nearfall, 1);

  setMeter("winPctBar", stats.winPct, 100);
  setMeter("pointsForBar", stats.pointsFor, pointMax);
  setMeter("pointsAgainstBar", stats.pointsAgainst, pointMax);
  setMeter("takedownsBar", stats.takedowns, actionMax);
  setMeter("escapesBar", stats.escapes, actionMax);
  setMeter("reversalsBar", stats.reversals, actionMax);
  setMeter("nearfallBar", stats.nearfall, actionMax);
}

function setMeter(id, value, max) {
  const fill = document.getElementById(id);
  if (!fill) return;
  const safeValue = Math.max(0, Number(value) || 0);
  const safeMax = Math.max(1, Number(max) || 1);
  const meter = fill.parentElement;
  fill.style.width = `${Math.min(100, (safeValue / safeMax) * 100)}%`;
  meter?.setAttribute("aria-valuenow", String(safeValue));
  meter?.setAttribute("aria-valuemax", String(safeMax));
}
