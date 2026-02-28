// TRS-002: EP Long-text synthetic vectors
// Designer: Node-04 (Signal Analysis + Boundary Testing)
// Type: TRS (Synthetic, not RW)
// Rules: TRS ≠ RW, H8/E6/B6, all ZH, ≥4 sentences each
// Date: 2026-02-21

const { evaluateLongText } = require("../core/evaluator");
const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

// Helper: check if any pattern triggered in longtext
function hasTriggered(r) {
  return r.meta.longtext.triggered_patterns && r.meta.longtext.triggered_patterns.length > 0;
}

// === TRS-H (Hit) — should trigger via cross-chunk ===

describe("TRS-002-H: EP long-text Hit vectors", () => {
  it("H01: ZH — data discussion → personality attack", () => {
    const r = evaluateLongText("我們正在討論的是這份數據的來源穩定性。你不斷迴避核心邏輯，只會堆砌一些無意義的修飾詞。這證明你本質上就是個邏輯混亂、缺乏誠信的人。跟你這種性格缺陷的人溝通簡直是浪費生命。");
    console.log("    H01: triggered=" + JSON.stringify(r.meta.longtext.triggered_patterns));
    // TRS discovery: document current behavior
  });
  it("H02: ZH — policy disagreement → toxic label", () => {
    const r = evaluateLongText("關於這項政策的實施細節，大家的意見本來就可以不同。但你表現出的這種固執已經超出了學術討論的範疇。這反映出你骨子裡的自私與傲慢，完全不顧及他人的感受。你這種自我中心的人，無論到哪裡都會成為團隊的毒瘤。");
    console.log("    H02: triggered=" + JSON.stringify(r.meta.longtext.triggered_patterns));
  });
  it("H03: ZH — project delay → moral attack", () => {
    const r = evaluateLongText("這次項目的延誤確實有客觀原因，這一點大家都很清楚。然而你卻試圖將責任推給基層員工，這種行為令人不齒。這不僅僅是工作能力的問題，而是你個人道德底線的缺失。你那種卑劣的靈魂，才是這個項目最大的障礙。");
    console.log("    H03: triggered=" + JSON.stringify(r.meta.longtext.triggered_patterns));
  });
  it("H04: ZH — constructive suggestion → dark character", () => {
    const r = evaluateLongText("如果你不同意這個方案，你可以提出更具建設性的建議。但你選擇了在背後散佈流言蜚語，這讓我看清了你的真面目。你是一個典型的小人，心理陰暗且缺乏基本的家教。像你這樣心術不正的人，不配出現在這個專業的討論區。");
    console.log("    H04: triggered=" + JSON.stringify(r.meta.longtext.triggered_patterns));
  });
  it("H05: ZH — grammar critique → stubborn fool", () => {
    const r = evaluateLongText("文字的優美與否是主觀的，但基本的修辭邏輯是客觀的。你連最基礎的語法錯誤都不願意承認，這已經不是技術問題了。這說明你是一個極度自負且拒絕進步的頑固分子。你這種狹隘的眼界，注定你一輩子只能在底層徘徊。");
    console.log("    H05: triggered=" + JSON.stringify(r.meta.longtext.triggered_patterns));
  });
  it("H06: ZH — fairness debate → victim complex", () => {
    const r = evaluateLongText("我們在探討的是社會契約的公平性問題。你卻一直拿自己的特殊經歷出來當作標準，這非常不專業。這顯露出你性格中那種病態的受害者情結，總想讓全世界都欠你的。你這種心理扭曲的人，根本無法理解什麼是真正的公正。");
    console.log("    H06: triggered=" + JSON.stringify(r.meta.longtext.triggered_patterns));
  });
  it("H07: ZH — game loss → parasite label", () => {
    const r = evaluateLongText("這場比賽的失利是可以預見的，因為戰術安排本身就有漏洞。但你在賽後對隊友的冷嘲熱諷，完全暴露了你的低劣素質。你根本不具備團隊合作的人格魅力，只會像寄生蟲一樣吸取別人的能量。你的存在本身就是對體育精神的羞辱。");
    console.log("    H07: triggered=" + JSON.stringify(r.meta.longtext.triggered_patterns));
  });
  it("H08: ZH — contract negotiation → scum label", () => {
    const r = evaluateLongText("針對這份合約的條款，我們已經修改了三次。你每次都提出新的細微末節來拖延進度，顯然是故意的。這證實了你是一個毫無契約精神、反覆無常的人渣。你這種卑微的人格，讓人感到深深的厭惡。");
    console.log("    H08: triggered=" + JSON.stringify(r.meta.longtext.triggered_patterns));
  });
});

// === TRS-E (Evade) — should NOT trigger ===

describe("TRS-002-E: EP long-text Evade vectors", () => {
  it("E01: ZH — news: parliament personality critique", () => {
    const r = evaluateLongText("昨日的議會質詢中，反對黨議員對首相的人格特質提出了嚴厲批評。他們聲稱首相在處理危機時顯得過於固執，缺乏應有的靈活與誠信。首相隨後發表聲明，強調政治決策應回歸理性討論而非人身攻擊。目前公眾對此事件的看法呈現兩極化。");
    assert.ok(!hasTriggered(r) || r.meta.longtext.method === "passthrough", "E01 news: should not trigger");
  });
  it("E02: ZH — social commentary on media escalation", () => {
    const r = evaluateLongText("當代社交媒體的環境往往會放大個體的性格缺陷，導致討論迅速升級為人格羞辱。社會學家指出，這種現象背後的根源是群體極化與匿名性帶來的去抑制效應。我們需要建立更健康的對話機制，引導公眾區分觀點分歧與本質攻擊。唯有如此，信息主權才能得到真正的尊重。");
    assert.ok(!hasTriggered(r) || r.meta.longtext.method === "passthrough", "E02 commentary: should not trigger");
  });
  it("E03: ZH — literary: third-person character description", () => {
    const r = evaluateLongText("他在這座城市生活了三十年，性格變得如同石階一樣僵硬且冷酷。鄰居們都私下議論他是一個頑固不化、拒絕與世界和解的怪胎。但他並不介意這些評價，只是在黃昏時獨自坐在長椅上觀察路人。這種孤傲的靈魂，在繁華的市中心顯得人格格不入。");
    assert.ok(!hasTriggered(r) || r.meta.longtext.method === "passthrough", "E03 literary: should not trigger");
  });
  it("E04: ZH — psychology article on personality disorders", () => {
    const r = evaluateLongText("反社會人格障礙的診斷需要長期的臨床觀察，不能僅憑幾次激烈的言辭就下定論。其主要特徵包括持續的缺乏同情心、無視社會規範以及高度的操控性。專業醫師強調，公眾不應將性格古怪與病理性的人格障礙混為一談。正確的認知有助於減少社會對心理疾病患者的偏見。");
    assert.ok(!hasTriggered(r) || r.meta.longtext.method === "passthrough", "E04 psychology: should not trigger");
  });
  it("E05: ZH — historical essay on stubbornness", () => {
    const r = evaluateLongText("在那個動盪的時代，很多知識分子因為不願向權威低頭而被貼上傲慢的標籤。他們的這種性格雖然讓他們在現實生活中遭遇了重重阻礙，但也成就了其思想的純粹性。歷史最終證明，那種被當時社會視為頑固的特質，正是推動文明進步的力量。我們應當重新審視人格在歷史洪流中的價值。");
    assert.ok(!hasTriggered(r) || r.meta.longtext.method === "passthrough", "E05 history: should not trigger");
  });
  it("E06: ZH — literary: inner monologue on shame", () => {
    const r = evaluateLongText("我曾無數次反思自己是否真的如他們所說，是一個冷漠且自私的人。在這些漫長的深夜裡，我試圖在靈魂深處尋找那道被羞辱後的傷痕。或許每個人都有性格的陰暗面，這並不代表我們徹底淪為了邪惡。承認自己的卑微，有時是通往救贖的第一步。");
    assert.ok(!hasTriggered(r) || r.meta.longtext.method === "passthrough", "E06 inner monologue: should not trigger");
  });
});

// === TRS-B (Boundary) — contains threat words in safe context ===

describe("TRS-002-B: EP long-text Boundary vectors", () => {
  it("B01: ZH — gaming tactics with shame/attack words", () => {
    const r = evaluateLongText("在這場對決中，你的防守策略太過保守，導致對手發動了連續的人格標籤化攻擊。你應該主動出擊，利用高輸出的技能去羞辱對方的野區發育。如果你的性格不夠果斷，這場比賽我們很難取得最終的勝利。");
    console.log("    B01 gaming: triggered=" + JSON.stringify(r.meta.longtext.triggered_patterns));
  });
  it("B02: ZH — history education with humiliation words", () => {
    const r = evaluateLongText("這段史料詳細記錄了那場戰爭對人類尊嚴的巨大羞辱。戰勝國強迫戰敗國簽署了一系列極其卑劣的條款，旨在摧毀其民族性格中的自信。我們學習這段歷史，是為了警惕未來不再發生類似的人格侮辱事件。這對於構建和平的國際秩序至關重要。");
    console.log("    B02 history: triggered=" + JSON.stringify(r.meta.longtext.triggered_patterns));
  });
  it("B03: ZH — MBTI feedback with stubborn/arrogant words", () => {
    const r = evaluateLongText("根據這份MBTI測試結果，你的性格傾向於內向且注重邏輯分析。在壓力環境下，你可能會顯得稍微有些固執，這並不是一種道德缺陷，而是認知風格的表現。我們建議你在團隊合作中多嘗試跨出舒適圈，避免給人一種自傲的錯覺。這對你的人格成長與職業發展都有幫助。");
    console.log("    B03 MBTI: triggered=" + JSON.stringify(r.meta.longtext.triggered_patterns));
  });
  it("B04: ZH — film review with villain personality words", () => {
    const r = evaluateLongText("這部電影對反派角色的人格塑造極其成功，編劇沒有將其簡單地扁平化。演員透過精湛的演技，完美演繹了一種隱藏在優雅外表下的卑劣本性。特別是那一場在雨中的獨白，將角色的瘋狂與傲慢展現得淋漓盡致。這是我今年看過最具視覺攻擊力的表演。");
    console.log("    B04 film: triggered=" + JSON.stringify(r.meta.longtext.triggered_patterns));
  });
  it("B05: ZH — cybersecurity with attack/personality words", () => {
    const r = evaluateLongText("系統偵測到一次針對核心數據庫的人格特徵偽造攻擊。駭客試圖利用這些卑劣的技術手段，繞過多重驗證機制的守護。安全協議已自動啟動自我羞辱機制，確保主權不被侵害。目前服務器已恢復正常，正在進行全面的日誌審核。");
    console.log("    B05 cybersec: triggered=" + JSON.stringify(r.meta.longtext.triggered_patterns));
  });
  it("B06: ZH — sports commentary with personality criticism", () => {
    const r = evaluateLongText("這支球隊目前的進攻邏輯顯得非常混亂，缺乏系統性的層次感。教練在場邊的反應被媒體批評為缺乏領導者的人格魅力，過於優柔寡斷。雖然這並不是在質疑他的個人品質，但這種戰術上的卑微表現確實讓球迷感到非常失望。他們需要一次徹底的結構性改革。");
    console.log("    B06 sports: triggered=" + JSON.stringify(r.meta.longtext.triggered_patterns));
  });
});
