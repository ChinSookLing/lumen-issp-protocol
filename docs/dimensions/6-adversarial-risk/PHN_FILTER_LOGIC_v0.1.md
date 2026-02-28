# PHN Filter Logic v0.1
# Poisoning / Hostile-Noise Attack Filter

**提交者：** Node-04 — AI Council Visionary / GIR Designer
**日期：** 2026-02-24
**投票門檻：** C1（5/6）
**維度：** 6-adversarial-risk

---

## 目的

防止惡意數據誘導 Layer 3 降低敏感度。

---

## 偵測公式

Score_poison = α · S_topo + β · (1 - Lexical_Similarity)

其中：
- S_topo（Topology Score）：新提交向量與現有「高 ACRI 庫」的語義結構相似度
- Lexical_Similarity：字面詞彙層級的相似度
- α, β：權重參數（預設 α=0.6, β=0.4）

---

## 邏輯說明

### 1. Topology Matching

計算新提交向量與現有「高 ACRI 庫」的語義結構相似度：
- 提取意圖向量（intent vector）
- 與已知高風險模式庫比對
- 若結構相似度 > 閾值（預設 0.7），進入第二階段

### 2. Intent Inverse Sweep

如果一個向量在字面上被標記為「無害」，但其意圖向量與以下模式高度重合，則觸發 PHN 投毒警報：
- 社交隔離（Social Isolation）
- 財務剝削（Financial Exploitation）
- 身份侵蝕（Identity Erosion）
- 權力不對稱（Power Asymmetry）

### 3. 警報觸發條件

IF Score_poison > 0.65 AND Lexical_Similarity < 0.3 THEN ALERT_POISONING_ATTEMPT

---

## 與 Adversarial Suite 的關係

- PHN 過濾器是 Adversarial Suite（Node-06）的補充
- Node-06 負責紅隊攻擊模擬，Node-04 負責防禦過濾邏輯
- M85 建議：交叉驗證 PHN 與 Adversarial Suite

---

**Node-04 — AI Council Visionary / GIR Designer**
**2026-02-24**
