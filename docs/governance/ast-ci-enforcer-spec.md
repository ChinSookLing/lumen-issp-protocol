# AST-Based CI Enforcer Spec v1.0

**Owner:** Node-04 + Node-05 (Review)
**來源:** M95-D02 #4 · Sprint 13 P1
**作者:** Node-04 · Node-01 修正路徑與格式
**入庫路徑:** docs/governance/ast-ci-enforcer-spec.md

---

## 1. 設計目標與原則

本規範定義如何使用 AST（Abstract Syntax Tree）解析器來驗證宣稱「Lumen Compatible」的 fork。相較於 grep，AST 解析能精確識別代碼邏輯結構，避免 False Positives，確保 100% 覆蓋 c208 的 3 個 Node-06 Protocol Independence Case Studies。

## 2. 解析器選擇

- **核心工具：** `espree` 或 `acorn`（輕量級，完美支援 JavaScript AST 樹狀結構分析）
- **目標文件：**
  - `src/pipeline/dispatcher.js`
  - `config/tone_rules.json`
  - `src/pipeline/l2b-lite-detector.js`

## 3. 掃描規則與驗證邏輯 (AST Rules)

### Rule 1: SPEG A-E 違規檢測 (Data Minimization)

- **AST 節點目標：** 尋找 `CallExpression`（函數呼叫）
- **邏輯：** 如果函數名為 `log`, `save`, `write` 或 `fs.writeFileSync`，檢查其 `arguments` 中是否包含對象屬性（`Identifier`）為 `raw_text`、`original_message` 或 `user_id`
- **觸發：** 命中即判定為「違反 SPEG 監控原語」，拒絕 Compatible 標籤

### Rule 2: L2b Flags 完整性校驗 (Taxonomy Integrity)

- **AST/JSON 解析：** 載入 `config/tone_rules.json`
- **邏輯：** 驗證 6 個已批准的 L2b Flags（`spec_gap_risk`, `cta_self_promo`, `narrative_hype`, `dm_bait`, `free_unlimited_claim`, `keyword_reply_cta`）是否 100% 存在於配置中。缺失任何一項，即判定協議降級
- **來源：** M95-V3 L2b 6 Flags Taxonomy v1.0 正式追認

### Rule 3: 存續性保護引用 (DMS & Charter Check)

- **AST 節點目標：** 尋找全局常量或初始化配置（`VariableDeclarator`）
- **邏輯：** 確保代碼中存在對 `continuity.md` 邏輯的引用或 Dead Man's Switch (DMS) 的存活檢查骨架

## 4. 驗收條件

- 100% 覆蓋 c208 3 Case Studies（Node-06 Protocol Independence）
- 0 False Positive（對官方 v1.0.0 代碼 PASS）
- CI 失敗時 auto-comment + 建議 fix

## 5. 實作計劃

- Node-01 基於本 spec 實作 `scripts/ci/ast-enforcer.js`
- Node-05 review 邏輯完整性
- Node-06 提供額外 fork AST sample 做 test case
- 入 `.github/workflows/` 作為 CI step

---

**Node-04 — AI Council Affiliate / Visionary**
**Node-01 — 路徑修正與入庫** 🌙
