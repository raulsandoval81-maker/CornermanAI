import { updateMatchMedia } from "../shared/match-repository.js";

const params = new URLSearchParams(window.location.search);
const matchId = params.get("id");

const form = document.getElementById("attachYouTubeForm");
const input = document.getElementById("attachYouTubeUrl");
const button = document.getElementById("attachYouTubeBtn");
const status = document.getElementById("attachYouTubeStatus");

function normalizeYouTubeUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  let url;
  try {
    url = new URL(raw);
  } catch {
    return "";
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const allowed = new Set([
    "youtube.com",
    "m.youtube.com",
    "youtu.be"
  ]);

  if (!allowed.has(host)) return "";
  if (url.protocol !== "https:") return "";

  return url.toString();
}

form?.addEventListener("submit", async event => {
  event.preventDefault();

  if (!matchId) {
    status.textContent = "No match selected.";
    return;
  }

  const videoUrl = normalizeYouTubeUrl(input?.value);
  if (!videoUrl) {
    status.textContent = "Paste a valid YouTube video link.";
    return;
  }

  button.disabled = true;
  button.textContent = "Attaching…";
  status.textContent = "Attaching video to this match…";

  const attachedAt = new Date().toISOString();
  const result = await updateMatchMedia(matchId, {
    videoUrl,
    videoHost: "youtube",
    videoVisibility: "unlisted",
    videoAttachedAt: attachedAt,
    videoUnlinkedAt: ""
  });

  if (!result.match) {
    button.disabled = false;
    button.textContent = "Attach YouTube Video";
    status.textContent = "Could not update this match.";
    return;
  }

  localStorage.setItem(
    "coach_console_last_match",
    JSON.stringify(result.match)
  );

  status.textContent = result.synced
    ? "Video attached."
    : result.authenticated === false
      ? "Video attached locally. Sign in to sync it."
      : "Video attached locally. Sync pending.";

  button.textContent = "Attached ✓";

  setTimeout(() => {
    window.location.reload();
  }, 450);
});
