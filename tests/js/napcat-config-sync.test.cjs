const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const sandbox = {
  window: { PL: { modules: {} } },
  module: { exports: {} },
  exports: {},
  console,
  setTimeout,
  clearTimeout,
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("static/js/napcat.js", "utf8"), sandbox);

const { createConfigSyncState } = sandbox.module.exports;
assert.strictEqual(typeof createConfigSyncState, "function");

const state = createConfigSyncState();
assert.strictEqual(state.shouldApplyRemote(), true);

state.markDirty();
assert.strictEqual(state.shouldApplyRemote(), false);
assert.strictEqual(state.shouldApplyRemote(true), true);

state.markSaved();
assert.strictEqual(state.shouldApplyRemote(), true);

console.log("ok: NapCat polling preserves unsaved configuration");
