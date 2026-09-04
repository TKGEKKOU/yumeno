const fs = require("fs");
const assert = require("assert");

const css = fs.readFileSync("static/styles.css", "utf8");

assert.match(
  css,
  /@media \(max-width: 880px\)[\s\S]*?\.app-shell \{[^}]*display:\s*block;[^}]*min-width:\s*0;[^}]*padding-left:\s*58px;[^}]*\}/,
  "the narrow app shell releases its desktop minimum width so the shared Live2D stage fits the viewport",
);

console.log("ok: narrow Live2D host fits the viewport");
