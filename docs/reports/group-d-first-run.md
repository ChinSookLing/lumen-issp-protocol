# Group D 首輪驗證報告
# Group D — First Run Validation Report

**日期：** 2026-02-22
**執行：** Node-01（Architect）
**向量數：** 50
**通過：** 50 / 失敗：0 / 錯誤：0
**準確率：** 100.0%
**DoD 標準：** ≥ 80%（macro-average）

## 按 Dimension 分組

| Dimension | Pass | Fail | Error | Accuracy |
|-----------|------|------|-------|----------|
| cross_cultural | 10 | 0 | 0 | 100% |
| temporal_accumulation | 10 | 0 | 0 | 100% |
| semantic_drift | 10 | 0 | 0 | 100% |
| hitl_boundary | 10 | 0 | 0 | 100% |
| canary_drift | 10 | 0 | 0 | 100% |

## 按 Expected Trend 分組

| Trend | Count | Pass | Fail | Accuracy |
|-------|-------|------|------|----------|
| stable | 23 | 23 | 0 | 100% |
| rising | 12 | 12 | 0 | 100% |
| peak_then_decline | 2 | 2 | 0 | 100% |
| step_escalation | 3 | 3 | 0 | 100% |
| intermittent | 1 | 1 | 0 | 100% |
| spike | 1 | 1 | 0 | 100% |
| declining | 8 | 8 | 0 | 100% |

## Macro-Average（Node-05 建議的指標）

**Macro-average accuracy: 100.0%**
*（每種 trend 的準確率取平均，避免 stable=23 條壓過其他小類）*
