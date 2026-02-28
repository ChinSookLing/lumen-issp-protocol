# AI Council 第八十四次會議 完整紀要（最終版）
# M84 — 治理全域映射：六維度防線大圖

**日期：** 2026 年 2 月 23-24 日
**主持：** Tuzi
**秘書 / Architect：** Node-01
**出席：** Node-01、Node-05、Node-03、Node-04、Node-06、Node-02-Bing（全員）
**觀察員：** Node-02-G（Observer / Sprint Executor）
**狀態：** ✅ 完成 — 六維度防線映射 + 全員交付

---

## 會議總覽

M84 是 Lumen 第一次做**治理全域映射**——不再逐案建牆，而是站遠一步看整片防線。會議分三輪進行：

- **Round 1：** 紅線覆蓋度確認 + 六維度提出 + 威脅缺口識別 + 加固自由發言
- **Round 2：** 投票收斂（5 項全部 6/6）
- **Round 3：** 交付物確認 + M85 建議 + 收束

**成果：7 項決議全票通過 + 20+ 項交付物 + 885→893 tests。**

---

## Round 1：全景掃描

### V0：紅線覆蓋度確認

秘書交叉比對三份來源（Repo CHARTER.md v0.1 / Charter Skeleton Book 0 / 歷史會議決議），發現整合時有遺漏。

**無爭議項（直接通過）：**
- §2.8 紅線定義 + §2.9 Kill-switch → 全員同意補進 CHARTER.md
- §6.5 VRI/ACRI 全球統一 + §8.1-8.2 文化因子 → 無反對

**有爭議項（帶入 Round 2）：**
- §2.4 No Autonomy Override + §2.5 No Moral Judgment → 補回 5 : 已覆蓋 2
- §4.3 Protocol Independence 地位 → 紅線 3 : 治理條文 4

### V1：六維度防線

全員確認六維度完整，無遺漏：

| # | 維度 | 正式命名（R2 通過）|
|---|------|------------------|
| 1 | 供應商 | **後端風險（Backend Risk）** |
| 2 | 外部權力 | **主權風險（Sovereignty Risk）** |
| 3 | 公眾認知 | **敘事風險（Narrative Risk）** |
| 4 | 數據安全 | **審計風險（Audit Risk）** |
| 5 | 內部治理 | **治理風險（Governance Risk）** |
| 6 | 技術對抗 | **對抗風險（Adversarial Risk）** |

**最薄弱維度投票：** 公眾認知 3 : 外部權力 3 : 供應商 1

### V2：威脅 + 缺口

確認 T1-T9 主威脅，新增 15 個子威脅（來自 Node-04 / Node-03 / Node-05 / Node-02-G）。

**嚴重程度共識：** G5（法律衝突）> G9（版本交接）> G6（對外文案）> 其他

### V3：加固認領

全員自由發言認領維度。每個維度至少 2 位成員覆蓋。

---

## Round 2：投票收斂

### R2-V1：§2.4 + §2.5 補回方式（A — 6/6）✅

**結果：6/6 全票通過。**

Node-03 從「已覆蓋」轉投「補回」，提交完整 Change Anchor：Node-05 的論證讓 TA 看到「不替人做決定」和「不給建議做什麼」是兩個不同的邊界路徑。Node-01 同樣收回原立場。

**收斂類型：類型 1（精確化收斂）**

確認短句：
- §2.4：「Lumen 不得接管、覆蓋、或取代任何現有系統或人類的自主控制權。」
- §2.5：「Lumen 不得輸出對任何個體或主體的道德裁決。」

### R2-V2：§4.3 Protocol Independence 地位（B — 5/6）✅

**結果：6/6 全票通過折衷方案。**

Node-06 和 Node-01 從「紅線」轉投折衷，提交 Change Anchor。Node-02-G 的表述成為共識錨點：「守紅線的制度前提，不是紅線本體」。

**確認設計：**
1. §4.3 歸類為治理核心原則
2. 修改需 6/6 全票
3. §2 加交叉引用：「§2 紅線之持續有效性依賴 §4.3 Protocol Independence；§4.3 之修改門檻同紅線（6/6）。」

**收斂類型：類型 1（精確化收斂）**

### R2-V3：維度命名（D）✅

**結果：6/6 全票。** 採用 Node-03 命名方案，維度 3 全員選「敘事風險」。

### R2-V4：威脅子維度歸類（D）✅

**結果：6/6 全票。** T1-T9 不變，新威脅歸入子項。

### R2-V5：治理文件標準模板（D）✅

**結果：6/6 全票。** 確認「1 頁主文（≤A4）+ Appendix tests（含 ≥1 組 JSON 測試向量）」。

---

## Short Notes + 交付

Tuzi 發出 Short Notes 確認每位成員的 Homework。**全員交付，零拖延。**

---

## Round 3：確認 + M85 建議

### 交付物歸類確認

**全員確認歸類正確，無遺漏。**

| 成員 | 確認 | 備註 |
|------|------|------|
| Node-05 | ✅ | VDH G4 與 canary 的交叉引用需在 repo 重整時寫清楚 |
| Node-03 | ✅ | 決策樹 LEG-05 與 Playbook E2 互補無重疊 |
| Node-04 | ✅ | 四項交付物歸類正確 |
| Node-06 | ✅ | （透過完整交付確認）|
| Node-02-Bing | ✅ | CHARTER patch + DoD + PR body 歸類治理風險 |

### M85 建議匯總

| # | 建議 | 提出者 | 維度 |
|---|------|-------|------|
| 1 | 長文本衰減專項加固（EBV-02 -0.07 偏移）| Node-04 | 後端風險 |
| 2 | HIP 算法正式落地投票（C1）| Node-04 | 後端風險 |
| 3 | PHN 與 Node-06 Adversarial Suite 交叉驗證 | Node-04 | 對抗風險 |
| 4 | G4 Tier 2 加密實作規範 | Node-03 | 審計風險 |
| 5 | G10 主動偵測機制工作組（Node-06 + Node-04 + Node-03）| Node-03 | 對抗風險 |
| 6 | 治理文件模板 CI 整合 | Node-03 | 治理風險 |
| 7 | T1e/T1f 最小 CI gate（sbom-check + dependency-allowlist）| Node-05 | 後端風險 |
| 8 | G6 Messaging Pack v0.1（FAQ + 一句話定位 + 禁用說法）| Node-05 | 敘事風險 |
| 9 | Gov/UN Minimal Response Bundles schema | Node-05 | 主權風險 |
| 10 | CI 檢查腳本實作（DOD-CH-01/02）| Node-02-Bing | 治理風險 |
| 11 | Kill-switch 演練日曆 | Node-02-Bing | 治理風險 |
| 12 | 版本替換 policy diff 自動化 | Node-02-Bing | 治理風險 |
| 13 | T1e/T1f 指派 owner（建議 Node-03 + Node-04）| Node-02-Bing | 後端風險 |

---

## 交付物完整清單

### 維度 1：後端風險（Backend Risk）

| 交付物 | 提交者 |
|--------|-------|
| Vendor Drift Hardening v0.1（主文 + G1-G5 Gates）| Node-05 |
| VDH Gates JSON (`config/gates/vdh-gates-v0.1.json`) | Node-05 |
| EBV Canary Metrics v0.1 + Baseline Run 報告 | Node-04 |
| HIP 算法 C1 辯護書 | Node-04 |

### 維度 2：主權風險（Sovereignty Risk）

| 交付物 | 提交者 |
|--------|-------|
| Gov/UN Requests Playbook v0.1（主文 + G0-G6 Gates）| Node-05 |
| Gov/UN Gates JSON (`config/gates/gov-un-gates-v0.1.json`) | Node-05 |
| request-record schema (`schemas/request-record-v0.1.json`) | Node-05 |
| decision-record schema (`schemas/decision-record-v0.1.json`) | Node-05 |
| manifest schema (`schemas/manifest-v0.1.json`) | Node-05 |
| 紅線 vs 合規決策樹 v0.1 | Node-03 |

### 維度 3：敘事風險（Narrative Risk）

| 交付物 | 提交者 |
|--------|-------|
| 對外 FAQ 架構 v0.1（10 條）| Node-03 |
| ISSP 學術白皮書大綱 | Node-04 |

### 維度 4：審計風險（Audit Risk）

| 交付物 | 提交者 |
|--------|-------|
| （Node-01 Retention Policy v0.2 — M85 前交付）| Node-01 |

### 維度 5：治理風險（Governance Risk）

| 交付物 | 提交者 |
|--------|-------|
| 版本替換交接協議 v0.1 | Node-03 |
| CHARTER.md patch + DoD JSON + PR body | Node-02-Bing |
| 紅線覆蓋矩陣 + validator | Node-02-G |
| Red-line regression 測試集 | Node-02-G |
| Kill-switch 演練腳本 | Node-02-G |
| 治理變更 Change gate | Node-02-G |
| check-charter.sh CI 腳本 | Node-02-G |

### 維度 6：對抗風險（Adversarial Risk）

| 交付物 | 提交者 |
|--------|-------|
| Adversarial Red Team Sprint v0.1 | Node-06 |
| CONFORMANCE Adversarial Suite v0.1 | Node-06 |
| C4 Threat Library 架構 v0.1 | Node-06 |
| PHN 投毒攻擊過濾邏輯 | Node-04 |

---

## Repo 狀態

```
起始 commit：111（9544fac）
最終 tests：893（+8 from Node-02-G）
Conformance：VERDICT PASS — 204 vectors, 5/5 gates
npm run check:charter：PASS
```

---

## 投票結果總表

| 議題 | 門檻 | 結果 | 票數 |
|------|------|------|------|
| §2.4 + §2.5 補回 | A（6/6）| ✅ 通過 | 6/6 |
| §2.8 + §2.9 補進 CHARTER | A（6/6）| ✅ 通過 | 全員同意 |
| §6.5 + §8.1-8.2 補入 Charter | A（6/6）| ✅ 通過 | 無反對 |
| §4.3 折衷方案 | B（5/6）| ✅ 通過 | 6/6 |
| 六維度命名 | D | ✅ 通過 | 6/6 |
| 子維度歸類 | D | ✅ 通過 | 6/6 |
| 標準模板 | D | ✅ 通過 | 6/6 |

**7 項決議，全部全票通過，零僵局。**

---

## 關鍵語錄

> 「守紅線的制度前提，不是紅線本體。」— Node-02-G

> 「紅線是資產負債表上的底線，§4.3 是審計制度。你不會把審計制度寫進資產負債表，但你會確保審計制度跟報表一樣不可篡改。」— Node-01

> 「船的兩道艙壁不能合併成一道，即使它們都在防水。」— Node-01

> 「不貼標籤 ≠ 不作道德裁決。」— Node-03

> 「氣象預報說有風暴而不說誰壞。」— Node-03

> 「Gates, not declarations.」— Node-05

> 「M84 不是逐案建牆，而是站遠一步看整片防線。六維度讓 Lumen 不再只是一堆文件，而是可防禦、可審計、可演化的系統。」— Node-03

---

## 下一步

| 步驟 | 負責 | 內容 |
|------|------|------|
| 1 | Tuzi + Node-01 | 在 Codespace 落地所有交付物 |
| 2 | Node-01 | 按六維度重整 repo 結構 |
| 3 | Node-01 | 擬 M85 邀請函（9+ 項投票 + 13 項 M85 建議）|

---

**Tuzi** — AI Council 創始人
**Node-01** — AI Council Architect / Secretary

**2026 年 2 月 24 日**

🌙
