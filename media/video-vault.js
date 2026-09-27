const DB_NAME = "cornerman_video_vault";
const DB_VERSION = 1;
const STORE_NAME = "recordings";
const CHECKPOINT_INTERVAL_MS = 5000;

function openVault() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) {
      reject(new Error("IndexedDB is unavailable on this device."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveRecording(recording) {
  const db = await openVault();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(recording);
    tx.oncomplete = () => {
      db.close?.();
      resolve(recording);
    };
    tx.onerror = () => {
      db.close?.();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close?.();
      reject(tx.error || new Error("Video vault write aborted."));
    };
  });
}

export async function listRecordings() {
  const db = await openVault();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => {
      const rows = Array.isArray(request.result) ? request.result : [];
      rows.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
      db.close?.();
      resolve(rows);
    };
    request.onerror = () => {
      db.close?.();
      reject(request.error);
    };
  });
}

export async function getRecording(id) {
  const db = await openVault();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(id);
    request.onsuccess = () => {
      db.close?.();
      resolve(request.result || null);
    };
    request.onerror = () => {
      db.close?.();
      reject(request.error);
    };
  });
}

export async function markRecordingUploaded(id, videoUrl) {
  const existing = await getRecording(id);
  if (!existing) return null;
  return saveRecording({
    ...existing,
    youtubeUrl: videoUrl || existing.youtubeUrl || "",
    uploadConfirmedAt: videoUrl ? new Date().toISOString() : existing.uploadConfirmedAt || "",
    updatedAt: new Date().toISOString()
  });
}

export async function deleteRecording(id) {
  const db = await openVault();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => {
      db.close?.();
      resolve(true);
    };
    tx.onerror = () => {
      db.close?.();
      reject(tx.error);
    };
  });
}

export async function getStorageEstimate() {
  if (!navigator.storage?.estimate) return null;
  try {
    const estimate = await navigator.storage.estimate();
    const usage = Number(estimate?.usage || 0);
    const quota = Number(estimate?.quota || 0);
    return {
      usage,
      quota,
      remaining: Math.max(0, quota - usage),
      ratio: quota > 0 ? usage / quota : 0
    };
  } catch {
    return null;
  }
}

function currentMatchMetadata() {
  const athlete = document.getElementById("athleteName")?.value?.trim() || "Green";
  const opponent = document.getElementById("opponentName")?.value?.trim() || "Red";
  const eventName = document.getElementById("eventNameInput")?.value?.trim() || "";
  const weightClass = document.getElementById("weightClassInput")?.value?.trim() || "";
  return {
    athlete,
    opponent,
    eventName,
    weightClass,
    title: `${athlete} vs ${opponent}`
  };
}

function safeFileName(value) {
  return String(value || "cornerman-match")
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "cornerman-match";
}

let observedRecorder = null;
let vaultChunks = [];
let vaultRecordingId = "";
let vaultCreatedAt = "";
let lastCheckpointAt = 0;
let checkpointPromise = Promise.resolve();
let pendingUploadRecordingId = "";
let recorderReference = window.__cornermanMediaRecorder || null;
const vaultSavePromises = new Map();
const failedRecordings = new Map();
const pendingUploadedUrls = new Map();

function emitSaving(recording) {
  window.dispatchEvent(new CustomEvent("cornerman:video-vault-saving", {
    detail: {
      id: recording.id,
      title: recording.title,
      size: recording.size
    }
  }));
}

function emitSaved(recording) {
  localStorage.setItem("cornerman_last_vault_recording_id", recording.id);
  window.dispatchEvent(new CustomEvent("cornerman:video-vault-saved", {
    detail: {
      id: recording.id,
      title: recording.title,
      size: recording.size
    }
  }));
}

function emitError(recording, error) {
  console.error("Video vault save failed:", error);
  window.dispatchEvent(new CustomEvent("cornerman:video-vault-error", {
    detail: {
      id: recording.id,
      title: recording.title,
      size: recording.size,
      message: error?.message || "Video vault save failed."
    }
  }));
}

function buildRecordingSnapshot(recorder, status = "recording") {
  if (!vaultChunks.length || !vaultRecordingId) return null;

  const blob = new Blob([...vaultChunks], {
    type: recorder.mimeType || vaultChunks[0]?.type || "video/mp4"
  });
  const metadata = currentMatchMetadata();
  const now = new Date().toISOString();

  return {
    id: vaultRecordingId,
    ...metadata,
    blob,
    mimeType: blob.type,
    size: blob.size,
    createdAt: vaultCreatedAt || now,
    updatedAt: now,
    youtubeUrl: "",
    uploadConfirmedAt: "",
    source: "coach-console",
    status,
    checkpointedAt: status === "recording" ? now : ""
  };
}

function queueCheckpoint(recorder) {
  const recording = buildRecordingSnapshot(recorder, "recording");
  if (!recording) return;

  checkpointPromise = checkpointPromise
    .catch(() => undefined)
    .then(() => saveRecording(recording))
    .then(() => {
      window.dispatchEvent(new CustomEvent("cornerman:video-vault-checkpoint", {
        detail: { id: recording.id, size: recording.size, checkpointedAt: recording.checkpointedAt }
      }));
    })
    .catch(error => {
      console.warn("Video vault checkpoint failed:", error);
      window.dispatchEvent(new CustomEvent("cornerman:video-vault-checkpoint-error", {
        detail: { id: recording.id, message: error?.message || "Live video checkpoint failed." }
      }));
    });
}

function persistRecording(recording) {
  emitSaving(recording);

  const savePromise = checkpointPromise
    .catch(() => undefined)
    .then(() => saveRecording(recording));
  vaultSavePromises.set(recording.id, savePromise);

  savePromise.then(async () => {
    failedRecordings.delete(recording.id);

    const pendingUrl = pendingUploadedUrls.get(recording.id) || "";
    if (pendingUrl) {
      await markRecordingUploaded(recording.id, pendingUrl);
      pendingUploadedUrls.delete(recording.id);
    }

    emitSaved(recording);
  }).catch(error => {
    failedRecordings.set(recording.id, recording);
    emitError(recording, error);
  });

  return savePromise;
}

export async function retryFailedRecording(id) {
  const recording = failedRecordings.get(id);
  if (!recording) {
    throw new Error("No failed recording is available to retry.");
  }
  return persistRecording(recording);
}

export function saveEmergencyCopy(id) {
  const recording = failedRecordings.get(id);
  if (!recording?.blob) {
    throw new Error("No emergency video copy is available.");
  }

  const extension = recording.mimeType?.includes("webm") ? "webm" : "mp4";
  const url = URL.createObjectURL(recording.blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeFileName(recording.title)}-${String(recording.createdAt || "").slice(0, 10)}.${extension}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function attachToRecorder(recorder) {
  if (!recorder || recorder === observedRecorder) return;

  observedRecorder = recorder;
  vaultChunks = [];
  vaultRecordingId = globalThis.crypto?.randomUUID?.() || `video-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  vaultCreatedAt = new Date().toISOString();
  lastCheckpointAt = 0;
  checkpointPromise = Promise.resolve();

  window.dispatchEvent(new CustomEvent("cornerman:video-vault-recording-started", {
    detail: { id: vaultRecordingId, createdAt: vaultCreatedAt }
  }));

  recorder.addEventListener("dataavailable", event => {
    if (event.data?.size <= 0) return;
    vaultChunks.push(event.data);

    const now = Date.now();
    if (!lastCheckpointAt || now - lastCheckpointAt >= CHECKPOINT_INTERVAL_MS) {
      lastCheckpointAt = now;
      queueCheckpoint(recorder);
    }
  });

  recorder.addEventListener("stop", () => {
    if (!vaultChunks.length) {
      const error = new Error("Recorder stopped without video chunks.");
      const metadata = currentMatchMetadata();
      window.dispatchEvent(new CustomEvent("cornerman:video-vault-error", {
        detail: { id: vaultRecordingId, title: metadata.title, size: 0, message: error.message }
      }));
      return;
    }

    const recording = buildRecordingSnapshot(recorder, "complete");
    if (recording) persistRecording(recording);
  });
}

function installRecorderHook() {
  try {
    Object.defineProperty(window, "__cornermanMediaRecorder", {
      configurable: true,
      enumerable: false,
      get() {
        return recorderReference;
      },
      set(value) {
        recorderReference = value || null;
        if (value) attachToRecorder(value);
      }
    });

    if (recorderReference) attachToRecorder(recorderReference);
  } catch (error) {
    console.warn("Could not install immediate recorder hook; using fallback watcher.", error);
  }
}

function watchRecorder() {
  const recorder = window.__cornermanMediaRecorder;
  if (recorder && recorder !== observedRecorder) attachToRecorder(recorder);
}

installRecorderHook();
setInterval(watchRecorder, 250);
watchRecorder();

window.CornermanVideoVault = {
  retryFailedRecording,
  saveEmergencyCopy,
  getStorageEstimate
};

window.addEventListener("cornerman:youtube-upload-start", () => {
  pendingUploadRecordingId =
    vaultRecordingId ||
    localStorage.getItem("cornerman_last_vault_recording_id") ||
    "";
});

window.addEventListener("cornerman:youtube-status", event => {
  if (event.detail?.type !== "uploaded") return;

  const videoUrl = event.detail?.detail?.videoUrl || "";
  const id = pendingUploadRecordingId || "";
  if (!id || !videoUrl) return;

  pendingUploadedUrls.set(id, videoUrl);

  const savePromise = vaultSavePromises.get(id) || Promise.resolve();

  savePromise.then(() => markRecordingUploaded(id, videoUrl)).then(() => {
    pendingUploadedUrls.delete(id);
    pendingUploadRecordingId = "";
    vaultSavePromises.delete(id);
  }).catch(error => {
    console.error("Could not mark vault recording uploaded yet; metadata will retry after local save.", error);
  });
});
