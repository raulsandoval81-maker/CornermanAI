import "./post-match-flow.js";

const viewport = document.getElementById("matchViewport");
const video = document.getElementById("preview");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const zoomResetBtn = document.getElementById("zoomResetBtn");

if (viewport && video) {
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let pinchStartDistance = 0;
  let pinchStartScale = 1;
  let panStartX = 0;
  let panStartY = 0;
  let panOriginX = 0;
  let panOriginY = 0;

  const clamp = (value, min, max) =>
    Math.min(max, Math.max(min, value));

  function render() {
    if (scale <= 1) {
      scale = 1;
      offsetX = 0;
      offsetY = 0;
    }

    const maxOffsetX =
      Math.max(0, (viewport.clientWidth * (scale - 1)) / 2);
    const maxOffsetY =
      Math.max(0, (viewport.clientHeight * (scale - 1)) / 2);

    offsetX = clamp(offsetX, -maxOffsetX, maxOffsetX);
    offsetY = clamp(offsetY, -maxOffsetY, maxOffsetY);

    video.style.transform =
      `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;

    video.classList.toggle("is-zoomed", scale > 1);

    if (zoomResetBtn) {
      zoomResetBtn.textContent = `${scale.toFixed(scale % 1 ? 1 : 0)}×`;
    }
  }

  function setScale(nextScale) {
    scale = clamp(nextScale, 1, 3);
    render();
  }

  function resetZoom() {
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    render();
  }

  function touchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }

  zoomInBtn?.addEventListener("click", () => {
    setScale(scale + 0.5);
  });

  zoomOutBtn?.addEventListener("click", () => {
    setScale(scale - 0.5);
  });

  zoomResetBtn?.addEventListener("click", resetZoom);

  video.addEventListener(
    "touchstart",
    event => {
      if (event.touches.length === 2) {
        pinchStartDistance = touchDistance(event.touches);
        pinchStartScale = scale;
        event.preventDefault();
        return;
      }

      if (event.touches.length === 1 && scale > 1) {
        panStartX = event.touches[0].clientX;
        panStartY = event.touches[0].clientY;
        panOriginX = offsetX;
        panOriginY = offsetY;
        event.preventDefault();
      }
    },
    { passive: false }
  );

  video.addEventListener(
    "touchmove",
    event => {
      if (event.touches.length === 2 && pinchStartDistance > 0) {
        const distance = touchDistance(event.touches);
        const ratio = distance / pinchStartDistance;
        scale = clamp(pinchStartScale * ratio, 1, 3);
        render();
        event.preventDefault();
        return;
      }

      if (event.touches.length === 1 && scale > 1) {
        offsetX =
          panOriginX + (event.touches[0].clientX - panStartX);
        offsetY =
          panOriginY + (event.touches[0].clientY - panStartY);
        render();
        event.preventDefault();
      }
    },
    { passive: false }
  );

  video.addEventListener("touchend", event => {
    if (event.touches.length < 2) {
      pinchStartDistance = 0;
    }
  });

  window.addEventListener("resize", render);

  render();
}
