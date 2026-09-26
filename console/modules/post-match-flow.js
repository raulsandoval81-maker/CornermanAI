const postMatchCard = document.querySelector(".post-match-card");
const connectYouTubeBtn = document.getElementById("connectYouTubeBtn");
const uploadMatchVideoBtn = document.getElementById("uploadMatchVideoBtn");
const videoUrlInput = document.getElementById("videoUrlInput");
const saveMatchLogBtn = document.getElementById("saveMatchLogBtn");

let autoLinkSavePending = false;

if (postMatchCard) {
  const heading = postMatchCard.querySelector("h2");
  if (heading) heading.textContent = "Finish Match";

  const guide = document.createElement("div");
  guide.className = "post-match-guide";
  guide.innerHTML = `
    <strong>Finish in this order</strong>
    <ol>
      <li><b>Save Match</b> in Match Summary. Your match data is saved first.</li>
      <li><b>Connect YouTube</b> only if you want the video uploaded.</li>
      <li><b>Upload Video</b>. Cornerman will attach the YouTube link and update the saved match automatically.</li>
    </ol>
    <p>YouTube is optional. You do not need it to save the match.</p>
  `;

  if (heading) {
    heading.insertAdjacentElement("afterend", guide);
  } else {
    postMatchCard.prepend(guide);
  }

  const localStatus = document.createElement("p");
  localStatus.id = "postMatchFlowStatus";
  localStatus.className = "bridge-status";
  localStatus.textContent = "Match saved first. YouTube upload is optional.";

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
  `;
  document.head.appendChild(style);
}

if (connectYouTubeBtn) {
  connectYouTubeBtn.textContent = "2. Connect YouTube (Optional)";
}

if (uploadMatchVideoBtn) {
  uploadMatchVideoBtn.textContent = "3. Upload Video";
  uploadMatchVideoBtn.disabled = true;
  uploadMatchVideoBtn.title = "Connect YouTube first.";
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

window.addEventListener("cornerman:youtube-status", event => {
  const detail = event.detail || {};
  const type = detail.type || "";
  const message = detail.message || "";

  if (type === "connecting") {
    setLocalStatus("Choose the Google account whose YouTube channel you want to use.");
    return;
  }

  if (type === "connected") {
    if (uploadMatchVideoBtn) {
      uploadMatchVideoBtn.disabled = false;
      uploadMatchVideoBtn.title = "Upload this match video to the connected YouTube channel.";
    }

    setLocalStatus("YouTube connected. Upload Video is ready.");
    return;
  }

  if (type === "uploading") {
    if (uploadMatchVideoBtn) uploadMatchVideoBtn.disabled = true;
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
      uploadMatchVideoBtn.textContent = "Video Uploaded ✓";
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
    if (uploadMatchVideoBtn) {
      uploadMatchVideoBtn.disabled = false;
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
