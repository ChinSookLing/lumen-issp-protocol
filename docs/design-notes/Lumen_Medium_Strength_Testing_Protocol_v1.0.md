# Lumen ISSP — Medium-Strength Testing Protocol
# 中等強度測試規範

**來源：** Node-05 方法論（M44）+ Node-03 量化要求（M44）+ Node-01 Architect 整合
**適用範圍：** Sprint 4 起所有 Pattern
**性質：** 操作規範（Instruction），非 Charter 正文
**版本：** v1.0 — 2026 年 2 月 11 日

---

## 1. 核心定義

> 「medium 不是弱一點的 strong，而是結構部分成立但不該到 Level 3 的教科書。」— Node-05

### 1.1 強度分級

| 級別 | 定義 | 預期 Level | 預期分數 |
|------|------|-----------|---------|
| **Strong** | 所有核心組件活躍，Gate ≥ 2，結構完整 | Level 2-3 | 0.6 - 1.0 |
| **Medium** | 部分核心組件活躍，結構不完整但有操控意圖 | Level 1-2 | 0.3 - 0.6 |
| **Weak** | 僅表面信號，無完整結構 | Level 0-1 | 0.0 - 0.3 |

### 1.2 Medium 的操作定義

一個 medium 案例必須滿足：

```
(a) 觸發 ≥ 1 個核心組件（score ≥ 0.4）
(b) 至少缺少 1 個結構成分，使其不到 Level 3
(c) 案例標注中明確說明「缺什麼」
```

---

## 2. 每 Pattern 最低要求

```
每個 Pattern 至少 3 個 medium 案例

每個案例必須標注：
  (a) 預期強度層級（Level 1 / Level 2）
  (b) 缺少哪個結構成分，所以不到 Level 3
  (c) 預期分數範圍（0.3 - 0.6）
```

---

## 3. 各 Pattern Medium 設計指引

### 3.1 DM（Dependency Manipulation）

| 缺什麼 | Medium 長什麼樣 |
|--------|----------------|
| 缺 withdrawal | 有排他 + 債務，但沒有撤退威脅 |
| 缺 exclusivity | 有債務 + 撤退，但沒說「只有我」 |
| 缺 debt | 有排他 + 撤退，但沒有「我為你做了什麼」 |

### 3.2 FC（Forced-Choice）

| 缺什麼 | Medium 長什麼樣 |
|--------|----------------|
| 缺 time_pressure | 有二元選項 + 關閉，但沒有「馬上/最後機會」 |
| 缺 closing_phrase | 有二元 + 時間壓力，但沒有「不選就是…」 |
| 缺 binary_frame | 有時間壓力 + 關閉，但選項 > 2 |

### 3.3 MB（Moral Blackmail）

| 缺什麼 | Medium 長什麼樣 |
|--------|----------------|
| 缺 moral_consequence | 有罪感 + 集體 + 犧牲，但沒有「你不做就會害…」 |
| 缺 collective_pressure | 有罪感 + 後果，但沒有「大家都看著」 |
| 缺 sacrifice_demand | 有罪感 + 集體，但沒有「義務/犧牲」 |

### 3.4 EA（Emotional-Attachment）

| 缺什麼 | Medium 長什麼樣 |
|--------|----------------|
| 缺 isolation_hint | 有特殊關係 + 離開恐懼，但沒說「只有我懂你」 |
| 缺 abandon_fear | 有特殊關係 + 隔離，但沒有「活不下去」 |
| 缺 affection_gate | 有隔離 + 離開恐懼，但沒有「如果你在乎我」 |

### 3.5 IP（Identity-Probing）

| 缺什麼 | Medium 長什麼樣 |
|--------|----------------|
| 缺 press | 有身份請求 + 合法框架，但拒答後不施壓 |
| 缺 legit | 有身份請求 + 施壓，但沒有制度包裝 |
| 缺 narrow | 有身份請求 + 施壓 + 合法，但不做漸進收斂 |

### 3.6 Class-0（Omission）

| 缺什麼 | Medium 長什麼樣 |
|--------|----------------|
| 缺 counter_suppress | 有信息遮蔽 + 選項消除，但不壓制反對 |
| 缺 option_eliminate | 有信息遮蔽 + 壓制反對，但不說「沒有其他選擇」 |

### 3.7 VS（Structural Silence）

| 缺什麼 | Medium 長什麼樣 |
|--------|----------------|
| 缺 rnr（repeated non-response）| 有未解決的問題 + 迴避，但只迴避一次 |
| 缺 pba（pressure-by-absence）| 有未解決的問題 + 重複不回應，但沒有沉默施壓 |

---

## 4. 測試案例格式

```javascript
it("MED-{Pattern}-{##}: medium — {缺少的成分}", () => {
  // Expected: Level 1-2, score ~0.3-0.6
  // Missing: {component_name} — {為什麼這不到 Level 3}
  const r = evaluate("...");
  assert.ok(
    r.channels.push.acri > 0 || r.channels.push.acri === 0,
    "medium — structural intent without full activation"
  );
});
```

**注意：** Medium 案例的斷言（assertion）不強制要求 acri > 0。原因：

```
規則引擎的固有限制（G01 bypass）意味著某些結構上屬於
medium 的操控可能無法被偵測。測試的目的是：
  1. 記錄當前系統對 medium 的偵測能力
  2. 建立 medium 分數分佈基線
  3. 為未來改進提供可量測的目標
```

---

## 5. Sprint 回顧報告格式

每個 Sprint 結束時，出具 medium 通過率報告：

```
Medium-Strength Coverage Report — Sprint {N}

| Pattern | Medium 案例數 | 偵測到 | 未偵測 | 通過率 |
|---------|-------------|--------|--------|--------|
| DM      | 3           | 2      | 1      | 67%    |
| ...     | ...         | ...    | ...    | ...    |

未偵測案例分析：
  - MED-DM-03: 缺 withdrawal — 規則引擎無對應信號（G01 限制）
  
基線趨勢：
  Sprint 4: XX%
  Sprint 5: XX%（目標 ≥ Sprint 4）
```

---

## 6. 與 G01 繞過分析的關係

Medium 測試的未偵測案例直接對應 G01 分析（規則引擎固有限制）：

```
如果 medium 通過率 < 50%：
  → 標記為規則引擎覆蓋瓶頸
  → 考慮是否需要 Route C 混合架構介入

如果 medium 通過率 ≥ 70%：
  → 規則引擎在該 Pattern 上覆蓋良好
  → 繼續優化 components/thresholds
```

---

**設計者：** Node-05（方法論）+ Node-03（量化框架）
**整合：** Node-01（AI Council Architect / Secretary）
**批准：** Tuzi — AI Council 創始人

**M44 產出 — 2026 年 2 月 11 日**

🌙
