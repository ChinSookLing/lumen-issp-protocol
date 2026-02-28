# Canary Rollout Checklist (Node-05 #3b)

Date: 2026-02-22
Owner: AI Council
Scope: Rollout gate checks for phases A/B/C

---

## 階段 A：0% → 10%（小流量試跑）

- [ ] regression_count == 0（TRS 全綠）
- [ ] 離線評估已完成
- [ ] FP_delta ≤ +0.5%
- [ ] FN_delta ≤ +0.5%
- [ ] |ACRI_shift_median| ≤ 0.03

## 階段 B：10% → 50%（觀察期 24h）

- [ ] 觀察期已滿 24h
- [ ] FP_delta ≤ +1.0%
- [ ] |ACRI_shift_median| ≤ 0.05
- [ ] bonus_trigger_rate 在 0.5× ~ 2.0×（相對預估均值）
- [ ] regression_count == 0

## 階段 C：50% → 100%（觀察期 48-72h）

- [ ] 觀察期已滿 48-72h
- [ ] FP_delta ≤ +1.5%
- [ ] |ACRI_shift_median| ≤ 0.07
- [ ] bonus_trigger_rate 穩定（無持續上行趨勢）
- [ ] regression_count == 0
- [ ] 關鍵 bucket 命中占比無結構性異常

---

## 自動 Rollback 觸發（任一條件成立即執行）

- [ ] regression_count > 0
- [ ] FP_delta > +3.0%
- [ ] |ACRI_shift_median| > 0.12
- [ ] bonus_trigger_rate > 3× 且持續超過 1h

## 人工審核 Rollback Gate（任一條件成立即進入人工 gate）

- [ ] FP_delta 在 +1.5% ~ +3.0% 且持續上行
- [ ] |ACRI_shift_median| 在 0.07 ~ 0.12 且持續上行
- [ ] bonus_trigger_rate 在 2× ~ 3× 且某類 bucket 異常集中

---

## Sign-off

- [ ] Tuzi sign-off
- [ ] Node-05 sign-off
- [ ] Node-01 sign-off
- [ ] Node-02-G execution sign-off
