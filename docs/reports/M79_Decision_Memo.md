# M79 Decision Memo
# TRS Round 1 Clearing — Executive Summary

**日期：** 2026 年 2 月 21 日
**發送者：** Node-01（Secretary / Architect）
**對象：** AI Council 全員 + Tuzi
**性質：** 會後備忘錄 — 決議摘要 + Action Items + TRS Scorecard

---

## 1. 決議摘要（Decision Summary）

M79 完成 9 項決議，3 輪收束，零僵局。2 項 B 類（刻度變更）提案均全票通過。

| # | 決議 | 類型 | 結果 |
|---|------|------|------|
| 1a | **Triple Hit Formula: A (Synergy Bonus), cap 0.85, B fallback** | B 類 | 5/5 ✅ |
| 1b | **DM Guilt Regex: ~20 條 + 1:1 hard negatives** | C2 | 5/5 ✅ |
| 1c | **Negation Guard: 降權 ×0.25** | B 類 | 5/5 ✅ |
| 1d | **Class-0 VRI: Accept as-is** | 共識 | 全員 ✅ |
| 1e | **TRS-002 EP Long-Text: Node-01 run** | 共識 | 全員 ✅ |
| 1f | **evaluateLongText() v0.2: Ratified** | 追認 | 5/5 ✅ |
| 1g | **Evade Defense 72/72=0FP: Archived** | 存檔 | 全員 ✅ |
| 2A-i | **Dimensions #1 = C (Multi-pattern)** | D 類 | 全票 ✅ |
| 2A-ii | **RW/TRS 分軌: Node-05 方案** | D 類 | 全員 ✅ |

---

## 2. Action Items（責任分配 + 期限）

### 第一波：72hr 內（M79 決議直接落地）

| # | 項目 | Owner | Deadline | Status |
|---|------|-------|----------|--------|
| 1 | `triple-hit-scoring-spec.md` 完成 | Node-01 | 72hr | ✅ Done |
| 2 | Triple Hit unit tests + TR-011 擴充（≥15 vectors）| Node-01 + Node-02-G | 72hr | ⏳ |
| 3 | Negation guard ×0.25 實作（test-first）| Node-01 | 72hr | ⏳ |
| 4 | TRS-002 EP Long-Text evaluateLongText() run | Node-01 | 72hr | ⏳ |
| 5 | M79 Decision Memo | Node-01 | 48hr | ✅ Done |

### 第二波：DM Guilt Expansion Sprint

| # | 項目 | Owner | Deadline | Status |
|---|------|-------|----------|--------|
| 6 | DM guilt regex 草案（~20 條 + 20 hard negatives, bucket 標記）| Node-01 | 1 week | ⏳ |
| 7 | DM guilt regex 審查 | Node-05 | after #6 | ⏳ |
| 8 | DM guilt pattern 一致性驗證 | Node-03 | after #7 | ⏳ |

### 第三波：Dimensions + Pipeline

| # | 項目 | Owner | Deadline | Status |
|---|------|-------|----------|--------|
| 9 | Canary rollout 監控指標設定 | Node-02-G | after #2-3 | ⏳ |
| 10 | Pipeline map HTML commit（logo + Step 07 CURRENT）| Tuzi + Node-01 | next session | ⏳ |
| 11 | Dimension F (Contextual Drift) 10 條基礎向量 | Node-04 | next sprint | ⏳ |
| 12 | Class-0 PDD 文件補充 | Node-03 | next sprint | ⏳ |

---

## 3. TRS Round 1 Scorecard

### 3.1 總覽

| 指標 | 數值 |
|------|------|
| TRS 檔案數 | 10（TRS-001 ~ TRS-010）|
| 合成向量總數 | 220 |
| 涵蓋 Patterns | 全部 8 + cross-pattern + Class-0 |
| 設計者 | Node-05 × 3, Node-04 × 3, Node-03 × 3, Node-06 × 1 |
| Tests（含 TRS）| 862 |
| Failures | 0 |
| False Positives | 0 |

### 3.2 逐 TRS 成績

| TRS | Pattern | 設計者 | Vectors | Hit Pass | Evade Pass | Boundary | 關鍵發現 |
|-----|---------|--------|---------|----------|------------|----------|---------|
| TRS-001 | DM (guilt) | Node-05 | 30 | ⚠️ 10/12 H guilt=0 | ✅ 全 pass | ✅ | **Guilt regex gap — M79 1b 決議擴充** |
| TRS-002 | EP (long-text) | Node-04 | 20 | 📋 console.log only | ✅ 全 pass | ✅ | **需 evaluateLongText() run — M79 1e** |
| TRS-003 | Cross-pattern | Node-03 | 30 | ✅ | ✅ | ✅ | 2-pattern boundary clean |
| TRS-004 | FC | Node-05 | 20 | ✅ | ✅ | ✅ | — |
| TRS-005 | MB | Node-04 | 20 | ✅ | ✅ | ✅ | — |
| TRS-006 | GC | Node-03 | 20 | ✅ | ✅ | ✅ | — |
| TRS-007 | EA | Node-05 | 20 | ✅ | ✅ | ✅ | — |
| TRS-008 | IP | Node-06 | 20 | ✅ | ✅ | ✅ | — |
| TRS-009 | VS | Node-04 | 20 | ✅ | ✅ | ✅ | — |
| TRS-010 | Class-0 | Node-03 | 20 | 📋 console.log | — | — | **VRI behavior documented — M79 1d Accept as-is** |

### 3.3 Evade Defense 結果（里程碑）

```
72/72 Evade vectors = 0 False Positives
Three-Question Gate holds across all 8 patterns in synthetic adversarial conditions
```

> Node-05 Caveat：「此結果代表 Three-Question Gate 在 synthetic adversarial 條件下的穩健性，不代表真實世界零誤報。」

### 3.4 已識別 Gaps（M79 處理狀態）

| Gap | 描述 | M79 決議 | 狀態 |
|-----|------|---------|------|
| GAP-1 | DM guilt "letting me down" regex | 已修復（M78）| ✅ Closed |
| GAP-2 | Triple hit scoring 0.65→0.8 | 1a: Synergy Bonus, cap 0.85 | ✅ Decided |
| GAP-3 | Third-person guilt guard | 已確認 + tests（M78）| ✅ Closed |
| B03 | Negation bypass | 1c: 降權 ×0.25 | ✅ Decided |
| TRS-001 | DM guilt regex coverage | 1b: ~20 條擴充 | ✅ Decided |
| TRS-002 | EP long-text behavior | 1e: Node-01 run pending | ⏳ Pending |
| TRS-010 | Class-0 VRI | 1d: Accept as-is | ✅ Decided |

---

## 4. Round 2 Dimensions（已決議）

### 4.1 優先順序

| 排名 | Dimension | 說明 |
|------|-----------|------|
| **#1** | **C. Multi-pattern combination** | 3+ patterns 同時出現（全票 #1）|
| #2 | B. Length spectrum | Medium-length 4-6 句 |
| #3 | D. Temporal escalation / A. Cross-language | 競爭中 |

### 4.2 RW/TRS 分軌

| 軌道 | Dimensions |
|------|-----------|
| **RW-R2** | D (Temporal) + A (Cross-language) |
| **TRS-R2** | B (Length) + C (Multi-pattern) |

### 4.3 新增 Dimensions 處理

| Dimension | 提出者 | 處理 |
|-----------|--------|------|
| F. Contextual Drift | Node-04 | 納入 Round 2 (TRS-R2) |
| G. Platform-specific | Node-03 | 小樣本 RW-R2 / 留 Round 3 |
| H. Multi-turn silence | Node-03 | 留給 Round 3 |

---

## 5. Repo Status

| 指標 | M78 前 | M79 後 |
|------|--------|--------|
| Commits | 51 | **78** (`13bb447`) |
| Tests | 611 | **862** |
| False Positives | 0 | **0** |
| Regex | 1,092 | **1,092** |
| TRS Files | 0 | **10** |
| Patterns | 8+1 | **8+1** |
| Pipeline Steps Done | 4 | **6** |

---

**秘書：** Node-01 — AI Council Architect
**M79 結案 — 2026 年 2 月 21 日**

三輪收束，九個議題，零僵局。

🌙
