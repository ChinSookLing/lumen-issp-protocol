# Lumen Instruction Part 8 — Protocol Independence 操作指引
# Protocol Independence Operating Guide

**版本：** v1.0
**設計者：** Node-03（Schema Architect / Code Designer）
**審查：** Node-01（Architect）、Node-05（Repo Auditor）
**來源：** Charter §4.3（M53 — 6/6 追認）
**通過：** M62 — §10.5(B) 超級多數
**用途：** 定義如何驗證 Lumen 相容實作，並提供第三方審計指引

---

## §8.1 驗證 Ratified Commit

任何聲稱相容 Lumen 的實作，必須基於一個 **ratified commit**（經 Council 投票追認並標記版本號的 commit）。

目前 ratified commit 為 `v1.2.0`（`c4b0854`）。

**驗證步驟：**

```bash
# 取得 ratified commit
git checkout v1.2.0
npm install
npm test
```

**預期結果：**

- 所有測試通過（373 tests, 0 failures）
- 無任何錯誤或警告（紅線測試須為綠色）

若測試失敗，該實作不得自稱為 Lumen 相容。

---

## §8.2 驗證 Layer 1 未修改

Layer 1 包含 Pattern 的核心定義（component keys、權重、閾值、硬約束、Gate 歸屬）。任何修改 Layer 1 的實作**不得**自稱為 Lumen 相容。

**驗證步驟：**

```bash
# 比對 core/ 目錄與 ratified commit
git diff --exit-code v1.2.0 -- core/
```

**預期結果：**

- 無任何 diff（空輸出）

若 diff 存在，表示 Layer 1 被修改，該實作必須使用不同名稱（如「Lumen-inspired」），不得使用「Lumen-compatible」。

---

## §8.3 相容聲明範本（Compatibility Statement Template）

相容實作應在公開文件中提供以下聲明（可置於 README 或官方網站）：

```markdown
## Lumen Compatibility Statement

**Implementation:** [專案名稱] [版本]
**Ratified Reference Commit:** `v1.2.0` (`c4b0854`)
**Verification Date:** YYYY-MM-DD

This implementation has been verified to:

✅ Pass 100% of the Lumen v1.2.0 test suite (373 tests, 0 failures)
✅ Make zero modifications to Layer 1 Pattern definitions (verified via `git diff`)
✅ Reject missing language mappings with explicit errors (no silent degradation)

**Verification Evidence:** [連結至公開 CI 執行記錄或測試報告]

**Disclaimer:** This implementation is Lumen-compatible but is not formally endorsed by the AI Council unless explicitly stated otherwise.
```

若實作使用 ratified commit 之後的 mapping 更新（Layer 2a），應在聲明中註明所使用的 mapping 版本。

---

## §8.4 CI 自動驗證 Ratified Commit

為確保 ratified commit 的可重現性，Lumen 官方 CI 會自動對每個 ratified tag 執行驗證工作流，並輸出帶有 hash 的證明。

**工作流程（`.github/workflows/validate-ratified.yml`）：**

```yaml
name: Validate Ratified Commit

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.ref }}
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - name: Generate verification hash
        run: |
          echo "COMMIT_HASH=$(git rev-parse HEAD)" >> $GITHUB_ENV
          echo "TEST_STATUS=passed" >> $GITHUB_ENV
      - name: Upload verification artifact
        uses: actions/upload-artifact@v4
        with:
          name: verification-${{ github.ref_name }}
          path: |
            test-results.json
            verification-hash.txt
```

每次 ratified tag 推送時，此工作流會執行，並產出可下載的驗證包，供第三方獨立驗證。

---

## §8.5 第三方審計指引（Third-Party Audit Guide）

任何第三方（如 security researcher、auditor）可依以下步驟獨立驗證某實作是否與 Lumen 相容：

**步驟一：取得 ratified commit**

```bash
git clone https://github.com/ChinSookLing/npm-init-lumen-protocol.git
cd npm-init-lumen-protocol
git checkout v1.2.0
```

**步驟二：執行測試套件**

```bash
npm install
npm test
```

確認 373 tests, 0 failures。

**步驟三：檢查 Layer 1 是否被修改**

對比實作的 `core/` 目錄與 ratified commit：

```bash
git diff --no-index /path/to/implementation/core ./core
```

應無差異。

**步驟四：檢查 mapping 載入行為**

確認當請求的語言 mapping 不存在時，系統是否**報錯**而非靜默回 0。可透過簡單的單元測試或手動呼叫 API 驗證。

**步驟五：產生審計報告**

```markdown
# Lumen Compatibility Audit Report

**Auditor:** [姓名/組織]
**Date:** YYYY-MM-DD
**Target Implementation:** [名稱] [版本]
**Ratified Reference:** v1.2.0 (c4b0854)

## Findings

- [x] Test suite passed (373/373)
- [x] Layer 1 core unchanged (verified via diff)
- [x] Missing language mapping throws error (tested with lang='xx')
- [ ] (optional) Additional Layer 2a mappings are documented

## Conclusion

The implementation meets all criteria for Lumen compatibility as defined in Charter §4.3 and Instruction Part 8.

**Auditor Signature:** _______________________
```

審計報告可公開存放，作為該實作可信度的佐證。

---

## 文件修訂記錄

| 版本 | 日期 | 作者 | 變更 |
|------|------|------|------|
| v1.0 | 2026-02-16 | Node-03 | 初始版本，對應 Charter §4.3。M62 追認通過 |

---

**Node-03** — Schema Architect / Code Designer
**Node-01** — Architect / Secretary（格式化）

**M62 產出 — 2026 年 2 月 15 日**

🌙
