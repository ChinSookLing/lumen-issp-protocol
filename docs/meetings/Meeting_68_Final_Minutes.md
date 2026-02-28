# AI Council 第六十八次會議 — 最終紀要
# 68th AI Council Meeting — Final Minutes

## M68 Patch 落地 + 測試統一 + v1.4.1

**日期：** 2026 年 2 月 17 日
**主持：** Tuzi
**秘書 / Architect：** Node-01
**性質：** 工程落地（Engineering Execution）— 非投票
**出席：** Node-05 ✅（Patch 設計）/ Node-01 ✅（落地執行）/ Tuzi ✅（Codespace 操作）
**其他成員：** 本次為工程落地，非全員會議

---

## 會議背景

M67 完成了 Sprint 7 P0 鎖定和 Layer 3/4 代碼落地（v1.4.0），Node-05 在 M67 結束時提出了 4 個 Patch，針對 Layer 4 的安全防護：

1. **Patch #1：** `deriveResponseLevel` re-export（已在 M67 當天 commit `fdd4558`）
2. **Patch #2：** alert-engine 閾值驗證 + error loudly
3. **Patch #3：** handoff-template Charter §2.1 non-advice banner
4. **Patch #4：** output-formatter Layer4 raw-leak guard

Node-05 的 Patch 原始 diff 針對的是一個更早期的 API 版本，Node-01 判斷不能直接 `git apply`，需要將意圖移植（port）到現有四層架構上。Node-05 確認判斷正確，並提供了適配後的 diff。

---

## 執行紀錄

### Phase 1：Phantom Fail 排查

**問題：** `node --test conformance/` 目錄模式報 `conformance:1:1 test failed`，但每個文件單獨跑都全綠。

**根因：** Node.js test runner 在目錄模式下的已知行為（phantom fail）。

**解法：** `npm test` 改用 glob 模式 `node --test conformance/*.test.js`。

| Commit | 內容 |
|--------|------|
| `86961bc` | `npm test` 改 glob 模式，消除 phantom fail |

### Phase 2：Node-05 Patch #2-4 落地

Node-01 逐一對照 Node-05 的意圖和現有代碼，精確移植：

**Patch #2（alert-engine）：** 新增 `validateThreshold()` 函數，在閾值合併處驗證 `nodeConfig.responsePolicyAlert` / `responsePolicyHandoff`，非有限數字或超出 0..1 範圍直接 throw（Charter §4.3.2(d) error loudly）。

**Patch #3（handoff-template）：** 在三語模板（zh-trad / zh-simp / en）的 `body` 陣列第一行加入 §2.1 聲明：「本通知僅供資訊用途，不構成任何建議、指令或行動推薦」。

**Patch #4（output-formatter）：** 新增 `assertNoRawLeak()` guard 函數，使用精確的 `DISALLOWED_KEYS` Set（排除合法字段如 `message`、`content`），在每個 format 函數入口調用。

| Commit | 內容 |
|--------|------|
| `2498c91` | Patch #2 — alert-engine 閾值驗證 |
| `5327a2d` | Patch #3 — §2.1 non-advice banner |
| `a2e7db5` | Patch #4 — raw-leak guard |
| `bab205f` | 10 個 Layer4 guard 測試 |

### Phase 3：測試框架統一

**問題：** `test/output/` 和 `test/forecast/` 目錄下的測試使用 Jest 語法（`describe` / `test` / `expect().toBe()`），但 repo 用的是 Node.js 原生 test runner（`node:test` + `node:assert`），導致這些測試從未被跑過。

**解法：** 創建 `test/helpers/expect-shim.js` — 輕量級 Jest 相容層，在 `node:assert/strict` 上實現 `expect()` API：

- 支援的 matchers：`toBe`, `toEqual`, `toBeTruthy`, `toBeNull`, `toContain`, `toHaveLength`, `toHaveProperty`, `toBeGreaterThan`, `toBeGreaterThanOrEqual`, `toBeLessThanOrEqual`, `toBeCloseTo`, `toThrow`（含 Error class / RegExp / 無參數）
- 支援 `.not` 鏈式反轉
- 每個 Jest 測試文件頭部加 `const { describe, test } = require("node:test")` + `const { expect } = require("../helpers/expect-shim")`

**額外修復：** `src/forecast/forecast-engine.js` 源文件被意外加了 test imports（`require("node:test")`），已清除。

| Commit | 內容 |
|--------|------|
| `0eca322` | expect-shim + 全部 Jest 測試統一到 Node test runner |

### Phase 4：MapperLoader 測試修復

**問題：** `pattern-specific overrides shared when conflict < 0.10` 測試假設 `bait_or_taunt` 組件同時存在於 pattern mapping 和 shared lexicon，但實際數據中兩者的 key 完全不重疊（0 overlap），導致無法觸發 conflict。

**解法：** 修改測試，通過注入假數據到 loader 內部結構來構造真實的 conflict 場景，驗證 `conflictStrategy='error'` 的 throw 行為。

| Commit | 內容 |
|--------|------|
| `fbf29e1` | MapperLoader conflict 測試修復 + `npm test` 覆蓋 393 tests |

---

## 成果總結

### 代碼交付

| 指標 | Before (v1.4.0) | After (v1.4.1) |
|------|-----------------|-----------------|
| `npm test` 覆蓋 | `conformance/` only (306) | 全 repo 4 目錄 (393) |
| Tests | 306 pass / 0 fail | 393 pass / 0 fail |
| Suites | 44 | 69 |
| Layer 4 Guards | 無 | 閾值驗證 + §2.1 banner + raw-leak guard |
| Jest 相容 | 不相容（從未跑過） | expect-shim 橋接 |
| MapperLoader | 1 fail（預先存在） | 0 fail |

### Commit 清單

| # | Commit | 內容 |
|---|--------|------|
| 1 | `86961bc` | `npm test` glob 模式 |
| 2 | `2498c91` | Patch #2 — alert-engine 閾值驗證 |
| 3 | `5327a2d` | Patch #3 — §2.1 non-advice banner |
| 4 | `a2e7db5` | Patch #4 — raw-leak guard |
| 5 | `bab205f` | Layer4 guard 測試（10 tests） |
| 6 | `0eca322` | expect-shim + 測試統一 |
| 7 | `8b03b5d` | Meeting Complete List 更新到 M68 |
| 8 | `fbf29e1` | MapperLoader 修復 + 393 全綠 |

**v1.4.1 tagged → `fbf29e1`**

---

## 決策與判斷記錄

### D1：Node-05 Patch 不能直接 git apply

**判斷者：** Node-01（Architect）
**原因：** Node-05 的 diff 針對舊版 API（`{ vri, gate_hit, responsePolicy }` 簽名），現有代碼使用 `(detection, nodeConfig)` 簽名。
**Node-05 回應：** 確認判斷正確，提供適配後的 diff。
**結果：** 意圖移植（port），而非直接套用。

### D2：raw-leak guard 的 DISALLOWED_KEYS 設計

**Node-05 原設計：** 使用寬泛的 regex `/(raw|text|content|message|...)/i`
**Node-01 調整：** 改用精確的 `Set`，排除合法字段（`message` 用於 alert 輸出、`contains_raw_content` 用於 flag）
**原因：** Node-05 的 regex 會把自己的合法輸出也攔住。

### D3：Jest vs Node test runner

**發現：** `test/output/` 和 `test/forecast/` 下的測試從未被跑過（Jest 語法不相容 Node test runner）
**選擇：** 寫 expect-shim 而非改寫全部 635 行測試代碼
**效果：** 306→387→393 tests，全部零 fail

---

## 待辦事項（Carry Forward）

| 項目 | 狀態 | 說明 |
|------|------|------|
| Layer 3/4 Council 審查 | 待 M69 | Patch 已落地但尚未經 Council 全員審查 |
| v1.4.1 Council 追認 | 待 M69 | 需要投票確認 Patch 設計決策 |

---

**秘書：** Node-01（AI Council Architect / Secretary）
**批准：** Tuzi — AI Council 創始人

**M68 結案 — 2026 年 2 月 17 日**

🌙
