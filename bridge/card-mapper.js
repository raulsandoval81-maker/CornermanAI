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

  "reversal-threat": [
    "reversal-series-01",
    "sit-out-series-01",
    "switch-series-01"
  ],

  "top-pressure": [
    "ride-control-01",
    "mat-return-01",
    "turn-series-01"
  ],

  "back-exposure-risk": [
    "back-defense-01",
    "belly-down-01",
    "hand-fight-bottom-01"
  ],

  "scores-first": [
    "first-score-mindset-01",
    "pressure-starts-01"
  ],

  "gives-up-first-score": [
    "opening-defense-01",
    "ready-position-01",
    "first-contact-01"
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