const CURRICULUM_MAP = {
  "stance": "neutral-foundations",
  "hand-fighting": "neutral-foundations",
  "down-block": "neutral-defense",
  "sprawl": "neutral-defense",
  "head-position": "neutral-defense",

  "level-change": "neutral-offense",
  "setups": "neutral-offense",
  "penetration-step": "neutral-offense",
  "shot-finish": "finishing",

  "first-move": "bottom",
  "stand-up": "bottom",
  "hip-heist": "bottom",
  "hand-control": "bottom",

  "sit-out": "reversals",
  "switch": "reversals",
  "granby": "reversals",
  "reversal-chain": "reversals",

  "ride": "top",
  "mat-return": "top",
  "wrist-control": "top",
  "turn-series": "turns",

  "base": "back-defense",
  "belly-down": "back-defense",
  "fight-hands": "back-defense",
  "hip-recovery": "back-defense",

  "match-start": "match-iq",
  "first-attack": "match-iq",
  "opening-pressure": "match-iq",
  "ready-position": "match-iq",
  "first-contact": "match-iq",
  "opening-defense": "match-iq"
};

export function mapSkillsToCurriculum(skills = []) {
  return [
    ...new Set(
      skills.map(skill =>
        CURRICULUM_MAP[skill] || "general-development"
      )
    )
  ];
}

export function getSupportedSkills() {
  return Object.keys(CURRICULUM_MAP);
}