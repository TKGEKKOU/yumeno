const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const sandbox = { window: {}, Math, console };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("static/live2d/angle-z-motion.js", "utf8"), sandbox);

const motion = sandbox.window.PLAngleZMotion.create({ random: () => 0 });
motion.reset(0);

assert(Math.abs(motion.sample(0, -30, 30)) <= 4, "idle sway stays subtle");
assert(Math.abs(motion.sample(2999, -30, 30)) <= 4, "large sway does not begin before three seconds");

motion.sample(3000, -30, 30);
const firstPeak = motion.sample(3525, -30, 30);
assert(firstPeak >= 25.5, "first large sway reaches at least 85% of the positive bound");

motion.sample(4500, -30, 30);
motion.sample(7500, -30, 30);
const secondPeak = motion.sample(8025, -30, 30);
assert(secondPeak <= -25.5, "the next large sway alternates to the negative bound");

for (let time = 0; time <= 10000; time += 125) {
  const value = motion.sample(time, -18, 24);
  assert(value >= -18 && value <= 24, "every sample is clamped to the supplied bounds");
}

motion.reset(10000);
assert(Math.abs(motion.sample(10000, -30, 30)) <= 4, "reset clears the active large sway");

console.log("ok: Angle Z motion scheduling and bounds");
