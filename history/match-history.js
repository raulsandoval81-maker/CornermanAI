const STORAGE_KEY =
"cornerman_matches";

const historyList =
document.getElementById("historyList");

loadHistory();

function loadHistory() {

const matches =
JSON.parse(
localStorage.getItem(STORAGE_KEY) || "[]"
);

if (!matches.length) {


historyList.innerHTML =
  "<p>No matches saved.</p>";

return;


}

historyList.innerHTML =
matches
.slice()
.reverse()

.map(match => {
  const videoButton = match.videoUrl
    ? `
      <a
        href="${match.videoUrl}"
        target="_blank"
        rel="noopener"
      >
        🎥 Watch Video
      </a>
    `
    : `
      <span class="muted">
        No video
      </span>
    `;

  return `
    <div class="match-row">

      <strong>
        ${match.athlete}
      </strong>

      <p>
        vs ${match.opponent}
      </p>

      <p>
        ${match.result || "Result"}
        by
        ${match.method || "Decision"}
      </p>

      <p>
        ${match.pointsFor || 0}
        -
        ${match.pointsAgainst || 0}
      </p>

      <a
        href="./match-detail.html?id=${match.id}"
      >
        Open Match
      </a>

      ${videoButton}

    </div>
  `;
})
.join("");

}
