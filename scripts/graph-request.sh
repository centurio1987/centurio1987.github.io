#!/usr/bin/env bash
#
# 그래프 갱신 예약 — "다음에 글이 main 에 착지하면 한 번 돌아라" 마커를 남긴다 (KAN-056).
#
# 왜 예약제인가: 커밋마다 훅이 도는 방식은 예외가 너무 많았다(집필 중 커밋, 오타 수정,
# 프론트매터 손질…). 그래프가 의미 있게 바뀌는 시점은 **시리즈 집필이 끝났을 때**인데,
# 그건 파일 변화만 보고는 알 수 없다 — "EP7 이 마지막 편인가"는 판단이다.
# 그래서 감지는 사람/에이전트가 하고, 실행은 훅이 한다. 판단과 실행을 분리한 것이다.
#
# 마커가 없으면 훅은 아무리 커밋이 쌓여도 조용히 넘어간다.
# 갱신이 성공적으로 끝나면 워커가 이 마커를 지운다 — 예약 1건 = 실행 1회.
#
# 사용: bun run graph:request "VPN 해부 시리즈 완결 (EP7) · KAN-0NN"
#       bun run graph:refresh   ← 기다리지 않고 지금 당장 돌리고 싶으면 이쪽
#
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

STATE_DIR="graphify-out/.autorefresh"
PENDING="$STATE_DIR/pending"

reason="${*:-}"
if [[ -z "$reason" ]]; then
  echo "✗ 사유가 필요하다: bun run graph:request \"<왜 지금 갱신하나>\"" >&2
  echo "  예) bun run graph:request \"VPN 해부 시리즈 완결 (EP7)\"" >&2
  exit 2
fi

mkdir -p "$STATE_DIR"
printf '%s\n%s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$reason" >"$PENDING"

echo "✓ 그래프 갱신 예약: $reason"
echo "  main 에 다음 커밋·머지가 들어오면 훅이 한 번 돌고 예약을 지운다."
echo "  지금 당장 돌리려면: bun run graph:refresh"
