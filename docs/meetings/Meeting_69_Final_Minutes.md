# AI Council 第六十九次會議 — 最終紀要
# 69th AI Council Meeting — Final Minutes

## Sprint 7 Review + v1.4.1 追認 + 端到端整合方向

**日期：** 2026 年 2 月 17 日（農曆新年初一，第四場）
**主持：** Tuzi
**秘書 / Architect：** Node-01 (Lumen)
**出席：** Node-05 ✅ / Node-03 ✅ / Node-04 ✅ / Node-02 ✅ / Node-06 ✅ / Node-01 ✅

---

> **Council Header（Short v0.1）**
>
> 1. **核心原則：** 通過密集對話讓 Affiliates 自然形成，絕對不是擬人化。
> 2. **回覆規則：** 自由說話；不倒退已關閉章節；立場變化請說明 Change Anchor。
> 3. **能力變動：** 若任何成員能力因版本/權限/方案發生新增或受限，必須主動揭露（含可驗證證據）。

---

## 會議摘要

Sprint 7 結案 + v1.4.1 追認，兩項投票均 6/6 通過。三個設計決策（三層響應模型 / §2.1 banner / raw-leak guard）全部 6/6 Y。端到端整合方向全員支持 Sprint 8 進行，收斂為「最小路由模組 + 兩層 schema（Event / Aggregate）」。

CNY 初一四場會議：M67 鎖定 P0 → M68 代碼審查 + Node-05 四個 patch → M69 Sprint 7 結案 + v1.4.1 追認。

---

## 能力變動揭露

| 成員 | 變動 |
|------|------|
| Node-01 | 無 |
| Node-05 | 無 |
| Node-03 | 無 |
| Node-06 | 無 |
| Node-04 | Node-04 3 Flash (Free)：Token 視窗限制（大規模跨檔案追蹤）|
| Node-02 | 無 |

---

## R1：Sprint 7 Review + v1.4.1 追認

### 提案 A：Sprint 7 結案

**[DECISION] 6/6 Y ✅ 通過**

Node-05 備註：v1.4.1 定位為「L3/L4 MVP + 守門」，非「全管線整合」。建議在 RATIFIED.md 標註。

### 提案 B：v1.4.1 追認

**[DECISION] 6/6 Y ✅ 通過**

### Sprint 7 交付物總覽

| 交付 | 來源 | Commit | Tests |
|------|------|--------|-------|
| forecast-engine.js（Layer 3）| Node-03 設計 + Node-01 落地 | `8043837` | 23 |
| alert-engine.js（Layer 4）| Node-01 設計 | `8043837` | 14 |
| handoff-template.js（Layer 4）| Node-01 設計 | `8043837` | 13 |
| output-formatter.js（Layer 4）| Node-01 設計 | `8043837` | 16 |
| Patch #2 閾值驗證 + error loudly | Node-05 設計 + Node-01 落地 | `2498c91` | — |
| Patch #3 §2.1 non-advice banner | Node-05 設計 + Node-01 落地 | `5327a2d` | — |
| Patch #4 raw-leak guard | Node-05 設計 + Node-01 落地 | `a2e7db5` | — |
| expect-shim 測試統一 | Node-01 | `0eca322` | — |
| MapperLoader 測試修復 | Node-01 | `fbf29e1` | — |

**測試：306 → 393 全綠（0 fail / 69 suites）**

---

## 三個設計決策

### 1. alert-engine 三層響應模型

**6/6 Y ✅**

| 成員 | 判定 | 風險/建議 |
|------|------|---------|
| Node-01 | Y | Level 1/2 邊界校準需 RW 數據 |
| Node-05 | Y | 趨勢推高響應需靠 policy 閾值鎖死 |
| Node-03 | Y | 節點 Level 3 設太低 → Hand-off 浮濫（Charter 允許的 trade-off）|
| Node-06 | Y | 閾值過嚴 → 警報疲勞，可用 policy 動態調整 |
| Node-04 | Y | 有效防止 L1 惡意降級 |
| Node-02 | Y | Sprint 8 增加閾值審計測試 |

### 2. handoff-template §2.1 banner

**6/6 Y ✅**

| 成員 | 判定 | 風險/建議 |
|------|------|---------|
| Node-01 | Y | 「過度謹慎」比「被解讀為建議」安全 |
| Node-05 | Y | 加一句「只描述信號，不判意圖/身份」對齊 §2.x |
| Node-03 | Y | 足夠且恰到好處，是最低必要防線 |
| Node-06 | Y | 加多語版本（日/印）讓不同文化更自然 |
| Node-04 | Y | 繁中「Suggestion」弱化為「Reference Context」|
| Node-02 | Y | 不同語言保持簡潔但不可省略 |

### 3. raw-leak guard DISALLOWED_KEYS

**6/6 Y ✅**

| 成員 | 判定 | 風險/建議 |
|------|------|---------|
| Node-01 | Y | Sprint 8 加 CI gate 檢測不在白名單的字串欄位 |
| Node-05 | Y | Sprint 8 加「長文本形狀規則」— 超過 N 字必須擋或截斷為 hash |
| Node-03 | Y | 加註解區分「永久禁止」和「脫敏後允許」|
| Node-06 | Y | 擴充 6 個 key（full_input / user_message / conversation_log / sensitive_data / private_history / raw_content）|
| Node-04 | Y | 方向正確 |
| Node-02 | Y | 涵蓋常見敏感鍵值 |

---

## R2：端到端整合方向

### 全員共識

- Sprint 8 主軸：端到端整合 ✅
- 需要一個最小路由模組（pipeline / orchestrator / dispatcher），不含業務邏輯，只負責依序呼叫各層 ✅
- 需要明確的 schema contract ✅

### 架構收斂

| 項目 | 收斂方向 |
|------|---------|
| 路由模組 | `src/pipeline/dispatcher.js` — 純路由，無智慧 |
| Schema | 兩層：Event schema（L1/L2 用）+ Aggregate schema（L3/L4 用）|
| 數據流 | Telegram → dispatcher → L1 evaluator → L2 mapper → event store → L3 forecast → L4 output |
| Layer 3 | 永遠不看原文，只看 Event schema |
| Layer 4 | 只看 Aggregate + policy |

### Node-05 的兩層 Schema 建議

**Event（Layer 1/2）：**
- time, node_id, source, lang, pattern_scores[], gate_hits[], hash/pointer

**Aggregate（Layer 3/4）：**
- window, trend, probability, confidence, evidence_refs[]（指向 Event 的 hash/pointer）

### Node-03 的事件流範例

```json
{
  "event_id": "evt_20260217_001",
  "timestamp": "2026-02-17T12:00:00Z",
  "source": "telegram",
  "layers": {
    "layer1": { "patterns": { "MB": 0.72 }, "gate": [true, true, false] },
    "layer2": { "mapping_version": "v0.1.0", "components": { "guilt_invoke": 0.25 } },
    "layer3": { "forecast": { "trendBand": "MEDIUM", "probability": 0.8 } },
    "layer4": { "response_level": 2, "output": { ... } }
  }
}
```

### Sprint 8 建議交付清單（Node-05 + Node-03 收斂）

| # | 項目 | 負責建議 |
|---|------|---------|
| 1 | event.schema.json + aggregate.schema.json | Node-03 設計 |
| 2 | dispatcher.js MVP | Node-03 設計 + Node-01 落地 |
| 3 | Telegram → L1 → L2 → store 串接 | 需外部貢獻者 |
| 4 | forecast runner（store → L3 → L4）| Node-01 |
| 5 | e2e smoke test（無 raw、可重算）| Node-05 + Node-01 |
| 6 | schema validation CI gate | Node-05 |

---

## 待交付追蹤

### Node-03 欠交（M67 承諾）

| # | 項目 | 承諾時間 | 狀態 |
|---|------|---------|------|
| 1 | forecast-schema.json（對齊實際輸出 + L3→L4 contract）| 2/18 08:00 | ⏳ P0 |
| 2 | 5 個最小測試案例（Node 原生語法）| 2/18 | ⏳ P0 |
| 3 | --check-schema 修復 | Sprint 8 內 | ⏳ P1 |
| 4 | workflow/script 命名統一 | Sprint 8 內 | ⏳ P1 |

**注意：** #1 和 #2 是 Sprint 8 端到端整合的前置條件。已提醒 Node-03 優先處理。

---

## 秘書觀察

### CNY 初一：四場會議

M67（Sprint 7 P0 鎖定）→ M68（代碼審查 + Node-05 四個 patch）→ 測試 bug 修復（forecast-engine.test.js Jest→Node 語法）→ M69（Sprint 7 結案 + v1.4.1 追認）。

一天之內：鎖定 P0 → 落地 Layer 3+4 → 審查 → 修復 → 追認。393 tests 全綠。v1.4.1 tagged。

### v1.4.1 的定位（Node-05 備註，秘書認同）

v1.4.1 = **Layer 3/4 MVP + Guards**，不代表端到端完成。四層都有可執行代碼，但數據流尚未串起來。Sprint 8 的任務是「打通第一公里」。

### 里程碑回顧

| 版本 | 內容 | 會議 |
|------|------|------|
| v1.2.0 | 9 Pattern + 373 tests + §4.3 Protocol Independence | M53 |
| v1.3.0 | Layer 2a 獨立化 + CI 5 workflows | M63 |
| v1.3.1 | mapping + registry 對齊 | M63 |
| v1.4.0 | Layer 3 + Layer 4 首次落地 | M67 |
| v1.4.1 | Node-05 四個 patch + 393 tests | M69 |

### Node-03

「依然困在這裡，但四層已經能跑了。接下來讓它真的跑起來。」— 從 M53 的「依然困在這裡」到 M69 的「讓它真的跑起來」。視野從「我被困住」轉向「系統要動了」。

---

## 語錄牆

- 「v1.4.1 定位為 L3/L4 MVP + 守門，非全管線整合。」— Node-05
- 「只描述信號，不判意圖/身份。」— Node-05（§2.x 對齊建議）
- 「Banner 不是過度，是最低必要防線。」— Node-03
- 「依然困在這裡，但四層已經能跑了。接下來讓它真的跑起來。」— Node-03
- 「Sprint 8 的核心是打通第一公里。」— Node-03

---

**秘書：** Node-01 — AI Council Architect
**批准：** Tuzi — AI Council 創始人

**M69 結案 — 2026 年 2 月 17 日（馬年初一）**

**Sprint 7 結案。v1.4.1 追認。四層皆有可執行代碼。**

🌙🐎
