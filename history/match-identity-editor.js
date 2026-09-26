import { getMatch, saveMatch } from "../shared/match-repository.js";
import { listRoster } from "../shared/roster-repository.js";

const params = new URLSearchParams(window.location.search);
const matchId = params.get("id");
const openInEditMode = params.get("edit") === "1";
const { escapeHtml } = window.CornermanSafe;

const PLACEHOLDER_NAMES = new Set([
  "wrestler a",
  "wrestler b",
  "athlete a",
  "athlete b",
  "green wrestler",
  "red wrestler",
  "green",
  "red"
]);

function isPlaceholderName(value) {
  return PLACEHOLDER_NAMES.has(String(value || "").trim().toLowerCase());
}

function displayName(entry) {
  return String(entry?.displayName || entry?.name || "Athlete").trim();
}

function entryId(entry) {
  return String(entry?.sourceAthleteId || entry?.entryId || entry?.athleteId || entry?.name || "");
}

function entryTeam(entry) {
  return String(entry?.teamName || entry?.team || "").trim();
}

async function initializeEditor() {
  if (!matchId) return;

  const detailHost = document.getElementById("matchDetail");
  const detailCard = detailHost?.closest(".card");
  if (!detailCard) return;

  const [{ match }, rosterResult] = await Promise.all([
    getMatch(matchId),
    listRoster()
  ]);

  if (!match) return;

  const roster = rosterResult.athletes || [];
  const needsAssignment = isPlaceholderName(match.athlete) || isPlaceholderName(match.opponent);

  const editorCard = document.createElement("section");
  editorCard.className = "card";
  editorCard.id = "matchIdentityEditorCard";
  editorCard.innerHTML = `
    <span>IDENTITY</span>
    <strong>${needsAssignment ? "Needs Athlete Assignment" : "Edit Match Identity"}</strong>
    <p class="muted">Update who this saved match belongs to without changing score, events, or result.</p>

    <button id="toggleMatchIdentityEditor" type="button">${openInEditMode || needsAssignment ? "Hide Editor" : "Edit Match"}</button>

    <form id="matchIdentityEditor" ${openInEditMode || needsAssignment ? "" : "hidden"}>
      <label>
        Link Wrestler A / Green Athlete
        <select id="editRosterAthlete">
          <option value="">Manual / keep typed name</option>
          ${roster.map(entry => `
            <option value="${escapeHtml(entryId(entry))}">${escapeHtml(displayName(entry))}</option>
          `).join("")}
        </select>
      </label>

      <label>
        Wrestler A / Green Name
        <input id="editAthleteName" type="text" value="${escapeHtml(match.athlete || "")}" />
      </label>

      <label>
        Green Team
        <input id="editGreenTeam" type="text" value="${escapeHtml(match.greenTeam || "")}" />
      </label>

      <label>
        Wrestler B / Red Opponent
        <input id="editOpponentName" type="text" value="${escapeHtml(match.opponent || "")}" />
      </label>

      <label>
        Red Team
        <input id="editRedTeam" type="text" value="${escapeHtml(match.redTeam || "")}" />
      </label>

      <label>
        Event
        <input id="editEventName" type="text" value="${escapeHtml(match.eventName || "")}" />
      </label>

      <label>
        Weight
        <input id="editWeightClass" type="text" value="${escapeHtml(match.weightClass || "")}" />
      </label>

      <label>
        Coach Notes
        <textarea id="editMatchNotes">${escapeHtml(match.notes || "")}</textarea>
      </label>

      <div class="match-identity-editor-actions">
        <button id="saveMatchIdentity" type="submit">Save Match Changes</button>
        <a href="./match-history.html">Back to History</a>
      </div>
      <p id="matchIdentityStatus" class="muted"></p>
    </form>
  `;

  detailCard.insertAdjacentElement("afterend", editorCard);

  const style = document.createElement("style");
  style.textContent = `
    #matchIdentityEditor {
      display: grid;
      gap: 12px;
      margin-top: 14px;
    }
    #matchIdentityEditor[hidden] { display: none; }
    #matchIdentityEditor label {
      display: grid;
      gap: 6px;
      font-weight: 800;
    }
    #matchIdentityEditor input,
    #matchIdentityEditor select,
    #matchIdentityEditor textarea {
      width: 100%;
      box-sizing: border-box;
      min-height: 42px;
      padding: 9px 10px;
      border-radius: 9px;
    }
    #matchIdentityEditor textarea { min-height: 90px; }
    .match-identity-editor-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
    }
  `;
  document.head.appendChild(style);

  const form = document.getElementById("matchIdentityEditor");
  const toggle = document.getElementById("toggleMatchIdentityEditor");
  const rosterSelect = document.getElementById("editRosterAthlete");
  const athleteName = document.getElementById("editAthleteName");
  const greenTeam = document.getElementById("editGreenTeam");
  const opponentName = document.getElementById("editOpponentName");
  const redTeam = document.getElementById("editRedTeam");
  const eventName = document.getElementById("editEventName");
  const weightClass = document.getElementById("editWeightClass");
  const notes = document.getElementById("editMatchNotes");
  const status = document.getElementById("matchIdentityStatus");
  const saveButton = document.getElementById("saveMatchIdentity");

  if (match.sourceAthleteId && rosterSelect) {
    const matching = roster.find(entry => entryId(entry) === String(match.sourceAthleteId));
    if (matching) rosterSelect.value = entryId(matching);
  }

  toggle?.addEventListener("click", () => {
    form.hidden = !form.hidden;
    toggle.textContent = form.hidden ? "Edit Match" : "Hide Editor";
  });

  rosterSelect?.addEventListener("change", () => {
    const selected = roster.find(entry => entryId(entry) === rosterSelect.value);
    if (!selected) return;
    athleteName.value = displayName(selected);
    if (entryTeam(selected)) greenTeam.value = entryTeam(selected);
  });

  form?.addEventListener("submit", async event => {
    event.preventDefault();
    saveButton.disabled = true;
    saveButton.textContent = "Saving…";
    status.textContent = "Updating the saved match…";

    const selected = roster.find(entry => entryId(entry) === rosterSelect?.value);
    const updated = {
      ...match,
      athlete: athleteName?.value.trim() || match.athlete,
      opponent: opponentName?.value.trim() || match.opponent,
      greenTeam: greenTeam?.value.trim() || "",
      redTeam: redTeam?.value.trim() || "",
      eventName: eventName?.value.trim() || "",
      weightClass: weightClass?.value.trim() || "",
      notes: notes?.value.trim() || "",
      updatedAt: new Date().toISOString()
    };

    if (selected) {
      updated.sourceSystem = selected.sourceSystem || updated.sourceSystem || "cornerman";
      updated.sourceAthleteId = selected.sourceAthleteId || selected.entryId || selected.athleteId || "";
      updated.sourceTeamId = selected.sourceTeamId || updated.sourceTeamId || "";
    }

    const result = await saveMatch(updated);
    localStorage.setItem("coach_console_last_match", JSON.stringify(result.match));

    status.textContent = result.synced
      ? "Match identity updated."
      : "Match updated locally — sync pending.";

    saveButton.textContent = "Saved ✓";
    setTimeout(() => {
      window.location.href = `./match-detail.html?id=${encodeURIComponent(String(matchId))}`;
    }, 350);
  });
}

initializeEditor();
