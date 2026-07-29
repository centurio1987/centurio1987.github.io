#!/usr/bin/env bash
#
# graphify 그래프 자동 갱신 — git 훅이 부르는 게이트키퍼 겸 백그라운드 워커 (KAN-056).
#
# 왜 훅인가: `refresh-graph.sh` 전체가 판단이 필요 없는 결정론적 절차다(가드 → 추출
# → 캐시 심기 → 라벨 → 증류 → verify 판정). 그런데 에이전트가 이걸 대신 치면 10~40분
# 짜리 실행 로그가 메인 컨텍스트로 통째로 흘러들어오고, 세션이 그동안 묶인다.
# 판단이 0인 절차에 그 비용을 낼 이유가 없다.
#
# 훅이 줄이지 **못하는** 것: graphify 추출 자체는 LLM 작업이다(`--backend claude-cli`
# 가 청크마다 `claude -p` 를 띄운다 — 5편 증분에 472k in / 108k out). 이 비용은 훅이
# 아니라 시맨틱 캐시가 줄인다. 훅이 없애는 건 **오케스트레이터의 컨텍스트 오염과
# 세션 점유, 그리고 사람이 까먹는 실행 누락**이다.
#
# **예약제다 (KAN-056 개정).** 커밋마다 도는 방식은 예외가 너무 많았다 — 집필 중
# 커밋, 오타 수정, 프론트매터 손질까지 전부 갱신을 부르는데 정작 그래프가 의미 있게
# 바뀌는 시점은 **시리즈 집필이 끝났을 때**다. 그건 파일 변화만으로는 판정할 수
# 없다("EP7 이 마지막 편인가"는 판단이다). 그래서 **감지와 실행을 분리**했다:
#   감지 → 사람/에이전트가 `bun run graph:request "<사유>"` 로 예약을 남긴다.
#   실행 → 예약이 있을 때만, 다음 커밋·머지에서 훅이 한 번 돌고 예약을 지운다.
# 예약이 없으면 `.githooks/post-merge`·`post-commit` 은 조용히 아무것도 안 한다.
#
# 두 가지 모드:
#   --check  (기본) 게이트키퍼. 갱신이 필요한지 싸게 판정하고, 필요하면 워커를
#            detach 해서 즉시 돌아온다. git 이 훅을 기다리며 멈추지 않는다.
#   --run    워커. 실제로 refresh-graph.sh 를 돌리고 verify 통과 시 커밋한다.
#            **push 는 하지 않는다** — 배포는 사람의 판단이다.
#
# 끄려면: GRAPH_AUTOREFRESH_DISABLE=1 (환경변수, 훅 전체 무력화)
#
set -euo pipefail

# git 훅은 GUI 클라이언트나 최소 환경에서 짧은 PATH 로 뜰 수 있다. graphify(uv tool)
# 와 bun 은 로그인 셸에만 있는 경로에 산다 — 여기서 직접 보강한다.
export PATH="$HOME/.bun/bin:$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

REPO="$(git rev-parse --show-toplevel)"
cd "$REPO"

SELF="$REPO/scripts/graph-autorefresh.sh"
STATE_DIR="graphify-out/.autorefresh"
PENDING="$STATE_DIR/pending"            # 갱신 예약 — 이게 없으면 훅은 아무것도 하지 않는다
STAMP="$STATE_DIR/graphed-posts-tree"   # 마지막으로 성공적으로 그래프에 반영된 posts 트리
FAILED="$STATE_DIR/failed-posts-tree"   # 실패한 입력 — 같은 입력으로 무한 재시도하지 않기 위해
LOCK="$STATE_DIR/lock"
STATUS="$STATE_DIR/status"
POSTS_PATH="src/content/posts"
GRAPH_PATHS=(graphify-out src/data/graph.json)

log() { printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$*"; }
notify() {
  osascript -e "display notification \"${2//\"/}\" with title \"${1//\"/}\"" >/dev/null 2>&1 || true
}
posts_tree() { git rev-parse "HEAD:$POSTS_PATH" 2>/dev/null || true; }
graph_dirty() { [[ -n "$(git status --porcelain -- "${GRAPH_PATHS[@]}")" ]]; }

mode="${1:---check}"

# ─────────────────────────────────────────────────────────────────────────────
# 게이트키퍼 — git 훅이 부르는 쪽. 싸고, 조용하고, 절대 git 을 실패시키지 않는다.
# ─────────────────────────────────────────────────────────────────────────────
if [[ "$mode" == "--check" ]]; then
  # ① 끄기 스위치
  [[ "${GRAPH_AUTOREFRESH_DISABLE:-0}" == "1" ]] && exit 0

  # ② 재진입 차단. 워커가 그래프를 커밋하면 post-commit 이 다시 뜬다.
  #    (아래 ⑥ staleness 로도 걸리지만, 의도를 명시적으로 남긴다.)
  [[ "${GRAPH_AUTOREFRESH:-0}" == "1" ]] && exit 0

  # ③ main 워크트리 전용 — refresh-graph.sh 의 가드와 같은 이유다.
  #    산출물이 커밋 대상이라 병렬 워크트리가 각자 갱신하면 1MB JSON 이 다중
  #    충돌하고, 각 워크트리엔 자기 편만 있어 만든 그래프가 즉시 stale 이 된다.
  [[ "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)" == "main" ]] || exit 0
  [[ "$(git rev-parse --git-dir)" == "$(git rev-parse --git-common-dir)" ]] || exit 0

  # ④ 예약 마커 — 없으면 아무리 커밋이 쌓여도 돌지 않는다.
  #    커밋마다 도는 방식은 예외가 너무 많았다(집필 중 커밋, 오타 수정, 프론트매터
  #    손질…). 그래프가 의미 있게 바뀌는 시점은 **시리즈 집필이 끝났을 때**인데,
  #    그건 파일 변화만으로는 판정할 수 없다 — "EP7 이 마지막 편인가"는 판단이다.
  #    그래서 감지는 사람/에이전트가 `graph:request` 로 하고, 실행은 훅이 한다.
  [[ -f "$PENDING" ]] || exit 0

  # ⑤ 도구가 없으면 조용히 넘어간다 (클론 직후 · CI · 남의 환경).
  command -v graphify >/dev/null 2>&1 || exit 0
  command -v bun >/dev/null 2>&1 || exit 0

  # ⑥ staleness — 글 트리 해시가 그대로면 캐시 전량 적중이라 할 일이 없다.
  tree="$(posts_tree)"
  [[ -n "$tree" ]] || exit 0
  [[ -f "$STAMP" && "$(cat "$STAMP")" == "$tree" ]] && exit 0

  # ⑦ 글이 미커밋 상태면 손대지 않는다. graphify 는 **워킹트리**를 읽는데
  #     staleness 는 HEAD 를 본다 — 둘이 어긋난 채로 돌리면 아직 커밋도 안 된
  #     초고가 그래프에 박히고, 그 그래프는 어느 커밋과도 대응하지 않게 된다.
  #     집필 중에는 매 커밋마다 조용히 넘어가고, 글이 착지하면 그때 돈다.
  [[ -z "$(git status --porcelain -- "$POSTS_PATH")" ]] || exit 0

  # ⑧ 같은 입력으로 이미 실패했으면 재시도하지 않는다 — 커밋할 때마다 40분짜리
  #    실패를 반복하는 게 최악이다. 사람이 원인을 보고 마커를 지워야 재개된다.
  if [[ -f "$FAILED" && "$(cat "$FAILED")" == "$tree" ]]; then
    echo "· 그래프 자동 갱신 보류: 같은 글 트리로 이미 실패했다 ($STATUS 확인 후 $FAILED 삭제)"
    exit 0
  fi

  # ⑨ 이미 돌고 있으면(손으로 돌린 graph:refresh 포함) 비켜준다.
  pgrep -f "graphify extract" >/dev/null 2>&1 && exit 0

  mkdir -p "$STATE_DIR"

  # ⑩ 락 — mkdir 은 원자적이다. pid 가 죽어 있으면 stale 로 보고 회수한다.
  if ! mkdir "$LOCK" 2>/dev/null; then
    if [[ -f "$LOCK/pid" ]] && ! kill -0 "$(cat "$LOCK/pid")" 2>/dev/null; then
      rm -rf "$LOCK"
      mkdir "$LOCK" 2>/dev/null || exit 0
    else
      exit 0
    fi
  fi

  # ⑪ 산출물이 이미 더러우면 손대지 않는다. 이 검사가 "손수정이 날아가는" 위험을
  #    원천 차단한다 — 워커가 만든 변경 말고는 아무것도 그 경로에 없음을 보장한다.
  if graph_dirty; then
    rm -rf "$LOCK"
    echo "· 그래프 자동 갱신 보류: graphify-out/·src/data/graph.json 에 미커밋 변경이 있다."
    exit 0
  fi

  mkdir -p graphify-out/logs
  runlog="graphify-out/logs/autorefresh-$(date +%Y%m%dT%H%M%S).log"

  nohup bash "$SELF" --run "$tree" >>"$runlog" 2>&1 </dev/null &
  echo $! >"$LOCK/pid"
  disown 2>/dev/null || true

  echo "· 그래프 자동 갱신을 백그라운드로 시작했다 → $runlog"
  exit 0
fi

# ─────────────────────────────────────────────────────────────────────────────
# 워커 — detach 된 채로 끝까지 돈다. 여기서 나오는 출력은 아무도 안 기다린다.
# ─────────────────────────────────────────────────────────────────────────────
if [[ "$mode" != "--run" ]]; then
  echo "사용: $0 [--check | --run <posts-tree-hash>]" >&2
  exit 2
fi

target_tree="${2:-$(posts_tree)}"
mkdir -p "$STATE_DIR"
trap 'rm -rf "$LOCK"' EXIT
echo $$ >"$LOCK/pid" 2>/dev/null || true

# 이번에 바뀐 글 목록 — 커밋 메시지에 쓴다.
# macOS 는 bash 3.2 라 mapfile 이 없다. 배열 대신 텍스트로 처리한다.
changed_desc="초기 생성"
if [[ -f "$STAMP" ]]; then
  prev="$(cat "$STAMP")"
  if changed_list="$(git diff --name-only "$prev" "$target_tree" 2>/dev/null)"; then
    changed_n="$(printf '%s' "$changed_list" | grep -c . || true)"
    if [[ "$changed_n" -gt 0 ]]; then
      names="$(printf '%s\n' "$changed_list" | sed 's/\.mdx*$//' | head -3 | paste -sd'·' -)"
      [[ "$changed_n" -gt 3 ]] && names="$names 외 $((changed_n - 3))편"
      changed_desc="${changed_n}편 — $names"
    else
      changed_desc="글 목록 변경 없음"
    fi
  else
    changed_desc="변경 목록 확인 불가"
  fi
fi

log "▶ 그래프 자동 갱신 시작 — $changed_desc (posts tree ${target_tree:0:12})"

if ! bash scripts/refresh-graph.sh; then
  printf '%s' "$target_tree" >"$FAILED"
  {
    echo "FAILED  $(date '+%Y-%m-%d %H:%M:%S')"
    echo "posts tree: $target_tree"
    echo "변경: $changed_desc"
    echo
    echo "refresh-graph.sh 가 비0으로 끝났다(추출 실패 또는 verify-graph.ts 판정 실패)."
    echo "산출물은 워킹트리에 **그대로 남겨뒀다** — 자동 롤백하지 않는다."
    echo "무엇이 바뀌었는지 먼저 보고 폐기해라:"
    echo "    git diff --name-only graphify-out/ src/data/graph.json"
    echo "    git checkout -- graphify-out/ src/data/graph.json"
    echo "원인을 고친 뒤 재개하려면: rm $FAILED"
  } >"$STATUS"
  log "✗ 실패 — $STATUS 참고. 같은 글 트리로는 재시도하지 않는다."
  notify "그래프 자동 갱신 실패" "산출물은 워킹트리에 남아 있다. $STATUS 확인."
  exit 1
fi

# 갱신 자체는 성공했다. 커밋 성사 여부와 무관하게 "이 글 내용은 그래프에 반영됐다"는
# 사실은 참이고 예약도 이행됐다 — 여기서 한 번에 스탬프를 찍고 예약을 소비한다.
# (커밋이 안 된 경우는 아래에서 STATUS 에 남기고 사람에게 넘긴다.)
printf '%s' "$target_tree" >"$STAMP"
rm -f "$FAILED" "$PENDING"

if ! graph_dirty; then
  { echo "OK(변화 없음)  $(date '+%Y-%m-%d %H:%M:%S')"; echo "posts tree: $target_tree"; } >"$STATUS"
  log "· 산출물에 변화가 없다 — 커밋 생략."
  exit 0
fi

# 진행 중인 머지·리베이스 위로 커밋하지 않는다. 워커는 20분 뒤에 끝날 수도 있고,
# 그 사이 사람이 다른 git 작업 중일 수 있다.
git_dir="$(git rev-parse --git-dir)"
if [[ -e "$git_dir/MERGE_HEAD" || -d "$git_dir/rebase-merge" || -d "$git_dir/rebase-apply" ]]; then
  {
    echo "PENDING  $(date '+%Y-%m-%d %H:%M:%S')"
    echo "그래프는 갱신됐지만 머지/리베이스가 진행 중이라 커밋하지 않았다."
    echo "정리한 뒤 직접 커밋해라:"
    echo "    git add -A -- graphify-out src/data/graph.json"
    echo "    git commit -m 'graph: 자동 갱신 — $changed_desc'"
  } >"$STATUS"
  log "⚠ 머지/리베이스 진행 중 — 커밋 보류."
  notify "그래프 갱신 완료(커밋 보류)" "머지/리베이스 중이라 커밋하지 않았다."
  exit 0
fi

# --only + pathspec: 사람이 다른 걸 스테이징해 뒀더라도 그래프 경로만 커밋된다.
# GRAPH_AUTOREFRESH=1 로 post-commit 훅의 재진입을 막는다.
msg="graph: 자동 갱신 — $changed_desc"
committed=0
for attempt in 1 2 3; do
  if GRAPH_AUTOREFRESH=1 git add -A -- "${GRAPH_PATHS[@]}" \
    && GRAPH_AUTOREFRESH=1 git commit --only -q -m "$msg" -- "${GRAPH_PATHS[@]}"; then
    committed=1
    break
  fi
  log "· 커밋 실패(시도 $attempt/3) — index.lock 경합일 수 있다. 5초 뒤 재시도."
  sleep 5
done

if ((committed)); then
  head="$(git rev-parse --short HEAD)"
  {
    echo "OK  $(date '+%Y-%m-%d %H:%M:%S')"
    echo "커밋: $head  $msg"
    echo "push 는 하지 않았다 — 배포하려면 직접 push 해라."
  } >"$STATUS"
  log "✓ 커밋 완료: $head $msg (push 안 함)"
  notify "그래프 자동 갱신 완료" "$changed_desc · 커밋 $head (push 안 함)"
else
  {
    echo "PENDING  $(date '+%Y-%m-%d %H:%M:%S')"
    echo "그래프는 갱신됐지만 커밋에 3번 실패했다. 직접 커밋해라:"
    echo "    git add -A -- graphify-out src/data/graph.json"
    echo "    git commit -m '$msg'"
  } >"$STATUS"
  log "⚠ 커밋 실패 — 산출물은 워킹트리에 남아 있다."
  notify "그래프 갱신 완료(커밋 실패)" "산출물이 워킹트리에 남아 있다. $STATUS 확인."
fi
