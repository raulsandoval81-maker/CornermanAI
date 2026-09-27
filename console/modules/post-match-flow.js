const postMatchCard = document.querySelector(".post-match-card");
const connectYouTubeBtn = document.getElementById("connectYouTubeBtn");
const uploadMatchVideoBtn = document.getElementById("uploadMatchVideoBtn");
const videoUrlInput = document.getElementById("videoUrlInput");
const saveMatchLogBtn = document.getElementById("saveMatchLogBtn");

let autoLinkSavePending = false;
let vaultSavePending = false;

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

function getLastSavedMatch() {
  try {
    return JSON.parse(localStorage.getItem("coach_console_last_match") || "null");
  } catch {
    return null;
  }
}

function needsIdentityAssignment(match) {
  if (!match) return false;
  return isPlaceholderName(match.athlete) || isPlaceholderName(match.opponent);
}

function setMoveOnEnabled(enabled) {
  const ids = [
    "nextQuickMatch",
    "assignQuickMatchAthletes",
    "returnToConsoleBtn"
  ];

  ids.forEach(id => {
    const button = document.getElementById(id);
    if (!button) return;
    button.disabled = !enabled;
    button.setAttribute("aria-disabled", String(!enabled));
  });
}

function launchNextQuickMatch() {
  if (vaultSavePending) return;

  let tournament = {};
  try {
    tournament = JSON.parse(localStorage.getItem("cornerman_current_tournament") || "{}");
  } catch {
    tournament = {};
  }

  const pendingMatch = {
    eventName: tournament.name || "",
    athleteMode: "manual",
    athleteName: "Wrestler A",
    consoleView: "compact",
    opponentMode: "manual",
    opponentName: "Wrestler B",
    athleteSide: "green",
    opponentSide: "red",
    teamA: "",
    opponentTeam: "",
    weightGroup: "",
    weightClass: "",
    matchTime: "",
    matchFormat: "",
    tournamentDate: tournament.date || "",
    tournamentLocation: tournament.location || "",
    eventFormat: tournament.eventFormat || "",
    bracketRound: tournament.bracketRound || "",
    source: "fast-start"
  };

  localStorage.setItem("cornerman_pending_match", JSON.stringify(pendingMatch));
  window.location.href = "./compact-console.modular.html";
}

function refreshIdentityDecision() {
  const card = document.getElementById("quickMatchIdentityCard");
  if (!card) return;

  const match = getLastSavedMatch();
  const needsAssignment = needsIdentityAssignment(match);
  card.hidden = !needsAssignment;

  const summary = document.getElementById("quickMatchIdentitySummary");
  if (summary && needsAssignment) {
    summary.textContent = `${match.athlete || "Wrestler A"} vs ${match.opponent || "Wrestler B"} is saved. Assign the real athlete now or leave it for Match History.`;
  }

  setMoveOnEnabled(!vaultSavePending);
}

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

  if (heading) heading.insertAdjacentElement("afterend", guide);
  else postMatchCard.prepend(guide);

  const identityCard = document.createElement("div");
  identityCard.id = "quickMatchIdentityCard";
  identityCard.className = "quick-match-identity-card";
  identityCard.hidden = true;
  identityCard.innerHTML = `
    <strong>Quick Match · Athlete identity not assigned</strong>
    <p id="quickMatchIdentitySummary">This match is saved with temporary wrestler names.</p>
    <div class="quick-match-identity-actions">
      <button id="assignQuickMatchAthletes" type="button">Assign Athletes Now</button>
      <button id="nextQuickMatch" type="button">Next Quick Match</button>
    </div>
    <a href="../history/match-history.html">Leave for Match History</a>
  `;
  guide.insertAdjacentElement("afterend", identityCard);

  const localStatus = document.createElement("p");
  localStatus.id = "postMatchFlowStatus";
  localStatus.className = "bridge-status";
  localStatus.textContent = "Match saved first. YouTube upload is optional.";

  const mediaActions = postMatchCard.querySelector(".media-actions");
  mediaActions?.insertAdjacentElement("afterend", localStatus);

  const style = document.createElement("style");
  style.textContent = `
    .post-match-guide,
    .quick-match-identity-card {
      margin: 10px 0 14px;
      padding: 12px 14px;
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 12px;
      background: rgba(255,255,255,.04);
    }

    .post-match-guide strong,
    .quick-match-identity-card strong {
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

    .post-match-guide p,
    .quick-match-identity-card p {
      margin: 10px 0;
      opacity: .82;
    }

    .quick-match-identity-card {
      border-color: rgba(250,204,21,.45);
    }

    .quick-match-identity-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin: 10px 0;
    }

    .quick-match-identity-actions button {
      min-height: 44px;
    }

    #postMatchFlowStatus {
      margin: 10px 0;
      font-weight: 800;
    }

    @media (max-width: 560px) {
      .quick-match-identity-actions {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(style);

  document.getElementById("assignQuickMatchAthletes")?.addEventListener("click", () => {
    if (vaultSavePending) return;
    const match = getLastSavedMatch();
    if (!match?.id) return;
    window.location.href = `../history/match-detail.html?id=${encodeURIComponent(String(match.id))}&edit=1`;
  });

  document.getElementById("nextQuickMatch")?.addEventListener("click", launchNextQuickMatch);

  const reviewObserver = new MutationObserver(() => {
    if (document.body.classList.contains("review-mode")) {
      setTimeout(refreshIdentityDecision, 0);
    }
  });
  reviewObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
}

if (connectYouTubeBtn) {
  connectYouTubeBtn.textContent = "2. Connect YouTube (Optional)";
}

if (uploadMatchVideoBtn) {
  uploadMatchVideoBtn.textContent = "3. Upload Video";
  uploadMatchVideoBtn.disabled = true;
  uploadMatchVideoBtn.title = "Connect YouTube first.";

  uploadMatchVideoBtn.addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("cornerman:youtube-upload-start"));
  }, true);
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

window.addEventListener("cornerman:video-vault-saving", () => {
  vaultSavePending = true;
  setMoveOnEnabled(false);
  setLocalStatus("Securing video locally…");
});

window.addEventListener("cornerman:video-vault-saved", () => {
  vaultSavePending = false;
  setMoveOnEnabled(true);
  setLocalStatus("✓ Video secured locally. Safe to review, upload, or move on.");
});

window.addEventListener("cornerman:video-vault-error", event => {
  vaultSavePending = false;
  setMoveOnEnabled(true);
  setLocalStatus(event.detail?.message || "Local video backup failed. Do not leave this match until the video is saved another way.");
});

window.addEventListener("beforeunload", event => {
  if (!vaultSavePending) return;
  event.preventDefault();
  event.returnValue = "";
});

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
    const videoUrl = detail.detail?.videoUrl || localStorage.getItem("cornerman_last_uploaded_video_url") || "";

    if (videoUrlInput && videoUrl) videoUrlInput.value = videoUrl;

    if (uploadMatchVideoBtn) {
      uploadMatchVideoBtn.disabled = false;
      uploadMatchVideoBtn.textContent = "Video Uploaded ✓";
    }

    if (saveMatchLogBtn) {
      autoLinkSavePending = true;
      saveMatchLogBtn.disabled = false;
      saveMatchLogBtn.textContent = "Linking Video…";
      setLocalStatus("Video uploaded. Linking it to the saved match…");
      setTimeout(() => saveMatchLogBtn.click(), 0);
    } else {
      setLocalStatus("Video uploaded to YouTube.");
    }

    refreshIdentityDecision();
    return;
  }

  if (type === "error") {
    if (uploadMatchVideoBtn) {
      uploadMatchVideoBtn.disabled = false;
      uploadMatchVideoBtn.textContent = "3. Upload Video";
    }

    setLocalStatus(message || "YouTube could not complete the request.");
  }
});

if (saveMatchLogBtn) {
  const observer = new MutationObserver(() => {
    if (autoLinkSavePending && saveMatchLogBtn.textContent.trim().toLowerCase() === "saved") {
      autoLinkSavePending = false;
      setLocalStatus("Done — match saved and YouTube video linked.");
      resetUpdateButton();
      refreshIdentityDecision();
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
        refreshIdentityDecision();
        if (saveMatchLogBtn.disabled) {
          resetUpdateButton();
          setLocalStatus("Match updated.");
        }
      }, 700);
    }
  });
}
