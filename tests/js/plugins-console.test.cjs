const assert = require("assert");
const fs = require("fs");
const source = fs.readFileSync("frontend/src/extensions/model.ts", "utf8");
assert.match(source, /deriveExtensionSummary/);
assert.match(source, /parseKeyValueLines/);
assert.match(source, /attentionCount/);
console.log("ok: Vue extension console model contract");
