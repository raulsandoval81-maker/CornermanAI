(function initializeSafeRendering(global) {
  "use strict";

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function safeUrl(value) {
    const raw = String(value ?? "").trim();
    if (!raw) return "";

    try {
      const url = new URL(raw, global.location.href);
      return url.protocol === "http:" || url.protocol === "https:"
        ? url.href
        : "";
    } catch (error) {
      return "";
    }
  }

  global.CornermanSafe = Object.freeze({ escapeHtml, safeUrl });
  global.escapeHtml = escapeHtml;
  global.safeUrl = safeUrl;
})(window);
