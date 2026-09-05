import {
  exportToSandman
} from "../../bridge/export-to-sandman.js";
const { escapeHtml } = window.CornermanSafe;

const MATCHES_KEY =
  "cornerman_matches";

const matches =
  JSON.parse(
    localStorage.getItem(MATCHES_KEY) || "[]"
  );

const latestMatch =
  matches
    .slice()
    .reverse()
    .find(match => match.intelligence) ||
  matches.at(-1) ||
  null;

if (!latestMatch) {
  renderEmpty();
} else {
  const payload =
    exportToSandman({
      athlete:
        latestMatch.athlete || "Athlete",

      latestMatch: {
        opponent:
          latestMatch.opponent || "Opponent",

        result:
          latestMatch.result || "Result",

        method:
          latestMatch.method || "Decision",

        pointsFor:
          latestMatch.pointsFor || 0,

        pointsAgainst:
          latestMatch.pointsAgainst || 0
      },

      patterns:
        latestMatch.intelligence?.patterns || []
    });

  render(payload);
}

function render(payload) {
  setText(
    "athleteName",
    payload.athlete
  );

  setHtml(
    "matchInfo",
    `
      <div class="feedback-item">
        <strong>
          ${escapeHtml(payload.match.result)}
          by
          ${escapeHtml(payload.match.method)}
          vs
          ${escapeHtml(payload.match.opponent)}
        </strong>

        <p>
          Score:
          ${escapeHtml(payload.match.score)}
        </p>
      </div>
    `
  );

  setHtml(
    "feedbackInfo",
    `
      <div class="feedback-item">
        <strong>Feedback</strong>
        <p>${escapeHtml(payload.feedback)}</p>
      </div>

      <div class="feedback-item">
        <strong>Patterns</strong>
        <p>${escapeHtml(formatList(payload.patterns))}</p>
      </div>
    `
  );

  setHtml(
    "cardInfo",
    (payload.cards || [])
      .map(card => `
        <div class="feedback-card">
          <strong>
            ${escapeHtml(formatCardTitle(card))}
          </strong>

          <p>
            ${escapeHtml(getCardDescription(card))}
          </p>
        </div>
      `)
      .join("") ||
    "<p>No suggested cards yet.</p>"
  );
}

function renderEmpty() {
  setText(
    "athleteName",
    "No athlete selected"
  );

  setHtml(
    "matchInfo",
    "<p>No saved matches found.</p>"
  );

  setHtml(
    "feedbackInfo",
    "<p>Save a match first to generate athlete feedback.</p>"
  );

  setHtml(
    "cardInfo",
    "<p>No suggested cards yet.</p>"
  );
}

function setText(id, value) {
  const el =
    document.getElementById(id);

  if (el) {
    el.textContent =
      value || "";
  }
}

function setHtml(id, value) {
  const el =
    document.getElementById(id);

  if (el) {
    el.innerHTML =
      value || "";
  }
}

function formatList(items = []) {
  if (!items.length) {
    return "No patterns detected.";
  }

  return items
    .map(item =>
      String(item)
        .replaceAll("-", " ")
        .replace(/\b\w/g, char =>
          char.toUpperCase()
        )
    )
    .join(", ");
}

function formatCardTitle(cardId = "") {
  return String(cardId)
    .replace(/-\d+$/, "")
    .replaceAll("-", " ")
    .replace(/\b\w/g, char =>
      char.toUpperCase()
    );
}

function getCardDescription(cardId = "") {
  const descriptions = {
    "neutral-offense-01":
      "Keep attacking first and building pressure from setups.",

    "neutral-defense-01":
      "Protect position, manage ties, and defend clean entries.",

    "bottom-escape-01":
      "Build movement from bottom and turn escapes into points.",

    "back-defense-01":
      "Fight hands, belly down, and prevent exposure.",

    "top-pressure-01":
      "Build ride-to-turn chains and convert control into nearfall.",

    "reversal-threat-01":
      "Use bottom motion and hip heists to create reversal opportunities."
  };

  return descriptions[cardId] ||
    "Development card connected to this match pattern.";
}
