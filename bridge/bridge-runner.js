import {
  exportToSandman
} from "./export-to-sandman.js";

export function runBridge({

  match = {},
  intelligence = {}

}) {

  const sandmanPayload =
    exportToSandman({

      match,

      intelligence

    });

  return {

    bridgeVersion: "1.0",

    source:
      "CornermanAI",

    destination:
      "Sandman Academy",

    exportedAt:
      new Date().toISOString(),

    payload:
      sandmanPayload

  };

}