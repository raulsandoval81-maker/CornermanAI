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

  const note = {
    id:
      Date.now(),

    opponent:
      getValue("opponentName"),

    preferredStance:
      getValue("preferredStance"),

    favoriteTie:
      getValue("favoriteTie"),

    favoriteShot:
      getValue("favoriteShot"),

    favoriteEscape:
      getValue("favoriteEscape"),

    bestTurn:
      getValue("bestTurn"),

    coachNotes:
      getValue("coachNotes"),

    createdAt:
      new Date().toISOString()
  };

  notes.push(note);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(notes)
  );

  clearForm();
  loadRecon();
}

function loadRecon() {
  const notes =
    JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

  if (!reconList) return;

  if (!notes.length) {
    reconList.innerHTML =
      "<p>No notes saved.</p>";
    return;
  }

  reconList.innerHTML =
    notes
      .slice()
      .reverse()
      .map(renderReconNote)
      .join("");
}

function renderReconNote(note) {
  return `
    <div class="match-row">

      <strong>
        ${note.opponent || "Unknown Opponent"}
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

      ${
        note.coachNotes
          ? `
            <p>
              Notes: ${note.coachNotes}
            </p>
          `
          : ""
      }

    </div>
  `;
}

function getValue(id) {
  return document
    .getElementById(id)
    ?.value
    .trim() || "";
}

function clearForm() {
  [
    "opponentName",
    "preferredStance",
    "favoriteTie",
    "favoriteShot",
    "favoriteEscape",
    "bestTurn",
    "coachNotes"
  ].forEach(id => {
    const el =
      document.getElementById(id);

    if (el) {
      el.value = "";
    }
  });
}