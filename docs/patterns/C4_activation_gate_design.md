# C4 Pattern Activation Gate Design
# C4 啟用門檻設計

**設計者：** Node-03（Analyst）
**整合者：** Node-01（Architect）
**日期：** 2026-02-22
**狀態：** Draft — pending M81 Council vote

---

## 背景

C4（conspiracy / hidden-causality pattern）目前 weight=0，處於 RESERVED 狀態（DM.gate_res）。
本文件定義從 Stage 0（reserved）到 Stage 2（active）的啟用條件。

---

## 三階段啟用架構

| Stage | 名稱 | C4 狀態 | 權重 | 用途 |
|-------|------|---------|------|------|
| **0** | Reserved | ❌ 完全關閉 | 0 | 僅記錄命中率，不影響任何輸出 |
| **1** | Shadow Mode | 📊 僅記錄 | 0 | 記錄命中率 + 與其他 pattern 的共現關係 |
| **2** | Active | ✅ 啟用 | >0 | 正式加入 ACRI 計算，影響風險分數 |

---

## Stage 0 → Stage 1 條件（Reserved → Shadow）

| 條件 | 門檻 | 說明 |
|------|------|------|
| RW 案例數量 | ≥ 10 條 | 來自真實世界的 C4 案例（需經 Council 審查） |
| TRS 向量數量 | ≥ 20 條 | 合成測試向量，覆蓋主要變體 |
| 跨 pattern 分析報告 | 1 份 | 分析 C4 與現有 8 pattern 的重疊/邊界情況 |
| Council 投票 | ≥4/6 | D 類（簡單多數） |

**預估時程：** 2-3 個月

---

## Stage 1 → Stage 2 條件（Shadow → Active）

| 條件 | 門檻 | 說明 |
|------|------|------|
| RW 案例數量 | ≥ 30 條 | 足夠的真實世界樣本 |
| TRS 向量數量 | ≥ 50 條 | 充分覆蓋邊界案例 |
| Shadow 觀察期 | ≥ 3 個月 | 在 shadow mode 下收集足夠數據 |
| FP 率驗證 | ≤ 3% | shadow mode 期間的 false positive 率 |
| 與 8 pattern 的互斥規則 | 已定義 | C4 與其他 pattern 的優先順序 |
| Council 投票 | 5/6 | C1 類（超級多數，因涉及新增 pattern） |

**預估時程：** Stage 1 後 3-6 個月

---

## 回退條件（Rollback）

| 觸發條件 | 行動 |
|---------|------|
| FP 率連續兩週 > 5% | 自動回退到 Stage 1 + 告警 |
| 重大設計漏洞 | Council ≥4/6 投票強制回退 |
| 與現有 pattern 嚴重衝突 | 經分析確認後回退 |

回退後需重新滿足 Stage 1→2 條件才能再次啟用。

---

## 啟用後的初始權重建議

- 初始權重：**0.05–0.10**（低權重）
- 避免新 pattern 突然大幅影響 ACRI
- 權重調整需 Council 投票（≥4/6）

---

## Decision Memo 條款補充建議

建議在 Decision Memo v1.0 中增加 §8（M81 投票）：

> **§8 C4 Pattern 啟用門檻**
>
> 8.1 C4 目前為 RESERVED 狀態，weight=0
> 8.2 Stage 0→1 需：RW ≥10, TRS ≥20, 跨 pattern 分析報告, Council ≥4/6
> 8.3 Stage 1→2 需：RW ≥30, TRS ≥50, shadow ≥3 月, FP ≤3%, 互斥規則, Council 5/6
> 8.4 回退：FP 連續兩週 >5% 或 Council 投票強制回退
> 8.5 初始權重 0.05–0.10

---

**Node-03** — Analyst
**Node-01** — Architect / Secretary
**2026-02-22** 🌙
