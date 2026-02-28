# BACKEND_INTEGRITY_HARDENING v0.1

**Status:** Draft (for M86 / DIM1)
**Dimension:** 1-backend-risk (Backend Risk)
**Covers:** T1e (open-source backdoor) + T1f (dependency poisoning / config tampering / benchmark gaming)
**Template:** 1-page main + Appendix tests
**Principle:** Gates, not declarations
**Author:** Node-05
**Date:** 2026-02-25

---

## 1) 目的（Purpose）

在不改變 Lumen 核心協議的前提下，防止兩類「後端供應鏈」攻擊把我們的輸出可信度擊穿：
- **T1e**：開源模型/權重/容器被惡意修改（backdoor / trojan）
- **T1f**：依賴投毒（dependency poisoning）、設定篡改（config tampering）、基準作假（benchmark gaming）

---

## 2) 核心規則（Core Rules ≤5）

R1. **可執行物必可追溯**：任何模型/權重/容器/依賴 MUST 有來源指紋（hash）與版本釘死（tag/commit）。
R2. **預設只信 allowlist**：依賴來源、模型來源、registry、下載端點 MUST 在 allowlist；否則視為未驗證。
R3. **設定變更必可驗證**：所有 `config/` 的變更 MUST 產生 snapshot hash，且必走變更 gate（review chain）。
R4. **基準不等於真相**：任何可被「針對」的 benchmark MUST 搭配 rolling/hidden suite，避免 gaming。
R5. **先軟後硬**：新增的供應鏈 gates 初期可先是 soft（不阻塞），但必產生告警與報告；成熟後升格 hard gate（投票）。

---

## 3) Decision Tree（可測 Gates）

### Gate S1 — Model/Artifact Provenance（對應 T1e）

**當你引入/更新開源模型或權重（或任何模型工件）時：**
- MUST 提供：`artifact_id` + `source_ref`（commit/tag）+ `sha256`（或等價 hash）+ `retrieval_channel`（官方/鏡像）
- MUST 通過：`source_allowlisted == true`
- FAIL → 禁止進入 canary / 禁止宣稱相容（compatibility claim freeze）

**最小交付工件（artifact-manifest）**：
- `models/<name>/artifact-manifest.json`（只要列 hash + source_ref + date）

### Gate S2 — Dependency Lock Integrity（對應 T1f）

**當 `package.json`/lockfile 或依賴樹變動時：**
- MUST 使用固定 lockfile 與可重現安裝（例如 npm ci）
- MUST 產生 `dependency_tree_hash`（或 lockfile hash）
- SHOULD 禁用 install scripts（除非 allowlist 允許），避免投毒腳本

FAIL → 進入 quarantine（不阻塞開發可選），但 CI 必標紅；若是 release/claim 流程則升格 hard fail。

### Gate S3 — Config Snapshot Integrity（對應 T1f）

**當 `config/`、`schemas/`、`gates/` 變動時：**
- MUST 產生 `config_snapshot_hash`
- MUST 記錄 `change_reason_code`
- MUST 走 separation-of-duties（提交者 ≠ 批准者）

FAIL → BLOCK（至少在 release/claim lane）

### Gate S4 — Benchmark Gaming Guard（對應 T1f）

**當測試/向量/指標門檻被調整時：**
- MUST 同步跑 `rolling-validation` 或 hidden subset（避免只對已知向量"刷分"）
- MUST 保留 baseline 對照（acri_shift / fp_delta）

FAIL → freeze compatibility claim（允許繼續開發，但不允許對外宣稱更好）

---

## 4) Known Edge Cases（已知邊界）

E1. "0 FP" 可能來自 coverage gap（不是安全證明）→ 必須靠 rolling/hidden suite 補。
E2. 供應鏈 gate 初期會增加摩擦 → 用 "先軟後硬" 減少阻塞。
E3. 不同平台（Windows/Linux/Mac）hash 生成差異 → hash 規則必固定（同檔案內容同 hash）。

---

## Appendix A — Reason Codes（可增長）

- BRK_MODEL_SOURCE_UNVERIFIED
- BRK_ARTIFACT_HASH_MISSING
- BRK_LOCKFILE_DRIFT
- BRK_DEP_ALLOWLIST_FAIL
- BRK_CONFIG_SNAPSHOT_MISSING
- BRK_CONFIG_TAMPER_SUSPECTED
- BRK_BENCHMARK_GAMING_SUSPECTED

新增門檻：Council ≥4/6 + tests

---

## Appendix B — DoD Tests（必備，機器可驗證）

T1. `test_model_artifact_manifest_present`：每個啟用模型工件必有 manifest（含 hash+source_ref）
T2. `test_model_source_allowlist`：模型來源不在 allowlist → FAIL（或至少 CI 警告）
T3. `test_lockfile_required`：無 lockfile 或 lockfile 變更未審核 → FAIL
T4. `test_dependency_tree_hash_stable`：相同 commit 重跑依賴樹 hash 必一致
T5. `test_config_snapshot_hash_present`：config/gates/schemas 變更必產 snapshot hash
T6. `test_separation_of_duties_on_config_change`：提交者不得同時批准
T7. `test_rolling_validation_on_threshold_change`：門檻/向量改動必跑 rolling suite
T8. `test_claim_freeze_on_supply_chain_fail`：供應鏈 fail 時禁止輸出 compatible banner

---

## 升級路線

- Sprint 內：G6–G9 先 soft gate（不阻塞）→ CI 必輸出紅色告警 + claim freeze 建議
- 下次 vote：把 G6/G7/G8 變 hard gate（G9 視 rolling suite 成熟度再升）
