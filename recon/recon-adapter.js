import { runRecon } from "./recon-runner.js";

export function analyzeMatch(matchPayload) {
  return runRecon(matchPayload);
}