const STORAGE_KEY = "cornerman_matches";

const athleteSelect = document.getElementById("athleteSelect");

let matches = [];

init();

function init() {
  matches = getMatches();

  console.log("Cornerman matches loaded:", matches);

  loadAthletes();

  athleteSelect.addEventListener("change", buildDashboard);
}

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

function loadAthletes() {
  const athletes = [
    ...new Set(
      matches
        .map(match => match.athlete)
        .filter(Boolean)
    )
  ].sort();

  console.log("Athletes found:", athletes);

  if (!athletes.length) {
    return;
  }

  athletes.forEach(name => {
    const option = document.createElement("option");

    option.value = name;
    option.textContent = name;

    athleteSelect.appendChild(option);
  });
}

function buildDashboard() {
  const athlete = athleteSelect.value;

  const athleteMatches =
    matches.filter(match => match.athlete === athlete);

  const wins =
    athleteMatches.filter(match => match.result === "Win").length;

  const losses =
    athleteMatches.filter(match => match.result === "Loss").length;

  const total = athleteMatches.length;

  const winPct =
    total ? Math.round((wins / total) * 100) : 0;

  setText("record", `${wins}-${losses}`);
  setText("winPct", `${winPct}%`);
  setText("pointsFor", sum(athleteMatches, "pointsFor"));
  setText("pointsAgainst", sum(athleteMatches, "pointsAgainst"));
  setText("takedowns", sum(athleteMatches, "takedowns"));
  setText("escapes", sum(athleteMatches, "escapes"));
  setText("reversals", sum(athleteMatches, "reversals"));
  setText("nearfall", sum(athleteMatches, "nearfall"));

  renderHistory(athleteMatches);
}

function renderHistory(athleteMatches) {
  const container = document.getElementById("matchHistory");

  if (!athleteMatches.length) {
    container.innerHTML = "<p>No matches found.</p>";
    return;
  }

  container.innerHTML =
    athleteMatches
      .slice()
      .reverse()
      .map(match => `
        <div class="match-row">
          <strong>${match.opponent}</strong>
          <p>
            ${match.result} by ${match.method}
            (${match.pointsFor}-${match.pointsAgainst})
          </p>
        </div>
      `)
      .join("");
}

function sum(matchList, key) {
  return matchList.reduce(
    (total, match) => total + Number(match[key] || 0),
    0
  );
}

function setText(id, value) {
  document.getElementById(id).textContent = value;
}