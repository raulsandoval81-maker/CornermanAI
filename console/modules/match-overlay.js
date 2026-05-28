export function setStatus(statusElOrText, maybeText) {

  const statusEl =
    typeof statusElOrText === "string"
      ? document.getElementById("status")
      : statusElOrText;

  const text =
    typeof statusElOrText === "string"
      ? statusElOrText
      : maybeText;

  if (!statusEl) return;

  statusEl.textContent = text;

  statusEl.classList.remove("status-flash");

  void statusEl.offsetWidth;

  statusEl.classList.add("status-flash");
}

export function showFinishFlash(text, winner) {
  const el = document.getElementById("finishFlash");

  if (!el) return;

  el.textContent = text;

  el.className =
    "finish-flash show " +
    (winner === "athlete" ? "green" : "red");

  clearTimeout(el._timeout);

  el._timeout = setTimeout(() => {
    el.className = "finish-flash";
  }, 1100);
}

export function getVideoTarget(
  mode,
  reviewPreview,
  preview
) {
  return (
    mode === "review" &&
    reviewPreview
  )
    ? reviewPreview
    : preview;
}