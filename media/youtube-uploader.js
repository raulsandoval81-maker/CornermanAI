const CLIENT_ID =
  "350252883005-es358ngtiv3ur8he2ode3vcidaahd1gd.apps.googleusercontent.com";

const SCOPES =
  "https://www.googleapis.com/auth/youtube.upload";

let accessToken = "";
let tokenClient = null;

function emitYouTubeStatus(type, message, detail = null) {
  window.dispatchEvent(
    new CustomEvent("cornerman:youtube-status", {
      detail: { type, message, detail }
    })
  );
}

function getYouTubeErrorMessage(error) {
  if (!error) return "Unknown YouTube error.";

  if (typeof error === "string") return error;

  if (error instanceof Error && error.message) {
    return error.message;
  }

  const apiMessage =
    error?.error?.message ||
    error?.message ||
    error?.error_description ||
    error?.type ||
    error?.error;

  if (typeof apiMessage === "string" && apiMessage.trim()) {
    return apiMessage.trim();
  }

  const reason =
    error?.error?.errors?.[0]?.reason;

  if (reason) return String(reason);

  return "YouTube rejected the request. Reconnect the intended Google account and try again.";
}

export function isYouTubeConnected() {
  return !!accessToken;
}

export function initYouTubeUploader({
  onConnected,
  onError
} = {}) {
  if (!window.google?.accounts?.oauth2) {
    const message = "Google Identity Services not loaded.";
    emitYouTubeStatus("error", message);
    onError?.(message);
    return;
  }

  tokenClient =
    window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: tokenResponse => {
        if (!tokenResponse.access_token) {
          const message =
            getYouTubeErrorMessage(tokenResponse) ||
            "No access token returned.";
          emitYouTubeStatus("error", message, tokenResponse);
          onError?.(message);
          return;
        }

        accessToken = tokenResponse.access_token;
        emitYouTubeStatus(
          "connected",
          "YouTube connected for this browser session."
        );
        onConnected?.();
      },
      error_callback: error => {
        const message = getYouTubeErrorMessage(error);
        emitYouTubeStatus("error", message, error);
        onError?.(message);
      }
    });
}

export function connectYouTubeUpload() {
  if (!tokenClient) {
    const error = new Error("YouTube uploader not initialized.");
    emitYouTubeStatus("error", error.message);
    throw error;
  }

  emitYouTubeStatus(
    "connecting",
    "Choose the Google account whose YouTube channel you want to use."
  );

  tokenClient.requestAccessToken();
}

export async function uploadVideoToYouTube({
  videoBlob,
  title = "CornermanAI Match",
  description = "Uploaded from CornermanAI",
  tags = ["CornermanAI"],
  privacyStatus = "unlisted"
}) {
  if (!accessToken) {
    const error = new Error("Connect YouTube first, then upload the match.");
    emitYouTubeStatus("error", error.message);
    throw error;
  }

  if (!videoBlob) {
    const error = new Error("No match video is ready to upload.");
    emitYouTubeStatus("error", error.message);
    throw error;
  }

  const metadata = {
    snippet: {
      title,
      description,
      tags
    },
    status: {
      privacyStatus
    }
  };

  const boundary = "cornerman_upload_boundary";

  const body = new Blob([
    `--${boundary}\r\n`,
    "Content-Type: application/json; charset=UTF-8\r\n\r\n",
    JSON.stringify(metadata),
    "\r\n",
    `--${boundary}\r\n`,
    `Content-Type: ${videoBlob.type || "video/webm"}\r\n\r\n`,
    videoBlob,
    "\r\n",
    `--${boundary}--`
  ], {
    type: `multipart/related; boundary=${boundary}`
  });

  emitYouTubeStatus("uploading", "Uploading match video to YouTube...");

  const res = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body
    }
  );

  const data = await res.json();

  if (!res.ok) {
    const message = getYouTubeErrorMessage(data);
    emitYouTubeStatus("error", message, data);
    throw new Error(message);
  }

  const videoUrl =
    `https://www.youtube.com/watch?v=${data.id}`;

  storeUploadedVideo({
    videoId: data.id,
    videoUrl,
    title
  });

  emitYouTubeStatus(
    "uploaded",
    "YouTube upload complete.",
    { videoId: data.id, videoUrl }
  );

  return {
    videoId: data.id,
    videoUrl
  };
}

export function storeUploadedVideo({
  videoId,
  videoUrl,
  title = "CornermanAI Match"
}) {
  localStorage.setItem(
    "cornerman_last_uploaded_video_url",
    videoUrl
  );

  localStorage.setItem(
    "cornerman_pending_video_url",
    videoUrl
  );

  const media =
    JSON.parse(
      localStorage.getItem("cornerman_media") || "[]"
    );

  media.unshift({
    id: videoId,
    title,
    videoId,
    videoUrl,
    source: "youtube",
    linkedMatchId: "",
    createdAt: new Date().toISOString()
  });

  localStorage.setItem(
    "cornerman_media",
    JSON.stringify(media)
  );
}