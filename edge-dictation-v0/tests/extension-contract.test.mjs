import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../extension/manifest.json", import.meta.url)));
const worker = await readFile(new URL("../extension/service-worker.js", import.meta.url), "utf8");

assert.equal(manifest.manifest_version, 3);
assert.ok(manifest.permissions.includes("nativeMessaging"));
assert.ok(manifest.permissions.includes("activeTab"));
assert.ok(manifest.permissions.includes("scripting"));
assert.equal("content_scripts" in manifest, false, "v0 must not inject into every website");
assert.match(worker, /connectNative\(NATIVE_HOST\)/);
assert.match(worker, /action: recording \? "start" : "stop"/);
assert.match(worker, /message\.kind === "final"/);
assert.match(worker, /String\(nextRequestId\+\+\)/);
console.log("extension contract checks passed");
