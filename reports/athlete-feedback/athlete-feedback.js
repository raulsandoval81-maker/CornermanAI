import { buildAthleteFeedback } from "../../recon/athlete-feedback.js";
import { mapPatternsToSkills } from "../../bridge/skill-mapper.js";
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
  const sourcePatterns = latestMatch.intelligence?.patterns || latestMatch.patterns || [];
  const patterns = Array.isArray(sourcePatterns) ? sourcePatterns : [];
  const feedback = latestMatch.intelligence?.athleteFeedback || buildAthleteFeedback(latestMatch, { patterns });
  const payload = {
    athlete: latestMatch.athlete || "Athlete",
    match: {
      opponent: latestMatch.opponent || "Opponent",
      result: latestMatch.result || "Result",
      method: latestMatch.method || "Decision",
      score: `${Number(latestMatch.pointsFor || 0)}-${Number(latestMatch.pointsAgainst || 0)}`
    },
    feedback: feedback.fix || feedback.feedback || "Continue building complete wrestling.",
    patterns,
    skills: mapPatternsToSkills(patterns)
  };

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
    (payload.skills || [])
      .map(skill => `
        <div class="feedback-card">
          <strong>
            ${escapeHtml(formatSkillTitle(skill))}
          </strong>

          <p>
            Development skill suggested by Cornerman competition evidence. Sandman decides the training assignment.
          </p>
        </div>
      `)
      .join("") ||
    "<p>No suggested skills yet.</p>"
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
    "<p>No suggested skills yet.</p>"
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

function formatSkillTitle(skillKey = "") {
  return String(skillKey)
    .replaceAll("-", " ")
    .replace(/\b\w/g, char =>
      char.toUpperCase()
    );
}
