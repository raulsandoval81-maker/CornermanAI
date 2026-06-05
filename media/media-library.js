const STORAGE_KEY =
  "cornerman_media";

export function getMedia() {
  return JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );
}

export function saveMedia(media) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(media)
  );
}