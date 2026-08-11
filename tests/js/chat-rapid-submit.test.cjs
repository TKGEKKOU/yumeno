const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const nodes = {
  "send-question": {
    classList: { contains: () => false, toggle: () => {} },
    querySelector: () => null,
    setAttribute: () => {},
    disabled: false,
  },
  question: { value: "second message" },
  "question-form": { classList: { toggle: () => {} } },
  "confirm-action": {},
  "cancel-action": {},
};
const sandbox = {
  window: { PL: { modules: {} } },
  console,
  TextDecoder,
  AbortController,
  setTimeout,
  clearTimeout,
  document: { createElement: () => ({}) },
};
vm.createContext(sandbox);
vm.runInContext(
  `
  const state = {
    activePersona: { id: "persona-a" },
    realtimeTurnId: null,
    realtimeExecutionPending: false,
    realtimeSubmissionPending: true,
    realtimePendingQuestion: "second message",
    realtimeAckTimer: null,
    realtimeBusy: false,
    agentRequestPending: true,
    voiceActive: false,
    pendingAction: null,
    realtimeAnswerNode: null,
  };
  const $ = (id) => globalThis.__nodes[id];
  function setText() {}
  function icons() {}
  function updateComposerControls() {}
  function resetPacing() {}
  function resetChatProcess() {}
  function stopVoicePlayback() {}
  function renderConfirmation() {}
  function abortVoiceStream() {}
  function flushPendingVoiceQuestion() {}
  globalThis.__nodes = undefined;
  `,
  sandbox,
);
sandbox.__nodes = nodes;
vm.runInContext(fs.readFileSync("static/js/chat.js", "utf8"), sandbox);

vm.runInContext("globalThis.__sendCalls = 0; sendQuestionText = () => { globalThis.__sendCalls += 1; };", sandbox);
vm.runInContext("submitQuestion({ preventDefault() {} });", sandbox);
assert.strictEqual(sandbox.__sendCalls, 0, "a second submit must be rejected while acknowledgement is pending");

vm.runInContext(
  `
  state.realtimeTurnId = "turn-1";
  state.realtimeSubmissionPending = true;
  state.agentRequestPending = true;
  state.realtimePendingQuestion = "second message";
  handleRealtimeEvent({ type: "error", code: "turn_in_progress", message: "busy" });
  globalThis.__turnAfterBusyError = state.realtimeTurnId;
  `,
  sandbox,
);
assert.strictEqual(
  sandbox.__turnAfterBusyError,
  "turn-1",
  "a rejected extra submit must not detach the UI from the active turn",
);

console.log("ok: rapid chat submits preserve the active turn");
