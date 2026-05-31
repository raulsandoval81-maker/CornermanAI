const STORAGE_KEY = "cornerman_matches";

const athleteSelect =
  document.getElementById("athleteSelect");

const matches =
  JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

loadAthletes();

athleteSelect.addEventListener(
  "change",
  buildDashboard
);

function loadAthletes() {

  const athletes = [
    ...new Set(
      matches.map(m => m.athlete)
    )
  ].sort();

  athletes.forEach(name => {

    const option =
      document.createElement("option");

    option.value = name;
    option.textContent = name;

    athleteSelect.appendChild(option);

  });

}

function buildDashboard() {

  const athlete =
    athleteSelect.value;

  const athleteMatches =
    matches.filter(
      m => m.athlete === athlete
    );

  const wins =
    athleteMatches.filter(
      m => m.result === "Win"
    ).length;

  const losses =
    athleteMatches.filter(
      m => m.result === "Loss"
    ).length;

  const total =
    athleteMatches.length;

  const winPct =
    total
      ? Math.round((wins / total) * 100)
      : 0;

  setText("record", `${wins}-${losses}`);
  setText("winPct", `${winPct}%`);

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

}

function renderHistory(matches) {

  const container =
    document.getElementById("matchHistory");

  if (!matches.length) {

    container.innerHTML =
      "<p>No matches found.</p>";

    return;
  }

  container.innerHTML =
    matches
      .slice()
      .reverse()
      .map(match => `
        <div class="match-row">
          <strong>
            ${match.opponent}
          </strong>

          <p>
            ${match.result}
            by
            ${match.method}
            (${match.pointsFor}-${match.pointsAgainst})
          </p>
        </div>
      `)
      .join("");

}

function sum(matches, key) {

  return matches.reduce(
    (total, match) =>
      total + Number(match[key] || 0),
    0
  );

}

function setText(id, value) {

  document.getElementById(id).textContent =
    value;

}