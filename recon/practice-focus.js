export function buildPracticeFocus(match = {}, analysis = {}) {
  const focus = [];

  if (Number(analysis.takedowns || 0) === 0) {
    focus.push("Neutral offense");
  }

  if (Number(analysis.nearfall || 0) === 0) {
    focus.push("Top turns");
  }

  if (Number(analysis.pointsAgainst || 0) > 0) {
    focus.push("Defensive reactions");
  }

  if (!focus.length) {
    focus.push("Maintain current scoring habits");
  }

  return {
    title: "Practice Focus",
    focus
  };
}
