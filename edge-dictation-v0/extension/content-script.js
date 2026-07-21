(() => {
const INDICATOR_ID = "edge-dictation-status";
let lastEditable = null;

function isEditable(node) {
  return node instanceof HTMLTextAreaElement ||
    (node instanceof HTMLInputElement && /^(text|search|url|email|tel)$/i.test(node.type)) ||
    (node instanceof HTMLElement && node.isContentEditable);
}

function rememberEditable(event) {
  if (isEditable(event.target)) lastEditable = event.target;
}

document.addEventListener("focusin", rememberEditable, true);
document.addEventListener("pointerdown", rememberEditable, true);

function indicator() {
  let element = document.getElementById(INDICATOR_ID);
  if (element) return element;
  element = document.createElement("button");
  element.id = INDICATOR_ID;
  element.type = "button";
  element.title = "Toggle local dictation";
  element.setAttribute("aria-live", "polite");
  Object.assign(element.style, {
    all: "initial", position: "fixed", right: "16px", bottom: "16px", zIndex: "2147483647",
    boxSizing: "border-box", padding: "8px 12px", borderRadius: "999px", border: "1px solid #94a3b8",
    background: "#ffffff", color: "#0f172a", font: "600 12px/1.2 system-ui, sans-serif",
    boxShadow: "0 2px 10px rgb(15 23 42 / 0.18)", cursor: "pointer"
  });
  element.addEventListener("click", () => chrome.runtime.sendMessage({ type: "dictation:toggle" }));
  document.documentElement.append(element);
  return element;
}

function render(state) {
  const el = indicator();
  if (state.recording) {
    el.textContent = "● Dictating";
    el.style.color = "#b91c1c";
    el.title = "Stop local dictation";
  } else if (!state.connected && state.error) {
    el.textContent = "Dictation unavailable";
    el.style.color = "#92400e";
    el.title = state.error;
  } else {
    el.textContent = "○ Dictation";
    el.style.color = "#0f172a";
    el.title = "Start local dictation";
  }
}

function insertFinalTranscript(text) {
  const target = isEditable(document.activeElement) ? document.activeElement : lastEditable;
  if (!target || !target.isConnected || !text.trim()) return;
  target.focus({ preventScroll: true });
  const spacing = target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement
    ? (target.value && !/\s$/.test(target.value.slice(0, target.selectionStart ?? target.value.length)) ? " " : "")
    : " ";

  if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) {
    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? start;
    target.setRangeText(`${spacing}${text}`, start, end, "end");
    target.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: `${spacing}${text}` }));
    return;
  }
  // execCommand keeps browser-editor undo stacks and framework input handling intact.
  document.execCommand("insertText", false, `${spacing}${text}`);
  target.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: `${spacing}${text}` }));
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "dictation:state") render(message.state);
  if (message?.type === "dictation:final-transcript") insertFinalTranscript(message.text);
});

chrome.runtime.sendMessage({ type: "dictation:state" }, render);
})();
