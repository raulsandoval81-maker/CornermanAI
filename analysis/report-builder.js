export function buildReport({

  match,
  patterns,
  analysis,
  coachSummary,
  athleteFeedback,
  recommendations,
  practiceFocus

}) {

  return {

    generatedAt:
      new Date().toISOString(),

    athlete:
      match.athlete,

    opponent:
      match.opponent,

    event:
      match.eventName,

    result:
      match.result,

    patterns,

    analysis,

    coachSummary,

    athleteFeedback,

    recommendations,

    practiceFocus

  };

}