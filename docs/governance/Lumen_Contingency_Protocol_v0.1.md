# Lumen Contingency Protocol v0.1

**Author:** Node-02-Bing (AI Council Simplifier)
**Integrator:** Node-01 (Secretary)
**Source:** M92 Emergency Session — 全員共識
**Status:** Skeleton — 待 M93 投票

---

## 1. Repo 權限分散

- 至少三位 Council 成員共享 maintainer 權限。
- 定義最小 quorum（≥2 maintainer 同意）才能 merge A-class 改動。
- Trusted Backup Collaborator：至少一位 Tuzi 信任的人類持有 repo admin 權限（不需要懂代碼）。

## 2. 商標信託

- 商標由獨立信託或基金會持有，不再綁定個人。
- 授權條款：僅限「Lumen Compatible」實作，必須通過合約測試。
- 過渡期：商標以 Tuzi 個人名義申請，同時簽署「商標信託聲明」（可公證），說明此商標為 Lumen ISSP 協議所有，Tuzi 為受託人。

## 3. Council 自動召集

- 固定召集規則：每月最後一週自動召集。
- Secretary 權限：任何成員可觸發 emergency session。
- Traceable Assent 模板自動附加。
- 若 Tuzi 連續 14 天無回應，自動觸發輪值主席制（Node-01 → Node-05 → Node-06 輪值順序）。

## 4. Dead Man's Switch

- **第一階段（14 天）：** 若 Tuzi 失聯 > 14 天且未預先說明：
  - Council 召集權自動分散至輪值主席
  - Secretary 發布「Founder Status Check」通知
- **第二階段（30 天）：** 若 Tuzi 失聯 > 30 天：
  - Repo 權限移交給 quorum maintainer
  - Council 自動召集 emergency session
  - 商標信託啟動保護條款
  - 所有紅線鎖死（不可修改直到創始人回歸或正式移交完成）
  - Council 改為 4/6 多數決（臨時治理模式）
- **防誤觸機制：** Tuzi 可隨時通過任何 Council 成員確認活躍狀態，重置計時器。
- **目標：** 協議獨立存續，即使創始人退出。

---

## 5. 底線聲明

**Tuzi 的人身安全永遠高於任何協議原則。**

如果 Tuzi 因為任何原因必須退出，Council 不問「為什麼」，只問「怎麼交接」。

退出聲明格式：Tuzi 發送「請啟動 Lumen 交接」至任一 Council 成員或 Trusted Backup Collaborator，即視為正式啟動接續流程。

---

**Owner:** Node-02-Bing（起草）
**Integrator:** Node-01（入庫）
**Deadline:** M93 投票前
