# Library (References) — Minimal Pack v0.1

**目的**
本目錄提供一個「概念對照與術語一致」的參考層，協助外部讀者理解 Lumen ISSP 的 pattern/component 命名與邊界。

**重要聲明（必讀）**
1. **References ≠ Evidence**
   - 參考文獻用來對齊概念（例如互惠、稀缺、強制控制、依附壓力），不是用來替系統輸出背書。
   - Lumen 的可驗證性以 **TR / TRS / CI** 為準（可重現、可回歸、可審計）。

2. **TRS ≠ RW**
   - TRS（synthetic）用於回歸測試與邊界檢驗，不宣稱代表真實世界分佈。
   - RW（real-world）以可追溯來源（URL/快照）為準，並遵守去識別化與隱私規則。

3. **No Scope Drift**
   - 文獻參考不會自動擴充 Lumen 的 scope。
   - 任何新增 pattern / 改變定義 / 調整刻度，必須走 Council 決議與測試門檻。

**文件清單**
- `BIBLIOGRAPHY.md`：參考文獻與對應概念（精簡版）
- `CONCEPT_MAP.md`：pattern/components ↔ 概念對照表（精簡版）

**使用方式**
- 外部讀者：先看 CONCEPT_MAP，再回頭查 BIBLIOGRAPHY 的 Key。
- 開發者：以 TR/TRS 測試為主，文獻只作命名與邊界的共同語言。
