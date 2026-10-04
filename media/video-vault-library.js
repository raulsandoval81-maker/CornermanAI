import { listRecordings, getStorageEstimate, markRecordingUploaded } from "./video-vault.js";
import { getMatch, updateMatchMedia } from "../shared/match-repository.js";
import {
  initYouTubeUploader,
  connectYouTubeUpload,
  uploadVideoToYouTube,
  isYouTubeConnected
} from "./youtube-uploader.js";

const host = document.getElementById("videoVaultList");
const status = document.getElementById("videoVaultStatus");
const params = new URLSearchParams(window.location.search);
const repairMatchId = params.get("matchId") || "";

let repairMatch = null;
let youtubeReady = false;

function formatBytes(bytes = 0) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function safeFileName(value) {
  return String(value || "cornerman-match")
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "cornerman-match";
}

function recordingStateLabel(recording) {
  if (recording.status === "recording") {
    return "Recovered checkpoint · recording may be incomplete";
  }
  return "Complete local recording";
}

function escape(value) {
  return window.CornermanSafe.escapeHtml(String(value ?? ""));
}

function repairBannerHtml() {
  if (!repairMatchId) return "";

  if (!repairMatch) {
    return `
      <div class="media-row" style="border-color:#b91c1c;">
        <strong>Video Repair</strong>
        <p class="muted">The selected Match History record could not be opened.</p>
      </div>
    `;
  }

  return `
    <div class="media-row" style="border-color:#d4af37;">
      <strong>Repair Match Video</strong>
      <p>
        ${escape(repairMatch.athlete || "Athlete")}
        vs
        ${escape(repairMatch.opponent || "Opponent")}
      </p>
      <p class="muted">
        ${escape(repairMatch.eventName || "No event")}
        ${repairMatch.weightClass ? ` · ${escape(repairMatch.weightClass)}` : ""}
      </p>
      <p class="muted">
        Preview the correct Vault recording first. Then connect YouTube and upload that exact recording to this Match History record.
      </p>
      <div class="media-actions">
        <button id="vaultConnectYouTube" type="button">
          ${youtubeReady ? "YouTube Connected ✓" : "Connect YouTube"}
        </button>
        <a href="../history/match-detail.html?id=${encodeURIComponent(String(repairMatch.id))}">
          Cancel / Back to Match
        </a>
      </div>
      <p id="vaultRepairStatus" class="muted">
        ${youtubeReady ? "YouTube connected. Choose the correct recording below." : "Connect YouTube, then choose the correct recording below."}
      </p>
    </div>
  `;
}

function setRepairStatus(message) {
  const el = document.getElementById("vaultRepairStatus");
  if (el) el.textContent = message;
}

async function loadRepairMatch() {
  if (!repairMatchId) return;
  const result = await getMatch(repairMatchId);
  repairMatch = result.match || null;
}

async function uploadAndLink(recording, button) {
  if (!repairMatch?.id) {
    setRepairStatus("No Match History record is selected.");
    return;
  }

  if (!recording?.blob) {
    setRepairStatus("This Vault recording has no usable video file.");
    return;
  }

  if (!isYouTubeConnected()) {
    setRepairStatus("Connect YouTube first.");
    return;
  }

  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "Uploading…";
  setRepairStatus("Uploading the selected Vault recording to YouTube…");

  try {
    const upload = await uploadVideoToYouTube({
      videoBlob: recording.blob,
      title: `${repairMatch.athlete || "Athlete"} vs ${repairMatch.opponent || "Opponent"}`,
      description: `Uploaded from CornermanAI Vault recovery${repairMatch.eventName ? ` · ${repairMatch.eventName}` : ""}`,
      tags: ["CornermanAI", "wrestling"]
    });

    setRepairStatus("YouTube accepted the video. Linking it to the selected Match History record…");

    const attachedAt = new Date().toISOString();
    const result = await updateMatchMedia(repairMatch.id, {
      videoUrl: upload.videoUrl,
      videoHost: "youtube",
      videoVisibility: "unlisted",
      videoAttachedAt: attachedAt,
      uploadedAt: attachedAt,
      videoUnlinkedAt: ""
    });

    await markRecordingUploaded(recording.id, upload.videoUrl).catch(() => null);

    if (!result.match) {
      throw new Error("YouTube upload succeeded, but Cornerman could not update the Match History record.");
    }

    localStorage.setItem(
      "coach_console_last_match",
      JSON.stringify(result.match)
    );

    try {
      const media = JSON.parse(localStorage.getItem("cornerman_media") || "[]");
      const mediaIndex = media.findIndex(item =>
        String(item.videoUrl || "") === String(upload.videoUrl || "")
      );

      if (mediaIndex >= 0) {
        media[mediaIndex] = {
          ...media[mediaIndex],
          linkedMatchId: String(repairMatch.id),
          linkedAthlete: repairMatch.athlete || "",
          linkedOpponent: repairMatch.opponent || "",
          linkedEvent: repairMatch.eventName || "",
          linkedAt: attachedAt,
          unlinkedAt: ""
        };

        localStorage.setItem("cornerman_media", JSON.stringify(media));
      }
    } catch (error) {
      console.warn("Could not align Media Library link state.", error);
    }

    button.textContent = "Linked ✓";
    setRepairStatus(
      result.synced === false
        ? "✓ Video uploaded and linked locally. Match History sync is pending."
        : "✓ Video uploaded and linked to Match History."
    );

    setTimeout(() => {
      window.location.href = `../history/match-detail.html?id=${encodeURIComponent(String(repairMatch.id))}`;
    }, 900);
  } catch (error) {
    console.error("Vault recovery upload failed:", error);
    button.disabled = false;
    button.textContent = originalText;
    setRepairStatus(error?.message || "Could not upload and link this Vault recording.");
  }
}

async function renderVault() {
  if (!host || !status) return;

  try {
    if (repairMatchId && !repairMatch) {
      await loadRepairMatch();
    }

    const [recordings, storage] = await Promise.all([
      listRecordings(),
      getStorageEstimate()
    ]);

    const localBytes = recordings.reduce((sum, recording) => sum + Number(recording.size || 0), 0);
    const storageText = storage
      ? ` Browser storage: ${formatBytes(storage.usage)} used of ${formatBytes(storage.quota)}.`
      : "";
    const pressureText = storage?.ratio >= 0.8
      ? " Storage is getting tight — keep important Vault copies, but free device/browser space before the next event."
      : "";

    status.textContent = recordings.length
      ? `${recordings.length} local recording${recordings.length === 1 ? "" : "s"} preserved on this device (${formatBytes(localBytes)} in the Vault).${storageText}${pressureText}`
      : `No durable local recordings saved yet.${storageText}${pressureText}`;

    if (!recordings.length) {
      host.innerHTML = repairBannerHtml();
      wireRepairBanner();
      return;
    }

    host.innerHTML = repairBannerHtml() + recordings.map((recording, index) => `
      <article class="media-row" data-vault-index="${index}">
        <strong>${escape(recording.title || "Match Recording")}</strong>
        <p class="muted">
          ${escape(recordingStateLabel(recording))}
        </p>
        <p class="muted">
          ${escape(recording.eventName || "No event")}
          ${recording.weightClass ? ` · ${escape(recording.weightClass)}` : ""}
        </p>
        <p class="muted">
          ${escape(new Date(recording.createdAt).toLocaleString())}
          · ${formatBytes(recording.size)}
        </p>
        ${recording.youtubeUrl ? `<p><strong>YouTube:</strong> upload accepted / linked</p>` : `<p class="muted">YouTube not linked</p>`}
        <video controls playsinline preload="metadata" data-vault-preview="${index}"></video>
        <div class="media-actions">
          ${repairMatchId ? `
            <button type="button" data-vault-upload-link="${index}" ${youtubeReady ? "" : "disabled"}>
              Upload & Link to This Match
            </button>
          ` : ""}
          <button type="button" data-vault-save="${index}">Save Recovered Video</button>
        </div>
      </article>
    `).join("");

    recordings.forEach((recording, index) => {
      const video = host.querySelector(`[data-vault-preview="${index}"]`);
      if (video && recording.blob instanceof Blob) {
        video.src = URL.createObjectURL(recording.blob);
      }
    });

    wireRepairBanner();

    host.onclick = async event => {
      const saveButton = event.target.closest("[data-vault-save]");
      if (saveButton) {
        const recording = recordings[Number(saveButton.dataset.vaultSave)];
        if (!recording?.blob) return;

        const extension = recording.mimeType?.includes("webm") ? "webm" : "mp4";
        const url = URL.createObjectURL(recording.blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${safeFileName(recording.title)}-${String(recording.createdAt || "").slice(0, 10)}.${extension}`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        return;
      }

      const uploadButton = event.target.closest("[data-vault-upload-link]");
      if (uploadButton) {
        const recording = recordings[Number(uploadButton.dataset.vaultUploadLink)];
        await uploadAndLink(recording, uploadButton);
      }
    };
  } catch (error) {
    console.error("Video vault library failed:", error);
    status.textContent = "Could not open the local Video Vault on this device.";
  }
}

function wireRepairBanner() {
  const connectButton = document.getElementById("vaultConnectYouTube");
  connectButton?.addEventListener("click", () => {
    try {
      connectYouTubeUpload();
    } catch (error) {
      setRepairStatus(error?.message || "Could not start YouTube connection.");
    }
  });
}

window.addEventListener("cornerman:youtube-status", event => {
  const detail = event.detail || {};

  if (detail.type === "connecting") {
    setRepairStatus("Choose the YouTube account you want Cornerman to upload to.");
    return;
  }

  if (detail.type === "connected") {
    youtubeReady = true;
    renderVault();
    return;
  }

  if (detail.type === "error") {
    setRepairStatus(detail.message || "YouTube connection failed.");
  }
});

initYouTubeUploader({
  onConnected: () => {
    youtubeReady = true;
  },
  onError: message => {
    setRepairStatus(message || "YouTube connection failed.");
  }
});

renderVault();
