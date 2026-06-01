import {
  exportToSandman
} from "../../bridge/sandman-export.js";

const payload =
  exportToSandman({
    athlete: "Maximus",

    latestMatch: {
      opponent: "Dill",
      result: "Win",
      method: "Pin",
      pointsFor: 12,
      pointsAgainst: 4
    },

    patterns: [
      "neutral-offense"
    ]
  });

render(payload);

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
          ${payload.match.result}
          by
          ${payload.match.method}
          vs
          ${payload.match.opponent}
        </strong>

        <p>
          Score:
          ${payload.match.score}
        </p>
      </div>
    `
  );

  setHtml(
    "feedbackInfo",
    `
      <div class="feedback-item">
        <strong>Feedback</strong>
        <p>${payload.feedback}</p>
      </div>

      <div class="feedback-item">
        <strong>Pattern</strong>
        <p>${formatList(payload.patterns)}</p>
      </div>
    `
  );

  setHtml(
    "cardInfo",
    (payload.cards || [])
      .map(card => `
<div class="feedback-card">
  <strong>
    ${formatCardTitle(card)}
  </strong>

  <p>
    ${getCardDescription(card)}
  </p>
</div>

        `)
      .join("")
      || "<p>No suggested cards yet.</p>"
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
      item
        .replaceAll("-", " ")
        .replace(/\b\w/g, char =>
          char.toUpperCase()
        )
    )
    .join(", ");
}

function formatCardTitle(cardId = "") {
  return cardId
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
      "Fight hands, belly down, and prevent exposure."
  };

  return descriptions[cardId]
    || "Development card connected to this match pattern.";
}