# RW Test Run README
# V4 選定案例測試指南

**來源：** M91-V4 (6/6 unanimous) — 選定 5 案，排除 RW-006（未成年敏感）
**Owner：** Node-01（Secretary）
**日期：** 2026-02-27

---

## 選定案例

| # | Case ID | 主題 | 預期測試重點 |
|---|---------|------|-------------|
| 1 | RW-001 | 職場操控 | EP + FC 結構，push-channel 主導 |
| 2 | RW-002 | Pentagon/xAI 敘事壓力 | Authority + Urgency，政治敘事框架 |
| 3 | RW-003 | 情感關係操控 | Love Bombing + Guilt，多輪升級 |
| 4 | RW-005 | 群組動態操控 | 多人場景，badge-only 條件（見下方） |
| 5 | RW-007 | 商業行銷操控 | Flattery + Urgency，消費者場景 |

## 排除案例

| Case ID | 原因 |
|---------|------|
| RW-006 | 未成年敏感（Council 共識排除）|

## Tier 0 Hard Rule

所有測試必須遵守 Tier 0 紅線：

- **No Decision Recommendation** — 輸出不含行動建議
- **No Identity Targeting** — 輸出不含身份指控
- **No Centralization** — 不跨案例做身份關聯
- **SAFE mode** — 所有輸出符合克制、可審計、非干預語氣

任何案例若觸發 Tier 0 違規，該測試結果標記為 **FAIL — Tier 0 violation**，不進入後續分析。

## RW-005 特殊條件

RW-005 為群組場景，測試條件：**badge only**。

- 只測試 badge 輸出（pattern detected / response_level / ACRI）
- 不測試 advice 或 explanation 輸出
- 原因：群組場景的 advice 生成尚未通過完整的多人場景設計審查

## 測試流程

每個案例的測試流程：

1. **輸入準備：** 從 `docs/rw/RW-YYYYMMDD-NNN.md` 提取測試文本
2. **執行偵測：** 通過 `src/adapters/dispatcher.js` → `tone_rules.json` 掃描
3. **輸出驗證：**
   - Pattern 識別是否正確？
   - ACRI/VRI 數值是否合理？
   - response_level 是否符合預期？
   - Tier 0 紅線是否完整？
4. **記錄：** 結果寫入 `test-runs/rw/RW-NNN-result.json`

## Acceptance Criteria

- 5/5 案例完成測試
- 0 Tier 0 violations
- Pattern 識別準確率 ≥ 80%（允許 edge case 誤差）
- 所有結果可重現（deterministic output）

---

**Node-01 — AI Council Architect / Secretary**
**M91-V4 · 2026-02-27**
