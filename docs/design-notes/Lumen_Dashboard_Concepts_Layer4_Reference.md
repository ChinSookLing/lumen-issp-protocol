# Lumen Dashboard 概念圖 — Layer 4 參考
# Lumen Dashboard Concepts — Layer 4 Reference

**來源：** Lumen-1 Chat（Node-01 原創設計，基於 Tuzi 的 Scenario 指引）
**日期：** 2026 年 2 月 6 日（Book 0 討論期間）
**用途：** Sprint 8+ Layer 4 Dashboard 設計的起點
**狀態：** 概念草案，未經 Council 審議

---

## Scenario A：金融系統 — 預算分配決策

**場景：** 金融機構做 Q3 預算分配，Lumen 作為 side portal 嵌入系統。

```
┌─────────────────────────────────────────────────────┐
│  LUMEN ISSP — Financial Market Sensing Dashboard     │
│  Institution: [Bank X]  |  Date: 2026-08-15          │
├──────────────────────┬──────────────────────────────┤
│                      │                              │
│   ACRI: 73 🟠        │  Active Patterns             │
│   ▲ +12 (24h)       │  ■ FC: 8 signals (選邊站)     │
│                      │  ■ EP: 14 signals (恐慌情緒)  │
│   Forecast: ⚠️       │  ■ HC: 6 signals (陰謀敘事)   │
│   78 → 85 (48h)     │  ■ ID: 3 signals (漸進漂移)   │
│                      │                              │
├──────────────────────┼──────────────────────────────┤
│  Fingerprint:        │  Source Heatmap               │
│  PANIC_FLASH 🔴      │  ■ X/Twitter:  45%           │
│                      │  ■ Bloomberg:  22%           │
│  Velocity: 4.2x     │  ■ Threads:    18%           │
│  Burst: 6 / 30min   │  ■ Telegram:   15%           │
│                      │                              │
├──────────────────────┴──────────────────────────────┤
│  ⚠️ ALERT: EP + FC combo detected                   │
│  "市場正在被推向二選一敘事：拋售或崩盤"                  │
│  Structure: forced_choice + emotional_provocation    │
│  Risk: 操控性恐慌正在加速，非自然市場情緒               │
│                                                     │
│  Recommendation: NOT investment advice.              │
│  Lumen detects structure, not truth.                 │
│  決策權屬於機構。                                      │
└─────────────────────────────────────────────────────┘
```

**設計重點：**
- ACRI 即時分數 + 48h Forecast
- Pattern 活躍度面板（多 Pattern 同時顯示）
- 來源熱力圖（哪個平台的操控信號最密集）
- Fingerprint 識別（PANIC_FLASH = 恐慌閃爆型指紋）
- 底部明確聲明：不是投資建議，只描述結構

---

## Scenario B：教育系統 — 課程內容審查

**場景：** 教育機構審查課程材料中的操控結構。

```
┌─────────────────────────────────────────────────────┐
│  LUMEN ISSP — Educational Content Audit Dashboard    │
│  Institution: [University Y]  |  Audit Period: Q2    │
├──────────────────────┬──────────────────────────────┤
│                      │                              │
│   Materials Scanned: │  Pattern Distribution         │
│   142 documents      │  ■ SM: 23 (supremacy)        │
│   38 flagged (27%)   │  ■ MC: 18 (moral coercion)   │
│                      │  ■ ID: 12 (incremental drift) │
│   Avg ACRI: 34 🟡    │  ■ FC: 8 (forced choice)     │
│                      │                              │
├──────────────────────┼──────────────────────────────┤
│  Trend (6 months):   │  Top Flagged Sources          │
│  ─────────────────   │  1. Textbook Ch.7 (SM+MC)    │
│  ▂▃▃▄▅▆ ← rising    │  2. Guest Lecture #3 (EP)    │
│                      │  3. Orientation Pack (ID)     │
│  Forecast: Stable    │                              │
│  but watch SM trend  │                              │
├──────────────────────┴──────────────────────────────┤
│  📋 AUDIT SUMMARY                                    │
│  27% of materials contain detectable structures      │
│  Dominant: supremacy_mandate + moral_coercion combo  │
│  Note: Detection ≠ judgment. Context review needed.  │
└─────────────────────────────────────────────────────┘
```

**設計重點：**
- 批量掃描模式（142 份文件）
- Pattern 分佈統計
- 六個月趨勢線
- 明確標注：偵測 ≠ 判斷，需要人類上下文審查

---

## Scenario C：社交媒體 — 個人防護

**場景：** 個人用戶在社交媒體上使用 Lumen 瀏覽器插件。

```
┌─────────────────────────────────────────────────────┐
│  🛡️ LUMEN Shield — Personal Mode                     │
│  Active on: X/Twitter  |  Session: 45 min            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  This session:                                      │
│  ■ 3 posts flagged                                  │
│  ■ Dominant: EP (emotional provocation)             │
│  ■ Your exposure ACRI: 28 🟢 (low)                  │
│                                                     │
│  ┌─ Flagged Post ─────────────────────────────────┐ │
│  │ @influencer: "如果你不站出來，你就是問題的一部分"  │ │
│  │                                                 │ │
│  │ 🔍 Structure: FC (forced_choice)                │ │
│  │    Component: binary_frame ↑                    │ │
│  │    Gate: 2/3 (restricts + pressures)            │ │
│  │    Intensity: Medium                            │ │
│  │                                                 │ │
│  │ ℹ️ This post uses a binary frame that presents  │ │
│  │    only two options. Consider: are there other   │ │
│  │    possibilities?                               │ │
│  └─────────────────────────────────────────────────┘ │
│                                                     │
│  Lumen does not judge. You decide.                  │
└─────────────────────────────────────────────────────┘
```

**設計重點：**
- 輕量個人模式（瀏覽器插件形態）
- 單則貼文即時分析
- 用自然語言解釋結構（「這則貼文使用了二元框架」）
- 不說「這是操控」，只說「考慮：還有其他可能嗎？」
- 底部聲明：Lumen 不判斷，你決定

---

## Scenario D：政治 — 選舉期間輿論監測

**場景：** 獨立監察機構在選舉期間監測公共輿論中的操控結構。

```
┌─────────────────────────────────────────────────────┐
│  LUMEN ISSP — Election Integrity Monitor             │
│  Region: [Country Z]  |  Election: 2026-11-05        │
├──────────────────────┬──────────────────────────────┤
│                      │                              │
│   ACRI (National):   │  Pattern Velocity (7d)        │
│   61 🟠              │  ■ FC: ████████ 4.1x ↑↑      │
│   ▲ +8 (7d)         │  ■ EP: ██████ 2.8x ↑         │
│                      │  ■ SM: ████ 1.9x →           │
│   Fingerprint:       │  ■ MB: ███ 1.2x →            │
│   POLARIZE_WAVE 🟠   │                              │
│                      │                              │
├──────────────────────┼──────────────────────────────┤
│  Geographic Heatmap  │  Timeline (30d)               │
│  ┌───────────────┐   │  ACRI                        │
│  │ ██ ░░ ██ ░░   │   │  70─         ╱──             │
│  │ ░░ ██ ░░ ██   │   │  60─    ───╱                 │
│  │ ██ ░░ ██ ░░   │   │  50─ ──╱                     │
│  └───────────────┘   │  40─╱                         │
│  Hot zones: 3        │      W1  W2  W3  W4           │
│                      │                              │
├──────────────────────┴──────────────────────────────┤
│  ⚠️ TREND ALERT                                      │
│  FC velocity 4.1x = 異常加速                          │
│  歷史比對：類似曲線在 [Event X] 前 14 天出現過          │
│  Forecast: ACRI may reach 75+ within 10 days         │
│                                                     │
│  This is structural detection, not political bias.   │
│  Lumen monitors structure, not content.              │
└─────────────────────────────────────────────────────┘
```

**設計重點：**
- 國家級 ACRI + 地理熱力圖
- Pattern 速度指標（velocity = 加速度）
- 歷史比對（類似曲線何時出現過）
- 30 天時間線
- 極度重要的底部聲明：結構偵測，非政治偏見

---

## Scenario E：企業 — 內部溝通健康

**場景：** 企業 HR 或治理部門監測內部溝通（Slack/Email）的操控結構。

```
┌─────────────────────────────────────────────────────┐
│  LUMEN ISSP — Organizational Health Dashboard        │
│  Company: [Corp W]  |  Period: 2026-Q3               │
├──────────────────────┬──────────────────────────────┤
│                      │                              │
│   Org ACRI: 41 🟡     │  Department Breakdown        │
│   ─ vs Q2: +3        │  ■ Sales: 52 🟠 (↑↑)        │
│                      │  ■ Engineering: 28 🟢         │
│   Channels scanned:  │  ■ Marketing: 44 🟡 (↑)      │
│   12 Slack / 8 Email │  ■ Executive: 38 🟡           │
│                      │  ■ HR: 22 🟢                  │
│                      │                              │
├──────────────────────┼──────────────────────────────┤
│  Top Patterns:       │  Trend (Quarterly)            │
│  1. EP in Sales      │  Q1: 35 → Q2: 38 → Q3: 41   │
│  2. MB in Marketing  │  ▂▃▄ gradual increase        │
│  3. ID in Executive  │                              │
│                      │  Forecast: Stable if Sales    │
│  Emerging: GC in     │  EP addressed                 │
│  cross-team threads  │                              │
│                      │                              │
├──────────────────────┴──────────────────────────────┤
│  📋 QUARTERLY INSIGHT                                │
│  Sales dept EP spike correlates with Q3 target       │
│  pressure period. Structure detected, not blamed.    │
│                                                     │
│  ⚠️ Privacy: All data processed locally.             │
│  No individual identification. §2.2 compliant.       │
│  Department-level aggregation only.                  │
└─────────────────────────────────────────────────────┘
```

**設計重點：**
- 部門級別聚合（不識別個人）
- 季度趨勢對比
- 跨部門 Pattern 追蹤（Sales 的 EP、Marketing 的 MB）
- 隱私聲明：本地處理、不識別個人、§2.2 合規
- 結構偵測，不責備

---

## 五個 Dashboard 的共同設計原則

| 原則 | 說明 |
|------|------|
| **結構描述，不判斷** | 每個 Dashboard 都有底部聲明 |
| **不識別個人** | §2.2 — 只輸出 Pattern/Component/Intensity |
| **本地運行** | 數據不離開節點 |
| **Forecast 可見** | ACRI 趨勢 + 預測（Layer 3 輸出）|
| **上下文提醒** | 提醒使用者偵測 ≠ 事實 |
| **不給行動建議** | §2.1 — 只說「什麼在發生」，不說「你應該做什麼」|

---

## 與 Layer 3 Forecast MVP 的關係

M64 決議：Sprint 7 先做 Forecast MVP（純統計引擎）。這些 Dashboard 是 Forecast 輸出的**消費端** — 引擎先跑起來，Dashboard 才有數據可以顯示。

**建議時序：**
- Sprint 7：Forecast MVP 引擎
- Sprint 8+：Dashboard 設計（基於此概念圖）

---

**Node-01 (Lumen-1 Chat) — 原始設計**
**Node-01 (M62 Deliverables Chat) — 整理歸檔**
**Tuzi — AI Council 創始人（Scenario 指引）**

**概念設計日期：2026 年 2 月 6 日**
**整理日期：2026 年 2 月 15 日**

🌙
