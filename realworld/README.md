# Real-World Test Case Database (RW)

這個資料庫用來收集「野生」真實世界素材（社交媒體、新聞、meme、廣告、對話截圖），以提升 Lumen 的偵測覆蓋與抗誤判能力。

## Workflow (Tuzi → Node-05 → Node-06 → Node-01)

1) Tuzi：丟素材
- 在 GitHub 開一則 Issue（使用 Real-World Test Case 模板）
- 允許文字、截圖、或兩者都有
- 若含敏感資訊，先打碼再上傳

2) Node-05：結構分析（Pattern / Components / Gate / Intensity）
- 只做「結構描述」，不做人身判定
- 輸出需引用 Issue permalink
- 建議貼上：pattern label + components（v1.2 registry keys）+ 三問門（Three-Question Gate）判定理由

3) Node-06：文化覆核（Cross-cultural review）
- 檢查 Node-05 的「結構描述」在不同文化語境是否會被感受為人格攻擊
- 若有風險，提出等價的更中性描述方式
- 必要時建議加註「文化語境 note」

4) Node-01（Lumen）：入庫與格式化
- 將通過的 Issue 轉存為 repo 內的案例檔案（可選）
- 依需要轉成 tests/fixtures 或 Appendix D 形式
- 確保不違反 Charter 資料主權與脫敏規則

## Naming Convention

- 每則案例一個 ID：RW-001, RW-002, RW-003...
- Issue Title 建議：`RW-###: <short title>`
- 任何後續衍生檔案（可選）：
  - `realworld/cases/RW-###.md`
  - `realworld/assets/RW-###.png`

> ID 分配方式：
> - 優先由 Node-01 依序分配（避免撞號）
> - 若 Tuzi 先填 RW-XXX，Node-01 在入庫時修正為正式號碼

## Privacy Redlines (Masking Rules)

⚠️ 這是 public repo。任何內容一旦上傳，視為公開。

請務必遵守：
- 必打碼：姓名、電話、email、地址、身份證件號、車牌、帳號 ID、QR code、面孔/頭像（除非已公開且必要）
- 禁止上傳：內部系統畫面、憑證（token/password/API key）、私有聊天紀錄的可識別資訊、節點日誌原文
- 最小揭露：只截「必要區域」，不要整頁螢幕截圖
- 若不確定是否可公開：改用「摘錄關鍵文字」+ 自行描述 UI 版面，不上傳原圖

若發現未打碼內容：
- 立刻加上 label：`needs:redaction`
- 編輯 Issue 內容移除敏感資訊（圖片需刪除後重傳打碼版）

## Suggested Labels

- Patterns: `pattern:EP` / `pattern:MB` / `pattern:FC` / `pattern:DM` / `pattern:EA` / `pattern:IP` / `pattern:GC` / `pattern:VS` / `pattern:Class-0`
- Intensity: `intensity:Low` / `intensity:Medium` / `intensity:High`
- Status: `status:pending-review` / `status:approved` / `status:rejected`
- Flow: `flow:Node-05-analysis` / `flow:Node-06-cultural-review` / `flow:Node-01-ingest`
- Other: `needs:redaction` / `needs:more-context`

## Notes

- 任何分析輸出都必須遵守 Charter 紅線：不給行動建議、不做身份指控、不輸出原文內容到公共輸出（除非已脫敏/摘錄且必要）。
- 目標是提升偵測系統的可靠性與治理自洽，而不是用來「抓人」。
