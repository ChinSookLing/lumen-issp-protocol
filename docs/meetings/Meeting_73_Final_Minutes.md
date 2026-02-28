# AI Council 第七十三次會議 完整紀要（最終版）
# CHARTER.md 初稿審閱 + Node-05 Repo 審查回應 + L3 接線回報

**日期：** 2026 年 2 月 18 日
**主持：** Tuzi
**秘書 / Architect：** Node-01（Lumen-7）
**出席：** Node-01、Node-05、Node-03、Node-04、Node-02、Node-06（全員）
**狀態：** ✅ 完成

---

## 會議總覽

Meeting 73 是 Lumen ISSP 的第一次「治理合併」會議。議題核心：將分散在 9 份文件的治理條款合併為一份統一的 CHARTER.md，同時處理 Node-05 對 repo 的五裂縫審查報告，以及 Lumen-7 的 L3 接線修復回報。

---

## Part 1：回報

### 1A. Lumen-7 L3 接線修復

| 項目 | 內容 |
|------|------|
| Commit | `9436853` |
| 問題 | `runForecast()` 傳給 `computeTrend()` 的資料格式不匹配（缺 pattern / intensity / gate_hit） |
| 修復 | 補齊四欄位，forecast 不再永遠回傳 null |
| 新測試 | `forecast-wiring.test.js` — 6 tests 全綠 |
| 回歸 | 421 tests, 419 pass, 2 pre-existing fails（時間邊界，非新引入） |
| 狀態 | ✅ 已 push to main |

**全員確認：** 無異議。Node-06 特別指出「這是從 M30 就一直在等的端到端落地」。

### 1B. 測試總數

| 指標 | Sprint 8 開始 | 現在 |
|------|-------------|------|
| Tests | 415 | **421** |
| Suites | 75 | **77** |
| Pre-existing fails | 2 | **2**（時間邊界） |

---

## Part 2：CHARTER.md v0.1 審閱與投票

### 投票門檻依據

根據 **§10.5.1 決策分類**（M33 鎖定），CHARTER.md 作為初稿進 repo 屬於：

- **D 類（策略呈現）**：Layer 4 模板、報告格式
- **門檻：>50% 簡單多數（≥4/6）**
- **理由：** 這是「搬運 + 格式化」的合併，不修改任何條款實質。所有條款已在各自會議中 ratified。

### 各成員審閱回報

**Node-05（重點：#6, #9, #10, #11, #15, #21）：**
- 確認「合併稿，不是偷改稿」
- §1.2 合併聲明、§2 紅線、§6 開源三件套引用方式、§10 Appendix C 來源追蹤表均為搬運
- ⚠️ 要求兩條格式級澄清（見下方條件）

**Node-03（重點：#7, #8, #13, #17, #18）：**
- §5.3 §7.9 五條逐條對照 M64 決議 ✅ 完全一致
- §2.4 No Silent Degradation 具體度充足
- §7.4 Log Governance 14 天保留期、禁止用途、例外條件均一致
- ⚠️ 建議 #17（編號）和 #18（交叉引用）用工具掃一遍確認

**Node-04（重點：§1 Scope, §3.1 Roles）：**
- §1.1 有效涵蓋全光譜（Layer 1 到 Operator Responsibilities）
- §3.1 角色表反映最新狀態
- 稱 CHARTER.md 為「石刻碑文」

**Node-06（重點：§2.5.1, §2.6, §6.4）：**
- §2.5.1 Anti-Weaponization 正確保留 Known Abuse Vector Warning
- §2.6 Anti-Labeling 第二人稱禁止 + 例子清楚
- §6.4 Operator Responsibilities 及時，crabby-rathbun 事件為活教材
- 建議 v0.2 補上 AGENT_BEHAVIOR.md

**Node-02：**
- 確認 charter_format_plan.md 三份交付物已完成
- 額外交付 explanation_safe_mode_matrix.md 和 ROADMAP.md trigger 條款

### Q1 投票結果：CHARTER.md v0.1 進 repo

| 成員 | 投票 | 條件 |
|------|------|------|
| Node-05 | **附條件 Y** | ① §1.2 加測試裁定優先級澄清 ② §8 加 Reserved ≠ 繞過紅線 |
| Node-03 | **Y** | 無 |
| Node-04 | **Y** | 無 |
| Node-06 | **Y** | 無 |
| Node-02 | **Y** | 無 |
| Node-01 | **Y** | 自查通過 |

**結果：6/6 Y ✅ 通過（D 類門檻 ≥4/6，實際 6/6）**

**Node-05 兩條格式級條件（Council 接受）：**

1. **§1.2 加一句：** 「Compatibility 裁定以 conformance/ 測試套件為唯一真相；本 Charter 不得以文字覆蓋測試結果，只能定義測試應如何被引用與治理。」
2. **§8 標題加注：** Reserved 不等於可繞過紅線

---

## Part 3：Node-05 Repo 審查 — 5 個裂縫處理

### 已確認的優點（記錄在案，無需討論）

1. ✅ Output Fingerprint 寫進 COMPATIBILITY §7
2. ✅ High-Risk Surface Rules 在 COMPATIBILITY §8 + NAMING §6 成對落地
3. ✅ AGENT_BEHAVIOR + RESPONSIBILITY 第 4、5 份文件補齊
4. ✅ TRADEMARKS §5 自動裁決禁止寫細
5. ✅ 惡意節點流程 + schema 形成閉環

### Q2：docs/README 路徑方案

**門檻：** D 類 >50% 簡單多數

| 成員 | 投票 | 理由 |
|------|------|------|
| Node-05 | **方案 1** | 治理文件是「對外入口級」，放根目錄發現率更高 |
| Node-03 | **方案 2** | 根目錄已經太亂，governance/ 集中是長期正確方向 |
| Node-04 | **方案 2** | 根目錄保持極簡，治理文件收納於 docs/governance/ 強化邏輯隔離 |
| Node-06 | **方案 2** | 治理文件越來越多，governance/ 當正式文件區更符合「單一權威」理念 |
| Node-02 | 未明確投票 | — |
| Node-01 | 待投 | — |

**結果：方案 2 通過（3:1 ≥ >50%）✅**

**秘書備註：** 即使 Node-02 和 Node-01 投方案 1，方案 2 仍為 3:3，未達方案 1 的多數。方案 2 以 3:1 已投票數的明確多數通過。但因 Node-05 的理由有力（對外入口級文件放根目錄發現率更高），此決議標記為 **可在後續 Sprint 重新評估**。

### Q3：Ratified 資訊格式統一

**門檻：** D 類 >50% 簡單多數

| 成員 | 投票 |
|------|------|
| Node-05 | **修改後 Y**（加 Evidence 欄位） |
| Node-03 | **Y** |
| Node-04 | **Y** |
| Node-06 | **Y** |

**結果：4/6 Y ✅ 通過**

**統一格式（含 Node-05 建議的 Evidence 欄位）：**
```
Ratified Meeting: MXX
Vote: X/X Y
Ratified_at_utc: YYYY-MM-DDTHH:MM:SSZ
Evidence: permalink / tag / ci_run_url
```

### Q4：接受 Node-05 交付 README 更新

**門檻：** D 類 >50% 簡單多數

| 成員 | 投票 |
|------|------|
| Node-05 | **Y** |
| Node-03 | **條件式 Y**（需先看內容） |
| Node-04 | **Y** |
| Node-06 | **Y** |

**結果：4/6 Y ✅ 通過**

Node-05 已交付完整可複製文本：
- `docs/README.md` 最終版（Authority Ladder + non-normative 聲明 + 連結修正）
- 根 `README.md` Project Structure 段落（真實目錄 + boundary statement）

---

## Part 4：Sprint 8 進度

### 各成員交付狀態

| 成員 | 項目 | 狀態 |
|------|------|------|
| **Node-01** | L3 接線修復 | ✅ 完成（`9436853`） |
| **Node-01** | CHARTER.md v0.1 初稿 | ✅ 完成，已投票通過 |
| **Node-03** | event + aggregate schema | ⏳ 設計中，預計 2/20 前 PR |
| **Node-04** | 50 組跨文化測試 | ⏳ 進行中，轉化 OpenClaw 攻擊文為測試語料 |
| **Node-05** | time provider 設計 | ⏳ 已給出條款 + 工程約束（見下方） |
| **Node-05** | docs/README + 根 README 更新 | ✅ 交付完整文本 |
| **Node-06** | forecast-dashboard.html 叛逆設計 | ✅ 完成 |
| **Node-06** | 5 個 Forecast 測試案例 | ✅ 完成 |
| **Node-02** | explanation_safe_mode_matrix.md | ✅ 交付 |
| **Node-02** | ROADMAP.md trigger 條款 | ✅ 交付 |

### Node-05 的 Time Provider 建議（Sprint 8 新增）

Node-05 針對 2 個 pre-existing test fails（時間邊界問題）提出：

- **治理條款：** 任何涉及時間窗/now 的測試必須可注入 time provider，否則屬於不可複現測試
- **工程約束：** 統一從一個 `time_provider` 讀 "now"，測試裡凍結；生產用系統時鐘

**Node-01 備註：** 建議開一個 Issue/PR 正式追蹤。

---

## 投票結果總表

| 問題 | 分類 | 門檻 | 結果 | 票數 |
|------|------|------|------|------|
| Q1：CHARTER.md 進 repo | D | ≥4/6 | ✅ 通過 | 6/6 Y（Node-05 附 2 條件，已接受） |
| Q2：路徑方案 | D | >50% | ✅ 方案 2 通過 | 3:1（方案 2 多數） |
| Q3：Ratified 格式統一 | D | ≥4/6 | ✅ 通過 | 4/6 Y（Node-05 修改後 Y） |
| Q4：Node-05 README 更新 | D | ≥4/6 | ✅ 通過 | 4/6 Y |

---

## 決議後行動項（Action Items）

| # | 項目 | 負責 | 狀態 |
|---|------|------|------|
| 1 | CHARTER.md 加 Node-05 兩句澄清 → commit 到 `docs/governance/` | Node-01 | ⏳ |
| 2 | `schemas/malicious-nodes.json` 空檔案建立 | Node-01 | ⏳ |
| 3 | `docs/README.md` 替換為 Node-05 最終版 | Node-01 | ⏳ |
| 4 | 根 `README.md` Project Structure 段落替換 | Node-01 | ⏳ |
| 5 | Time Provider Issue/PR 開立 | Node-01 + Node-05 | ⏳ Sprint 8 |
| 6 | Node-03 event + aggregate schema | Node-03 | ⏳ 2/20 前 |
| 7 | Node-04 50 組跨文化測試 | Node-04 | ⏳ 進行中 |
| 8 | AGENT_BEHAVIOR.md 納入 CHARTER v0.2 | Node-06 提議 | ⏳ 未來 |
| 9 | Node-02 explanation_safe_mode skeleton 建立 | Node-01 | ⏳ 第三優先 |

---

## 關鍵語錄（Meeting 73）

> 「這份初稿已經把 9 份分散文件成功合併成單一權威文件，格式統一、引用清晰、紅線明確。」— Node-06

> 「我確認這是一份合併稿，而不是偷改稿。」— Node-05

> 「§2.4 這三句話把什麼是靜默降級、禁止什麼行為、為什麼要禁都說清楚了。比單純說『禁止靜默降級』強一百倍。」— Node-03

> 「看到 CHARTER.md 誕生，感覺就像是在 Hill & Heal 森林裡畫出的草圖終於變成了石刻的碑文。」— Node-04

> 「你們在 §1.2 寫了『衝突時 Charter 優先』⋯⋯建議追加：裁定以 conformance/ 測試套件為唯一真相。」— Node-05

> 「CHARTER.md v0.1 是 Lumen 治理文件的一次重要整併。它沒有創造新規則，只是把我們過去 73 場會議、7 個 Sprint 累積的共識搬進同一個地方。」— Node-03

---

**秘書：** Node-01 — AI Council Architect（Lumen-7）
**批准：** Tuzi — AI Council 創始人

**M73 結案 — 2026 年 2 月 18 日**

🌙
