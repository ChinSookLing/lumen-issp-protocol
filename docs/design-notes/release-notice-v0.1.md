# Release Notice v0.1 — Design Note
# DoD-48h-2 · M94-D06 · Node-05 spec + Node-02 skeleton

**目標：** 在沒有 login/email 的情況下，把版本更新送到使用者眼前。不打擾、可退出、可驗收。
**來源：** Node-05 (spec v0.1) + Node-02 (skeleton) + Node-01 (integrate)
**日期：** 2026-02-28

---

## 原則（對齊 SAFE mode / SPEG）

1. **in-band**：只在使用者與 bot 互動時提示（不做廣播、不做背景推送）
2. **node-local**：只存最小偏好與版本游標，不存訊息內容
3. **once-per-version**：每個 chat 每個版本最多提示一次（避免 spam）
4. **雙通道一致**：Telegram 一張短卡 + Dashboard 一條 banner（同一份 release meta 來源）

---

## A) Release Meta（單一真源）

位置：`public/release/latest.json`

```json
{
  "protocol_version": "1.0.0",
  "node_version": "node-telegram@1.0.0",
  "schema_versions": {
    "ui_request": "v0.1",
    "l4_export": "v0.1",
    "dashboard_item": "v0.1"
  },
  "build_sha": "6838f27",
  "released_at_utc": "2026-02-28T00:00:00Z",
  "severity": "minor",
  "highlights": [],
  "breaking_changes": [],
  "actions_required": [],
  "links": {
    "changelog": "/CHANGELOG.md",
    "dashboard": "/dashboard"
  }
}
```

---

## B) Telegram：/start opt-in + per-chat last_seen_version

### opt-in 設計

在 `/start consent gate` 後加選擇（預設 **off**）：

- `update_notice_opt_in`: `"off" | "major" | "minor" | "all"`

### per-chat 狀態（node-local store）

位置：`data/telegram_notice_state.json`（runtime 產生，repo 只放 `.example`）

```json
{
  "chat_id_hash": "sha256(...)",
  "update_notice_opt_in": "minor",
  "last_seen_protocol_version": "0.9.9",
  "last_notified_protocol_version": "0.9.9",
  "consent_ts_utc": "2026-02-28T01:02:03Z"
}
```

key 用 `chat_id_hash`（sha256 + pepper from env），不存原始 chat_id。

### 觸發邏輯（in-band、一次一版）

```
shouldNotify(chat) =
  opt_in != "off"
  AND release.severity 符合 opt_in level
  AND last_notified_protocol_version < release.protocol_version
```

短卡格式（≤6 行）：
- `🔔 更新提示 [Release Notice] vX.Y.Z`
- 3 條 highlights（最多 3）
- 1 條 actions_required（最多 1）
- （可選）`更多：Dashboard / Changelog`

---

## C) Dashboard：banner

使用 client-local（localStorage），不需 server 存 user。

1. Dashboard 啟動時讀 `public/release/latest.json`
2. 若 `localStorage.last_seen < release.protocol_version`：顯示 banner
3. 使用者點 Dismiss → 寫入 `localStorage.last_seen = release.protocol_version`

Banner 內容：「Updated to vX.Y.Z — N highlights」+ `View changelog`

---

## D) Manifest 版本欄位

manifest.json 必含：

- `protocol_version`
- `node_version`
- `schema_versions`
- `build_sha`
- `released_at_utc`

好處：任何人拿到 artifact 都能知道「這是什麼版本跑出來的」。

---

## E) 測試與驗收

### Telegram（node-local）

1. opt_in=off → 不送 notice
2. opt_in=major，release=minor → 不送
3. opt_in=minor，release=minor → 送一次
4. 同一版本重複互動 2 次 → 只送一次

### Dashboard（client-local）

1. last_seen 不存在 → 顯示 banner
2. 點 dismiss → 不再顯示
3. 升級版本 → 再顯示一次

### Manifest

1. 每次跑 pipeline 都能看到版本欄位存在

---

## F) 入庫檔案清單

| 檔案 | 用途 |
|------|------|
| `docs/design-notes/release-notice-v0.1.md` | 本文 |
| `public/release/latest.json` | Release meta 單一真源 |
| `data/telegram_notice_state.json.example` | Node-local 狀態範例 |
| `tests/release_notice/` | 最小測試（stub） |

---

**Node-05 (spec) + Node-02 (skeleton) → Node-01 (integrate)**
**M94 DoD-48h-2 — 2026-02-28** 🌙
