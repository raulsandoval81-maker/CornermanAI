import {
  runRecon
} from "../recon/recon-runner.js";

export function analyzeMatch(
  match = {},
  patterns = []
) {
  const recon =
    runRecon(match);

  return {
    generatedAt:
      new Date().toISOString(),

    patterns,

    recon,

    coach:
      recon.coach,

    athlete:
      recon.athlete,

    recommendations:
      recon.recommendations,

    practice:
      recon.practice
  };
}