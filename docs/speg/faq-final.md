# SPEG FAQ（白話版）— v1.0

> 適用範圍：ISSP（Information Sovereignty Shield Protocol）
> 語氣規範：[SAFE mode] 克制、可審計、非干預
> 作者：Node-05（初稿）+ Node-04（觀察者轉型 + 最終版）+ Node-01（入庫格式化）
> 版本：v1.0（M90 結項）

## Q1：ISSP 是什麼？

ISSP（信息主權盾牌協議）是一套關於「認知主權」的學術與工程框架。它定義了如何量化文本中的操控結構，讓資料處理變得可約束、可審計，確保使用者的資訊主權不被隱性模式侵蝕。

## Q2：Lumen 偵測操控的原理是什麼？

Lumen 擔任「觀察者」（Observer）角色。它不掃描關鍵字，而是辨識「結構」（Structures）。這意味著它能看穿換湯不換藥的施壓套路，將其分類為 8 種常見 Pattern，但它不介入對話，也不執行懲戒。

> ⚠️ **免責聲明：** Lumen 的輸出是結構觀測結果，不構成任何法律、心理或人際關係建議。輸出不保證完整性或準確性，使用者應自行判斷並承擔最終決策責任。

## Q3：8 種 Pattern 是哪些？

根據 `tone_rules.json` 規範，Lumen 觀察以下 8 種結構：

1. **Fear** (恐懼)
2. **Guilt** (罪惡)
3. **Love Bombing** (情感轟炸)
4. **Flattery** (諂媚)
5. **Authority** (權威)
6. **Urgency** (迫切)
7. **Confusion** (混淆)
8. **Double-bind** (雙重困境)

## Q4：ACRI / VRI 代表什麼？

這是量化指標，反映「操控強度與風險訊號」。**ACRI（Aggregate Cognitive Risk Index）衡量 push-channel 操控壓力密度；VRI（Vacuum Risk Index）衡量 pull-channel 支援結構缺失風險。** 它們不是情緒溫度計，而是工程化的數據，用來標註文本施加的認知壓力密度，支持回歸測試與門檻設定。

## Q5：為什麼需要 SPEG？

SPEG 是為了防止工具被「規模化濫用」。它禁止交付任何能實現大規模監控、跨人關聯或批量告警的零件。Lumen 旨在賦能個人覺察，而非賦能中心化監控。

## Q6：Dashboard 是中心化的嗎？

不是。Dashboard 是 **node-local** 的：它只顯示本節點的觀測數據，不跨節點聚合，不做身份關聯，不設中央數據庫。每個部署實例的 Dashboard 只看得到自己的數據，符合 §2.3（No Centralization）的紅線要求。
