const scanButton = document.getElementById("scanLocalRecovery");
const recoveryStatus = document.getElementById("localRecoveryStatus");
const recoveryResults = document.getElementById("localRecoveryResults");

function dataUrlToBlob(dataUrl) {
  const [header, payload = ""] = String(dataUrl || "").split(",", 2);
  const mimeMatch = header.match(/^data:([^;]+);base64$/i);
  if (!mimeMatch || !payload) return null;

  try {
    const bytes = atob(payload);
    const buffer = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i += 1) {
      buffer[i] = bytes.charCodeAt(i);
    }
    return new Blob([buffer], { type: mimeMatch[1] || "video/webm" });
  } catch {
    return null;
  }
}

function findVideoData(value, path = "root", found = []) {
  if (typeof value === "string") {
    if (value.startsWith("data:video/")) {
      found.push({ path, dataUrl: value });
    }
    return found;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => findVideoData(item, `${path}[${index}]`, found));
    return found;
  }

  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) =>
      findVideoData(item, `${path}.${key}`, found)
    );
  }

  return found;
}

function parseStoredValue(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function collectRecoverableVideos() {
  const results = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key) continue;

    const raw = localStorage.getItem(key);
    if (!raw) continue;

    const value = parseStoredValue(raw);
    const videos = findVideoData(value);

    videos.forEach(video => {
      results.push({
        storageKey: key,
        path: video.path,
        dataUrl: video.dataUrl
      });
    });
  }

  return results;
}

function renderRecovery(results) {
  if (!recoveryResults || !recoveryStatus) return;

  recoveryResults.innerHTML = "";

  if (!results.length) {
    recoveryStatus.textContent =
      "No surviving local video recording was found in this browser's local storage.";
    return;
  }

  recoveryStatus.textContent =
    `Found ${results.length} recoverable local video recording${results.length === 1 ? "" : "s"}. Do not clear browser data until you save them.`;

  results.forEach((item, index) => {
    const blob = dataUrlToBlob(item.dataUrl);
    if (!blob) return;

    const objectUrl = URL.createObjectURL(blob);
    const row = document.createElement("div");
    row.className = "media-row";

    const title = document.createElement("strong");
    title.textContent = `Recovered Local Recording ${index + 1}`;

    const source = document.createElement("p");
    source.className = "muted";
    source.textContent = `${item.storageKey} · ${item.path} · ${(blob.size / (1024 * 1024)).toFixed(1)} MB`;

    const video = document.createElement("video");
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.src = objectUrl;
    video.style.width = "100%";
    video.style.maxWidth = "720px";

    const saveLink = document.createElement("a");
    saveLink.href = objectUrl;
    saveLink.download = `cornerman-recovered-${Date.now()}-${index + 1}.webm`;
    saveLink.textContent = "Save Recovered Video";

    row.append(title, source, video, saveLink);
    recoveryResults.appendChild(row);
  });
}

scanButton?.addEventListener("click", () => {
  scanButton.disabled = true;
  recoveryStatus.textContent = "Scanning this browser only…";

  try {
    renderRecovery(collectRecoverableVideos());
  } finally {
    scanButton.disabled = false;
  }
});
