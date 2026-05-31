export const TOURNAMENT_ROSTER = [
  {
    entryId: "maximus-varsity-215",
    athleteId: "maximus",
    name: "Maximus",
    team: "Sandman Combat",
    eventName: "Varsity Championship",
    division: "High School Boys",
    weightGroup: "highSchoolBoys",
    weight: "215",
    checkedIn: true,
    attendanceXp: 10,
    placementXp: 0
  },
  {
    entryId: "green-jh-122",
    athleteId: "green",
    name: "green",
    team: "Sandman Combat",
    eventName: "Varsity Championship",
    division: "Junior High Boys",
    weightGroup: "juniorHighBoys",
    weight: "122",
    checkedIn: true,
    attendanceXp: 10,
    placementXp: 0
  }
];

export function getTournamentRoster() {
  return TOURNAMENT_ROSTER.filter(entry => entry.checkedIn);
}

export function getTournamentEntry(entryId) {
  return TOURNAMENT_ROSTER.find(entry => entry.entryId === entryId) || null;
}