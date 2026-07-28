#!/usr/bin/env python3
"""graphify 시맨틱 캐시를 심는다 — 증분 추출의 유일한 상태 (KAN-045).

## 왜 이 스크립트가 필요한가

graphify 0.9.4 는 추출 결과를 콘텐츠 해시 키로 `graphify-out/cache/semantic/`
에 캐시하고, 다음 실행에서 `check_semantic_cache()` 로 **LLM 호출 전에** 변경
없는 파일을 걸러낸다. 이게 증분 추출의 전부다.

그런데 이 레포처럼 **스캔 루트와 `--out` 루트가 다르면**(스캔=`src/content/posts/`,
out=레포 루트) graphify 자신은 캐시를 한 건도 못 쓴다:

    # graphify/cache.py  save_semantic_cache()
    p = Path(fpath)                      # fpath = "tauri-2.mdx"  (스캔 루트 기준 상대)
    if not p.is_absolute():
        p = Path(root) / p               # root = out_root = 레포 루트
    if p.is_file():                      # <레포>/tauri-2.mdx → 없음 → 통째로 skip
        save_cached(p, result, root, kind="semantic")

같은 종류의 절대/상대 불일치가 manifest 쪽에도 있어(`_manifest_files` 가 detect()
의 **절대경로** 리스트를 그래프의 **상대** source_file 집합과 `in` 으로 비교),
문서 코퍼스에서는 `manifest.json` 이 **항상 `{}`** 로 쓰인다. 그래서 이 레포의
manifest 는 첫 커밋부터 계속 비어 있었고, 매 발행이 24편 전량 재추출(1.26M in /
280k out / 40~60분)로 돌았다.

manifest 는 못 고치지만 **고칠 필요도 없다** — 캐시만 살아나면 full 모드에서도
바뀐 글만 LLM 을 탄다. 오히려 manifest 가 없는 편이 정확하다: 빈 manifest 는
`incremental_mode` 를 켜서 `build_merge` 를 쓰게 하는데 삭제 감지가 안 되므로
글을 지워도 유령 노드가 남는다. manifest 가 없으면 매 실행이 캐시에서 온전히
재구성돼 삭제가 자연히 반영된다.

## 하는 일

`graphify-out/graph.json` 의 노드·엣지·하이퍼엣지를 글별로 묶어, `source_file`
을 절대경로로 바꾼 뒤 graphify **자신의** `save_semantic_cache(root=<레포 루트>)`
에 넘긴다. 절대경로면 위 버그 분기를 타지 않고 정상 저장된다. 해시 계산은
graphify 함수를 그대로 쓰므로 우리가 재구현하는 부분이 없다.

심은 뒤에는 `check_semantic_cache()` 로 **다음 실행의 리더가 하는 것과 똑같이**
조회해 전 글이 적중하는지 자체 검증한다. 하나라도 미적중이면 비0으로 끝난다.

사용: python3 scripts/seed-graph-cache.py [--scan src/content/posts] [--graph graphify-out/graph.json]
      (graphify 가 설치된 인터프리터로 실행해야 한다 — refresh-graph.sh 가 찾아준다)
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--scan", default="src/content/posts", help="graphify extract 의 스캔 루트")
    ap.add_argument("--graph", default="graphify-out/graph.json")
    ap.add_argument("--root", default=".", help="--out 이 가리키는 루트(레포 루트)")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    scan = Path(args.scan).resolve()
    graph_path = Path(args.graph)

    if not graph_path.is_file():
        print(f"✗ {graph_path} 가 없다 — graphify extract 를 먼저 돌려라.", file=sys.stderr)
        return 1

    try:
        from graphify.cache import check_semantic_cache, save_semantic_cache
    except ImportError as exc:
        print(f"✗ graphify 패키지를 못 찾았다: {exc}", file=sys.stderr)
        print("  graphify 가 설치된 인터프리터로 실행해라.", file=sys.stderr)
        return 1

    graph = json.loads(graph_path.read_text(encoding="utf-8"))

    def absolutize(items: list[dict]) -> list[dict]:
        """source_file 을 스캔 루트 기준 상대 → 절대로. 이미 절대면 그대로 둔다.

        스캔 루트 안에서 해석되지 않는 값(외부 문서, LLM 이 적어낸 컴포넌트 경로 등)
        은 건드리지 않는다 — save_semantic_cache 가 is_file() 로 알아서 걸러낸다.
        """
        out = []
        for item in items:
            item = dict(item)
            src = item.get("source_file")
            if src and not Path(src).is_absolute():
                candidate = scan / src
                if candidate.is_file():
                    item["source_file"] = str(candidate)
            out.append(item)
        return out

    nodes = absolutize(graph.get("nodes", []))
    edges = absolutize(graph.get("links", []))
    hyperedges = absolutize(graph.get("hyperedges", []))

    saved = save_semantic_cache(nodes, edges, hyperedges, root=root)
    print(f"[seed-cache] {saved}개 글의 추출 결과를 캐시에 심었다.")

    # 자체 검증 — 다음 실행의 리더와 동일한 조건(root=out_root)으로 조회한다.
    posts = sorted(
        p for p in scan.iterdir() if p.is_file() and p.suffix.lower() in (".md", ".mdx")
    )
    if not posts:
        print(f"✗ {scan} 에 글이 없다.", file=sys.stderr)
        return 1

    _, _, _, uncached = check_semantic_cache([str(p) for p in posts], root=root)
    hits = len(posts) - len(uncached)
    print(f"[seed-cache] 검증: {hits}/{len(posts)}편 적중 (다음 실행은 이만큼 LLM 을 건너뛴다).")

    if uncached:
        print(
            f"✗ 캐시에 안 들어간 글 {len(uncached)}편 — 다음 실행이 이 글들을 다시 LLM 으로 돌린다:",
            file=sys.stderr,
        )
        for path in uncached:
            print(f"    {Path(path).name}", file=sys.stderr)
        print(
            "  이번 추출에서 노드를 못 만든 글(청크 실패)이거나 경로 해석이 어긋난 경우다.",
            file=sys.stderr,
        )
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
