const reviewVideo = document.getElementById("reviewPreview");
const reviewCard = document.querySelector(".review-video-card");

if (reviewVideo && reviewCard) {
  reviewCard.classList.add("review-player-enhanced");
  reviewVideo.classList.add("review-video-fill");

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

    // Landscape footage should fill by default. Portrait footage starts in Fit
    // so the athlete is not unexpectedly cropped, but can be switched to Fill.
    fillMode = landscape;
    renderFitMode();
  });

  const style = document.createElement("style");
  style.textContent = `
    body.review-mode .review-board {
      width: 100%;
      max-width: none;
    }

    body.review-mode .review-video-card.review-player-enhanced {
      grid-column: 1 / -1;
      width: 100%;
      padding: 0;
      overflow: hidden;
      background: #000;
      border-radius: 0;
      border-left: 0;
      border-right: 0;
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
      body.review-mode #reviewPreview {
        height: calc(100svh - 120px);
        min-height: 56vh;
      }

      body.review-mode .review-video-card h2 {
        padding: 7px 10px;
      }

      .review-player-toolbar {
        padding: 6px 8px;
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
}
