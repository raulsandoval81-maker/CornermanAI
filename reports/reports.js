const STORAGE_KEY = "cornerman_matches";
const { escapeHtml } = window.CornermanSafe;

const matches =
  JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

loadReport();

function loadReport() {
  loadTeamReport();
  loadAthleteSelect();
  loadPatternReport();
  loadRecentMatches();
}

function loadTeamReport() {
  setText("totalMatches", matches.length);
  setText("totalWins", countResult(matches, "Win"));
  setText("totalLosses", countResult(matches, "Loss"));

  setText(
    "totalAthletes",
    new Set(matches.map(match => match.athlete).filter(Boolean)).size
  );

  setText("pointsFor", sum(matches, "pointsFor"));
  setText("pointsAgainst", sum(matches, "pointsAgainst"));
}

function loadAthleteSelect() {
  const select = document.getElementById("athleteSelect");
  if (!select) return;

  const athletes =
    [...new Set(matches.map(match => match.athlete).filter(Boolean))].sort();

  select.innerHTML = `<option value="">Select Athlete</option>`;

  athletes.forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });

  select.addEventListener("change", () => {
    loadAthleteReport(select.value);
  });
}

function loadAthleteReport(athlete) {
  const container = document.getElementById("athleteReport");
  if (!container) return;

  if (!athlete) {
    container.innerHTML = "<p>Select an athlete to view report.</p>";
    return;
  }

  const athleteMatches =
    matches.filter(match => match.athlete === athlete);

  const wins = countResult(athleteMatches, "Win");
  const losses = countResult(athleteMatches, "Loss");
  const total = athleteMatches.length;
  const winPct = total ? Math.round((wins / total) * 100) : 0;

  const latestIntel =
    athleteMatches
      .slice()
      .reverse()
      .find(match => match.intelligence)?.intelligence || {};

  const recommendations =
    latestIntel.recommendations || [];

  const practiceFocus =
    latestIntel.practiceFocus?.focus || [];

  container.innerHTML = `
    <div class="match-row">
      <strong>${escapeHtml(athlete)}</strong>
      <p>Record: ${wins}-${losses} · Win %: ${winPct}%</p>
      <p>Points: ${sum(athleteMatches, "pointsFor")}-${sum(athleteMatches, "pointsAgainst")}</p>
      <p>TD: ${sum(athleteMatches, "takedowns")} · ESC: ${sum(athleteMatches, "escapes")} · NF: ${sum(athleteMatches, "nearfall")}</p>

      <p><strong>Latest Recommendations:</strong></p>
      ${renderList(recommendations.map(item => item.title || item.focus || item))}

      <p><strong>Practice Focus:</strong></p>
      ${renderList(practiceFocus)}
    </div>
  `;
}

function loadPatternReport() {
  const container = document.getElementById("patternReport");
  if (!container) return;

  if (!matches.length) {
    container.innerHTML = "<p>No match data yet.</p>";
    return;
  }

  const patternScores = buildPatternScores();

  container.innerHTML =
    Object.values(patternScores)
      .sort((a, b) => b.score - a.score)
      .map(pattern => `
        <div class="match-row">
          <strong>${escapeHtml(pattern.label)}</strong>
          <p>${pattern.count} signal(s) · score ${pattern.score}</p>
          <p>${escapeHtml(pattern.recommendation)}</p>
        </div>
      `)
      .join("");
}

function buildPatternScores() {
  const patterns = {
    neutralDefense: {
      label: "Neutral Defense",
      score: 0,
      count: 0,
      recommendation: "Practice sprawl reactions, lead-leg protection, hand fighting, and first-contact defense."
    },
    finishing: {
      label: "Finishing",
      score: 0,
      count: 0,
      recommendation: "Keep drilling setup-to-finish chains and clean finishes."
    },
    bottomEscapes: {
      label: "Bottom Escapes",
      score: 0,
      count: 0,
      recommendation: "Sharpen first move, hand control, and stand-up finishes."
    },
    topControl: {
      label: "Top Control",
      score: 0,
      count: 0,
      recommendation: "Build ride-to-turn chains, mat returns, and pin finishes."
    },
    nearfall: {
      label: "Nearfall",
      score: 0,
      count: 0,
      recommendation: "Keep attacking turns and improve pin finishes."
    }
  };

  matches.forEach(match => {
    const intelPatterns =
      match.intelligence?.patterns || [];

    intelPatterns.forEach(pattern => {
      if (pattern === "neutral-defense") {
        addSignal(patterns.neutralDefense, 3);
      }

      if (pattern === "neutral-offense") {
        addSignal(patterns.finishing, 1);
      }

      if (pattern === "strong-bottom") {
        addSignal(patterns.bottomEscapes, 1);
      }

      if (pattern === "top-pressure") {
        addSignal(patterns.topControl, 1);
        addSignal(patterns.nearfall, 1);
      }

      if (pattern === "back-exposure-risk") {
        addSignal(patterns.neutralDefense, 2);
      }
    });
  });

  return patterns;
}

function loadRecentMatches() {
  const container = document.getElementById("recentMatches");
  if (!container) return;

  if (!matches.length) {
    container.innerHTML = "<p>No recent matches.</p>";
    return;
  }

  container.innerHTML =
    matches
      .slice()
      .reverse()
      .slice(0, 10)
      .map(match => {
        const summary =
          match.intelligence?.coachSummary?.summary ||
          "No intelligence summary yet.";

        return `
          <div class="match-row">
            <strong>${escapeHtml(match.athlete || "Unknown")} vs ${escapeHtml(match.opponent || "Unknown")}</strong>
            <p>${escapeHtml(match.result || "")} by ${escapeHtml(match.method || "Decision")} (${match.pointsFor || 0}-${match.pointsAgainst || 0})</p>
            <p><strong>Intelligence:</strong> ${escapeHtml(summary)}</p>
          </div>
        `;
      })
      .join("");
}

function renderList(items) {
  if (!items.length) {
    return "<p>No intelligence yet.</p>";
  }

  return `
    <ul>
      ${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

function countResult(list, result) {
  return list.filter(match => match.result === result).length;
}

function addSignal(pattern, weight) {
  pattern.score += weight;
  pattern.count += 1;
}

function sum(list, key) {
  return list.reduce(
    (total, item) => total + Number(item[key] || 0),
    0
  );
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
