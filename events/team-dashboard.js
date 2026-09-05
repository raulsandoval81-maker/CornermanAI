
const STORAGE_KEY = "cornerman_matches";
const { escapeHtml } = window.CornermanSafe;

const matches = getMatches();

buildDashboard();

function getMatches() {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
  } catch (error) {
    console.error("Could not read cornerman_matches:", error);
    return [];
  }
}

function buildDashboard() {
  const wins = countBy("result", "Win");
  const losses = countBy("result", "Loss");
  const total = matches.length;

  const winPct = total
    ? Math.round((wins / total) * 100)
    : 0;

  setText("record", `${wins}-${losses}`);
  setText("winPct", `${winPct}%`);
  setText("pointsFor", sum("pointsFor"));
  setText("pointsAgainst", sum("pointsAgainst"));
  setText("pins", countBy("method", "Pin"));
  setText("techs", countBy("method", "Tech"));
  setText("majors", countBy("method", "Major"));
  setText("decisions", countBy("method", "Decision"));

  const pointsFor = sum("pointsFor");
  const pointsAgainst = sum("pointsAgainst");
  const pointMax = Math.max(pointsFor, pointsAgainst, 1);
  const finishMax = Math.max(total, 1);

  setMeter("winPctBar", winPct, 100);
  setMeter("pointsForBar", pointsFor, pointMax);
  setMeter("pointsAgainstBar", pointsAgainst, pointMax);
  setMeter("pinsBar", countBy("method", "Pin"), finishMax);
  setMeter("techsBar", countBy("method", "Tech"), finishMax);
  setMeter("majorsBar", countBy("method", "Major"), finishMax);
  setMeter("decisionsBar", countBy("method", "Decision"), finishMax);

  renderMatches();
  renderTeamInsights();
  renderTeamPatterns();
  renderTeamRecommendations();

}

function renderMatches() {
  const container =
    document.getElementById("recentMatches");

  if (!container) return;

  if (!matches.length) {
    container.innerHTML =
      "<p>No matches logged.</p>";
    return;
  }

  container.innerHTML = matches
    .slice()
    .reverse()
    .slice(0, 10)


.map(match => `
  <div class="match-row">
    <strong>
      ${escapeHtml(match.athlete || "Athlete")}
    </strong>

    <p>
      ${escapeHtml(match.result || "Result")}
      by
      ${escapeHtml(match.method || "Decision")}
      (${match.pointsFor || 0}-${match.pointsAgainst || 0})
    </p>

    <a href="../history/match-detail.html?id=${encodeURIComponent(String(match.id ?? ""))}">
      View Match
    </a>
  </div>
`)


    .join("");
}

function renderTeamInsights() {
  const container =
    document.getElementById("teamInsights");

  if (!container) return;

  if (!matches.length) {
    container.innerHTML =
      "<p>No team insights yet. Log matches first.</p>";
    return;
  }

  const takedowns = sum("takedowns");
  const escapes = sum("escapes");
  const reversals = sum("reversals");
  const nearfall = sum("nearfall");

  const pointsFor = sum("pointsFor");
  const pointsAgainst = sum("pointsAgainst");

  const strength = getTeamStrength({
    takedowns,
    escapes,
    reversals,
    nearfall,
    pointsFor
  });

  const focus = getTeamFocus({
    takedowns,
    escapes,
    reversals,
    nearfall,
    pointsAgainst
  });

  const recommendation =
    getPracticeRecommendation(focus);

  container.innerHTML = `
    <div class="match-row">
      <strong>Team Strength</strong>
      <p>${strength}</p>
    </div>

    <div class="match-row">
      <strong>Team Focus</strong>
      <p>${focus}</p>
    </div>

    <div class="match-row">
      <strong>Practice Recommendation</strong>
      <p>${recommendation}</p>
    </div>
  `;
}

function renderTeamPatterns() {
  const container =
    document.getElementById("teamPatterns");

  if (!container) return;

  if (!matches.length) {
    container.innerHTML =
      "<p>No team patterns yet.</p>";
    return;
  }

  const wins =
    matches.filter(m =>
      m.result === "Win"
    ).length;

  const losses =
    matches.filter(m =>
      m.result === "Loss"
    ).length;

  const pins =
    matches.filter(m =>
      m.method === "Pin"
    ).length;

const athletes =
  new Set(
    matches
      .map(m =>
        String(m.athlete || "")
          .trim()
          .toLowerCase()
      )
      .filter(Boolean)
  ).size;

  container.innerHTML = `
    <div class="match-row">
      <strong>Team Trend</strong>
      <p>${wins} wins · ${losses} losses</p>
    </div>

    <div class="match-row">
      <strong>Most Common Finish</strong>
      <p>${pins ? "Pin" : "Decision / Other"}</p>
    </div>

    <div class="match-row">
      <strong>Athletes Active</strong>
      <p>${athletes}</p>
    </div>
  `;
}

function renderTeamRecommendations() {
  const container =
    document.getElementById(
      "teamRecommendations"
    );

  if (!container) return;

  const pointsAgainst =
    sum("pointsAgainst");

  let recommendation =
    "Continue offensive pressure and scoring volume.";

  if (pointsAgainst >= 15) {
    recommendation =
      "Increase defensive awareness and limit opponent scoring.";
  }

  container.innerHTML = `
    <div class="match-row">
      <strong>Practice Focus</strong>
      <p>${recommendation}</p>
    </div>
  `;
}

function renderAthleteRecommendations(
  athleteMatches
) {
  const container =
    document.getElementById(
      "athleteRecommendations"
    );

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

function getTeamStrength({
  takedowns,
  escapes,
  reversals,
  nearfall,
  pointsFor
}) {
  if (takedowns >= 5) {
    return "Neutral offense is creating scoring opportunities.";
  }

  if (nearfall >= 3) {
    return "Top pressure is producing exposure points.";
  }

  if (escapes >= 4) {
    return "Bottom movement is producing escapes.";
  }

  if (reversals >= 2) {
    return "Scramble recovery is creating reversals.";
  }

  if (pointsFor > 0) {
    return "Team is finding ways to score.";
  }

  return "More match data needed to identify a clear strength.";
}

function getTeamFocus({
  takedowns,
  escapes,
  reversals,
  nearfall,
  pointsAgainst
}) {
  if (pointsAgainst >= 15) {
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

function getPracticeRecommendation(focus) {
  const value =
    String(focus || "").toLowerCase();

  if (value.includes("ride")) {
    return "Add 10 minutes of ride pressure and mat-return work this week.";
  }

  if (value.includes("defensive")) {
    return "Add situational defense rounds focused on limiting damage.";
  }

  if (value.includes("first scoring")) {
    return "Add neutral attack starts and first-score rounds.";
  }

  if (value.includes("turning")) {
    return "Add top-turn chains and exposure finish work.";
  }

  return "Keep practice focused on pressure, transitions, and clean finishes.";
}

function countBy(key, value) {
  return matches.filter(match =>
    match[key] === value
  ).length;
}

function sum(key) {
  return matches.reduce(
    (total, match) =>
      total + Number(match[key] || 0),
    0
  );
}


function setText(id, value) {
  const el =
    document.getElementById(id);

  if (el) {
    el.textContent = value;
  }
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
