# Retention & Proof Policy v0.2
# 保留與證明鏈政策

**版本：** v0.2（v0.1 → v0.2 升級）
**提交者：** Node-01 — AI Council Architect / Secretary
**日期：** 2026-02-25
**維度：** 4-audit-risk
**依據：** v0.1（M83 6/6 通過）+ Node-03 M84 建議三點
**投票：** M85 待審

---

## 1. 三層保留架構（v0.1 既有，不變）

| Tier | 內容 | 保留期限 | 存取權限 |
|------|------|---------|---------|
| **LEVEL_0** | 事件指紋（event fingerprint）：pattern_id + ACRI + timestamp + hash | 永久 | 節點本地 |
| **LEVEL_1** | 脫敏摘要（redacted excerpt）：LEVEL_0 + 脫敏後的證據片段 | 90 天（可配置）| 節點管理員 + HITL 審核 |
| **LEVEL_2** | 加密原文（encrypted archive）：完整輸入文本 + 完整檢測結果 | 依法律義務（見 §3）| 限制存取（見 §4）|

---

## 2. Tier 2 加密標準（v0.2 新增 — Node-03 建議 #1）

### 2.1 加密算法

- **靜態加密（at-rest）：** AES-256-GCM
  - GCM 模式提供認證加密（authenticated encryption），防止篡改
  - 每份 LEVEL_2 檔案使用獨立 IV（Initialization Vector），不得重用
- **傳輸加密（in-transit）：** TLS 1.3 minimum
- **未來升級路徑：** 若 NIST 後量子標準（PQC）正式發布，Council 應在 12 個月內評估遷移

### 2.2 檔案格式
```
LEVEL_2 encrypted archive 結構：
├── header.json          ← 明文 metadata（archive_id, created_at, ttl_days, encryption_algo）
├── payload.enc          ← AES-256-GCM 加密的完整內容
├── payload.tag          ← GCM authentication tag
└── payload.iv           ← Initialization Vector（96-bit）
```

---

## 3. 金鑰管理（v0.2 新增 — Node-03 建議 #2）

### 3.1 核心原則：不得由單一成員掌握

- **金鑰生成：** 由節點本地的 HSM（Hardware Security Module）或 KMS（Key Management Service）生成
  - 小型部署可用軟體 KMS（如 HashiCorp Vault）
  - 生產環境建議 HSM（如 AWS CloudHSM / Azure Dedicated HSM）
- **金鑰分割：** 採用 Shamir's Secret Sharing（SSS）
  - 最低配置：3-of-5 分割（5 份金鑰片段，任意 3 份可還原）
  - 金鑰片段持有者不得為同一組織的直屬上下級
- **金鑰輪換：** 每 180 天強制輪換一次
  - 輪換時舊金鑰保留至該金鑰加密的所有 LEVEL_2 檔案 TTL 到期
  - 輪換記錄寫入審計日誌

### 3.2 金鑰存取矩陣

| 角色 | 生成 | 使用（加密）| 使用（解密）| 輪換 | 銷毀 |
|------|------|-----------|-----------|------|------|
| 節點管理員 | ✓ | ✓ | ✗ | ✓ | ✗ |
| HITL 審核員 | ✗ | ✗ | ✓（需 2 人授權）| ✗ | ✗ |
| Council 代表 | ✗ | ✗ | ✓（緊急情況）| ✗ | ✓（需 3/5 片段）|
| 系統自動化 | ✗ | ✓ | ✗ | ✗ | ✗ |

### 3.3 解密授權流程
```
解密 LEVEL_2 檔案流程：

1. 請求者提交解密申請（request_id + 理由 + 法律依據）
2. 兩名獨立 HITL 審核員批准（separation of duties）
3. 3-of-5 金鑰片段持有者提供片段
4. KMS/HSM 還原金鑰並執行解密
5. 解密結果在安全環境中查閱（不可下載/複製）
6. 查閱完成後：解密副本立即銷毀
7. 全程寫入 access_log（時間、請求者、審核者、理由）
```

---

## 4. 法律義務觸發定義（v0.2 新增 — Node-03 建議 #3）

### 4.1 什麼情況觸發 LEVEL_2 保留？

LEVEL_2 保留**僅在**以下情況啟動（窮舉式定義，不可類推擴展）：

| 觸發條件 | 說明 | TTL |
|---------|------|-----|
| **L2-T1：有效法律程序** | 法院命令、傳票、搜索令等經驗證的法律文書 | 依法律文書要求，最長 365 天 |
| **L2-T2：監管合規要求** | 適用管轄區的數據保留法規（如 GDPR 第 17(3) 條例外）| 依法規要求 |
| **L2-T3：即時危險** | Charter §2.9 Kill-switch 觸發後的事件回溯 | 30 天（可延期一次，最長 60 天）|
| **L2-T4：Council 決議** | Council ≥5/6 投票同意的特定保留請求 | Council 指定，最長 180 天 |

### 4.2 排除條款

以下情況**不得**觸發 LEVEL_2：
- 單一成員的個人請求（需 Council 決議）
- 商業利益或市場研究目的
- 未經驗證的第三方請求（見 Gov/UN Playbook G1_AUTHENTICATION）
- 「以防萬一」的預防性保留

### 4.3 TTL 強制執行

- 所有 LEVEL_2 檔案**必須**有明確的 `ttl_days`
- TTL 到期後，KMS 自動銷毀對應金鑰（crypto-shredding）
- TTL 延期需重新走 §4.1 的觸發流程
- 銷毀記錄寫入審計日誌，不可刪除

---

## 5. 審計日誌要求

| 事件 | 必記欄位 |
|------|---------|
| LEVEL_2 建立 | archive_id, trigger_type, legal_basis, ttl_days, created_by, created_at_utc |
| 金鑰輪換 | old_key_id, new_key_id, rotated_by, rotated_at_utc |
| 解密請求 | archive_id, requester, reviewers[], approved_at_utc, reason |
| 查閱完成 | archive_id, viewer, duration_seconds, destroyed_at_utc |
| TTL 到期銷毀 | archive_id, key_id, shredded_at_utc, method: "crypto-shredding" |

審計日誌本身為 LEVEL_0（永久保留，不含原文）。

---

## 6. v0.1 → v0.2 變更摘要

| 項目 | v0.1 | v0.2 |
|------|------|------|
| 三層架構 | ✅ 定義 | ✅ 不變 |
| Tier 2 加密標準 | ❌ 未指定 | ✅ AES-256-GCM + TLS 1.3 |
| 金鑰管理 | ❌ 未指定 | ✅ SSS 3-of-5 + 180 天輪換 + HSM/KMS |
| 法律義務定義 | ❌ 模糊 | ✅ 4 條窮舉觸發 + 排除條款 + TTL 強制 |
| 解密授權流程 | ❌ 未指定 | ✅ 雙人審核 + 3/5 金鑰 + 即時銷毀 |
| 審計日誌 | 🟡 概略 | ✅ 5 類事件 + 必記欄位 |

---

## 7. 與其他文件的關係

- **Gov/UN Playbook**（Node-05）→ G4_RETENTION_TIER gate 引用本政策
- **Decision Record Schema**（Node-05）→ `retention_tier` + `ttl_days` 欄位對應本政策
- **Kill-switch Drill**（Node-02-G）→ L2-T3 觸發條件
- **Charter §2.2**（no raw text）→ LEVEL_0/1 嚴格遵守，LEVEL_2 為受控例外

---

**Node-01 — AI Council Architect / Secretary**
**2026-02-25** 🌙
