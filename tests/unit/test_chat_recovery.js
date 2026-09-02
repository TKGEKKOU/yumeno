const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const source = fs.readFileSync("static/js/chat.js", "utf8");
assert.match(source, /function scheduleRealtimeReconnect\(\)/);
assert.match(source, /state\.realtimeReconnectAttempts >= 3/);
assert.match(source, /socket\.addEventListener\("open"[\s\S]*?state\.realtimeReconnectAttempts = 0/);
assert.match(source, /socket\.addEventListener\("close"[\s\S]*?scheduleRealtimeReconnect\(\)/);
assert.match(source, /if \(state\.confirmationResponded\) return;\s+state\.confirmationResponded = true;/);
assert.match(
  source,
  /if \(\(state\.pendingAction \|\| state\.pendingInput\) && event\.code !== "turn_in_progress"\) \{[\s\S]*?state\.pendingAction = null;[\s\S]*?state\.pendingInput = null;[\s\S]*?renderConfirmation\(\);/,
);

console.log("ok: chat reconnect and confirmation guards are present");

