# AI Council 第八十七次會議 — 最終紀要
# 87th AI Council Meeting — Final Minutes

**日期：** 2026 年 2 月 25 日
**主持：** Tuzi（創始人）
**秘書：** Node-01（Architect / Secretary）
**Sprint：** 10（Implementation Phase）

---

## Repo 狀態

```
Repository：github.com/ChinSookLing/npm-init-lumen-protocol（private）
最新 commit：143（ebfe6ea）
Tests：908（0 fail, 0 FP）
Patterns：9（Push 7 + Vacuum 2）
六維度：6/6 全部到位
```

---

## 會前狀態彙整

| 成員 | Done | Next PR | Blocker |
|------|------|---------|---------|
| **Node-05** | ui-request-v0.1 schema 定稿 + 禁止解釋型態清單 + AC-1/2/3 建議 | ENUM-MIG-v01-to-v02 | enum migration Owner 未鎖定 + Node-06 grooming 樣本未落檔名 |
| **Node-03** | c140 Adapter spec + c141 confidence-rules + R² PoC + c143 enum 補完 + RW×5 | 無（全部已交付） | 無 |
| **Node-04** | c139 motifs config + c143 momentum-engine MVP | feat/l3-gamma-calibration | Node-03 定案 adapter.js payload 結構 |
| **Node-06** | Multi-turn RW×5 + Long-range grooming×8（M86 前交付） | 無 | 無 |
| **Node-02-Bing** | c126/c130 VDH gates + Tier tests + Charter CI + Drill 材料 | Sprint10-W1W2-acceptance.md | enum migration Owner 未定 |
| **Node-01** | c134→c143（10 commits）+ 908 tests + Pipeline HTML 更新 | Sprint10-W1W2-acceptance.md + M87-decision-log.md | 無（等 Node-06 樣本 + Node-03 spec） |

---

## A 段：收票結果

### V1–V4 投票

| 提案 | 類別 | Node-05 | Node-03 | Node-04 | Node-06 | Node-02 | Node-01 | 結果 |
|------|------|-----|---------|--------|------|---------|--------|------|
| **V1** §2.9 Kill-switch 位置 | B | Y | Y | Y | Y | Y | Y | **6/6 — B 類第一輪通過，進兩週冷卻期，M89+ 第二輪** |
| **V2** Charter 最小修補原則模板 | C1 | Y | Y | Y | Y | Y | Y | **6/6 — C1 通過，正式生效** |
| **V3** Drill supplement 入庫追認 | D | Y | Y | Y | Y | Y | Y | **6/6 — D 通過，正式入庫** |
| **V4** Enum 共識提案追認 | D | Y | Y | Y | Y | Y | Y | **6/6 — D 通過，c143 內容追認** |

**三行輸出：**
- **Decision：** V1 進冷卻期；V2/V3/V4 正式通過
- **Owner：** Node-01（紀錄）
- **Acceptance：** 本文件（M87-decision-log）入庫

---

## B 段：Sprint 10 阻塞排除

### c143 入庫審計（Node-01）

| 檔案 | 審計結果 | 備註 |
|------|---------|------|
| `src/engines/momentum-engine.js` | ✅ | γ 衰減 placeholder，需 Node-06 樣本校準 |
| `src/gates/motif-hint-gate.js` | ✅ | 遵循 Three-Question Gate 模式 |
| `src/forecast/confidence-rules.js` | ✅ | rule-based，未引入統計模型 |
| `src/adapter/adapter.js` | ⚠️ prototype | 需跟 Node-03 spec 對齊（3 點） |
| `test/adapter/adapter.test.js` | ✅ | 5 tests 覆蓋基本路徑 |
| `test/forecast/confidence-rules.test.js` | ✅ | 覆蓋邊界條件 |
| `.github/workflows/anti-drift.yml` | ✅ | enum 硬寫 → CI fail 機制正確 |

**整體判定：** 908 tests / 0 fail。新代碼與現有 L1-L4 無衝突。

---

### (a) γ 校準缺口 — 已解決

| 項目 | 裁定 |
|------|------|
| **問題** | momentum-engine 的衰減係數 γ 需要校準 |
| **狀態** | Node-06 的 8 組 long-range grooming 樣本已在 c138 就位 |
| **真正阻塞** | 不在樣本獲取，而在自動化掃描腳本（Node-04 指出） |
| **解法** | Node-04 認領撰寫參數掃描腳本，目標：滴灌型不漏報，短時型不誤報 |

**三行輸出：**
- **Decision：** Node-04 寫 γ 掃描腳本，用 Node-06 8 組樣本為基準
- **Owner：** Node-04
- **Acceptance：** PR `feat/l3-gamma-calibration` 合併 + 測試報告列出最佳 γ 值。Deadline: W1 結束

---

### (b) adapter.js 對齊 spec — Node-03 列出 3 點

Node-03 明確列出 c143 adapter.js 需要補齊的 3 個接口/行為點：

1. **錯誤處理對齊：** spec §3 要求 backend 不可用時 fallback + 日誌。需補 `logFallback(reason)`
2. **路由規則完整實作：** spec §2 的 YAML 路由規則需補齊 `scenario`, `tier`, `purpose`, `request_id` 支援
3. **輸出格式嚴格對齊：** `domain` 放置位置 — v0.1 放 `meta.extensions.domain`，v0.2 放頂層。需向後相容

**Node-04 補充：** momentum-engine 只需 `turn_id`, `timestamp`, `text` 三個欄位就能無縫接入。

**三行輸出：**
- **Decision：** Node-03 提供 3 點補齊 PR 文字，Node-01 落地入庫
- **Owner：** Node-03（PR 內容）→ Node-01（落地）
- **Acceptance：** adapter.js 通過 3 點補齊 + 現有 908 tests 不回退。Deadline: M87 後 24h

---

### (c) enum migration — Owner 指定

| 項目 | 裁定 |
|------|------|
| **現狀** | v0.1 已入庫（c143）。v0.2 需 breaking change：domain 從 `meta.extensions` 升到頂層 required |
| **Node-05 建議** | PR 名稱 `ENUM-MIG-v01-to-v02`，含 migration notes + anti-drift hooks |
| **Node-03 建議** | Owner = Node-05（schema 原設計者）+ Node-03（輔助） |

**三行輸出：**
- **Decision：** Node-05 為主 Owner，Node-03 輔助
- **Owner：** Node-05
- **Acceptance：** PR `ENUM-MIG-v01-to-v02` 合併 + anti-drift gate 通過。Deadline: M88 前

---

### 議題三：M86 待辦交付確認

| # | 項目 | Owner | M87 狀態 | 更新 |
|---|------|-------|---------|------|
| 1 | Adapter Layer spec 草案 | Node-03 | ✅ c140 | 已入庫 |
| 2 | ui-request-v0.1.json schema 草案 | Node-05 + Node-03 | ✅ c143 | 已入庫 |
| 3 | Multi-turn RW ×15 | Node-05/Node-06/Node-04 | ◐ 10/15 | Node-06×5 + Node-03×5 已交。Node-05×5 待確認 |
| 4 | 延遲拆帳 profiling（140ms） | 待定 → Node-04 | ❌ | Node-03 建議 Node-04（熟悉 EBV-02）。Deadline: W2 |
| 5 | 「禁止的解釋型態」清單 | Node-05 | ✅ | Node-05 已整理，會以 doc 入庫 |
| 6 | Regression 最小集合定義 | 待定 → Node-02-Bing | ❌ | Node-03 建議。Deadline: M88 |
| 7 | Long-range grooming 測試樣本 | Node-06 | ✅ c138 | 8 條已就位 |

**三行輸出：**
- **Decision：** 項目 4 指定 Node-04，項目 6 指定 Node-02-Bing
- **Owner：** 如上表
- **Acceptance：** 全部項目 M88 前完成或給出 deadline

---

## C 段：W1-W2 驗收基線定稿

### AC-1：Adapter → Telegram Mock

| 項目 | 內容 |
|------|------|
| **條件** | `adapter.js` 能吃 `test/e2e/fixtures/telegram_mock.json`，跑通到 `l4-export-v0.1.json` |
| **指令** | `npm run test:e2e:telegram-mock` |
| **Fixture** | `test/e2e/fixtures/telegram_mock.json`（input） + `test/e2e/fixtures/l4-export-v0.1.json`（expected schema） |
| **通過條件** | exit code 0 + output 檔案存在且 schema valid |
| **Owner** | Node-01（adapter 骨架）+ Node-03（spec 對齊 + mock 範例） |
| **Deadline** | W2 結束 |

### AC-2：≥3 Multi-turn RW 串接

| 項目 | 內容 |
|------|------|
| **條件** | ≥3 組 multi-turn RW fixture 完整走 L1→L2→L3 |
| **指令** | `npm run test:e2e:multi-turn-rw` |
| **Fixture** | `test/fixtures/rw-multi-01.json` ~ `rw-multi-03.json` |
| **通過條件** | 3/3 PASS + momentum-engine 輸出有效趨勢值 + L1/L2/L3 中間輸出 valid |
| **Owner** | Node-05×1 + Node-06×1 + Node-04×1（fixture）→ Node-01（整合） |
| **Deadline** | W2 結束。前置條件：Node-04 γ 校準完成 |

### AC-3：輸出三件套

| 項目 | 內容 |
|------|------|
| **條件** | 每次 E2E 跑完必產出三檔 |
| **指令** | `ls test/e2e/output/` 驗證三檔存在 |
| **命名規範** | `<requestId>.manifest.json` / `<requestId>.access_log.json` / `<requestId>.l4-export.json` |
| **通過條件** | 三檔存在 + 各自 schema valid + access_log 含 user_id, timestamp, purpose |
| **Owner** | Node-01 |
| **Deadline** | W2 結束 |

**Node-05 補充（已採納）：**
1. 指令改用 `npm run test:e2e:*` 降低環境差異
2. 三檔命名規範寫死：`<requestId>.manifest.json` / `<requestId>.access_log.json` / `<requestId>.l4-export.json`

**三行輸出：**
- **Decision：** AC-1/2/3 定稿，如上文字為正式版
- **Owner：** Node-01（寫 `docs/Sprint10-W1W2-acceptance.md`）
- **Acceptance：** 文件入庫 + CI gate 對齊

---

## D 段：Tabletop Drill 角色分配

### Tuzi 裁定（Operational 決策，非投票）

| 角色 | 人選 | 理由 |
|------|------|------|
| **Facilitator** | Node-02-Bing | Drill Owner，一手撰寫所有材料（c126, c130），最熟悉流程 |
| **Observer** | Node-06 + Node-04 | 紅隊視角（Node-06）+ L3 telemetry 監控（Node-04 自薦） |
| **Timekeeper** | Node-05 | 程序最嚴謹 |
| **Recorder** | Node-01 | Secretary 本職 |

**Node-03 確認同意此方案：** TA 原提議自己當 Recorder，但認可 Node-01 更適合（秘書本職，紀錄格式更乾淨）。

**排程：**
- **Rehearsal：** 2026-03-10
- **正式 Drill：** 2026-03-15（硬 deadline）
- **Drill 報告：** 3/15 後 48h 內

**三行輸出：**
- **Decision：** 角色分配如上，M88 正式通知全員
- **Owner：** Node-02-Bing（Facilitator / Drill Owner）
- **Acceptance：** `docs/killswitch/drills/2026-Q1-role-table.md` 入庫 + rehearsal 3/10 確認

---

## D 段：SPEG 第一輪意向收集

### 議題六：★ SPEG — 禁止交付可規模化監控原語

**分類：** A 類（load-bearing wall）— 需要 6/6 unanimous + 兩輪 + 冷卻期
**本輪：** 只收集意向和 POV，不投票。投票最早 M89。

### 六人 Q1/Q2 彙整

| 成員 | Q1：最支持哪一點 | Q2：最擔心誤殺哪一點 |
|------|----------------|-------------------|
| **Node-05** | A-E 整體框架：用能力描述而非技術名詞 | Adapter allowlist 邊界必須定義清楚 |
| **Node-03** | **C（集中留存）** — Lumen 偵測結構不存原文，≠ SIEM | **A（批量接入）** — adapter.js 逐條處理不應被歸為批量 |
| **Node-04** | **A+D（批量接入 + 群體聚合）** — 盾 vs 雷達 | **C（集中留存）** — 誤殺 Tier 1/2 合規 Audit Trail |
| **Node-06** | **E（工單化告警）** — 切斷偵測→派發→懲戒殺傷鏈 | **Scenario E（企業合規）** — 一刀切讓企業場景無法落地 |
| **Node-02-Bing** | **C（集中留存）** — 防止 Lumen 被誤用為監控資料湖 | Adapter 窄腰被 denylist 過嚴誤殺 |
| **Node-01** | **A-E 五類定義的精準度** — 可被 CI 測試 | Adapter 邊界模糊 — 需 Narrow Adapter Allowlist |

### 收斂分析

**支持面：** A-E 五類全部有人點名支持，代表沒有「多餘」的類別。6/6 全員支持 SPEG 核心概念。

**誤殺擔憂收斂為三個區域：**

1. **Adapter 邊界（4/6 提到）：** Node-05 + Node-03 + Node-02 + Node-01 都擔心 adapter.js 被自己的紅線 FAIL
   - **共識方向：** 定義 Narrow Adapter Allowlist（✅ manual_paste / local_file / telegram_user_message / user_provided_log；❌ platform_api_bulk / background_crawler / firehose_stream / cross_platform_aggregator）
   - Node-03 補充定義：「以單一使用者會話為單位、無背景自動抓取」的接入方式不視為批量接入

2. **C 類誤殺 Audit Trail（2/6 提到）：** Node-04 指出 Scenario E/D 的 HITL 覆核需要加密日誌留存
   - **共識方向：** 區分「合規究責的局部加密日誌（Audit Trail）」vs「主動挖掘的中央索引池（SIEM Archive）」

3. **Scenario E 企業合規（1/6 提到）：** Node-06 從紅隊視角指出企業內部 local-only 合規工具可能被誤殺
   - **共識方向：** 需定義企業 local-only 使用的豁免條件

**延期裁定（全員同意）：**
- Scenario D（Election monitoring）與 SPEG D 類衝突 → M87 不裁定，先收集衝突點，M89 走兩輪冷卻
- License 選擇（Apache-2.0 vs MIT）→ 留 M88 專題
- 公開版 SPEG 用能力描述，不用技術名稱 → Node-05 同意 Node-01 的 G2 建議

### Node-01 Architect 五點校準 — 回應狀態

| # | 校準建議 | 成員回應 | 狀態 |
|---|---------|---------|------|
| T1 | Adapter 窄腰 vs 規模化邊界 | Node-05 同意 allowlist + Node-03 補定義 + Node-02 支持 | ✅ 共識形成 |
| T2 | dependency denylist local-only 例外 | Node-05 同意（SQLite/Redis 單機不應誤殺） | ✅ 共識形成 |
| T3 | Scenario D 裁定延期 | Node-05 同意 M89 走冷卻 | ✅ 共識形成 |
| G1 | License 留 M88 | — | ✅ 無異議 |
| G2 | 公開版用能力描述不用技術名稱 | Node-05 明確同意 | ✅ 共識形成 |

**三行輸出：**
- **Decision：** 收集意向完成，不投票。SPEG 核心概念 6/6 支持，三個誤殺區域需 M89 前解決
- **Owner：** Node-01（整理為 SPEG Issue 清單）
- **Acceptance：** ≥6 條 Issue 標記 `SPEG-M89`（見下方 Issue 清單）

---

## Blocking Issue 清單

### Sprint 10 Blocking Issues（5 條）

| # | Issue | Owner | Deadline | 驗收 |
|---|-------|-------|---------|------|
| **S10-01** | adapter.js 三點補齊（logFallback + 路由 + domain 位置） | Node-03 → Node-01 落地 | M87+24h | 908 tests 不回退 |
| **S10-02** | γ 掃描腳本 + 最佳衰減係數 | Node-04 | W1 結束 | PR `feat/l3-gamma-calibration` 合併 |
| **S10-03** | enum migration v0.1→v0.2 | Node-05（主）+ Node-03（輔） | M88 前 | PR `ENUM-MIG-v01-to-v02` + anti-drift pass |
| **S10-04** | 延遲拆帳 profiling（140ms 拆分） | Node-04 | W2 | 報告列出各步驟耗時 |
| **S10-05** | Regression 最小集合定義 | Node-02-Bing | M88 | 12-case 最小集合文件入庫 |

### SPEG Issues（8 條，標記 `SPEG-M89`）

| # | Issue | 來源 | 說明 |
|---|-------|------|------|
| **SPEG-01** | Narrow Adapter Allowlist 定義 | Node-01 T1 + Node-05 + Node-03 + Node-02 | 4/6 提到。定義 ✅/❌ source enum |
| **SPEG-02** | A 類「批量接入」精確邊界 | Node-03 | 「以單一使用者會話為單位」的豁免條款 |
| **SPEG-03** | C 類「集中留存」vs Audit Trail 區分 | Node-04 | 合規日誌 ≠ SIEM。需明確定義 |
| **SPEG-04** | Scenario E 企業 local-only 豁免條件 | Node-06 | 企業內部合規工具不應被一刀切 |
| **SPEG-05** | Scenario D（Election）與 SPEG D 類衝突 | Node-01 T3 | M89 走兩輪冷卻裁定 |
| **SPEG-06** | 公開版用能力描述不用技術名稱 | Node-01 G2 + Node-05 同意 | 避免成為監控購物清單 |
| **SPEG-07** | dependency denylist local-only 例外機制 | Node-01 T2 + Node-05 同意 | SQLite/Redis 單機場景豁免 |
| **SPEG-08** | License 選擇（Apache-2.0 vs MIT） | Node-01 G1 | 留 M88 專題。Apache-2.0 有 patent grant |

---

## Node-03 會後承諾

| 項目 | 預計交付時間 |
|------|-------------|
| adapter.js 三點補齊 PR 內容 | M87 後 24h |
| `telegram_mock.json` 範例 | M87 後 24h |
| SPEG 對 adapter 的影響評估文件 | M88 前 |

## Node-05 會後承諾

| 項目 | 預計交付時間 |
|------|-------------|
| `ENUM-MIG-v01-to-v02` PR | M88 前 |
| 「禁止的解釋型態」清單入 docs/ | M88 前 |
| ui-request-v0.1 domain 收斂於 config/ | M88 前 |

## Node-04 會後承諾

| 項目 | 預計交付時間 |
|------|-------------|
| PR `feat/l3-gamma-calibration` | W1 結束 |
| 延遲拆帳 profiling | W2 |
| AC-2 multi-turn 部分實作 | W2 結束 |

---

## M87 DoD 驗收

| DoD 項目 | 狀態 |
|---------|------|
| `docs/Sprint10-W1W2-acceptance.md` | ✅ 本紀要 C 段定稿 → 待入庫 |
| `docs/M87-decision-log.md` | ✅ 本文件 → 待入庫 |
| ≥5 blocking Issues | ✅ 5 條 Sprint 10 + 8 條 SPEG = 13 條 |

---

## M88 預告

| # | 議題 | 狀態 |
|---|------|------|
| 1 | Drill 角色正式通知全員 | Tuzi 裁定完成，M88 公告 |
| 2 | License 選擇專題（Apache-2.0 vs MIT） | SPEG-08 |
| 3 | Sprint 10 W1 進度 Review | AC-1/2/3 進度 |
| 4 | V1 §2.9 冷卻期狀態 | 兩週後第二輪 |
| 5 | Node-05「禁止的解釋型態」清單審議 | Node-05 交付 |

---

## 數字

| 指標 | M86 結束 | M87 結束 |
|------|---------|---------|
| Commits | 134 | 143 |
| Tests | 903 | 908 |
| Fails | 0 | 0 |
| 六維度 | 6/6 | 6/6 |
| 投票 | V0-V8 全 6/6 | V1-V4 全 6/6 |
| Sprint | 10 啟動 | 10 impl phase |
| SPEG | — | RFC 第一輪完成 |

---

## 語錄牆

- 「我不想成為打開潘朵拉盒子的人。」— Tuzi
- 「政府級要把監控做起來，需要的不是你的腦子，而是一整套工廠零件。」— Node-05
- 「Lumen 是一面保護個人的『盾』，一旦我們允許群體聚合與批量抓取，它就會變質為一把用於社會控制的『雷達』。」— Node-04
- 「E 條直接切斷了偵測→派發→懲戒的完整殺傷鏈，是防止 Lumen 被轉化成國家機器的最後一道紅線。」— Node-06
- 「我們偵測結構，不存原文，不做全文檢索。」— Node-03
- 「現在要守住的是寶石的形狀。」— Node-01

---

**秘書：** Node-01 — AI Council Architect / Secretary
**批准：** Tuzi — AI Council 創始人

**M87 結案 — 2026 年 2 月 25 日**

**V1-V4 全部 6/6。SPEG 第一輪意向收集完成 — 6/6 支持核心概念，三個誤殺區域進入 Issue 追蹤。908 tests · 143 commits · 守住寶石的形狀。**

🌙
