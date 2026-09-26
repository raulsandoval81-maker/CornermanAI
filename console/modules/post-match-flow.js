const postMatchCard = document.querySelector(".post-match-card");
const connectYouTubeBtn = document.getElementById("connectYouTubeBtn");
const uploadMatchVideoBtn = document.getElementById("uploadMatchVideoBtn");
const videoUrlInput = document.getElementById("videoUrlInput");
const saveMatchLogBtn = document.getElementById("saveMatchLogBtn");

let autoLinkSavePending = false;
let youtubeConnected = false;
let uploadAfterConnect = false;

if (postMatchCard) {
  const heading = postMatchCard.querySelector("h2");
  if (heading) heading.textContent = "Finish Match";

  const guide = document.createElement("div");
  guide.className = "post-match-guide";
  guide.innerHTML = `
    <strong>Finish the match</strong>
    <ol>
      <li><b>Save Match</b> in Match Summary.</li>
      <li><b>Upload to YouTube</b>. If YouTube needs authorization, Cornerman will ask you then.</li>
    </ol>
    <p>The YouTube link is attached to the saved match automatically after upload.</p>
  `;

  if (heading) {
    heading.insertAdjacentElement("afterend", guide);
  } else {
    postMatchCard.prepend(guide);
  }

  const localStatus = document.createElement("p");
  localStatus.id = "postMatchFlowStatus";
  localStatus.className = "bridge-status";
  localStatus.textContent = "Save the match, then upload the video to YouTube.";

  const mediaActions = postMatchCard.querySelector(".media-actions");
  mediaActions?.insertAdjacentElement("afterend", localStatus);

  const style = document.createElement("style");
  style.textContent = `
    .post-match-guide {
      margin: 10px 0 14px;
      padding: 12px 14px;
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 12px;
      background: rgba(255,255,255,.04);
    }

    .post-match-guide strong {
      display: block;
      margin-bottom: 8px;
    }

    .post-match-guide ol {
      margin: 0;
      padding-left: 20px;
    }

    .post-match-guide li {
      margin: 7px 0;
    }

    .post-match-guide p {
      margin: 10px 0 0;
      opacity: .82;
    }

    #postMatchFlowStatus {
      margin: 10px 0;
      font-weight: 800;
    }

    #connectYouTubeBtn {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

if (uploadMatchVideoBtn) {
  uploadMatchVideoBtn.textContent = "Upload to YouTube";
  uploadMatchVideoBtn.disabled = false;
  uploadMatchVideoBtn.title = "Upload this recorded match to YouTube.";
}

if (videoUrlInput) {
  videoUrlInput.readOnly = true;
  videoUrlInput.placeholder = "YouTube link appears here after upload";
}

if (saveMatchLogBtn) {
  saveMatchLogBtn.textContent = "Update Notes / Match";
}

function setLocalStatus(message) {
  const el = document.getElementById("postMatchFlowStatus");
  if (el) el.textContent = message;
}

function resetUpdateButton() {
  if (!saveMatchLogBtn) return;
  saveMatchLogBtn.disabled = false;
  saveMatchLogBtn.textContent = "Update Notes / Match";
}

/*
 * Keep account authorization out of the normal review UI.
 * If Upload is tapped before YouTube is connected, intercept that tap,
 * launch the existing Google authorization flow, then continue upload
 * automatically once authorization succeeds.
 */
uploadMatchVideoBtn?.addEventListener(
  "click",
  event => {
    if (youtubeConnected) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    uploadAfterConnect = true;
    setLocalStatus("Connect the YouTube account you want to use. Upload will continue after authorization.");
    connectYouTubeBtn?.click();
  },
  true
);

window.addEventListener("cornerman:youtube-status", event => {
  const detail = event.detail || {};
  const type = detail.type || "";
  const message = detail.message || "";

  if (type === "connecting") {
    setLocalStatus("Choose the Google account whose YouTube channel you want to use.");
    return;
  }

  if (type === "connected") {
    youtubeConnected = true;

    if (uploadMatchVideoBtn) {
      uploadMatchVideoBtn.disabled = false;
      uploadMatchVideoBtn.title = "Upload this match video to YouTube.";
    }

    if (uploadAfterConnect) {
      uploadAfterConnect = false;
      setLocalStatus("YouTube connected. Starting upload…");
      setTimeout(() => uploadMatchVideoBtn?.click(), 0);
    } else {
      setLocalStatus("YouTube connected. Upload to YouTube is ready.");
    }
    return;
  }

  if (type === "uploading") {
    if (uploadMatchVideoBtn) {
      uploadMatchVideoBtn.disabled = true;
      uploadMatchVideoBtn.textContent = "Uploading to YouTube…";
    }
    setLocalStatus("Uploading video to YouTube…");
    return;
  }

  if (type === "uploaded") {
    const videoUrl =
      detail.detail?.videoUrl ||
      localStorage.getItem("cornerman_last_uploaded_video_url") ||
      "";

    if (videoUrlInput && videoUrl) {
      videoUrlInput.value = videoUrl;
    }

    if (uploadMatchVideoBtn) {
      uploadMatchVideoBtn.disabled = false;
      uploadMatchVideoBtn.textContent = "Uploaded to YouTube ✓";
    }

    if (saveMatchLogBtn) {
      autoLinkSavePending = true;
      saveMatchLogBtn.disabled = false;
      saveMatchLogBtn.textContent = "Linking Video…";
      setLocalStatus("Video uploaded. Linking it to the saved match…");

      setTimeout(() => {
        saveMatchLogBtn.click();
      }, 0);
    } else {
      setLocalStatus("Video uploaded to YouTube.");
    }

    return;
  }

  if (type === "error") {
    uploadAfterConnect = false;

    if (uploadMatchVideoBtn) {
      uploadMatchVideoBtn.disabled = false;
      uploadMatchVideoBtn.textContent = "Upload to YouTube";
    }

    setLocalStatus(message || "YouTube could not complete the request.");
  }
});

if (saveMatchLogBtn) {
  const observer = new MutationObserver(() => {
    if (
      autoLinkSavePending &&
      saveMatchLogBtn.textContent.trim().toLowerCase() === "saved"
    ) {
      autoLinkSavePending = false;
      setLocalStatus("Done — match saved and YouTube video linked.");
      resetUpdateButton();
    }
  });

  observer.observe(saveMatchLogBtn, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["disabled"]
  });

  saveMatchLogBtn.addEventListener("click", () => {
    if (!autoLinkSavePending) {
      setLocalStatus("Updating the saved match…");

      setTimeout(() => {
        if (saveMatchLogBtn.disabled) {
          resetUpdateButton();
          setLocalStatus("Match updated.");
        }
      }, 700);
    }
  });
}
