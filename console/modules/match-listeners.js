export function initializeMatchEngine({
  renderControls,
  renderAll,
  saveLocalDraft,
  setMode,
  updateStartButton,
  updateRefButtonLabels
}) {

  renderControls();

  renderAll();

  saveLocalDraft();

  setMode("live");

  updateStartButton({
    text: "Start",
    disabled: true
  });

  updateRefButtonLabels();
}