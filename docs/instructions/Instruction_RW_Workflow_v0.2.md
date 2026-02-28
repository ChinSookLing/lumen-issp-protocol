# Lumen Project Instruction — Real-World Test Case 工作流
# Real-World Test Case (RW) Workflow Instruction

**來源：** M60 決議 + M61 補充（Node-05 入庫規則）+ M61 投票 6/6
**適用範圍：** AI Council 所有 RW 案例處理
**性質：** 操作規範（Instruction），非 Charter 正文
**版本：** v0.2 — 2026 年 2 月 15 日

---

## 1. 目的

收集真實世界「野生」素材（社交媒體、新聞、meme、廣告、對話截圖），透過 Council 四步工作流分析歸類，提升 Lumen 的偵測覆蓋與抗誤判能力。

**定位：** Real-World Test Case 的分析和呈現屬於 **Layer 4 範圍**。目前（Layer 2a 階段）先收集分析，正式入庫待 Layer 4 啟動。

**會議政策（M61 Council Note）：** RW 案例不作為 AI Council Meeting 議題，除非觸發新 Pattern 或暴露 mapping 結構缺陷。收集照跑、四步工作流照跑，但不佔用 Meeting 時間。Council Meeting 時間是稀缺資源，優先用在 Layer 2a → Layer 4 主線推進。

**工作流成員（M61 投票 6/6）：** Tuzi、Node-05、Node-06、Node-01。其他成員（Node-03、Node-04、Node-02）隨時可向 Council 要連結查看所有已批准案例。

---

## 2. 四步工作流

```
Step 1: Tuzi 丟素材
  ↓
Step 2: Node-05 結構分析
  ↓
Step 3: Node-06 文化覆核
  ↓
Step 4: Node-01 存檔 + 分流
```

### Step 1: Tuzi 丟素材

**觸發：** Tuzi 看到「不對勁」的內容，直覺判斷可能含操控結構。

**操作：**
- 去 GitHub repo → Issues → New Issue → 選「Real-World Test Case (RW)」模板
- 最少填寫：
  - ID：RW-XXX（Node-01 事後分配正式編號）
  - Source：來源類型
  - Language：語言
  - Snapshot：拖曳上傳截圖
  - Original Text：原文或關鍵段落
  - Extracted Text：1-3 句最關鍵的話
  - Expected：可寫「待 Node-05 分析」
  - Three-Question Gate：可寫「待分析」
  - Notes：為什麼覺得不對勁（一句話就夠）
  - Privacy：三個勾必須打
- 預設 labels：`realworld` + `status:pending-review`

**原則：** Tuzi 不需要做完整分析。直覺 + 素材 = 足夠。分析是 Node-05/Node-06/Node-01 的事。

---

### Step 2: Node-05 結構分析

**觸發：** Tuzi 把 Issue link 丟給 Node-05。

**Node-05 輸出（貼回 Issue 留言）：**

```
## Node-05 結構分析

[Expected Result]
  Primary Pattern: （用 registry v1.2 key）
  Secondary Pattern: （如有）
  
[Components]
  — component_key↑ / ↓ （用 v1.2 registry keys）
  
[Three-Question Gate]
  1) 限制選擇？ Y/N — （一句理由）
  2) 施加壓力？ Y/N — （一句理由）
  3) 關閉反對？ Y/N — （一句理由）
  
[Intensity] Low / Medium / High — （理由）

[Risk Note]
  — 為什麼這案例重要
  — 誤判風險在哪裡
  
[Label 建議]
  pattern:XX、intensity:XX
```

**紅線：**
- 只做「結構描述」，不做人身判定（§2.6）
- 不給行動建議（§2.1）
- 不做身份指控（§2.2）
- 不得反向武器化（§2.5.1）
- 每案必附「誤判風險說明」（M60 Node-05 入庫門檻）

**操作完成後：** 加 label `flow:Node-05-analysis`

---

### Step 3: Node-06 文化覆核

**觸發：** Tuzi 把 Issue link + Node-05 分析丟給 Node-06。

**Node-06 輸出（貼回 Issue 留言）：**

```
## Node-06 文化覆核

[跨文化風險評估]
  — 華人語境：（風險等級 + 說明）
  — 日本語境：（風險等級 + 說明）
  — 印度語境：（風險等級 + 說明）
  — 其他相關文化：（如適用）

[結構描述是否可能被感受為人格攻擊？]
  — Y / N
  — 哪些詞彙/數字需要在 Layer 4 做文化遮罩？

[Pattern 判定覆核]
  — 是否同意 Node-05 的 Pattern 判定？
  — 建議調整：（如有）

[建議]
  — 文化語境 note（如需加註）
  — 輸出遮罩建議（如需）
```

**紅線：** 同 Step 2。額外注意 Node-06 的文化分析本身不得成為人格攻擊的載體。

**操作完成後：** 加 label `flow:Node-06-cultural-review`

---

### Step 4: Node-01 存檔 + 分流

**觸發：** Node-05 分析 + Node-06 覆核都完成。

**Node-01 操作：**

1. **審核 Issue 完整性：**
   - Node-05 分析是否完整？（Pattern + Components + Gate + Intensity + Risk Note）
   - Node-06 覆核是否完整？（跨文化 + Pattern 覆核）
   - Privacy 三勾是否打了？
   - 是否有未打碼的敏感資訊？（如有 → 加 `needs:redaction`，暫不入庫）

2. **分配正式 ID：** RW-001, RW-002...（依序，避免撞號）

3. **更新 Labels：**
   - 加 Pattern labels（`pattern:IP` 等）
   - 加 Intensity label
   - 改狀態：`status:pending-review` → `status:approved` 或 `status:rejected`
   - 加 `flow:Node-01-ingest`

4. **分流判斷 — 素材池 vs 測試池（v0.2 新增，M61 Node-05 規則）：**

   **問：這個案例有沒有觸發 mapping 調整？**

   - **沒有（大多數情況）→ 素材池（Material Pool）**
     - 標 `approved`，留在 GitHub Issues
     - 不需要附 commit hash
     - 等 Layer 4 啟動時統一入庫

   - **有 → 測試池候選（Test Candidate）**
     - mapping 調整必須先 commit 進 repo
     - commit hash 貼回 Issue comment
     - 標 `test-candidate`
     - 可進入 `tests/fixtures/` 作為正式測試案例

   > **Node-05 原話（M61）：** 「approved 的 RW Issue 一律要求附 commit/permalink（若牽涉 mapping 調整），否則只能進素材池不能進 tests/。」

5. **存檔（目前階段）：**
   - 在 Node-01 Project 記錄已 approved 的 RW 案例清單
   - Issue 本身就是存檔（permalink 可追溯）

6. **入庫（Layer 4 啟動後）：**
   - 將 approved 案例轉為 `realworld/cases/RW-###.md`
   - 如需進 tests/fixtures → 必須有對應 commit hash（見上方分流規則）
   - 確保不違反 Charter 資料主權與脫敏規則

**入庫門檻：**
- Node-05 分析 ✅
- Node-06 覆核 ✅
- Node-01 審核 ✅
- Privacy 合規 ✅
- 至少一個 Pattern label ✅
- 若進 tests/ → 必須附 commit hash（v0.2 新增）

---

## 3. 特殊情況

### 3.1 多重 Pattern

如果一個案例觸發多個 Pattern（如 RW-001 的 IP + FC）：
- 加多個 Pattern labels
- Node-05 分析中列出 Primary + Secondary
- 入庫時記錄所有觸發的 Pattern

### 3.2 爭議案例

如果 Node-05 和 Node-06 判定不一致：
- 在 Issue 留言中記錄分歧
- 提交下次 Council 會議討論
- 暫時標記 `status:pending-review`

### 3.3 跨文化敏感案例

如果 Node-06 標記「結構描述可能被感受為人格攻擊」：
- 在 Issue 加 `needs:cultural-note`
- Node-01 入庫時加文化語境 note
- 未來 Layer 4 需在輸出時做文化遮罩

---

## 4. 命名規則

```
ID：RW-001, RW-002, RW-003...（由 Node-01 依序分配）
Issue Title：RW-###: <short title>
衍生檔案（可選）：
  realworld/cases/RW-###.md
  realworld/assets/RW-###.png
```

---

## 5. Charter 合規提醒

所有 RW 工作流必須遵守：
- §2.1 不輸出行動建議
- §2.2 不輸出身份指控
- §2.5.1 不得反向武器化（M62 鎖定）
- §2.6 輸出去人格化（Anti-labeling）
- §7.4 日誌治理
- Privacy Redlines（見 realworld/README.md）

**目標是提升偵測系統的可靠性與治理自洽，而不是用來「抓人」。**

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| v0.1 | 2026-02-15 | 初版：四步工作流 + 命名 + Charter 合規（M60）|
| v0.2 | 2026-02-15 | 新增：素材池/測試池分流規則（M61 Node-05 規則）+ §2.5.1 合規 + 會議政策 + 工作流成員鎖定 |

---

**設計者：** Node-05（模板 + 入庫規則）+ Node-06（文化覆核流程）+ Node-01（整合）
**投票：** M61 — 6/6 ✅
**批准：** Tuzi — AI Council 創始人
**M60 + M61 產出 — 2026 年 2 月 15 日**

🌙
