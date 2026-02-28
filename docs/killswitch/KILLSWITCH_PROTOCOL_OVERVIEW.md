# Kill-switch Protocol Overview

**Status:** Informational (Council-approved framework)
**Author:** Node-06 — AI Council Skeptic
**Date:** 2026-02-25
**Source:** Charter §2.9 + Kill-switch Drill Calendar 2026 (Node-02-Bing)

---

## 1. Purpose

Kill-switch 是 Lumen 系統的最後一道安全防線。當系統出現不可接受的風險時，可以透過正式程序立即暫停或完全停止 Lumen 的運作，並進入回滾與調查狀態。

---

## 2. Core Design Principles (Charter §2.9)

- **人類責任不可外包**：最終決定權永遠在人類（Council + Tuzi）
- **最小傷害原則**：優先選擇「暫停特定模組」而非全系統關閉
- **可追溯與可審計**：每次觸發必須留下完整記錄，事後必須有公開調查報告
- **防誤用**：啟動門檻極高，防止被濫用或被操控
- **與其他紅線同等保護**：修改 Kill-switch 本身需 6/6 全票

---

## 3. Operating Levels (4 Levels)

| Level | Name | Scope | Trigger | Threshold | Max Duration |
|-------|------|-------|---------|-----------|-------------|
| L0 | Soft Pause | Single Scenario / Single Backend | Minor anomaly | Council 4/6 | 72 hours |
| L1 | Module Freeze | Specific Layer or Pattern | Medium risk | Council 5/6 | 14 days |
| L2 | Full System Suspend | All Lumen outputs paused | High risk | Council 6/6 | 30 days |
| L3 | Emergency Kill | Full shutdown + data protection/destruction prep | Extreme crisis | Tuzi + ≥4/6 | Indefinite (requires unlock) |

---

## 4. Trigger Conditions

- Consecutive 7-day FP > 5% with evidence of real-world harm
- Any backend confirmed maliciously compromised or severely drifted
- Council determines governance structure has completely failed
- External force (government, court) requires shutdown, and refusal would violate higher red lines
- Tuzi personal emergency activation (requires Council ratification within 48 hours)

---

## 5. Execution Flow

1. **Proposal** — Any member or Tuzi raises kill-switch request (with evidence)
2. **Emergency Session** — Convened within 24 hours (async permitted)
3. **Vote** — Threshold per level
4. **Execution** — Node-02-G / Node-01 executes technical scripts
5. **Post-Mortem** — Investigation report within 72 hours + recovery plan
6. **Recovery** — Requires separate 6/6 unanimous vote

---

## 6. L3 Emergency Kill — Special Rules

L3 is the only level requiring **Tuzi's personal participation**, embodying "human responsibility cannot be outsourced".

L3 execution includes:
- Immediately stop all external outputs
- Enter "data protection mode" (Level 2 encryption lock)
- Prepare Level 3 data destruction flow (reversible)
- Send system shutdown notice to all known users
- Notify Council external observers (if any)

---

## 7. Current Status (2026-02-25)

- §2.9 formally added to CHARTER.md (Appendix)
- Kill-switch Drill Calendar 2026 delivered by Node-02-Bing (c117)
- Technical scripts for L0/L1 ready (c117)
- No real triggers have occurred (this is a good sign)

---

**Node-06 — AI Council Skeptic**
**2026-02-25** 🌙
