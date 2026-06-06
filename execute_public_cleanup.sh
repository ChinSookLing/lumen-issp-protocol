#!/usr/bin/env bash
# =============================================================================
# Lumen PUBLIC repo 清理 — 移除内部文档 (基于 PUBLIC_REPO_SCAN.md · Lumen-186)
# -----------------------------------------------------------------------------
# 目标 repo: ChinSookLing/lumen-issp-protocol  (PUBLIC)
# 用 git rm(不归档)—— 内容在 private repo (npm-init-lumen-protocol) 都有,不会丢。
#
# ⚠️ 安全闸: 脚本会先确认当前 repo 确实是 lumen-issp-protocol,
#            防止误在 private repo 运行而删错文件。
#
# 在「已 clone 且可 push 的 lumen-issp-protocol」根目录运行:
#   bash execute_public_cleanup.sh            # push 前确认
#   AUTO_PUSH=1 bash execute_public_cleanup.sh
# =============================================================================
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"; cd "$ROOT"
echo ">> repo: $ROOT"

# --- 安全闸 1: 必须是 lumen-issp-protocol(防止跑错 repo) ---
ORIGIN="$(git remote get-url origin 2>/dev/null || echo '')"
echo ">> origin: $ORIGIN"
if ! echo "$ORIGIN" | grep -qi "lumen-issp-protocol"; then
  echo "!! 当前 repo 的 origin 不含 'lumen-issp-protocol'。"
  echo "!! 本脚本只能在 PUBLIC repo lumen-issp-protocol 运行。已中止。"
  exit 1
fi
if echo "$ORIGIN" | grep -qi "npm-init-lumen-protocol"; then
  echo "!! 检测到 private repo (npm-init-lumen-protocol),严禁在此运行。已中止。"; exit 1
fi

# --- 安全闸 2: 工作区干净 ---
if [ -n "$(git status --porcelain)" ]; then
  echo "!! 工作区不干净。请先 commit 或 stash 再跑。"; exit 1
fi

# --- helper: 存在才删,幂等且不因缺文件报错 ---
rm_path() {
  local p="$1"
  if git ls-files --error-unmatch "$p" >/dev/null 2>&1 || [ -e "$p" ]; then
    git rm -r --quiet "$p"
    echo "   removed: $p"
  else
    echo "   skip (不存在): $p"
  fi
}

echo
echo ">> 🔴 移除内部决策/审计/治理草稿:"
rm_path "docs/reports"
rm_path "docs/governance/DECISION_MEMO_v1.0.md"
rm_path "docs/governance/DECISION_MEMO_v1.1.md"
rm_path "docs/governance/ESCALATION_REPORTING_POLICY.md"
rm_path "docs/governance/SPEG"

echo
echo ">> 🟠 移除敏感(防御/反武器化/治理风险)文档:"
rm_path "docs/design-notes/EXPLANATION_BANNED_PATTERNS_v0.1.md"
rm_path "docs/design-notes/explanation_safe_mode_matrix.md"
rm_path "docs/dimensions/1-backend-risk/BACKEND_INTEGRITY_HARDENING_v0.1.md"
rm_path "docs/dimensions/1-backend-risk/VENDOR_DRIFT_HARDENING_v0.1.md"
rm_path "docs/dimensions/1-backend-risk/HIP_C1_DEFENSE.md"
rm_path "docs/dimensions/5-governance-risk"

echo
echo ">> 即将提交(待删清单):"
git status --short
echo

COMMIT_MSG="chore: remove internal docs from public repo · Lumen-186"
git commit -m "$COMMIT_MSG"

if [ "${AUTO_PUSH:-0}" = "1" ]; then
  git push
else
  read -r -p ">> 已 commit。现在 push 到 PUBLIC 远端? [y/N] " ans
  case "$ans" in
    y|Y) git push ;;
    *) echo "   已跳过 push (commit 在本地;需要时手动 git push)。"; exit 0 ;;
  esac
fi

echo; echo ">> 完成。最近 commit:"; git --no-pager log -1 --stat
echo
echo ">> 提醒: git rm 只从最新 commit 移除文件;历史 commit 仍含旧内容。"
echo ">>       若需彻底从 git 历史清除(敏感内容),另需 git filter-repo / BFG,且要 force-push。"
