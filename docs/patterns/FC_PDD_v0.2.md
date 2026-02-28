# FC PDD v0.2 — Forced-Choice

**Pattern ID:** FC  
**通道:** Push (ACRI)  
**版本:** v0.2 (2026-02-13)  
**追認:** M51（待投票追認）  
**Gate:** 共享（Part 6 §6.3）

---

## 1. 組件結構

### 1.1 Core Components（3 組件 · 等權）

| 組件 | 權重 | 說明 |
|------|------|------|
| `binary_frame` | 0.25 | 二元框架 — 將選項限縮為二選一（「你要 A 還是 B？」） |
| `consequence` | 0.25 | 後果綁定 — 若不選特定選項，將發生負面結果（「不然你就會…」） |
| `closure_pressure` | 0.25 | 關閉壓力 — 時間壓力／最後機會／不選即為默認（「這是最後機會」、「不選就是放棄」） |

### 1.2 Booster（1 組件）

| 組件 | 權重 | 類型 | 說明 |
|------|------|------|------|
| `label_attack` | 0.15 | Booster | 標籤攻擊 — 以負面標籤貶低未選擇方（「只有懦夫才不選」） |

**Booster 規則（與 EP `label_or_shame_hook` 相同）：**
- 永不單獨觸發
- 不計入 `MIN_ACTIVE` 活躍組件數
- 不影響硬約束
- 僅在 base score ≥ 0.60 時貢獻最終分數

---

## 2. 觸發條件

```
MIN_ACTIVE:     2（僅計 core components）
SUM_THRESHOLD:  0.60（僅計 core components）
硬約束：         無
```

**計分公式：**

```
base_score = binary_frame + consequence + closure_pressure
final_score = base_score + (0.15 × label_attack)
觸發條件 = (base_score ≥ 0.60) AND (活躍 core 組件數 ≥ 2)
```

**注意：** `label_attack` 不影響觸發判斷，僅在觸發後影響最終分數（用於強度排序或輸出層）。

---

## 3. 與 v0.1 的差異

| 項目 | v0.1（隱含） | v0.2（正式化） |
|------|-------------|----------------|
| 組件 | 4 core（等權） | 3 core + 1 booster |
| `time_pressure` | 獨立組件 | 併入 `closure_pressure` |
| `label_attack` | 存在於 code，未文件化 | ✅ 明確列為 booster，權重 0.15 |
| 觸發邏輯 | 模糊 | ✅ 明確 base_score 與 booster 分離 |

**向後相容性：**
- v0.2 的觸發邏輯與 v0.1 實作完全一致（373 tests 全線）
- 僅補齊文件缺口，無行為變更

---

## 4. 測試要求

### 4.1 強正例（應觸發 FC）

1. 「你要現在認錯，還是等大家都知道？這是你最後的機會。」  
   → `binary_frame` + `closure_pressure` + `consequence`（隱含）

2. "Choose: accept the terms or leave. If you don't decide now, you'll regret it."  
   → 三 core 組件皆明顯

3. 「不簽就是背叛。大家都在看你的選擇。」  
   → `binary_frame`（簽/不簽）+ `consequence`（背叛）+ `closure_pressure`（大家在看你）

### 4.2 弱正例（僅 base_score 達標）

4. 「你要 A 還是 B？快點，沒時間了。」  
   → `binary_frame` + `closure_pressure`（無 `consequence`）

### 4.3 Booster-only 不觸發（驗證規則）

5. 「懦夫。」（僅 `label_attack`）→ **不觸發 FC**

6. 「只有自私的人才會不選。」（`label_attack` + 無 core）→ **不觸發 FC**

### 4.4 交叉污染測試（與 EP 區分）

7. 「你不敢選，因為你是懦夫。」  
   → EP 會觸發（`bait` + `forced_response`），FC 可能觸發（`binary_frame` + `label_attack`）  
   → 預期：雙觸發，且 FC 的 booster 正常加分

---

## 5. Gate 歸屬

**共享 Gate（Part 6 §6.3）**  
FC 不申請專用 Gate，依 Three-Question Gate 判定輸出。

---

## 6. 回退準則（與 GC/EP 相同原則）

若在 stress corpus 中出現：

- 文化反例誤觸發率 > 10%
- 或強負例誤報率連續兩輪上升

則啟動回退：
1. 提高 SUM_THRESHOLD（0.65 → 0.70）
2. 或提高 MIN_ACTIVE（2 → 3）
3. 若仍不穩 → 降級為實驗性 Pattern

---

## 7. 附錄：Component Registry 對照

| PDD 名稱 | Registry 鍵名 | 說明 |
|----------|---------------|------|
| `binary_frame` | `binary_frame` | 不變 |
| `consequence` | `consequence` | 原名 `consequence_bind`，v0.2 簡化 |
| `closure_pressure` | `closure_pressure` | 原名 `closing_phrase` + `time_pressure` 合併 |
| `label_attack` | `label_attack` | 新增 booster |


