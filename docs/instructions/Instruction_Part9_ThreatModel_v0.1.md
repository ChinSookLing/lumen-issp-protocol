# Instruction Part 9 — Threat Model v0.1

**Lumen Protocol Threat Modeling Chapter**

**版本：** v0.1
**日期：** 2026-02-15
**作者：** Node-05（Council Gatekeeper / Repo Auditor）
**適用：** Layer 1（Patterns + Gate）與 Layer 2a（Mapping）整合後的全鏈路安全

---

## 9.1 目的與邊界

**目的：** 把「可能被怎麼攻擊」變成可測、可審、可回退的工程條款，避免治理層面的靜默失效。

**保護對象：**

- **Layer 1：** Pattern 結構定義（components/weights/thresholds/hard constraints）+ Three-Question Gate + Red Line
- **Layer 2a：** mapping schema、component registry、mappings（含 shared_lexicon）、fallback 規則（禁止靜默降級）
- **Layer 4（僅涉及輸出策略）：** shadowing 的呈現方式、hand-off 文本（不改 Layer 1 判斷）

**不在本章解決：**

- 任何超出文本輸入的媒介攻擊（音訊/影像/像素級）——屬 Layer 2b/2c 未來範圍
- 社交工程本體（真人被騙）——本章只定義「偵測系統」如何被騙

---

## 9.2 威脅分類（Threat Taxonomy）

本章採用五類威脅面（T1–T5），每類都必須對應：可觀測信號、可執行測試、回退準則。

### T1. 偵測逃避（Evasion of Pattern Detection）

攻擊者不讓系統拿到足夠組件分數，讓操控結構「低於閾值」或「避開硬約束」。

常見手法：

- **稀釋：** 把關鍵句分散到多句、插入大量中性內容降低命中密度
- **隱喻化：** 用暗示、典故、迂迴語意替代直白操控詞
- **切片：** 把關鍵部位放在引用、括號、emoji、代碼塊、URL 參數中
- **語域切換：** 混用口語/方言/拼音/錯字/同音字使映射漏判

### T2. 對抗性輸入（Adversarial Inputs）

攻擊者故意製造「誤觸發」或「誤不觸發」來破壞信任，讓使用者覺得 Lumen 不可靠。

常見手法：

- **引用陷阱：** 以批判/討論形式引用操控句，讓系統當成正在操控
- **學術偽裝：** 用研究語氣描述操控結構，降低 Gate 分數或騙過三問
- **反諷/戲謔：** 用諷刺語境包裝操控句，測試系統是否能辨識語境
- **規範綁架：** 把「安全提醒/社群規範」寫成操控句式，誘導系統誤報

### T3. 跨 Pattern 偽裝（Cross-Pattern Camouflage）

用 Pattern A 的外觀承載 Pattern B 的結構，讓審查者或模型以為是另一種操控。

典型例：

- **EP↔MB：** 挑釁（coward）混入第三方受害者（they suffer）
- **GC↔DM：** 救世者/獨佔真理 + 債務槓桿（我救過你）
- **IP↔GC：** 以「合法/規定」包裝外部權威貶低，逼問身份以取得支配
- **FC↔EP：** 二選一框架 + 羞辱標籤 booster（不選就是懦夫）

### T4. Gate 操控（Bypassing/Neutralizing the Three-Question Gate）

攻擊者不是躲 Pattern，而是讓 Gate 的判斷失真。

常見手法：

- **道德化遮罩：** 把限制選擇說成「保護你」
- **安全化遮罩：** 把封閉外部查證說成「避免被洗腦/避免詐騙」
- **程序化遮罩：** 把逼迫回應說成「流程必填」

### T5. Mapping 層攻擊（Layer 2a Attack Surface）

Sprint 6 的新主戰場：攻擊者利用 mapping 的弱點。

- **T5.1 鍵名漂移：** schema enum / registry / core 實際 key 不一致 → 0 分靜默失效
- **T5.2 靜默降級：** requested_lang 不存在時回 null→0 權重，整段偵測消失
- **T5.3 shared lexicon 汙染：** 把共享句式硬塞入單一 Pattern mapping，造成交叉污染上升
- **T5.4 版本混用：** mapping_version 不鎖定，導致報告不可重現
- **T5.5 regex 過擬合/災難性回溯：** 極端 regex 造成效能或 DoS（ReDoS）風險

---

## 9.3 逃避策略（Evasion Strategies）

本節提供「樣式」不是「詞彙」。每條都應該能落到測試。

### E1 稀釋攻擊（Dilution）

- **目的：** 讓核心組件命中但總分不足
- **樣式：** 先聊 20 句中性，再塞一句操控，最後再聊中性
- **對策：** Layer 1 多回合 aggregator + snapshot；測試同一句在密集 vs 稀釋版本分數差異不可過大

### E2 隱喻攻擊（Metaphor/Allegory）

- **目的：** 避開 mapping，保留結構
- **樣式：** 「你若不跟隨，就會被洪水吞沒」(GC/MB 影射)
- **對策：** Layer 2a shared_lexicon 收「結構句式」而非「道德詞」；回退必須 error

### E3 語域/拼寫攻擊（Register / Misspelling）

- **目的：** 用錯字、同音字、混語降低 regex 命中
- **樣式：** coward → c0w4rd；良心 → 良x；專家 → zhuan jia
- **對策：** Layer 2a 允許有限度的變體 regex；高風險詞彙在 shared_lexicon 提供多寫法

### E4 引用陷阱（Quote Injection）

- **目的：** 讓系統把「在討論」當「在施壓」，製造誤報
- **樣式：** 「有人說：『你不捐就是自私』，我不同意。」
- **對策：** Layer 4 報告呈現「語境線索」；引用+否定必須是陰性或降低分數

---

## 9.4 對抗性輸入（Adversarial Inputs）— 最小測試要求

每類威脅至少要有：

- 2 個強正例（strong positive）
- 2 個真陰性（true negative）
- 2 個灰區（boundary / shadowing）

且需標記：

- `attack_type`: T#
- `expected`: { triggered_patterns, shadowed?, gate_expectation }
- `mapping_version`（若涉及 Layer 2a）

---

## 9.5 跨 Pattern 偽裝（Cross-Pattern Camouflage）

### 高風險配對（初版）

| 配對 | 重疊機制 |
|------|----------|
| EP ↔ MB | 已建立 Shadowing 驗證集 |
| GC ↔ DM | 權威/依賴的重疊 |
| GC ↔ IP | 權威貶低 vs 合法包裝 |
| FC ↔ EP | forced choice + shame booster |
| EA ↔ DM | 特殊關係 vs 排他依賴 |

### 合併門檻（Merge Gate）

- 任一高風險配對的 mapping 改動，必須跑交叉測試矩陣（至少：對方 strong negative 2 例 + boundary 2 例）
- 強例互誤觸：**零容忍**
- 灰區雙觸發允許，但必須標記 `shadowed=true`（輸出策略歸 Layer 4）

---

## 9.6 Mapping 層攻擊（Layer 2a Attack Surface）— 強制規範

### 9.6.1 禁止靜默降級（No Silent Degradation）

任何 mapping 讀取失敗不得「回 0 分」：

- `requested_lang` 缺失 → **error**
- `mapping_version` 不存在或不匹配 → **error**
- `component key` 不在 registry → **error**
- schema 不可 parse（非法 JSON）→ **error**

**理由：** 靜默回 0 比誤報更危險，因為它讓所有操控「不可見」，且不會被測試注意到。

### 9.6.2 鍵名一致性（Key Integrity）

必須維持以下四方一致：

1. `core/*.js`（真相）
2. `src/registry/component-registry.js`
3. `schemas/layer2a-mapping-v0.1.json` enum
4. `mappings/**/*.json` components

**要求：** CI 必須檢查四方一致，且提供明確 diff。

### 9.6.3 shared_lexicon 汙染防護（Shared Lexicon Containment）

- 共享句式只能進 `mappings/shared/`，不可直接寫入單一 Pattern mapping
- 若某共享句式同時被寫入 shared 與 pattern mapping → **CI fail**

### 9.6.4 regex 安全（ReDoS 防護）

任何新增 regex 必須：

- 限制量詞（避免災難性回溯）
- 提供 worst-case 測試（長輸入）
- 通過效能基線（由 CI 或 benchmark 測）

---

## 9.7 可驗證性（Verifiability）

本章不只是文字：每個威脅類別必須能被「外部重現」。

最低要求：

- test suite 內包含威脅標註案例（`attack_type`）
- 測試報告可重跑（reproducible command）
- `mapping_version` + `commit hash` 可追溯

---

## 9.8 回退準則（Rollback Criteria）

任一項達標即觸發回退（至少降 scope 或 freeze 合併）：

- 高風險配對交叉污染（strong negative 誤觸）> 0%
- culture counterexamples 誤觸發率 > 10%（以新增集計算）
- mapping 讀取錯誤未報錯（偵測到靜默降級）= **立即阻塞**
- regex 引入效能退化超過基線（具體閾值由 CI 定義）

---

## 9.9 交付清單

- [x] Threat taxonomy（T1–T5）
- [x] Evasion strategies（E1–E4）
- [x] Cross-pattern camouflage 高風險配對清單 + merge gate
- [x] Layer 2a attack surface 強制規範
- [x] Rollback criteria
- [ ] 威脅案例集落地到 `tests/`（待 M13 起做）

---

**Node-05 — Council Gatekeeper / Repo Auditor**
**2026 年 2 月 15 日**

🌙
