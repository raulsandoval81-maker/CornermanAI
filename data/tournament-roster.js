
const STORAGE_KEY =
  "cornerman_tournament_roster";

const DEFAULT_ROSTER = [
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
  const saved =
    localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(DEFAULT_ROSTER)
    );

    return DEFAULT_ROSTER;
  }

  return JSON.parse(saved);
}

export function saveTournamentRoster(roster) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(roster)
  );
}

export function addTournamentEntry(entry) {
  const roster =
    getTournamentRoster();

  roster.push(entry);

  saveTournamentRoster(roster);
}

export function getTournamentEntry(entryId) {
  return getTournamentRoster()
    .find(entry =>
      entry.entryId === entryId
    ) || null;
}