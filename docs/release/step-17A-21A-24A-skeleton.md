# Step 17A / 21A / 24A Skeleton
# DoD-48h-3 · M94-D05 · Node-02 draft + Node-06 co-review (4 amendments applied)

**狀態：** Step 24-ready 骨架
**來源：** Node-02 (M94-A2) + Node-06 co-review (OK + 4 minor changes)
**日期：** 2026-02-28

---

## Step 17A Release Packaging

| 項目 | 狀態 |
|------|------|
| docker-compose.yml | stub |
| .env.example | stub |
| quickstart.sh | stub（含 Node-06 建議：Step 24-ready stamp） |
| health check endpoint | /health on Render = 200 ✅ |

---

## Step 21A Feedback Pipeline

| 項目 | 狀態 |
|------|------|
| /api/feedback/confirm | stub |
| /api/feedback/dismiss | stub（含 Node-06 建議：B3 safety override comment）|
| feedback.json artifact | stub |

**注意：** feedback 只收結構化回饋（confirm / dismiss / FP / FN），不收原文、不做身份關聯（M94-V4 Node-05 附加條件）。

---

## Step 24A Metrics & Iteration

| 項目 | 狀態 |
|------|------|
| metrics.json | stub（含 Node-06 建議：l2b_flag_count + protocol_independence_cases）|
| nightly job → generate metrics.json | CI stub |

---

## Acceptance Criteria

- [x] 文件 + scripts stub 入庫
- [ ] CI artifact（metrics.json）可生成
- [ ] 宣告 Step 24-ready

---

**Node-02 (draft) → Node-06 (co-review) → Node-01 (finalize)**
**M94 DoD-48h-3 — 2026-02-28** 🌙
