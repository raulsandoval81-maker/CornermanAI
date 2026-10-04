import { isYouTubeConnected } from "../../media/youtube-uploader.js";

const postMatchCard = document.querySelector(".post-match-card");
const connectYouTubeBtn = document.getElementById("connectYouTubeBtn");
const uploadMatchVideoBtn = document.getElementById("uploadMatchVideoBtn");
const videoUrlInput = document.getElementById("videoUrlInput");
const saveMatchLogBtn = document.getElementById("saveMatchLogBtn");
const resetMatchBtn = document.getElementById("resetMatch");

let autoLinkSavePending = false;
let vaultSavePending = false;
let vaultFailedId = "";
let uploadEligible = false;

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

function refreshUploadAvailability() {
  if (!uploadMatchVideoBtn) return;

  const ready = uploadEligible && isYouTubeConnected();
  uploadMatchVideoBtn.disabled = !ready;

  if (!uploadEligible) {
    uploadMatchVideoBtn.title = "Finish a new recording before uploading video.";
    if (uploadMatchVideoBtn.textContent !== "Upload accepted ✓") {
      uploadMatchVideoBtn.textContent = "3. Upload Video";
    }
    return;
  }

  if (!isYouTubeConnected()) {
    uploadMatchVideoBtn.title = "Connect YouTube first.";
    return;
  }

  uploadMatchVideoBtn.title = "Upload this match video to the connected YouTube channel.";
}

function launchNextQuickMatch() {
  if (vaultSavePending || vaultFailedId) return;

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

  setMoveOnEnabled(!vaultSavePending && !vaultFailedId);
}

function setVaultRecoveryVisible(visible) {
  const host = document.getElementById("vaultRecoveryActions");
  if (host) host.hidden = !visible;
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
      <li><b>Upload Video</b>. Cornerman attaches the returned YouTube link while keeping the local Vault copy.</li>
    </ol>
    <p>YouTube is optional. The local Vault protects the recording independently.</p>
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

  const recoveryActions = document.createElement("div");
  recoveryActions.id = "vaultRecoveryActions";
  recoveryActions.className = "quick-match-identity-actions";
  recoveryActions.hidden = true;
  recoveryActions.innerHTML = `
    <button id="retryVaultSaveBtn" type="button">Retry Local Save</button>
    <button id="saveEmergencyVideoBtn" type="button">Save Emergency Copy</button>
  `;
  localStatus.insertAdjacentElement("afterend", recoveryActions);

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
    if (vaultSavePending || vaultFailedId) return;
    const match = getLastSavedMatch();
    if (!match?.id) return;
    window.location.href = `../history/match-detail.html?id=${encodeURIComponent(String(match.id))}&edit=1`;
  });

  document.getElementById("nextQuickMatch")?.addEventListener("click", launchNextQuickMatch);

  document.getElementById("retryVaultSaveBtn")?.addEventListener("click", async () => {
    if (!vaultFailedId) return;
    try {
      await window.CornermanVideoVault?.retryFailedRecording?.(vaultFailedId);
    } catch (error) {
      setLocalStatus(error?.message || "Could not retry the local video save.");
    }
  });

  document.getElementById("saveEmergencyVideoBtn")?.addEventListener("click", () => {
    if (!vaultFailedId) return;
    try {
      window.CornermanVideoVault?.saveEmergencyCopy?.(vaultFailedId);
      setLocalStatus("Emergency copy requested. Confirm the video file appears in your device downloads before leaving this match.");
    } catch (error) {
      setLocalStatus(error?.message || "Could not create an emergency video copy.");
    }
  });

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
  refreshUploadAvailability();

  Promise.resolve()
    .then(() => window.CornermanVideoVault?.getLatestRecording?.())
    .then(recording => {
      if (!recording?.blob) return;
      uploadEligible = true;
      refreshUploadAvailability();
      if (isYouTubeConnected()) {
        setLocalStatus("Local Vault video recovered. YouTube upload is ready.");
      }
    })
    .catch(() => {
      // A missing or unreadable Vault should not block the normal current-match flow.
    });

  uploadMatchVideoBtn.addEventListener("click", event => {
    if (!uploadEligible) {
      event.preventDefault();
      event.stopImmediatePropagation();
      setLocalStatus("No current match video is ready. Record and finish the new match before uploading.");
      refreshUploadAvailability();
      return;
    }

    window.dispatchEvent(new CustomEvent("cornerman:youtube-upload-start"));
  }, true);
}

resetMatchBtn?.addEventListener("click", () => {
  uploadEligible = false;
  if (videoUrlInput) videoUrlInput.value = "";
  refreshUploadAvailability();
}, true);

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

window.addEventListener("cornerman:video-vault-recording-started", () => {
  uploadEligible = true;
  if (uploadMatchVideoBtn?.textContent === "Upload accepted ✓") {
    uploadMatchVideoBtn.textContent = "3. Upload Video";
  }
  refreshUploadAvailability();
});

window.addEventListener("cornerman:video-vault-saving", event => {
  vaultSavePending = true;
  vaultFailedId = "";
  setVaultRecoveryVisible(false);
  setMoveOnEnabled(false);
  setLocalStatus("Securing video locally…");
});

window.addEventListener("cornerman:video-vault-saved", event => {
  vaultSavePending = false;
  vaultFailedId = "";
  setVaultRecoveryVisible(false);
  setMoveOnEnabled(true);
  setLocalStatus("✓ Video secured locally. Safe to review, upload, or move on.");
});

window.addEventListener("cornerman:video-vault-error", event => {
  vaultSavePending = false;
  vaultFailedId = event.detail?.id || "unknown";
  setMoveOnEnabled(false);
  setVaultRecoveryVisible(true);
  setLocalStatus(event.detail?.message || "Local video backup failed. Retry the local save or save an emergency copy before leaving this match.");
});

window.addEventListener("cornerman:video-vault-checkpoint-error", event => {
  setLocalStatus(event.detail?.message || "Live video checkpoint warning. Keep recording; Cornerman will retry when the match ends.");
});

window.addEventListener("beforeunload", event => {
  if (!vaultSavePending && !vaultFailedId) return;
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
    refreshUploadAvailability();
    setLocalStatus(uploadEligible
      ? "YouTube connected. Upload Video is ready."
      : "YouTube connected. Finish a current match recording before uploading.");
    return;
  }

  if (type === "uploading") {
    if (uploadMatchVideoBtn) uploadMatchVideoBtn.disabled = true;
    setLocalStatus("Sending video to YouTube… Local Vault copy remains protected.");
    return;
  }

  if (type === "uploaded") {
    const videoUrl = detail.detail?.videoUrl || localStorage.getItem("cornerman_last_uploaded_video_url") || "";

    if (videoUrlInput && videoUrl) videoUrlInput.value = videoUrl;

    if (uploadMatchVideoBtn) {
      uploadMatchVideoBtn.textContent = "Upload accepted ✓";
      refreshUploadAvailability();
    }

    setLocalStatus("YouTube accepted the upload. Linking the returned URL to Match History…");

    refreshIdentityDecision();
    return;
  }

  if (type === "error") {
    refreshUploadAvailability();
    if (uploadMatchVideoBtn && uploadMatchVideoBtn.textContent !== "Upload accepted ✓") {
      uploadMatchVideoBtn.textContent = "3. Upload Video";
    }

    setLocalStatus(message || "YouTube could not complete the request. The local Vault copy is still protected.");
  }
});

window.addEventListener("cornerman:video-linked", event => {
  const detail = event.detail || {};
  if (videoUrlInput && detail.videoUrl) {
    videoUrlInput.value = detail.videoUrl;
  }

  setLocalStatus(
    detail.synced === false
      ? "✓ YouTube video linked locally. Match History sync is pending."
      : "✓ YouTube video linked to Match History."
  );

  resetUpdateButton();
  refreshIdentityDecision();
});

if (saveMatchLogBtn) {
  const observer = new MutationObserver(() => {
    if (autoLinkSavePending && saveMatchLogBtn.textContent.trim().toLowerCase() === "saved") {
      autoLinkSavePending = false;
      setLocalStatus("Match saved and returned YouTube URL linked. Keep the local Vault copy until YouTube finishes processing.");
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
