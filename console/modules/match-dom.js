export function createDOM() {
  return {

    /* STATUS / VIDEO */
    statusEl:
      document.getElementById("status"),

    preview:
      document.getElementById("preview"),

    reviewPreview:
      document.getElementById("reviewPreview"),

    /* MODE */
    liveBtn:
      document.getElementById("liveMode"),

    reviewBtn:
      document.getElementById("reviewMode"),

    /* MATCH SETUP */
    matchSetupEl:
      document.getElementById("matchSetup"),

    confirmMatchSetupBtn:
      document.getElementById("confirmMatchSetup"),

    eventNameInput:
      document.getElementById("eventNameInput"),

    weightClassInput:
      document.getElementById("weightClassInput"),

    eventNameDisplay:
      document.getElementById("eventNameDisplay"),

    weightClassDisplay:
      document.getElementById("weightClassDisplay"),

    redTeamInput:
      document.getElementById("redTeamInput"),

    greenTeamInput:
      document.getElementById("greenTeamInput"),

    athleteNameInput:
      document.getElementById("athleteName"),

    opponentNameInput:
      document.getElementById("opponentName"),

    redTeamEl:
      document.getElementById("redTeam"),

    greenTeamEl:
      document.getElementById("greenTeam"),

    redDisplayName:
      document.getElementById("redDisplayName"),

    greenDisplayName:
      document.getElementById("greenDisplayName"),

    /* SCOREBOARD */
    athleteScoreEl:
      document.getElementById("athleteScore"),

    opponentScoreEl:
      document.getElementById("opponentScore"),

    clockEl:
      document.getElementById("clock"),

    currentRoundEl:
      document.getElementById("currentRound"),

    /* EVENTS */
    eventLogEl:
      document.getElementById("eventLog"),

    boutBoardEl:
      document.getElementById("boutBoard"),

    boutRailEl:
      document.getElementById("boutRail"),

    reviewBoutBoardEl:
      document.getElementById("reviewBoutBoard"),

    reviewBoutRailEl:
      document.getElementById("reviewBoutRail"),

    /* MATCH FORMAT */
    matchFormatSelect:
      document.getElementById("matchFormat"),

    choicePanel:
      document.getElementById("choicePanel"),

    /* CLOCK CONTROLS */
    startBtn:
      document.getElementById("startRecord"),

    pauseBtn:
      document.getElementById("pauseClock"),

    stopBtn:
      document.getElementById("stopRecord"),

    resetBtn:
      document.getElementById("resetClock"),

    /* CHOOSER */
    chooserPanel:
      document.getElementById("chooserPanel"),

    greenChooserBtn:
      document.getElementById("greenChooserBtn"),

    redChooserBtn:
      document.getElementById("redChooserBtn"),

    /* ADJUST CLOCK */
    toggleAdjustClockBtn:
      document.getElementById("toggleAdjustClock"),

    adjustClockPanel:
      document.getElementById("adjustClockPanel"),

    /* ADJUST SCORE */
    toggleAdjustScoreBtn:
      document.getElementById("toggleAdjustScore"),

    adjustScorePanel:
      document.getElementById("adjustScorePanel"),

    /* MATCH ACTIONS */
    resetMatchBtn:
      document.getElementById("resetMatch"),

    matchActionsBtn:
      document.getElementById("toggleMatchActions"),

    matchActionsPanel:
      document.getElementById("matchActionsPanel"),

    manualNextRoundBtn:
      document.getElementById("nextRound"),

    /* SUMMARY */
    matchSummaryModal:
      document.getElementById("matchSummaryModal"),

    closeMatchSummaryBtn:
      document.getElementById("closeMatchSummary"),

    finishBtn:
      document.getElementById("endMatch"),

    reviewWinnerEl:
      document.getElementById("reviewWinner"),

    reviewResultEl:
      document.getElementById("reviewResult"),

    summaryScoreEl:
      document.getElementById("summaryScore"),

    summarySuggestedResultEl:
      document.getElementById("summarySuggestedResult"),

    sandmanColorSelect:
      document.getElementById("sandmanColor")
  };
}