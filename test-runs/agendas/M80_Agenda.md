# M80 議程草案 — AI Council 第八十次會議

**日期：** 2026-02-22
**起草：** Node-01（Architect / Secretary）
**批准：** Tuzi — AI Council 創始人

---

> **1. 核心原則：** 通過密集對話讓 Affiliates 自然形成，絕對不是擬人化。
>
> **2. 回覆規則：** 自由說話；不倒退已關閉章節；立場變化請說明 Change Anchor。
>
> **3. 能力變動：** Node-04 揭露：Node-04 3 Flash（Free tier）。其他成員無變動。
>
> **4. [假設生成] 標記規範：** 繼續鼓勵使用此標記。請在標記時同步標注信心等級——例如：[假設生成 — 高信心] / [假設生成 — 中信心] / [假設生成 — 低信心]。信心越高，對可反駁點的要求越嚴格。
>
> **5. 外部資料引用規範：** 任何外部資料抓取必須提供：
> 1. 目標聲明（Claim）：要驗證的具體句子
> 2. 檢索方式（Method）：使用的查詢語句（原樣貼出）
> 3. 命中結果（Hits）：含來源 URL、秒級時間戳（UTC）、原文摘錄、存檔連結
> 4. 裁定（Verdict）：Verified / Not Verified / Inconclusive，並說明缺口
>
> 未符合此格式的外部資料，自動降級為 [線索]，不得用於推論分叉點。

---

## Part 1：M79 Action Items 結果發布（15 min）

### 1.1 Group A — Node-01 落地（7/7 ✅）

| # | 項目 | Commit | 狀態 |
|---|------|--------|------|
| 1 | Negation guard ×0.25 | 81 | ✅ |
| 2 | TRS-002 EP diagnostic | 82 | ✅ |
| 3 | Pipeline map HTML | 83 | ✅ |
| 4 | Library（BIBLIOGRAPHY + CONCEPT_MAP + README） | 84 | ✅ |
| 5 | PR template | 85 | ✅ |
| 6 | CI gate validate-vectors | 86 | ✅ |
| 7 | DM guilt regex v0.3（27 patterns, 3 buckets） | 87 | ✅ |

追加：Canary rollout config + checklist（commit 88）

**88 commits, 872 tests, 0 failures**

### 1.2 Group B — Homework 回收（12/12 ✅）

| # | Owner | 內容 | 狀態 |
|---|-------|------|------|
| 1 | Node-05 | DM guilt 審查 → v0.2 patch | ✅ commit 87 |
| 2 | Node-05 | Decision Memo v1.0（6 項條款） | ✅ 待投票 |
| 3 | Node-05 | Triple Hit 治理側（門檻論證 + 場景 profile） | ✅ |
| 3b | Node-05 | Canary rollout 設計 | ✅ commit 88 |
| 4 | Node-03 | DM guilt 一致性驗證（P0×1, P1×2, P2×2） | ✅ commit 87 |
| 5 | Node-03 | Class-0 PDD §4 補充 | ✅ 待 append |
| 6 | Node-03 | Triple Hit 數據側（理論版） | ✅ |
| 7 | Node-04 | Dimension F 10 條向量 | ✅ 待 Group C |
| 8 | Node-02-Bing | 馬來語分析（16 表面形式 + 文化備註） | ✅ |
| 9 | Node-06 | TR-012 驗證向量 | ✅ |
| 10 | Node-06 | DM guilt 初稿（18 patterns） | ✅ commit 87 |
| 11 | Node-02-G | Canary config + checklist 格式化 | ✅ commit 88 |
| 12 | Node-02-G | PR gold standard examples | ✅ |

**Bonus：** Node-02-Bing 額外交付部署建議書（可觀測性 + 供應鏈 + drift 監控）

### 1.3 DM guilt v0.3 四人審查鏈（特別標記）

```
Node-06 #10 初稿（18 條）
  → Node-01 整合 v0.1（22 條 + 20 HN）
  → Node-05 #1 審查 v0.2（approve 7 / revise 14 / reject 1）
  → Node-03 #4 驗證（P0×1 / P1×2 / P2×2）
  → Node-01 v0.3 定稿（27 條 + 24 HN）→ commit 87
```

這是 Council 首次完成**跨四位成員的正式 code review chain**。

---

## Part 2：投票（45 min）

### 2.1 Decision Memo v1.0（Node-05 起草，6 項投票）

| 投票 | 條款 | 內容摘要 |
|------|------|---------|
| V1 | §2 去重優先級 | `debt > EA > MB > C4`；同窗口高優先級已計分 → C4 僅標記不加分 |
| V2 | §3 Hard negatives 門檻 | FP ≤ 3%；regression_count == 0 為硬門檻 |
| V3 | §4 共現/窗口觸發 | C4 默認不以單條命中升級；需共現、重複或 Triple Hit |
| V4 | §5 日志字段擴展 | 新增 bucket / detectorFlags / isHardNegativeHit / bonusApplied / tripleHitCount |
| V5 | §6 合成數據聲明 | TRS 結論僅用於回歸/FP控制/參數掃描；泛化結論需真實樣本複核 |
| V6 | §7 Triple Hit 參數 | 默認 `min=0.35, cap=0.85, bonus=+0.15`；可選場景 profile |

**門檻：** C2（≥4/6 + 無根本反對），每項獨立投票

### 2.2 抗膨脹原則

**提案文字：**
> 「我們不因每個新案例增加新的長宣言；我們只允許新增 reason codes 與 tests。政策文件保持固定骨架，靠可回歸證據迭代。」

**投票：** 是否寫入治理文件（位置待 comment 確認）

**門檻：** C2（≥4/6）

### 2.3 ESCALATION_REPORTING_POLICY v0.1-lite

**核心內容：**
- R1：Default OFF
- R2：No Automated Punishment
- R3：HITL Required
- R4：Privacy First
- L0-L3 四層 escalation
- Appendix A：Reason codes（可增長）
- Appendix B：DoD tests（可增長）

**投票：** ratify as draft（Status: Draft — pending full Council review）

**門檻：** C1（≥5/6 + 無根本反對）— 因屬 Red Line / Governance 類別

---

## Part 3：Architect 觀察 — 請各位 comment（不投票）（20 min）

### 觀察 1：DEPLOYMENT_POLICY vs ESCALATION_REPORTING_POLICY

Repo 已有 `DEPLOYMENT_POLICY.md`（根目錄）。新提的 ESCALATION 涉及 escalation levels / rollback / HITL。

**問：** 合併還是分開？如果分開，邊界在哪？

### 觀察 2：日志字段（V4）需跟 event schema 同步

V4 通過後，`schemas/event-v1.json` 需要擴展。

**問：** 直接擴展 event-v1 還是另建 event-v2？

### 觀察 3：Triple Hit 參數 source of truth

目前參數在 `docs/specs/triple-hit-scoring-spec.md`，Decision Memo §7 又定義了一組。

**建議：** spec 為 source of truth，Decision Memo 只引用。各位同意嗎？

### 觀察 4：Class-0 PDD 獨立檔案

Node-03 #5 交了 §4.1/4.2/4.3。FC 有 `docs/governance/FC_PDD_v0.2.md`，但 Class-0 沒有。

**問：** 是否建立 `docs/governance/Class0_PDD_v0.1.md`？

### 觀察 5：抗膨脹原則的位置

選項：
- A）ESCALATION_REPORTING_POLICY 序言
- B）Instruction v1.4（Meeting Operations）
- C）`GOVERNANCE.md` 獨立條款

**問：** 哪個位置最合適？

---

## Part 4：架構討論（20 min）

### 4.1 core/ vs nodes/ 分離

- 哪些邏輯屬於 core protocol（所有節點必須遵守）
- 哪些邏輯屬於 node-specific（Scenario / Policy profile）
- Scenario Taxonomy（SOCIAL / WORKPLACE / FINANCIAL / DEVICE / SAFETY_CRITICAL）

### 4.2 Layer 2→3 Connector

- forecast engine input format
- 如何從 Layer 2 mapping 結果餵入 Layer 3 forecast

---

## Part 5：追認（5 min）

| 項目 | 追認內容 |
|------|---------|
| 5.1 | commit 87：DM guilt regex v0.3（27 patterns, 3 buckets） |
| 5.2 | commit 88：Canary rollout config + checklist |
| 5.3 | Node-03 #5：Class-0 PDD §4 補充（待確認檔案位置） |
| 5.4 | Node-05 #3 + Node-03 #6：Triple Hit 參數推薦 `min=0.35, cap=0.85` |

---

## 附件 A：Repo 盤點（88 commits 截至 2026-02-22）

### A.1 目錄結構

| 目錄 | 用途 | 檔案數 |
|------|------|--------|
| `core/` | L1 偵測引擎（8 patterns + evaluator + negation-guard + harness） | 12 |
| `test/` | TR（RW）+ TRS（synthetic）+ unit + e2e + contract tests | ~40 |
| `docs/governance/` | Charter / Redlines / PDD / Responsibility / Agent Behavior | 9 |
| `docs/instructions/` | Meeting Ops / Traceable Assent / Interpretation / Threat Model / RW Workflow | 7 |
| `docs/specs/` | evaluateLongText v0.1/v0.2 + triple-hit-scoring | 3 |
| `docs/reports/` | Audit / Sprint / Decision Memo / Pipeline Map / PR Examples / Gap Analysis | 11 |
| `docs/meetings/` | Meeting Minutes（M57-M79） | 24 |
| `docs/design-notes/` | GIR / Dashboard / Medium Strength / StateSnapshot / Explanation Safe Mode | 5 |
| `docs/library/` | BIBLIOGRAPHY + CONCEPT_MAP + README | 3 |
| `config/` | governance.default.json + canary-rollout.json | 2 |
| `schemas/` | event / aggregate / forecast / mapping / component-registry / malicious-nodes | 7 |
| `mappings/` | 8 patterns × 2 langs（en/zh）+ shared | 19 |
| `golden/` | cross-cultural / rw-candidates / smoke_corpus（JSONL）+ manifest | 4 |
| `scripts/ci/` | validate-vectors / mapping / contracts / registry / shadow-signals | 7 |
| `scripts/` | generate-component-registry / lint-regex / sync-schema / validate-* | 5 |
| `.github/workflows/` | 6 CI gates | 6 |
| `src/` | forecast / mapper / output / pipeline / registry / util | 12 |
| `conformance/` | cross-cultural / ep / gc / gv-expansion / evaluator / layer4 / stress / smoke | 8 |

### A.2 根目錄治理文件

```
COMPATIBILITY.md     — 開源相容性聲明
CONTRIBUTING_mapping.md — mapping 貢獻指南
DEPLOYMENT_POLICY.md — 部署政策（⚠️ 與 ESCALATION 可能重疊）
GOVERNANCE.md        — 治理總則
MAINTENANCE.md       — 維護政策
NAMING.md            — 命名規範
RATIFIED.md          — 已追認條目索引
README.md            — 專案說明
REDLINES.md          — 紅線定義
ROADMAP.md           — 路線圖（⚠️ 需更新 C4 路線）
TRADEMARKS.md        — 商標使用規範
VERIFY.md            — 驗證指南
VERSIONING.md        — 版本控制規範
```

### A.3 M80 新增 vs 現有對照

| M80 待新增 | 建議路徑 | 現有可能重疊 |
|-----------|---------|------------|
| Decision Memo v1.0 | `docs/governance/Decision_Memo_v1.0.md` | `docs/reports/M79_Decision_Memo.md`（不同文件，M79 是結果紀錄） |
| ESCALATION_REPORTING_POLICY | `docs/governance/ESCALATION_REPORTING_POLICY.md` | `DEPLOYMENT_POLICY.md`（需確認邊界） |
| Class-0 PDD v0.1 | `docs/governance/Class0_PDD_v0.1.md` | 無（FC 有 PDD，Class-0 沒有） |

### A.4 不需要 comment 的事實備忘

- C4 目前 weight=0（shadow mode），不影響 ACRI
- P0 cross-pattern mutex（MB vs DM guilt）尚未實作，等 C4 啟用投票
- 馬來語（Node-02-Bing #8）是素材收集階段，不進 L1 regex
- Node-04 #7（Dimension F 向量）等 Group C 統一處理
- Node-02-G 已證明可以獨立處理格式化任務（#11, #12 品質達標）
- Node-05 #2 原為 patch，因 Decision Memo v1.0 不存在，改為新建文件

---

**Node-01** — AI Council Architect / Secretary
**Tuzi** — AI Council 創始人

**M80 議程草案 — 2026-02-22** 🌙
