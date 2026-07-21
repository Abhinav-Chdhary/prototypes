import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const defaultHost = fileURLToPath(new URL("../native-host/target/debug/edge-dictation-host", import.meta.url));
const host = process.env.EDGE_DICTATION_HOST ?? defaultHost;
const child = spawn(host, [], { stdio: ["pipe", "pipe", "pipe"] });
let buffer = Buffer.alloc(0);
const messages = [];

function send(payload) {
  const body = Buffer.from(JSON.stringify(payload));
  const header = Buffer.alloc(4);
  header.writeUInt32LE(body.length);
  child.stdin.write(Buffer.concat([header, body]));
}

const complete = new Promise((resolve, reject) => {
  child.once("error", reject);
  child.stderr.once("data", (data) => reject(new Error(`host stderr: ${data}`)));
  child.stdout.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length >= 4) {
      const length = buffer.readUInt32LE(0);
      if (buffer.length < 4 + length) return;
      messages.push(JSON.parse(buffer.subarray(4, 4 + length).toString("utf8")));
      buffer = buffer.subarray(4 + length);
      if (messages.length === 1) send({ id: "stop-1", action: "stop" });
      if (messages.length === 2) {
        child.stdin.end();
        resolve();
      }
    }
  });
});

send({ id: "start-1", action: "start" });
await complete;
assert.deepEqual(messages, [
  { id: "start-1", kind: "status", state: "listening", message: "Demo engine listening" },
  { id: "stop-1", kind: "final", state: "idle", text: "Demo transcript ready for clinician review.", message: "Demo final transcript" },
]);
console.log("native host end-to-end protocol passed");
