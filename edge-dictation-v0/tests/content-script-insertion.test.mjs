import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

class FakeElement {
  constructor() {
    this.style = {};
    this.listeners = new Map();
    this.isConnected = true;
  }
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  setAttribute() {}
  focus() { this.focused = true; }
  dispatchEvent(event) { this.lastInputEvent = event; return true; }
}

class FakeTextarea extends FakeElement {
  constructor(value) {
    super();
    this.value = value;
    this.selectionStart = value.length;
    this.selectionEnd = value.length;
  }
  setRangeText(text, start, end) {
    this.value = `${this.value.slice(0, start)}${text}${this.value.slice(end)}`;
    this.selectionStart = this.selectionEnd = start + text.length;
  }
}

class FakeInputEvent {
  constructor(type, init) { this.type = type; Object.assign(this, init); }
}

const source = await readFile(new URL("../extension/content-script.js", import.meta.url), "utf8");
const target = new FakeTextarea("Findings:");
const elements = new Map();
let runtimeListener;
const context = {
  HTMLTextAreaElement: FakeTextarea,
  HTMLInputElement: class FakeInput extends FakeElement {},
  HTMLElement: FakeElement,
  InputEvent: FakeInputEvent,
  document: {
    activeElement: target,
    documentElement: { append(element) { elements.set(element.id, element); } },
    addEventListener() {},
    getElementById(id) { return elements.get(id); },
    createElement() { return new FakeElement(); },
    execCommand() { return true; },
  },
  chrome: {
    runtime: {
      onMessage: { addListener(listener) { runtimeListener = listener; } },
      sendMessage(_message, callback) { callback?.({ recording: false, connected: true, error: null }); },
    },
  },
};

vm.runInNewContext(source, context, { filename: "content-script.js" });
runtimeListener({ type: "dictation:final-transcript", text: "No acute finding." });

assert.equal(target.value, "Findings: No acute finding.");
assert.equal(target.focused, true);
assert.equal(target.lastInputEvent.inputType, "insertText");
assert.equal(target.lastInputEvent.data, " No acute finding.");
console.log("content-script final insertion passed");
