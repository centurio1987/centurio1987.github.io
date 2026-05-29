#!/usr/bin/env bash
#
# cleanup-legacy.sh
# VitePress + 이력서/포트폴리오 잔재를 제거하고 Astro 구조만 남긴다.
# 반드시 astro-migration 브랜치에서 실행할 것. 실행 후 `git status`로 확인하고 커밋한다.
#
# 사용법:
#   bash cleanup-legacy.sh           # 확실한 삭제만 수행
#   bash cleanup-legacy.sh --all     # 선택 삭제(Obsidian/에디터 설정 등)까지 함께 수행
#
set -euo pipefail

cd "$(dirname "$0")"

if [ "$(git rev-parse --abbrev-ref HEAD)" != "astro-migration" ]; then
  echo "⚠️  현재 브랜치가 astro-migration이 아닙니다. 중단합니다."
  echo "    git checkout astro-migration  후 다시 실행하세요."
  exit 1
fi

echo "▶ 확실한 삭제 대상 (VitePress + 이력서/포트폴리오)"

# --- VitePress 코어 ---
DEFINITE=(
  ".vitepress"
  "index.ts"
  "bun.lock"
)

# --- 구 사이트 페이지/컴포넌트/콘텐츠 (docs/) ---
# IDEAS.md는 이미 raws/로 이전됨. 나머지 구 콘텐츠는 폐기.
DEFINITE+=(
  "docs/api-examples.md"
  "docs/markdown-examples.md"
  "docs/index.md"
  "docs/resume.md"
  "docs/resume2.md"
  "docs/resume2-markdown.md"
  "docs/value.md"
  "docs/journey.md"
  "docs/portfolio"
  "docs/components"
  "docs/posts"
  "docs/draft"
  "docs/assets"
  "docs/public"
  "docs/김윤덕_통합_포트폴리오.docx"
  "docs/김윤덕_통합_포트폴리오.md"
)

for p in "${DEFINITE[@]}"; do
  if [ -e "$p" ]; then
    echo "  삭제: $p"
    rm -rf -- "$p"
  fi
done

# --- 선택 삭제 (--all 플래그) ---
# Obsidian/makemd 볼트 설정과 에디터 잔재. 노트 환경을 유지하려면 그대로 두세요.
if [ "${1:-}" = "--all" ]; then
  echo "▶ 선택 삭제 대상 (Obsidian/에디터 설정 등)"
  OPTIONAL=(
    "docs/.obsidian"
    "docs/.makemd"
    "docs/.DS_Store"
    ".obsidian"
    ".makemd"
    ".space"
    ".trash"
    "copilot"
    ".DS_Store"
  )
  for p in "${OPTIONAL[@]}"; do
    if [ -e "$p" ]; then
      echo "  삭제: $p"
      rm -rf -- "$p"
    fi
  done
  # docs/ 가 비었으면 디렉터리째 제거
  if [ -d "docs" ] && [ -z "$(ls -A docs 2>/dev/null)" ]; then
    echo "  삭제: docs (빈 디렉터리)"
    rmdir docs
  fi
fi

echo "▶ git에 삭제 반영 (staging)"
git add -A

echo
echo "✅ 완료. 아래로 확인 후 커밋하세요:"
echo "    git status"
echo "    git commit -m \"chore: remove VitePress + resume/portfolio legacy\""
echo
echo "ℹ️  --all 없이 실행했다면 docs/.obsidian 등 노트/에디터 설정은 보존됩니다."
echo "    완전히 비우려면:  bash cleanup-legacy.sh --all"
