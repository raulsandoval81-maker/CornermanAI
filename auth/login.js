const form = document.getElementById("loginForm");
const status = document.getElementById("status");

form?.addEventListener("submit", async event => {
  event.preventDefault();
  status.textContent = "Signing in…";
  try {
    const response = await fetch("/api/auth", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: new FormData(form).get("password") }) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Sign-in failed.");
    const next = new URLSearchParams(location.search).get("next");
    location.href = next && next.startsWith("/") && !next.startsWith("//") ? next : "/console/";
  } catch (error) {
    status.textContent = error.message;
  }
});
