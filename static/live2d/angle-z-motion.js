"use strict";

window.PLAngleZMotion = (function () {
  const MIN_INTERVAL_MS = 3000;
  const INTERVAL_SPAN_MS = 4000;
  const MIN_DURATION_MS = 1500;
  const DURATION_SPAN_MS = 500;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const smoothstep = (value) => {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  };

  class AngleZMotion {
    constructor(options = {}) {
      this.random = typeof options.random === "function" ? options.random : Math.random;
      this.reset(0);
    }

    reset(nowMs = 0) {
      this.direction = 1;
      this.event = null;
      this.lastNow = nowMs;
      this.nextAt = nowMs + MIN_INTERVAL_MS + this.random() * INTERVAL_SPAN_MS;
    }

    sample(nowMs, minimum = -30, maximum = 30) {
      let min = Number.isFinite(minimum) ? minimum : -30;
      let max = Number.isFinite(maximum) ? maximum : 30;
      if (min >= max) { min = -30; max = 30; }
      if (nowMs < this.lastNow) this.reset(nowMs);
      this.lastNow = nowMs;

      if (this.event && nowMs >= this.event.start + this.event.duration) {
        this.event = null;
        this.nextAt = nowMs + MIN_INTERVAL_MS + this.random() * INTERVAL_SPAN_MS;
      }
      if (!this.event && nowMs >= this.nextAt) {
        const bound = this.direction > 0 ? Math.max(0, max) : Math.abs(Math.min(0, min));
        const magnitude = 0.85 + this.random() * 0.15;
        this.event = {
          start: nowMs,
          duration: MIN_DURATION_MS + this.random() * DURATION_SPAN_MS,
          target: this.direction * bound * magnitude,
        };
        this.direction *= -1;
      }

      const idleBound = Math.min(Math.abs(min), Math.abs(max));
      const idle = Math.sin(nowMs / 1700) * idleBound * 0.12;
      if (!this.event) return clamp(idle, min, max);

      const progress = (nowMs - this.event.start) / this.event.duration;
      let envelope;
      if (progress < 0.35) envelope = smoothstep(progress / 0.35);
      else if (progress <= 0.65) envelope = 1;
      else envelope = 1 - smoothstep((progress - 0.65) / 0.35);
      return clamp(idle * (1 - envelope) + this.event.target * envelope, min, max);
    }
  }

  return { create: (options) => new AngleZMotion(options) };
})();
