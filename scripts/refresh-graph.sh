#!/usr/bin/env bash
#
# graphify 지식그래프 갱신 — 연관 글·/graph 데이터의 단일 진입점 (KAN-045).
#
# 왜 스크립트인가: graphify 0.9.4 의 증분 추출 상태는 `graphify-out/cache/semantic/`
# 하나뿐인데, 이 레포처럼 스캔 루트(src/content/posts/)와 --out 루트(레포 루트)가
# 다르면 graphify 자신은 그 캐시를 한 건도 못 쓴다(자세한 근거는
# scripts/seed-graph-cache.py 헤더). 그래서 추출 직후 캐시를 직접 심어야 하고,
# 그 단계를 빼먹으면 조용히 전량 재추출로 되돌아간다 — 24편 기준 1.26M in /
# 280k out / 40~60분. 실패가 에러가 아니라 "그냥 느림"으로 나타나기 때문에,
# 증분이 살아있는지는 사람이 아니라 이 스크립트와 verify-graph.ts 가 봐야 한다.
#
# 사용: bun run graph:refresh            (main 워크트리에서)
#       ALLOW_GRAPH_REFRESH_NON_MAIN=1 bun run graph:refresh   (예외 실행)
#
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

GRAPHIFY_PINNED_VERSION="0.9.4"

# ── 가드 ① main 워크트리 전용 ────────────────────────────────────────────────
# 그래프 산출물(1MB graph.json + 캐시)은 커밋 대상이라, 병렬 워크트리가 각자
# 갱신하면 머지 때 대용량 JSON 다중 충돌이 난다. 게다가 각 워크트리에는 자기
# 편만 있어 만들어진 그래프가 형제 편 머지 즉시 stale 이다(KAN-044 근거 ②③).
# 문서 규약만으로는 못 막으므로 여기서 실행 자체를 막는다.
if [[ "${ALLOW_GRAPH_REFRESH_NON_MAIN:-0}" != "1" ]]; then
  branch="$(git rev-parse --abbrev-ref HEAD)"
  if [[ "$branch" != "main" ]]; then
    echo "✗ 그래프 갱신은 main 에서만 한다 (현재: $branch)" >&2
    echo "  발행은 워크트리에서 하고, 그래프는 main 머지 후 여기서 한 번 돌린다." >&2
    echo "  정말 필요하면: ALLOW_GRAPH_REFRESH_NON_MAIN=1 bun run graph:refresh" >&2
    exit 1
  fi
  # 링크된 워크트리에서는 --git-dir 이 .git/worktrees/<name> 을 가리킨다.
  if [[ "$(git rev-parse --git-dir)" != "$(git rev-parse --git-common-dir)" ]]; then
    echo "✗ 링크된 워크트리에서는 실행하지 않는다 — 메인 체크아웃에서 돌려라." >&2
    exit 1
  fi
fi

# ── 가드 ② graphify 버전 고정 ────────────────────────────────────────────────
# manifest/cache 포맷은 문서화된 계약이 아니라 내부 구현이다. 상위 버전에서
# 스키마가 바뀌면 증분이 조용히 깨져 전량 재추출로 되돌아간다 — 그때 이 가드가
# 걸리면 실물 스키마를 다시 확인하고 verify-graph.ts ④ 를 맞춘 뒤 핀을 올린다.
version_line="$(graphify --version 2>&1 | head -1)"
if [[ "$version_line" != *"$GRAPHIFY_PINNED_VERSION"* ]]; then
  echo "✗ graphify $GRAPHIFY_PINNED_VERSION 검증본이 아니다: $version_line" >&2
  echo "  캐시 스키마와 save_semantic_cache/check_semantic_cache 의 root 취급을 재확인하고," >&2
  echo "  scripts/seed-graph-cache.py 를 맞춘 뒤 GRAPHIFY_PINNED_VERSION 을 올려라." >&2
  exit 1
fi

# seed-graph-cache.py 는 graphify 패키지를 import 해야 한다 — CLI 가 uv tool 로
# 깔려 있어 시스템 python3 에는 없다. CLI 의 shebang 에서 인터프리터를 뽑아 쓴다.
GRAPHIFY_PYTHON="${GRAPHIFY_PYTHON:-$(head -1 "$(command -v graphify)" | sed 's|^#!||')}"
if [[ ! -x "$GRAPHIFY_PYTHON" ]]; then
  echo "✗ graphify 의 python 인터프리터를 못 찾았다: $GRAPHIFY_PYTHON" >&2
  echo "  GRAPHIFY_PYTHON=<경로> 로 직접 지정해라." >&2
  exit 1
fi

# ── 가드 ③ 증분 기준선(캐시) 존재 여부 ───────────────────────────────────────
cache_entries=$(find graphify-out/cache/semantic -maxdepth 1 -name '*.json' 2>/dev/null | wc -l | tr -d ' ')
if [[ "$cache_entries" == "0" ]]; then
  echo "⚠ 시맨틱 캐시가 비어 있다 — 이번 실행은 전량 추출(콜드 부트스트랩)이다."
  echo "  끝나면 graphify-out/cache/semantic/ 을 반드시 함께 커밋해라. 이게 증분의 전부다."
else
  echo "▶ 시맨틱 캐시 ${cache_entries}건 — 바뀐 글만 LLM 을 탄다."
fi

# manifest.json 은 두지 않는다. graphify 는 문서 코퍼스에서 이 파일을 항상 `{}` 로
# 쓰는데(경로 비교 버그, seed-graph-cache.py 헤더 참고), 빈 채로 존재하기만 해도
# incremental_mode 가 켜져 build_merge 경로를 타고, 그러면 삭제 감지가 안 돼
# 지운 글의 노드가 그래프에 영원히 남는다. 파일이 없으면 매 실행 캐시에서 온전히
# 재구성돼 삭제가 자연히 반영된다.
rm -f graphify-out/manifest.json

mkdir -p graphify-out/logs
LOG="graphify-out/logs/extract-$(date +%Y%m%dT%H%M%S).log"

echo "▶ 로그: $LOG"

# ── ① 추출 ───────────────────────────────────────────────────────────────────
# 전량 스캔이지만 LLM 은 캐시 미적중분만 탄다 — check_semantic_cache() 가 콘텐츠
# 해시로 걸러낸 뒤에야 청크를 만든다. 로그의
#   "semantic cache: N hit / M miss"
# 에서 N 이 (전체 글 - 바뀐 글) 이면 정상이다.
# --out . 은 필수 — 빼면 src/content/posts/ 안에 써서 콘텐츠를 오염시킨다.
graphify extract src/content/posts/ \
  --backend claude-cli --mode deep --token-budget 15000 --out . 2>&1 | tee "$LOG"

# ── ①-b 캐시 심기 (증분의 핵심) ──────────────────────────────────────────────
# graphify 자신은 이 레포 레이아웃에서 캐시를 못 쓴다. 이 단계를 빼면 다음 실행이
# 전량 재추출로 되돌아간다. 스크립트가 자체 검증까지 하고 비0으로 끝날 수 있다.
"$GRAPHIFY_PYTHON" scripts/seed-graph-cache.py --scan src/content/posts --root . 2>&1 | tee -a "$LOG"

# ── ② 커뮤니티 라벨 정합 ─────────────────────────────────────────────────────
# extract 는 to_json 에 community_labels 를 넘기지 않아 graph.json 에서
# community_name 이 통째로 빠진다. 또 재클러스터링으로 커뮤니티 번호가 섞이면
# .graphify_labels.json 이 엉뚱한 커뮤니티에 붙는다.
# label 은 remap_communities_to_previous 로 기존 라벨을 노드 오버랩 기준 재부착하고,
# --missing-only 로 라벨 없는 커뮤니티만 LLM 입력에 넣는다(신규 0개면 LLM 0콜).
graphify label . --missing-only --no-viz --backend claude-cli 2>&1 | tee -a "$LOG"

# ── ③ 증류 → ④ 판정 ─────────────────────────────────────────────────────────
bun scripts/build-graph-data.ts
bun scripts/verify-graph.ts --log "$LOG"

cat <<'EOS'

✓ 갱신 완료. 커밋 경로:
    graphify-out/          (cache/ast · stat-index.json · graph.html · logs 는 .gitignore)
    src/data/graph.json

  폐기해야 한다면 자동 롤백하지 말고 먼저 확인해라 — 손수정이 섞여 있으면 날아간다:
    git diff --name-only graphify-out/ src/data/graph.json
    git checkout -- graphify-out/ src/data/graph.json
EOS
