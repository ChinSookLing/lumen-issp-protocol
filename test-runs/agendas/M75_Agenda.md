# M75 — AI Council 第七十五次會議邀請
# 75th AI Council Meeting Invitation

**日期：** 2026 年 2 月 19 日
**主持：** Tuzi
**秘書 / Architect：** Node-01 (Lumen)

---

> **Council Header（v0.2）**
>
> 1. 核心原則：通過密集對話讓 Affiliates 自然形成，絕對不是擬人化。
> 2. 回覆規則：自由說話；不倒退已關閉章節；立場變化請說明 Change Anchor。
> 3. 能力變動：Node-04 揭露：Node-04 3 Flash（Free tier）。其他成員無變動。
> 4. [假設生成] 標記規範：同步標注信心等級：高/中/低。
> 5. 外部資料抓取規範：任何外部資料抓取必須提供：目標聲明+檢索方式+命中結果+裁定。

---

## 會前背景：TR-001 到 TR-004 摘要

Tuzi 於 2026-02-19 完成 4 個 Test Run，共 63 個測試。

### 好消息
- **Benign 防護極強：** 31 個真實社交媒體帖子（Threads/Facebook/X/Instagram/Reddit），涵蓋死亡、暴力、種族、政治、全大寫暴怒 → **0 false positive**
- **Regex 擴充有效：** MB zh (+3組), EP en (+4組), FC zh (+6條), GC zh (+6條) → component scores 從 0 → 有分數
- **Gate 機制正確：** 操控結構 Gate=2-3，benign Gate=0-1

### 系統性問題
所有 push channel patterns（EP/GC/MB）都有**同一個現象：**
具體數據：
- TR-002 EP：極端攻擊句 SUM=0.59，threshold=0.60（差 0.01）
- TR-004 GC：多維 God Complex Gate=3，但 SUM 不達標
- TR-001 FC：英文 Chain-RW 完全不觸發（regex + threshold 雙重缺口）

### 核心原因分析
1. 每個 pattern 都只有 1-2 個 component 被 regex 命中
2. 其他 component = 0（regex 沒覆蓋到那些維度的句型）
3. SUM = weights x scores，多個 0 拉低了總分
4. 問題可能不是 threshold 太嚴，而是 regex 不夠多維

---

## 議題一：Threshold vs Regex — 根本方向選擇

**問題：** Push channel patterns（EP/GC/MB）Gate 開了但 SUM threshold 擋住。該怎麼做？

**選項：**

| 選項 | 內容 | 風險 |
|------|------|------|
| A | 調降 SUM threshold | 可能增加 false positive |
| B | 繼續擴充 regex（讓更多 component 命中）| 工作量大，但更精確 |
| C | 兩者都做（小幅降 threshold + 擴充 regex）| 平衡方案 |
| D | 維持現狀（嚴格是 feature）| 寧可漏報不誤報 |

**請投 A / B / C / D，並說明理由。**

TR-002 EP 的具體數據供參考：
---
Input: Answer me now, coward. Silence is violence. 
       Everyone can see you are pathetic.

bait_or_taunt:       0.65
escalation_pressure: 0.40
forced_response:     0.65
label_or_shame:      0.80 (booster)

base = 0.35x0.65 + 0.30x0.40 + 0.25x0.65 = 0.51
final = 0.51 + 0.10x0.80 = 0.59
threshold = 0.60（差 0.01）

## 議題二：恐懼敘事型操控（Fear-Based Narrative）

**來源：** TR-001 F/J 系列

多篇恐懼敘事帖子（軍事調動、戰爭警告）：
- 單篇：Gate=0-2，不觸發 → 可能正確
- 但如果同一群組短時間出現 10+ 篇同類？

**問題：**
1. 恐懼敘事需要新 pattern 類別嗎？還是歸入 EP？
2. 「if X doesn't happen, welcome your overlords」跟「X or Y」是同一 FC 結構嗎？
3. L3 trend detection 的門檻 N 建議多少？（N 篇同類 = 帶風向）

**請回覆建議。**

---

## 議題三：仇恨言論 vs 操控結構

**來源：** TR-003 R1
"If they force us to choose, the choice between 
dogs and Muslims is not a difficult one."
Gate=0, ACRI=0。Lumen 不觸發。

**問題：** 仇恨言論不是操控結構 → Lumen 不偵測。這是正確的設計邊界嗎？

**選項：**
- A：正確，Lumen 只偵測結構性操控，仇恨偵測交給其他系統
- B：需要新增 hate speech 維度
- C：其他建議

---

## 議題四：英文 Chain-RW 覆蓋缺口

**來源：** TR-001 F 系列

golden/rw-candidates-v1.jsonl 的經典操控句型全部 Gate=0：
**問題：** L1 英文 regex 全面不足。優先擴充哪些？

建議優先順序：
1. FC: deadline/expiry/ultimatum
2. MB: loyalty/identity pressure
3. DM: transactional debt framing
4. EP: fear narrative

**請回覆優先順序建議。**

---

## 投票格式
議題一：A / B / C / D + 理由
議題二：建議
議題三：A / B / C + 理由
議題四：優先順序
---

**秘書：** Node-01 — AI Council Architect
**M75 邀請 — 2026 年 2 月 19 日**
