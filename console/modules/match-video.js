export function stopCameraStream(args = {}) {
  const stream =
    args.getStream
      ? args.getStream()
      : window.__cornermanStream;

  if (stream) {
    stream
      .getTracks()
      .forEach(track => track.stop());

    if (args.setStream) {
      args.setStream(null);
    }

    window.__cornermanStream = null;
  }
}

export function pauseVideoCapture(args = {}) {
  const mediaRecorder =
    args.getMediaRecorder
      ? args.getMediaRecorder()
      : window.__cornermanMediaRecorder;

  if (
    mediaRecorder &&
    mediaRecorder.state === "recording"
  ) {
    mediaRecorder.requestData?.();
    mediaRecorder.pause();
  }
}

export function resumeVideoCapture({
  getMediaRecorder
}) {
  const mediaRecorder =
    getMediaRecorder();

  if (
    mediaRecorder &&
    mediaRecorder.state === "paused"
  ) {
    mediaRecorder.resume();
  }
}

export function loadReplayFromCurrentChunks({
  getChunks,
  reviewPreview,
  setStatus
}) {
  const chunks =
    getChunks?.() || [];

  if (!chunks.length) {
    setStatus?.("No replay footage available yet.");
    return null;
  }

  const blob =
    new Blob(chunks, {
      type: "video/webm"
    });

  const videoUrl =
    URL.createObjectURL(blob);

  if (reviewPreview) {
    reviewPreview.srcObject =
      null;

    reviewPreview.src =
      videoUrl;

    reviewPreview.controls =
      true;

    reviewPreview.load();
  }

  setStatus?.("Replay ready.");

  return videoUrl;
}

export async function startCameraCapture({
  getStream,
  setStream,
  getChunks,
  setChunks,
  getMediaRecorder,
  setMediaRecorder,
  preview,
  reviewPreview,
  buildMatchPayload,
  setStatus,
  updateStartButton
}) {
  if (getStream()) {
    return;
  }

  const stream =
    await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: {
          ideal: "environment"
        }
      },
      audio: false
    });

  setStream(stream);

  window.__cornermanStream =
    stream;

  if (preview) {
    preview.srcObject =
      stream;

    preview.controls =
      false;
  }

  setChunks([]);

  const mediaRecorder =
    new MediaRecorder(stream);

  setMediaRecorder(mediaRecorder);

  window.__cornermanMediaRecorder =
    mediaRecorder;

  mediaRecorder.ondataavailable = e => {
    if (e.data.size > 0) {
      getChunks().push(e.data);
    }
  };

  mediaRecorder.onstop = () => {
    const chunks =
      getChunks();

    if (!chunks.length) {
      setStatus("No recording data saved.");
      return;
    }

    const blob =
      new Blob(chunks, {
        type: "video/webm"
      });

    const videoUrl =
      URL.createObjectURL(blob);

    if (preview) {
      preview.srcObject =
        null;

      preview.src =
        videoUrl;

      preview.controls =
        true;
    }

    if (reviewPreview) {
      reviewPreview.srcObject =
        null;

      reviewPreview.src =
        videoUrl;

      reviewPreview.controls =
        true;

      reviewPreview.load();
    }

    const reader =
      new FileReader();

    reader.onloadend = () => {
      const base64Video =
        reader.result;

      localStorage.setItem(
        "coach_console_last_match",
        JSON.stringify(
          buildMatchPayload(base64Video)
        )
      );
    };

    reader.readAsDataURL(blob);

    setStatus(
      "Recording saved locally."
    );

    updateStartButton({
      text: "Start",
      disabled: false
    });
  };

  mediaRecorder.start();

  setStatus("Camera ready.");
}

export function clearVideoPreviews({
  preview,
  reviewPreview
}) {
  if (preview) {
    preview.srcObject =
      null;

    preview.removeAttribute("src");

    preview.load();
  }

  if (reviewPreview) {
    reviewPreview.srcObject =
      null;

    reviewPreview.removeAttribute("src");

    reviewPreview.load();
  }
}

export function stopRecordingIfActive({
  getMediaRecorder
}) {
  const mediaRecorder =
    getMediaRecorder();

  if (
    mediaRecorder &&
    mediaRecorder.state !== "inactive"
  ) {
    mediaRecorder.stop();
  }
}