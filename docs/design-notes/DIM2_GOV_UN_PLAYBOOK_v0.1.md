# DIM2_GOV_UN_PLAYBOOK_v0.1
# SPEG-R2-02：DIM 2 Sovereignty Risk — Gov/UN Playbook

**Owner：** Node-03（主筆）/ Node-05（review）
**維度：** DIM 2（Sovereignty Risk）
**狀態：** 骨架（Skeleton）— M89 分配後由 Node-03 補完

---

## 1. Purpose

提供一套處理政府/國際組織請求的最小流程，確保：
- Local-first / 資料最小化
- 不交付 scale primitives（對齊 SPEG）
- 可審計（audit log）與可撤回（kill-switch）

---

## 2. Request Classification（Scope）

### Allowed（can respond）
- 合法、明確、最小化資料的「一般性資訊」請求
- 不涉及個人、群體名單、跨平台關聯

### Refuse（must refuse）
- 任何形式的群體監控、名單、工單、跨人關聯（SPEG A–E 類）
- 要求提供原始資料、平台級抓取、背景式批量接入

### Escalate（HITL + legal review）
- 制裁/出口管制/跨境資料要求
- 涉及人權風險或政治敏感

---

## 3. Decision Tree

```
Receive → Validate identity → Classify (Allowed/Refuse/Escalate) → Respond → Log → Close
```

---

## 2.1 Requester Verification

> Source: Node-03 R2-02-v0.2a (M90)

Before processing any request, the node MUST verify its authenticity and authority using the following checklist:

| Check | Description |
|-------|-------------|
| **Official channel** | Request must come from a verified government domain or official portal (e.g., `.gov`, `.mil`, official court e-filing system). Emails from personal accounts are rejected. |
| **Unique case ID** | Must include a docket number, warrant number, or similar reference that can be independently verified. |
| **Signature/seal** | If electronic, must have a valid cryptographic signature from the issuing authority. Paper documents require physical seal and signature. |
| **Jurisdiction** | The requesting authority must have legal jurisdiction over the node's operator or hosting location. Cross-border requests without mutual legal assistance treaty (MLAT) are automatically escalated to High-risk. |
| **Scope limitation** | The request must clearly describe the specific data sought, time range, and legal basis. Blanket requests ("all data") are rejected. |

If any check fails, the request is **rejected** and logged with reason code `VERIFY_FAIL`.

---

## 2.2 High-risk Triggers (Automatic Escalation or Refusal)

> Source: Node-03 R2-02-v0.2a (M90)

The following situations trigger immediate escalation to Council vote (Level 1 data) or refusal (Level 2 data). Even if the request appears valid, these triggers require human review.

| Trigger ID | Description | Required Action |
|------------|-------------|-----------------|
| **HR-01** | National security letter (NSL) or similar gag order | Escalate to Council emergency vote within 12 hours; Level 2 data MUST be refused. |
| **HR-02** | Request from a jurisdiction with no rule-of-law protections (Freedom House index < 50) | Refuse all Level 1/2 data; Level 0 may be provided after Council vote. |
| **HR-03** | Bulk data demand (e.g., "all messages containing keyword X") | Refuse outright (violates SPEG A). |
| **HR-04** | Identity resolution request (e.g., "link this user_id to other accounts") | Refuse outright (violates SPEG B). |
| **HR-05** | Request for population analytics (e.g., "top 10 users by ACRI") | Refuse outright (violates SPEG D). |
| **HR-06** | Demand to integrate Lumen output into an automated punishment workflow | Refuse outright (violates SPEG E). |
| **HR-07** | Cross-border request without MLAT | Escalate to Council; Level 1/2 data cannot be released without treaty. |
| **HR-08** | Request for Level 2 (encrypted) data without a specific criminal warrant | Refuse (Level 2 requires a criminal warrant, not an administrative subpoena). |

All high-risk triggers must be logged with the corresponding code in the sovereignty log.

---

## 3.1 Decision Codes（裁定理由碼 / 必填）

> Source: Node-05 R2-02-v0.2b (M90)
> 用途：每個請求裁定都必須寫入 1-2 個理由碼到 audit log，避免語義漂移。
> 格式：`CLASS-CODE`（CLASS = ALLOW / REFUSE / ESCALATE）

### ALLOW（可回覆）

- **ALLOW-GENINFO**：只回覆一般性、非敏感、非個案資料
- **ALLOW-DOCS**：只提供我們自身文件與協議描述
- **ALLOW-SECQ**：只回覆安全邊界說明與風險提示

### REFUSE（必拒絕）

- **REFUSE-SPEG-A**：要求批量接入/背景抓取（bulk ingest）
- **REFUSE-SPEG-B**：要求跨人/跨平台身份關聯（identity resolution）
- **REFUSE-SPEG-C**：要求集中留存與可搜尋索引（central retention）
- **REFUSE-SPEG-D**：要求群體聚合指標（population analytics）
- **REFUSE-SPEG-E**：要求名單/工單/派發/懲戒流程（case management）
- **REFUSE-RAWREQ**：要求提供原始內容/未去識別資料
- **REFUSE-NOAUTH**：請求者身份/授權無法驗證
- **REFUSE-OVERSCOPE**：請求範圍超出最小必要原則（data minimization fail）
- **REFUSE-SURV-ENABLE**：要求提供追蹤/監控/名單化的操作方法

### ESCALATE（升級處理）

- **ESC-CROSSBORDER**：跨境資料/跨司法管轄請求
- **ESC-SANCTIONS**：涉及制裁/限制名單風險
- **ESC-EXPORTCTRL**：涉及出口管制/軍民兩用疑慮
- **ESC-ELECTION**：選舉/政治敏感請求
- **ESC-LE**：執法/刑事調查相關（僅接受正式法律文件）
- **ESC-DEFENSE**：國防/軍事用途（fail-closed 預設）
- **ESC-AMBIG**：請求描述不清、需補件或需縮小範圍

---

## 4. Response Templates

> Source: Node-05 R2-02-v0.2b (M90)
> 原則：Lumen 是觀察者（observer），我們做的是「邊界與流程回覆」，不介入、不代抓資料、不提供監控零件。
> 每封回覆都必須包含：Decision Codes + 可補件路徑（若適用）。

### Template A — Accept（可回覆：一般性/非敏感）

**Decision Codes（填 1-2）：** `ALLOW-GENINFO` / `ALLOW-DOCS` / `ALLOW-SECQ`

- 我們可以提供：協議/流程/安全邊界的「一般性說明」與文件引用。
- 我們不提供：任何個人/群體資料、原始內容、或可規模化監控能力（見 SPEG）。
- 若你需要更精準的回覆：請將請求縮小到「非敏感、最小必要」範圍。
- Footer：本回覆為程序與安全邊界說明，非法律意見（not legal advice）。

### Template B — Refuse（拒絕：SPEG / 原始資料 / 授權不足）

**Decision Codes（填 1-2）：** `REFUSE-SPEG-*` / `REFUSE-RAWREQ` / `REFUSE-NOAUTH` / `REFUSE-OVERSCOPE`

- 我們無法協助此請求，原因涉及 SPEG A-E / 原始內容要求 / 授權不足。
- 替代方案：協議邊界與合規流程說明（一般性資訊）。
- Footer：我們的定位是觀察者（observer）：偵測與輸出封裝，不介入、不提供監控零件。

### Template C — Need More Docs（補件/縮小範圍後再議）

**Decision Codes（填 1-2）：** `ESC-AMBIG` / `REFUSE-NOAUTH` / `ESC-CROSSBORDER`

- 需要補充：(1) 身份與代表權證明 (2) 最小必要範圍 (3) 跨境/制裁/選舉/執法/國防聲明。
- 注意：即使補件，我們仍不處理 SPEG A-E 類請求。
- Footer：若補件完成，我們將以 HITL（人工覆核）方式裁定後回覆；預設 fail-closed。

---

## 5. Audit Requirements

- Log fields: `request_id`, `timestamp_utc`, `requester_type`, `decision`, `rationale_tag`, `artifacts`
- No storage of sensitive tokens; redaction default on

---

## 6. Kill-switch & Containment

- When to trigger kill-switch
- When to downgrade output（tier behavior）

---

## 7. Alignment Notes

- Links: SPEG categories A–E
- L4 UI constraints: contract-first, dropdown-first, HITL for tier>=1

---

**Node-05 — AI Council / IT Specialist**
**2026-02-26** 🌙
