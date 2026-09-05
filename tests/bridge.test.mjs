import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { buildHandoffPayload, validateHandoffPayload } from "../bridge/handoff-payload.js";

const match = {
  id: "match-42",
  athleteId: "athlete-7",
  athlete: "Sandman Athlete",
  opponent: "Opponent",
  eventName: "League Finals",
  result: "Win",
  method: "Decision",
  pointsFor: 8,
  pointsAgainst: 4
};

const payload = buildHandoffPayload({
  match,
  patternId: "neutral-defense",
  recommendation: { id: "recommendation-3", priority: "high", title: "Strengthen neutral defense", focus: "Improve stance and sprawl reactions." },
  skillKey: "sprawl",
  notes: "Review with development coach.",
  now: () => "2026-09-05T12:00:00.000Z"
});

assert.equal(validateHandoffPayload(payload).valid, true);
assert.equal(payload.matchId, "match-42");
assert.equal(payload.patternId, "neutral-defense");
assert.equal(payload.recommendationId, "recommendation-3");
assert.equal(payload.skillKey, "sprawl");
assert.equal(payload.athleteId, "athlete-7");
assert.equal(payload.evidence.opponent, "Opponent");
for (const field of ["cards", "cardId", "xp", "rank", "progression", "curriculum", "testing"]) {
  assert.equal(Object.hasOwn(payload, field), false);
}

assert.throws(() => buildHandoffPayload({ match: { id: "missing-athlete" }, skillKey: "sprawl" }), /athlete/i);
assert.throws(() => buildHandoffPayload({ match, skillKey: "" }), /skill/i);
assert.doesNotThrow(() => buildHandoffPayload({ match: { ...match, intelligence: "malformed", cards: ["do-not-copy"], xp: 100 }, skillKey: "stance" }));

execFileSync(process.execPath, ["--check", "bridge/match-import.js"], { stdio: "pipe" });
const bridgeSource = fs.readFileSync("bridge/match-import.js", "utf8");
assert.match(bridgeSource, /listMatches/);
assert.doesNotMatch(bridgeSource, /TOURNAMENT_MATCHES_KEY|CONSOLE_MATCH_KEY|convertConsoleMatch/);

const feedbackSource = fs.readFileSync("reports/athlete-feedback/athlete-feedback.js", "utf8");
assert.doesNotMatch(feedbackSource, /exportToSandman|mapPatternsToCards|payload\.cards/);
assert.match(feedbackSource, /mapPatternsToSkills/);

console.log("Bridge repair tests: PASS");
