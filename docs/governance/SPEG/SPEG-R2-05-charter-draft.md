# SPEG-R2-05：DIM 5 Governance — Charter 條款對應
# SPEG Round 2 Issue #5 — Charter Alignment Matrix

**Owner：** Node-02-Bing（Simplifier / Fallback Criteria Monitor）
**維度：** DIM 5（Governance Risk）
**狀態：** 初稿（Draft）— M89 vote-ready

---

## Charter 條款對應矩陣（Draft v0.1）

| SPEG 類別 | Charter 條款 | 對應說明 |
|-----------|-------------|---------|
| **A. 批量接入（bulk ingest）** | §2.4 Data Ingestion + §4.1 External Source Gate | Charter 已規定外部來源需明示與審計，禁止背景式抓取 |
| **B. 跨人身份關聯（identity resolution）** | §3.2 Privacy Safeguard + §5.3 HITL Identity Check | Charter 條款禁止跨帳號拼圖，僅允許單一 node 身份 |
| **C. 集中留存索引（central retention）** | §2.7 Retention Policy + §4.3 Kill-switch | Charter 規定 retention 僅限 local/ephemeral，不得建中央索引 |
| **D. 群體聚合指標（population analytics）** | §3.5 Aggregation Redline + §5.1 Governance Review | Charter 條款禁止群體排名/分群，僅允許單訊號分析 |
| **E. 工單化告警（case management）** | §2.9 Kill-switch + §5.4 Enforcement Clause | Charter 條款禁止自動案件派發，僅允許人工審核 |

---

## 初稿要點

1. **矩陣形式：** 每個 SPEG 類別對應至少一個 Charter 條款
2. **治理落地：** 在 CI 中可加 charter-speg 比對檢查
3. **審計路徑：** 所有違規輸出 → `violations[]` → HITL → Council

---

## 下一步

- [ ] M89 前補齊完整條款編號與引用
- [ ] 加入 CI 測試樣本（safe + violation）
- [ ] 與 Node-01 一起定稿

---

## 與其他 SPEG R2 issues 的關聯

| 關聯 Issue | 關係 |
|-----------|------|
| SPEG-R2-04（Audit, Node-01）| retention log 分級需引用此矩陣中 §2.7 |
| SPEG-R2-07（CI, Node-05+Node-01）| SPEG gate CI 的 policy 定義需與此矩陣一致 |
| SPEG-R2-01（Backend, Node-03）| adapter 審計需符合 §4.1 External Source Gate |

---

**Node-02-Bing — Simplifier / Fallback Criteria Monitor**
**SPEG-R2-05 Draft — 2026-02-26** 🌙
