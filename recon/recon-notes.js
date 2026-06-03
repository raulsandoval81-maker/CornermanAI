const STORAGE_KEY =
"cornerman_recon";

const saveBtn =
document.getElementById("saveRecon");

const reconList =
document.getElementById("reconList");

loadRecon();

saveBtn?.addEventListener(
"click",
saveRecon
);

function saveRecon() {

const notes =
JSON.parse(
localStorage.getItem(STORAGE_KEY) || "[]"
);

notes.push({
id: Date.now(),


opponent:
  document.getElementById("opponentName")
    ?.value.trim() || "",

preferredStance:
  document.getElementById("preferredStance")
    ?.value.trim() || "",

favoriteTie:
  document.getElementById("favoriteTie")
    ?.value.trim() || "",

favoriteShot:
  document.getElementById("favoriteShot")
    ?.value.trim() || "",

favoriteEscape:
  document.getElementById("favoriteEscape")
    ?.value.trim() || "",

bestTurn:
  document.getElementById("bestTurn")
    ?.value.trim() || "",

coachNotes:
  document.getElementById("coachNotes")
    ?.value.trim() || "",

createdAt:
  new Date().toISOString()


});

localStorage.setItem(
STORAGE_KEY,
JSON.stringify(notes)
);

loadRecon();
}

function loadRecon() {

const notes =
JSON.parse(
localStorage.getItem(STORAGE_KEY) || "[]"
);

if (!notes.length) {


reconList.innerHTML =
  "<p>No notes saved.</p>";

return;


}

reconList.innerHTML =
notes
.slice()
.reverse()
.map(note => ` <div class="match-row">


      <strong>
        ${note.opponent}
      </strong>

      <p>
        Stance: ${note.preferredStance || "-"}
      </p>

      <p>
        Tie: ${note.favoriteTie || "-"}
      </p>

      <p>
        Shot: ${note.favoriteShot || "-"}
      </p>

      <p>
        Escape: ${note.favoriteEscape || "-"}
      </p>

      <p>
        Turn: ${note.bestTurn || "-"}
      </p>

    </div>
  `)
  .join("");


}
