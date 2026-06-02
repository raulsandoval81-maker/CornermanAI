const STORAGE_KEY =
  "cornerman_tournament_roster";

export function getTournamentRoster() {
  const saved =
    localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return [];
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

export function removeTournamentEntry(entryId) {
  const roster =
    getTournamentRoster()
      .filter(entry =>
        entry.entryId !== entryId
      );

  saveTournamentRoster(roster);
}

export function getTournamentEntry(entryId) {
  return getTournamentRoster()
    .find(entry =>
      entry.entryId === entryId
    ) || null;
}