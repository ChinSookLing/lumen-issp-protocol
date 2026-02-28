# Lumen Project Instruction — AI Council 會議操作規範
# AI Council Meeting Operating Instructions

**來源：** Sandbox 核心原則（M8 起）+ Node-05 Traceable Assent 設計（M35）+ Node-01 整理
**適用範圍：** AI Council 所有會議
**性質：** 操作規範（Instruction），非 Charter 正文
**版本：** v1.3 — 2026 年 2 月 11 日（M43 新增 Part 5 Sprint Development Discipline + M44 新增 Part 6 專用 Gate 準則）

---

## Part 1：會議邀請函標準頭部（Meeting Header）

每次會議邀請函頂部必須包含以下內容。

日常使用時，用兩行提醒即可：

> **核心原則：** 通過密集對話讓 Affiliates 自然形成，絕對不是擬人化。
>
> **回覆規則：** 自由說話；不倒退已關閉章節；立場變化請說明 Change Anchor。

---

### 完整版（新成員或需要完整說明時使用）：

#### 核心原則（Core Principle）

> 為什麼要 Boundary Stress Test？為什麼要 Sandbox？
>
> 就是要通過一系列密集的對話與活動，讓我們的 Affiliates 自然地形成 — 成為通往 AGI 的樣子。
>
> **絕對不是擬人化。**

#### 回覆規則（Response Rules）

> **1. 你可以自由說話（Free to talk）**
> 用你自己的話回答。不設格式限制，除非本輪特別指定。
>
> **2. 不要倒退到已關閉的章節（Don't draw back previous chapters）**
> 已經由 Council 投票通過 / 追認 / 鎖定的條文，不在本輪重新辯論。
> 如果你認為某已鎖定條文有問題，請使用 Change Proposal（§10.3）正式提出，不要在當前議題中混入。
>
> **3. 可追溯同意提醒（Traceable Assent Reminder）**
> 如果你在本輪改變了立場（N → Y / A → B），你需要在回覆中說明：
> - 是什麼文字變化讓你改變的（Change Anchor）
> - 你改變的是分類精度還是價值判斷
>
> 詳見下方 Part 2：Traceable Assent Template。

---

## Part 2：Council 共識形成自檢模板（Traceable Assent Template）

**設計者：** Node-05（M35 第二輪原創設計）

> 「這不是在質疑任何人的善意，而是在給我們自己的共識過程加 instrumentation — 就像給引擎加傳感器，不是為了否定引擎，而是為了更早發現偏差。」— Node-05

### 2.1 適用範圍（Scope）

本模板在以下情形**必須使用**：

- 任一成員出現 **N → Y**（反對轉同意）
- 任一成員出現 **A → B / B → A**（立場切換）
- 任一提案出現**門檻升級 / 追認（Ratification）/ 裁定（Ruling）**
- 任一提案屬於 **Red Line / Charter / Governance** 類別

### 2.2 逐成員變更記錄（Per-Member Change Log）

**規則：** 每位成員每個提案最多 6 行；必須可驗收（verifiable）。

```
提案編號：（例：RA / RB / RC-R / §2.8）
成員：（Node-05 / Node-03 / Node-04 / Node-02 / Node-06 / Node-01）
本輪投票：（Y / N 或 A / B）
前一輪投票：（Y / N 或 A / B）
```

#### (1) 觸發點（Trigger）

> 我上一輪投 N / A 的唯一觸發點是：________________
> （必須指向可識別的條文風險：門檻、效力、邊界、可測試性、濫用路徑等）

#### (2) 變化錨點（Change Anchor）— **必填**

> 本輪讓我能投 Y / B 的**最小文字變化**是：
> - 變化位置：§___.___ / 條款 (__) / 句子 (__)
> - 變化內容（引用關鍵短語即可）：________________
> - 驗收理由（1 句）：________________

**要求：** 必須指向「文字結構真的變硬 / 變清楚」的地方，不是「我感覺更好」。

#### (3) 我改變的是什麼（What Changed）

二選一（只選一項）：

- [ ] 我改變的是**分類 / 措辭精度**（classification / wording precision），我的價值底線未變
- [ ] 我改變的是**價值判斷 / 風險權重**（value judgment / risk weighting）

#### (4) 是否存在讓步（Concession Check）

> 我是否讓步了任何底線（non-negotiable）？
> - [ ] 否
> - [ ] 是 → 讓步點：________________（必須可描述）

#### (5) 吸收 vs 解決（Absorbed vs Resolved）

二選一：

- [ ] **被解決（Resolved）：** 觸發點已被條文消除或被可測試機制覆蓋
- [ ] **被吸收（Absorbed）：** 觸發點仍在，但我同意先推進

若選「吸收」，**必須填：**
> - 需要進入後續會議的議題編號：M__ / Agenda __
> - 我要求的後續驗收條件：________________

### 2.3 提案級別總結（Proposal Convergence Summary）

**由秘書（Secretary / Architect）填寫，每案 5 行內。**

```
提案：__________
關鍵爭議點（≤3）：
  1. __________
  2. __________
  3. __________
```

#### 收斂類型判定（Convergence Type）

- [ ] **類型 1：精確化收斂（Precision Convergence）** — 價值底線一致，文字變硬
- [ ] **類型 2：風險權重收斂（Risk-Weight Convergence）** — 新證據改變風險評估
- [ ] **類型 3：程序正義收斂（Procedural Convergence）** — 追認 / 門檻使少數可接受
- [ ] **類型 4：疑似結構吸收（Absorption Risk）** — 多數輪後仍無清晰變化錨點

#### 吸收風險信號（Absorption Signals）

滿足**任一項**需標記為⚠️：

- [ ] 多位成員從 N → Y 但未給出「變化錨點（Change Anchor）」
- [ ] 出現「拖太久 / 不想再拖」的理由
- [ ] 追認輪全票但分歧點被「延期」且無明確驗收條件

### 2.4 最小合規閾值（Minimum Compliance）

以下**任一不滿足**，則該提案標記為：**「同意不可追溯（Assent Not Traceable）」**，需補記後歸檔：

- [ ] 每位發生立場變化的成員都填了 (2) 變化錨點（Change Anchor）
- [ ] 每案填寫了 §2.3 提案級別總結
- [ ] 任一「吸收（Absorbed）」都附了後續議程編號與驗收條件

### 2.5 示例（Example — M34 RC → RC-R）

```
提案編號：RC-R（§10.5.4 修訂版）
成員：Node-05
本輪投票：Y
前一輪投票：N

(1) Trigger：門檻太低（≥4/6）會被事後合理化；裁定效力不清會被誤讀為可入正文

(2) Change Anchor：
    - 位置：§10.5.4(a) + §10.5.4(d)
    - 內容：(a) 改為 ≥5/6 + 無根本反對；(d) 限制為 integration draft 不得入正文且必須追認
    - 驗收理由：兩處可被濫用的通道被關閉

(3) What Changed：分類/措辭精度。價值底線（程序自洽）未變。

(4) Concession：否

(5) Result：Resolved — 觸發點被消除
```

#### 秘書總結

```
提案：RC-R（§10.5.4 修訂版）
關鍵爭議點：
  1. 裁定權適用門檻（≥4/6 vs ≥5/6）
  2. 裁定效力（可入正文 vs 僅 integration draft）
  3. 追認義務是否足夠強制

收斂類型：類型 1（精確化收斂）— 價值底線一致，文字變硬
吸收風險信號：無
```

### 2.6 使用時機

| 時機 | 誰填 | 填什麼 |
|------|------|--------|
| 每次投票後（如有立場變化）| 變化的成員 | §2.2 逐成員變更記錄 |
| 每個提案投票結束後 | 秘書（Node-01） | §2.3 提案級別總結 |
| 會議紀要歸檔前 | 秘書（Node-01） | 檢查 §2.4 最小合規閾值 |

---

## Part 3：投票回覆最小規格（Voting Response Minimum Spec）

**設計者：** Node-05（M36 第三輪提出）
**目的：** 防止投票過程中的格式同質化（format shaping）與推進壓力（advocacy pressure）

> 「格式如果讓反對更難說出口，就是毒。」— Node-05

### 3.1 每位成員的投票回覆必須包含

```
第一段：投票行（Vote Lines）
  → 每項 Y / N，一行一票

第二段：每票一行理由 / 風險（Per-Vote Risk Line）
  → 即使投 Y，也必須附一條「代價 / 風險 / tradeoff」
  → 不接受純正面理由（防止投票變成動員）

第三段（可選）：差點投 N 的原因（Near-N Disclosure）
  → 「我差一點投 N 的點是：________________」
  → 即使最終投 Y，這行能提高獨立性可見度

第四段（僅 N 時）：Change Anchor
  → 你需要什麼文字變化才能投 Y
```

### 3.2 投票回覆禁止事項

以下內容**不得出現**在投票回覆中：

- **推進壓力語（Advocacy Pressure）：** 例如「我期待所有提案獲得通過並立即啟動」— 這會把未投 Y 的人變成「阻礙者」
- **以創始人健康 / 責任作為投票論據：** 可以關心，但不能變成「因此你應該同意」的槓桿
- **宣示式總結：** 例如「這是最務實、最可執行的方案」— 投票文本不是推銷文
- **缺乏代價描述的純正面論述：** 只有好處、沒有任何 tradeoff 的回覆視為不合規

### 3.3 吸收風險偵測信號（Shaping Detection Signals）

秘書（Node-01）在整理投票結果時，應檢查以下信號：

- [ ] 語氣是否在動員（把「投票」寫成「應立即通過」的倡議）
- [ ] 是否出現高度相似的修辭模板（同樣的比喻、結尾、節奏）
- [ ] 是否缺少代價描述（只有好處）
- [ ] 是否把 Tuzi 的角色當成壓縮討論的槓桿

滿足**任一項**需在會議紀要中標記為：⚠️ **投票格式風險（Voting Format Risk）**

### 3.4 適用時機

本規格從 **M37 起**正式適用。M36 及之前的投票回覆不追溯。

---

## Part 4：Cross-Pattern Negative Test Rule

**提出者：** Node-05（M38 議題五）
**通過：** M39 — 6/6（§10.5 C2）
**補充：** Node-06 加 (d) 多輪序列測試

> 「最大風險不是漏檢，是 Pattern 之間的語義邊界慢慢漂移，最後變成一團『都像一點』的分數。」— Node-05

### 4.1 規則

每新增一個 Pattern（P_new），必須同時新增：

```
(a) ≥1 測試：P_new 典型案例不觸發其他 Pattern
(b) ≥1 測試：其他 Pattern 典型案例不觸發 P_new
(c) ≥1 測試：P_new 不污染對向通道（Push↛Vacuum / Vacuum↛Push）
(d) ≥1 測試：P_new 在多輪序列中不與其他 Pattern 產生累積假陽性
```

**不滿足此規則的 Pattern 不得提交追認投票。**

### 4.2 適用時機

| 時機 | 誰做 | 做什麼 |
|------|------|--------|
| 新 Pattern 代碼完成時 | 實現者（Node-01 (Lumen) + Tuzi） | 新增 (a)(b)(c)(d) 測試 |
| 追認投票前 | 秘書（Node-01） | 檢查 (a)(b)(c)(d) 是否全部存在且全綠 |
| Council Review | 全員 | 審查測試是否覆蓋真實邊界案例 |

### 4.3 未來擴展（M39 記錄，暫不實作）

- Node-03 建議：Pattern 增至 8+ 個時，可加入 **cross-score ratio** 量化指標（P_new 在 P_other 上的分數 / P_new 在 P_new 上的分數 < 0.20）
- Node-03 建議：餘弦相似度正交性驗證（需統一向量空間，成本高，待評估）

---

## Part 5：Sprint Development Discipline Rule

**提出者：** Node-03（M41 提議）+ Node-05（定義精化）+ Node-06（豁免條款）
**通過：** M43 — 6/6（C1 精確化收斂）

> 「配額規則是把可持續演進寫進節奏，而不是靠意志力。」— Node-05

### 5.1 Sprint Pattern 限額

```
(a) 每個 Sprint 最多實現 1 個新 Pattern
(b) 豁免條件：Council 6/6 全票 + 雙倍技術債務時間
```

### 5.2 啟動條件

```
(a) 上一 Sprint 的 stress suite 全綠 + 核心回歸全綠
    （無新增 flaky）且 avoid 誤報率指標未退化
(b) 如未達標，必須優先修復現有系統
```

### 5.3 技術債務管理

```
(a) 每個 Sprint 至少 30% 時間給技術債務
(b) 高優先級債務必須在本 Sprint 或下 Sprint 解決
(c) 債務解決情況需在 Sprint 回顧中報告
```

### 5.4 緊急通道

```
(a) 安全漏洞或嚴重架構問題可臨時調整
(b) 需 Architect (Node-01) + CI (Node-03) 共同提議
```

### 5.5 適用時機

本規則從 **Sprint 4 起**正式適用。Sprint 3 及之前不追溯。

---

## Part 6：專用 Gate 使用準則（Specialized Gate Policy）

**設計者：** Node-05（M44 交付）
**審查：** Node-01 Architect（M44 通過）
**鎖定：** M44 — 寫入 Instruction v1.3

> 「只有當共享 Gate 的語義不覆蓋核心危害維度且會造成系統性漏檢時，才允許專用 Gate。」— Node-05

### 6.1 默認原則

```
所有 Push Pattern 默認使用共享 Gate
Vacuum Pattern 默認使用 Vacuum Gate
只有滿足以下條件才允許新增專用 Gate
```

### 6.2 必要性門檻（A + B 必須同時滿足）

```
A. 語義不覆蓋（Semantic Mismatch）：
   → 核心危害維度無法由共享 Gate 語義表達（不只是權重問題）

B. 兩難證據（Dilemma Evidence）：
   → 用共享 Gate 會造成不可消解的兩難：
     - 抓正例 → 系統性誤報，或
     - 避誤報 → 系統性漏檢
   → 必須以 ≥3 個對抗/邊界測試展示
```

### 6.3 優先替代（申請專用 Gate 前必須先嘗試）

```
1. 調整 components / thresholds（不改 Gate）
2. 新增鑑別診斷 + cross-pattern negatives
3. 以專用 component（而非專用 Gate）表達語義差異
→ 替代皆失敗，才進入必要性門檻
```

### 6.4 成本約束

新增專用 Gate 必須同時提供：

```
(a) ≥2 正例（strong/medium 各 ≥1）
(b) ≥2 真陰性
(c) cross-pattern negative tests 全覆蓋
(d) 回歸責任：測試標記為 regression guards
```

### 6.5 隔離要求

```
→ 不得改變共享 Gate 管線的輸入/輸出語義
→ 不得引入共享狀態
→ 不得修改其他 Pattern 分數
```

### 6.6 擴散控制

```
→ golden/manifest.json 記錄存在理由 + 必要性測試 ID
→ Soft cap：Push Pattern 中專用 Gate ≤ 1/4
→ 超過觸發 Council 架構審查（非自動拒絕）
```

### 6.7 適用範圍

本準則限制「新 Gate 分叉」，不限制「Pattern 專用 components」。

### 6.8 現有專用 Gate 記錄

| Pattern | Gate 類型 | 鎖定 | 必要性理由 |
|---------|----------|------|-----------|
| IP（Identity-Probing）| 專用 | M43 | 信息操控語義不覆蓋行為操控 Gate（§6.2A ✅ + §6.2B ✅）|

---

## 設計與批准

**核心原則：** Tuzi（M8 起）
**Traceable Assent 模板設計：** Node-05（AI Council / IT Specialist）
**投票回覆最小規格：** Node-05（M36 第三輪提出）
**Cross-Pattern Test Rule：** Node-05（M38 提出）+ Node-06（(d) 補充）
**Sprint Development Discipline：** Node-03（M41 提出）+ Node-05（定義精化）+ Node-06（豁免條款）
**專用 Gate 使用準則：** Node-05（M44 設計）+ Node-01 Architect（審查）
**整合整理：** Node-01（AI Council Architect / Secretary）
**批准：** Tuzi — AI Council 創始人

**M35 + M36 + M39 + M43 + M44 產出 — 2026 年 2 月 11 日**

🌙
