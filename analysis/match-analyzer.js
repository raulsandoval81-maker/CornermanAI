export function analyzeMatch(match = {}, patterns = {}) {

  const analysis = {

    takedowns:
      Number(match.takedowns || 0),

    escapes:
      Number(match.escapes || 0),

    reversals:
      Number(match.reversals || 0),

    nearfall:
      Number(match.nearfall || 0),

    pointsFor:
      Number(match.pointsFor || 0),

    pointsAgainst:
      Number(match.pointsAgainst || 0),

    firstScore:
      patterns.firstScore || null,

    winningFactor:
      patterns.winningFactor || "",

    patterns

  };

  return analysis;

}