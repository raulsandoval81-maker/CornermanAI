const STORAGE_KEY =
  "cornerman_matches";

const params =
  new URLSearchParams(window.location.search);

const matchId =
  params.get("id");

const matchTitle =
  document.getElementById("matchTitle");

const matchDetail =
  document.getElementById("matchDetail");

const matchTimeline =
  document.getElementById("matchTimeline");

const matchNotes =
  document.getElementById("matchNotes");

const matches =
  JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

console.log("MATCH DETAIL ID:", matchId);
console.log(
  "MATCH IDS:",
  matches.map(match => String(match.id))
);

const match =
  matches.find(item =>
    String(item.id) === String(matchId)
  );

if (!match) {
  matchTitle.textContent =
    "Match Detail";

  matchDetail.innerHTML =
    "<p>Match not found.</p>";

  matchTimeline.innerHTML =
    "<p>No events.</p>";

  matchNotes.textContent =
    "No notes.";
} else {
  renderMatch(match);
}

function renderMatch(match) {
  matchTitle.textContent =
    `${match.athlete} vs ${match.opponent}`;

  matchDetail.innerHTML = `
    <p><strong>Event:</strong> ${match.eventName || "—"}</p>
    <p><strong>Weight:</strong> ${match.weightClass || "—"}</p>
    <p><strong>Result:</strong> ${match.result || "Result"} by ${match.method || "Decision"}</p>
    <p><strong>Score:</strong> ${match.pointsFor || 0} - ${match.pointsAgainst || 0}</p>
    <p><strong>Takedowns:</strong> ${match.takedowns || 0}</p>
    <p><strong>Escapes:</strong> ${match.escapes || 0}</p>
    <p><strong>Reversals:</strong> ${match.reversals || 0}</p>
    <p><strong>Nearfall:</strong> ${match.nearfall || 0}</p>
  `;

  renderTimeline(match.events || []);

  matchNotes.textContent =
    match.notes || "No notes.";
}

function renderTimeline(events) {
  if (!events.length) {
    matchTimeline.innerHTML =
      "<p>No events recorded.</p>";
    return;
  }

  matchTimeline.innerHTML =
    events
      .map(event => `
        <div class="match-row">
          <strong>
            ${formatEventTime(event)}
            · R${event.round || "?"}
            · ${event.short || event.code || event.type || "Event"}
          </strong>

          <p>
            ${formatEventPoints(event)}
          </p>
        </div>
      `)
      .join("");
}

function formatEventTime(event) {
  if (event.clock) return event.clock;
  if (event.time) return event.time;
  if (event.matchTime) return event.matchTime;
  return "0:00";
}

function formatEventPoints(event) {
  const points =
    Number(event.points || 0);

  return points > 0
    ? `+${points}`
    : "";
}