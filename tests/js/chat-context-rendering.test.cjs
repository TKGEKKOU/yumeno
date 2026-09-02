const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const sandbox = { window: { PL: { modules: {} } }, console, TextDecoder, AbortController };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("static/js/chat.js", "utf8"), sandbox);
const rendering = sandbox.window.PL.chatRendering;
assert.strictEqual(rendering.stableTaskId({ task_id: 42 }), "42");
assert.strictEqual(rendering.stableTaskId({ taskId: "task-b" }), "task-b");
assert.deepStrictEqual(
  Array.from(rendering.uniqueByStableId([{ id: "a" }, { id: "a" }, { id: "b" }], (item) => item.id), (item) => item.id),
  ["a", "b"],
);
assert.deepStrictEqual(
  Array.from(rendering.normalizedWaitingInputs([
    { kind: "rvc_model", key: "model", label: "选择模型" },
    { kind: "rvc_model", key: "model", label: "选择模型" },
  ]), (item) => item.key),
  ["model"],
);
const result = {
  task_id: "task-rvc-1",
  worker_results: [{ worker: "rvc_worker", task_id: "task-rvc-1" }],
  artifacts: [
    { type: "attachment", file_id: "audio-out", url: "/audio-out.wav" },
    { type: "attachment", file_id: "audio-out", url: "/audio-out.wav" },
  ],
};
assert.strictEqual(rendering.rvcTaskEntries(result).length, 1, "nested task records must collapse by task_id");
assert.strictEqual(rendering.resultAttachmentEntries(result).length, 1, "nested result attachments must collapse by file_id");
console.log("ok: chat context rendering deduplicates tasks, waiting inputs, and result attachments");
