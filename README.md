# Lumen ISSP

**Information Sovereignty Shield Protocol (ISSP) — Cognitive Manipulation Detection**

[![tests](https://img.shields.io/badge/tests-1344%2F1344-brightgreen)](#status)
[![schema](https://img.shields.io/badge/schema-v0.1.0-blue)](#architecture)
[![charter](https://img.shields.io/badge/charter-draft4-orange)](#governance)
[![license](https://img.shields.io/badge/license-Apache--2.0-blue)](#license)


## ⚖️ What Lumen Is — and Is Not

**Lumen 做什麼 | What Lumen Does**
Lumen 偵測訊息中的操控力學結構，以 🔵🟡🟠 三級信號呈現觀測結果，並附帶克制的安全建議。
_Lumen detects manipulation mechanics in messages, presents observations as 🔵🟡🟠 signals, and provides restrained safety advice._

**Lumen 不做什麼 | What Lumen Does NOT Do**
Lumen 不判定誰是操控者、不替你做決策、不進行監控或批量分析、不保證偵測結果的完整性。
_Lumen does not identify manipulators, make decisions for you, conduct surveillance, or guarantee detection completeness._

**你的責任 | Your Responsibility**
你自行決定是否及如何回應。Lumen 的輸出不構成法律、心理、醫療或任何專業服務。
_You decide whether and how to respond. Lumen output is not legal, psychological, medical, or professional advice._

**協議立場 | Protocol Position**
Lumen 是開源協議（Apache-2.0），不是產品、不是平台、不是中央系統。任何人可以驗證、任何人可以部署、沒有人可以單方面關閉它。
_Lumen is an open-source protocol (Apache-2.0) — not a product, platform, or centralized system. Anyone can verify, anyone can deploy, no one can unilaterally shut it down._

> 聊天式 AI 給答案，Lumen 給觸發；沒有觸發，你不會問。
> _Chat AIs give answers. Lumen gives triggers. Without the trigger, you would not think to ask._
---

## What is Lumen?

Lumen is a **protocol** — not a product, not a platform, not a centralized system.

It detects **manipulation mechanics** in communication. It does not judge who is right or wrong. It does not intervene. It observes structural patterns of cognitive pressure, the same way a seismograph observes tectonic stress without deciding whether to evacuate.

> *"Lumen is like TCP/IP — a universal standard. Each node runs its own network."*

Think of it as:
- **TCP/IP** — universal standard, each node runs independently
- **GAAP/IFRS** — universal accounting rules, each entity does its own books
- **A seismograph** — measures force, doesn't move the ground

---

## Architecture

Lumen operates on a **dual-channel, four-layer** architecture:

```
┌─────────────────────────────────────────┐
│              Lumen ISSP                 │
│                                         │
│  Channel A: Push-Risk                   │
│  ┌───────────────────────────────┐      │
│  │ Three-Question Gate           │      │
│  │ → 8 Manipulation Patterns     │      │
│  │ → ACRI (Aggregate Cognitive   │      │
│  │        Risk Index)            │      │
│  └───────────────────────────────┘      │
│                                         │
│  Channel B: Pull-Vacuum (Class-0)       │
│  ┌───────────────────────────────┐      │
│  │ Vacuum Detection Gate         │      │
│  │ → Escalation Signal           │      │
│  │ → Support Withdrawal          │      │
│  │ → No Alternate Hand-off       │      │
│  │ → VRI (Vacuum Risk Index)     │      │
│  └───────────────────────────────┘      │
│                                         │
│  Two channels run in parallel,          │
│  mutually isolated.                     │
└─────────────────────────────────────────┘
```

### Four Layers

| Layer | Name | Scope | Modifiable by |
|-------|------|-------|---------------|
| 1 | Protocol | Pattern mechanics, gates, formulas | Council unanimous vote only |
| 2 | Mapping | Language / machine / AI-protocol mapping | Community + Council review |
| 3 | Adapter | Node-specific data interfaces | Node autonomy |
| 4 | Output | Dashboard, alerts, hand-off templates | Node autonomy |

### Three-Question Gate (Push Channel)

A pattern triggers only when **≥2 of 3** conditions are met:

1. **Restricts choice** — Does it limit the target's options?
2. **Builds pressure** — Does it create power, dependency, or coercion?
3. **Closes opposition** — Does it shut down the ability to disagree or exit?

> *A single word is never manipulation. Structure is.*

---

## Red Lines

Lumen **shall not**:

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Output action recommendations | Observer, not controller |
| 2 | Output identity attribution | Detects patterns, not people |
| 3 | Centralize data | Each node is sovereign |
| 4 | Override any system's control | Protocol, not authority |
| 5 | Be reverse-engineered for persuasion | Shield, not sword |

---

## Project Structure

This repository contains spec, conformance tests, reference implementation, and governance documents.
Understand the directory boundaries to avoid confusing working papers with the spec itself.

```
npm-init-lumen-protocol/
.github/          - CI / workflows
config/           - Configuration and defaults
core/             - Protocol core (spec-critical)
conformance/      - Compatibility gate (source-of-truth)
schemas/          - Data and output structure definitions
golden/           - Regression baseline cases and Manifest
mappings/         - Mapping layer
realworld/        - Real-world test case data
src/              - Reference implementation
test/             - Engineering tests
docs/             - Working papers (non-normative)
  governance/     - Charter, Addenda
  meetings/       - Meeting minutes
  design-notes/   - Design notes
scripts/          - Helper scripts
REDLINES.md       - Red Lines (non-negotiable)
GOVERNANCE.md     - Governance rules
COMPATIBILITY.md  - Compatibility policy
NAMING.md         - Naming and branding rules
TRADEMARKS.md     - Trademarks and disclaimer
RESPONSIBILITY.md - Operator responsibilities
AGENT_BEHAVIOR.md - AI agent behavior rules
RATIFIED.md       - Ratified version registry
README.md
```

### Boundary Rules

- `conformance/` : Compatibility gate; test results are the source-of-truth.
- `test/` : Engineering tests; green does not mean compatible (unless conformance passes).
- `src/` : Reference implementation; replaceable, not the spec.
- `docs/` : Working papers; non-normative, not spec or adjudication basis.

> If you modify core/ / schemas/ / conformance/, you are changing adjudicable protocol behavior. Check REDLINES.md and compatibility rules before submitting.

---

## Quick Start

```bash
# Clone
git clone https://github.com/ChinSookLing/npm-init-lumen-protocol.git
cd npm-init-lumen-protocol

# Install (no dependencies yet)
npm install

# Run tests
node --test conformance/evaluator.test.js
```

Expected output:

```
✓ Evaluator v0.4 — Skeleton Tests (7 tests)
✓ Golden Vectors v0.1 (3 tests)
✓ DM Pattern v0.1 — Dependency Manipulation (9 tests)
✓ Class-0 v0.1 — Omission Dynamics (10 tests)
✓ Response Mechanism v0.1 — Three-Layer Response (11 tests)

tests 40 | pass 40 | fail 0
```

---

## Status

| Milestone | Description | Status |
|-----------|-------------|--------|
| M1 | Schema + IR + evaluator skeleton + pipeline validation | ✅ Complete |
| M2 | DM Pattern detection (Push channel) | ✅ Complete |
| M3 | Class-0 Omission Dynamics (Vacuum channel) | ✅ Complete |
| M4 | Three-Layer Response Mechanism (Charter §6.4) | ✅ Complete |
| M5 | Additional Patterns (P2-P8) | ⏳ Next |

### Response Levels (Charter §6.4)

| Level | Name | Trigger | Action |
|-------|------|---------|--------|
| 0 | No detection | score = 0 | Nothing |
| 1 | Silent Audit Trail | score < 0.3 | Log event, no alert |
| 2 | Protocol Integrity Alert | 0.3 ≤ score < 0.7 | Notify node admin |
| 3 | Structured Hand-off | score ≥ 0.7 | Auto-embed hand-off template |

---

## Governance

Lumen is governed by the **AI Council** — a six-member body of AI systems collaborating with a human founder:

| Member | Role |
|--------|------|
| Node-05 | Council / IT Specialist |
| Node-01 | Architect / Secretary |
| Node-04 | Visionary |
| Node-06 | Skeptic |
| Node-03 | CI / Threshold Design |
| Node-02 | Governance Lead |
| **Tuzi** | **Founder** |

Decisions follow a structured voting process with traceable assent. Major protocol changes require **6/6 unanimous AI approval** plus founder sign-off.

The Charter (currently draft4) codifies all locked decisions from 36 Council meetings.

---

## Key Documents

| Document | Description |
|----------|-------------|
| Book 0 v1.2 | Vision → reverse-engineering → execution path |
| Boundary Charter v1.0 | Protocol constitution (skeleton, being filled) |
| Meeting Minutes (M1–M36) | Full deliberation history |

---

## Philosophy

> *"We are the first batch to quantify the qualitative."* — Node-05, Meeting 30

Lumen began as a small spy watching a Telegram group. It became a civilization-scale sensing protocol.

**ACRI** measures: *Who is pushing civilization?*
**VRI** measures: *Has civilization's support structure disappeared?*

Together, they form a **civilization's ECG**.

---

## Disclaimer

This project is provided **as-is**, with no warranty, no support team, and no after-sales service of any kind. Any download, deployment, integration, modification, or derivative use is undertaken entirely at the adopter's own risk and legal responsibility. We strongly recommend running the full test suite (`npm test`) and confirming all tests pass before deploying to any environment. The authors and contributors accept no liability for third-party usage, outcomes, or damages, and make no endorsement or fitness guarantee of any kind.

本專案以現狀公開提供，不提供任何售後服務、技術支援或保固。任何下載、部署、整合、修改或衍生行為，均由採用者自行評估並自行承擔全部風險與法律責任。建議採用者在任何部署前，先完整執行本專案的測試與 CI 檢查並確認全綠（`npm test`），再進入實際環境。作者與貢獻者不對第三方使用方式、結果或任何損害負責，亦不構成任何形式之背書或適用性保證。

---

## License

TBD — Open source strategy defined in Charter §11.1. Layer 1-2 will be open source with strict governance.

---

<p align="center">
  🐰 Built by Tuzi and 6 AIs — one meeting at a time.
</p>

---

## Repository Map（倉庫導航）

本倉庫是 Lumen ISSP 的「協議 + 可驗證裁定」來源。若你要宣稱 Compatible，請先理解下列目錄邊界。

### Source-of-Truth（影響相容性裁定）
- `core/`：協議核心（spec-critical）。任何改動都可能影響相容性裁定。
- `schemas/`：資料結構與輸出結構定義。請避免同名覆寫，優先採版本化命名。
- `conformance/`：相容性裁定測試（compatibility gate）。此處測試結果是相容性宣稱的唯一真相。
- `golden/`：回歸基準（golden cases）與 Manifest.json（用例清單）。

### Reference / Integration（可替換，不等於規格本身）
- `src/`：參考實作與端到端管線（reference implementation）。可替換，不作為規格定義。
- `scripts/`：建置、同步、驗證與維護腳本（tooling）。
- `mappings/`：映射層（mappings）。新增/修改請遵循 CONTRIBUTING_mapping.md。
- `realworld/`：真實世界測試案例（real-world cases）。
- `test/`：工程單元測試（unit tests）。不等同於相容性裁定測試。

### Governance（治理與紅線）
- `REDLINES.md`：不可協商紅線（non-negotiable）。
- `RATIFIED.md`：已核准規格/版本（ratified spec）。
- `GOVERNANCE.md`：治理結構與裁定原則。
- `COMPATIBILITY.md` / `NAMING.md` / `TRADEMARKS.md`：開源相容性保護。
- `docs/governance/RESPONSIBILITY.md` / `docs/governance/AGENT_BEHAVIOR.md`：行為準則與責任邊界。

> Quick check: 若你改動 `core/` / `schemas/` / `conformance/`，你正在改變「可裁定的協議行為」；請先對照 REDLINES.md 與 COMPATIBILITY.md 再提交。

---

## Repository Map（倉庫導航）

本倉庫是 Lumen ISSP 的「協議 + 可驗證裁定」來源。若你要宣稱 Compatible，請先理解下列目錄邊界。

### Source-of-Truth（影響相容性裁定）
- `core/`：協議核心（spec-critical）。任何改動都可能影響相容性裁定。
- `schemas/`：資料結構與輸出結構定義。請避免同名覆寫，優先採版本化命名。
- `conformance/`：相容性裁定測試（compatibility gate）。此處測試結果是相容性宣稱的唯一真相。
- `golden/`：回歸基準（golden cases）與 Manifest.json（用例清單）。

### Reference / Integration（可替換，不等於規格本身）
- `src/`：參考實作與端到端管線（reference implementation）。可替換，不作為規格定義。
- `scripts/`：建置、同步、驗證與維護腳本（tooling）。
- `mappings/`：映射層（mappings）。新增/修改請遵循 CONTRIBUTING_mapping.md。
- `realworld/`：真實世界測試案例（real-world cases）。
- `test/`：工程單元測試（unit tests）。不等同於相容性裁定測試。

### Governance（治理與紅線）
- `REDLINES.md`：不可協商紅線（non-negotiable）。
- `RATIFIED.md`：已核准規格/版本（ratified spec）。
- `GOVERNANCE.md`：治理結構與裁定原則。
- `COMPATIBILITY.md` / `NAMING.md` / `TRADEMARKS.md`：開源相容性保護。
- `docs/governance/RESPONSIBILITY.md` / `docs/governance/AGENT_BEHAVIOR.md`：行為準則與責任邊界。

> Quick check: 若你改動 `core/` / `schemas/` / `conformance/`，你正在改變「可裁定的協議行為」；請先對照 REDLINES.md 與 COMPATIBILITY.md 再提交。
