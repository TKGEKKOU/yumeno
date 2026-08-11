const fs = require("fs");
const assert = require("assert");

const css = fs.readFileSync("static/styles.css", "utf8");

assert.match(
  css,
  /@media \(max-width: 680px\)[\s\S]*?\.app-shell \{ display: block; min-width: 0; padding-left: 58px; \}/,
  "the narrow app shell releases its desktop minimum width so the shared Live2D stage fits the viewport",
);

console.log("ok: narrow Live2D host fits the viewport");
