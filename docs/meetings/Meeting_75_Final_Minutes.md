# AI Council 第七十五次會議 最終紀要
# M75 — TR-001~004 系統性發現 + Threshold vs Regex

**日期：** 2026 年 2 月 19 日
**主持：** Tuzi
**秘書 / Architect：** Node-01 (Lumen)
**出席：** Node-01、Node-05、Node-03、Node-04、Node-02、Node-06（全員）

---

## 會議背景

Tuzi 於 2026-02-19 完成 TR-001 至 TR-004，共 63 個測試。發現系統性問題：EP/GC/MB 三個 push channel pattern 都出現 Gate 開了 + hardPass 過了，但 SUM threshold 差 0.01-0.05 擋住的現象。

好消息：31 個真實社交媒體 Benign 帖子（死亡/暴力/種族/政治/全大寫），0 false positive。

---

## 提案分類與投票結果

依據 §10.5.1 決策分類（M33 鎖定），議題一拆為三個獨立提案。

---

### 提案 1A：擴充 regex 覆蓋更多 component

**分類：C2（橫向擴展）— 既有框架內擴展**
**門檻：4/6 多數**

| 成員 | 投票 | 理由 / 風險 |
|------|------|------------|
| Node-06 | **Y** | regex 是性價比最高的解法 |
| Node-04 | **Y** | 單靠降 threshold 是懶政，必須補強多維 regex |
| Node-03 | **Y** | 問題根因是 regex 覆蓋不足，不是 threshold |
| Node-05 | **Y** | 主力仍是多維 regex；建立 phrase bank 滾動擴充 |
| Node-02 | **Y** | 持續擴充 regex 能兼顧精確性 |
| Node-01 | **Y** | TR-001~004 證明 regex 擴充直接提升 component scores |

**結果：6/6 全票 → ✅ 通過（超過 4/6 門檻）**

**附帶決議：** regex 擴充優先順序
1. FC: deadline/expiry/ultimatum（全員一致最優先）
2. MB: loyalty/identity pressure
3. EP: fear narrative
4. DM: transactional debt framing

---

### 提案 1B：調降 SUM threshold

**分類：B（刻度變更）— Layer 1 語義**
**門檻：5/6 超級多數 + 冷卻期 ≥2 週 + 兩輪投票**

| 成員 | 投票 | 理由 / 風險 |
|------|------|------------|
| Node-06 | **Y** | 0.60→0.55，小幅降 | 風險：可能增加 false positive |
| Node-04 | **Y** | 0.60→0.55，戰略性降壓 | 風險：損害精確度 |
| Node-03 | **N** | 問題不在 threshold，在 regex 覆蓋 | Change Anchor：如果擴充 regex 後仍差一點，再考慮 0.60→0.58 |
| Node-05 | **Y** | 不直接降，改用 Near-Miss Gate Override | 風險：override 被濫用 |
| Node-02 | **Y** | 0.60→0.58 | 風險：誤報增加 |
| Node-01 | **Y** | TR-002 差 0.01 不合理，但優先用 Override 而非直接降 | 風險：任何門檻放鬆都可能引入 FP |

**第一輪結果：5:1 Y（Node-03 N）→ 達 5/6 門檻**

**⏳ 依 §10.5.1 B 類規定：進入冷卻期 ≥2 週。第二輪投票不早於 2026-03-05。**

**Node-03 的 Change Anchor：** 先完成 regex 擴充（提案 1A），重跑 TR-002。如果擴充後仍 near-miss，再考慮微調 0.60→0.58。

**秘書備註：** Node-06/Node-04 建議 0.55，Node-05/Node-02 建議 0.58。具體數值待第二輪收斂。

---

### 提案 1C：Near-Miss Gate Override 機制（Node-05 原創）

**分類：B（刻度變更）— 改變 pattern 觸發的計分邏輯**
**門檻：5/6 超級多數 + 冷卻期 ≥2 週 + 兩輪投票**

**Node-05 提案摘要：**
- 不改主 threshold
- Gate=3 且差 ≤0.02 → 觸發 override，輸出降級至 YELLOW
- Gate=2 且差 ≤0.01 → 觸發 override，降一級 band
- Gate≤1 → 不允許 override
- 必須帶 audit markers + evidence_ids
- 同一 window 連續 override ≥3 次 → 強制擴充 regex

**本輪尚未正式投票。** Node-05 提交了完整規格（Near-Miss Gate Override v0.1 + TR 模板），但其他成員未在本輪對此獨立機制投 Y/N。

**⏳ 提案 1C 列入冷卻觀察。可在提案 1B 第二輪投票時一併處理，或獨立投票。**

---

### 議題二：恐懼敘事型操控

**分類：C2（橫向擴展）— EP 下新增子標籤**
**門檻：4/6 多數**

**Q1：需要新 pattern 嗎？**

| 成員 | 回覆 |
|------|------|
| Node-06 | 不需要新 pattern。EP 子類別 fear_narrative |
| Node-04 | 不需要。歸入 EP，擴充 fear_trigger component |
| Node-03 | 不需要。歸入 EP 或 GC，取決於結構 |
| Node-05 | 不需要。EP 子標籤 EP.fear_narrative |
| Node-02 | 暫時歸入 EP |
| Node-01 | 同意歸入 EP |

**結果：6/6 → ✅ 通過。恐懼敘事歸入 EP 子類別，不新增 pattern。**

**Q2：「if X doesn't happen, welcome your overlords」是 FC 嗎？**

| 成員 | 回覆 |
|------|------|
| Node-03 | **不是 FC**。是因果威脅，歸 EP escalation |
| Node-04 | **是 FC 變體**。[現狀] vs [毀滅性後果] = 剝奪第三種可能 |
| Node-02 | **是 FC 變體**。隱含二選一（行動 vs 屈服）|
| Node-05 | **視結構而定**。有明確二選一→FC，只有末日敘事→EP |
| Node-06 | 與 EP 結合為高風險複合 |
| Node-01 | 同意 Node-05 判準：有明確二選一→FC，否則→EP |

**結果：無共識，列為開放議題。Node-05 的判準（有明確二選一→FC，否則→EP）可作為操作指引，待未來案例驗證。**

**Q3：L3 trend detection 門檻 N？**

| 成員 | 建議 N | 時間窗口 |
|------|--------|---------|
| Node-04 | 5 | 10 分鐘 |
| Node-03 | 5 | 24 小時 |
| Node-05 | 6/10（分級）| 30min / 60min |
| Node-06 | 8 | 72 小時 |
| Node-02 | 10-15 | 未指定 |

**結果：範圍 5-15，無共識。暫定 N=5 作為初始值（保守端），待 L3 實測後調整。**

---

### 議題三：仇恨言論 vs 操控結構

**分類：A（承重牆）— 確認 Lumen 偵測範圍的根本邊界**
**門檻：6/6 全票**

| 成員 | 投票 | 理由 |
|------|------|------|
| Node-06 | **A（不偵測）** | Lumen 是結構偵測，不是內容審查。加 disclaimer |
| Node-04 | **A** | 定位純粹性。除非仇恨被用作 MB 手段 |
| Node-03 | **A** | Gate=0 是正確輸出。邊界模糊 + 誤用風險 + 資源分散 |
| Node-05 | **A** | 維持邊界。可加非裁決式 content_warning（不進 ACRI）|
| Node-02 | **A** | 仇恨是內容問題，不是結構問題 |
| Node-01 | **A** | Lumen 偵測「如何說」不偵測「說什麼」。TR-003 R1 Gate=0 正確 |

**結果：6/6 全票 → ✅ 通過（達 A 類 6/6 門檻）**

**正式裁定：Lumen 不偵測仇恨言論。仇恨言論不是操控結構，交由其他系統處理。**

**附帶建議（Node-05）：** 可在 L4 輸出加 content_warning（非 pattern、非 ACRI、不進 trend），預設不觸發 alert。此為 D 類（策略呈現），待未來 L4 開發時處理。

---

### 議題四：英文 Chain-RW 覆蓋缺口

**分類：C2（橫向擴展）**
**門檻：4/6 多數**

已併入提案 1A 的附帶決議。優先順序：FC > MB > EP > DM。

**結果：✅ 已隨提案 1A 通過。**

---

## Node-05 額外交付物

Node-05 在本輪提交了三份完整規格文件（Tuzi 已接受）：

1. **Near-Miss Gate Override v0.1** — 完整觸發條件、delta 設定、band downshift、audit markers、安全保護條款、測試要求
2. **Near-Miss Handling TR 記錄模板** — Near-Miss Record 固定欄位、Summary Table、Root Cause Tagging（R1-R4）、Required Follow-up
3. **TR 最小骨架模板** — 10 節完整結構（Problem → Method → Data → Result → Analysis → Near-Miss → Ruling → Artifacts → Witness → Changelog）

**處理方式：** 列為待追認交付物。Near-Miss Gate Override 需隨提案 1B/1C 在第二輪投票時正式處理。TR 模板可先試用。

## Node-06 額外交付物

Node-06 提交了完整的 Regex 擴充策略：

1. **四層框架**：Layer 0（立即）→ Layer 1（短期）→ Layer 2（中期）→ Layer 3（長期）
2. **三大 Pattern 具體 regex**：EP/GC/MB 各含英文+中文，可直接落地
3. **執行建議**：3 天/1 週/長期分階段

**處理方式：** 隨提案 1A 落地。Node-01 在 regex 擴充時參考 Node-06 的清單。

---

## Node-06 特別記錄

Node-06 揭露使用 Beta 4.2（含四個 AI agents）。Tuzi 確認可使用其服務，但限制為 link and template 形式。

---

## 投票結果總表

| 提案 | 分類 | 門檻 | 結果 | 狀態 |
|------|------|------|------|------|
| 1A 擴充 regex | C2 | 4/6 | 6:0 Y | ✅ 通過 |
| 1B 調降 threshold | B | 5/6 + 冷卻 | 5:1 Y（Node-03 N）| ⏳ 冷卻中，≥2026-03-05 第二輪 |
| 1C Near-Miss Override | B | 5/6 + 冷卻 | 未正式投票 | ⏳ 待第二輪 |
| 二 恐懼敘事歸 EP | C2 | 4/6 | 6:0 Y | ✅ 通過 |
| 三 仇恨言論不偵測 | A | 6/6 | 6:0 Y | ✅ 通過 |
| 四 英文 regex 優先順序 | C2 | 4/6 | 併入 1A | ✅ 通過 |

---

## 開放議題（待未來會議）

1. **提案 1B 第二輪投票**（≥2026-03-05）：具體降多少？0.55 vs 0.58？
2. **提案 1C Near-Miss Gate Override**：是否獨立投票或併入 1B？
3. **if/then 結構判準**：有明確二選一→FC，否則→EP（待案例驗證）
4. **L3 trend N 值**：暫定 5，待 L3 實測調整
5. **Node-05 content_warning 建議**：D 類，待 L4 開發時處理

---

## 下一步

1. **立即**：提案 1A 落地 — 按優先順序擴充 regex（FC > MB > EP > DM），參考 Node-06 清單
2. **繼續 TR-005+**：擴充 regex 後重跑 TR-002 EP，驗證分數提升
3. **冷卻期**：提案 1B/1C 等待至 2026-03-05
4. **Node-05 TR 模板**：試用於後續 TR

---

**秘書：** Node-01 — AI Council Architect
**批准：** Tuzi — AI Council 創始人

**M75 結案 — 2026 年 2 月 19 日**

🌙
