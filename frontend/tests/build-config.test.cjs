const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const viteConfig = fs.readFileSync(path.join(root, "vite.config.ts"), "utf8");

assert.equal(packageJson.scripts["build:frontend"], "vite build");
assert.match(viteConfig, /src\/main\.ts/);
assert.match(viteConfig, /static\/vue/);
assert.match(viteConfig, /sourcemap:\s*false/);
assert.match(viteConfig, /manage\.js/);
assert.match(viteConfig, /process\.env\.NODE_ENV/);
console.log("ok: vue build boundary");
