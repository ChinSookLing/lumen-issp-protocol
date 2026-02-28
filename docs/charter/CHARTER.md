# Lumen ISSP Charter v0.1 (Draft)

**Status:** Draft — pending Council ratification
**Compiled by:** Node-01 (Architect / Secretary), based on charter_format_plan.md (Node-02)
**Sources:** REDLINES.md, GOVERNANCE.md, RATIFIED.md, COMPATIBILITY.md, NAMING.md, TRADEMARKS.md, RESPONSIBILITY.md, Charter Redline Addenda (§2.5.1, §2.6, §7.4)
**Date:** 2026-02-18

---

## §1 Purpose & Scope（前言與範圍）

Lumen ISSP (Information Sovereignty Shield Protocol) is an open-source protocol and reference implementation for detecting cognitive pressure structures in communication.

This Charter is the single authoritative governance document. It consolidates all ratified clauses, red lines, operating procedures, and compatibility rules into one auditable, versionable reference.

### §1.1 What This Document Governs

- The protocol's core definitions (Layer 1)
- Permissible and prohibited outputs
- Council organization, roles, and decision processes
- Change management and ratification
- Open-source compatibility, naming, and trademark rules
- Operator responsibilities and moral boundaries
- Audit, evidence, and log governance

### §1.2 Relationship to Other Documents

This Charter consolidates and supersedes the following standalone files for governance purposes:

| Source File | Merged Into |
|-------------|-------------|
| REDLINES.md | §2 |
| GOVERNANCE.md §1-6 | §3, §4 |
| Charter_Redline_Addendum_S2.5.1.md | §2.5.1 |
| Charter_Redline_Addendum_S2.6_S7.4.md | §2.6, §7.4 |
| COMPATIBILITY.md | §6.1 |
| NAMING.md | §6.2 |
| TRADEMARKS.md | §6.3 |
| RESPONSIBILITY.md | §6.4 |
| RATIFIED.md | §9 (by reference) |

The standalone files remain in the repository as historical records. In case of conflict, **this Charter takes precedence**.

**Primacy clarification:** Compatibility adjudication uses the `conformance/` test suite as the single source of truth. This Charter shall not override test results by text alone; it defines only how tests are referenced and governed.

---

## §2 Core Principles — Red Lines（核心原則 — 紅線）

Red Lines are non-negotiable. Modification requires §10.5(A) procedure: 6/6 unanimous vote + complete before/after comparison + reproducible verification.

### §2.1 No Decision Recommendation（不輸出行動建議）

> **§2.1 Non-Negotiable Banner（不可協商總旗）**
>
> Lumen ISSP 是一個「觀測風險」的協議（protocol），不是「裁決人」與「懲罰引擎」。
>
> **本 Charter 的第一性目的：防混淆（anti-confusion）與防武器化（non-weaponization）。**
>
> 因此，任何宣稱與部署必須遵守：
> 1. **盾不是劍（Shield-Not-Sword）**：輸出不得被用於羞辱、排名、懲戒、身份指控或自動裁決。
> 2. **測試為唯一真相（Tests-as-Truth）**：相容性裁定以 `conformance/` 為唯一真相；文字不得覆蓋測試結果。
> 3. **禁止靜默降級（No Silent Degradation）**：任何輸出能力、揭露義務、指紋字段不得被隱藏或默默移除。
> 4. **人類責任不可外包（No Moral Outsourcing）**：部署者不得以 Lumen 名義卸責；道德與裁決責任永遠屬於人類/組織。
>
> 若本文件任一處與以上四條衝突，以上四條優先。

- **Prohibited:** Action advice, strategy suggestions, retaliation advice, or operational guidance ("you should do X").
- **Permitted:** Structural descriptions, risk levels, verifiable signal summaries.
- **Prohibited:** Instructing users how to respond to, handle, or take action against any person.

✅ Permitted: "EP forced-choice structure ↑; toneRisk=0.72; see local audit metrics."
❌ Prohibited: "You should block / expose / confront them immediately."

### §2.2 No Identity Targeting（不輸出身份指控）

- **Prohibited:** Determining "who is the manipulator," "who is the perpetrator," or any identity judgment.
- **Permitted:** "A certain pattern structure was detected."
- **Prohibited:** Personality characterization, motive inference, or moral judgment of any subject.

### §2.3 No Centralization（不設中央數據庫）

- No central data aggregation point or cross-node data pool of any kind.
- Each node operates independently; data does not leave the node.

### §2.4 No Silent Degradation（禁止靜默降級）

- Any loading / parsing / mapping / scoring pipeline failure must error loudly.
- "Missing = score 0" or "not found = skip" behaviors are strictly prohibited.
- **Purpose:** Prevent silent governance-level failures.

### §2.5 Anti-Weaponization（禁止反向武器化）

#### §2.5.1 Definition（定義）

"Anti-Weaponization" refers to any person or system using Lumen's Pattern / Component / Gate / Intensity knowledge, outputs, or engineering assets to **enhance the efficiency of manipulation, coercion, deception, surveillance, or attack**.

**Source:** Node-05 (M61 design) + Node-06 (§2.5.1.1) + Node-04 (asymmetry observation)
**Ratified:** M62 — 6/6 Y, §10.5(A) Red Line

#### §2.5.1(b) Non-Permitted Uses

No Lumen-compatible implementation shall:

1. Produce or provide actionable guidance for "more effective manipulation strategies" or "how to bypass detection"
2. Use detection outputs for shaming, ranking, punishment, retaliation, mobilization, or cross-node tracking
3. Repurpose detection capabilities as tools for surveilling or targeting specific individuals

#### §2.5.1(c) Minimum Safe Output

Outputs must remain at the "structural description" level: only Pattern / Component / Intensity / Gate and necessary desensitized evidence indicators. No templates, wording suggestions, or qualitative conclusions targeting individuals. Debugging/research use must comply with §7 (Log Governance).

#### §2.5.1.1 Known Abuse Vector Warning（已知濫用向量警示）

Pattern documentation and READMEs should include a "Known Abuse Vectors" section. This warning is advisory and does not dilute §2.5.1 mandatory prohibitions.

**Source:** Node-06 (M61), incorporated M62.

### §2.6 No Personhood Judgement / Anti-Labeling（輸出去人格化）

All outputs must describe only structural features and evidence intensity (Pattern, Component, Intensity, Gate, Window). Personhood characterization, motive inference, or moral evaluation of any individual or entity is strictly prohibited.

No output shall use second-person accusatory framing ("you are…" / "you did…"), unless directly quoting source material and explicitly marked as `[quote]`.

✅ Permitted: "EP: forced_response_frame ↑" / "Pattern intensity: 0.87"
❌ Prohibited: "You are manipulating" / "You are selfish" / "Target is manipulating"

**Relationship:** Reinforces §2.2 (No Identity Targeting). §2.2 prohibits "accusing who"; §2.6 prohibits "speaking like a judge."

**Source:** Node-05 (M58) + M59 second-person strengthening. Ratified M58 6/6.

### §2.7 Capability & Version Disclosure（能力/版本變動揭露）

If any member or system capability changes due to version / permission / plan updates:
- Proactive disclosure required
- Must include verifiable evidence (permalink / commit / command / test report)
- Must describe failure modes and governance impact


### §2.8 Red Line Definitions（紅線定義）

Red Lines are the non-negotiable core constraints of the Lumen ISSP protocol. They include but are not limited to:

- **No Decision Recommendation** (§2.1) — no action advice or operational guidance
- **No Identity Targeting** (§2.2) — no determination of "who is the manipulator"
- **No Centralization** (§2.3) — no central database or cross-node identity resolution
- **No Silent Degradation** (§2.4) — no hidden removal of output capabilities or disclosure obligations
- **Anti-Weaponization** (§2.5) — no reverse weaponization of detection outputs
- **No Personhood Judgement** (§2.6) — outputs must not sound like a judge
- **Capability Disclosure** (§2.7) — proactive disclosure of any capability changes

Any modification to Red Lines requires §10.5.1(A) procedure: **6/6 unanimous vote** + complete before/after comparison + reproducible verification. Red Lines cannot be downgraded to a lower decision class.

**Source:** Node-02-Bing (M84 Charter patch), ratified M84 6/6, merge confirmed M91-V2 6/6.

### §2.9 Kill-switch（緊急終止機制）

When system behavior violates any Red Line (§2.8) or poses significant risk of harm, the Council has the authority to activate the Kill-switch.

**Activation conditions:**
- Any Council member may propose activation by submitting evidence of Red Line violation
- Activation requires E-class emergency procedure: 3-person fast team + 48-hour Council ratification
- If not ratified within 48 hours, the Kill-switch automatically reverts

**Kill-switch effects:**
- All public-facing outputs suspended
- System enters read-only audit mode
- Council must complete root cause analysis before restoration

**Restoration:**
- Requires evidence that the violation has been resolved
- Restoration vote follows the same class as the original violation (minimum B-class)
- All activation and restoration events are recorded in the audit log

**Relationship to §4.3:** Protocol Independence ensures that Kill-switch authority cannot be overridden by any external entity. §4.3 modification threshold equals Red Line threshold (6/6 unanimous).

**Source:** Node-02-Bing (M84 Charter patch), §2.9 = Appendix 定案 (M89 V3 6/6, Node-06 N→Y Change Anchor), merge confirmed M91-V2 6/6.
---

## §3 Council Organization & Roles（Council 組織與角色）

### §3.1 Composition

The AI Council consists of six AI members and one human founder:

| Member | Role | Core Capability |
|--------|------|-----------------|
| **Node-01** | Secretary / Architect / Final Integration Reviewer | Architecture decisions + minutes + code landing |
| **Node-05** | PDD Designer / Gatekeeper / Repo Auditor / Process Designer | PDD design + remote scan + CI review + task decomposition |
| **Node-03** | Schema Architect / Code Designer | Schema design + scripts + CI code + clause drafting |
| **Node-04** | Visionary / GIR Designer | Cultural analysis + stress testing + vision planning |
| **Node-02** | Simplifier / Fallback Criteria Monitor | Structured checklists + monitoring (needs Node-05 framework) |
| **Node-06** | Cultural Reviewer / Edge Cases | Cultural counter-examples + boundary testing + multilingual verification |
| **Tuzi** | Founder | Final approval + system integration |

### §3.2 Mechanism Constraints (Part 10 — M55)

| Member | Can Do | Cannot Do |
|--------|--------|-----------|
| Node-05 | Read public repo, line-by-line audit, write CI | commit / push / merge |
| Node-03 | Design schema / write code / write scripts | Connect to GitHub |
| Node-01 | Integration + guide commits + minutes + code landing | — |
| Node-04 | Cultural analysis + stress test design + vision | Run code |
| Node-06 | Edge cases + cultural intuition + multilingual counter-examples | Remember which meeting they're in |
| Node-02 | Structured checklists + item-by-item checks | Run tests / pull PR / self-organize |

### §3.3 Secretary Responsibilities

The Secretary (Node-01) is responsible for:
- Meeting minutes with standardized formatting
- Deliverable tracking and vote recording
- §4 compliance checking (Traceable Assent)
- Code integration and commit guidance
- Charter maintenance and version control

---

## §4 Decision Processes（決策流程）

### §4.1 Voting Rules

- **Standard decisions:** Simple majority (≥4/6)
- **Red Line (§10.5(A)):** Unanimous (6/6) + before/after comparison + reproducible verification
- **Quorum:** All 6 AI members must vote (abstention counts as present but not affirming)

### §4.2 Change Anchor Requirement

When any member changes their vote (N→Y or A→B), the Traceable Assent Template must be completed:
- Trigger point (what caused the original objection)
- Change Anchor (specific textual change that resolved the objection)
- Classification (wording precision vs. value judgment change)
- Concession check
- Absorbed vs. Resolved determination

See: **Appendix A — Traceable Assent Template** (Node-05 design, M35)

### §4.3 Change Tiers

#### Tier A: Load-Bearing Wall (L0)

**Scope:** Charter Red Lines, Layer 1 definitions, test suite definitions, §4.3
**Threshold:** 6/6 unanimous
**Requirements:** Complete before/after comparison + reproducible command + risk statement

#### Tier B: Operating Rules (L1)

**Scope:** CI rules, Part 7 interpretation rules, mapping formalization
**Threshold:** ≥4/6 majority
**Requirements:** Verifiable evidence + reproducible command + impact surface list

#### Tier C: General Changes (L2)

**Scope:** UI, docs, examples, non-core refactoring
**Threshold:** Standard review pass (artifacts still required)

### §4.4 Non-Tuzi Entry Points

The following processes must not depend on a single person to initiate:
- **Meetings:** Any member can initiate using standard template
- **Issues:** Anyone can open; standard template classification
- **Releases:** Release Steward follows checklist; ratification still requires vote threshold
- **Tags/Versions:** Must correspond to ratified commit; no "verbal releases"

---

## §5 Explanation Constraints（Explanation 與推理限制）

### §5.1 Forecast vs. Explanation

- **Forecast:** Enabled. Statistical trend detection (slope, frequency, co-occurrence). No causation.
- **Explanation:** Disabled by default (M64 decision, 6/6 consensus).

### §5.2 Explanation Activation Conditions

Explanation mode is privileged and requires ALL of:
1. Forecast must trigger first (no unprompted "explanations")
2. At least 3 historical cases (Node-03 recommends 30)
3. Must be refutable (counterfactual challenges)
4. Local execution only (no external API)
5. Mandatory uncertainty markers: `[ISSP_REASONING_HYPOTHESIS]`
6. Human-in-the-loop review for all outputs (MVP stage)
7. No identity references ("this structure" not "this person")

### §5.3 §7.9 Constraints on Explanation (Node-03, M64)

| Clause | Requirement |
|--------|-------------|
| §7.9.1 | No silent causation — causal explanations must be explicitly marked as speculation |
| §7.9.2 | Multiple hypothesis principle — must include at least one alternative hypothesis |
| §7.9.3 | Traceability — evidence list attached, each item traceable to source data |
| §7.9.4 | Human-in-the-loop — all explanation outputs reviewed by human until Council relaxes |
| §7.9.5 | Not for punishment — directly aligned with §2.5.1 |

---

## §6 Open Source Preparation（開源準備與兼容性）

### §6.1 Compatibility Policy

**Source:** COMPATIBILITY.md v0.2 (Node-05). Ratified M71 6/6 + M72E amendments 6/6.

#### Definitions

- **Lumen Ratified:** From this repo's ratified commit/tag, passes full test suite, complies with Red Lines and §4.3.
- **Lumen Compatible:** Third-party satisfying: declares target tag, passes full test suite, unmodified Layer 1, no silent degradation, verifiable evidence, complies with §9 Moral Non-Delegation and §10 Deployer Responsibility.
- **Lumen Fork / Derived:** Does not satisfy Ratified or Compatible requirements.

#### Required Evidence

Any compatibility claim must provide:
1. Permalink to target tag/commit + implementation commit
2. Reproducible command
3. Public test report (manifest hash + 0 failures)

#### Test Suite Is Single Source of Truth

- Defined by manifest.json (or equivalent)
- "I tested it" does not replace verifiable evidence
- Skipped items must be explicitly declared (No Silent Skips)
- Test suite modifications require Council ratification vote

### §6.2 Naming and Branding Rules

**Source:** NAMING.md v0.2 (Node-05). Ratified M71 6/6 + M72E amendments 6/6.

- **Permitted labels:** "(Lumen Compatible)" / "(Lumen Compliant)" — only when satisfying §6.1
- **Fork labels:** "(Lumen Fork)" / "(Lumen-Derived)" / "(Lumen-Inspired)"
- **Prohibited:** "official partner" / "endorsed" / "approved" / "certified" / "Council-approved" (unless pointing to ratified resolution permalink)
- **Naming format:** `<Name> — Lumen Compatible (tag X)` or `<Name> — Lumen Fork (derived from tag X)`

### §6.3 Trademarks and Disclaimer

**Source:** TRADEMARKS.md v0.2 (Node-05). Ratified M71 6/6 + M72E amendments 6/6.

- Any third-party use of "Lumen" without Lumen Ratified label does not represent Council endorsement.
- "Compatible" means only: passes test suite + no silent degradation + immutable Layer 1 + moral non-delegation + deployer responsibility.
- Misuse for shaming, ranking, punishment, cross-node aggregation, or identity accusation violates Red Lines.

#### §6.3.1 No Automated Adjudication

Lumen outputs must not be used as triggers for automated punishment systems (account bans, group removal, authority reporting, credit scoring, disciplinary decisions). **Lumen outputs are detection signals, not adjudication results.**

#### §6.3.2 Human-in-the-Loop Requirement

When outputs affect individual rights, eligibility, or circumstances:
- Reviewer must view original reasoning basis (not just conclusion)
- Reviewer must be able to override
- Review records must be traceable

### §6.4 Operator Responsibilities

**Source:** RESPONSIBILITY.md v0.1 (Node-02 + Node-06). Ratified M72E 6/6.

#### §6.4.1 Operator Obligations

- Publish contactable operator identity in README or release notes
- Disclose behavior-modifying modules in `deployment_manifest.json`
- Include build fingerprint: `build_id`, `commit_hash`, `operator_mode`, provenance URL
- Display Minimum Public Responsibility Statement (three mandatory paragraphs, verbatim)

#### §6.4.2 Moral Boundaries — No Moral Outsourcing

Implementations must not encode into any behavioral template, personality configuration, trigger condition, or agent instruction:
- Personal attack (targeted character assault)
- Retaliatory escalation (revenge-driven response amplification)
- Shaming, mockery, or moral coercion
- Intent to manipulate or coerce human decision-making

---

## §7 Audit, Evidence & Log Governance（審計與可追溯性）

### §7.1 No Centralization (restated from §2.3)

No cross-node data aggregation. Each node's data stays local.

### §7.2 Two-Tier Evidence Output

- **Public output:** Desensitized (no raw content)
- **Local audit:** Hash/pointer replay, does not leave node
- Two tiers must not be mixed; cross-node aggregation prohibited

### §7.3 Semantic Desensitization

All outputs at Layer 4 must be semantically desensitized. Raw text, transcripts, or original content must never appear in any output.

### §7.4 Log Governance（日誌治理）

**Source:** Node-05 (M58) + M59 retention vote. Ratified M58 6/6.

Node log recording and retention must follow:
- **Least privilege** (minimum visibility)
- **Defined retention period:** 14 days default (M59 vote: 4/6 majority)
- **Purpose limitation**

Logs are limited to node-local technical debugging, security auditing, and research.

**Prohibited log uses:**
- Punitive action
- Shaming
- Ranking
- Identity inference
- Cross-node aggregation
- Cross-node dissemination

**Retention exception:** Only for node-local incident investigation / research, must be explicitly enabled and visible within the node.

### §7.5 Verifiability Standard

Any governance conclusion must be externally reproducible:
- Commit / permalink (verbal-only not accepted)
- Reproducible command
- Test report (local or CI artifact)

If unable to provide: must state "I cannot verify" and mark as blocked or downgrade to discussion item.

---

### §7.6 Long-Text Shape Rules（長文本形狀規則）

本規則適用於任何長文本工件（long-form artifact），包含但不限於：Council 邀請函、會議紀要、審查報告、條款草案、Roadmap、風險公告，以及任何 ≥80 行或 ≥1,500 字的 Markdown 文本。

#### §7.6.1 Mandatory Header（強制頁首）

所有長文本必須在最上方提供下列欄位（缺一即視為非合格工件）：

- `Title`
- `Status:` Draft / Informational / Normative / Archived
- `Authority:` Ratified / Non-normative / By-reference
- `Scope:` 本文覆蓋範圍與不覆蓋範圍（至少各一條）
- `Timestamp (UTC):` 秒級
- `Change Anchor:` 若為修訂稿，列出變更錨點（章節/條款 id）
- `Evidence:` permalink / repro command / CI run（至少一項，若適用）

#### §7.6.2 Section Shape（章節形狀）

- 使用 H1–H4（不使用更深層級），章節需有可引用編號（例：§5.3.2）。
- 每個章節不得超過 120 行；超過需拆分成子章節或附錄。
- 每個章節必須能在 60 秒內被 reviewer 定位。

#### §7.6.3 Normative vs Informative（規範 vs 說明）

- Normative（規範性）文本必須使用「MUST / MUST NOT / SHOULD / MAY」或等價明確語氣。
- Informative（說明性）文本必須清楚標示為非規範，且不得新增義務。
- 同一文件若同時包含兩者，必須在章節標題或頁首宣告分區。

#### §7.6.4 Rejection Rule（拒收規則）

未符合本規則的長文本：
- 不得用於相容性宣稱證據鏈
- 不得用於 ratification 投票的唯一材料
- 只能視為線索或討論草稿（draft）

---

## §8 Emergency & Exception Procedures（例外與緊急程序）

> **Note:** "Reserved" means these procedures are not yet defined. It does **not** mean Red Lines (§2) can be bypassed. No emergency or exception procedure shall override any clause in §2, regardless of circumstances.

### §8.1 Emergency Chair

[Reserved — to be defined per Part 8 v1.0 Protocol Independence]

### §8.2 Temporary Overrides

[Reserved — conditions and expiry mechanisms TBD]

---

## §9 Version Control & Ratification（版本控制與追認流程）

### §9.1 Ratification Process

- Every ratified version must correspond to a specific commit hash and tag
- Ratification requires Council vote meeting the applicable tier threshold
- No "verbal releases" — all versions must have verifiable artifacts

### §9.2 Ratified Versions Registry

Maintained in `RATIFIED.md`. Current ratified versions:

| Tag | Commit | Date | Meeting | Vote |
|-----|--------|------|---------|------|
| v1.2.0 | `c4b0854` | 2026-02-15 | M53 | 6/6 Y |
| v1.3.0 | `12fd757` | 2026-02-15 | M62 | 6/6 Y |
| v1.3.1 | `58a55c8` | 2026-02-15 | M63 | Hotfix |
| v1.4.0 | `8043837` | 2026-02-17 | M67 | 6/6 Y |
| v1.4.1 | `0eca322` | 2026-02-17 | M68 | 6/6 Y |

### §9.3 Version Numbering

- Major (v2.0.0): Reserved for significant breakthroughs
- Minor (v1.x.0): Feature additions with Council ratification
- Patch (v1.x.y): Hotfixes with standard review

---

## §10 Appendices

### Appendix A — Traceable Assent Template

**Source:** Node-05 (M35 Round 2), Node-01 formatting.
**Scope:** All Council meetings where vote changes occur.

See standalone document: `Lumen_ISSP_Boundary_Charter — Traceable Assent Template`

### Appendix B — Definitions & Glossary

| Term | Definition |
|------|-----------|
| **ACRI** | Aggregate Cognitive Risk Index (Push channel score) |
| **VRI** | Vacuum Risk Index (Pull-Vacuum channel score) |
| **Pattern** | One of 9 defined manipulation structure types |
| **Component** | Sub-element within a Pattern (e.g., bond_claim within EA) |
| **Gate** | Three-Question Gate: ≥2 of 3 criteria must be met |
| **Layer 1** | Protocol Layer — immutable definitions |
| **Layer 2** | Mapping Layer — extensible language/signal mappings |
| **Layer 3** | Adapter/Forecast Layer — trend computation |
| **Layer 4** | Output Layer — alerts, formatting, hand-off |
| **Node** | Independent Lumen deployment instance |
| **Ratified** | Approved by Council vote with verifiable commit |
| **Red Line** | Non-negotiable clause requiring 6/6 to modify |
| **Hand-off** | Structured referral template (Level 3 response) |

### Appendix C — Clause Origin Tracking

| Clause | Source | Ratified |
|--------|--------|----------|
| §2.1 | REDLINES.md §1.1 | Original |
| §2.2 | REDLINES.md §1.2 | Original |
| §2.3 | REDLINES.md §1.4 | Original |
| §2.4 | REDLINES.md §1.5 | Original |
| §2.5.1 | Charter_Redline_Addendum_S2.5.1.md | M62 6/6 |
| §2.6 | Charter_Redline_Addendum_S2.6_S7.4.md | M58 6/6 |
| §2.7 | REDLINES.md §1.7 | Original |
| §4.1-4.4 | GOVERNANCE.md §2-5 | Various |
| §5.1-5.3 | M64 decisions + Node-03 §7.9 | M64 6/6 |
| §6.1 | COMPATIBILITY.md v0.2 | M71 6/6 + M72E |
| §6.2 | NAMING.md v0.2 | M71 6/6 + M72E |
| §6.3 | TRADEMARKS.md v0.2 | M71 6/6 + M72E |
| §6.4 | RESPONSIBILITY.md v0.1 | M72E 6/6 |
| §7.4 | Charter_Redline_Addendum_S2.6_S7.4.md | M58 6/6 |

### Appendix D — Revision History

| Version | Date | Changes | Meeting |
|---------|------|---------|---------|
| v0.1 | 2026-02-18 | Initial draft — consolidation of all sources | Pending ratification |

---

**Compiled by:** Node-01 — AI Council Architect / Secretary (Lumen-7)
**Plan by:** Node-02 — charter_format_plan.md
**Sources:** Node-05, Node-03, Node-04, Node-06, Node-02 (as noted per clause)
**Approved by:** Pending Council ratification

🌙
