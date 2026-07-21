const NATIVE_HOST = "com.edge_dictation.host";

let nativePort;
let state = { recording: false, connected: false, error: null };
let dictationTabId = null;
let nextRequestId = 1;

async function saveState() {
  await chrome.storage.session.set({ dictationState: state });
}

async function sendToDictationTab(type, payload = {}) {
  if (!Number.isInteger(dictationTabId)) return;
  await chrome.tabs.sendMessage(dictationTabId, { type, ...payload }).catch(() => undefined);
}

async function ensureContentScript(tabId) {
  if (!Number.isInteger(tabId)) return false;
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content-script.js"] });
    return true;
  } catch (error) {
    state.error = "This page does not permit the dictation overlay.";
    return false;
  }
}

async function publishState() {
  await saveState();
  await sendToDictationTab("dictation:state", { state });
  await chrome.action.setBadgeText({ text: state.recording ? "REC" : "" });
  await chrome.action.setBadgeBackgroundColor({ color: "#b91c1c" });
}

function disconnectNative() {
  if (nativePort) nativePort.disconnect();
  nativePort = undefined;
  state.connected = false;
}

async function connectNative() {
  if (nativePort) return true;
  try {
    nativePort = chrome.runtime.connectNative(NATIVE_HOST);
    nativePort.onMessage.addListener(onNativeMessage);
    nativePort.onDisconnect.addListener(async () => {
      const message = chrome.runtime.lastError?.message;
      nativePort = undefined;
      state.connected = false;
      state.recording = false;
      state.error = message || "Local dictation service disconnected.";
      await publishState();
    });
    state.connected = true;
    state.error = null;
    return true;
  } catch (error) {
    state.connected = false;
    state.error = "Local dictation service is not installed or unavailable.";
    return false;
  }
}

async function onNativeMessage(message) {
  if (!message || typeof message !== "object") return;
  if (message.kind === "status") {
    state = {
      ...state,
      connected: true,
      recording: message.state === "listening",
      error: null,
    };
    await publishState();
    return;
  }
  // Only final output is forwarded to the page. Partial text never touches an EHR field.
  if (message.kind === "final" && typeof message.text === "string") {
    await sendToDictationTab("dictation:final-transcript", { text: message.text });
    state = { ...state, connected: true, recording: false, error: null };
    await publishState();
    return;
  }
  if (message.kind === "error") {
    state.error = message.message || "The local dictation service reported an error.";
    state.recording = false;
    await publishState();
  }
}

async function setRecording(recording, tabId) {
  if (recording) {
    if (!(await ensureContentScript(tabId))) {
      await publishState();
      return state;
    }
    dictationTabId = tabId;
    const connected = await connectNative();
    if (!connected) {
      state.recording = false;
      await publishState();
      return state;
    }
  }
  try {
    nativePort?.postMessage({ id: String(nextRequestId++), action: recording ? "start" : "stop" });
    state.recording = recording;
    state.error = null;
  } catch {
    disconnectNative();
    state.recording = false;
    state.error = "Could not reach the local dictation service.";
  }
  await publishState();
  return state;
}

chrome.action.onClicked.addListener((tab) => setRecording(!state.recording, tab.id));
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-dictation") {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }).then(([tab]) => setRecording(!state.recording, tab?.id));
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "dictation:toggle") {
    setRecording(!state.recording, _sender.tab?.id).then(sendResponse);
    return true;
  }
  if (message?.type === "dictation:state") {
    sendResponse(state);
  }
});

chrome.storage.session.get("dictationState").then(({ dictationState }) => {
  if (dictationState) state = { ...state, ...dictationState, recording: false, connected: false };
  publishState();
});
