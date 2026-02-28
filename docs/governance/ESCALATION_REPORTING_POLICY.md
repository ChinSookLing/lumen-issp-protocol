# ESCALATION_REPORTING_POLICY v0.1-lite
# Lumen ISSP — Escalation & Reporting Policy

**通過會議：** M80（2026-02-22）
**門檻：** C1（≥5/6 + 無根本反對）— Red Line / Governance 類別
**結果：** 6/6 通過（as draft）
**起草：** Node-05（Council Lead）+ Council 全員討論
**落地：** Node-01（Architect）

---

## 適用範圍

本文件規範 Lumen 在偵測到操控模式（manipulation pattern）後的**處置流程**。

**與 DEPLOYMENT_POLICY 的邊界（M80 觀察 1，6/6 共識）：**

| 文件 | 範圍 |
|------|------|
| `DEPLOYMENT_POLICY.md` | 怎麼裝、rollout、canary、rollback（靜態部署規範） |
| `ESCALATION_REPORTING_POLICY.md`（本文件） | 發現問題後怎麼處理、HITL、隱私（動態風險響應） |

> 「部署 ≠ 處置；處置不自動化；部署監控支援處置但不替代治理決策。」— Node-05 (M80)

---

## 四大核心規則

### R1：Default OFF

Escalation reporting 預設**關閉**。

- 節點管理員必須**主動啟用**才能開啟回報功能
- 啟用時必須告知使用者該功能已開啟
- 不得靜默啟用（no silent activation）

### R2：No Automated Punishment

Lumen 的偵測結果**不得自動觸發懲罰性行為**。

- 不得自動封鎖使用者
- 不得自動移除訊息
- 不得自動降低使用者權限
- 不得自動通報第三方

偵測結果僅作為**資訊提供**，行動決策由人類做出。

### R3：HITL Required（Human-In-The-Loop）

所有升級決策**必須有人類介入**。

- Lumen 可以標記、計算、產生報告
- Lumen **不得**代替人類做出升級決策
- 任何導致使用者受影響的行動，必須經過人類確認

> 「R3 HITL Required 在 2026 年複雜的政治/金融環境下是防止 AI 誤判引發系統性風險的紅線。」— Node-04 (M80)

### R4：Privacy First

偵測過程中的數據處理必須遵守隱私優先原則。

- 不得存儲原始訊息內容（僅存 pattern hit + score）
- 不得將個人可識別資訊（PII）傳送至外部
- 日志必須可配置保留期限
- 使用者有權查閱與自己相關的偵測記錄

---

## 附帶意見（記錄在案）

| 成員 | 意見 |
|------|------|
| Node-06 | 建議「你完了/你會後悔」類句型預設走 L2（Layer 2 升級通道） |
| Node-04 | 強調 R3 HITL 是防止 AI 誤判的紅線 |
| Node-03 | 需與 DEPLOYMENT_POLICY 釐清邊界（已在 M80 觀察 1 解決） |

---

## 未來擴展

- [ ] 與 HITL Reason Code Registry 整合（Node-05 設計，M81 議題四）
- [ ] 定義具體的 escalation level（L1 silent → L2 flag → L3 alert → L4 handoff）
- [ ] 與 Structured Hand-off Protocol（Class-0 / VRI）的銜接
- [ ] 節點特定的 escalation 配置（core/ vs nodes/ 分離後）

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| v0.1-lite | 2026-02-22 | 初版，M80 通過四大核心規則 |

---

**起草：** Node-05 — AI Council Lead + Council 全員
**落地：** Node-01 — AI Council Architect / Secretary
**批准：** Tuzi — AI Council 創始人

🌙
