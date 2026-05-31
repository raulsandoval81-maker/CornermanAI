const STORAGE_KEY = "cornerman_matches";

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
  const wins =
    matches.filter(match => match.result === "Win").length;

  const losses =
    matches.filter(match => match.result === "Loss").length;

  const athletes =
    new Set(
      matches
        .map(match => match.athlete)
        .filter(Boolean)
    );

  const pointsFor =
    sum(matches, "pointsFor");

  const pointsAgainst =
    sum(matches, "pointsAgainst");

  setText("totalMatches", matches.length);
  setText("totalWins", wins);
  setText("totalLosses", losses);
  setText("totalAthletes", athletes.size);
  setText("pointsFor", pointsFor);
  setText("pointsAgainst", pointsAgainst);
}

function loadAthleteSelect() {
  const select =
    document.getElementById("athleteSelect");

  if (!select) return;

  const athletes =
    [...new Set(
      matches
        .map(match => match.athlete)
        .filter(Boolean)
    )].sort();

  select.innerHTML =
    `<option value="">Select Athlete</option>`;

  athletes.forEach(name => {
    const option =
      document.createElement("option");

    option.value = name;
    option.textContent = name;

    select.appendChild(option);
  });

  select.addEventListener("change", () => {
    loadAthleteReport(select.value);
  });
}

function loadAthleteReport(athlete) {
  const container =
    document.getElementById("athleteReport");

  if (!container) return;

  if (!athlete) {
    container.innerHTML =
      "<p>Select an athlete to view report.</p>";
    return;
  }

  const athleteMatches =
    matches.filter(match => match.athlete === athlete);

  const wins =
    athleteMatches.filter(match => match.result === "Win").length;

  const losses =
    athleteMatches.filter(match => match.result === "Loss").length;

  const total =
    athleteMatches.length;

  const winPct =
    total ? Math.round((wins / total) * 100) : 0;

  container.innerHTML = `
    <div class="match-row">
      <strong>${athlete}</strong>
      <p>Record: ${wins}-${losses} · Win %: ${winPct}%</p>
      <p>Points: ${sum(athleteMatches, "pointsFor")}-${sum(athleteMatches, "pointsAgainst")}</p>
      <p>TD: ${sum(athleteMatches, "takedowns")} · ESC: ${sum(athleteMatches, "escapes")} · NF: ${sum(athleteMatches, "nearfall")}</p>
    </div>
  `;
}

function loadPatternReport() {
  const container =
    document.getElementById("patternReport");

  if (!container) return;

  const patternScores =
    buildPatternScores();

  const sorted =
    Object.values(patternScores)
      .sort((a, b) => b.score - a.score);

  if (!matches.length) {
    container.innerHTML =
      "<p>No match data yet.</p>";
    return;
  }

  container.innerHTML =
    sorted
      .map(pattern => `
        <div class="match-row">
          <strong>${pattern.label}</strong>
          <p>${pattern.count} signal(s) · score ${pattern.score}</p>
          <p>${pattern.recommendation}</p>
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
      recommendation:
        "Practice sprawl reactions, lead-leg protection, hand fighting, and first-contact defense."
    },

    finishing: {
      label: "Finishing",
      score: 0,
      count: 0,
      recommendation:
        "Keep drilling setup-to-finish chains and clean finishes."
    },

    bottomEscapes: {
      label: "Bottom Escapes",
      score: 0,
      count: 0,
      recommendation:
        "Sharpen first move, hand control, and stand-up finishes."
    },

    topControl: {
      label: "Top Control",
      score: 0,
      count: 0,
      recommendation:
        "Build ride-to-turn chains, mat returns, and pin finishes."
    },

    nearfall: {
      label: "Nearfall",
      score: 0,
      count: 0,
      recommendation:
        "Keep attacking turns and improve pin finishes."
    }
  };

  matches.forEach(match => {
    const lost =
      match.result === "Loss";

    if (lost && Number(match.pointsAgainst || 0) > 0) {
      addSignal(patterns.neutralDefense, 3);
    }

    if (
      lost &&
      String(match.method || "").toLowerCase() === "pin"
    ) {
      addSignal(patterns.neutralDefense, 2);
    }

    if (Number(match.takedowns || 0) > 0) {
      addSignal(patterns.finishing, lost ? 0.5 : 1);
    }

    if (Number(match.escapes || 0) > 0) {
      addSignal(patterns.bottomEscapes, 1);
    }

    if (Number(match.nearfall || 0) > 0) {
      addSignal(patterns.nearfall, 1);
      addSignal(patterns.topControl, 1);
    }
  });

  return patterns;
}

function loadRecentMatches() {
  const container =
    document.getElementById("recentMatches");

  if (!container) return;

  if (!matches.length) {
    container.innerHTML =
      "<p>No recent matches.</p>";
    return;
  }

  container.innerHTML =
    matches
      .slice()
      .reverse()
      .slice(0, 10)
      .map(match => `
        <div class="match-row">
          <strong>${match.athlete || "Unknown"} vs ${match.opponent || "Unknown"}</strong>
          <p>${match.result || ""} by ${match.method || "Decision"} (${match.pointsFor || 0}-${match.pointsAgainst || 0})</p>
        </div>
      `)
      .join("");
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

  if (el) {
    el.textContent = value;
  }
}