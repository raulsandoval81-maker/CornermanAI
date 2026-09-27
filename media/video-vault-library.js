import { listRecordings } from "./video-vault.js";

const host = document.getElementById("videoVaultList");
const status = document.getElementById("videoVaultStatus");

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

async function renderVault() {
  if (!host || !status) return;

  try {
    const recordings = await listRecordings();

    status.textContent = recordings.length
      ? `${recordings.length} local recording${recordings.length === 1 ? "" : "s"} preserved on this device.`
      : "No durable local recordings saved yet.";

    if (!recordings.length) {
      host.innerHTML = "";
      return;
    }

    host.innerHTML = recordings.map((recording, index) => `
      <article class="media-row" data-vault-index="${index}">
        <strong>${window.CornermanSafe.escapeHtml(recording.title || "Match Recording")}</strong>
        <p class="muted">
          ${window.CornermanSafe.escapeHtml(recording.eventName || "No event")}
          ${recording.weightClass ? ` · ${window.CornermanSafe.escapeHtml(recording.weightClass)}` : ""}
        </p>
        <p class="muted">
          ${window.CornermanSafe.escapeHtml(new Date(recording.createdAt).toLocaleString())}
          · ${formatBytes(recording.size)}
        </p>
        ${recording.youtubeUrl ? `<p><strong>YouTube:</strong> linked</p>` : `<p class="muted">YouTube not confirmed</p>`}
        <video controls playsinline preload="metadata" data-vault-preview="${index}"></video>
        <div class="media-actions">
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

    host.onclick = event => {
      const button = event.target.closest("[data-vault-save]");
      if (!button) return;
      const recording = recordings[Number(button.dataset.vaultSave)];
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
    };
  } catch (error) {
    console.error("Video vault library failed:", error);
    status.textContent = "Could not open the local Video Vault on this device.";
  }
}

renderVault();
