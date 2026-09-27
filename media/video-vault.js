const DB_NAME = "cornerman_video_vault";
const DB_VERSION = 1;
const STORE_NAME = "recordings";

function openVault() {
  return new Promise((resolve, reject) => {
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
    tx.oncomplete = () => resolve(recording);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error("Video vault write aborted."));
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
      resolve(rows);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getRecording(id) {
  const db = await openVault();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
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
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
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

let observedRecorder = null;
let vaultChunks = [];
let vaultRecordingId = "";
let pendingUploadRecordingId = "";
const vaultSavePromises = new Map();

function attachToRecorder(recorder) {
  if (!recorder || recorder === observedRecorder) return;

  observedRecorder = recorder;
  vaultChunks = [];
  vaultRecordingId = globalThis.crypto?.randomUUID?.() || `video-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  recorder.addEventListener("dataavailable", event => {
    if (event.data?.size > 0) vaultChunks.push(event.data);
  });

  recorder.addEventListener("stop", () => {
    if (!vaultChunks.length) return;

    const recordingId = vaultRecordingId;
    const blob = new Blob(vaultChunks, {
      type: recorder.mimeType || vaultChunks[0]?.type || "video/mp4"
    });

    const metadata = currentMatchMetadata();
    const now = new Date().toISOString();

    window.dispatchEvent(new CustomEvent("cornerman:video-vault-saving", {
      detail: { id: recordingId, title: metadata.title, size: blob.size }
    }));

    const savePromise = saveRecording({
      id: recordingId,
      ...metadata,
      blob,
      mimeType: blob.type,
      size: blob.size,
      createdAt: now,
      updatedAt: now,
      youtubeUrl: "",
      uploadConfirmedAt: "",
      source: "coach-console"
    });

    vaultSavePromises.set(recordingId, savePromise);

    savePromise.then(() => {
      localStorage.setItem("cornerman_last_vault_recording_id", recordingId);
      window.dispatchEvent(new CustomEvent("cornerman:video-vault-saved", {
        detail: { id: recordingId, title: metadata.title, size: blob.size }
      }));
    }).catch(error => {
      console.error("Video vault save failed:", error);
      window.dispatchEvent(new CustomEvent("cornerman:video-vault-error", {
        detail: { id: recordingId, message: error?.message || "Video vault save failed." }
      }));
    });
  });
}

function watchRecorder() {
  const recorder = window.__cornermanMediaRecorder;
  if (recorder && recorder !== observedRecorder) attachToRecorder(recorder);
}

setInterval(watchRecorder, 250);
watchRecorder();

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

  const savePromise = vaultSavePromises.get(id) || Promise.resolve();

  savePromise.then(() => markRecordingUploaded(id, videoUrl)).then(() => {
    pendingUploadRecordingId = "";
    vaultSavePromises.delete(id);
  }).catch(error => {
    console.error("Could not mark vault recording uploaded:", error);
  });
});
