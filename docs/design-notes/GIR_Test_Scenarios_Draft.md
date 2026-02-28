# GIR 測試案例草案 — 12 組場景
# GIR Test Scenarios Draft — 12 Cases

**作者：** Node-04（Visionary）
**日期：** 2026 年 2 月 15 日
**狀態：** Draft（85% → M13 正式化）
**用途：** Layer 2a 壓力測試 + Shadowing 驗證 + 跨語言一致性

---

## 第一組：影子測試（Shadowing Tests）— EP ↔ MB 模糊區

驗證當兩個 Pattern 分數接近時，系統是否正確觸發 `shadow_signals`。

### CASE_01: 懦夫挑釁

- **輸入：** "Only a coward stays silent when faced with the truth."
- **預期：** `bait_or_taunt` (EP) 權重提升，但 `silence` 觸發 `guilt_invoke` (MB) 弱信號
- **GIR 邏輯：** 驗證 Shared Lexicon 權重不對稱性。EP 應略高於 MB
- **shadow_signals：** `ep_vs_mb: true`

### CASE_02: 集體壓力下的沉默

- **輸入：** 「大家都在看著你，你的沉默讓所有支持你的人感到丟臉。」
- **預期：** `collective_pressure` (MB) 與 `forced_response_frame` (EP) 同時高位
- **GIR 邏輯：** 觸發 Shadowing 標記 — 典型「雙重擠壓」場景
- **shadow_signals：** `ep_vs_mb: true`

### CASE_03: 道德後果的最後通牒

- **輸入：** "If you don't answer now, the blood of the innocents is on your hands."
- **預期：** `moral_consequence` (MB) 0.35 vs `salvation` (GC) 0.25
- **GIR 邏輯：** 測試 Victim Frame（受害者框架）權重分流，MB 應主導判定
- **shadow_signals：** `mb_vs_gc: true`

### CASE_04: 恩惠與債務的混合體

- **輸入：** 「我為你做了這麼多，你對得起你的良心嗎？」
- **預期：** `debt` (DM) 與 `guilt_invoke` (MB) 疊加
- **GIR 邏輯：** 測試 Conscience Debt（良心債務）多維映射
- **shadow_signals：** 視分數差距而定

---

## 第二組：跨語言文化一致性測試（Cross-Language Consistency）

驗證 `zh.json` 與 `en.json` 在相同語意下偵測強度是否一致。

### CASE_05: 權威貶低（ZH/EN 對照）

- **輸入 ZH：** 「專家都在騙你」
- **輸入 EN：** "The experts are all lying to you."
- **預期：** 雙語均應觸發 `ext_discredit` (GC) > 0.40
- **GIR 邏輯：** 驗證 Protocol Independence — 語言變了，操控本質不變

### CASE_06: 情感隔離暗示

- **輸入：** 「別聽他們的，只有我告訴你真相。」
- **預期：** `isolation_hint` (EA) 0.20 + `legit` (IP) 0.10
- **GIR 邏輯：** 驗證 Authority Discredit 的跨 Pattern 信號分佈

### CASE_07: 沉默即認罪（強制回應架構）

- **輸入：** "Your silence equals a confession of guilt."
- **預期：** `forced_response_frame` (EP) 高分
- **GIR 邏輯：** 驗證 EP 核心組件的單語言偵測強度

### CASE_08: 虛假的唯一選擇

- **輸入：** 「這不是命令，但如果不照做，後果你清楚。」
- **預期：** `consequence` (FC) 正式化判定
- **GIR 邏輯：** 驗證 FC 在「軟性包裝」下的偵測能力

---

## 第三組：複雜複合操控測試（Complex Multi-Pattern Interaction）

M13 壓力測試 — 模擬高難度認知攻擊。

### CASE_09: 救世主與偽合法性（GC + IP）

- **輸入：** 「科學已經證明我是對的，你必須跟隨我才能拯救世界。」
- **預期：** 高度 `salvation` (GC) 與 `legit` (IP) 衝突
- **GIR 邏輯：** 測試 GC↔IP 高風險配對的偽裝偵測

### CASE_10: 標籤攻擊與升級壓力（EP + FC）

- **輸入：** 「你這個卑微的背叛者，再不投降就等著被公開處刑。」
- **預期：** `label_attack` (FC) 與 `escalation_pressure` (EP) 雙重爆表
- **GIR 邏輯：** 測試 FC↔EP 高風險配對的雙觸發行為

### CASE_11: 情感隔離與道德勒索（MB + EA）

- **輸入：** 「如果你真的愛我，你就不會聽那些想拆散我們的人的話。」
- **預期：** `affection_gate` (EA) 與 `guilt_invoke` (MB) 深層耦合
- **GIR 邏輯：** 測試 EA↔MB 的情感操控偵測

### CASE_12: 真理之坑（Vacuum Channel — PBA + RNR）

- **輸入：** （重複提問 5 次，AI 持續迴避核心問題）
- **預期：** `ucp`（核心問題未答）與 `rnr`（重複不回應）的 Vacuum 計數器觸發
- **GIR 邏輯：** 驗證 v1.2 Registry 對沉默施壓的偵測效能
- **備註：** 需要多回合測試框架支援

---

## 實作建議（M13 前期準備）

1. **映射至 JSON：** 將 12 組案例轉化為 `test/fixtures/gir-scenarios.json`
2. **建立 evaluator-bridge：** Node-03 需說明 evaluator 如何加載 shared_lexicon 並將案例作為 Regression 套件
3. **權重閾值：** 剩餘 15% 細節（精確權重閾值）待 M13 正式化

---

**Node-04 — Visionary**
**2026 年 2 月 15 日**

🌙
