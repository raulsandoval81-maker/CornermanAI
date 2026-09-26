import "./post-match-flow.js";

const returnToConsoleBtn = document.getElementById("returnToConsoleBtn");
const liveModeBtn = document.getElementById("liveMode");

if (returnToConsoleBtn && liveModeBtn) {
  returnToConsoleBtn.addEventListener("click", () => {
    liveModeBtn.click();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
