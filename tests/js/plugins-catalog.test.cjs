const assert = require("assert");
const fs = require("fs");

const html = fs.readFileSync("static/views/plugins.html", "utf8");
const script = fs.readFileSync("frontend/src/extensions/App.vue", "utf8");
assert.match(html, /extensions-app-root/);
assert.match(script, /在线扩展/);
assert.match(script, /api\/extensions\/catalog/);
assert.match(script, /confirmed: false/);
assert.match(script, /confirmed: true/);
console.log("Vue plugins catalog contract passed");
