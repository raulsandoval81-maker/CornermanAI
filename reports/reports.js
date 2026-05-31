const matches =
  JSON.parse(
localStorage.getItem("cornerman_matches")
  );

loadTeamReport();
loadAthleteReport();
loadPatternReport();
loadRecentMatches();

function loadTeamReport() {

  document.getElementById("totalMatches").textContent =
    matches.length;

  let wins = 0;
  let losses = 0;

  const athletes = new Set();

  matches.forEach(match => {

    athletes.add(match.athlete);

    if (
      String(match.result || "")
        .toLowerCase()
        .includes("win")
    ) {
      wins++;
    } else {
      losses++;
    }

  });

  document.getElementById("totalWins").textContent =
    wins;

  document.getElementById("totalLosses").textContent =
    losses;

  document.getElementById("totalAthletes").textContent =
    athletes.size;
}

function loadAthleteReport() {

  const select =
    document.getElementById("athleteSelect");

  const athletes =
    [...new Set(matches.map(m => m.athlete))];

  athletes.forEach(name => {

    const option =
      document.createElement("option");

    option.value = name;
    option.textContent = name;

    select.appendChild(option);

  });
}

function loadPatternReport() {

  const container =
    document.getElementById("patternReport");

  const patterns = {};

  matches.forEach(match => {

    const note =
      (match.coachNotes || "")
        .toLowerCase();

    if (!note) return;

    const words =
      note.split(" ");

    words.forEach(word => {

      if (word.length < 5) return;

      patterns[word] =
        (patterns[word] || 0) + 1;

    });

  });

  const sorted =
    Object.entries(patterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

  container.innerHTML =
    sorted.length
      ? sorted.map(
          p =>
            `<div class="match-row">
              <strong>${p[0]}</strong>
              <p>${p[1]} mention(s)</p>
            </div>`
        ).join("")
      : "<p>No patterns found.</p>";
}

function loadRecentMatches() {

  const container =
    document.getElementById("recentMatches");

  container.innerHTML =
    matches
      .slice()
      .reverse()
      .slice(0, 10)
      .map(match => `
        <div class="match-row">
          <strong>
            ${match.athlete || "Unknown"}
          </strong>
          <p>
            ${match.result || ""}
          </p>
        </div>
      `)
      .join("");
}