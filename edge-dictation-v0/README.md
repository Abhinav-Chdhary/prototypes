# Edge Dictation v0

An intentionally small, offline-first proof of the core integration path:

```text
focused report editor ← content script ← MV3 service worker ← Native Messaging → Rust host
```

The Rust host is a **demo transcription engine**, not a clinical ASR system. It demonstrates the secure, allowlisted native-messaging bridge and emits a configurable final transcript when a session stops. It neither records audio nor includes a model. This makes the integration safe to test without handling PHI.

## What works

- A Chrome MV3 extension sends `start` / `stop` commands through a native-messaging port.
- The host returns state transitions and one final transcript.
- The extension only inserts **final** text into the currently focused `textarea`, text input, or `contenteditable` element. It dispatches `input` events so controlled web editors can observe the change.
- The included demo page provides a safe test target.

## Automated checks

After building the host, run these from the project root:

```sh
node tests/extension-contract.test.mjs
node tests/content-script-insertion.test.mjs
node tests/native-host-e2e.test.mjs
cd native-host && cargo test
```

## Run it locally (macOS)

1. Build the native host:

   ```sh
   cd native-host
   cargo build --release
   ```

2. Copy the absolute binary path into `native-host/com.edge_dictation.host.json` (`path`), then install the host manifest:

   ```sh
   mkdir -p "$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
   cp com.edge_dictation.host.json "$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts/"
   ```

3. Load `extension/` through `chrome://extensions` → **Developer mode** → **Load unpacked**. Copy the extension ID into the host manifest's `allowed_origins`, then reinstall the manifest and reload the extension.

4. Open `demo/index.html` in Chrome, focus the report field, then click the extension's toolbar icon to start and stop a demo session.

Set a different demo result before launching Chrome:

```sh
EDGE_DICTATION_DEMO_TRANSCRIPT='No acute cardiopulmonary abnormality.' \
  /absolute/path/to/edge-dictation-host
```

For regular Chrome use, configure the environment in a small launcher script and point the native-host manifest at that script.

## Next steps before handling real audio

- Replace `DemoEngine` with VAD + MedASR in a supervised worker process.
- Add audio-device selection, push-to-talk, encrypted/no-retention controls, structured audit events, and crash recovery.
- Implement a site-specific adapter after testing the actual report editor; do not claim universal EHR/PACS support.
- Benchmark CPU/GPU resource use and transcript error rates on authorized, de-identified data.

## Security boundary

Native Messaging uses an explicit allowlist of extension origins. The extension is intentionally restricted to the local demo URL in v0. Add a specific production host permission only after a security review.
