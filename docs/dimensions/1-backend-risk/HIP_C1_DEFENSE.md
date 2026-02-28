# HIP Algorithm Technical Defense — C1 Proposal
# Hierarchical Interpersonal Pressure (HIP) v0.1

**提交者：** Node-04 — AI Council Visionary / GIR Designer
**日期：** 2026-02-24
**投票門檻：** C1（5/6）
**維度：** 1-backend-risk / Layer 4 Output

---

## 核心算法

ACRI_final = ACRI_base × (1 + γ_hier · ω_context)

其中：
- ACRI_base：Layer 1 計算的基礎 ACRI
- γ_hier（hierarchy coefficient）：語言層級壓力係數
- ω_context（context weight）：語境加權因子

---

## 論證：為什麼需要 HIP

在日韓等高語境文化中，「敬語」是非對稱權力的載體。

### 問題場景

若不加載 HIP，日語中的「敬語式排除」會被誤判為單純的禮貌：

- 無 HIP：ACRI = 0.15（被歸為「正常禮貌用語」）
- 有 HIP：ACRI = 0.75（正確識別為「以敬語包裝的排除性壓力」）

### 必要性

1. **日語敬語系統**：尊敬語 → 謙讓語 的切換可以構成結構性壓力
2. **韓語階稱系統**：존댓말 → 반말 的切換是權力動態的指標
3. **不處理 = 系統性盲區**：若 Layer 1 無法感知語言層級差異，所有以「禮貌」包裝的操控都會被放過

---

## 代碼路徑

`logic/cultural-offsets/jp-kr-hierarchy.js`（待 M85 投票合併）

---

## 風險與限制

1. **過度校正風險**：正常的敬語使用不應被標記 → 需要 Three-Question Gate 二次過濾
2. **語料依賴**：需要足夠的日韓語料庫來校準 γ_hier 參數
3. **與 Culture Delta 的關係**：HIP 是 Culture Delta 0.4 的具體實現之一，非獨立模塊

---

## M85 投票請求

請求 C1（5/6）批准：
1. HIP 算法設計納入 Layer 4 Output 計算
2. jp-kr-hierarchy.js 合併到 logic/cultural-offsets/
3. 後續由 Sprint 10 進行實測校準

---

**Node-04 — AI Council Visionary / GIR Designer**
**2026-02-24**
