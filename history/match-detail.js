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

const coachTakeaway =
  document.getElementById("coachTakeaway");

const matchNotes =
  document.getElementById("matchNotes");

const matchSummary =
  document.getElementById("matchSummary");

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

console.log("MATCH", match);
console.log("VIDEO URL", match?.videoUrl);

if (!matchId) {
  matchTitle.textContent =
    "Match Detail";

  matchDetail.innerHTML =
    "<p>No match selected. Go back to Match History and open a match.</p>";

  matchTimeline.innerHTML =
    "<p>No events.</p>";

  matchNotes.textContent =
    "No notes.";
} else if (!match) {
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

  const videoLink =
    match.videoUrl
      ? `
        <p>
          <a
            href="${match.videoUrl}"
            target="_blank"
            rel="noopener"
          >
            🎥 Watch Video
          </a>
        </p>
      `
      : `
        <p class="muted">
          No video attached
        </p>
      `;

  matchDetail.innerHTML = `
    <p><strong>Event:</strong> ${match.eventName || "—"}</p>
    <p><strong>Weight:</strong> ${match.weightClass || "—"}</p>
    <p><strong>Result:</strong> ${match.result || "Result"} by ${match.method || "Decision"}</p>
    <p><strong>Score:</strong> ${match.pointsFor || 0} - ${match.pointsAgainst || 0}</p>
    <p><strong>Takedowns:</strong> ${match.takedowns || 0}</p>
    <p><strong>Escapes:</strong> ${match.escapes || 0}</p>
    <p><strong>Reversals:</strong> ${match.reversals || 0}</p>
    <p><strong>Nearfall:</strong> ${match.nearfall || 0}</p>
    ${videoLink}
  `;

  renderTimeline(match.events || [], match.videoUrl || "");
  renderSummary(match);
  renderCoachTakeaway(match);
  renderMatchNavigation(match);

  matchNotes.textContent =
    match.notes || "No notes.";
}

function renderTimeline(events, videoUrl = "") {
  if (!events.length) {
    matchTimeline.innerHTML =
      "<p>No events recorded.</p>";
    return;
  }

  matchTimeline.innerHTML =
    events
      .map(event => {
        const videoMomentUrl =
          buildYouTubeTimestampUrl(
            videoUrl,
            event.videoTime
          );

        const videoLink =
          videoMomentUrl
            ? `
              <a
                href="${videoMomentUrl}"
                target="_blank"
                rel="noopener"
                title="Open video at this event"
              >
                🎥
              </a>
            `
            : "";

        return `
          <div class="match-row">
            <strong>
              ${formatEventTime(event)}
              · R${event.round || "?"}
              · ${event.short || event.code || event.type || "Event"}
              ${videoLink}
            </strong>

            <p>
              ${formatEventPoints(event)}
            </p>
          </div>
        `;
      })
      .join("");
}

function renderSummary(match) {
  const firstScore =
    (match.events || []).find(event =>
      Number(event.points || 0) > 0
    );

  const firstScoreText =
    firstScore
      ? `${firstScore.short || firstScore.code || "Score"} (+${firstScore.points || 0})`
      : "No scoring recorded";

  const takedowns =
    match.takedowns || 0;

  const nearfall =
    match.nearfall || 0;

  let winningFactor =
    "Match data still limited.";

  if (takedowns >= 2) {
    winningFactor =
      "Neutral offense created repeated scoring opportunities.";
  }

  if (nearfall >= 2) {
    winningFactor =
      "Turns and exposure points created separation.";
  }

  matchSummary.innerHTML = `
    <p>
      <strong>First Score:</strong>
      ${firstScoreText}
    </p>

    <p>
      <strong>Offensive Output:</strong>
      ${takedowns} Takedowns ·
      ${nearfall} Nearfall Scores
    </p>

    <p>
      <strong>Winning Factor:</strong>
      ${winningFactor}
    </p>

    <p>
      <strong>Result:</strong>
      ${match.result || "Result"}
      by
      ${match.method || "Decision"}
    </p>
  `;
}

function renderCoachTakeaway(match) {
  const takedowns =
    Number(match.takedowns || 0);

  const nearfall =
    Number(match.nearfall || 0);

  const pointsAgainst =
    Number(match.pointsAgainst || 0);

  let win =
    "Athlete created scoring opportunities.";

  let fix =
    "Keep improving position control.";

  if (takedowns >= 2) {
    win =
      "Neutral attacks created the match advantage.";
  }

  if (nearfall >= 2) {
    win =
      "Top pressure and turns created separation.";
  }

  if (pointsAgainst > 0) {
    fix =
      "Clean up defensive reactions after scoring exchanges.";
  }

  const keyMoment =
    getKeyMoment(match.events || []);

  coachTakeaway.innerHTML = `
    <p>
      <strong>Key Moment:</strong>
      ${keyMoment}
    </p>

    <p>
      <strong>1 Win:</strong>
      ${win}
    </p>

    <p>
      <strong>1 Fix:</strong>
      ${fix}
    </p>
  `;
}

function renderMatchNavigation(match) {
  const currentIndex =
    matches.findIndex(item =>
      String(item.id) === String(match.id)
    );

  const previousMatch =
    matches[currentIndex - 1];

  const nextMatch =
    matches[currentIndex + 1];

  const nav =
    document.createElement("div");

  nav.className =
    "match-row";

  nav.innerHTML = `
    ${previousMatch
      ? `<a href="./match-detail.html?id=${previousMatch.id}">← ${previousMatch.athlete} vs ${previousMatch.opponent}</a>`
      : `<span>← No previous match</span>`
    }

    ${nextMatch
      ? `<a href="./match-detail.html?id=${nextMatch.id}">${nextMatch.athlete} vs ${nextMatch.opponent} →</a>`
      : `<span>No next match →</span>`
    }
  `;

  matchDetail.appendChild(nav);
}

function getKeyMoment(events) {
  const scoringEvents =
    (events || []).filter(event =>
      Number(event.points || 0) > 0
    );

  if (!scoringEvents.length) {
    return "No scoring sequence found.";
  }

  const bestSequence =
    scoringEvents
      .slice(0, 3)
      .map(event =>
        event.short || event.code || "Score"
      )
      .join(" → ");

  const totalPoints =
    scoringEvents
      .slice(0, 3)
      .reduce(
        (total, event) =>
          total + Number(event.points || 0),
        0
      );

  return `${bestSequence} created ${totalPoints} points of separation.`;
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

function buildYouTubeTimestampUrl(videoUrl, seconds) {
  if (!videoUrl || typeof seconds !== "number") return "";

  const safeSeconds =
    Math.max(0, Math.floor(seconds));

  const cleanUrl =
    videoUrl.trim();

  if (!cleanUrl) return "";

  const shortsMatch =
    cleanUrl.match(/youtube\.com\/shorts\/([^?&/]+)/);

  if (shortsMatch?.[1]) {
    return `https://www.youtube.com/watch?v=${shortsMatch[1]}&t=${safeSeconds}s`;
  }

  const separator =
    cleanUrl.includes("?") ? "&" : "?";

  return `${cleanUrl}${separator}t=${safeSeconds}s`;
}