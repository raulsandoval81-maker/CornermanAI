const reviewVideo = document.getElementById("reviewPreview");
const reviewCard = document.querySelector(".review-video-card");

if (reviewVideo && reviewCard) {
  reviewCard.classList.add("review-player-enhanced");
  reviewVideo.classList.add("review-video-fill");

  // Review-only cinematic backdrop. This never touches the live console or the
  // original recording; it simply reuses the same footage as a soft 16:9 fill
  // when portrait video is viewed on a landscape screen.
  const cinematicBackdrop = document.createElement("video");
  cinematicBackdrop.className = "review-cinematic-backdrop";
  cinematicBackdrop.muted = true;
  cinematicBackdrop.playsInline = true;
  cinematicBackdrop.preload = "metadata";
  cinematicBackdrop.setAttribute("aria-hidden", "true");
  cinematicBackdrop.tabIndex = -1;
  reviewVideo.insertAdjacentElement("beforebegin", cinematicBackdrop);

  function syncBackdropSource() {
    try {
      if (reviewVideo.srcObject) {
        if (cinematicBackdrop.srcObject !== reviewVideo.srcObject) {
          cinematicBackdrop.removeAttribute("src");
          cinematicBackdrop.srcObject = reviewVideo.srcObject;
        }
        return;
      }

      cinematicBackdrop.srcObject = null;
      const source = reviewVideo.currentSrc || reviewVideo.src || "";
      if (source && cinematicBackdrop.src !== source) {
        cinematicBackdrop.src = source;
        cinematicBackdrop.load();
      }
    } catch (error) {
      console.warn("Review backdrop unavailable", error);
    }
  }

  function syncBackdropPlayback() {
    if (!Number.isFinite(reviewVideo.currentTime)) return;

    if (Math.abs((cinematicBackdrop.currentTime || 0) - reviewVideo.currentTime) > 0.25) {
      try {
        cinematicBackdrop.currentTime = reviewVideo.currentTime;
      } catch {
        // Metadata may not be ready yet.
      }
    }

    cinematicBackdrop.playbackRate = reviewVideo.playbackRate || 1;
  }

  reviewVideo.addEventListener("play", () => {
    syncBackdropSource();
    syncBackdropPlayback();
    cinematicBackdrop.play().catch(() => {});
  });

  reviewVideo.addEventListener("pause", () => cinematicBackdrop.pause());
  reviewVideo.addEventListener("seeking", syncBackdropPlayback);
  reviewVideo.addEventListener("ratechange", syncBackdropPlayback);

  const toolbar = document.createElement("div");
  toolbar.className = "review-player-toolbar";
  toolbar.innerHTML = `
    <button id="reviewFitToggle" type="button">Fit Video</button>
    <button id="reviewFullscreenBtn" type="button">Full Screen</button>
  `;

  const heading = reviewCard.querySelector("h2");
  if (heading) {
    heading.insertAdjacentElement("afterend", toolbar);
  } else {
    reviewCard.prepend(toolbar);
  }

  const fitToggle = toolbar.querySelector("#reviewFitToggle");
  const fullscreenBtn = toolbar.querySelector("#reviewFullscreenBtn");

  let fillMode = true;

  function renderFitMode() {
    reviewVideo.classList.toggle("review-video-fill", fillMode);
    reviewVideo.classList.toggle("review-video-fit", !fillMode);
    if (fitToggle) {
      fitToggle.textContent = fillMode ? "Fit Video" : "Fill Screen";
      fitToggle.setAttribute(
        "aria-pressed",
        String(!fillMode)
      );
    }
  }

  fitToggle?.addEventListener("click", () => {
    fillMode = !fillMode;
    renderFitMode();
  });

  fullscreenBtn?.addEventListener("click", async () => {
    try {
      if (reviewVideo.webkitEnterFullscreen) {
        reviewVideo.webkitEnterFullscreen();
        return;
      }

      if (reviewCard.requestFullscreen) {
        await reviewCard.requestFullscreen();
        try {
          await screen.orientation?.lock?.("landscape");
        } catch {
          // Orientation lock is not available in every mobile browser.
        }
      }
    } catch (error) {
      console.warn("Review fullscreen unavailable", error);
    }
  });

  reviewVideo.addEventListener("loadedmetadata", () => {
    const landscape =
      reviewVideo.videoWidth >= reviewVideo.videoHeight;

    reviewCard.classList.toggle("portrait-source", !landscape);
    reviewCard.classList.toggle("landscape-source", landscape);
    syncBackdropSource();

    // Landscape footage should fill by default. Portrait footage starts in Fit
    // so the athlete is not unexpectedly cropped, but can be switched to Fill.
    fillMode = landscape;
    renderFitMode();
  });

  function syncReviewOrientation() {
    const landscape =
      window.matchMedia?.("(orientation: landscape)")?.matches ||
      window.innerWidth > window.innerHeight;

    document.body.classList.toggle(
      "review-landscape",
      Boolean(landscape && document.body.classList.contains("review-mode"))
    );
  }

  window.addEventListener("orientationchange", () => {
    setTimeout(syncReviewOrientation, 180);
  });

  window.addEventListener("resize", syncReviewOrientation);

  const reviewObserver = new MutationObserver(syncReviewOrientation);
  reviewObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });

  const style = document.createElement("style");
  style.textContent = `
    body.review-mode .review-board {
      width: 100%;
      max-width: none;
    }

    body.review-mode .review-video-card.review-player-enhanced {
      position: relative;
      grid-column: 1 / -1;
      width: 100%;
      padding: 0;
      overflow: hidden;
      background: #000;
      border-radius: 0;
      border-left: 0;
      border-right: 0;
    }

    .review-cinematic-backdrop {
      display: none;
      pointer-events: none;
    }

    .review-player-toolbar {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 8px 10px;
      background: #080b10;
      border-bottom: 1px solid #27304a;
    }

    .review-player-toolbar button {
      min-height: 38px;
      padding: 7px 12px;
    }

    body.review-mode #reviewPreview {
      display: block;
      width: 100%;
      height: min(72vh, 760px);
      max-height: none;
      aspect-ratio: auto;
      border-radius: 0;
      background: #000;
    }

    body.review-mode #reviewPreview.review-video-fill {
      object-fit: cover;
    }

    body.review-mode #reviewPreview.review-video-fit {
      object-fit: contain;
    }

    @media (orientation: landscape) {
      body.review-mode.review-landscape {
        overflow: hidden;
        background: #000;
      }

      body.review-mode.review-landscape .review-board {
        position: fixed;
        inset: 0;
        z-index: 1200;
        margin: 0;
        padding: 0;
        background: #000;
      }

      body.review-mode.review-landscape .review-board > * {
        display: none !important;
      }

      body.review-mode.review-landscape .review-video-card.review-player-enhanced {
        display: flex !important;
        position: fixed;
        inset: 0;
        z-index: 1210;
        width: 100vw;
        height: 100dvh;
        margin: 0;
        padding: 0;
        flex-direction: column;
        border: 0;
        border-radius: 0;
        background: #000;
      }

      body.review-mode.review-landscape .review-video-card h2 {
        display: none;
      }

      body.review-mode.review-landscape .review-video-card.portrait-source .review-cinematic-backdrop {
        display: block;
        position: absolute;
        inset: -5%;
        z-index: 0;
        width: 110%;
        height: 110%;
        object-fit: cover;
        filter: blur(26px) brightness(.42) saturate(.82);
        transform: scale(1.04);
      }

      body.review-mode.review-landscape .review-video-card.portrait-source::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        background: linear-gradient(
          90deg,
          rgba(0,0,0,.32),
          rgba(0,0,0,.08) 34%,
          rgba(0,0,0,.08) 66%,
          rgba(0,0,0,.32)
        );
      }

      body.review-mode.review-landscape .review-player-toolbar {
        position: absolute;
        top: max(6px, env(safe-area-inset-top));
        right: max(8px, env(safe-area-inset-right));
        z-index: 4;
        padding: 4px;
        border: 0;
        border-radius: 10px;
        background: rgba(0,0,0,.58);
      }

      body.review-mode.review-landscape #reviewPreview {
        position: relative;
        z-index: 2;
        flex: 1;
        width: 100vw;
        height: 100dvh;
        min-height: 0;
        max-height: none;
        object-position: center;
        background: transparent;
      }

      body.review-mode.review-landscape .review-video-card.portrait-source #reviewPreview.review-video-fit {
        object-fit: contain;
      }
    }

    .review-video-card:fullscreen {
      width: 100vw;
      height: 100vh;
      background: #000;
      display: flex;
      flex-direction: column;
    }

    .review-video-card:fullscreen #reviewPreview {
      flex: 1;
      width: 100vw;
      height: 100vh;
      max-height: none;
    }
  `;
  document.head.appendChild(style);

  renderFitMode();
  syncReviewOrientation();
}
