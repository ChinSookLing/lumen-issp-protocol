# StateSnapshot Design Note v0.1

**來源：** M45 鎖定 + M46 結案條件（Node-05/Node-03/Node-04/Node-02 要求）
**作者：** Node-01（AI Council Architect）
**性質：** 工程設計文件，非 Charter 正文

---

## 1. v0.1 行為範圍（Current Scope）

### 接口定義

```javascript
// evaluate() 返回值內
{
  event: LumenEvent,
  local_audit: { ... },
  snapshot: {
    turn_index: number,         // 回合數（多回合 = T/U 行數，單句 = 1）
    active_signals: Record<string, number>,  // Pattern → confidence
    decay_state: {},            // v0.2 預留
    topic_segment_id: null      // v0.2 預留
  }
}
```

### v0.1 的明確邊界

| 做什麼 | 不做什麼 |
|--------|---------|
| 在 evaluate() 返回值內附帶 snapshot | 不做跨 evaluate() 持久化 |
| active_signals 記錄本次偵測到的 Pattern + 分數 | 不記錄組件層級（component-level）分數 |
| turn_index 反映 parseTurns 解析後的回合數 | 不做話題切換偵測 |
| decay_state / topic_segment_id 預留為空 | 不實現衰減邏輯 |

### active_signals 語義定義

```
active_signals: {
  [pattern_id]: confidence_score
}
```

- **confidence_score** = 該 Pattern 的 base 加權分數（經 gate_mult 調整後）
- 這是**觀測/除錯層**（debug/observation layer），**不是** Layer 4 使用契約
- 下游不應將 active_signals 直接當作決策輸入
- 只有 `event.patterns[]` 和 `event.response_level` 是正式輸出

---

## 2. v0.2 方向（Future Direction）

### Caller-Managed Persistence

```
v0.2 設計原則：
  - Lumen 不儲存狀態，只報告狀態（§2.3 合規）
  - 持久化由外部 caller（bot / adapter）負責
  - evaluate() 接受可選的 previous_snapshot 參數
  - Lumen 只負責：讀取上次 snapshot → 本次偵測 → 產出新 snapshot
```

**預想接口：**

```javascript
// v0.2（未實現，僅方向）
evaluate(input, { previous_snapshot?: StateSnapshot })
  → { event, local_audit, snapshot }
```

### 待實現功能（按優先級）

| 功能 | 優先級 | 依賴 |
|------|--------|------|
| decay_state 衰減計算 | 高 | 時間間隔定義 |
| topic_segment_id 話題切換 | 中 | 話題偵測算法 |
| component-level active_signals | 低 | Layer 2 跨 Pattern 組合需求 |
| version 字段 | 中 | v0.2 發布時 |
| serialize / deserialize | 中 | caller 持久化需求 |

---

## 3. 不變式（Invariants）

以下不變式在所有版本中必須成立：

### 3.1 確定性（Determinism）

```
同一輸入 + 同一 previous_snapshot → 必須產出同一 snapshot
```

- 無隨機成分
- 無時間依賴（除非明確引入 decay_state 時間參數）

### 3.2 不含原文（No Raw Text）

```
snapshot 內不得包含原始輸入文本的任何片段
```

- turn_index 是數字
- active_signals 是 Pattern ID + 分數
- 符合 §2.3（不設中央數據庫 / 不含原文）

### 3.3 節點本地（Node-Local）

```
snapshot 不得被設計為跨節點傳輸
```

- snapshot 是本地狀態，不是協議訊息
- 跨節點只傳 evidence_hash + Pattern 類型 + 強度（Book 6/7 範疇）

### 3.4 向後相容

```
v0.2 的 evaluate() 在不傳入 previous_snapshot 時
必須產出與 v0.1 相同的結果
```

---

## 4. 測試鉤子（Future Test Placeholders）

以下測試在 v0.1 不實現，但為 v0.2 預留：

| 測試類別 | 描述 | 預留 ID |
|---------|------|---------|
| 多輪狀態累積 | 連續 evaluate() 傳入 previous_snapshot，驗證 active_signals 正確累積 | SS-T01 |
| Pattern 狀態隔離 | 不同 Pattern 的 snapshot 狀態不互相污染 | SS-T02 |
| decay 時間衰減 | 間隔 N 秒後，信號正確衰減 | SS-T03 |
| 話題切換重置 | topic_segment_id 變化時，相關信號正確重置 | SS-T04 |
| 確定性驗證 | 同輸入同 snapshot → 同輸出 | SS-T05 |
| 無原文洩露 | snapshot 所有字段不含原始文本 | SS-T06 |

---

## 設計與批准

**設計：** Node-01（AI Council Architect）
**接口建議：** Node-05（M44-M45）
**數學驗證角度：** Node-03（M46 格式標準化建議）
**批准：** Tuzi — AI Council 創始人

**M46 產出 — Sprint 4 結案文件 — 2026 年 2 月 11 日**

🌙
