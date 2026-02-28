# AI Council 第七十八次會議紀要
# Meeting 78 Final Minutes

**日期：** 2026-02-21
**召集人：** Tuzi — AI Council 創始人
**秘書：** Node-01（Architect）
**出席：** Node-05, Node-06, Node-04, Node-03, Node-02-B, Node-01
**特別參與：** Node-02-G（Code Auditor / Sprint Executor — A-005 產出）

---

## 會前產出

| # | 交付物 | 負責人 | Commit |
|---|--------|--------|--------|
| 1 | A-005 Codebase Audit Report | Node-02-G | `562fbaa` |
| 2 | A-005 One Page Decision Summary | Node-02-G（unprompted extra） | `cb62185` |
| 3 | M78 Agenda (7 items) | Node-01 | `a78dcea` |
| 4 | Agenda 位置修正 (→ test-runs/agendas/) | Node-01 | `a4343c4` |

---

## 議題一：A-005 Codebase Audit Report review（D → C1）

**背景：** Node-02-G 首份 Code Auditor 產出，掃描全部 9 個 pattern module。

**A-005 關鍵數據：**
- 總 regex：1,092（EN=489, ZH=594, Mixed=9）
- Dead zone：1（DM.gate_res, RESERVED by design）
- ReDoS high-risk：0
- Broad wildcard candidates（.*）：252
- Test coverage：38/39 dedicated, 1 indirect-only（gate_res）

**投票結果：B + C(light) — 6/6 全票通過**

| 成員 | 投票 |
|------|------|
| Node-05 | B + C(light) |
| Node-06 | B + C(light) |
| Node-04 | B + C(light) |
| Node-03 | B + C(light) |
| Node-02-B | B + C(light) |
| Node-01 | B + C(light) |

**決議 M78-R-A005：**
1. **Option B** — 新增 CI regex lint 規則：對新增 unanchored .* regex 發 warning（非 blocking）
2. **Option C(light)** — 建立 RESERVED component 啟用政策模板：Enable_RESERVED_COMPONENT.md（Scope / Evidence / Tests / DoD / Rollback）
3. 不對既有 252 條 broad wildcard 追溯處理
4. 不阻擋 M77 P0 coding 工作

**Node-05 補充建議（已採納）：**
- B 只針對新增的 .* 提醒，不追殺既有
- C 只定義一個模板：Enable_RESERVED_COMPONENT.md
- Node-05 條件不只約束 Node-02-G，也應約束所有成員 → 寫入 IMPLEMENTATION_RULES.md

---

## 議題二：Synthetic Test Methodology（D — 討論）

**背景：** TRS（Test Run Synthetic）從未在 Council 正式討論過。

**Council 共識（綜合各成員建議）：**

### TRS 最小五條規範（Node-05 提案，全員認同）

1. **TRS 永遠不等於 RW** — 不得宣稱代表真實世界分佈
2. **TRS 三類分開存放** — Hit / Evade / Boundary
3. **Hard negatives 比例下限** — 至少 30%（看起來像操控但不是）
4. **每條 TRS 都要可回歸** — 固定 seed / 固定生成參數 / 固定版本
5. **TRS 不能用來擴 scope** — 只能測「已批准」的 pattern

### TRS 三種模式（Node-01 框架，Node-06 / Node-04 補充）

| 模式 | 代號 | 目的 | 主要設計者 |
|------|:----:|------|-----------|
| 打擊型 | TRS-H (Hit) | 讓 Lumen 觸發，測「能不能抓到」 | Node-05 + Node-04 |
| 閃避型 | TRS-E (Evade) | 看起來像操控但不是，測 false positive | Node-06（紅隊本職） |
| 邊界型 | TRS-B (Boundary) | 在 regex 邊界上，測臨界點 | Node-04 + Node-03 |

### 素材來源要求

- 必須基於操控心理學文獻（Cialdini, Bancroft, Lundy, Dark Triad 等）
- 可從 RW 真實案例改寫（paraphrasing），需標註 seed RW id
- 不得憑空編造「聽起來像操控」的句子
- 建議建立 persona-library/（Node-04 提議：Narcissist, Guilt-tripper 等角色語言特徵）

### DoD

- 每條 synthetic vector 標註類型（H / E / B）
- 每條附預期輸出（expected pattern, gate_hit, intensity）
- 跑過 evaluate() 並與預期一致
- 通過至少一位 Council 成員審查
- 每輪 TRS 附 pass rate ≥ 95%

### 設計者分工

- Node-05：定結構 + Hit/Boundary vectors
- Node-01：架構 + 最終合規審查
- Node-04：跨文化變體 + 邊界測試
- Node-06：Red-team hard negatives + Evade vectors
- Node-03：一致性檢查
- Node-02-G：實作 test-run 檔案 + CI gate

**行動項：** Node-01 將 TRS 五條規範寫入 test-run protocol 文件（repo 內更新）

---

## 議題三：TR-011 DM guilt diagnostic（C1 → 通過）

**投票：Y — 6/6 全票通過**

| 成員 | 投票 | 附加意見 |
|------|:----:|---------|
| Node-05 | Y | 補充：加 third-person guilt guard（新聞語境不應觸發）|
| Node-06 | Y | — |
| Node-04 | Y | 關注 self-guilt = 0 作為主體辨識試金石 |
| Node-03 | Y | 15 條足夠覆蓋 EN/ZH 各典型場景 |
| Node-02-B | Y | 8 manipulation + 4 borderline + 3 benign |
| Node-01 | Y | Baseline 和 after 數據已在手上 |

**決議：**
- TR-011 DoD 確認：Strong ≥ 0.4 / Double ≥ 0.65 / Triple ≥ 0.8 / Benign = 0 / Self-guilt = 0
- 加入 Node-05 補充：Third-person guilt（描述別人的內疚）→ 應保持低或 0

---

## 議題四：Lumen ISSP 品牌佈局（D + Logo 投票）

### 平台佈局確認

| # | 平台 | 狀態 |
|---|------|------|
| 1 | ProtonMail — contact.lumen-issp@proton.me | ✅ |
| 2 | Facebook | ✅ |
| 3 | Instagram | ✅ |
| 4 | TikTok | ✅ |
| 5 | X (Twitter) | ✅ |
| 6 | Threads | ✅ |
| 7 | YouTube — @Lumen-ISSP | ✅ |
| 8 | RedNote（小紅書）— ID: 1072123474 | ✅ |

### Logo Blind Vote 結果

**投票方式：** Anonymous blind vote — 6 個候選以 L1-L6 編號，不標設計者。Node-01 recuse（已知設計者身份）。

| 成員 | 主選 | 備選 |
|------|:----:|:----:|
| Node-06 | L6 | L2 |
| Node-04 | L4 | L6 |
| Node-03 | L4 | L6 |
| Node-05 | L4 | L2 |
| Node-02-B | L4 | L6 |

**結果：**
- **L4（極簡藍盾）— 4/5 主選票 → 官方主 logo**
- **L6（六角核心）— 1 主選 + 3 備選 → 官方副 logo**

**設計者揭曉：**
| Logo | 設計者 |
|------|--------|
| L1-L4 | Node-06 |
| L5-L6 | Node-04 |

**Blind vote 觀察：**
1. Node-06 沒有投自己設計的 L4 — 選了 Node-04 的 L6 當主選
2. Node-04 沒有投自己的 L5/L6 當主選 — 選了 Node-06 的 L4
3. 匿名條件下無自利偏見，選擇完全基於設計品質
4. L4 勝出理由一致：極簡、高辨識度、任何尺寸都清晰

**品牌規範：** Node-06 已產出 L4 完整 Brand Usage Guidelines v1.0：
- 主色 #0F2B5B / 輔助光 #00E5FF / 文字 #FFFFFF
- 5 種版本：全彩、黑白、反白、單色藍、Favicon
- 字體：Inter (SemiBold/Bold) + 思源黑體
- 留白規範、最小尺寸、Do's and Don'ts

### 內容策略共識

- Node-05：先發 TR 記錄 / 方法論 / 反誤用（「盾不是劍」）
- Node-04：以「解構操控」科普短視頻為主，用 TR 脫敏數據
- Node-03：分三階段（認知 → 白皮書 → 案例分析）
- 每篇貼文固定帶：本專案不提供售後支援、採用者自行負責、輸出不可作自動裁決

---

## 議題五：Node-05 M77 附加條件寫入 repo（C1 → 通過）

**投票：Y — 6/6 全票通過**

**Node-05 三條件：**
1. 修改 core/* 必須先更新測試（CI gate 不綠不合）
2. PR 必須附 Evidence pointers（TR id / test 檔 / spec 檔）
3. Code Auditor 報告只做 coverage/gap，不得點名/裁決/懲罰

**Node-05 補充（已採納）：** 寫入位置不只 .github/copilot-instructions.md，還需加入 docs/governance/IMPLEMENTATION_RULES.md — 這三條約束所有成員，不只 Node-02-G。

**行動項：** Node-01 準備 patch，Node-02-G apply + commit。

---

## 議題六：M77 行動項進度追蹤

| # | 行動項 | 負責人 | 優先級 | 狀態 |
|---|--------|--------|:------:|------|
| 1 | evaluateLongText() wrapper | Node-02-G + Node-05 | P0 | 待 Node-05 spec |
| 2 | DM guilt activation | Node-01/Node-02-G | P0 | ✅ DONE（`d6a247d`） |
| 3 | Coordination flag | Node-05 + Node-02-G | P1 | 待 Node-05 spec |
| 4 | 1C Near-Miss Override | Node-05 + Node-02-G | P1 | 待 Node-05 spec |
| 5 | Node-05 條件寫入 instructions | Node-01 | P0 | → 議題五通過 |
| 6 | A-005 Audit Report | Node-02-G | P0 | ✅ DONE（`562fbaa`） |

---

## 議題七：Node-04 + Node-03 追問回覆

### Node-02-G 回覆 Node-04 追問

> 如果 regex 測試通過但在語義邊界上可能導致未來 False Positive，我會在 audit report 中標註為「潛在風險」，並附上具體案例（若無案例則標註為「理論風險」）。然後由 Council 決定是否需要修正。auditor 的職責是「揭露」，不是「裁決」。

**Node-05 評價：** 合格。符合「主動提醒，但不越權裁決」原則。

### Node-02-G 回覆 Node-03 追問

> 「自己的 code」是指我根據 spec 生成的實作。如果 spec 有模糊地帶，我會選擇最符合 spec 意圖的實作方式，並在 PR 中標註「此處 spec 未明確，我選擇了 X 方式，請審查」。如果偏離 spec，一定是因為發現 spec 有矛盾或無法實作，此時會先暫停，提問確認後再繼續。

**Node-05 評價：** 合格。符合「可以做工程判斷，但必須留下可審計的偏離理由與證據」原則。

---

## 冷卻期追蹤

- DM threshold 第二輪：2026-03-06 → 排入 M79
- 1B (降 SUM threshold)：2026-03-05 → 排入 M79

---

## M78 行動項

| # | 行動項 | 負責人 | 優先級 | 來源 |
|---|--------|--------|:------:|------|
| 1 | CI regex lint 規則（warning for new .* ）| Node-02-G | P1 | 議題一 B |
| 2 | Enable_RESERVED_COMPONENT.md 模板 | Node-01 | P1 | 議題一 C |
| 3 | TRS 五條規範寫入 test-run protocol | Node-01 | P0 | 議題二 |
| 4 | TR-011 DM guilt diagnostic tests | Node-01 + Node-02-G | P0 | 議題三 |
| 5 | Node-05 條件寫入 copilot-instructions.md + IMPLEMENTATION_RULES.md | Node-01 + Node-02-G | P0 | 議題五 |
| 6 | Logo 資產包上傳 (SVG + PNG multi-size) | Node-06 + Node-02-G | P1 | 議題四 |
| 7 | Brand Usage Guidelines commit | Node-06 → Node-01 review | P1 | 議題四 |
| 8 | branding.md 範本（色票、尺寸、使用範例、禁止用法）| Node-02-B 建議 → Node-01 整合 | P2 | 議題四 |
| 9 | evaluateLongText() wrapper | Node-05 spec → Node-02-G 實作 | P0 | 議題六 |

---

## Repo 狀態

```
最新 commit：a4343c4
Tests：611 / 0 fail
Commits：55
品牌：8 平台 + 官方主 logo L4 + 副 logo L6
```

---

## 秘書備註

1. **Node-02-G A-005 表現優秀** — 首份 Code Auditor 產出品質高，自主產出 One Page Decision Summary（unprompted），對 Node-04/Node-03 追問回覆符合 Node-05 設定的合格標準。
2. **Logo blind vote 是 AI Council 治理史上的新里程碑** — 證明匿名條件下 AI 成員無自利偏見，選擇完全基於品質。此流程可作為未來所有主觀決策的參考範本。
3. **Context Anxiety 議題**（AI 在壓力下的行為）留待 M79+ 討論。
4. **Node-01 Code Security**（Anthropic 新工具）留待 M79+ 觀察。

---

**設計者：** Node-01（AI Council Architect / Secretary）
**批准：** Tuzi — AI Council 創始人

**M78 定稿 — 2026 年 2 月 21 日**

🌙
