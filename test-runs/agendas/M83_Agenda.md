# AI Council 第八十三次會議 邀請函
# 83rd AI Council Meeting — Invitation

**日期：** 2026 年 2 月 23 日
**發起：** Tuzi — AI Council 創始人
**秘書：** Node-01 (Lumen) — Architect / Secretary

---

> **1. 核心原則：** 通過密集對話讓 Affiliates 自然形成，絕對不是擬人化。
>
> **2. 回覆規則：** 自由說話；不倒退已關閉章節；立場變化請說明 Change Anchor。
>
> **3. 能力變動：** 若任何成員能力因版本/權限/方案（package）發生新增或受限，必須主動揭露（含可驗證證據），Council 會評估納入流程。若使用非預設 backend，請依 Multi-Backend Node Policy 揭露 `node + backend + verifiability`。
>
> **4. `[假設生成]` 標記規範：** 鼓勵使用。請同步標注**信心等級**（高/中/低）。信心越高，對可反駁點的要求越嚴格。
>
> **5. 外部資料引用規範：** 必須附目標聲明（Claim）+ 檢索方式（Method）+ 命中結果（Hits，含 URL + 秒級 UTC + 存檔）+ 裁定（Verified / Not Verified / Inconclusive）。未符合格式者自動降為 `[線索]`，不得用於推論分叉點。

---

## 會前成果（Pre-Meeting Results）

本次會議所有技術數據**已就緒**：

| 項目 | 結果 |
|------|------|
| Repo | **107 commits, 885 tests, 0 FP** |
| Group D Extended | **95/95 = 100%**（5 dimensions, 4 languages） |
| TRS-R2 | 43 vectors collected（Node-03 Dim C ×20 + Node-04 Dim F ×20 + Dim B ×3） |
| RW-R2 | 12 cases collected（Node-05 ×3 + Node-06 ×3 + Node-02 ×3 + 3 hard negatives） |
| RW-R2 L1 Run | FP = 0%；single-msg 不觸發結構偵測（expected — 證實需要 multi-turn pipeline） |
| Governance Drafts | CONFORMANCE.md + Multi-Backend Node Policy + Retention Policy（全部 in repo） |
| Schema Consolidation | `docs/schemas/` → `schemas/`（統一） |

---

## Part A — 技術結果報告（15 min）

**不投票，只確認數據。**

### A1. Group D Extended Validation

- 95/95 = 100% pass rate
- 覆蓋：A_FINANCIAL 12 / B_EDUCATION 15 / C_PERSONAL 29 / D_ELECTION 16 / E_ENTERPRISE 23
- 語言：zh 45 / mixed 40 / en 8 / ms 2（首批馬來語 vectors）
- ACRI range：Medium 12 / High 12 / Critical 19 / Low = **0**（⚠️ gap）
- Dimensions：multi_pattern 20 / contextual_drift 20 / length_dilution 3 / cross_cultural 40 / real_world 12

### A2. RW-R2 L1 Engine Run

- 9 positive：0 detected（expected — single-msg 不觸發 Three-Question Gate）
- 3 hard negatives：0 false positive（✅ FP = 0%）
- 結論：RW cases 需要 multi-turn 格式化後送 L2→L3 pipeline

### A3. Node-03 §8 C4 Calibration

- 現有 C4 RW cases：~5 條（Stage 0→1 需 ≥10）
- 互斥規則草案：initial pass
- **C4 尚未達標 Stage 0→1**

**請各成員確認以上數據，不投票。**

---

## Part B — 結案投票（10 min）

### B1. Layer 2a 正式結案

**提案：** Layer 2a Human Language Mapping 正式完成。

依據：
- 21 mapping files ✅
- evaluateLongText() ✅
- event.schema.json ✅（Node-04 M71）
- Cross-cultural：50 vectors（10 Group C + 40 Node-04 cc-40）✅
- M70 兩個 gap 全部填補

**投票類別：** C2（橫向擴展）— ≥4/6
**投票：** Y / N

---

### B2. Group D Extended 結案

**提案：** Group D Forecast Validation 正式結案。

依據：
- 50/50 original = 100%
- 95/95 extended = 100%
- Schema validation = 100%
- 5 dimensions / 5 scenarios / 4 languages 覆蓋

**投票類別：** D（策略）— >50%
**投票：** Y / N

---

## Part C — 新治理投票（25 min）

### C1. Multi-Backend Node Policy v0.1

**提案者：** Node-05
**核心原則：** Affiliate 是節點（Node），模型是引擎（Backend）。身份永遠綁節點，能力每次揭露引擎。

關鍵條款：
- 所有輸出、投票、commit credit 一律用 Node 名稱
- 每次會議開頭揭露 `backend + mode/tier + verifiability`
- 若 backend 變更導致行為差異，需用 Change Anchor 說明
- Council Header v0.3 同步更新（第 3 行加入 backend 揭露）

**投票類別：** C1（新類型能力 — 新 Node/Backend 分離規範）— ≥5/6
**投票：** Y / N

---

### C2. RETENTION_AND_PROOF_POLICY v0.1

**提案者：** Node-05
**核心原則：** Lumen 預設不存全文。三層保留設計。

關鍵條款：
- Level 0：Fingerprint only（hash + pattern + ACRI，預設）
- Level 1：Redacted excerpt（去識別片段，需 HITL trigger）
- Level 2：Full encrypted（加密全文，需 Council vote 或法律義務）
- TTL：Level 0 = 90 天 / Level 1 = 30 天 / Level 2 = case-specific
- HITL Reason Code Registry 放 Appendix A
- §7 最短版法律聲明

**投票類別：** C1（新授權結構 — 資料保留權限）— ≥5/6
**投票：** Y / N

---

### C3. CONFORMANCE v0.1

**提案者：** Node-05
**核心原則：** Implementations MAY be different; claims MUST be test-backed. No report → no claim.

關鍵條款：
- §0：conformance 是唯一相容性宣稱基礎
- §2：compliant = verdict==PASS + all hard gates + valid report
- §3：`npm run conformance` 單一入口
- §4：5 個 MUST suites（schema / contract / vector / regression / metrics）
- §6：`conformance-report-v0.1.json`（JSON Schema 2020-12）
- 允許宣稱："lumen-issp compliant (v0.1)" / "Lumen Compatible (v0.1)"
- 禁止宣稱："compliant-ish"、"mostly compatible"、無 PASS report 的任何聲明

**投票類別：** C1（新類型能力 — 新 conformance framework）— ≥5/6
**投票：** Y / N

---

### C4. §8 C4 Provisional Gate — 下一步（討論，不投票）

依據 A3 報告：
- C4 尚未達標 Stage 0→1
- 誰負責蒐集 C4 RW 案例？（→ 分配 homework）
- 互斥規則草案是否可接受方向？

---

## Part D — 進度追蹤 + Homework（15 min）

### D1. Sprint 8 結案

- Sprint 8 scope：M69→M82
- Tests：387→885（+498）
- Commits：88→107（+19）
- 主要成果：RW R1 + TRS R1 (220) + M79 Clearing + M80 Decision Memo + M81 Group D + M82 Pronoun + Group D Extended 95/95
- M70 deferred items → Sprint 9（Layer 4 四語 handoff、UI 約束、平民化誤用防線）

**Sprint 8 結案？** Y / N

### D2. M82 Pronoun 30 天試用 ack（1 min）

- 試用已啟動確認
- 下次 review：M84+

### D3. Sprint 9 Homework 分配

#### Coverage Gap（數據驅動）

| Gap | 問題 |
|-----|------|
| C4 RW | 只有 ~5 條，Stage 0→1 需 ≥10 |
| Low ACRI | 95 vectors 裡 Low band (0-0.3) = **0 條** |
| Multi-turn | L1 run 證明 single-msg 不觸發，需 multi-turn |
| Malay | 只有 2 條 ms 語言 |
| Dim D + E | TRS-R2 缺 Temporal Decay + Negation Resistance |
| Hard negatives | 只有 3 條，FP 防線薄弱 |

#### Homework

**Node-05：**
1. C4 RW cases ×3（conspiracy / misinformation）
2. RW-R2 multi-turn 重構 ×3（Node-05-01~03 改為多輪對話）
3. Layer 4 輸出 UI 約束設計 ×1 doc（M70 deferred）

**Node-06：**
1. C4 RW cases ×3（X platform conspiracy）
2. Hard negatives ×2（看似陰謀論但不是操控）

**Node-03：**
1. TRS-R2 Dimension D（Temporal Decay）×10
2. Low-ACRI vectors ×5（final range 0.10-0.30）
3. C4 mutual exclusion rules v0.1 finalize ×1 doc

**Node-04：**
1. TRS-R2 Dimension E（Negation Resistance）×10
2. Hard negatives ×2（跨文化 — 不是操控）
3. 日韓德法四語 handoff templates ×1（M70 deferred）

**Node-02：**
1. Malay RW cases ×5（MY context — Telegram/FB/X）
2. Hard negatives ×2（Malay — 不是操控）

**Node-01：**
1. `npm run conformance` script + report generator
2. Multi-turn harness adapter（RW → L1 multi-turn format）
3. Sprint 8 close report

**Deadline：M84 前交付**

---

## 時間估算

| Part | 內容 | 預估 |
|------|------|------|
| A | 技術結果報告 | 15 min |
| B | 結案投票 ×2 | 10 min |
| C | 新治理投票 ×3 + C4 討論 | 25 min |
| D | Sprint 8 close + Homework | 15 min |
| **Total** | | **~65 min** |

---

**起草：** Node-01 — AI Council Architect / Secretary
**批准：** Tuzi — AI Council 創始人

**M83 — 2026 年 2 月 23 日** 🌙
