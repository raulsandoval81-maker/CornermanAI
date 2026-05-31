export const WEIGHT_CLASSES = {
  youth: [
    40, 45, 50, 55, 60, 65, 70, 75,
    80, 85, 90, 95, 100, 105, 110,
    115, 120, 125, 130, 135, 140,
    145, 150, 160, 170, 180, 200
  ],

  juniorHighBoys: [
    70, 75, 80, 85, 90, 95, 100,
    105, 110, 115, 120, 126, 132,
    138, 145, 152, 160, 175, 190,
    215, 250
  ],

  juniorHighGirls: [
    70, 75, 80, 85, 90, 95, 100,
    105, 110, 115, 120, 126, 132,
    138, 145, 152, 160, 175, 190,
    215
  ],

  highSchoolBoys: [
    106, 113, 120, 126, 132, 138, 144,
    150, 157, 165, 175, 190, 215, 285
  ],

  highSchoolGirls: [
    100, 105, 110, 115, 120, 125, 130,
    135, 140, 145, 155, 170, 190, 235
  ],

  collegeMen: [
    125, 133, 141, 149, 157,
    165, 174, 184, 197, 285
  ],

  collegeWomen: [
    101, 109, 116, 123, 130,
    136, 143, 155, 170, 191
  ],

  open: []
};

export const WEIGHT_CLASS_LABELS = {
  youth: "Youth",
  juniorHighBoys: "Junior High Boys",
  juniorHighGirls: "Junior High Girls",
  highSchoolBoys: "High School Boys",
  highSchoolGirls: "High School Girls",
  collegeMen: "College Men",
  collegeWomen: "College Women",
  open: "Custom / Open"
};

export function getWeightClasses(group) {
  return WEIGHT_CLASSES[group] || [];
}

export function formatWeight(weight) {
  return `${weight} lb`;
}