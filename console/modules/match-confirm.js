export function initializeMatchConfirmAccordion() {
  const matchSetup = document.getElementById("matchSetup");
  const setupGrid = document.querySelector("#matchSetup .setup-grid");
  const confirmBtn = document.getElementById("confirmMatchSetup");

  if (!matchSetup || !setupGrid || !confirmBtn) return;

  const summary = document.createElement("div");
  summary.id = "matchSetupSummary";
  summary.className = "match-setup-summary hidden";

  const editBtn = document.createElement("button");
  editBtn.id = "editMatchSetup";
  editBtn.type = "button";
  editBtn.className = "setup-edit-btn hidden";
  editBtn.textContent = "Edit Match Details";

  matchSetup.appendChild(summary);
  matchSetup.appendChild(editBtn);

  confirmBtn.addEventListener("click", () => {
    collapseMatchSetup();
  });

  editBtn.addEventListener("click", () => {
    expandMatchSetup();
  });
}

function collapseMatchSetup() {
  const setupGrid = document.querySelector("#matchSetup .setup-grid");
  const confirmBtn = document.getElementById("confirmMatchSetup");
  const summary = document.getElementById("matchSetupSummary");
  const editBtn = document.getElementById("editMatchSetup");

  if (!setupGrid || !confirmBtn || !summary || !editBtn) return;

  summary.innerHTML = buildMatchSummaryHTML();

  setupGrid.classList.add("hidden");
  confirmBtn.classList.add("hidden");

  summary.classList.remove("hidden");
  editBtn.classList.remove("hidden");
}

function expandMatchSetup() {
  const setupGrid = document.querySelector("#matchSetup .setup-grid");
  const confirmBtn = document.getElementById("confirmMatchSetup");
  const summary = document.getElementById("matchSetupSummary");
  const editBtn = document.getElementById("editMatchSetup");

  if (!setupGrid || !confirmBtn || !summary || !editBtn) return;

  setupGrid.classList.remove("hidden");
  confirmBtn.classList.remove("hidden");

  summary.classList.add("hidden");
  editBtn.classList.add("hidden");
}

function buildMatchSummaryHTML() {
  const { escapeHtml } = window.CornermanSafe;
  const eventName =
    document.getElementById("eventNameInput")?.value.trim() || "Event —";

  const weight =
    document.getElementById("weightClassInput")?.value.trim() || "Weight —";

  const red =
    document.getElementById("opponentName")?.value.trim() || "Red Wrestler";

  const green =
    document.getElementById("athleteName")?.value.trim() || "Green Wrestler";

  const sandmanSide =
    document.getElementById("sandmanColor")?.value || "green";

  return `
    <strong>${escapeHtml(eventName)} · ${escapeHtml(weight)}</strong>
    <span>${escapeHtml(red)} vs ${escapeHtml(green)}</span>
    <em>Sandman: ${escapeHtml(sandmanSide.toUpperCase())}</em>
  `;
}
