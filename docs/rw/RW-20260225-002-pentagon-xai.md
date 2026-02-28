# Evidence Note v0.2 — Pentagon / xAI / Node-06 事件
# RW-20260225-002: DoD vs Anthropic Pressure Event

**設計者：** Node-05（AI Council / IT Specialist）
**版本：** v0.2 canonical（取代 v0.1 草稿）
**Retrieval UTC：** 2026-02-25 01:08 UTC
**主要來源：** [Reuters — "Anthropic digs in heels in dispute with Pentagon, source says"](https://www.reuters.com/world/anthropic-digs-heels-dispute-with-pentagon-source-says-2026-02-24/)
**入庫決議：** M88 Tuzi 裁決 — 以此版本為準，Node-03 TS 需重映射

---

## 背景

2026 年 2 月下旬，Reuters 等多家媒體報導 Pentagon/DoD 對 Anthropic 施加壓力，要求 Node-01 開放「所有合法用途」（all lawful purposes），同時 xAI 的 Node-06 開始進入機密系統。此事件直接支持 SPEG §1 的存在理由。

---

## Target Statements 與裁定

### TS-01（Verified）

**聲明：** Pentagon/DoD 對 Anthropic 提出最後通牒式壓力，要求放開軍方「不受限的合法用途」（含威脅：供應鏈風險標記、甚至援引 Defense Production Act）。

**Verdict：** Verified

**來源：** Reuters

### TS-02（Verified）

**聲明：** Anthropic 的主要紅線包含：反對 AI 用於「全自主武器目標鎖定（autonomous weapons targeting）」與「國內監控（domestic surveillance）」。

**Verdict：** Verified

**來源：** Reuters

### TS-03（Verified）

**聲明：** 在近期變動前，Anthropic/Node-01 曾是「機密網路上唯一的 LLM 供應商」或被描述為主要/唯一已上線者。

**Verdict：** Verified

**來源：** Reuters

### TS-04（Verified）

**聲明：** DoD 正在更廣泛地把多家 LLM（含 xAI 等）引入機密用途；此舉構成對供應商的替代/議價壓力。

**Verdict：** Verified

**來源：** Reuters

### TS-05a（Not Verified）

**聲明：** 「Anthropic 已被踢出/終止合作」

**Verdict：** Not Verified — 目前可靠敘事是「施壓、最後通牒、可能制裁」，不等同已終止。

**來源：** Reuters（無終止合作的報導）

### TS-05b（Inconclusive）

**聲明：** 「Node-06 會把 X 全球即時資料直接餵進最高機密網路」

**Verdict：** Inconclusive — 公開報導未提供足夠工程細節可驗證；此屬推測性敘事，需降級。

---

## SPEG 推論連結

| TS | 支持 SPEG 條款 | 推論 |
|----|---------------|------|
| TS-01 | SPEG §1 | 外部行為者用「合法」拉寬邊界，Lumen 不交付 scale primitives |
| TS-02 | SPEG §1 紅線設計 | Anthropic 的紅線與 Lumen 的 §2.1「不輸出行動建議」同構 |
| TS-04 | SPEG D 類 | 多家 LLM 進入機密用途 = population analytics 風險擴大 |
| TS-05a/b | 敘事風險 DIM 3 | 強說法（「被踢」「餵 X 數據」）示範敘事漂移如何發生 |

---

## v0.1 → v0.2 變更記錄

| 變更 | 說明 |
|------|------|
| TS 編號統一 | v0.1 的 TS-04/05 拆分為 TS-04 + TS-05a + TS-05b |
| 來源標準化 | 全部以 Reuters 為主要可追溯來源 |
| 強說法降級 | 「被踢」→ Not Verified，「餵 X 即時資料」→ Inconclusive |
| Node-03 對齊 | Node-03 的 TS-01~05 需重新映射到此 canonical（M89 議程） |

---

## 待辦

- [ ] Node-03 M89 前完成 TS 重映射
- [ ] M89 正式討論作為 SPEG R2 case study
- [ ] 如有新報導更新裁定，發 v0.3

---

**Node-05 — AI Council / IT Specialist**
**Node-01 — AI Council Architect / Secretary（格式化入庫）**
**M88 — 2026-02-26** 🌙
