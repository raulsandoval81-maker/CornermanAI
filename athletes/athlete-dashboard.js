const STORAGE_KEY =
  "cornerman_matches";

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

    option.value = name.toLowerCase();
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
      .toLowerCase() === athlete
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
    ${match.opponent || "Opponent"}
  </strong>

  <p>
    ${match.result || "Result"}
    by
    ${match.method || "Decision"}
    (${match.pointsFor || 0}-${match.pointsAgainst || 0})
  </p>

  <a
    href="../history/match-detail?id=${match.id}"
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
      <p>${strength}</p>
    </div>

    <div class="match-row">
      <strong>Focus</strong>
      <p>${focus}</p>
    </div>

    <div class="match-row">
      <strong>Feedback Ready</strong>
      <p>${feedback}</p>
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

  const wins =
    athleteMatches.filter(match =>
      match.result === "Win"
    ).length;

  const losses =
    athleteMatches.filter(match =>
      match.result === "Loss"
    ).length;

  const pins =
    athleteMatches.filter(match =>
      match.method === "Pin"
    ).length;

  const takedowns =
    sum(athleteMatches, "takedowns");

  const pointsFor =
    sum(athleteMatches, "pointsFor");

  const highestMatch =
    athleteMatches
      .slice()
      .sort((a, b) =>
        Number(b.pointsFor || 0) -
        Number(a.pointsFor || 0)
      )[0];

  container.innerHTML = `
    <div class="match-row">
      <strong>Recent Trend</strong>
      <p>${wins} wins · ${losses} losses</p>
    </div>

    <div class="match-row">
      <strong>Most Common Finish</strong>
      <p>${pins ? "Pin" : "Decision / Other"}</p>
    </div>

    <div class="match-row">
      <strong>Scoring Pattern</strong>
      <p>${getScoringPattern(takedowns, pointsFor)}</p>
    </div>

    <div class="match-row">
      <strong>Highest Scoring Match</strong>
      <p>${highestMatch?.opponent || "Opponent"} · ${pointsFor ? highestMatch.pointsFor : 0} points</p>
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
