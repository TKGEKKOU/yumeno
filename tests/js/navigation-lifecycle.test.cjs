const fs = require("fs");
const assert = require("assert");

const integrations = fs.readFileSync("static/js/integrations.js", "utf8");
const app = fs.readFileSync("static/js/app.js", "utf8");

const initBody = integrations.match(
  /async function initIntegrations\(\) \{([\s\S]*?)\n\}/,
)?.[1] || "";

assert(!initBody.includes("attachLiveStage()"),
  "async integration initialization must not reattach the shared Live2D dock after the user leaves the view");
assert.match(app, /let viewSwitchEpoch = 0;/,
  "view navigation tracks the latest asynchronous switch");
assert.match(app, /if \(switchEpoch !== viewSwitchEpoch\) return;/,
  "a stale view fetch cannot replace the user's newer navigation target");

console.log("ok: Live2D view lifecycle rejects stale navigation work");
