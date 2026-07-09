export function buildReport({

  match = {},
  patterns = [],
  analysis = {},
  coachSummary = {},
  athleteFeedback = {},
  recommendations = [],
  practiceFocus = {}

}) {

  return {

    reportVersion: "1.0",

    generatedAt:
      new Date().toISOString(),

    match: {

      id:
        match.id || "",

      athlete:
        match.athlete || "",

      opponent:
        match.opponent || "",

      event:
        match.eventName || "",

      weightClass:
        match.weightClass || "",

      result:
        match.result || "",

      method:
        match.method || "",

      score: {
        for:
          Number(match.pointsFor || 0),

        against:
          Number(match.pointsAgainst || 0)
      }

    },

    intelligence: {

      patterns,

      analysis,

      coachSummary,

      athleteFeedback,

      recommendations,

      practiceFocus

    }

  };

}