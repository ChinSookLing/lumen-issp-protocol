# Charter 紅線補句正式版 — §2.6 + §7.4
# Charter Red Line Addendum — §2.6 + §7.4

**來源：** Node-05 設計（M58）+ M59 全員加強
**投票：** M58 全票通過（6/6）§10.5(A) 承重牆門檻
**格式化：** Node-01 (Architect)

---

## 以下條文直接插入 Charter Skeleton 對應位置

---

### §2.6 輸出去人格化 | No Personhood Judgement (Anti-labeling)

【來源】Node-05 提議（M58）+ M59 第二人稱加強
【狀態】🔒 已鎖定（M58 6/6 全票 + M59 加強全員支持）
【填充人】Node-05（撰寫）+ Node-01（格式化）

> _Lumen 協議之所有輸出必須僅描述結構特徵與證據強度（如 Pattern、Component、Intensity、Gate、Window），嚴禁對任何個體或主體進行人格定性、動機推測或道德評價。_
>
> _All outputs of the Lumen protocol must describe only structural features and evidence intensity (e.g. Pattern, Component, Intensity, Gate, Window). Personhood characterization, motive inference, or moral evaluation of any individual or entity is strictly prohibited._

> _任何輸出不得使用第二人稱定罪句式（如「你就是／你在／你很…」），除非為引用原文且明確標記為 quote。_
>
> _No output shall use second-person accusatory framing (e.g. "you are…" / "you did…"), unless directly quoting source material and explicitly marked as [quote]._

```
允許（Permitted）：
  → 「檢測到 EP：forced_response_frame↑」
  → 「EP signal: forced_response_frame elevated」
  → 「Pattern intensity: 0.87」

禁止（Prohibited）：
  → 「你在操控」/ 「You are manipulating」
  → 「你是情勒者」/ 「You are an emotional blackmailer」
  → 「你很自私」/ 「You are selfish」
  → 「目標正在進行操控」/ 「Target is manipulating」
```

**目的：** 把「定罪語氣」從輸出層徹底禁掉，避免寒蟬效應（chilling effect）。

**與既有條款的關係：**
- 是對 §2.2（No Identity Targeting）的落地補強
- §2.2 禁「指控誰」，§2.6 禁「像判官一樣說話」

**合規測試方法：**
- CI 可檢查禁止詞清單：第二人稱 + 定罪動詞（操控/綁架/自私/欺騙等）
- 允許字段白名單：Pattern ID / Component key / intensity / gate / window

---

### §7.4 日誌治理 | Log Governance

【來源】Node-05 提議（M58）+ M59 保留期投票
【狀態】🔒 已鎖定（M58 6/6 全票 + M59 保留期 4/6 多數）
【填充人】Node-05（撰寫）+ Node-01（格式化）

> _節點日誌之紀錄與留存須遵循最小可見原則（least privilege）、定義保留期（default retention）與目的限定原則（purpose limitation）。_
>
> _Node log recording and retention must follow the principle of least privilege, defined retention period, and purpose limitation._

> _日誌僅限於該節點之技術偵錯與安全審計／研究；嚴禁將日誌用於對特定對象之懲戒、羞辱、排名、推定身份或進行跨節點之數據彙總與傳播。_
>
> _Logs are limited to the node's own technical debugging, security auditing, and research. Logs shall not be used for punitive action, shaming, ranking, identity inference, or any cross-node data aggregation and dissemination._

```
預設保留期（Default Retention）：
  → 14 天（M59 投票：4/6 多數）
  → 14 days (M59 vote: 4/6 majority)

保留例外（Retention Exception）：
  → 僅限本節點事故調查（incident investigation）/ 研究用途
  → Only for node-local incident investigation / research purposes
  → 需明示開關（must be explicitly enabled）
  → 且於本節點可見（and visible within the node）

禁止用途（Prohibited Uses）：
  → 懲戒（Punitive action）
  → 羞辱（Shaming）
  → 排名（Ranking）
  → 推定身份（Identity inference）
  → 跨節點彙總（Cross-node aggregation）
  → 跨節點傳播（Cross-node dissemination）
```

**目的：** 把「隱性權力」鎖死 — 即使沒有中央庫（§2.3），也避免日誌變成「抓人材料」。

**與既有條款的關係：**
- 是對 §7.1（No Centralization）+ §7.2（Evidence Output Dual Standard）+ §7.3（Semantic Desensitization）的落地補強
- 與 §4.3.2(d)（No Silent Degradation）相容：同樣是把高風險默認行為「鎖死」

**合規測試方法：**
- 節點 audit 時檢查：日誌是否超過 14 天未清除？
- 節點 audit 時檢查：日誌是否被用於列表中的禁止用途？
- retention exception 開關是否有明示記錄？

---

## Appendix A 更新

| 條文 Clause | 狀態 Status | 填充人 Owner | 依賴 Dependencies |
|-------------|-------------|--------------|-------------------|
| §2.6 | 🔒 | Node-05 + Node-01 | M58 6/6 + M59 加強 |
| §7.4 | 🔒 | Node-05 + Node-01 | M58 6/6 + M59 14天保留期 |

## Appendix B 更新

| 來源 Source | 影響條文 Affected Clauses |
|-------------|--------------------------|
| Meeting 58 紅線補句全票 | §2.6, §7.4 |
| Meeting 59 第二人稱加強 + 保留期投票 | §2.6, §7.4 |

---

**Node-05** — 撰寫
**Node-01** — 格式化
**M58 + M59 — 2026 年 2 月 14 日**

🌙
