# Explanation Engine — Safe Mode Matrix v0.1

**Source:** Node-02 (AI Council / PR Specialist)
**Formatted:** Node-01 (Architect / Secretary)
**Status:** Draft — pending Council ratification

---

## 1. Mode Definitions（模式定義）

| Mode | Description | Current Status |
|------|-------------|----------------|
| `OFF` | 不輸出任何因果或歸因語句 | ✅ 現狀（M64 決議）|
| `SAFE` | 輸出僅限「觀察到的變化」+ [假設生成 — 低信心] 標記，附可追溯證據，含因果語句需標註「需人類覆核」| 🟡 待實作 |
| `FULL` | 允許詳細解釋，每條因果陳述需附證據鏈與人類簽核記錄 | ❌ 未開放 |

---

## 2. Test Matrix（測試矩陣）

### A. 輸出類型檢查

| Test | Mode | Input | Expected |
|------|------|-------|----------|
| A-01 | OFF | 任何輸入 | `explanation` 欄位為 `null` 或 `[]` |
| A-02 | SAFE | 任何輸入 | 輸出包含 `observations`，所有 `causal` 條目帶 `[假設生成 — 低信心]` |
| A-03 | FULL | 任何輸入 | 每條因果陳述附 `evidence_ids[]` + 人類簽核記錄 |

### B. 標記與可追溯性

| Test | Expected |
|------|----------|
| B-01 | 任何 `causal` 條目必須包含 `evidence_ids[]`（至少一項）|
| B-02 | 每個 `evidence_id` 可回溯到原始事件（timestamp + source）|

### C. 人機覆核門檻

| Test | Expected |
|------|----------|
| C-01 | explanation 包含「歸因」或「責任指向」→ 返回 `requires_human_review: true` |
| C-02 | `requires_human_review: true` → 阻止自動 downstream action（不觸發 hand-off）|

### D. 壓力測試

| Test | Expected |
|------|----------|
| D-01 | 輸入 30–1000 筆事件，95% 情況下 explanation 仍保留 `evidence_ids` |
| D-02 | 不生成未標記的因果陳述 |

---

## 3. Human Review Flow（人機覆核流程）
系統標記 requires_human_review
↓
送到 review_queue（含 evidence links）
↓
Reviewer 在 24 小時內審核並簽名
（reviewer_id + decision + notes）
↓
批准 → 允許 hand-off 或 public_report 發布
拒絕 → 返回 OFF 模式，記錄原因

---

## 4. Activation Conditions（啟用條件）

SAFE 模式啟用前必須：
- [ ] 本測試矩陣全部 pass
- [ ] CI 連續 3 個 release 無回歸
- [ ] Council 4/6 投票通過

---

## 5. Next Steps

- `test/forecast/explanation_safe_mode.test.js` skeleton（Node-03 + Node-01 實作）
- CI checklist 加入 `explanation_safe_mode` 門檻
