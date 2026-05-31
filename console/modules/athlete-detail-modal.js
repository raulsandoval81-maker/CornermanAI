export function initializeAthleteDetailModal() {

  const modal =
    document.getElementById("athleteDetailModal");

  const closeBtn =
    document.getElementById("closeAthleteDetail");

  const redName =
    document.getElementById("redDisplayName");

  const greenName =
    document.getElementById("greenDisplayName");

  if (!modal || !closeBtn) return;

  redName?.addEventListener(
    "click",
    () => openAthleteDetail("red")
  );

  greenName?.addEventListener(
    "click",
    () => openAthleteDetail("green")
  );

  closeBtn.addEventListener(
    "click",
    () => {
      modal.classList.add("hidden");
    }
  );
}

function openAthleteDetail(side) {

  const isRed =
    side === "red";

  const name =
    isRed
      ? document.getElementById("redDisplayName")?.textContent
      : document.getElementById("greenDisplayName")?.textContent;

  const team =
    isRed
      ? document.getElementById("redTeam")?.textContent
      : document.getElementById("greenTeam")?.textContent;

  const score =
    isRed
      ? document.getElementById("opponentScore")?.textContent
      : document.getElementById("athleteScore")?.textContent;

  document.getElementById("athleteDetailName").textContent =
    name || "Athlete";

  document.getElementById("athleteDetailTeam").textContent =
    `Team: ${team || "—"}`;

  document.getElementById("athleteDetailColor").textContent =
    `Side: ${side.toUpperCase()}`;

  document.getElementById("athleteDetailScore").textContent =
    `Score: ${score || "0"}`;

  document
    .getElementById("athleteDetailModal")
    ?.classList.remove("hidden");
}