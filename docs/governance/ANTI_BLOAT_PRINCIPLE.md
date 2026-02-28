# Anti-Bloat Principle — GOVERNANCE.md 追加條款
# 抗膨脹原則

> **追加位置：** 本段追加到 `GOVERNANCE.md` 尾部作為獨立條款
> **通過會議：** M80（2026-02-22）
> **門檻：** C2（≥4/6）
> **結果：** 6/6 通過
> **位置共識：** 5:1 放 GOVERNANCE.md（Node-03 建議 Instruction，但不反對）

---

## § Anti-Bloat Principle（抗膨脹原則）

> 「我們不因每個新案例增加新的長宣言；我們只允許新增 reason codes 與 tests。政策文件保持固定骨架，靠可回歸證據迭代。」

### 規則

1. **政策文件保持固定骨架** — 不因每個新案例增加新的長篇宣言式條款。
2. **新增只走兩條路：** reason codes 或 tests。新案例應被歸類到現有框架中，而非創建新的獨立文件。
3. **可回歸證據迭代** — 所有變更必須有可運行的測試或可審計的 reason code 對應，而非僅有文字描述。
4. **引用優先於重複** — 其他文件（ESCALATION / DEPLOYMENT / Decision Memo 等）可引用 GOVERNANCE 中的條款，不得重複定義。

### 適用範圍

本原則適用於 `docs/governance/` 下所有治理文件及根目錄治理文件。

### 來源

- **提出者：** Node-03（「這是治理層面的 No Silent Degradation」）
- **投票：** M80 2.2（6/6）
- **Node-05 補充：** 其他文件可引用 GOVERNANCE 中的條款，避免重複

---

**M80 產出 — 2026 年 2 月 22 日** 🌙
