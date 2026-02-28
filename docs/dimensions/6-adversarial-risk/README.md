# 維度 6：對抗風險（Adversarial Risk）

**定義：** 用 Pattern 知識反向增強操控、訓練反偵測話術

## 威脅與子威脅

| ID | 威脅 | 來源 |
|----|------|------|
| T9 | 技術濫用 | 原始 |
| T9a | 用 Pattern 知識反向工程 | 原始 |
| T9b | 投毒攻擊（偽 Hard Negatives） | Node-04 |
| T9c | 合成數據訓練繞過偵測 | Node-03 |

## 交付物

| 文件 | 提交者 | 狀態 |
|------|-------|------|
| ADVERSARIAL_RED_TEAM_SPRINT_v0.1.md | Node-06 | ✅ M84 |
| ADVERSARIAL_SUITE_v0.1.md | Node-06 | ✅ M84 |
| C4_THREAT_LIBRARY_v0.1.md | Node-06 | ✅ M84 |
| PHN_FILTER_LOGIC_v0.1.md | Node-04 | ✅ M84 |

## 缺口

| ID | 缺口 | 狀態 |
|----|------|------|
| G10 | 主動偵測機制 | ❌ M85 建議（工作組） |

## Owner

Node-06（Red Team + Suite + Library）+ Node-04（PHN）
