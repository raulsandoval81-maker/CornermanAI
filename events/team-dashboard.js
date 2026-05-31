const STORAGE_KEY = "cornerman_matches";

const matches =
  JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

buildDashboard();

function buildDashboard() {

  const wins =
    matches.filter(
      m => m.result === "Win"
    ).length;

  const losses =
    matches.filter(
      m => m.result === "Loss"
    ).length;

  const total =
    matches.length;

  const winPct =
    total
      ? Math.round((wins / total) * 100)
      : 0;

  const pointsFor =
    matches.reduce(
      (sum, m) => sum + (m.pointsFor || 0),
      0
    );

  const pointsAgainst =
    matches.reduce(
      (sum, m) => sum + (m.pointsAgainst || 0),
      0
    );

  const pins =
    matches.filter(
      m => m.method === "Pin"
    ).length;

  const techs =
    matches.filter(
      m => m.method === "Tech"
    ).length;

  const majors =
    matches.filter(
      m => m.method === "Major"
    ).length;

  const decisions =
    matches.filter(
      m => m.method === "Decision"
    ).length;

  document.getElementById("record").textContent =
    `${wins}-${losses}`;

  document.getElementById("winPct").textContent =
    `${winPct}%`;

  document.getElementById("pointsFor").textContent =
    pointsFor;

  document.getElementById("pointsAgainst").textContent =
    pointsAgainst;

  document.getElementById("pins").textContent =
    pins;

  document.getElementById("techs").textContent =
    techs;

  document.getElementById("majors").textContent =
    majors;

  document.getElementById("decisions").textContent =
    decisions;

  renderMatches();
}

function renderMatches() {

  const container =
    document.getElementById("recentMatches");

  if (!matches.length) {

    container.innerHTML =
      "<p>No matches logged.</p>";

    return;
  }

  container.innerHTML =
    matches
      .slice()
      .reverse()
      .slice(0, 10)
      .map(match => `
        <div class="match-row">
          <strong>
            ${match.athlete}
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