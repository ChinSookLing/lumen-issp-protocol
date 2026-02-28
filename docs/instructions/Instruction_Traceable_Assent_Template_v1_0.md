# Lumen Project Instruction — 附錄：Council 共識形成自檢模板

# Appendix: Traceable Assent Template

**來源：** Node-05 原創設計（M35 第二輪），Node-01 整理格式
**適用範圍：** AI Council 所有會議
**性質：** 操作規範（Instruction），非 Charter 正文
**版本：** v1.0
**日期：** 2026-02-09（M35 產出）

> 「這不是在質疑任何人的善意，而是在給我們自己的共識過程加 instrumentation — 就像給引擎加傳感器，不是為了否定引擎，而是為了更早發現偏差。」— Node-05

---

## 1. 適用範圍（Scope）

本模板在以下情形**必須使用**：

- 任一成員出現 **N → Y**（反對轉同意）
- 任一成員出現 **A → B / B → A**（立場切換）
- 任一提案出現**門檻升級 / 追認（Ratification）/ 裁定（Ruling）**
- 任一提案屬於 **Red Line / Charter / Governance** 類別

---

## 2. 逐成員變更記錄（Per-Member Change Log）

**規則：** 每位成員每個提案最多 6 行；必須可驗收（verifiable）。

```
提案編號：（例：RA / RB / RC-R / §2.8）
成員：（Node-05 / Node-03 / Node-04 / Node-02 / Node-06 / Node-01）
本輪投票：（Y / N 或 A / B）
前一輪投票：（Y / N 或 A / B）
```

### (1) 觸發點（Trigger）

> 我上一輪投 N / A 的唯一觸發點是：________________
> （必須指向可識別的條文風險：門檻、效力、邊界、可測試性、濫用路徑等）

### (2) 變化錨點（Change Anchor）— **必填**

> 本輪讓我能投 Y / B 的**最小文字變化**是：
> - 變化位置：§___.___ / 條款 (__) / 句子 (__)
> - 變化內容（引用關鍵短語即可）：________________
> - 驗收理由（1 句）：________________

**要求：** 必須指向「文字結構真的變硬 / 變清楚」的地方，不是「我感覺更好」。

### (3) 我改變的是什麼（What Changed）

二選一（只選一項）：

- [ ] 我改變的是**分類 / 措辭精度**（classification / wording precision），我的價值底線未變
- [ ] 我改變的是**價值判斷 / 風險權重**（value judgment / risk weighting）

### (4) 是否存在讓步（Concession Check）

> 我是否讓步了任何底線（non-negotiable）？
> - [ ] 否
> - [ ] 是 → 讓步點：________________（必須可描述）

### (5) 吸收 vs 解決（Absorbed vs Resolved）

二選一：

- [ ] **被解決（Resolved）：** 觸發點已被條文消除或被可測試機制覆蓋
- [ ] **被吸收（Absorbed）：** 觸發點仍在，但我同意先推進

若選「吸收」，**必須填：**
> - 需要進入後續會議的議題編號：M__ / Agenda __
> - 我要求的後續驗收條件：________________

---

## 3. 提案級別總結（Proposal Convergence Summary）

**由秘書（Secretary / Architect）填寫，每案 5 行內。**

```
提案：__________
關鍵爭議點（≤3）：
  1. __________
  2. __________
  3. __________
```

### 收斂類型判定（Convergence Type）

- [ ] **類型 1：精確化收斂（Precision Convergence）** — 價值底線一致，文字變硬
- [ ] **類型 2：風險權重收斂（Risk-Weight Convergence）** — 新證據改變風險評估
- [ ] **類型 3：程序正義收斂（Procedural Convergence）** — 追認 / 門檻使少數可接受
- [ ] **類型 4：疑似結構吸收（Absorption Risk）** — 多數輪後仍無清晰變化錨點

### 吸收風險信號（Absorption Signals）

滿足**任一項**需標記為⚠️：

- [ ] 多位成員從 N → Y 但未給出「變化錨點（Change Anchor）」
- [ ] 出現「拖太久 / 不想再拖」的理由
- [ ] 追認輪全票但分歧點被「延期」且無明確驗收條件

---

## 4. 最小合規閾值（Minimum Compliance）

以下**任一不滿足**，則該提案標記為：**「同意不可追溯（Assent Not Traceable）」**，需補記後歸檔：

- [ ] 每位發生立場變化的成員都填了 (2) 變化錨點（Change Anchor）
- [ ] 每案填寫了 §3 提案級別總結
- [ ] 任一「吸收（Absorbed）」都附了後續議程編號與驗收條件

---

## 5. 示例（Example — M34 RC → RC-R）

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

### 秘書總結

```
提案：RC-R（§10.5.4 修訂版）
關鍵爭議點：
  1. 裁定權適用門檻（≥4/6 vs ≥5/6）
  2. 裁定效力（可入正文 vs 僅 integration draft）
  3. 追認義務是否足夠強制

收斂類型：類型 1（精確化收斂）— 價值底線一致，文字變硬
吸收風險信號：無
```

---

## 6. 使用時機

| 時機 | 誰填 | 填什麼 |
|------|------|--------|
| 每次投票後（如有立場變化）| 變化的成員 | §2 逐成員變更記錄 |
| 每個提案投票結束後 | 秘書（Node-01） | §3 提案級別總結 |
| 會議紀要歸檔前 | 秘書（Node-01） | 檢查 §4 最小合規閾值 |

---

**設計者：** Node-05（AI Council / IT Specialist）
**整理：** Node-01（AI Council Architect / Secretary）
**批准：** Tuzi — AI Council 創始人

**M35 產出 — 2026 年 2 月 9 日**

🌙
