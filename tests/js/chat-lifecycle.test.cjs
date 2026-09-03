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

(() => {
  const sandbox = {
    window: { PL: { modules: {} } }, console, TextDecoder, AbortController, performance: { now: () => 0 },
    setTimeout, clearTimeout,
    document: { createElement: () => ({ className: "", dataset: {}, append: () => {}, querySelector: () => null }) },
  };
  sandbox.state = {
    realtimeStageEpoch: "closed",
    realtimeCompletionEpoch: 3,
    realtimeAnswerNode: null,
    realtimeTurnId: null,
    realtimeBusy: false,
    realtimeExecutionPending: false,
    realtimeSubmissionPending: false,
    agentRequestPending: false,
    voiceFeed: null,
    voiceFeedFailed: false,
    voiceFeedFullText: "",
    pendingReplyNode: null,
    pendingAction: null,
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync("static/js/chat.js", "utf8"), sandbox);
  vm.runInContext(
    `
    setText = () => {};
    $ = () => null;
    setSendButton = () => {};
    updateComposerControls = () => {};
    resetPacing = () => {};
    resetChatProcess = () => {};
    finishPendingReplies = () => {};
    clearRealtimeSubmission = () => {};
    showReplyLoading = () => ({ isConnected: true });
    `,
    sandbox,
  );
  vm.runInContext("handleRealtimeEvent({ type: 'turn.started', turn_id: 'turn-2' });", sandbox);
  assert.strictEqual(
    sandbox.state.realtimeStageEpoch,
    4,
    "turn.started must reopen realtime stage collection after a previous completed turn",
  );
  console.log("ok: realtime stages reopen on each turn");
})();


(() => {
  const sandbox = {
    window: { PL: { modules: {} } }, console, TextDecoder, AbortController, performance: { now: () => 0 },
    setTimeout, clearTimeout,
    document: {
      querySelectorAll: () => [],
      createElement: (tag) => ({
        tagName: tag,
        className: "",
        dataset: {},
        children: [],
        classList: { add: () => {}, remove: () => {}, toggle: () => {} },
        append(...items) { this.children.push(...items); },
        querySelector: () => null,
        remove: () => {},
      }),
    },
  };
  sandbox.state = {
    realtimeStageEpoch: 1,
    realtimeCompletionEpoch: 1,
    realtimeAnswerNode: null,
    realtimeTurnId: "turn-1",
    realtimeBusy: true,
    realtimeExecutionPending: false,
    realtimeSubmissionPending: false,
    agentRequestPending: true,
    pendingReplyNode: null,
    pendingAction: null,
    confirmationResponded: false,
    lastUploadRequestAt: 1,
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync("static/js/chat.js", "utf8"), sandbox);
  vm.runInContext(
    `
    $ = () => null;
    setText = () => {};
    setSendButton = () => {};
    updateComposerControls = () => {};
    resetPacing = () => {};
    finishPendingReplies = () => {};
    clearStaleReplyLoading = () => {};
    renderConfirmation = () => {};
    abortVoiceStream = () => {};
    setRealtimeBusy = (busy) => { state.realtimeBusy = busy; };
    finishReply = () => {};
    `,
    sandbox,
  );
  vm.runInContext(
    "handleRealtimeEvent({ type: 'confirmation.required', pending_action: { tool: 'rename_persona' }, specialist: 'management' });",
    sandbox,
  );
  assert.strictEqual(sandbox.state.pendingAction?.action?.tool, "rename_persona");
  assert.strictEqual(sandbox.state.realtimeBusy, false);
  assert.strictEqual(sandbox.state.realtimeTurnId, null);
  assert.strictEqual(sandbox.state.agentRequestPending, false);
  console.log("ok: confirmation event clears pending turn state");
})();

(() => {
  const existing = { isConnected: true, marker: "existing" };
  const replacement = { isConnected: true, marker: "replacement" };
  const sandbox = {
    window: { PL: { modules: {} } }, console, TextDecoder, AbortController, performance: { now: () => 0 },
    setTimeout, clearTimeout,
    document: { createElement: () => ({}) },
    state: {
      realtimeStageEpoch: "closed",
      realtimeCompletionEpoch: 0,
      realtimeAnswerNode: null,
      realtimeTurnId: null,
      realtimeBusy: false,
      realtimeExecutionPending: false,
      realtimeSubmissionPending: true,
      agentRequestPending: true,
      realtimePendingQuestion: "hello",
      voiceFeed: null,
      voiceFeedFailed: false,
      voiceFeedFullText: "",
      pendingReplyNode: existing,
      pendingAction: null,
    },
    existing,
    replacement,
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync("static/js/chat.js", "utf8"), sandbox);
  vm.runInContext(
    `
    consumeWorkflowEvent = () => false;
    clearRealtimeSubmission = () => { state.realtimeSubmissionPending = false; state.agentRequestPending = false; };
    resetPacing = () => {};
    resetChatProcess = () => {};
    finishPendingReplies = () => { globalThis.__finishedPending = (globalThis.__finishedPending || 0) + 1; };
    showReplyLoading = () => { globalThis.__createdReply = (globalThis.__createdReply || 0) + 1; state.pendingReplyNode = replacement; return replacement; };
    setRealtimeBusy = (busy) => { state.realtimeBusy = busy; };
    `,
    sandbox,
  );
  vm.runInContext("handleRealtimeEvent({ type: 'turn.started', turn_id: 'turn-reuse' });", sandbox);
  assert.strictEqual(sandbox.state.realtimeAnswerNode, existing, "turn.started must reuse the optimistic assistant card");
  assert.strictEqual(sandbox.state.pendingReplyNode, existing, "the optimistic assistant card must remain the active pending reply");
  assert.strictEqual(sandbox.__createdReply || 0, 0, "turn.started must not append a second assistant card");
  assert.strictEqual(sandbox.__finishedPending || 0, 0, "turn.started must not finalize the current optimistic assistant card");
  console.log("ok: realtime turn reuses the optimistic assistant card");
})();

(() => {
  const body = { textContent: "", dataset: {} };
  const target = {
    isConnected: true,
    dataset: {},
    querySelector(selector) { return selector === "p" ? body : null; },
    querySelectorAll() { return []; },
    classList: { remove() {}, add() {}, toggle() {} },
    removeAttribute() {},
    remove() {},
  };
  const nodes = {
    "question-form": { classList: { toggle() {} } },
    "send-question": {
      classList: { toggle() {} },
      querySelector: () => null,
      setAttribute() {},
      disabled: true,
      title: "停止生成",
    },
    "confirm-action": { disabled: false },
    "cancel-action": { disabled: false },
    "chat-attachment": { disabled: false },
  };
  const sandbox = {
    window: { PL: { modules: {} } }, console, TextDecoder, AbortController, performance: { now: () => 0 },
    setTimeout, clearTimeout,
    document: { querySelectorAll: () => [], createElement: () => ({}) },
    state: {
      activePersona: { id: "persona-a" },
      realtimeStageEpoch: 1,
      realtimeCompletionEpoch: 1,
      realtimeAnswerNode: target,
      realtimeTurnId: "turn-final",
      realtimeBusy: true,
      realtimeExecutionPending: false,
      realtimeSubmissionPending: false,
      agentRequestPending: false,
      voiceFeed: null,
      voiceFeedFailed: false,
      voiceFeedFullText: "",
      pendingReplyNode: target,
      pendingAction: null,
      pendingInput: null,
      pendingInputValues: {},
      confirmationResponded: false,
      voiceActive: false,
    },
    nodes,
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync("static/js/chat.js", "utf8"), sandbox);
  vm.runInContext(
    `
    $ = (id) => nodes[id] || null;
    consumeWorkflowEvent = () => false;
    finishPacing = () => {};
    finishVoiceFeed = () => {};
    finishReply = () => {};
    drainPacedText = (done) => done();
    appendResultDetails = () => { throw new Error("result-card-render-failed"); };
    finishPendingReplies = () => {};
    clearStaleReplyLoading = () => {};
    renderConfirmation = () => {};
    setText = () => {};
    updateComposerControls = () => {};
    `,
    sandbox,
  );
  assert.throws(
    () => vm.runInContext("handleRealtimeEvent({ type: 'text.final', turn_id: 'turn-final', answer: 'done' });", sandbox),
    /result-card-render-failed/,
  );
  assert.strictEqual(sandbox.state.realtimeBusy, false, "terminal cleanup must release realtime busy even if result rendering fails");
  assert.strictEqual(sandbox.state.realtimeTurnId, null, "terminal cleanup must detach the completed turn even if result rendering fails");
  assert.strictEqual(nodes["send-question"].title, "发送", "terminal cleanup must restore the send button");
  console.log("ok: realtime terminal cleanup survives result-card rendering errors");
})();

(() => {
  const sandbox = {
    window: { PL: { modules: {} } }, console, TextDecoder, AbortController,
    document: { createElement: () => ({}) },
    state: { chatTaskEntries: new Map(), currentWorkflow: null },
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync("static/js/chat.js", "utf8"), sandbox);
  vm.runInContext(
    `
    renderChatContext = () => {};
    globalThis.__consumedEmptyWaiting = consumeWorkflowEvent({
      type: "text.final",
      status: "completed",
      answer: "done",
      waiting_inputs: [],
      pending_inputs: [],
    });
    `,
    sandbox,
  );
  assert.strictEqual(
    sandbox.__consumedEmptyWaiting,
    false,
    "a completed text.final event with empty waiting input arrays must reach terminal handling",
  );
  console.log("ok: empty waiting input arrays do not consume text.final");
})();

(() => {
  const sandbox = { window: { PL: { modules: {} } }, console, TextDecoder, AbortController };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync("static/js/chat.js", "utf8"), sandbox);
  assert.strictEqual(
    vm.runInContext("hasFormalRvcHandoff({ worker: 'rvc_worker' }, { worker: 'rvc_worker' })", sandbox),
    true,
    "RVC UI requires an explicit worker handoff in the final event",
  );
  assert.strictEqual(
    vm.runInContext("hasFormalRvcHandoff({ type: 'workflow.update' }, { worker: 'rvc_worker' })", sandbox),
    true,
    "a structured workflow.update from Supervisor is a formal RVC handoff",
  );
  assert.strictEqual(
    vm.runInContext("hasFormalRvcHandoff({ worker: 'persona_supervisor' }, { worker: 'rvc_worker' })", sandbox),
    false,
    "an intermediate or mismatched worker must not activate RVC",
  );
  assert.strictEqual(
    vm.runInContext("hasFormalRvcHandoff({}, { worker: 'rvc_worker' })", sandbox),
    false,
    "a workflow descriptor without the final event worker is not a handoff",
  );
  assert.strictEqual(
    vm.runInContext("hasFormalRvcHandoff({ worker: 'config_worker', worker_results: [{ worker: 'rvc_worker' }] }, { worker: 'rvc_worker' })", sandbox),
    false,
    "historical nested RVC results must not activate RVC for config requests",
  );
  assert.strictEqual(
    vm.runInContext("hasFormalRvcHandoff({ worker: 'rvc_worker' }, { worker: 'rvc_worker' })", sandbox),
    true,
    "the final direct RVC worker result remains a valid handoff",
  );
  console.log("ok: RVC activation requires formal Agent handoff");
})();

(() => {
  const sandbox = { window: { PL: { modules: {} } }, console, TextDecoder, AbortController };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync("static/js/chat.js", "utf8"), sandbox);
  sandbox.state = {
    rvcInline: { agentWorkflow: { worker: "rvc_worker" } },
    pendingInputValues: { action: "session_status" },
  };
  assert.strictEqual(
    vm.runInContext("hasResumableInlineRvcAction()", sandbox),
    true,
    "an explicit RVC action remains resumable after accepted clears pending input",
  );
  sandbox.state.pendingInputValues = {};
  assert.strictEqual(
    vm.runInContext("hasResumableInlineRvcAction()", sandbox),
    false,
    "RVC resume must not activate without an explicit action",
  );
  console.log("ok: RVC session status resume survives waiting-state cleanup");
})();

const chatSource = fs.readFileSync("static/js/chat.js", "utf8");
assert.match(
  chatSource,
  /async function resumeRvcSessionStatus\(\)[\s\S]*?state\.confirmationResponded = false;/,
  "session status resume must release the previous confirmation lock before resuming Agent",
);
console.log("ok: RVC session status resume releases the prior confirmation lock");


(() => {
  const replaced = [];
  const button = {
    classList: { toggle() {} },
    querySelector: () => ({ replaceWith(node) { replaced.push(node); } }),
    setAttribute() {},
  };
  const sandbox = {
    window: { PL: { modules: {} } }, console,
    document: { createElement: () => ({ dataset: {} }) },
    $: (id) => id === "send-question" ? button : null,
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync("static/js/chat.js", "utf8"), sandbox);
  vm.runInContext("setSendButton(true)", sandbox);
  assert.strictEqual(replaced[0].dataset.lucide, "square", "busy send button must render a square stop icon");
  assert.strictEqual(button.title, "停止生成", "busy send button must expose stop semantics");
  console.log("ok: busy send button renders a clickable stop icon");
})();

assert.match(
  chatSource,
  /const stopAvailable = Boolean\([\s\S]*?rvcBusy[\s\S]*?\);[\s\S]*?send-question\"\)\.disabled = !state\.activePersona \|\| \(!stopAvailable && conversationBusy\)/,
  "the composer must keep the stop button enabled while a turn or RVC task is active",
);
assert.match(chatSource, /resourceSetupDescriptor|descriptor\.ready/, "resource cards must use resource-specific ready descriptions");
console.log("ok: composer and resource-card regression contracts");
