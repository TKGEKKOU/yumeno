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
vm.runInContext(fs.readFileSync("static/js/personas.js", "utf8"), sandbox);

const { buildPersonaCapabilityChains, applyCapabilityPackagePolicy } = sandbox.module.exports;
const chains = buildPersonaCapabilityChains({
  skills: [{ name: "web-research", enabled: true, trusted: true, tool_names: ["search", "format_answer"] }],
  servers: [{ name: "free-search", enabled: true, status: { status: "connected" }, authorized: true }],
  tools: [
    { id: "mcp/free-search/search", name: "search", source: "mcp", server: "free-search", requires_confirmation: false, default_allowed: true },
    { id: "builtin/format_answer", name: "format_answer", source: "builtin", server: "", requires_confirmation: false, default_allowed: true },
  ],
  overrides: { "mcp/free-search/search": false },
});

assert.strictEqual(chains.length, 1);
assert.strictEqual(chains[0].skill.name, "web-research");
assert.strictEqual(chains[0].status, "partial");
assert.strictEqual(chains[0].tools[0].effective, false);
assert.strictEqual(chains[0].tools[0].reason, "角色已禁用");
assert.strictEqual(chains[0].tools[1].effective, true);
assert.strictEqual(chains[0].tools[1].reason, "可用");

const promptOnly = buildPersonaCapabilityChains({
  skills: [{ name: "reply_conventions", enabled: true, trusted: true, tool_names: [] }],
  servers: [],
  tools: [],
  overrides: {},
});

assert.strictEqual(promptOnly.length, 1);
assert.strictEqual(promptOnly[0].status, "available");
assert.strictEqual(promptOnly[0].tools.length, 0);

const packageData = {
  packages: [{
    id: "skill/web-research",
    kind: "skill",
    required_servers: ["free-search"],
    dependencies: [{ id: "mcp/free-search/search", name: "search", server: "free-search" }],
  }],
  overrides: {},
  servers: [{ name: "free-search", global: false, authorized: false }],
};
const allowed = applyCapabilityPackagePolicy(packageData, "skill/web-research", "allow");
assert.strictEqual(allowed.overrides["skill/web-research"], true);
assert.strictEqual(allowed.overrides["mcp/free-search/search"], true);
assert.strictEqual(allowed.servers[0].authorized, true);

const denied = applyCapabilityPackagePolicy(allowed, "skill/web-research", "deny");
assert.strictEqual(denied.overrides["skill/web-research"], false);
assert.strictEqual(denied.overrides["mcp/free-search/search"], true);
assert.strictEqual(denied.servers[0].authorized, true);

const unassigned = buildPersonaCapabilityChains({
  skills: [{ name: "web-research", enabled: true, trusted: true, tool_names: ["search"] }],
  packages: [{
    id: "skill/web-research",
    assigned: false,
    level: 2,
    status: "unassigned",
    dependencies: [{ id: "mcp/free-search/search", name: "search" }],
  }],
  servers: [{ name: "free-search", enabled: true, status: { status: "connected" }, authorized: true }],
  tools: [{
    id: "mcp/free-search/search",
    name: "search",
    source: "mcp",
    server: "free-search",
    default_allowed: false,
  }],
  overrides: {},
});
assert.strictEqual(unassigned[0].skillAllowed, false);
assert.strictEqual(unassigned[0].status, "off");

const explicitlyAllowed = buildPersonaCapabilityChains({
  skills: [{ name: "web-research", enabled: true, trusted: true, tool_names: ["search"] }],
  packages: [{
    id: "skill/web-research",
    assigned: true,
    level: 2,
    status: "available",
    dependencies: [{ id: "mcp/free-search/search", name: "search" }],
  }],
  servers: [{ name: "free-search", enabled: true, status: { status: "connected" }, authorized: true }],
  tools: [{
    id: "mcp/free-search/search",
    name: "search",
    source: "mcp",
    server: "free-search",
    default_allowed: false,
  }],
  overrides: {
    "skill/web-research": true,
    "mcp/free-search/search": true,
  },
});
assert.strictEqual(explicitlyAllowed[0].skillAllowed, true);
assert.strictEqual(explicitlyAllowed[0].tools[0].effective, true);
assert.strictEqual(explicitlyAllowed[0].status, "available");

console.log("ok: persona capability dependency chain");
