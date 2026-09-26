const toggleBtn = document.getElementById("toggleMatchActions");
const panel = document.getElementById("matchActionsPanel");
const backdrop = document.getElementById("matchActionsBackdrop");
const closeBtn = document.getElementById("closeMatchTools");

if (toggleBtn && panel && backdrop) {
  function syncState() {
    const isOpen = !panel.classList.contains("hidden");

    toggleBtn.setAttribute("aria-expanded", String(isOpen));
    backdrop.classList.toggle("hidden", !isOpen);
    backdrop.setAttribute("aria-hidden", String(!isOpen));
    document.body.classList.toggle("match-tools-open", isOpen);
  }

  function closeTools() {
    panel.classList.add("hidden");
    syncState();
  }

  toggleBtn.addEventListener("click", () => {
    setTimeout(syncState, 0);
  });

  closeBtn?.addEventListener("click", closeTools);
  backdrop.addEventListener("click", closeTools);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeTools();
  });

  panel.addEventListener("click", event => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (
      target.matches("#nextRound, [data-ref-call]")
    ) {
      setTimeout(closeTools, 0);
    }
  });

  syncState();
}
