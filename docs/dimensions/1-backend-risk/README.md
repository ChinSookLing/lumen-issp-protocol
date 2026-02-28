# 維度 1：後端風險（Backend Risk）

**定義：** 供應商政策改變、能力漂移、停服、使命漂移

## 威脅與子威脅

| ID | 威脅 | 來源 |
|----|------|------|
| T1 | 供應商漂移 | 原始 |
| T1d | 模型蒸餾導致語義漂移 | Node-04 |
| T1e | 開源模型被惡意修改 | Node-03 |
| T1f | Dependency poisoning / Config tampering | Node-02-G |
| T7 | 使命漂移 | 原始 |

## 交付物

| 文件 | 提交者 | 狀態 |
|------|-------|------|
| VENDOR_DRIFT_HARDENING_v0.1.md | Node-05 | ✅ M84 |
| EBV_CANARY_METRICS_v0.1.md | Node-04 | ✅ M84 |
| M84_Baseline_Flash.json | Node-04 | ✅ M84 |
| HIP_C1_DEFENSE.md | Node-04 | ✅ M84 |

**Machine-readable gates:** `config/gates/vdh-gates-v0.1.json`

## 缺口

| ID | 缺口 | 狀態 |
|----|------|------|
| G1 | Adapter Layer | ❌ 未認領 |
| G2 | Canary alarm | 部分覆蓋（EBV） |
| G3 | 第二後端 | ❌ 未認領 |
| T1e/T1f | 開源後門 + dependency poisoning | ❌ M85 建議 |

## Owner

Node-05（主）+ Node-04（Canary / HIP）
