const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const sandbox = { window: { PL: { modules: {} } }, console, TextDecoder, AbortController };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("static/js/chat.js", "utf8"), sandbox);

assert.strictEqual(
  typeof sandbox.window.PL.modules.chat.onShow,
  "function",
  "chat view exposes an onShow lifecycle hook that can restore realtime and Live2D state",
);

assert.strictEqual(
  typeof sandbox.window.PL.chatPreferences?.resolveRecentPersonaId,
  "function",
  "chat exposes a reusable recent-persona resolver",
);

const values = new Map([["yumeno:recent-persona", "persona-2"]]);
const storage = {
  getItem(key) { return values.get(key) || null; },
  setItem(key, value) { values.set(key, value); },
  removeItem(key) { values.delete(key); },
};
const personas = [{ id: "persona-1" }, { id: "persona-2" }];
assert.strictEqual(
  sandbox.window.PL.chatPreferences.resolveRecentPersonaId(personas, storage),
  "persona-2",
  "a valid recent persona wins",
);
values.set("yumeno:recent-persona", "deleted-persona");
assert.strictEqual(
  sandbox.window.PL.chatPreferences.resolveRecentPersonaId(personas, storage),
  "persona-1",
  "a deleted recent persona falls back to the first available persona",
);
sandbox.window.PL.chatPreferences.rememberPersonaId("persona-1", storage);
assert.strictEqual(values.get("yumeno:recent-persona"), "persona-1");

console.log("ok: chat view lifecycle hook");
