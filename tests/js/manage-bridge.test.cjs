const assert = require("node:assert/strict");
const fs = require("node:fs");

const source = fs.readFileSync("static/js/manage-bridge.js", "utf8");
assert.match(source, /\/static\/vue\/manage\.js/);
assert.match(source, /\/static\/vue\/style\.css/);
assert.match(source, /mountManageApp/);
assert.match(source, /window\.PL\.modules\.manage/);
assert.match(source, /onShow/);
console.log("ok: vue manage bridge");
