#!/usr/bin/env bash
# 공유 git 가드 스크립트. blog 레포와 ~/blog-research 양쪽에서 호출한다.
# haiku(git-shipper) 서브에이전트는 직접 git 명령을 쓰지 말고 이 스크립트만 호출한다.
#
# 사용법:
#   scripts/git-commit-push.sh --repo <path> --branch <expected> --message <msg> [--dry-run] [--force-allow] -- <path...>
#
# 가드: 지정 경로만 add(전체 add 금지) · 기대 브랜치 확인 · staged secret/대용량 검사 ·
#       pull --rebase(실패 시 중단) · push(--force 금지) · 실패 시 비0 종료(자동 롤백 안 함, 상태만 보고)
set -euo pipefail

REPO="" BRANCH="" MSG="" DRYRUN=0
PATHS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo) REPO="$2"; shift 2 ;;
    --branch) BRANCH="$2"; shift 2 ;;
    --message) MSG="$2"; shift 2 ;;
    --dry-run) DRYRUN=1; shift ;;
    --) shift; PATHS=("$@"); break ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

[[ -n "$REPO" ]] || { echo "missing --repo" >&2; exit 1; }
[[ -n "$BRANCH" ]] || { echo "missing --branch (expected branch name)" >&2; exit 1; }
[[ -n "$MSG" ]] || { echo "missing --message" >&2; exit 1; }
[[ ${#PATHS[@]} -gt 0 ]] || { echo "missing -- <paths to commit>" >&2; exit 1; }

cd "$REPO"
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "not a git repo: $REPO" >&2; exit 1; }

CUR_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CUR_BRANCH" != "$BRANCH" ]]; then
  echo "branch mismatch: on '$CUR_BRANCH', expected '$BRANCH'. 중단(브랜치 안전장치)." >&2
  exit 2
fi

# 지정 경로만 스테이징 (전체 add 금지)
git reset -q
for p in "${PATHS[@]}"; do
  if [[ ! -e "$p" ]]; then echo "path not found: $p" >&2; exit 1; fi
  git add -- "$p"
done

if git diff --cached --quiet; then
  echo "no staged changes — nothing to commit. (skip)"
  exit 0
fi

STAGED="$(git diff --cached --name-only)"
echo "staged files:"; echo "$STAGED" | sed 's/^/  - /'

# 대용량 파일 검사 (>10MB)
while IFS= read -r f; do
  [[ -f "$f" ]] || continue
  sz=$(wc -c <"$f" | tr -d ' ')
  if (( sz > 10485760 )); then
    echo "large file (>10MB) staged: $f ($sz bytes). 중단." >&2; exit 3
  fi
done <<< "$STAGED"

# secret 패턴 검사 (staged 추가분만)
if git diff --cached -U0 | grep -nE \
  'BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY|AKIA[0-9A-Z]{16}|(api[_-]?key|secret|token|password)["'"'"' ]*[:=]["'"'"' ]*[A-Za-z0-9/+_-]{16,}|sk-[A-Za-z0-9]{20,}' \
  >/tmp/_secret_hits 2>/dev/null; then
  echo "잠재적 secret이 staged diff에 감지됨. 중단(수동 확인 필요):" >&2
  cat /tmp/_secret_hits >&2
  exit 4
fi

if [[ $DRYRUN -eq 1 ]]; then
  echo "[dry-run] would commit on '$BRANCH' with message:"; echo "    $MSG"
  echo "[dry-run] would: git pull --rebase && git push (no --force). 실제 변경 없음."
  git reset -q
  exit 0
fi

# 커밋
git commit -q -m "$MSG" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
echo "committed: $(git rev-parse --short HEAD)"

# 원격 동기화 후 push (force 금지)
if git remote get-url origin >/dev/null 2>&1; then
  if ! git pull --rebase origin "$BRANCH"; then
    echo "git pull --rebase 실패(충돌 가능). push 중단. 수동 해결 필요." >&2
    exit 5
  fi
  if ! git push origin "$BRANCH"; then
    echo "git push 실패(auth/branch-protection/네트워크 등). 상태 확인 필요." >&2
    exit 6
  fi
  echo "pushed to origin/$BRANCH"
else
  echo "no 'origin' remote — committed locally only."
fi
