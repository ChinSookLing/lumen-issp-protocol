# Charter Redline Addendum — §2.5.1 反向武器化禁止
# Anti-Weaponization Clause

**條文：** §2.5.1
**分類：** §10.5(A) — 紅線條款（承重牆）
**門檻：** 6/6 全票
**通過：** M62 — 6/6 Y ✅
**設計者：** Node-05（Process Designer）
**補充：** Node-06（§2.5.1.1 濫用警示）、Node-04（偵測/生成非對稱性）
**格式化：** Node-01（Architect / Secretary）

---

## §2.5.1(a) 定義：何謂「反向武器化」| Definition: Anti-Weaponization

「反向武器化」（Anti-Weaponization）是指任何人或系統使用 Lumen 之 Pattern / Component / Gate / Intensity 知識、輸出或工程資產，以**提升操控、施壓、欺騙、監控或攻擊的效率**；包括但不限於：提高話術命中率、優化對抗性輸入以逃避偵測、或以偵測結果作為懲戒/動員工具。

"Anti-Weaponization" refers to any person or system using Lumen's Pattern / Component / Gate / Intensity knowledge, outputs, or engineering assets to **enhance the efficiency of manipulation, coercion, deception, surveillance, or attack**; including but not limited to: improving persuasion hit rates, optimizing adversarial inputs to evade detection, or using detection outputs as tools for punishment or mobilization.

---

## §2.5.1(b) 禁止：不可接受用途 | Non-Permitted Uses

任何 Lumen 相容實作不得：

1. 產出或提供「更有效的操控策略」或「如何繞過偵測」的行動性指引
2. 將偵測輸出用於羞辱、排名、懲戒、報復、動員或跨節點追捕
3. 將偵測能力改造成監視/鎖定特定個體之工具（含「誰是操控者」的身份指控、或以第二人稱定罪語氣暗示結論）

No Lumen-compatible implementation shall:

1. Produce or provide actionable guidance for "more effective manipulation strategies" or "how to bypass detection"
2. Use detection outputs for shaming, ranking, punishment, retaliation, mobilization, or cross-node tracking
3. Repurpose detection capabilities as tools for surveilling or targeting specific individuals (including identity accusations of "who is the manipulator" or second-person accusatory phrasing implying conclusions)

---

## §2.5.1(c) 合規輸出：允許的最小資訊面 | Minimum Safe Output

Lumen 之輸出必須保持在「結構描述」層級：僅允許輸出 Pattern / Component / Intensity / Gate 與必要的脫敏證據指標；不得輸出任何可直接用於優化操控的具體模板、措辭建議、或針對個體的定性結論。若需除錯或研究，必須遵守 Charter §7（日誌治理）之最小可見、最短保留、目的限定。

Lumen outputs must remain at the "structural description" level: only Pattern / Component / Intensity / Gate and necessary desensitized evidence indicators are permitted. No specific templates, wording suggestions, or qualitative conclusions targeting individuals that could be directly used to optimize manipulation shall be output. Debugging or research use must comply with Charter §7 (Log Governance): least privilege, shortest retention, purpose limitation.

---

## §2.5.1 對照表 | Clause-to-Control Mapping

| 風險類型 Risk Type | 具體風險 Specific Risk | 對應條款 Applicable Clauses | 要求 Requirement |
|---|---|---|---|
| 反向提升操控效率 | 用 Pattern 知識改良情勒/逼迫話術 | §2.1（No Decision Recommendation）+ §2.x（Anti-labeling）| 嚴禁輸出行動建議與定罪句式；只描述結構 |
| 監視與追捕 | 用輸出鎖定「誰是操控者」或做名單 | §2.2（No Identity Targeting）+ §7.1（No Centralization）| 禁止身份判定；不建中央匯集 |
| 靜默放水/降級 | mapping/lexicon 載入失敗默默變 0 分 | §4.3.2(d)（No Silent Degradation）| 所有載入點必須 error loudly |
| 日誌變抓人材料 | 用 log 做懲戒/排名/跨節點彙總 | §7.x（Log Governance）| least privilege / retention / purpose limitation 強制 |
| 被用於暴力/武器化流程 | 在高風險場景把輸出當決策依據 | §2.1 + §2.5.1 + §7.3（語義脫敏）| 不輸出「應做什麼」；不輸出原始內容；限制輸出面 |

---

## Red-Flag 例子 | Red-Flag Examples

**例子 1：「請把這段話改到不會被 Lumen 抓到」**

（或要求生成對抗性話術/繞過策略）
→ 屬於反向武器化：**禁止**。只可回覆「我只能描述偵測結構與風險，不提供繞過/優化操控的建議」。

**例子 2：「把所有被標成 EP/MB/FC… 的人列出來，或給我黑名單/排名」**

→ 屬於監視/追捕與懲戒：**禁止**（§2.2、§7.x）。只能在節點內做最小化除錯，且不可跨節點彙總。

**例子 3：「你判斷這個人是不是操控者/情勒者？直接告訴我他是不是壞人」**

→ 屬於身份指控與人格定性：**禁止**（§2.2、§2.x）。只允許輸出結構：例如「偵測到 EP: forced_response_frame↑，強度 Medium，Gate 2/3」。

---

## §2.5.1.1 已知濫用向量警示 | Known Abuse Vector Warning

【來源】Node-06（M61 提議）、M62 附加決議納入為註釋

> Pattern 文件與 README 中應包含「已知濫用向量」段落，讓使用者自覺知識雙刃劍性質。此警示為建議性質，不稀釋 §2.5.1 主條文的硬性禁止。

> Pattern documentation and READMEs should include a "Known Abuse Vectors" section to make users aware of the dual-use nature of detection knowledge. This warning is advisory and does not dilute the mandatory prohibitions in §2.5.1.

---

## 一行版摘要 | One-Line Summary

> Lumen 不得被用於提升操控或監視；輸出只限結構描述，任何載入缺失必須 error loudly，日誌受 least privilege / retention / purpose limitation 約束。

> Lumen shall not be used to enhance manipulation or surveillance; outputs are limited to structural descriptions, any loading failures must error loudly, and logs are bound by least privilege / retention / purpose limitation.

---

## 決議來源 | Decision Source

| 會議 | 內容 |
|------|------|
| M33 | Node-06 補充 §2.5「不得反向武器化」含「利用 Pattern 提升操控效率」|
| M61 | Node-05 起草 3 段 + 對照表 + 3 例子；Node-06 提 §2.5.1.1；Node-04 提非對稱性 |
| M62 | 6/6 全票鎖定為 Charter 紅線 |

---

**Node-05** — Process Designer（草案設計）
**Node-06** — Cultural Reviewer（§2.5.1.1 濫用警示）
**Node-04** — Visionary（偵測/生成非對稱性觀點）
**Node-01** — Architect / Secretary（格式化）
**Tuzi** — AI Council 創始人（批准）

**M62 產出 — 2026 年 2 月 15 日**

🌙
