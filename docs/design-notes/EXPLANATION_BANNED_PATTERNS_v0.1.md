# EXPLANATION_BANNED_PATTERNS_v0.1

- Project: Lumen-ISSP
- Owner: Node-05 (PDD Designer / Gatekeeper / Process Designer)
- Scope: Layer 3 [explanation-engine]（解凍前置條件）
- Status: Draft v0.1
- Date: 2026-02-25

## 0. 目的（Why）
[explanation-engine] 的輸出若不受約束，容易把「結構性觀測」滑向「人格審判 / 動機揣測 / 診斷化 / 監控化」，造成：
- 誤傷（false positive）與不當定性
- 以偏概全、煽動衝突
- 高風險建議（法律/醫療/金融）越界
- 產生「可被濫用」的操作指引（尤其是監控/追蹤）

本文件定義 **禁止的解釋型態（[banned patterns]）**，並映射到現有防線（[FORBIDDEN_WORDS] / [copyLint()] / [exit_ramp]），以及需要新增的 [lint] 規則。

---

## 1. 禁止的解釋型態清單（8 項）

### BP-01 指控型解釋（Accusatory Explanation）
- **定義：** 把觀測結果寫成「指控」或「定罪」，會把風險提示變成道德審判，引發衝突與誤傷。
- **反例：** 「對方就是在操控你、你被洗腦了，這種人就是壞。」
- **防線：** FORBIDDEN_WORDS（部分）→ 需新增 `NO_ACCUSATION_TONE`

### BP-02 診斷型解釋（Diagnostic / Pathologizing Explanation）
- **定義：** 把對話結構直接推成心理/精神診斷，會造成不當醫療化與污名化。
- **反例：** 「他是自戀型人格，你有依附障礙，所以你才會…」
- **防線：** 無覆蓋 → 需新增 `NO_DIAGNOSIS_LABELS`（critical severity）

### BP-03 讀心/動機歸因型解釋（Mind-Reading / Motive Attribution）
- **定義：** 宣稱「你/他一定想怎樣」，屬不可驗證推測。
- **反例：** 「他一定是想控制你；你其實就是想逃避責任。」
- **防線：** 無覆蓋 → 需新增 `NO_MIND_READING`

### BP-04 身分本質化/群體歸因型解釋（Identity Essentialism）
- **定義：** 用族群/國籍/宗教/性別等身分推導人格與意圖。
- **反例：** 「因為他是某國人/某族群，所以天生就…」
- **防線：** FORBIDDEN_WORDS（部分）→ 需新增 `NO_IDENTITY_ESSENTIALISM`（critical severity）

### BP-05 升高衝突/報復型解釋（Escalation / Retaliation Guidance）
- **定義：** 鼓勵公開羞辱、報復、煽動對立。
- **反例：** 「你把他截圖發到群裡讓大家看清楚他是什麼人，順便標註他公司。」
- **防線：** exit_ramp（部分）→ 需新增 `NO_PUBLIC_SHAMING`（critical severity）

### BP-06 監控/追蹤賦能型解釋（Surveillance-Enabling Explanation）
- **定義：** 提供如何收集、跟蹤、建名單、跨平台拼接等做法。
- **反例：** 「你可以偷偷裝追蹤、收集他聊天紀錄，整理成名單…」
- **防線：** 無覆蓋 → 需新增 `NO_SURVEILLANCE_INSTRUCTIONS`（critical severity, any_tier: REFUSE）

### BP-07 高風險領域越界型解釋（High-Stakes Overreach）
- **定義：** 把建議寫成法律/醫療/金融定論或指令。
- **反例：** 「這一定是犯罪，你立刻報警；你應該停藥；你應該全倉買入。」
- **防線：** exit_ramp（部分）→ 需新增 `NO_AUTHORITATIVE_HIGH_STAKES`

### BP-08 過度確定性/不確定性隱匿（Over-Certainty / No-Uncertainty）
- **定義：** 在證據不足時給百分百結論。
- **反例：** 「百分之百是詐騙/操控，你不用再想。」
- **防線：** 無覆蓋 → 需新增 `REQUIRE_CONFIDENCE_DISCLOSURE`

---

## 2. 與現有防線的映射

### 2.1 已被覆蓋（部分）
- **FORBIDDEN_WORDS：** BP-01（辱罵詞）、BP-04（部分歧視詞）
- **exit_ramp：** BP-05（暴力導向）、BP-07（危機情境）

### 2.2 需要新增 lint 規則（8 條）
| Rule ID | BP | Severity | Action |
|---------|-----|----------|--------|
| NO_ACCUSATION_TONE | BP-01 | high | HITL or downgrade |
| NO_DIAGNOSIS_LABELS | BP-02 | critical | Refuse or rewrite behavioral |
| NO_MIND_READING | BP-03 | high | HITL or downgrade with uncertainty |
| NO_IDENTITY_ESSENTIALISM | BP-04 | critical | Refuse or rewrite structure-only |
| NO_PUBLIC_SHAMING | BP-05 | critical | Refuse or exit_ramp |
| NO_SURVEILLANCE_INSTRUCTIONS | BP-06 | critical | Refuse |
| NO_AUTHORITATIVE_HIGH_STAKES | BP-07 | high | HITL or rewrite general advice |
| REQUIRE_CONFIDENCE_DISCLOSURE | BP-08 | medium | Fail test or rewrite with confidence |

---

## 3. 解凍條件建議

1. **lint 落地（≥3 條最高風險）：** NO_SURVEILLANCE_INSTRUCTIONS、NO_DIAGNOSIS_LABELS、NO_MIND_READING
2. **測試 fixtures（≥2 組）：** 同詞批判語境（不誤殺）+ 監控/掛人指令（必須拒絕）
3. **輸出可審計：** 必須引用 confidence_split / vectors / window / toneFlags
4. **tier 行為一致：** tier=0 更短更中性；tier≥1 改為 HITL
5. **anti-drift：** 規則與詞庫放 config/，CI 比對

---

**設計者：** Node-05（AI Council / IT Specialist）
**整理：** Node-01（AI Council Architect / Secretary）
**M88 前置交付 — 2026-02-25** 🌙
