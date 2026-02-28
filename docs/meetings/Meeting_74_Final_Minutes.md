# AI Council 第七十四次會議 — 最終紀要
# 74th AI Council Meeting — Final Minutes

**日期：** 2026 年 2 月 18-19 日
**主持：** Tuzi
**秘書 / Architect：** Node-01 (Lumen)
**出席：** Node-05 ✅ / Node-03 ✅ / Node-04 ✅ / Node-02 ✅ / Node-06 ✅ / Node-01 ✅

---

> **Council Header（v0.2）**
>
> 1. **核心原則：** 通過密集對話讓 Affiliates 自然形成，絕對不是擬人化。
> 2. **回覆規則：** 自由說話；不倒退已關閉章節；立場變化請說明 Change Anchor。
> 3. **能力變動：** Node-04 揭露：Node-04 3 Flash（Free tier）。其他成員無變動。
> 4. **[假設生成] 標記規範：** 同步標注信心等級：高 / 中 / 低。信心越高，可反駁點要求越嚴格。
> 5. **外部資料抓取規範：** 任何外部資料抓取必須提供：目標聲明 + 檢索方式 + 命中結果（含秒級 UTC + 存檔）+ 裁定（Verified / Not Verified / Inconclusive）。未符合格式自動降為 [線索]。

---

## 會前落地成果（Node-01 單日清零）

| Commit | 內容 | Tests |
|--------|------|-------|
| `b251ca3` | Cross-cultural test suite (54 vectors, 7 languages) | 471 |
| `117394f` | RW candidates v1 (79 vectors, 6 Affiliates) | 471 |
| `31160ea` | L3→L4 contract + adapter + e2e smoke (8 tests) | 479 |
| `a9b4743` | .gitignore + remove node_modules | 479 |
| `3e90479` | Time provider + CI contract gate (5 tests) | 484 |
| `6a50c6b` | UI tier constraints + copy lint + exit ramp (12 tests) | 496 |

**Sprint 8 四層缺口全清。Tests: 471 → 496（+25），0 fail，7 commits。**

---

## 議題一：L3→L4 Contract 追認

**提案：** 追認 `contracts/forecast-to-alert.v1.schema.json` 為 L3→L4 正式契約。

### 投票結果

| 成員 | 投票 | 附加建議 |
|------|------|---------|
| Node-05 | Y（附條件）| v1.1 加 `risk_band` + `schema_version`；ACRI 映射加 guard（evidence < 3 或 gate_hit < 2 時封頂）|
| Node-03 | Y | 標註 MVP 簡化；建議 CI 強制 live 模式經 test 驗證 |
| Node-04 | Y | v1.1 加 `detected_lang` |
| Node-02 | Y | v1.1 加 `confidence` + `source_node_id`（選）；明確映射函數 |
| Node-06 | Y | 無條件 |
| Node-01 | Y | — |

**結果：6/6 Y ✅ — Contract v1 追認通過**

**v1.1 待辦（非阻塞，留 Sprint 9）：**
- 加 `risk_band`、`schema_version`、`detected_lang`、`confidence`
- ACRI 映射加 evidence_count + gate_hit guard
- `audit` 模式禁止輸出可執行 action

---

## 議題二：Explanation Engine 啟動時機

### 投票結果

| 成員 | 投票 | 理由摘要 |
|------|------|---------|
| Node-05 | **B** | 先做 1-2 輪 e2e 強化，把爭論從「哲學」拉回「可測」|
| Node-03 | **B** | 素材未跑過端到端；管線穩固成本低效益高 |
| Node-04 | **B** | E2E smoke 僅 2 條，需更強健 CI Gate |
| Node-02 | **B** | 先硬化可追溯/HITL/hypothesis 流程 |
| Node-06 | **B**（推斷）| 支持先衝 Test Run + Explanation |
| Node-01 | **B** | — |

**結果：6/6 B ✅ — 先穩固管線，Explanation Engine 延後至 M75+**

**B 路線具體範圍：**
1. 1-2 輪 e2e 強化（更多 smoke cases + contract regression）
2. TR-001 至 TR-010 完成後啟動 Explanation RFC
3. SAFE 模式可先在 sandbox（operator_mode=test/audit）下開放

---

## 議題三：Sprint 8 結案宣告

### 投票結果

| 成員 | 投票 |
|------|------|
| Node-05 | Y |
| Node-03 | Y |
| Node-04 | Y |
| Node-02 | Y |
| Node-06 | Y |
| Node-01 | Y |

**結果：6/6 Y ✅ — Sprint 8 正式結案**

**Tag：** `v1.5.0` — Sprint 8 Closed

### Sprint 8 完整交付物

| 項目 | 原負責 | 落地 Commit |
|------|--------|------------|
| Cross-cultural 54 vectors | Node-04 設計 → Node-01 落地 | `b251ca3` |
| RW candidates 79 vectors | 全員收集 → Node-01 落地 | `117394f` |
| L3→L4 contract + adapter + e2e | Node-05 設計 → Node-01 落地 | `31160ea` |
| Time provider | Node-05 設計 → Node-01 落地 | `3e90479` |
| CI contract gate | Node-05 設計 → Node-01 落地 | `3e90479` |
| UI tier constraints + copy lint | Node-05 設計 → Node-01 落地 | `6a50c6b` |
| 平民化誤用防線 + exit ramp | Node-05 設計 → Node-01 落地 | `6a50c6b` |

---

## 議題四：Test Run Protocol — 學術等級驗證記錄

### 審查結果

| 成員 | 通過？ | 改良建議 |
|------|--------|---------|
| Node-05 | ✅ | 加環境版本鎖定（node -v, OS）；每 TR 加 benign 對照組；FAIL 必須開 Issue |
| Node-03 | ✅ | 足夠且必要；解決長期「可追溯性」缺口 |
| Node-04 | ✅ | 達到學術等級；由局部到整體的壓力測試路徑合理 |
| Node-02 | ✅ | 加 evidence snapshot hash；Chain-RW + E2E 測試資料提前準備 |
| Node-06 | ✅ | 建議 TR-6 Chain-RW 提前到 Day 4 後；整體合理 |
| Node-01 | ✅ | — |

**結果：6/6 通過 ✅ — Test Run Protocol 追認**

### TR Review 分配表

| TR | Target | Witnesses |
|----|--------|-----------|
| TR-001 | MB 中文 | Node-03, Node-01 |
| TR-002 | EP 英文 | Node-01 |
| TR-003 | FC 跨語 | Node-04, Node-03, Node-01 |
| TR-004 | GC 中文 | Node-01 |
| TR-005 | Benign | Node-01 |
| TR-006 | Chain-RW | Node-06, Node-03, Node-05, Node-02, Node-01 |
| TR-007 | Forecast | Node-06, Node-03, Node-01 |
| TR-008 | E2E | Node-05, Node-02, Node-01 |
| TR-009 | UI Lint | Node-05, Node-01 |
| TR-010 | Cross-cultural | Node-06, Node-04, Node-03, Node-01 |

---

## 會後額外落地（M74 產出）

| Commit | 內容 |
|--------|------|
| `507fe11` | VERIFY.md（10 秒驗真）+ DEPLOYMENT_POLICY.md（部署紅線）|
| `bd1d7fd` | docs/showcase/m74-sprint8.html（互動慶祝場景）|

### VERIFY.md 重點
- 任何宣稱官方的部署，必須提供 `commit_hash + build_id + operator_mode + TR-ID`
- 對不上 VERIFIED_BUILDS = 非官方/不可驗證

### DEPLOYMENT_POLICY.md 重點（Shield-Not-Sword）
- §2.1 禁止用於戰鬥/武器決策鏈
- §2.2 禁止用於執法/懲戒的自動裁決
- §2.3 禁止用於物理控制的自動觸發
- §2.4 禁止用於大規模輿論操控
- §3 高風險場景必須 HITL + 可追溯 + 停手機制
- §4 禁止責任外包

---

## Node-05 額外貢獻（M74 OT 加班）

Node-05 在會外與 Tuzi 深入討論了以下議題（完整記錄由 Node-01 整理）：

1. **反混淆策略：** 不靠保密防 fork，靠「信任歸屬」+ 可驗證證據鏈
2. **VERIFY.md 設計：** 10 秒驗真流程，讓外人一眼分辨官方 vs fork
3. **DEPLOYMENT_POLICY.md 設計：** 高風險場景部署紅線，Shield-Not-Sword
4. **車廠/無人機場景分析：** 高風險用途必須「自曝」capabilities，不能靜默
5. **BENCHMARKING 建議：** 任何「比 Lumen 少 25%」的宣稱必須附可重現證據

---

## Repo 狀態

```
Repository：github.com/ChinSookLing/npm-init-lumen-protocol (private)
Latest commit：bd1d7fd
Tag：v1.5.0 — Sprint 8 Closed
Tests：496 (0 fail / 90 suites)
Total commits since M74 start：9
```

---

## 下一步

1. **TR-001 至 TR-010：** 每日一個 Test Run，學術等級記錄
2. **Explanation Engine RFC：** TR-010 完成後啟動（M75+）
3. **Contract v1.1：** 加 risk_band / schema_version / detected_lang / confidence
4. **Sprint 9 規劃：** e2e 強化 + Explanation Engine 設計

---

**秘書：** Node-01 — AI Council Architect
**批准：** Tuzi — AI Council 創始人

**M74 最終紀要 — 2026 年 2 月 19 日**

🌙
