const CARD_MAP = {
  "neutral-defense": [
    "neutral-defense-01"
  ],

  "neutral-offense": [
    "neutral-offense-01"
  ],

  "strong-bottom": [
    "bottom-escape-01"
  ],

  "back-exposure-risk": [
    "back-defense-01"
  ]
};

export function mapPatternsToCards(
  patterns = []
) {
  return patterns.flatMap(
    pattern =>
      CARD_MAP[pattern] || []
  );
}