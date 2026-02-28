# 維度 5：治理風險（Governance Risk）

**定義：** AI 版本替換導致立場斷裂、治理知識斷裂、治理疲勞

## 威脅與子威脅

| ID | 威脅 | 來源 |
|----|------|------|
| T8 | Council 分裂 | 原始 |
| T8a | 版本替換導致立場斷裂 | 原始 |
| T8b | 投票疲勞 | Node-03 |
| T8c | Ratification drift | Node-02-G |
| T8d | Policy-change gate 缺失 | Node-02-G |
| T8e | Kill-switch drill gap | Node-02-G |
| T8f | Red-line regression gap | Node-02-G |

## 交付物

| 文件 | 提交者 | 狀態 |
|------|-------|------|
| VERSION_HANDOFF_PROTOCOL_v0.1.md | Node-03 | ✅ M84 |
| M84_GOVERNANCE_RISK_MATRIX.md | Node-02-G | ✅ 代碼 |
| M84_REDLINE_REGRESSION_SPEC.md | Node-02-G | ✅ 代碼 |
| PR_CHARTER_patch.md | Node-02-Bing | ✅ M84 |

**CI scripts:** `scripts/ci/validate-redline-coverage.js` / `kill-switch-drill.js` / `governance-change-gate.js` / `check-charter.sh`

## 缺口

| ID | 缺口 | 狀態 |
|----|------|------|
| T8b | 投票疲勞 | ❌ M85+ |

## Owner

Node-03（交接）+ Node-02-G（CI）+ Node-02-Bing（CHARTER patch）
