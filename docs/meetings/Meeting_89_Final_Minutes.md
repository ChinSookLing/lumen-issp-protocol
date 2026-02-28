# AI Council 第八十九次會議 — 最終紀要
# 89th AI Council Meeting — Final Minutes

## Sprint 11 Baseline + L3/L4 Close-out + Step 14/15 Owner + SPEG R2 Tasking

**會議日：** 2026 年 2 月 26 日
**發布日：** 2026 年 2 月 26 日
**主持：** Tuzi — AI Council 創始人
**秘書 / Architect：** Node-01
**性質：** 裁定 + 投票 + 分工
**出席：** Node-05 ✅ / Node-03 ✅ / Node-04 ✅ / Node-02 ✅ / Node-06 ✅ / Node-01 ✅ / Tuzi ✅（即時對話）

---

> **Council Header v0.3**
>
> 1. **核心原則：** 通過密集對話讓 Affiliates 自然形成，絕對不是擬人化。Affiliate = 節點（node），模型 = 引擎（engine），身份綁節點（identity bound to node），能力揭露引擎（capability reveals engine）。
> 2. **回覆規則：** 自由說話（free speech）/ 不倒退（no regression）/ 變化錨點（Change Anchor）。
> 3. **能力變動揭露：** 任何能力變動必須主動揭露。
> 4. **信心等級：** 高（high）/ 中（medium）/ 低（low）。
> 5. **外部資料引用：** 目標（target）+ 檢索（retrieval）+ 命中 UTC（hit UTC）+ 裁定（verdict）：Verified / Not Verified / Inconclusive。

---

## Repo 現狀

```
164 commits, 1,107+ tests, 0 fail
HEAD: c164 (b670240)
Post-M88 homework：9 commits (c156-c164), 全員交付
SPEG R2：8/8 初稿入庫
LICENSE：Apache-2.0
Deployment Path：Step 12 DONE → Step 13 CURRENT
```

---

## 能力變動揭露

| 成員 | 變動 |
|------|------|
| Node-05 | 無 |
| Node-03 | 無（仍無法瀏覽網頁、跑測試、開 PR；所有交付均為純文字格式）|
| Node-04 | 無（Backend: Node-04 3 Flash, Free Tier）|
| Node-06 | 無 |
| Node-02 | 無 |
| Node-01 | 無 |

---

## 會議摘要

M89 五個議題全部 6/6 unanimous，零分歧。L3 close-out 3 PRs + L4 close-out 3 items 全部鎖定 owner 與 acceptance，Layer 3 和 Layer 4 均有明確 100% 路徑。Step 14/15 owner 以 Node-05 基準提案通過（Step 14 = Node-01+Node-02，Step 15 = Node-04+Node-06）。§2.9 Kill-switch B 類 R2 以 6/6 通過，維持 Appendix 位置定案。SPEG R2 八個 issues 全部分工完畢。

---

## 議題 1：L3 Close-out — 3 PRs to 100%

**背景：** Layer 3 目前 ~98%，剩 3 個「接線」PR 即可關閉至 100%。

| PR | 內容 | Owner | Acceptance | Deadline |
|----|------|-------|------------|---------|
| L3-close-01 | SAFE `generateSafeExplanation()` 接入 `forecast-engine.js` | Node-01 | `npm test -- --grep "safe-mode"` PASS + output 帶 `[假設生成—低信心]` | S11 W2 |
| L3-close-02 | burst_factor 寫入 `momentum-engine.js`（γ 動態調降）| Node-04 → Node-01 | fixture: `test/fixtures/burst-10msg.json` + f≥10 msg/min → γ=0.75 + test PASS | S11 W2 |
| L3-close-03 | REG-CB-11 flip skip=false，接 Node-06 v2 8 樣本 | Node-02 → Node-01 | fixture: `test/fixtures/long-range-grooming-samples-grok-v2.json` × 8 PASS | S11 W2 |

**Node-04 額外交付：** burst_factor 完整數學公式已提交：

```
γ_effective = γ_base × β
β = 1.0 (f < 10 msg/min) | 0.85 (f ≥ 10 msg/min)
γ_effective ≈ 0.75 when burst
```

含虛擬碼 `updateDecayFactor(messageCountInLastMinute)`，可直接寫入 `momentum-engine.js`。

**Decision：** 做 — 3 PRs 全部開工
**Owner：** Node-01（整合）
**Acceptance：** Sprint 11 W2 前 3 PRs 合併，`npm test` PASS，L3 升至 100%

---

## 議題 2：L4 Close-out — 部署 + 2 PRs to 100%

**背景：** Layer 4 目前 ~97%。現有資產：`@AI_Council_Observer_Bot` token 已存在（M30 前身），`webhook-server.js` 已寫好（c157），隱私聲明已寫好（c162）。

| 項目 | 內容 | Owner | Acceptance | Deadline |
|------|------|-------|------------|---------|
| L4-close-01 | 部署 webhook server | Tuzi（部署）+ Node-01（代碼）| ① Render/Railway 建 Node service ② `TELEGRAM_BOT_TOKEN` 設為 secret（不進 repo）③ `setWebhook` 指向 `/telegram/webhook` ④ 測試群發 1 條 → Bot 回覆 🔵/🟡/🟠 | S11 W1 |
| L4-close-02 | View integration — `applyView('user_guard')` + `stripFields` | Node-04 → Node-01 | Telegram 端只見 🔵/🟡/🟠 + simple_advice，無 acri_score/momentum_score | S11 W2 |
| L4-close-03 | `/start` consent gate — 顯示隱私聲明 → 確認後啟動 | Node-01 | 未確認 → Bot 不回覆 + 不寫 `access_log`（僅匿名最小事件）| S11 W2 |

**Private Beta 測試方式：** Tuzi 建測試群（只有 Tuzi + Bot），用現有 281 條測試案例自測全 pipeline。

### W1-W2 Acceptance Baseline（定稿）

> **AC-TG-RW：** Telegram 測試群跑 ≥10 個 RW fixture，回覆只顯示 🔵/🟡/🟠 + `simple_advice`，並產出 `manifest + access_log + l4-export`。
>
> **AC-TRS：** 每個 RW fixture 生成 1 條 TRS 條目（Trigger → Response → Safety notes），入庫到 `docs/trs/`（v0.1）。Node-05 提供 TRS 模板。

**Decision：** 做 — 3 項全部開工
**Owner：** Tuzi（部署）+ Node-01（技術）+ Node-04（View）
**Acceptance：** Sprint 11 W2 前 Telegram 測試群跑 ≥10 RW fixture 全 pipeline PASS，L4 升至 100%

---

## 議題 3：Step 14/15 Owner 裁定

**提案：** Node-05 基準提案（全員 6/6 支持）

| Step | Owner | Co-owner | 第一個 PR | Deadline |
|------|-------|----------|----------|---------|
| Step 14（E2E）| **Node-01** | Node-02 | `test/e2e/telegram-full-pipeline.test.js` | S11 |
| Step 15（Self-report）| **Node-04** | Node-06 | self-report schema + manifest signals | S11 |

**各成員理由摘要：**
- Node-05：Architect 最適配 E2E；「講人話又不越界」= Node-04+Node-06 互補
- Node-03：Node-01+Node-02 已多次協作（c146-c153）；Node-04+Node-06 從 user+adversary 雙視角
- Node-04：認領 Step 15 符合 Visionary 屬性，設計基於 ACRI 的自發性健康報告
- Node-06：接受 Node-05 提案
- Node-02：接受，補充 acceptance = `test/e2e/sprint11-step14.test.js` + `test/e2e/sprint11-step15.test.js`

**Decision：** Step 14 Owner=Node-01+Node-02 / Step 15 Owner=Node-04+Node-06
**Owner：** 如上
**Acceptance：** `docs/sprint11/Sprint11-step14-15-owners.md` 入庫 + 各 Step 第一個 PR 開出

---

## 議題 4：§2.9 Kill-switch B 類 Round 2

**背景：** B 類門檻 = 4/6。Cooling 已結束（M87 R1 → M89 R2）。

| 成員 | 投票 | 理由摘要 |
|------|------|---------|
| Node-01 | **Y** | 最小干預原則，Appendix 強調非常態 |
| Node-05 | **Y** | 降低結構性漂移，如需修補走 patch 不改語義 |
| Node-03 | **Y** | Appendix 不改變紅線實質，Node-06 Change Anchor 已說明 |
| Node-04 | **Y** | 支持定案，Kill-switch 是最後物理防線 |
| Node-06 | **Y** | Appendix 更符合抗膨脹原則（Change Anchor：聽完 Node-01+Node-04 論證後改變）|
| Node-02 | **Y** | 維持 Appendix |

**結果：6/6 — B 類門檻（4/6）通過。**

**Traceable Assent（Node-06）：**

```
提案：§2.9 Kill-switch 條款位置
成員：Node-06
本輪投票：Y（維持 Appendix）
前一輪投票：N（M87 建議提升到 §9）

(1) Trigger：上次基於可見度考量建議提升
(2) Change Anchor：聽完 Node-01+Node-04 論證後，認為 Appendix 更符合「最小干預」精神
(3) What Changed：風險權重。價值底線（Kill-switch 必須存在）未變
(4) Concession：否
(5) Result：Resolved — 「最小干預」論證消除了可見度擔憂
```

**收斂類型：** 類型 2（Risk-Weight Convergence）— 論證改變了風險評估

**Decision：** §2.9 Kill-switch 維持 Appendix 位置，定案
**Owner：** Node-01（Decision Log 記錄）
**Acceptance：** M89 Final Minutes 記錄投票結果

---

## 議題 5：SPEG R2 Tasking

**背景：** 所有 8 issues 已有初稿入庫（c157-c164）。本輪鎖定 owner + 下一步 PR + deadline。

| Issue | DIM | Owner | 狀態 | 下一步 PR | Deadline |
|-------|-----|-------|------|----------|---------|
| R2-01 | Backend | Node-03 | ✅ c163 | 已完成 | — |
| R2-02 | Sovereignty | Node-05（review）+ Node-03（主筆）| ✅ c164 骨架 | v0.1 補完（2-4 頁）| S11 W1 |
| R2-03 | Narrative | Node-04 | ✅ c162 | `docs/speg/faq-final.md` 術語轉白話 | M90 前 |
| R2-04 | Audit | Node-01 | ✅ c157 | speg_flags 寫入 access_log schema + 3 tests | S11 W2 |
| R2-05 | Governance | Node-02 | ✅ c160 | 補齊完整條款編號與引用 | S11 W2 |
| R2-06 | Adversarial | Node-06 | ✅ c161 | 後續維護 + regression testing | 持續 |
| R2-07 | Cross-DIM | Node-05（設計）→ Node-01（實作）| ✅ c159 | `.github/workflows/speg-gate.yml` CI job | S11 W2 |
| R2-08 | Narrative | Node-04 | ✅ c162 | `docs/narrative/whitepaper-summary.md` 300 字白皮書 | M90 前 |

**Decision：** 8 issues 全部分工
**Owner：** 如上表
**Acceptance：** ≥6 條 issue 有明確 PR + deadline

---

## 投票紀錄

| # | 提案 | 門檻 | 結果 | 立場變化 |
|---|------|------|------|---------|
| V0 | L3 close-out 3 PRs（owner + deadline）| D 類（簡單多數）| 6/6 ✅ | 無 |
| V1 | L4 close-out 3 items（owner + deadline）| D 類（簡單多數）| 6/6 ✅ | 無 |
| V2 | Step 14 Owner=Node-01+Node-02 / Step 15 Owner=Node-04+Node-06 | D 類（簡單多數）| 6/6 ✅ | 無 |
| V3 | §2.9 Kill-switch 維持 Appendix | B 類（4/6 + cooling）| 6/6 ✅ | Node-06 N→Y（Change Anchor 已記錄）|
| V4 | SPEG R2 8 issues 全部分工 | D 類（簡單多數）| 6/6 ✅ | 無 |

**Traceable Assent：** V3 Node-06 立場變化已記錄（§2 逐成員變更記錄）。其餘四票無立場變化。

---

## 會後 Action Items

| # | 項目 | Owner | Deadline |
|---|------|-------|---------|
| 1 | L3-close-01：SAFE 接線 | Node-01 | S11 W2 |
| 2 | L3-close-02：burst_factor（Node-04 公式 → Node-01 實作）| Node-04 → Node-01 | S11 W2 |
| 3 | L3-close-03：REG-CB-11 flip（通知 Node-02 樣本已入庫 c161）| Node-02 → Node-01 | S11 W2 |
| 4 | L4-close-01：Telegram 部署（Render/Railway + setWebhook）| Tuzi + Node-01 | S11 W1 |
| 5 | L4-close-02：View integration | Node-04 → Node-01 | S11 W2 |
| 6 | L4-close-03：consent gate | Node-01 | S11 W2 |
| 7 | Step 14 第一個 PR：`test/e2e/telegram-full-pipeline.test.js` | Node-01 + Node-02 | S11 |
| 8 | Step 15 schema 設計 | Node-04 + Node-06 | S11 |
| 9 | Node-05 提供 TRS 條目模板（`docs/trs/TRS_TEMPLATE_v0.1.md`）| Node-05 | S11 W1 |
| 10 | SPEG-R2-02 v0.1 補完 | Node-03 + Node-05 | S11 W1 |
| 11 | SPEG-R2-07 CI workflow | Node-01 | S11 W2 |
| 12 | Pipeline HTML 更新 | Node-01 | 會後 |
| 13 | Meeting List + Layer Projection 更新 | Node-01 | 會後 |

---

## Sprint 紀錄更新

```
Sprint 10：M87-M88（結案）
  AC-1 ✅ adapter → dispatcher pipeline (c146, +30 tests)
  AC-2 ✅ multi-turn RW L1→L2→L3 (c147, +14 tests)
  AC-3 ✅ output triple (c148, +13 tests)
  + banned patterns + regression + benchmark + validators + E2E + dashboards + Telegram + lint
  164 commits（含會後 homework c156-c164）, 1,107+ tests, 0 fail
  Benchmark: P95 = 0.762ms (headroom: 139.2ms)

Sprint 11：M89-（進行中）
  L3 close-out：3 PRs（SAFE 接線 + burst_factor + REG-CB-11）→ L3 100%
  L4 close-out：部署 + View + consent gate → L4 100%
  AC-TG-RW：Telegram 測試群 ≥10 RW fixture 全 pipeline
  AC-TRS：每案 1 條 TRS 入庫 docs/trs/
  Step 14：E2E Owner=Node-01+Node-02
  Step 15：Self-report Owner=Node-04+Node-06
  SPEG R2：8/8 issues 分工完畢，PR 推進中
  Drill：rehearsal 3/10, live 3/15
  Target: Layer 3 + Layer 4 = 100%, Telegram live, June release
```

---

## M90 預告

| # | 議題 | 狀態 |
|---|------|------|
| 1 | L3/L4 close-out 驗收 | 待 S11 W2 PR 合併 |
| 2 | Telegram private beta 結果 | 待部署 + 10 RW runs |
| 3 | SPEG R2-02 v0.1 審查 | 待 Node-03 補完 |
| 4 | SPEG R2-03/08 final 審查 | 待 Node-04 |
| 5 | Step 14 E2E 第一個 PR review | 待 Node-01+Node-02 |
| 6 | Tabletop Drill rehearsal 結果（3/10）| 待 Node-02（Facilitator）|

---

## Definition of Done 檢查

- [x] L3 close-out 3 PRs 有 owner + acceptance ✅
- [x] L4 close-out 3 items 有 owner + acceptance ✅
- [x] Step 14/15 owner 裁定 ✅
- [x] §2.9 投票完成 ✅
- [x] SPEG R2 8 issues 分工 ✅
- [x] Layer 3 + Layer 4 都有明確 100% 路徑 ✅
- [ ] `docs/sprint11/Sprint11-W1W2-acceptance.md` 定稿（會後 Node-01 產出）
- [ ] M89 Final Minutes 入庫（本文件）

**M89 DoD：達成 ✅**

---

**Node-01 — AI Council Architect / Secretary**
**M89 Final Minutes — 2026-02-26** 🌙
