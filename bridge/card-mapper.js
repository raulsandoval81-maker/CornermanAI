const CARD_MAP = {
  "neutral-defense": [
    "neutral-defense-01",
    "sprawl-defense-01",
    "head-position-defense-01"
  ],

  "neutral-offense": [
    "neutral-offense-01",
    "setup-chain-01",
    "finish-chain-01"
  ],

  "strong-bottom": [
    "bottom-escape-01",
    "stand-up-chain-01",
    "hip-heist-01"
  ],

  "back-exposure-risk": [
    "back-defense-01",
    "belly-down-01",
    "hand-fight-bottom-01"
  ],

  "weak-finishes": [
    "shot-finish-01",
    "single-leg-finish-01",
    "double-leg-finish-01"
  ],

  "poor-hand-fighting": [
    "inside-tie-01",
    "clear-tie-01",
    "collar-tie-defense-01"
  ],

  "gets-tired-late": [
    "third-period-pace-01",
    "shark-bait-01",
    "pressure-wrestling-01"
  ],

  "top-control": [
    "ride-control-01",
    "mat-return-01",
    "wrist-ride-01"
  ],

  "turn-defense": [
    "half-defense-01",
    "wrist-control-defense-01",
    "base-rebuild-01"
  ]
};

export function mapPatternsToCards(patterns = []) {
  return [
    ...new Set(
      patterns.flatMap(pattern =>
        CARD_MAP[pattern] || []
      )
    )
  ];
}

export function getSupportedPatterns() {
  return Object.keys(CARD_MAP);
}