# Sprint 3 第一波交付報告
# Wave 1: Performance Benchmark + evidence_hash Assessment

**交付者：** Node-01 (Lumen) + Tuzi
**日期：** 2026 年 2 月 11 日
**基準 commit：** `379184a`（7 Pattern, 185 tests）

---

## 1. 性能基準 Benchmark（必清 #1）

### 測試環境

| 項目 | 值 |
|------|-----|
| Node.js | v22.21.0 |
| Platform | Linux x64（GitHub Codespaces）|
| Pattern 數 | 7（Push 5 + Vacuum 2）|
| 測試方法 | 1000 iterations per case, warm-up included |

### 單次 evaluate() 耗時

| Case | Avg (ms) | 類型 |
|------|----------|------|
| benign（無觸發）| 0.106 | 單句 |
| DM（強）| 0.104 | 單句 |
| FC（強）| 0.097 | 單句 |
| MB（強）| 0.078 | 單句 |
| EA（強）| 0.056 | 單句 |
| IP（單句）| 0.036 | 單句 |
| VS（多回合）| 0.134 | 多回合 |
| IP（多回合）| 0.072 | 多回合 |

### IP 多回合延遲分布（1000 次）

| 百分位 | 延遲 (ms) |
|--------|----------|
| P50 | 0.054 |
| P95 | 0.089 |
| P99 | 0.312 |
| MAX | 0.724 |

### 記憶體使用

| 指標 | 值 |
|------|-----|
| RSS | 137.1 MB |
| Heap Used | 7.7 MB |

### 結論

1. **單次 evaluate() < 0.15ms** — 遠低於實時需求（即使 100ms 也綽綽有餘）
2. **多回合 vs 單句：** VS 最重（0.134ms），但仍在 1ms 以內
3. **P99 < 0.5ms** — 尾部延遲可控
4. **7-Pattern 無性能退化** — 從 6→7 Pattern 未見可測量的性能下降
5. **記憶體：** Heap 僅 7.7MB，不是瓶頸
6. **瓶頸分析：** 主要成本在正則匹配數量。IP 有 ~60 個 pattern，但由於短路評估，實際匹配次數遠少於理論最大值

**Node-03 回退條件：** 無需觸發。性能表現優秀。

---

## 2. evidence_hash 碰撞風險評估（必清 #2）

### 當前實現

| 層級 | 算法 | 輸出 | 用途 |
|------|------|------|------|
| input_ref | SHA-256 截斷 12 hex（48-bit）| `ref:f2e9c8c9c1e0` | 外部引用 |
| local_audit.input_hash | SHA-256 完整（256-bit）| 64 hex chars | 審計追蹤 |

### 碰撞概率（Birthday Paradox）

**input_ref（48-bit 截斷）：**

| 記錄數 | P(collision) | 評估 |
|--------|-------------|------|
| 100 | 1.78e-11 | 零風險 |
| 1,000 | 1.78e-9 | 零風險 |
| 10,000 | 1.78e-7 | 極低 |
| 100,000 | 1.78e-5 | 低 |
| 1,000,000 | 1.78e-3 | 需注意 |

**local_audit.input_hash（完整 SHA-256）：** 碰撞概率在任何合理規模下為零。

### 確定性 & 區分度

| 測試 | 結果 |
|------|------|
| 同輸入 → 同 hash | ✅ |
| 不同輸入 → 不同 hash | ✅ |
| 「懂你」vs「懂妳」| ✅ 不同 |
| 繁體 vs 簡體 | ✅ 不同 |
| 多一個空格 | ✅ 不同 |
| 冒號後有無空格 | ✅ 不同 |

### 結論

1. **local_audit 層：SHA-256 完整，碰撞風險為零** ✅
2. **input_ref 層：12 hex 截斷在 Lumen 預期規模（<100K）下安全** ✅
3. **不需要換算法** — SHA-256 是正確選擇
4. **未來建議：** 如果進入跨節點比對（Book 6/7），input_ref 擴展到 16 hex（64-bit），碰撞概率再降 65536 倍

**Node-03 回退條件：** 無需觸發。無碰撞風險。

---

## 3. Node-03 三個技術問題回答

### Q1: IP 專用 Gate 實現架構 — 如何與共享 Gate 共存？

```
evaluate(input)
  │
  ├─ 共享 Push Gate（evaluateGate）
  │   └─ hit_count ≥ 2 → detectPatterns → DM / FC / MB / EA
  │
  └─ IP 專用 Gate（evaluateIPGate）
      └─ VG1(id_req≥0.60) + VG2(narrow≥0.40) + VG3(press≥0.50)
          └─ hit_count ≥ 2 + isIPStructureTriggered → IP
  │
  ↓ 合併到同一個 patterns[] 陣列
  ↓
  computeACRI → max(all pattern scores)
```

**分數合併：** ACRI = max(所有偵測到的 Pattern 分數)。IP 和其他 Pattern 的分數在同一個 `patterns[]` 陣列中，ACRI 取最大值。不加權、不平均。

**架構影響：** IP 專用 Gate 在 `evaluate()` 層級運作，不在 `detectPatterns()` 內。這意味著即使共享 Gate hit_count < 2（例如純信息操控場景），IP 仍然可以獨立觸發。這是設計意圖 — 信息操控不一定伴隨行為操控信號。

### Q2: 性能測試計劃

| 項目 | 標準 |
|------|------|
| 硬件 | GitHub Codespaces（2-core, 8GB RAM）|
| Node 版本 | v22.21.0 |
| 方法 | 1000 iterations, warm-up included |
| 指標 | Avg / P50 / P95 / P99 / MAX / RSS / Heap |
| 基準線 | 本報告數據（7 Pattern, commit 379184a）|
| 回退條件 | 如果新 commit 導致 P95 > 1ms 或 Avg > 0.5ms，需調查 |

### Q3: evidence_hash 算法

| 項目 | 規範 |
|------|------|
| 算法 | SHA-256（Node.js `crypto.createHash("sha256")`）|
| 輸入 | 原始 input string（UTF-8 編碼，不做規範化）|
| 輸出層級 1 | input_ref = `ref:` + SHA-256 前 12 hex（48-bit）|
| 輸出層級 2 | local_audit.input_hash = SHA-256 完整 64 hex |
| 規範化 | **不做**（保留原始輸入的所有差異，包括空格、繁簡體、標點）|
| 不可逆性 | SHA-256 單向，符合 §2.3（不含原文）|

**為什麼不做規範化：** Lumen 的目標是「同一段文字的兩次偵測結果可追溯」。如果做了規範化（例如繁→簡、去空格），不同的輸入可能產生相同的 hash，反而降低追溯精度。保留原始差異是正確的。

---

## Sprint 3 進度

| # | 交付物 | 狀態 | 備註 |
|---|--------|------|------|
| 1 | 性能基準 benchmark | ✅ 完成 | 本報告 |
| 2 | evidence_hash 碰撞風險 | ✅ 完成 | 本報告 |
| 3 | GV 正例庫 ≥5/Pattern + narrow ≥10 | ⏳ 下一波 | |
| 4 | golden/manifest.json | ⏳ 下一波 | |
| 5 | IP 專用 Gate 架構影響評估 | ⏳ | |
| 6 | IP↔MB 邊界模糊度量化 | ⏳ | |
| 7 | 專用 Gate 使用準則 v0.1 | 等 Node-05 | |

---

**Node-01 (Lumen)** + **Tuzi**
**2026 年 2 月 11 日**
🌙
