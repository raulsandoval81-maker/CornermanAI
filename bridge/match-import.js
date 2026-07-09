/* =========================
   MATCH IMPORT BRIDGE
========================= */

function importLastConsoleMatch() {
  const consoleMatch =
    getLastConsoleMatch();

  if (!consoleMatch) {
    setImportStatus(
      "No console match found. Run and save a match first."
    );
    return;
  }

  const matches =
    getTournamentMatches();

  const alreadyImported =
    matches.some(match =>
      String(match.sourceId) ===
      String(consoleMatch.id)
    );

  if (alreadyImported) {
    setImportStatus(
      "This console match is already imported."
    );
    return;
  }

  const importedMatch =
    convertConsoleMatch(consoleMatch);

  matches.push(importedMatch);

  localStorage.setItem(
    TOURNAMENT_MATCHES_KEY,
    JSON.stringify(matches)
  );

  setImportStatus(
    `Imported: ${importedMatch.athlete} vs ${importedMatch.opponent} — ${importedMatch.result} by ${importedMatch.method}`
  );

  renderLastConsoleMatch();
}

function getLastConsoleMatch() {
  const raw =
    localStorage.getItem(CONSOLE_MATCH_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error(
      "Bad console match payload:",
      error
    );
    return null;
  }
}

function getTournamentMatches() {
  return JSON.parse(
    localStorage.getItem(
      TOURNAMENT_MATCHES_KEY
    ) || "[]"
  );
}

function convertConsoleMatch(consoleMatch) {

  const intelligence =
    consoleMatch.intelligence || {};

  return {

    id:
      Date.now(),

    sourceId:
      consoleMatch.id,

    source:
      "coach-console-import",

    athlete:
      consoleMatch.athlete || "Athlete",

    opponent:
      consoleMatch.opponent || "Opponent",

    tournament:
      consoleMatch.eventName || "",

    weight:
      consoleMatch.weightClass || "",

    result:
      consoleMatch.winner === "athlete"
        ? "Win"
        : "Loss",

    method:
      normalizeMethod(
        consoleMatch.resultType
      ),

    pointsFor:
      Number(
        consoleMatch.athleteScore || 0
      ),

    pointsAgainst:
      Number(
        consoleMatch.opponentScore || 0
      ),

    takedowns:
      countEvents(
        consoleMatch,
        "athlete",
        "TD"
      ),

    escapes:
      countEvents(
        consoleMatch,
        "athlete",
        "ESC"
      ),

    reversals:
      countEvents(
        consoleMatch,
        "athlete",
        "REV"
      ),

    nearfall:
      countNearfall(
        consoleMatch,
        "athlete"
      ),

    notes:
      consoleMatch.notes || "",

    /* =====================
       Intelligence Payload
    ====================== */

    intelligence,

    patterns:
      intelligence.patterns || [],

    analysis:
      intelligence.analysis || {},

    coachSummary:
      intelligence.coachSummary || {},

    athleteFeedback:
      intelligence.athleteFeedback || {},

    recommendations:
      intelligence.recommendations || [],

    practiceFocus:
      intelligence.practiceFocus || {},

    report:
      intelligence.report || {},

    importedAt:
      new Date().toISOString()
  };
}