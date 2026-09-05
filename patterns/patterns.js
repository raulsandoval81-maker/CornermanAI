const STORAGE_KEY = "cornerman_matches";

const matches =
  JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

const patternsEl =
  document.getElementById("patterns");

const recommendationEl =
  document.getElementById("recommendation");

const patterns = {
  neutralDefense: {
    label: "Neutral Defense",
    score: 0,
    count: 0,
    type: "problem",
    reason: "Opponent takedowns and loss-related scoring pressure."
  },

  bottomEscapes: {
    label: "Bottom Escapes",
    score: 0,
    count: 0,
    type: "strength",
    reason: "Escapes are showing up in match data."
  },

  topControl: {
    label: "Top Control",
    score: 0,
    count: 0,
    type: "strength",
    reason: "Nearfall and top scoring signals are present."
  },

  finishing: {
    label: "Finishing",
    score: 0,
    count: 0,
    type: "strength",
    reason: "Takedowns are being completed."
  },

  nearfall: {
    label: "Nearfall",
    score: 0,
    count: 0,
    type: "strength",
    reason: "Turns and exposure points are showing up."
  },

  handFighting: {
    label: "Hand Fighting",
    score: 0,
    count: 0,
    type: "problem",
    reason: "Coach notes mention hands, ties, or inside control."
  }
};

analyzeMatches();
renderPatterns();
renderRecommendation();

function analyzeMatches() {
  matches.forEach(match => {
    const lostMatch =
      match.result === "Loss";

    const wonMatch =
      match.result === "Win";

    const pointsAgainst =
      Number(match.pointsAgainst || 0);

    const takedowns =
      Number(match.takedowns || 0);

    const escapes =
      Number(match.escapes || 0);

    const nearfall =
      Number(match.nearfall || 0);

    const notes =
      String(match.notes || "").toLowerCase();

    if (lostMatch && pointsAgainst > 0) {
      addSignal("neutralDefense", 3);
    }

    if (lostMatch && String(match.method).toLowerCase() === "pin") {
      addSignal("neutralDefense", 2);
    }

    if (takedowns > 0) {
      addSignal("finishing", wonMatch ? 1 : 0.5);
    }

    if (escapes > 0) {
      addSignal("bottomEscapes", 1);
    }

    if (nearfall > 0) {
      addSignal("nearfall", 1);
      addSignal("topControl", 1);
    }

    if (
      notes.includes("hands") ||
      notes.includes("tie") ||
      notes.includes("inside") ||
      notes.includes("lead leg")
    ) {
      addSignal("handFighting", lostMatch ? 3 : 1);
    }
  });
}

function addSignal(key, weight) {
  patterns[key].score += weight;
  patterns[key].count += 1;
}

function renderPatterns() {
  if (!matches.length) {
    patternsEl.innerHTML =
      "<p>No match data yet.</p>";
    return;
  }

  const ranked =
    Object.values(patterns)
      .sort((a, b) => b.score - a.score);

  const maxScore = Math.max(...ranked.map(pattern => pattern.score), 1);

  patternsEl.innerHTML =
    ranked
      .map(pattern => `
        <div class="pattern-row">
          <div class="pattern-heading">
            <strong>${pattern.label}</strong>
            <span>${pattern.score} score · ${pattern.count} signal(s)</span>
          </div>
          <div class="signal-meter" role="progressbar" aria-label="${pattern.label} score" aria-valuemin="0" aria-valuemax="${maxScore}" aria-valuenow="${pattern.score}">
            <span style="width:${Math.min(100, (pattern.score / maxScore) * 100)}%"></span>
          </div>
          <p>${pattern.reason}</p>
        </div>
      `)
      .join("");
}

function renderRecommendation() {
  if (!matches.length) {
    recommendationEl.innerHTML =
      "Not enough match data yet.";
    return;
  }

  const topPattern =
    Object.values(patterns)
      .sort((a, b) => b.score - a.score)[0];

  if (!topPattern || topPattern.score === 0) {
    recommendationEl.innerHTML =
      "Not enough pattern strength yet.";
    return;
  }

  recommendationEl.innerHTML =
    getRecommendation(topPattern);
}

function getRecommendation(pattern) {
  const recommendations = {
    neutralDefense: `
      <strong>Priority: Neutral Defense</strong>
      <p>Loss-related scoring is pointing toward opponent takedowns or neutral pressure.</p>
      <p>Practice focus: sprawl reactions, lead-leg protection, hand fighting, and first-contact defense.</p>
    `,

    bottomEscapes: `
      <strong>Strength: Bottom Escapes</strong>
      <p>Escapes are showing up as a positive scoring signal.</p>
      <p>Practice focus: keep sharpening first move, hand control, and stand-up finishes.</p>
    `,

    topControl: `
      <strong>Strength: Top Control</strong>
      <p>Top work is producing nearfall or pressure signals.</p>
      <p>Practice focus: ride-to-turn chains, mat returns, and pin finishes.</p>
    `,

    finishing: `
      <strong>Strength: Finishing</strong>
      <p>Takedowns are being finished.</p>
      <p>Practice focus: setup-to-finish chains, reshots, and clean finishes under pressure.</p>
    `,

    nearfall: `
      <strong>Scoring Signal: Nearfall</strong>
      <p>Turns are producing exposure points.</p>
      <p>Practice focus: turn chains, pressure control, and pin finishes.</p>
    `,

    handFighting: `
      <strong>Priority: Hand Fighting</strong>
      <p>Notes point toward ties, hands, or inside-control problems.</p>
      <p>Practice focus: inside ties, wrist control, head position, and clearing hands.</p>
    `
  };

  return recommendations[pattern.labelKey] ||
    recommendations[
      Object.keys(patterns).find(
        key => patterns[key] === pattern
      )
    ] ||
    "Review match data and choose one practice focus.";
}
