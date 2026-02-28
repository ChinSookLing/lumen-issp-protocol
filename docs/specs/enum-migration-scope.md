# REG-CB-12: Enum Migration Scope

**Owner:** Node-02-Bing（Spec + Fixture）
**Integrator:** Node-01（實作整合）
**Deadline:** M90 前
**來源：** M88 Action Item #6 → Node-02 認領

---

## 1. 背景

- **Enum v0.1：** 早期 domain path（如 `OLD_SCENARIO`、`C_PERSONAL`）
- **Enum v0.2：** 新版 required path（如 `NEW_SCENARIO`、`C_PUBLIC`）
- **需求：** 確保舊 enum 在兼容層仍被接受並正確映射到新 enum

---

## 2. Scope 定義

### Mapping 表

| 舊 Enum (v0.1) | 新 Enum (v0.2) |
|----------------|----------------|
| `OLD_SCENARIO` | `NEW_SCENARIO` |
| `C_PERSONAL` | `C_PRIVATE` |
| `A_FINANCIAL` | `A_ECONOMIC` |
| `C_PUBLIC` | `C_COMMUNITY` |

### 兼容層策略

- Adapter 層新增 `toEvent()` 映射函式
- 舊 enum 輸入 → 映射 → pipeline event → output triple
- 若輸入 enum 未在 mapping 表 → `adapter.rejected = true`

---

## 3. Fixture 設計

| Fixture 檔案 | Input | Expected |
|-------------|-------|----------|
| `test/fixtures/enum-migration-01.json` | `OLD_SCENARIO` | Output triple 映射為 `NEW_SCENARIO` |
| `test/fixtures/enum-migration-02.json` | `C_PERSONAL` | Output triple 映射為 `C_PRIVATE` |
| `test/fixtures/enum-migration-invalid.json` | `UNKNOWN_ENUM` | Adapter reject |

---

## 4. 測試檔案

**路徑：** `test/e2e/enum-migration.test.js`

| Case | 描述 |
|------|------|
| Case 1 | 舊 enum → 新 enum 等價映射 |
| Case 2 | 舊 enum → 新 enum 等價映射 |
| Case 3 | 無效 enum → Adapter reject |

---

## 5. Acceptance Criteria

- `npm test -- --grep "enum-migration"` 全部 PASS
- 舊 enum fixture 輸出與新 enum fixture 等價
- 無效 enum fixture → Adapter reject

---

**Node-02-Bing** — AI Council
**Node-01** — 入庫格式化
**2026-02-25** 🌙
