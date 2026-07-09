export function buildCoachSummary(match = {}, analysis = {}) {
  const patterns = analysis.patterns || [];

  if (!patterns.length) {
    return {
      title: "Coach Summary",
      summary: "Match data is limited. Review the timeline and video evidence.",
      keyPoints: []
    };
  }

  return {
    title: "Coach Summary",
    summary: patterns
      .map(pattern => pattern.message || pattern.title || String(pattern))
      .join(" "),
    keyPoints: patterns
  };
}
