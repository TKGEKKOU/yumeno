const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const sent = [];
const storage = new Map();
const windowListeners = new Map();
let now = 1000;
class FakeWebSocket {
  static OPEN = 1;
  static CONNECTING = 0;
  constructor(url) { this.url = url; this.readyState = FakeWebSocket.CONNECTING; }
  send(raw) { sent.push(JSON.parse(raw)); }
  open() { this.readyState = FakeWebSocket.OPEN; this.onopen(); }
  message(payload) { this.onmessage({ data: JSON.stringify(payload) }); }
  close() { this.readyState = 3; if (this.onclose) this.onclose(); }
}

const sandbox = {
  window: { addEventListener: (type, handler) => windowListeners.set(type, handler) }, WebSocket: FakeWebSocket,
  localStorage: { getItem: (k) => storage.get(k) || null, setItem: (k, v) => storage.set(k, v), removeItem: (k) => storage.delete(k) },
  document: { dispatchEvent() {} }, CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init.detail; } },
  performance: { now: () => now }, setTimeout: () => 1, clearTimeout() {}, console,
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("static/live2d/angle-z-motion.js", "utf8"), sandbox);
vm.runInContext(fs.readFileSync("static/live2d/vts.js", "utf8"), sandbox);

const client = sandbox.window.PLVTS;
assert.equal(client.url, "ws://127.0.0.1:8001", "VTS defaults to the root WebSocket endpoint");
client.connect();
client.ws.open();
assert.equal(sent[0].messageType, "AuthenticationTokenRequest", "first connection requests an auth token");
client.ws.message({ messageType: "AuthenticationTokenResponse", data: { authenticationToken: "token-1" } });
assert.equal(sent[1].messageType, "AuthenticationRequest", "token response starts authentication");
client.ws.message({ messageType: "AuthenticationResponse", data: { authenticated: true } });
client.setMouth(0.8, -0.2);
assert.equal(sent[2].messageType, "InjectParameterDataRequest", "mouth values use VTS parameter injection");
const values = JSON.parse(JSON.stringify(sent[2].data.parameterValues));
assert.deepEqual(values.slice(0, 2), [{ id: "MouthOpen", value: 0.8 }, { id: "MouthSmile", value: 0.4 }]);
for (const id of ["EyeOpenLeft", "EyeOpenRight", "FaceAngleX", "FaceAngleY", "FaceAngleZ", "FacePositionX", "FacePositionY"]) {
  assert(values.some((item) => item.id === id), "autonomous frame includes " + id);
}
const faceAngleX = values.find((item) => item.id === "FaceAngleX").value;
assert(Math.abs(faceAngleX - Math.sin(0.72) * 12) < 1e-9, "left-right sway uses the wider 12-degree amplitude");
for (const id of ["MouthForm", "BodyAngleX", "BodyAngleY", "BodyAngleZ"]) {
  assert(!values.some((item) => item.id === id), "frame excludes non-tracking parameter " + id);
}
now = 1040;
client.setMouth(0.8, -0.2);
assert.equal(sent.length, 3, "autonomous frames are limited to about 15 FPS");
client._angleZMotion = sandbox.window.PLAngleZMotion.create({ random: () => 0 });
client._angleZMotion.reset(1000);
now = 4000;
client.setMouth(0.8, -0.2);
now = 4525;
client.setMouth(0.8, -0.2);
const largeAngleZ = sent.at(-1).data.parameterValues.find((item) => item.id === "FaceAngleZ").value;
assert(largeAngleZ >= 25.5, "VTS receives the frequent near-maximum Angle Z sway");
assert(largeAngleZ <= 30, "VTS Angle Z stays within the tracking range");
client.ws.close();
assert.equal(client._retryTimer, null, "unexpected disconnect does not schedule an automatic retry");
assert(windowListeners.has("pagehide"), "page close registers a VTS disconnect handler");
console.log("ok: VTube Studio auth and parameter protocol");
