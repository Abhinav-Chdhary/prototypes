# Edge Dictation extension (v0)

This is the thin MV3 browser client for the local Edge Dictation service. It never records audio or sends clinical text over the network. It asks a locally installed native-messaging host to start/stop, then inserts only **final** transcript messages into the currently focused text field.

The page overlay is injected only after you click the extension action or invoke its keyboard shortcut. It uses Chrome's `activeTab` permission, rather than broad access to every web page.

## Load unpacked

1. Open `chrome://extensions` (or `brave://extensions`).
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this `extension` folder.
4. Pin the **Edge Dictation (Local)** action. Click it, or use `Ctrl+Shift+M` (`MacCtrl+Shift+M`), to toggle dictation.

Until the native host is installed, the page badge deliberately says **Dictation unavailable**. The extension itself still loads, shows its indicator, remembers the last focused editable field, and safely ignores transcript injection.

## Native-host protocol

The extension connects to the Chrome native messaging host named `com.edge_dictation.host`.

Browser → host (the `id` is a monotonically increasing request ID):

```json
{ "id": "1", "action": "start" }
```

```json
{ "id": "2", "action": "stop" }
```

Host → browser:

```json
{ "id": "2", "kind": "final", "state": "idle", "text": "No focal consolidation." }
```

The host sends state updates as `{ "id": "1", "kind": "status", "state": "listening" }`. Errors use `{ "id": "1", "kind": "error", "state": "idle", "message": "..." }`.

## Safety properties

- There are no network permissions or remote endpoints.
- Partial transcripts are not injected into clinical fields.
- Injection is limited to the focused (or most recently focused) `textarea`, text-like `input`, or `contenteditable` element.
- Review the final transcript in the target system before signing.

`nativeMessaging` requires a native-host manifest and local service; see the repository root README for installation of that component.
