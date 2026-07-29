#!/usr/bin/env bash
#
# 그래프 스탬프 기록 — "이 글 내용은 이미 그래프에 반영됐다"고 표시한다 (KAN-056).
#
# 왜 필요한가: 손으로 `graph:refresh` 를 돌린 직후 그 글들을 커밋하면, post-commit
# 훅이 "스탬프가 없다 → stale 이다"라고 보고 방금 끝난 갱신을 한 번 더 돌린다.
# 캐시가 warm 이라 LLM 은 안 타지만 재클러스터링으로 불필요한 커밋이 하나 난다.
#
# 왜 HEAD 트리를 그냥 안 쓰나: graphify 는 **워킹트리**를 읽는데 게이트의 staleness
# 는 `HEAD:src/content/posts` 를 본다. 갱신 시점에 글이 아직 커밋 전이면 둘이 다르다.
# 그래서 여기서는 **워킹트리 글이 커밋됐을 때 갖게 될 트리 해시**를 임시 인덱스로
# 미리 계산해 적는다 — 진짜 인덱스는 건드리지 않는다. 그러면 그 글들을 커밋하는
# 순간 게이트의 HEAD 트리와 정확히 일치해 중복 실행이 사라진다.
#
# 사용: bun run graph:stamp            (수동 갱신 후 커밋 전에 한 번)
#       graph:refresh 가 끝에서 자동 호출한다.
#
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

POSTS_PATH="src/content/posts"
STATE_DIR="graphify-out/.autorefresh"
STAMP="$STATE_DIR/graphed-posts-tree"
FAILED="$STATE_DIR/failed-posts-tree"

tmpidx="$(mktemp -u -t graphify-stamp-index)"
trap 'rm -f "$tmpidx"' EXIT

GIT_INDEX_FILE="$tmpidx" git read-tree HEAD
GIT_INDEX_FILE="$tmpidx" git add -A -- "$POSTS_PATH"
root_tree="$(GIT_INDEX_FILE="$tmpidx" git write-tree)"

if ! posts_tree="$(git rev-parse "$root_tree:$POSTS_PATH" 2>/dev/null)"; then
  echo "✗ $POSTS_PATH 트리를 계산하지 못했다 — 스탬프를 남기지 않는다." >&2
  exit 1
fi

mkdir -p "$STATE_DIR"
printf '%s' "$posts_tree" >"$STAMP"
rm -f "$FAILED"

echo "✓ 그래프 스탬프: ${posts_tree:0:12} (현재 워킹트리 글 기준)"
echo "  이 글들을 커밋해도 훅이 중복 갱신을 돌리지 않는다."
