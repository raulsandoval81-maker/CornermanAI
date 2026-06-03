const RECON_KEY =
  "cornerman_recon";

const MATCHES_KEY =
  "cornerman_matches";

const opponentSelect =
  document.getElementById("opponentSelect");

const opponentDetails =
  document.getElementById("opponentDetails");

const matchesVsUsEl =
  document.getElementById("matchesVsUs");

const reconHistory =
  document.getElementById("reconHistory");

const coachNotes =
  document.getElementById("coachNotes");

const reconSummary =
  document.getElementById("reconSummary");

const recommendations =
  document.getElementById("recommendations");

let reconNotes = [];
let matches = [];

init();

function init() {
  reconNotes =
    JSON.parse(
      localStorage.getItem(RECON_KEY) || "[]"
    );

  matches =
    JSON.parse(
      localStorage.getItem(MATCHES_KEY) || "[]"
    );

  loadOpponents();

  opponentSelect?.addEventListener(
    "change",
    buildDashboard
  );
}

function loadOpponents() {
  if (!opponentSelect) return;

  const names =
    [...new Set(
      reconNotes
        .map(note => note.opponent)
        .filter(Boolean)
    )].sort();

  opponentSelect.innerHTML = `
    <option value="">
      Select Opponent
    </option>
  `;

  names.forEach(name => {
    const option =
      document.createElement("option");

    option.value = name;
    option.textContent = name;

    opponentSelect.appendChild(option);
  });
}

function buildDashboard() {
  const opponent =
    opponentSelect?.value || "";

  if (!opponent) {
    opponentDetails.innerHTML =
      "Select an opponent.";

    matchesVsUsEl.innerHTML =
      "No matches found.";

    reconSummary.innerHTML =
      "No patterns found.";

    recommendations.innerHTML =
      "No recommendations available.";

    coachNotes.innerHTML =
      "No notes available.";

    reconHistory.innerHTML =
      "No recon history.";

    return;
  }

  const notes =
    reconNotes.filter(note =>
      normalize(note.opponent) === normalize(opponent)
    );

  const latest =
    notes
      .slice()
      .reverse()[0];

  const matchesVsUs =
    matches.filter(match =>
      normalize(match.opponent) === normalize(opponent)
    );

  const winsVsOpponent =
    matchesVsUs.filter(match =>
      normalizeResult(match.result) === "win"
    ).length;

  const lossesVsOpponent =
    matchesVsUs.filter(match =>
      normalizeResult(match.result) === "loss"
    ).length;

  renderMatchesVsUs(matchesVsUs);
  renderReconSummary(notes);
  renderRecommendations(latest, notes);
  renderReconHistory(notes);

  if (!latest) {
    opponentDetails.innerHTML =
      "<p>No recon notes found for this opponent.</p>";

    coachNotes.innerHTML =
      "No notes available.";

    return;
  }

  opponentDetails.innerHTML = `
    <p>
      <strong>Record Against Us:</strong>
      ${winsVsOpponent}-${lossesVsOpponent}
    </p>

    <p>
      <strong>Matches Against Us:</strong>
      ${matchesVsUs.length}
    </p>

    <p>
      <strong>Preferred Stance:</strong>
      ${latest.preferredStance || "-"}
    </p>

    <p>
      <strong>Favorite Tie:</strong>
      ${latest.favoriteTie || "-"}
    </p>

    <p>
      <strong>Favorite Shot:</strong>
      ${latest.favoriteShot || "-"}
    </p>

    <p>
      <strong>Favorite Finish:</strong>
      ${latest.favoriteFinish || "-"}
    </p>

    <p>
      <strong>Favorite Escape:</strong>
      ${latest.favoriteEscape || "-"}
    </p>

    <p>
      <strong>Best Turn:</strong>
      ${latest.bestTurn || "-"}
    </p>
  `;

  coachNotes.innerHTML =
    latest.coachNotes ||
    "No notes available.";
}

function renderMatchesVsUs(matchesVsUs) {
  if (!matchesVsUsEl) return;

  if (!matchesVsUs.length) {
    matchesVsUsEl.innerHTML =
      "No matches found.";
    return;
  }

  matchesVsUsEl.innerHTML =
    matchesVsUs
      .slice()
      .reverse()
      .map(match => `
        <div class="match-row">
          <strong>
            ${match.athlete || "Athlete"}
          </strong>

          <p>
            ${match.result || "Result"}
            by
            ${match.method || "Decision"}
            (${match.pointsFor || 0}-${match.pointsAgainst || 0})
          </p>

          <a href="../history/match-detail?id=${match.id}">
            View Match
          </a>
        </div>
      `)
      .join("");
}

function renderReconSummary(notes) {
  if (!reconSummary) return;

  reconSummary.innerHTML = `
    <p>
      <strong>Recon Entries:</strong>
      ${notes.length}
    </p>

    <p>
      <strong>Preferred Stance:</strong>
      ${getMostCommon(notes, "preferredStance")}
    </p>

    <p>
      <strong>Favorite Tie:</strong>
      ${getMostCommon(notes, "favoriteTie")}
    </p>

    <p>
      <strong>Favorite Shot:</strong>
      ${getMostCommon(notes, "favoriteShot")}
    </p>

    <p>
      <strong>Favorite Finish:</strong>
      ${getMostCommon(notes, "favoriteFinish")}
    </p>

    <p>
      <strong>Favorite Escape:</strong>
      ${getMostCommon(notes, "favoriteEscape")}
    </p>

    <p>
      <strong>Best Turn:</strong>
      ${getMostCommon(notes, "bestTurn")}
    </p>
  `;
}

function renderReconHistory(notes) {
  if (!reconHistory) return;

  if (!notes.length) {
    reconHistory.innerHTML =
      "No recon history.";
    return;
  }

  reconHistory.innerHTML =
    notes
      .slice()
      .reverse()
      .map(note => `
        <div class="match-row">
          <strong>
            ${formatDate(note.createdAt, note.id)}
          </strong>

          <p>
            ${note.coachNotes || "No note."}
          </p>
        </div>
      `)
      .join("");
}

function renderRecommendations(latest, notes) {
  if (!recommendations) return;

  const patternShot =
    getMostCommonRaw(notes, "favoriteShot");

  const patternTie =
    getMostCommonRaw(notes, "favoriteTie");

  let primaryThreat =
    patternShot ||
    latest?.favoriteShot ||
    "Unknown";

  let matchPlan =
    "Stay disciplined and wrestle your system.";

  let tieStrategy =
    "Win hand fighting.";

  let conditioningNote =
    "Maintain pressure.";

  const shot =
    String(primaryThreat || "")
      .toLowerCase();

  const tie =
    String(patternTie || latest?.favoriteTie || "")
      .toLowerCase();

  const note =
    String(latest?.coachNotes || "")
      .toLowerCase();

  if (shot.includes("sweep")) {
    matchPlan =
      "Keep lead leg back and circle away from sweep side.";
  }

  if (
    shot.includes("hi-c") ||
    shot.includes("high crotch")
  ) {
    matchPlan =
      "Heavy hands, control distance, and square hips on high-c attacks.";
  }

  if (
    shot.includes("head inside single") ||
    shot.includes("head on inside single")
  ) {
    matchPlan =
      "Win inside position, down-block early, and circle hips away from the head-inside single.";
  }

  if (
    shot.includes("head outside single") ||
    shot.includes("head on outside single")
  ) {
    matchPlan =
      "Control wrists, sprawl heavy, and punish the head-outside single with hip pressure.";
  }

  if (shot.includes("head outside double")) {
    matchPlan =
      "Create distance, block shoulders, and sprawl before the opponent locks the double.";
  }

  if (
    shot.includes("blast double") ||
    shot.includes("head in the chest")
  ) {
    matchPlan =
      "Keep stance disciplined, stop forward pressure early, and use heavy hands to slow the blast double.";
  }

  if (
    shot.includes("double") &&
    !shot.includes("head outside double") &&
    !shot.includes("blast double")
  ) {
    matchPlan =
      "Control distance and defend level changes.";
  }

  if (tie.includes("inside")) {
    tieStrategy =
      "Clear inside ties immediately.";
  }

  if (tie.includes("collar")) {
    tieStrategy =
      "Control head position and clear collar ties.";
  }

  if (
    note.includes("third") ||
    note.includes("fade") ||
    note.includes("break")
  ) {
    conditioningNote =
      "Increase pace late in the match.";
  }

  recommendations.innerHTML = `
    <p>
      <strong>Primary Threat:</strong>
      ${primaryThreat}
    </p>

    <p>
      <strong>Match Plan:</strong>
      ${matchPlan}
    </p>

    <p>
      <strong>Tie Strategy:</strong>
      ${tieStrategy}
    </p>

    <p>
      <strong>Conditioning Note:</strong>
      ${conditioningNote}
    </p>
  `;
}

function getMostCommon(notes, field) {
  const value =
    getMostCommonRaw(notes, field);

  if (!value) return "-";

  const count =
    notes.filter(note =>
      String(note[field] || "").trim() === value
    ).length;

  return `${value} (${count})`;
}

function getMostCommonRaw(notes, field) {
  const counts = {};

  notes.forEach(note => {
    const value =
      String(note[field] || "")
        .trim();

    if (!value) return;

    counts[value] =
      (counts[value] || 0) + 1;
  });

  const sorted =
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1]);

  if (!sorted.length) {
    return "";
  }

  return sorted[0][0];
}

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeResult(value) {
  const result =
    normalize(value);

  if (
    result === "win" ||
    result === "w"
  ) {
    return "win";
  }

  if (
    result === "loss" ||
    result === "l"
  ) {
    return "loss";
  }

  return result;
}

function formatDate(value, fallbackId) {
  const raw =
    value || fallbackId;

  const date =
    new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "2-digit",
      day: "2-digit"
    }
  );
}