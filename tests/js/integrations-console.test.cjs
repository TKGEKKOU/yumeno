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
vm.runInContext(fs.readFileSync("static/js/integrations.js", "utf8"), sandbox);

const { deriveBiliViewModel, mergeReplyRecord, buildReplyRecord, shouldResetBiliSession } = sandbox.module.exports;

assert.strictEqual(typeof deriveBiliViewModel, "function");
assert.strictEqual(typeof mergeReplyRecord, "function");
assert.strictEqual(typeof buildReplyRecord, "function");
assert.strictEqual(typeof shouldResetBiliSession, "function");
assert.strictEqual(shouldResetBiliSession("session-1", "session-2"), true);
assert.strictEqual(shouldResetBiliSession("session-2", "session-2"), false);
assert.strictEqual(shouldResetBiliSession("", "session-1"), false);

const paused = deriveBiliViewModel({
  state: "paused",
  active_room_id: 22798888,
  room_id: "22798888",
  mode: "polling",
  live_status: 0,
  queue_size: 3,
}, "22798888");
assert.strictEqual(paused.stateLabel, "已暂停");
assert.strictEqual(paused.pauseLabel, "继续");
assert.strictEqual(paused.pauseDisabled, false);
assert.strictEqual(paused.disconnectDisabled, false);
assert.strictEqual(paused.channelLabel, "弹幕轮询");
assert.strictEqual(paused.channelTone, "info");
assert.strictEqual(paused.liveLabel, "未开播");
assert.strictEqual(paused.enterAvailable, false);
assert.strictEqual(paused.enterCapabilityLabel, "进场暂停");

const disconnected = deriveBiliViewModel({ state: "disconnected", room_id: "22798888" }, "22798888");
assert.strictEqual(disconnected.stateLabel, "未连接");
assert.strictEqual(disconnected.pauseDisabled, true);
assert.strictEqual(disconnected.disconnectDisabled, true);
assert.strictEqual(disconnected.connectLabel, "连接直播间");

const switching = deriveBiliViewModel({
  state: "running",
  active_room_id: 22798888,
  room_id: "22798888",
  mode: "realtime",
  live_status: 1,
}, "123456");
assert.strictEqual(switching.connectLabel, "切换直播间");
assert.strictEqual(switching.channelLabel, "实时弹幕");
assert.strictEqual(switching.liveLabel, "直播中");
assert.strictEqual(switching.enterAvailable, true);
assert.strictEqual(switching.enterCapabilityLabel, "进场可用");

let records = [];
for (let index = 0; index < 105; index += 1) {
  records = mergeReplyRecord(records, { eventId: `event-${index}`, answer: `${index}` }, 100);
}
assert.strictEqual(records.length, 100);
assert.strictEqual(records[0].eventId, "event-104");
records = mergeReplyRecord(records, { eventId: "event-104", answer: "updated" }, 100);
assert.strictEqual(records.length, 100);
assert.strictEqual(records[0].answer, "updated");

const reply = buildReplyRecord(
  { answer: "角色回复" },
  { id: "event-1", username: "Alice", content: "你好", created_at: "2026-08-09T12:00:00Z" },
  new Date("2026-08-09T12:00:03Z"),
);
assert.deepStrictEqual(JSON.parse(JSON.stringify(reply)), {
  eventId: "event-1",
  username: "Alice",
  prompt: "你好",
  answer: "角色回复",
  completedAt: "2026-08-09T12:00:03.000Z",
  elapsedSeconds: 3,
});
assert.strictEqual(Object.hasOwn(reply, "audio"), false);

console.log("ok: Bilibili console state and reply record model");
