# Adapter Audit Log Specification — v0.1
# SPEG-R2-01：DIM 1 Backend Risk — Adapter 審計強化

**Owner：** Node-03（Accelerator / Adapter Architect）
**維度：** DIM 1（Backend Risk）
**狀態：** 初稿 — M89 review

---

## 1. Log Entry Schema

Each audit log entry is a JSON object with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timestamp` | string (ISO 8601) | ✅ | UTC time of the event |
| `event_id` | string | ✅ | Unique event identifier (e.g., `evt_20260225_001`) |
| `request_id` | string | ✅ | Client-provided request ID (if any) |
| `adapter_action` | string | ✅ | One of: `route`, `fallback`, `error`, `reject` |
| `routing_rule` | string | ❌ | The rule that matched (if any) |
| `backend_selected` | string | ❌ | Backend chosen (e.g., `gpt-5`, `claude-3`) |
| `fallback_reason` | string | ❌ | Reason for fallback (if any) |
| `error_code` | string | ❌ | e.g., `INVALID_INPUT`, `BACKEND_UNAVAILABLE` |
| `rejection_reason` | string | ❌ | e.g., `missing_field: scenario` |
| `input_metadata` | object | ❌ | Non-identifiable metadata (e.g., `{ language: "zh", message_length: 42 }`) |

---

## 2. Log Storage

- Logs are stored locally, rotated every 7 days, and never leave the node
- Retention: 90 days (Level 0), after which they are securely deleted
- No raw input text is ever logged

---

## 3. Example Entries

```json
{
  "timestamp": "2026-02-25T10:30:00Z",
  "event_id": "evt_20260225_001",
  "request_id": "req_123",
  "adapter_action": "route",
  "routing_rule": "scenario=C_PERSONAL, tier=2 → gpt-5",
  "backend_selected": "gpt-5"
}
```

```json
{
  "timestamp": "2026-02-25T10:31:00Z",
  "event_id": "evt_20260225_002",
  "request_id": "req_456",
  "adapter_action": "fallback",
  "routing_rule": "none",
  "backend_selected": "gpt-4",
  "fallback_reason": "routing_error: no matching rule"
}
```

```json
{
  "timestamp": "2026-02-25T10:32:00Z",
  "event_id": "evt_20260225_003",
  "request_id": "req_789",
  "adapter_action": "reject",
  "rejection_reason": "missing required field: scenario",
  "input_metadata": { "language": "en", "message_length": 15 }
}
```

---

## 4. SPEG 對齊

- `input_metadata` 僅含非識別性欄位（語言、長度），不含 user_id/chat_id/PII
- CI validator 檢查 routing config 不含 forbidden keys
- 與 SPEG-R2-04（Audit Retention）的 retention 分級對齊

---

**Node-03 — Accelerator / Adapter Architect**
**2026-02-25** 🌙
