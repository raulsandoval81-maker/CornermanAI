const STORAGE_KEY =
"cornerman_recon";

const opponentSelect =
document.getElementById(
"opponentSelect"
);

const opponentDetails =
document.getElementById(
"opponentDetails"
);

const coachNotes =
document.getElementById(
"coachNotes"
);

let reconNotes = [];

init();

function init() {

reconNotes =
JSON.parse(
localStorage.getItem(STORAGE_KEY) || "[]"
);

loadOpponents();

opponentSelect?.addEventListener(
"change",
buildDashboard
);
}

function loadOpponents() {

const names =
[...new Set(
reconNotes
.map(note =>
note.opponent
)
.filter(Boolean)
)].sort();

opponentSelect.innerHTML = `     <option value="">
      Select Opponent     </option>
  `;

names.forEach(name => {


const option =
  document.createElement("option");

option.value = name;
option.textContent = name;

opponentSelect.appendChild(option);


});
}

function buildDashboard() {

const opponent =
opponentSelect?.value;

if (!opponent) {


opponentDetails.innerHTML =
  "Select an opponent.";

coachNotes.innerHTML =
  "No notes available.";

return;


}

const notes =
reconNotes.filter(note =>
note.opponent === opponent
);

const latest =
notes
.slice()
.reverse()[0];

if (!latest) return;

opponentDetails.innerHTML = ` <p> <strong>Preferred Stance:</strong>
${latest.preferredStance || "-"} </p>


<p>
  <strong>Favorite Tie:</strong>
  ${latest.favoriteTie || "-"}
</p>

<p>
  <strong>Favorite Shot:</strong>
  ${latest.favoriteShot || "-"}
</p>

<p>
  <strong>Favorite Finish:</strong>
  ${latest.favoriteFinish || "-"}
</p>

<p>
  <strong>Favorite Escape:</strong>
  ${latest.favoriteEscape || "-"}
</p>

<p>
  <strong>Best Turn:</strong>
  ${latest.bestTurn || "-"}
</p>


`;

coachNotes.innerHTML =
latest.coachNotes ||
"No notes available.";
}
