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

  document.getElementById(
    "athleteName"
  ).textContent =
    payload.athlete;

  document.getElementById(
    "matchInfo"
  ).innerHTML = `
    <p>
      ${payload.match.result}
      by
      ${payload.match.method}
      vs
      ${payload.match.opponent}
    </p>

    <p>
      Score:
      ${payload.match.score}
    </p>
  `;

  document.getElementById(
    "feedbackInfo"
  ).innerHTML = `
    <div class="feedback-item">
      ${payload.feedback}
    </div>
  `;

  document.getElementById(
    "cardInfo"
  ).innerHTML =
    (payload.cards || [])
      .map(card =>
        `<p>${card}</p>`
      )
      .join("");
}