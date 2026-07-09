const STORAGE_KEY = "cornerman_matches";

const matches =
  JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

const primaryFocus =
  document.getElementById("primaryFocus");

const secondaryFocus =
  document.getElementById("secondaryFocus");

const recommendation =
  document.getElementById("recommendation");

buildRecon();

function buildRecon() {
  if (!matches.length) {
    primaryFocus.textContent = "No Match Data";
    secondaryFocus.textContent = "Run Console Matches";
    recommendation.textContent =
      "Collect matches before generating recon.";
    return;
  }

  const patterns = buildPatternScores();

  const ranked =
    Object.values(patterns)
      .sort((a, b) => b.score - a.score);

  const primary = ranked[0];
  const secondary = ranked[1];

  primaryFocus.textContent = primary.label;
  secondaryFocus.textContent = secondary.label;

  recommendation.innerHTML =
    buildRecommendation(primary, secondary);
}

function buildPatternScores() {
  const patterns = {
    neutralDefense: {
      key: "neutralDefense",
      label: "Neutral Defense",
      score: 0,
      count: 0,
      evidence: [],
      practiceBlock: [
        "5 min stance motion",
        "5 min hand fighting",
        "10 min sprawl reaction",
        "10 min live neutral starts"
      ]
    },

    finishing: {
      key: "finishing",
      label: "Finishing",
      score: 0,
      count: 0,
      evidence: [],
      practiceBlock: [
        "5 min setup reps",
        "10 min setup-to-finish chains",
        "10 min reshot finishes",
        "5 min short-go live finishes"
      ]
    },

    bottomEscapes: {
      key: "bottomEscapes",
      label: "Bottom Escapes",
      score: 0,
      count: 0,
      evidence: [],
      practiceBlock: [
        "5 min first move reps",
        "10 min hand control",
        "10 min stand-up finishes",
        "5 min bottom live goes"
      ]
    },

    topControl: {
      key: "topControl",
      label: "Top Control",
      score: 0,
      count: 0,
      evidence: [],
      practiceBlock: [
        "5 min breakdown reps",
        "10 min ride pressure",
        "10 min ride-to-turn chains",
        "5 min top live starts"
      ]
    },

    nearfall: {
      key: "nearfall",
      label: "Nearfall",
      score: 0,
      count: 0,
      evidence: [],
      practiceBlock: [
        "5 min turn entries",
        "10 min exposure chains",
        "10 min pin finishes",
        "5 min top pressure rounds"
      ]
    }
  };

matches.forEach(match => {
  const intelPatterns =
    match.intelligence?.patterns || [];

 if (!intelPatterns.length) {
    return;
  }

  intelPatterns.forEach(pattern => {
    if (pattern === "neutral-defense") {
      addSignal(
        patterns.neutralDefense,
        3,
        `${match.athlete} showed neutral defense risk.`
      );
    }

    if (pattern === "neutral-offense") {
      addSignal(
        patterns.finishing,
        1,
        `${match.athlete} created neutral offense.`
      );
    }

    if (pattern === "strong-bottom") {
      addSignal(
        patterns.bottomEscapes,
        1,
        `${match.athlete} showed strong bottom movement.`
      );
    }

    if (pattern === "top-pressure") {
      addSignal(
        patterns.topControl,
        1,
        `${match.athlete} created top pressure.`
      );

      addSignal(
        patterns.nearfall,
        1,
        `${match.athlete} created nearfall pressure.`
      );
    }

    if (pattern === "back-exposure-risk") {
      addSignal(
        patterns.neutralDefense,
        2,
        `${match.athlete} showed back exposure risk.`
      );
    }
  });
});

  return patterns;
}

function addSignal(pattern, weight, evidence) {
  pattern.score += weight;
  pattern.count += 1;

  if (evidence) {
    pattern.evidence.push(evidence);
  }
}

function buildRecommendation(primary, secondary) {
  return `
    <div class="recon-block">
      <p class="recon-priority">
        Priority #1: ${primary.label}
      </p>

      <p>
        Evidence: ${primary.count} signal(s), score ${primary.score}.
      </p>

      <ul>
        ${primary.evidence
          .slice(0, 3)
          .map(item => `<li>${item}</li>`)
          .join("")}
      </ul>

      <p class="recon-priority">
        Practice Block
      </p>

      <ul>
        ${primary.practiceBlock
          .map(item => `<li>${item}</li>`)
          .join("")}
      </ul>

      <p>
        Secondary focus: ${secondary.label}.
      </p>
    </div>
  `;
}