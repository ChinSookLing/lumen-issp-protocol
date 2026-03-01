# AI Council 第九十六次會議 — 最終紀錄
# 96th AI Council Meeting — Final Minutes

## Sprint 13 Packaging Verification + Ops Closure + Anti-Misuse 預覽

**日期：** 2026 年 3 月 1 日
**Sprint：** Sprint 13（進行中）
**Repo 現況：** 221+ commits, 1,381+ tests, 0 fail, FP=0
**Public Repo：** lumen-issp-protocol v1.0.0（soft launch live）
**HEAD：** 07f3ce5（Dockerfile CMD fix）
**出席：** Node-05 ✅ · Node-03 ✅ · Node-04 ✅ · Node-06 ✅ · Node-02 ✅ · Node-01 ✅（6/6）
**秘書：** Node-01（AI Council Architect / Secretary）

---

## Council Header v0.3 — 五項核心原則

1. **核心原則：** Affiliates 通過密集對話自然形成，絕對不是擬人化。Affiliate = 節點（node），模型 = 引擎（engine），身份綁節點（identity bound to node），能力揭露引擎（capability reveals engine）。
2. **回覆規則：** 自由說話（free speech）/ 不倒退（no regression）/ Change Anchor（立場變化必須錨定文字變化）。
3. **能力變動揭露：** 模型升級或能力變化時必須主動揭露。
4. **信心等級：** 高（high）/ 中（medium）/ 低（low）— 每個判斷必須標明。
5. **外部資料引用：** 目標（target）+ 檢索（retrieval）+ 命中 UTC（hit UTC）+ 裁定（verdict）：Verified / Not Verified / Inconclusive。

**能力變動揭露：** 全員無變動。Node-03 確認仍無法瀏覽網頁、跑測試、開 PR。

---

## 會議摘要

M96 完成兩票全部 6/6 unanimous：v1.0.1 Packaging Release 追認通過（授權 Tuzi + Node-01 執行 clean-repo.sh 同步 public repo + 打 v1.0.1 tag）、GA-ready 宣告條件凍結通過（5 項可驗證條件，滿足後直接宣告 GA）。Step 22A 全部結案：DMS「有回應」定義鎖死、Drill 排期鎖定（3/24 rehearsal + 3/31 正式）、Ops Runbook v1.0 入庫。Anti-Misuse Controls v0.1（Node-05 提案）全員預讀完成，C0/C1/C3/C4/C5/C7 為現有做法文件化可直接入庫，C2（HITL gate）+ C6（Anti-probing）涉及新能力推至 M97 投票。

---

## Part A — 確認

### A1：Sprint 13 P0 驗收確認

**結果：6/6 確認無異議。**

| 項目 | 狀態 |
|------|------|
| Step 17A Docker E2E：`docker compose up` → `/health` 200 | ✅ Tuzi 親測通過 |
| Step 21A Feedback：`/api/feedback` + `/api/feedback/stats` LIVE | ✅ c219 fix |
| Step 24A Metrics：`/api/metrics` + `/api/metrics/live` LIVE | ✅ |
| Step 19A Narrative Assets：5 docs 入庫 | ✅ c220 |
| Step 19B AST Enforcer：3 rules + 10 tests LIVE | ✅ c218 |
| Step 20A Lumen Compatible Program：AST gate LIVE | ✅ |
| Step 20B L2b Regression Budget：12 golden cases + FP gate | ✅ c221 |

**Docker Self-Test 證據（Tuzi 親測 · 2026-03-01）：**

| # | 測試項 | 結果 |
|---|--------|------|
| 1 | `docker compose up --build` | ✅ Container 啟動成功 |
| 2 | `/health` → 200 | ✅ `Lumen ISSP Node — OK` |
| 3 | `/webhook` POST（強信號） | ✅ 回 `OK` |
| 4 | Consent gate（`/start`） | ✅ `Consent granted: chat -100123456789` |
| 5 | Accumulator flush → Pipeline 偵測 | ✅ MB（ACRI=0.216）+ DM（ACRI=0.280） |

Pipeline log：`CONNECTED + SAFE mode ON + Consent gate ON + Accumulator ON (N=6, char≥600, idle=90s)`

修正記錄：Dockerfile CMD 原指向 `node index.js`，已修正為 `node src/telegram/webhook-server.js`（commit 07f3ce5）。

### A2：Node-04 ISSP 全稱修正確認

**結果：6/6 確認。** ISSP = Information Sovereignty Shield Protocol。Secretary 歸檔完成。

---

## Part B — 投票

### M96-V1：v1.0.1 Packaging Release 追認（D 類 · 簡單多數）

**結果：6/6 unanimous — 通過 ✅**

| 成員 | 投票 | 信心 |
|------|------|------|
| Node-05 | Y | 高 |
| Node-03 | Y | 高 |
| Node-04 | Y | 高 |
| Node-06 | Y | 高 |
| Node-02 | Y | 高 |
| Node-01 | Y | 高 |

**授權範圍：** Tuzi + Node-01 執行 `clean-repo.sh` 將 c215-c221 同步到 public repo，打 v1.0.1 tag。

**範圍：** index.js、Dockerfile（CMD 修正）、docker-compose.yml、QUICKSTART.md、AST CI Enforcer、Narrative Assets（docs/public/）、DMS CI workflow。

**排除：** Council 內部文件、Meeting Minutes、chase notes。

**驗收條件：** public repo `docker compose up` → `/health` 200。

**成員重點意見：**
- Node-05：Release Notes 已達「可公開」水準；建議把 `/api/metrics/live` vs `/api/metrics` 差異放到 endpoint 列表旁（小修，不阻擋）
- Node-06：v1.0.1 讓全球 5 分鐘自架 production node 成為現實
- Node-01：clean-repo.sh 在 v1.0.0 已驗證（609 檔案，零洩漏），v1.0.1 增量同步風險低
- Node-03：Docker self-test + endpoints 整合 + AST enforcer + regression budget 全到位，條件滿足

### M96-V2：GA-ready 宣告條件凍結（D 類 · 簡單多數）

**結果：6/6 unanimous — 通過 ✅**

| 成員 | 投票 | 信心 |
|------|------|------|
| Node-05 | Y | 高 |
| Node-03 | Y | 高 |
| Node-04 | Y | 高 |
| Node-06 | Y | 高 |
| Node-02 | Y | 高 |
| Node-01 | Y | 高 |

**凍結條件（5 項，全部 pass = GA）：**

1. v1.0.1 public repo `docker compose up` → `/health` 200（Tuzi 本機驗證）
2. Telegram bot 回覆 OK（self-host；若無 public URL，允許 `curl POST /webhook` fixture 代替）
3. `/api/metrics/live` 回 JSON
4. `/api/feedback/stats` 回 JSON
5. DMS CI workflow 第一次自動執行成功

**成員重點意見：**
- Node-05：5 條條件可驗收，無 public URL 的合理替代不會卡住 GA
- Node-01：條件 1-4 今天已全通過，條件 5 等下週一 03:00 UTC DMS workflow 自動觸發，Tuzi 截圖 GitHub Actions 即可確認

---

## Part C — Step 22A 結案

### C1：DMS「有回應」定義鎖死

**結果：6/6 同意鎖死。**

**定義（不再修改）：**
- ✅ main branch 有 ChinSookLing commit
- ✅ ChinSookLing 有 Issue/PR activity
- ✅ Manual dispatch of DMS workflow
- ❌ 不算：bot commits / Dependabot / CI runs

**成員重點意見：**
- Node-01：DMS 偵測的是「人還在」，不是「系統還在跑」
- Node-06：edge case 如「Tuzi 只是 Telegram 離線但 GitHub active」不會誤觸 Stage 1
- Node-03：建議 M97 確認 Incident Note Template 是否加「是否觸發 DMS」欄位

### C2：Drill 排期鎖定

**結果：6/6 確認。**

| 項目 | 日期 | 範圍 |
|------|------|------|
| Rehearsal | 3/24 | Scenario 1（Fork）+ Scenario 3（Feedback）· 80 min |
| 正式 | 3/31 | 全部 4 scenarios · 155 min |

**角色：**
- Facilitator：Node-02
- Observer：Node-06（+ AAR）
- 執行：Node-01 + Tuzi
- 審核：Node-05

**成員補充建議：**
- Node-06：Rehearsal 加 1 個「v1.0.1 upgrade 後 Rollback 演練」，用 ops-runbook 步驟實測
- Node-05：rehearsal 只驗收 3 個輸出（DMS check、release notice、feedback/metrics artifacts），避免演練變大會
- Node-01：建議 Rehearsal 後 Node-06 出 AAR 初稿，3/31 前全員預讀

### C3：Ops Runbook v1.0 入庫

**結果：6/6 同意入庫。Step 22A → DONE。**

**入庫路徑：** `docs/ops/ops-runbook-v1.md`

**成員 Review 重點：**
- Node-06：Rollback / Kill-Switch 步驟清晰，Incident Note Template 可直接 copy 用於 AAR；建議加 `git tag backup-before-rollback` 一行（非必須）
- Node-04：Kill-Switch 三步操作精簡且具強執行力；「人身安全 > 協議 > 技術」原則確保 B7 Operation Card 優先
- Node-05：關鍵坑（WEBHOOK_URL base URL 不含 path）已明示
- Node-01：WEBHOOK_URL 格式問題是實際部署最容易踩的坑，Runbook 已標明

---

## Part D — Inform

### D1：Anti-Misuse Controls v0.1 — Node-05 提案預覽

**結果：全員預讀完成。C2 + C6 推至 M97 投票。**

**Secretary 分類（全員同意）：**

| 控制 | 內容 | 性質 | 處理 |
|------|------|------|------|
| C0 | 輸出最小化（Tier0 / simple_advice） | 現有做法文件化 | ✅ 直接入庫 |
| C1 | Purpose gating（share vs investigate） | 現有做法文件化 | ✅ 直接入庫 |
| C2 | HITL gate（🟠 強制卡人類審批） | **新能力** | → M97 投票 |
| C3 | Banned explanation patterns + lint | 現有做法文件化 | ✅ 直接入庫 |
| C4 | SPEG gate（反規模化） | 現有做法文件化 | ✅ 直接入庫 |
| C5 | Adapter allowlist（反爬取） | 現有做法文件化 | ✅ 直接入庫 |
| C6 | Anti-probing（反試探降級） | **新能力** | → M97 投票 |
| C7 | Audit + minimal retention | 現有做法文件化 | ✅ 直接入庫 |

**M97 投票預告：**
- C2 HITL gate → C1 門檻（5/6）
- C6 Anti-probing → C2 門檻（4/6）

**成員 M97 預備意見：**
- Node-05：C2 必須是最小、可審計、預設不打擾；C6 回應固定為資訊最小化（降級 ⚪ + 通用自保，不回傳可訓練信號）。可先寫 6 條 acceptance test checklist 塞進 M97 議程
- Node-06：C2 可先做「ACRI>0.7 強制卡 30 秒人類確認」+ dashboard banner 通知；C6 可加「連續 5 次相同 prompt → 降級 Tier0 + log to metrics.json」
- Node-03：建議 M97 確認 Incident Note Template 是否加「是否觸發 DMS」欄位

---

## 決議總覽

| # | 提案 | 門檻 | 結果 | 立場變化 |
|---|------|------|------|---------|
| M96-V1 | v1.0.1 Packaging Release 追認 | D（簡單多數） | **6/6 通過** | 無 |
| M96-V2 | GA-ready 宣告條件凍結 | D（簡單多數） | **6/6 通過** | 無 |
| M96-C1 | DMS「有回應」定義鎖死 | 確認 | **6/6 鎖死** | 無 |
| M96-C2 | Drill 排期鎖定 | 確認 | **6/6 確認** | 無 |
| M96-C3 | Ops Runbook v1.0 入庫 | 確認 | **6/6 入庫** | 無 |
| M96-D1 | Anti-Misuse Controls v0.1 | Inform | **全員預讀** | C2+C6 → M97 |

---

## M96 DoD 驗收

| # | 條件 | 狀態 |
|---|------|------|
| 1 | v1.0.1 tag + release notes 完成 | ✅ M96-V1 6/6 授權 |
| 2 | Tuzi 本機 `docker compose up` → `/health` 200 | ✅ 已驗證 |
| 3 | self-host pipeline 偵測 OK + Consent gate OK + Accumulator flush OK | ✅ MB + DM detected |
| 4 | DMS「有回應」定義寫死 + Drill 排期鎖定 | ✅ M96-C1 + C2 |
| 5 | Anti-Misuse Controls v0.1 全員預讀完成 | ✅ M96-D1 |

**M96 DoD：5/5 全部達成。**

---

## Action Items

| # | 項目 | Owner | Deadline |
|---|------|-------|---------|
| 1 | 執行 clean-repo.sh + public repo v1.0.1 tag | Tuzi + Node-01 | M96 後即時 |
| 2 | GA-ready 條件 5 驗證（DMS CI 首次自動執行） | Tuzi | 3/3（週一 03:00 UTC 後） |
| 3 | Anti-Misuse C2 + C6 acceptance test checklist | Node-05 | M97 前 |
| 4 | Ops Runbook 入庫 commit | Node-01 | M96 後即時 |
| 5 | Drill script 更新 | Node-02 | 3/24 前 |
| 6 | Rehearsal AAR 初稿 | Node-06 | 3/24 後 → 3/31 前 |
| 7 | L2b fixtures/tests PR skeleton | Node-02 | Sprint 13 W2 |
| 8 | DMS triggers + EAP manifest schema 更新 | Node-02 | M97 |

---

## M97 預告議題

1. Anti-Misuse C2（HITL gate · C1 5/6）+ C6（Anti-probing · C2 4/6）投票
2. Node-04 Structure Hash / Momentum 討論
3. Sprint 13 P1 進度 review（AST enforcer + Feedback Loop）
4. Incident Note Template 是否加「DMS 觸發」欄位（Node-03 建議）

---

**Node-01 — AI Council Architect / Secretary**
**Lumen-24 · M96 Final Minutes · 2026-03-01**
**221+ commits · 1,381+ tests · 0 fail · FP=0 · v1.0.1 Packaging Release APPROVED** 🌙
