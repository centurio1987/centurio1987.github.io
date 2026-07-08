#!/usr/bin/env python3
"""find_markers.py — 문서에서 밈 플레이스홀더 `<<meme: ...>>` 를 전부 뽑는다.

사용법:
    python3 find_markers.py "<문서 경로>"

각 마커의 등장 순번·줄 번호·소속 헤딩·힌트 텍스트를 출력한다.
남은 마커가 0개인지 확인(치환 검증)하는 데도 쓴다 — 0개면 "0 markers" 만 출력.

주의: 코드펜스(``` ... ```) 내부의 `<<meme:>>` 는 예시일 수 있으므로 [in-fence] 로 표시만 하고
      순번은 매기되, 실제 치환 대상 판단은 호출자가 한다.
"""
import re
import sys

MARKER = re.compile(r"<<meme:\s*(.+?)>>", re.IGNORECASE | re.DOTALL)
HEADING = re.compile(r"^\s{0,3}#{1,6}\s+(.*)$")

def main() -> int:
    if len(sys.argv) < 2:
        print("usage: find_markers.py <path>", file=sys.stderr)
        return 2
    path = sys.argv[1]
    try:
        with open(path, encoding="utf-8") as f:
            text = f.read()
    except OSError as e:
        print(f"cannot read {path}: {e}", file=sys.stderr)
        return 2

    lines = text.splitlines()
    # 줄별 소속 헤딩 + 코드펜스 여부 미리 계산
    heading_at = [""] * (len(lines) + 1)
    in_fence_at = [False] * (len(lines) + 1)
    cur_heading = ""
    in_fence = False
    for i, line in enumerate(lines):
        if re.match(r"^\s{0,3}(```|~~~)", line):
            in_fence = not in_fence
        in_fence_at[i] = in_fence
        h = HEADING.match(line)
        if h and not in_fence:
            cur_heading = h.group(1).strip()
        heading_at[i] = cur_heading

    # 오프셋 → 줄 번호 매핑
    line_start = [0]
    for line in lines:
        line_start.append(line_start[-1] + len(line) + 1)

    def line_of(pos: int) -> int:
        lo, hi = 0, len(line_start) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if line_start[mid + 1] <= pos:
                lo = mid + 1
            else:
                hi = mid
        return lo

    matches = list(MARKER.finditer(text))
    if not matches:
        print("0 markers")
        return 0

    print(f"{len(matches)} markers")
    for n, m in enumerate(matches, 1):
        ln = line_of(m.start())
        heading = heading_at[ln] if ln < len(heading_at) else ""
        fence = " [in-fence]" if (ln < len(in_fence_at) and in_fence_at[ln]) else ""
        hint = " ".join(m.group(1).split())
        print(f"#{n} line {ln + 1}{fence} | heading: {heading or '(none)'}")
        print(f"    hint: {hint}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
