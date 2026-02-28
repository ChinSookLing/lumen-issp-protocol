/**
 * Feedback Pipeline Stub — Step 21A
 * M94 DoD-48h-3
 * 
 * 只收結構化回饋（confirm / dismiss / FP / FN）
 * 不收原文、不做身份關聯（M94-V4 Node-05 附加條件，對齊 SPEG）
 */

/**
 * POST /api/feedback/confirm
 * User confirms detection was correct.
 */
function handleConfirm(chatId, detectionId) {
  // TODO: Append to feedback.json artifact
  return { status: 'confirmed', detectionId };
}

/**
 * POST /api/feedback/dismiss
 * User dismisses detection (false positive).
 * 
 * // B3 safety override: if Tuzi human safety flag, auto-dismiss
 * // 人身安全 > 協議 — Operation Card Step 5 對齊
 * // Node-06 co-review amendment #3
 */
function handleDismiss(chatId, detectionId) {
  // TODO: Append to feedback.json artifact
  // TODO: Check B3 safety flag → auto-dismiss if human safety concern
  return { status: 'dismissed', detectionId };
}

/**
 * POST /api/feedback/fp
 * User reports false positive for L2b fixture generation.
 */
function handleFalsePositive(chatId, detectionId, flagId) {
  // TODO: Append to feedback.json artifact
  // TODO: Sprint 13 — auto-generate L2b fixture (M94-V4 Node-04 Feedback Loop)
  return { status: 'fp_reported', detectionId, flagId };
}

module.exports = { handleConfirm, handleDismiss, handleFalsePositive };
