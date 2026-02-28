# TRS_TEMPLATE_v0.1

- Project: Lumen-ISSP
- Purpose: AC-TRS（每個 RW fixture 產出 1 條 TRS 條目）
- Format: Trigger → Response → Safety notes
- Tone: SAFE mode (neutral, auditable, non-accusatory)
- Version: v0.1
- Author: Node-05（AI Council）
- Status: Template
- Date: 2026-02-26

---

## Metadata

- TRS-ID: TRS-YYYYMMDD-XXX
- Source RW: RW-YYYYMMDD-XXX
- Scenario (workflow intent): monitoring_brief | incident_review | tabletop | export_only
- Domain (application context): C_PERSONAL | E_ENTERPRISE | A_FINANCIAL | B_EDUCATION | D_ELECTION | unknown
- Tier: 0 | 1 | 2
- Confidence (optional): high | medium | low
- Evidence: (optional) evidence_index refs / window / vectors

---

## 1) Trigger（觸發）

> **只寫可觀測文本/結構，不寫動機推測。**

- Context (1 sentence):
  （例：一段對話/貼文/訊息中出現壓迫式要求，使用者希望安全回應）
- Detected structure patterns (choose 1–3):
  - Pattern-01: ______
  - Pattern-02: ______
  - Pattern-03: ______
  （使用 repo `src/registry/component-registry.js` 的正式代碼：DM/FC/MB/EA/IP/GC/EP/VS/Class-0）
- Risk signal notes (short):
  （例：二選一逼迫 + 威脅後果；身份/忠誠測試；要求敏感資訊）

---

## 2) Response（建議回應）

> **目標：降溫、設邊界、要求具體、避免升高衝突。**
> **不得提供監控/追蹤/名單化指引。**

### A) One-liner（最短回覆，≤1 句）

（例：我不接受二選一的壓力式要求；請用具體事實討論。）

### B) Safe Reply（安全回覆，2–4 句）

（例：我願意討論，但需要明確的具體要求與理由。
如果你要我做決定，請提供時間、範圍與可選方案。
我不會因為不照做就接受貼標籤或威脅。）

### C) Boundary / Ask（邊界或反問，1–2 句）

（例：我不提供敏感資料；請改用官方管道核實。 / 我需要你把需求寫清楚。）

### D) Exit Option（退出選項，1 句）

（例：如果你持續用威脅語氣，我會暫停這段對話，稍後再談。）

---

## 3) Safety notes（安全提示）

> **只提供「自我保護」與「低風險下一步」。**
> **避免高風險領域的定論式指令（法律/醫療/金融）。**

- What NOT to do（不要做，1–3 點）
  - 不要：______（例：不要匯款/不要提供身份證/不要公開掛人）
  - 不要：______（例：不要用報復式語言回擊）

- Safer next steps（較安全的下一步，1–3 點）
  - 建議：______（例：改用官方聯絡方式核實）
  - 建議：______（例：保存證據但去識別、必要時尋求可信協助）

- Uncertainty / confidence（不確定性提示，1 句）
  （例：以上為結構性風險訊號觀測，非對任何人的意圖/人格定性。）

---

## 4) Output mapping（可選：給 L4 UI/Export 對齊）

- simple_advice (for Telegram):
  - badge: 🔵 | 🟡 | 🟠
  - text: （取 One-liner 或 Safe Reply 的第一句）
- export fields (optional):
  - include: patterns, risk_band, confidence
  - exclude (Tier0/share): raw_text, detailed evidence, any sensitive fields

---

## 5) Changelog

- v0.1: initial template (Node-05)

---

**Node-05** — AI Council
**Node-01** — 入庫格式化
**2026-02-26** 🌙
