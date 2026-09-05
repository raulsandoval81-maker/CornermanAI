import { listMatches } from "../shared/match-repository.js";
import { mapPatternsToSkills } from "./skill-mapper.js";
import { buildHandoffPayload, formatSkillLabel, validateHandoffPayload } from "./handoff-payload.js";

export const HANDOFF_STORAGE_KEY = "cornerman_sandman_handoffs_v1";

const matchSelect = document.getElementById("handoffMatch");
const skillSelect = document.getElementById("handoffSkill");
const notesInput = document.getElementById("handoffNotes");
const prepareButton = document.getElementById("prepareHandoffBtn");
const status = document.getElementById("handoffStatus");
const sourceSummary = document.getElementById("handoffSourceSummary");
const preview = document.getElementById("handoffPreview");

let matches = [];
let skillOptions = [];

function setStatus(message, state = "") {
  status.textContent = message;
  status.dataset.state = state;
}

function getIntelligence(match = {}) {
  return match.intelligence && typeof match.intelligence === "object" ? match.intelligence : {};
}

function getPatterns(match = {}) {
  const patterns = getIntelligence(match).patterns || match.patterns || [];
  return Array.isArray(patterns) ? patterns.filter(Boolean).map(String) : [];
}

function getRecommendations(match = {}) {
  const recommendations = getIntelligence(match).recommendations || match.recommendations || [];
  return Array.isArray(recommendations) ? recommendations.filter(item => item && typeof item === "object") : [];
}

function selectedMatch() {
  return matches.find(match => String(match.id) === matchSelect.value) || null;
}

function buildSkillOptions(match) {
  return getPatterns(match).flatMap(patternId =>
    mapPatternsToSkills([patternId]).map(skillKey => ({ patternId, skillKey }))
  ).filter((option, index, options) =>
    options.findIndex(candidate => candidate.skillKey === option.skillKey) === index
  );
}

function findRecommendation(match, patternId) {
  const recommendations = getRecommendations(match);
  return recommendations.find(item => String(item.patternId || item.pattern || "") === String(patternId)) || recommendations[0] || {};
}

function renderSource(match) {
  sourceSummary.replaceChildren();
  if (!match) {
    sourceSummary.textContent = "Select a match to review its development signals.";
    return;
  }
  const heading = document.createElement("strong");
  heading.textContent = `${match.athlete || "Athlete"} vs ${match.opponent || "Opponent"}`;
  const details = document.createElement("p");
  details.textContent = [match.eventName, match.result, match.method].filter(Boolean).join(" · ") || "Saved Cornerman match";
  const identity = document.createElement("small");
  identity.textContent = `Match ID: ${match.id}`;
  sourceSummary.append(heading, details, identity);
}

function renderSkillOptions(match) {
  skillOptions = buildSkillOptions(match);
  skillSelect.replaceChildren(new Option("Select development skill", ""));
  for (const option of skillOptions) {
    skillSelect.add(new Option(`${formatSkillLabel(option.skillKey)} — ${formatSkillLabel(option.patternId)}`, option.skillKey));
  }
  skillSelect.disabled = !skillOptions.length;
  prepareButton.disabled = !skillOptions.length;
  if (!skillOptions.length && match) setStatus("This match has no supported pattern-to-skill signal yet.", "warning");
  else if (match) setStatus("Select the skill Sandman should evaluate for development.");
}

function handleMatchChange() {
  const match = selectedMatch();
  renderSource(match);
  renderSkillOptions(match);
  preview.textContent = "No handoff prepared.";
}

function readStoredHandoffs() {
  try {
    const stored = JSON.parse(localStorage.getItem(HANDOFF_STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function storeHandoff(payload) {
  const handoffs = readStoredHandoffs();
  handoffs.push(payload);
  localStorage.setItem(HANDOFF_STORAGE_KEY, JSON.stringify(handoffs));
}

export function prepareSelectedHandoff() {
  const match = selectedMatch();
  const option = skillOptions.find(item => item.skillKey === skillSelect.value);
  const recommendation = findRecommendation(match || {}, option?.patternId);
  const payload = buildHandoffPayload({ match: match || {}, patternId: option?.patternId || "", recommendation, skillKey: option?.skillKey || "", notes: notesInput.value });
  const validation = validateHandoffPayload(payload);
  if (!validation.valid) throw new TypeError(validation.errors.join(" "));
  storeHandoff(payload);
  preview.textContent = JSON.stringify(payload, null, 2);
  setStatus("Handoff prepared locally. Sandman receiving endpoint is not connected; no delivery was attempted.", "success");
  return payload;
}

async function initialize() {
  setStatus("Loading canonical Cornerman matches…");
  const result = await listMatches();
  matches = Array.isArray(result.matches) ? result.matches.filter(Boolean) : [];
  matchSelect.replaceChildren(new Option("Select match", ""));
  for (const match of matches.slice().reverse()) {
    matchSelect.add(new Option(`${match.athlete || "Athlete"} vs ${match.opponent || "Opponent"} — ${match.eventName || "Match"}`, String(match.id)));
  }
  setStatus(matches.length ? "Select a Cornerman match." : "No saved matches are available.");
  matchSelect.disabled = !matches.length;
  skillSelect.disabled = true;
  prepareButton.disabled = true;
}

matchSelect.addEventListener("change", handleMatchChange);
prepareButton.addEventListener("click", () => {
  try { prepareSelectedHandoff(); }
  catch (error) { setStatus(error?.message || "Unable to prepare this handoff.", "error"); }
});

initialize().catch(() => setStatus("Cornerman matches could not be loaded safely.", "error"));
