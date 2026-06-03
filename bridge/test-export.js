import {
  exportToSandman
} from "./sandman-import.js";

const payload =
  exportToSandman({
    athlete: "Max",
    latestMatch: {
      result: "Loss",
      opponent: "Troy"
    },
    patterns: [
      "strong-bottom",
      "back-exposure-risk"
    ]
  });

console.log(
  "Sandman Export Test",
  payload
);