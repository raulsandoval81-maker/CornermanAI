export function createManualRoundGuard({ windowMs = 2500, now = () => Date.now() } = {}) {
  let armedUntil = 0;

  return {
    request() {
      const current = now();
      if (armedUntil && current <= armedUntil) {
        armedUntil = 0;
        return true;
      }
      armedUntil = current + windowMs;
      return false;
    },
    reset() {
      armedUntil = 0;
    },
    isArmed() {
      return armedUntil > now();
    }
  };
}
