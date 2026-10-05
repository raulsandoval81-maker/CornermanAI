const MOBILE_QUERY = "(max-width: 767px)";

const viewport = document.getElementById("matchViewport");
const hud = document.querySelector(".round-flow-card .match-header");
const dock = document.querySelector(".arena-card > .control-dock");
const roundCard = document.querySelector(".round-flow-card");

if (viewport && hud && dock && roundCard) {
  const hudMarker = document.createComment("mobile-live-hud-home");
  const dockMarker = document.createComment("mobile-live-dock-home");

  hud.parentNode.insertBefore(hudMarker, hud);
  dock.parentNode.insertBefore(dockMarker, dock);

  const media = window.matchMedia(MOBILE_QUERY);

  function moveAfter(marker, node) {
    marker.parentNode?.insertBefore(node, marker.nextSibling);
  }

  function applyLayout() {
    const useOverlay = media.matches && !document.body.classList.contains("review-mode");

    if (useOverlay) {
      if (hud.parentNode !== viewport) viewport.appendChild(hud);
      if (dock.parentNode !== viewport) viewport.appendChild(dock);
      viewport.classList.add("mobile-live-overlay");
      roundCard.classList.add("mobile-hud-active");
      return;
    }

    if (hud.parentNode === viewport) moveAfter(hudMarker, hud);
    if (dock.parentNode === viewport) moveAfter(dockMarker, dock);
    viewport.classList.remove("mobile-live-overlay");
    roundCard.classList.remove("mobile-hud-active");
  }

  media.addEventListener?.("change", applyLayout);

  const observer = new MutationObserver(applyLayout);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });

  applyLayout();
}
