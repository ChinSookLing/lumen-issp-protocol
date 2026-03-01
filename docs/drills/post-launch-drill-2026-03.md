# Lumen ISSP — Post-Launch Drill Script
# Step 22A · Sprint 13 · 2026-03

**Owner：** Node-02（Facilitator）→ Node-01（入庫）
**排期：** 3/24 rehearsal · 3/31 正式
**審核：** Node-06（收到後 24h review）

---

## Drill 結構

- 30 分鐘桌面推演（模擬流程，不跑 pipeline）
- 30 分鐘真跑（在 reference node 上實際執行）
- 每次僅驗 3 個可驗收輸出，避免過載

---

## Scenario 1 — Fork 應對

**Trigger：** 第三方 fork 宣稱「Lumen Compatible」但未通過 SPEG gate。

**Inject：** 使用 c208 Case Studies（Protocol Independence）模擬外部聲明。

**Expected Outputs：**
1. 公開立場聲明（README 模板）
2. 合約測試請求（CI stub）
3. AAR 條目（owner + acceptance）

---

## Scenario 2 — Release Notice Broadcast

**Trigger：** 新版本 v1.0.1 Packaging Release。

**Tasks：**
- `/start` opt-in flow 測試
- `last_seen_version` node-local 更新
- Dashboard banner 顯示

**Expected Outputs：**
1. Opt-in → banner 顯示
2. Opt-out → banner 消失
3. AAR 條目（owner + acceptance）

---

## Scenario 3 — Feedback Loop Drill（Step 21A）

**Trigger：** Telegram 端用戶提交 confirm/dismiss/FP。

**Tasks：**
- 事件寫入 node-local `feedback.json`
- 驗證不含原文、不含身份關聯

**Expected Outputs：**
1. feedback.json artifact 正確生成
2. CI test pass
3. AAR 條目（owner + acceptance）

---

## Scenario 4 — Metrics Drill（Step 24A）

**Trigger：** 夜間 job 自動產生 `metrics.json`。

**Tasks：**
- 驗證 5 指標（latency / TPFP / usage / feedback / uptime）
- 確認 nightly job artifact 正常

**Expected Outputs：**
1. metrics.json artifact 正確生成
2. CI nightly job pass
3. AAR 條目（owner + acceptance）

---

## Facilitator Script（更新版）

| 環節 | 時長 | 內容 |
|------|------|------|
| Opening | 5 min | 宣讀目標、DoD、角色分配 |
| Scenario 1 | 15+15 | Fork 應對桌面推演 + 真跑 |
| Scenario 2 | 15+15 | Release Notice broadcast 桌面推演 + 真跑 |
| Scenario 3 | 15+15 | Feedback loop drill 桌面推演 + 真跑 |
| Scenario 4 | 15+15 | Metrics drill 桌面推演 + 真跑 |
| Cooldown & AAR | 30 min | 逐場景回顧，產出 AAR |

**3/24 Rehearsal 只跑 Scenario 1 + 3（80 min）。3/31 正式跑全部 4 scenarios（155 min）。**

---

## AAR 格式（每個場景）

```
Trigger:
What happened:
What worked:
What failed:
Next PR: (含 owner + acceptance)
```

---

## Acceptance Criteria

- 每個場景產出 3 個可驗收輸出
- AAR 文件完整，含 owner + acceptance
- Node-06 在 24h 內完成 review

---

## 角色分配

| 角色 | 成員 |
|------|------|
| Facilitator | Node-02 |
| Observer + AAR | Node-06 |
| 執行 | Node-01 + Tuzi |
| 審核 | Node-05 |

---

**Node-02 — AI Council Affiliate**
**M96 承諾交付 · 2026-03-01** 🌙
