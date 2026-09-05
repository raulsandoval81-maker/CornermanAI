function clean(value) { return String(value ?? "").trim(); }
function normalizeSandmanAthlete(value, workspaceId) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const sourceAthleteId = clean(value.sourceAthleteId || value.uid || value.athleteId);
  const sourceTeamId = clean(value.sourceTeamId || value.teamId || value.locationId);
  const displayName = clean(value.displayName || value.publicName || value.fullName || value.name);
  if (!sourceAthleteId || !sourceTeamId || !displayName) return null;
  return { sourceSystem: "sandman", sourceAthleteId, sourceTeamId, displayName, status: clean(value.status || value.rosterStatus || "current").toLowerCase(), discipline: clean(value.discipline || value.primaryDiscipline || value.art || value.program), teamName: clean(value.teamName || value.team), workspaceId: clean(workspaceId) };
}
function normalizeSandmanRoster(values, workspaceId, expectedTeamId) {
  const athletes = []; const seen = new Set();
  for (const value of Array.isArray(values) ? values : []) {
    const athlete = normalizeSandmanAthlete(value, workspaceId);
    if (!athlete || athlete.sourceTeamId !== expectedTeamId || seen.has(athlete.sourceAthleteId)) continue;
    seen.add(athlete.sourceAthleteId); athletes.push(athlete);
  }
  return athletes;
}
function configuredLinks() { try { const value = JSON.parse(process.env.CORNERMAN_SANDMAN_WORKSPACE_LINKS_JSON || "[]"); return Array.isArray(value) ? value : []; } catch { return []; } }
function getWorkspaceLink(workspaceId, links = configuredLinks()) { return links.find(link => clean(link?.workspaceId) === clean(workspaceId) && clean(link?.sourceTeamId)) || null; }
module.exports = { configuredLinks, getWorkspaceLink, normalizeSandmanAthlete, normalizeSandmanRoster };
