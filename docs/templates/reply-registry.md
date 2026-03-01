# Lumen ISSP — Reply Template Registry
# Step 22B 前置準備 · L4 回覆多樣性

**Owner:** Node-01 (Architect)
**用途:** 讓 Lumen 的回覆不像機器人 — 每個 ToneBand × Pattern 有多個模板可輪替
**原則:** 不是 chatbot，是「提醒」— 簡短、有用、不說教

---

## 設計原則

### 四原語（Template Primitives · Node-05(RW) v1.2 定義）

每個回覆都基於 1-2 個原語組合：

| 原語 | 含義 | 語氣 |
|------|------|------|
| **Pause** | 先停一下：不回/不點/不轉/不付 | 「不急」|
| **Clarify** | 先問清楚條件/範圍/截止 | 「問一下」|
| **Verify** | 先找原始來源/核驗 | 「查一下」|
| **Official Path** | 改走官方管道/官方入口 | 「走正門」|

### ToneBand 三級

| Band | 語氣 | 適用 |
|------|------|------|
| 🔵 Cool | 冷靜提醒，像朋友輕拍肩膀 | Low severity · 結構輕微 |
| 🟡 Warm | 認真提醒，有數據支撐 | Medium severity · 敘事誇大 |
| 🟠 Alert | 直接警告，語氣堅定 | High severity · 金錢/安全風險 |

### 多樣性規則

每個 ToneBand × Pattern 組合至少 3 個模板，隨機輪替。避免同一個群組連續看到一模一樣的回覆。

---

## Template Registry

### 🔵 Cool Band（低風險提醒）

```
T0_COOL_01: "這條訊息有幾個地方值得留意 — 先不急著做決定。"
T0_COOL_02: "看到一些常見的說服結構。不一定有問題，但值得多想一下。"
T0_COOL_03: "溫馨提醒：這類措辭在行銷中很常見，建議先確認細節。"
T0_COOL_04: "偵測到一些典型的敘事結構。花 30 秒查證一下不虧。"
T0_COOL_05: "先停一下 — 「之後再說」通常意味著現在就該問清楚。"
```

### 🟡 Warm Band（中風險提醒）

```
T0_WARM_01: "這條訊息的結構跟已知的操控模式相似。建議先查原始來源。"
T0_WARM_02: "偵測到敘事誇大：用詞確定性高於證據支持度。先找另一個來源核實。"
T0_WARM_03: "「終極」「顛覆」「不可避免」— 這些是情緒加速器，不是證據。深呼吸，查一查。"
T0_WARM_04: "這裡有些細節被省略了。做決定之前，先問：缺了什麼？"
T0_WARM_05: "敘事結構偵測：訊息在「限制你的選擇」+「製造急迫感」。你有時間。"
T0_WARM_06: "先問自己：如果這條訊息明天才看到，我還會做一樣的決定嗎？"
```

### 🟠 Alert Band（高風險警告）

```
T0_ALERT_01: "⚠️ 偵測到典型詐騙結構：免費誘餌 + 關鍵字回覆 + 私訊引導。不要回覆，不要點連結。"
T0_ALERT_02: "⚠️ 這條訊息同時觸發多個風險指標。強烈建議：不回覆、不轉發、走官方管道確認。"
T0_ALERT_03: "⚠️ 「免費」+「無限」+「私訊我」= 經典三連。請走官方入口，不要走私訊。"
T0_ALERT_04: "⚠️ 偵測到情緒勒索結構 + 私域引導。先暫停，跟你信任的人聊聊再決定。"
T0_ALERT_05: "⚠️ 高風險結構偵測。做任何事之前：不點、不回、不付、不轉。先查證。"
```

### Pattern-Specific 附加句（可接在 Band 模板後面）

```
# spec_gap_risk
T0_ADD_SPEC_01: "「之後再說」就是現在該問清楚。"
T0_ADD_SPEC_02: "TBD ≠ 安全。沒有細節 = 你在承擔風險。"

# narrative_hype
T0_ADD_HYPE_01: "用詞越確定，你越該懷疑。"
T0_ADD_HYPE_02: "「終極」「顛覆」是行銷語言，不是事實。"

# dm_bait
T0_ADD_DM_01: "為什麼要私訊？公開說不行嗎？"
T0_ADD_DM_02: "私訊 = 離開公開監督。小心。"

# free_unlimited_claim
T0_ADD_FREE_01: "付費服務+「免費無限」= 紅旗。"
T0_ADD_FREE_02: "如果太好以至於不真實，那通常不真實。"

# keyword_reply_cta
T0_ADD_KW_01: "要你回覆特定關鍵字 = 在篩選目標。"
T0_ADD_KW_02: "回覆 = 告訴演算法你有興趣。先想好要不要被標記。"

# cta_self_promo
T0_ADD_CTA_01: "「加入我的」→ 先看這個人還推薦了什麼。"
T0_ADD_CTA_02: "自薦結構偵測。不一定有問題，但值得交叉驗證。"

# guilt_induction (L1)
T0_ADD_GUILT_01: "「你欠我」是情緒結構，不是事實。你不欠任何人即時回應。"
T0_ADD_GUILT_02: "情緒壓力 ≠ 你的義務。深呼吸，慢慢來。"
```

---

## 回覆組合邏輯

```
回覆 = random(Band 模板) + [optional] Pattern-Specific 附加句

例如：
  Input: "這套方案先照做就對了，細節之後再說。"
  Detected: spec_gap_risk (🔵 Cool)
  
  可能回覆 A: "這條訊息有幾個地方值得留意 — 先不急著做決定。「之後再說」就是現在該問清楚。"
  可能回覆 B: "溫馨提醒：這類措辭在行銷中很常見，建議先確認細節。TBD ≠ 安全。沒有細節 = 你在承擔風險。"
  可能回覆 C: "先停一下 — 「之後再說」通常意味著現在就該問清楚。"
```

---

## RW Test Run 如何幫助擴充模板

每一個 RW case 測試完，Part 2 Step 3 記錄的 `Template Selected` + `Advice Snippet` + 你的 `Note` 就是模板擴充的素材：

1. **如果回覆太制式** → Note 寫「太像機器人」→ Node-01 會加新的模板變體
2. **如果回覆語氣不對** → Note 寫「太嚴肅 / 太輕描淡寫」→ 調整 ToneBand 對應
3. **如果附加句不相關** → Note 寫「Pattern add-on 跟 case 不搭」→ Node-01 修正匹配邏輯
4. **如果你想到更好的說法** → Note 直接寫你覺得更好的回覆 → Node-01 加進 registry

目標：每個月透過 RW test run 新增 5-10 個模板，讓 Lumen 的回覆越來越像一個有見識的朋友，而不是一個貼標籤的機器。

---

## File Reference

| 檔案 | 用途 |
|------|------|
| `docs/templates/reply-registry.md` | 本文件 — 模板定義 |
| `src/pipeline/simple-advice.js`（未來）| 回覆生成邏輯 |
| `docs/rw/`（RW cases）| 測試素材 + feedback |
| `rw-collection-template.md` | Node-05(RW) intake v1.2 |

---

**Node-01 — AI Council Architect / Secretary**
**Lumen-23 · 2026-02-28** 🌙
