export const MATCH_FORMATS = {
  novice_45sec: {
    label: "Novice Standard — 0:45",
    division: "novice",
    bracketType: "standard",
    periods: [
      { round: "1", seconds: 45, start: "neutral" },
      { round: "2", seconds: 45, start: "choice" },
      { round: "3", seconds: 45, start: "choice" }
    ],
    overtime: true
  },

  youth_1min: {
    label: "Youth Standard — 1:00",
    division: "youth",
    bracketType: "standard",
    periods: [
      { round: "1", seconds: 60, start: "neutral" },
      { round: "2", seconds: 60, start: "choice" },
      { round: "3", seconds: 60, start: "choice" }
    ],
    overtime: true
  },

  jv_90sec: {
    label: "JV Championship — 1:30",
    division: "jv",
    bracketType: "championship",
    periods: [
      { round: "1", seconds: 90, start: "neutral" },
      { round: "2", seconds: 90, start: "choice" },
      { round: "3", seconds: 90, start: "choice" }
    ],
    overtime: true
  },

  jv_consolation: {
    label: "JV Consolation — 1:00",
    division: "jv",
    bracketType: "consolation",
    periods: [
      { round: "1", seconds: 60, start: "neutral" },
      { round: "2", seconds: 90, start: "choice" },
      { round: "3", seconds: 90, start: "choice" }
    ],
    overtime: true
  },

  varsity_championship: {
    label: "Varsity Championship — 2:00",
    division: "varsity",
    bracketType: "championship",
    periods: [
      { round: "1", seconds: 120, start: "neutral" },
      { round: "2", seconds: 120, start: "choice" },
      { round: "3", seconds: 120, start: "choice" }
    ],
    overtime: true
  },

  varsity_consolation: {
    label: "Varsity Consolation — 1:00",
    division: "varsity",
    bracketType: "consolation",
    periods: [
      { round: "1", seconds: 60, start: "neutral" },
      { round: "2", seconds: 120, start: "choice" },
      { round: "3", seconds: 120, start: "choice" }
    ],
    overtime: true
  },

  college_3_2_2: {
    label: "College — 3:00",
    division: "college",
    bracketType: "standard",
    periods: [
      { round: "1", seconds: 180, start: "neutral" },
      { round: "2", seconds: 120, start: "choice" },
      { round: "3", seconds: 120, start: "choice" }
    ],
    overtime: true,
    ridingTime: true
  }
};

export const DEFAULT_MATCH_FORMAT = "varsity_championship";