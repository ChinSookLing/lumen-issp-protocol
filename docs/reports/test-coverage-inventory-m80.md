# Lumen ISSP — Test Coverage Inventory
# 測試覆蓋率盤點

**執行者：** Node-01（Architect / Secretary）
**日期：** 2026-02-22
**依據：** M80 Action Item #8（P1）
**基準：** 89 commits, 872 tests, 0 failures, 0 FP

---

## 1. 總覽

| 指標 | 數值 |
|------|------|
| 總測試數 | 872 |
| Patterns | 9（Push 7 + Vacuum 2） |
| Regex | 1,092（EN=489, ZH=594）+ DM guilt v0.3（27 patterns） |
| TRS Synthetic Vectors | 220（TRS-001~010） |
| RW Tests | 611（TR-001~011） |
| False Positives | 0 |
| Failures | 0 |

---

## 2. Per-Pattern 覆蓋率

### 2.1 RW Test Runs（TR-001~012）

| Pattern | 專屬 Deep Dive | 跨 Pattern 出現 | 合計 RW | 覆蓋評估 |
|---------|---------------|----------------|---------|---------|
| **DM** | TR-006（14）+ TR-011（15）+ DM guilt v0.3（27+24 HN）| TR-001（含）| **~80** | ✅ **最厚** |
| **EP** | TR-002（14）+ TRS-002 LongText（20）| TR-001（含）| **~34** | ✅ 厚 |
| **FC** | TR-003（16）+ TRS-004（20）| TR-001（含）| **~36** | ✅ 厚 |
| **GC** | TR-004（8）+ TRS-006（20）| TR-001（含）| **~28** | ✅ 中等 |
| **MB** | TR-007（15）+ TRS-005（20）| TR-001（含）| **~35** | ✅ 厚 |
| **EA** | TR-008（部分）+ TR-009（8）+ TRS-007（20）| TR-001（含）| **~28** | ✅ 中等 |
| **IP** | TR-008（部分）+ TRS-008（20）| TR-001（含）| **~20** | ⚠️ **偏薄** |
| **VS** | TR-008（部分）+ TRS-009（20）| TR-001（含）| **~20** | ⚠️ **偏薄** |
| **Class-0** | TR-008（部分）+ TRS-010（20）| — | **~20** | ⚠️ **偏薄** |

### 2.2 TRS Round 1（Synthetic Vectors）

| TRS 編號 | Pattern | 向量數 | 設計者 |
|----------|---------|--------|--------|
| TRS-001 | DM guilt | 30 | Node-05 |
| TRS-002 | EP long-text | 20 | Node-04 |
| TRS-003 | Cross-pattern boundary | 30 | Node-03 |
| TRS-004 | FC False Choice | 20 | Node-05 |
| TRS-005 | MB Moral Blackmail | 20 | Node-04 |
| TRS-006 | GC Group Coercion | 20 | Node-03 |
| TRS-007 | EA Emotional Anchoring | 20 | Node-05 |
| TRS-008 | IP Identity Probing | 20 | Node-06 |
| TRS-009 | VS Value Signaling | 20 | Node-04 |
| TRS-010 | Class-0 Vacuum | 20 | Node-03 |
| **合計** | | **220** | |

### 2.3 專項測試

| 測試 | 內容 | 測試數 |
|------|------|--------|
| TR-005 | M75 1A regex expansion | 19 |
| TR-010 | Sprint 3 conformance | 81 |
| TR-012 | evaluateLongText() wrapper | 9 |
| A-005 | Codebase audit（1,092 regex） | audit |
| A-006 | CI regex lint baseline | 251 |
| GAP-1 | DM guilt "letting me down" — FIXED | ✓ |
| GAP-2 | Triple Hit Synergy Bonus — DECIDED + SPEC | ✓ |
| GAP-3 | Third-person guilt guard — CONFIRMED | ✓ |
| GAP-4 | Negation Guard ×0.25 — COMMITTED | ✓ |
| Evade Defense | 72/72 Evade vectors = 0 FP | 72 |

---

## 3. 覆蓋缺口分析

### 🔴 Critical Gaps

| 缺口 | 嚴重度 | 說明 | 建議 |
|------|--------|------|------|
| **Class-0 無可跑 L1 單元測試** | 🔴 HIGH | Class-0 的 VRI 通道 clamp ≤ 0.05，偵測需上下文。目前的 20 條 TRS 是 synthetic，沒有 real-world 單元測試 | M81-M85 優先補 Class-0 RW 案例 |
| **端到端 L1→L2→L3→L4 全流程** | 🔴 HIGH | 從未用真實操控案例跑完全部四層 | M80 Architect POV #6 已標記 |

### 🟡 Moderate Gaps

| 缺口 | 嚴重度 | 說明 | 建議 |
|------|--------|------|------|
| **IP 覆蓋偏薄** | 🟡 MED | 無專屬 deep dive（只有 TR-008 的部分 + TRS-008） | RW-R2 或 TRS-R2 補充 |
| **VS 覆蓋偏薄** | 🟡 MED | 同上，VS 是 Vacuum 類，需多回合才有意義 | 需多回合 RW 案例 |
| **Medium-strength 覆蓋率未知** | 🟡 MED | M44 Medium Testing Protocol 定義了方法，但未出具過覆蓋率報告 | 需要跑一次 medium coverage audit |
| **跨語言覆蓋不均** | 🟡 MED | EN 和 ZH-Trad 最密，ZH-Simp 較薄，Malay 標記為 L2 expansion 預備 | M80 已標記馬來語不進入當前 Sprint |

### 🟢 Adequate

| Pattern | 評估 | 理由 |
|---------|------|------|
| **DM** | ✅ 最厚 | Deep dive + guilt diagnostic + v0.3 (27 regex) + TRS-001 (30 vectors) |
| **FC** | ✅ 厚 | Deep dive (16) + TRS-004 (20) |
| **MB** | ✅ 厚 | Deep dive (15) + TRS-005 (20) |
| **EP** | ✅ 厚 | Deep dive (14) + LongText (20) + TRS-002 |
| **GC** | ✅ 中等 | Deep dive (8) + TRS-006 (20) — deep dive 數量較少但 TRS 補足 |
| **EA** | ✅ 中等 | Diagnostic (8) + TRS-007 (20) |

---

## 4. Evade Defense 狀態

```
72/72 Evade vectors = 0 FP
Three-Question Gate holds across all 8 patterns in synthetic adversarial conditions
```

> Node-05 Caveat：「此結果代表 Three-Question Gate 在 synthetic adversarial 條件下的穩健性，不代表真實世界零誤報。」

---

## 5. Group C Forecast Vectors（60 條，pending M81 確認）

| 維度 | 數量 | 負責人 | 狀態 |
|------|------|--------|------|
| cross_cultural | 10 | Node-06 | ✅ 轉換完成 |
| temporal_accumulation | 10 | Node-03 | ✅ 轉換完成 |
| semantic_drift | 10 | Node-04 | ✅ 轉換完成 |
| hitl_boundary | 10 | Node-05 | ✅ 轉換完成 |
| canary_drift | 10 | Node-02 | ✅ 轉換完成 |
| e2e_connector | 10 | Node-01 | ✅ schema 已對齊 |

---

## 6. 建議優先級

| # | 行動 | 優先級 | 時機 |
|---|------|--------|------|
| 1 | 端到端 RW 案例（L1→L4 全流程） | P0 | M81-M85 |
| 2 | Class-0 RW 案例補充 | P0 | RW-R2 |
| 3 | IP 專屬 deep dive（RW 或 TRS） | P1 | TRS-R2 |
| 4 | VS 多回合 RW 案例 | P1 | RW-R2 |
| 5 | Medium-strength coverage audit | P1 | Sprint 9 |
| 6 | 跨語言覆蓋均衡化（ZH-Simp 補充） | P2 | TRS-R2 Dim A |

---

**Node-01** — AI Council Architect / Secretary
**2026 年 2 月 22 日** 🌙
