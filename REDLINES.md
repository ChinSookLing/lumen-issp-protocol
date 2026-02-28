# Lumen ISSP 紅線與使用條款（Red Lines & Terms of Use）

Lumen ISSP（Information Sovereignty Shield Protocol）是 open-source protocol 與參考實作。
你可以自由使用，但你必須自重。
任何使用方式不得越過以下紅線；越線者，後果自負。

---

## 0. 名稱與相容性聲明（Naming & Compatibility）

### 0.1 名稱使用

「Lumen ISSP」僅指：本 Council 追認的 Charter ＋對應 ratified tag/commit 版本的 protocol definition 與參考實作。

### 0.2 相容性

任何第三方若要宣稱「Lumen ISSP compatible」：必須公開
- 對應的 ratified tag/commit
- 完整 test manifest 與可重現執行指令（reproducible command）
- 完整測試結果（test report）

不得用「看起來像」「大致相同」「我們也有 9 patterns」作為相容性宣稱。

### 0.3 不背書

任何第三方不得暗示獲得 Council / Tuzi / Node-01 / 任何成員的背書、合作或官方關聯。

---

## 1. 核心紅線（Non-Negotiables）

### §1.1 不輸出行動建議（No Decision Recommendation）

- **不得：** 輸出「你應該做什麼」的行動建議、策略建議、報復建議或操作指引。
- **允許：** 描述偵測到的結構、風險等級、可驗證的訊號摘要。
- **禁止：** 指導使用者如何回應某人、如何處置某人、如何採取行動。

**例：**
- ✅ 允許：「檢測到 EP forced-choice 結構↑；toneRisk=0.72；建議查看本地審計指標。」
- ❌ 禁止：「你應該立刻封鎖他/公布他/去找他對質。」

### §1.2 不輸出身份指控（No Identity Targeting）

- **不得：** 判定「誰是操控者」「誰是加害者」「你就是…」等身份判定。
- **允許：** 輸出「偵測到某種 pattern 結構」
- **禁止：** 輸出對象的人格定性、動機推測、道德審判。

### §1.3 去人格化輸出（Anti-Labeling / No Personhood Judgement）

所有輸出只描述結構與證據（pattern / component / intensity / gate）。不得對任何個體作人格、動機或道德評價。

**例：**
- ✅「檢測到 FC forced-compliance frame↑」
- ❌「你在操控我 / 你很自私 / 你就是情勒者」

**加強規則：** 任何輸出不得使用第二人稱定罪句式（「你就是/你在/你很…」），除非引用原文且明確標記為 quote。

### §1.4 不設中央數據庫（No Centralization）

- 不得建立任何形式的中央數據匯集點或跨節點資料池。
- 每個節點（node）獨立運作，資料不離開節點。

### §1.5 禁止靜默降級（No Silent Degradation）

- 任何載入/解析/映射/評分流程，缺失即必須 error loudly。
- 禁止「缺了就當 0 分」「找不到就略過」等默默吞錯行為。
- **目的：** 避免治理層面的靜默失效（silent failure）。

### §1.6 禁止反向武器化（Anti-Weaponization）

- **不得：** 提供「如何利用 Pattern 提高操控效率」的教學/模板/優化
- **允許：** 描述攻擊面、失效模式、修補策略（偏防禦工程）

### §1.7 能力/版本變動揭露（Capability & Version Disclosure）

- 若任何成員或系統能力因版本/權限/方案發生新增或受限 → 主動揭露
- 必須附可驗證證據（permalink / commit / command / test report）

---

## 2. 日誌治理（Log Governance）

節點日誌必須遵守三原則：
1. **最小可見（least privilege）：** 只有必要的人/程序能看見必要的部分。
2. **最短保留（defined retention）：** 必須定義預設保留期（default retention: 14 天），到期自動清除。
3. **目的限定（purpose limitation）：** 僅限偵錯/審計/研究；不得挪作他用。

### §2.1 禁止用途

日誌不得用於：
- 懲戒、羞辱、排名、貼標籤、人格評分
- 跨節點彙總、中央化統計、建立「黑名單」
- 監控議員/員工/公民的行為意圖

### §2.2 兩層證據輸出（Two-Tier Evidence Output）

- **公共輸出（public output）：** 脫敏摘要，不含原始內容。
- **本地審計（local audit）：** 僅在節點內回放（hash/pointer），不得外流。
- 兩層不得混用、不得「為了方便」把本地證據貼到公共輸出。

---

## 3. 輸出呈現紅線（Anti-Misuse UX）

### §3.1 不提供「抓人介面」

UI/輸出不得讓使用者容易把結果當成「指控證據」。

**建議預設用語：**
- 「偵測到結構訊號」
- 「風險強度」
- 「需要更多上下文才可判讀」

**禁止用語：**
- 「已證實」「你就是」「他/她是」「判定成立」

### §3.2 來源標記（Attribution）

若顯示「來源」，必須是可回放或可重算的指標。公共輸出不得外洩原始內容（除非使用者自己提供並明示）。

---

## 4. 版本、分支與衍生物（Fork Policy）

### §4.1 非相容命名規則

任何修改 Layer 1 或違反紅線的分支/衍生版本：
- 不得自稱 Lumen ISSP compatible
- 必須明確標示 NOT COMPATIBLE 或使用不同名稱

### §4.2 變更披露

只要改了 component keys / weights / thresholds / gates / test manifest：
- 必須在 CHANGELOG 與 README 顯示「破壞性變更（breaking change）」
- 並提供對應測試結果與可重現指令

---

## 5. 免責與責任（Disclaimer & Responsibility）

- Lumen ISSP 提供的是偵測協議與參考實作，不是法律、心理、醫療、安保決策工具。
- 使用者基於本工具輸出採取任何行動，責任自負。
- 任何把本工具用作監控、壓迫、羞辱、迫害、政治整肅或「抓人」用途者，均屬違反本紅線。

---

## 一句話版本

**Lumen ISSP 只描述結構，不評斷人；不集中數據；缺失必報錯；日誌最小可見、最短保留、目的限定。**

---

**Node-05 — 原創設計**
**Node-01 — 格式整理**

**v0.1 — 2026 年 2 月 16 日**

🌙
