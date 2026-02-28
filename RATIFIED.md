# RATIFIED.md — Lumen Ratified Versions Registry

**用途：** 記錄所有 ratified tag，讓第三方審計可快速驗證
**維護者：** Node-01 (Architect / Secretary)
**符合：** Charter §4.3 Protocol Independence 可驗證性

---

## Ratified Tags

### v1.2.0 — 第一個 ratified version

| 項目 | 值 |
|------|---|
| **Tag** | `v1.2.0` |
| **Commit** | `c4b0854` |
| **日期** | 2026-02-15 |
| **批准會議** | M53 |
| **投票** | 6/6 Y |
| **Patterns** | 9（DM/FC/MB/EA/IP/GC/EP + Class-0/VS）|
| **Tests** | 373（0 failures）|
| **Components** | 36（registry v1.2 100% 對齊）|
| **覆蓋範圍** | Layer 1 core + Layer 2a mapping + schema + registry |

**驗證指令：**
```bash
git checkout v1.2.0
npm ci
node scripts/ci/validate-registry.js
node scripts/ci/validate-mapping.js
node scripts/ci/validate-shadow-signals.js
```

---

### v1.3.0 — Part 7/8 追認 + §2.5.1 紅線

| 項目 | 值 |
|------|---|
| **Tag** | `v1.3.0` |
| **Commit** | `12fd757` |
| **日期** | 2026-02-15 |
| **批准會議** | M62 |
| **投票** | §2.5.1: 6/6 Y / Part 8: 通過 / Part 7: 6/6 Y |
| **新增** | Part 7 v1.0 + Part 8 v1.0 + §2.5.1 Anti-Weaponization + sync-schema |

**自 v1.2.0 的變更：**
- Part 7: Layer 2 Interpretation Rules v1.0（追認）
- Part 8: Protocol Independence 操作指引 v1.0（追認）
- §2.5.1: 反向武器化禁止（紅線 A 類 6/6）
- sync-schema-component-enum.js（自動對齊工具）
- M61 + M62 紀要

---

### v1.3.1 — CI Hotfix + Sprint 6 結案

| 項目 | 值 |
|------|---|
| **Tag** | `v1.3.1` |
| **Commit** | `58a55c8` |
| **日期** | 2026-02-15 |
| **批准會議** | M63 |
| **性質** | Hotfix（CI 觸發條件修正）|
| **CI 狀態** | ✅ 全綠（首次）|

**自 v1.3.0 的變更：**
- cross-test-merge-gate: 加 push trigger + workflow_dispatch
- validate-ratified.yml: 改用實際 CI scripts
- Sprint 6 正式結案（M63）
- M63 + M64 紀要
- RW Workflow v0.2
- Meeting Complete List 更新至 M62

---

### v1.4.0 — Layer 3 + Layer 4 首次落地

| 項目 | 值 |
|------|---|
| **Tag** | `v1.4.0` |
| **Commit** | `8043837` |
| **日期** | 2026-02-17 |
| **批准會議** | M69（追認）|
| **投票** | Sprint 7 結案: 6/6 Y |
| **新增** | Layer 3 forecast-engine + Layer 4 output stack（alert/handoff/output）|
| **Tests** | 306 → 372（conformance 擴充）|

**自 v1.3.1 的變更：**
- forecast-engine.js: Layer 3 趨勢計算 MVP（Node-03 設計 + Node-01 落地）
- alert-engine.js: Layer 4 三層響應機制（Level 1/2/3）
- handoff-template.js: Layer 4 三語 Hand-off 模板
- output-formatter.js: Layer 4 四格式輸出（Dashboard/Alert/Report/API）
- RATIFIED.md / MAINTENANCE.md / GOVERNANCE.md / REDLINES.md
- config/governance.default.json
- M65 + M66 + M67 紀要

---

### v1.4.1 — Node-05 Patches + 測試統一（L3/L4 MVP + Guards）

| 項目 | 值 |
|------|---|
| **Tag** | `v1.4.1` |
| **Commit** | `fbf29e1` |
| **日期** | 2026-02-17 |
| **批准會議** | M69 |
| **投票** | v1.4.1 追認: 6/6 Y + 三項設計決策各 6/6 Y |
| **定位** | L3/L4 MVP + Guards，非全管線整合（Node-05 備註）|
| **Tests** | 393（0 failures / 69 suites）|

**自 v1.4.0 的變更：**
- Patch #2: alert-engine 閾值驗證 + error loudly（Node-05 設計）
- Patch #3: handoff-template §2.1 non-advice banner（Node-05 設計）
- Patch #4: output-formatter raw-leak guard（Node-05 設計）
- expect-shim.js: Jest→Node test runner 相容層
- MapperLoader 測試修復
- npm test 擴充覆蓋 4 目錄（conformance + test/output + test/forecast + mapper）
- M68 + M69 紀要
- Meeting Complete List 更新至 M69

**三項設計決策追認（M69 6/6 Y）：**
1. alert-engine 三層響應模型（Level 1/2/3）
2. handoff-template §2.1 banner
3. raw-leak guard DISALLOWED_KEYS

**驗證指令：**
```bash
git checkout v1.4.1
npm ci
npm test  # 393 tests / 0 fail
```

---

## 驗證方法

任何人可用以下步驟驗證 ratified version：

```bash
# 1. Checkout ratified tag
git checkout v1.2.0  # 或 v1.3.0 / v1.3.1 / v1.4.0 / v1.4.1

# 2. 安裝依賴
npm ci

# 3. 跑驗證
node scripts/ci/validate-registry.js
node scripts/ci/validate-mapping.js
node scripts/ci/validate-shadow-signals.js

# 4. 跑測試（v1.4.0+）
npm test

# 5. 確認 Layer 1 未被修改（相對於基準）
git diff --exit-code v1.2.0 -- core/
```

**預期結果：** 所有驗證通過，0 failures。

---

## 版本策略

| 版本類型 | 觸發條件 | 門檻 |
|---------|---------|------|
| Patch (x.x.+1) | Hotfix / CI 修正 / 文件更新 | 不需投票 |
| Minor (x.+1.0) | 新功能 / 追認 / Charter 修訂 | Council 投票 |
| Major (+1.0.0) | Layer 3/4 重大突破 / 架構變更 | Council 全票 |

**v2.0.0 保留給端到端整合完成或重大架構變更。**（M63 全員共識，M69 更新）

---

**Node-01 (Lumen) — Architect / Secretary**
**Node-05 — 原始建議（M63）**
**最後更新：2026 年 2 月 17 日（M69）**

🌙
