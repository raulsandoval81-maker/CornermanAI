const CLIENT_ID =
  "350252883005-es358ngtiv3ur8he2ode3vcidaahd1gd.apps.googleusercontent.com";

const SCOPES =
  "https://www.googleapis.com/auth/youtube.upload";

let accessToken = "";
let tokenClient = null;

export function isYouTubeConnected() {
  return !!accessToken;
}

export function initYouTubeUploader({
  onConnected,
  onError
} = {}) {
  if (!window.google?.accounts?.oauth2) {
    onError?.("Google Identity Services not loaded.");
    return;
  }

  tokenClient =
    window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: tokenResponse => {
        if (!tokenResponse.access_token) {
          onError?.("No access token returned.");
          return;
        }

        accessToken = tokenResponse.access_token;
        onConnected?.();
      }
    });
}

export function connectYouTubeUpload() {
  if (!tokenClient) {
    throw new Error("YouTube uploader not initialized.");
  }

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
    throw new Error("Connect YouTube first.");
  }

  if (!videoBlob) {
    throw new Error("No video blob provided.");
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
    throw data;
  }

  const videoUrl =
    `https://www.youtube.com/watch?v=${data.id}`;

  storeUploadedVideo({
    videoId: data.id,
    videoUrl,
    title
  });

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