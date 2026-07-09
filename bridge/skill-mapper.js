const SKILL_MAP = {

  "neutral-defense": [
    "stance",
    "hand-fighting",
    "down-block",
    "sprawl",
    "head-position"
  ],

  "neutral-offense": [
    "level-change",
    "setups",
    "penetration-step",
    "shot-finish"
  ],

  "strong-bottom": [
    "first-move",
    "stand-up",
    "hip-heist",
    "hand-control"
  ],

  "reversal-threat": [
    "sit-out",
    "switch",
    "granby",
    "reversal-chain"
  ],

  "top-pressure": [
    "ride",
    "mat-return",
    "wrist-control",
    "turn-series"
  ],

  "back-exposure-risk": [
    "base",
    "belly-down",
    "fight-hands",
    "hip-recovery"
  ],

  "scores-first": [
    "match-start",
    "first-attack",
    "opening-pressure"
  ],

  "gives-up-first-score": [
    "ready-position",
    "first-contact",
    "opening-defense"
  ]

};

export function mapPatternsToSkills(
  patterns = []
) {
  return [
    ...new Set(
      patterns.flatMap(pattern =>
        SKILL_MAP[pattern] || []
      )
    )
  ];
}

export function getSupportedPatterns() {
  return Object.keys(SKILL_MAP);
}