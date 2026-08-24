#!/usr/bin/env python3
"""S4 보조 — `var(--x, <fallback>)` 의 fallback 이 토큰 값과 갈리는가.

왜 따로 재는가
  S3 스캐너는 `var(...)` 를 통째로 걷어내므로 fallback 은 판정에 한 번도 안 들어왔다.
  그런데 fallback 이 토큰과 갈리면 **그 스타일시트를 안 들여온 지면에서만** 다른 값이 뜬다 —
  두 지면을 나란히 놓기 전까지 눈에 안 보이는 종류의 드리프트다.

값 토큰과 스위치를 가른다
  `--deco-t3` 처럼 선택자마다 다시 정의되는 것은 **스위치**이지 값 토큰이 아니다.
  스위치의 fallback 은 "기본 상태"라 토큰 값과 다른 것이 정상이다 — 대조 대상에서 뺀다.
  판정 대상은 `src/styles/*.css` 전체에서 **정확히 한 번만, `:root` 안에서** 정의된 이름이다.

사용: python3 s4-fallback.py <worktree> > s4-fallback.json
"""
import re, sys, json, pathlib, collections

ROOT = pathlib.Path(sys.argv[1])
SRC = ROOT / "src"
STYLE_FILES = sorted(SRC.glob("styles/*.css"))

DEF = re.compile(r"^\s*(--[\w-]+)\s*:\s*(.+?);\s*(?:/\*.*)?$")
COMMENT = re.compile(r"/\*.*?\*/", re.S)

defs = collections.defaultdict(list)          # name -> [(value, at, in_root)]
for p in STYLE_FILES:
    rel = str(p.relative_to(ROOT))
    text = COMMENT.sub(lambda m: "\n" * m.group(0).count("\n"), p.read_text(encoding="utf-8"))
    depth, root_depth = 0, None
    for i, line in enumerate(text.splitlines(), 1):
        m = DEF.match(line)
        if m and root_depth is not None and depth == root_depth:
            defs[m.group(1)].append((m.group(2).strip(), f"{rel}:{i}", True))
        elif m:
            defs[m.group(1)].append((m.group(2).strip(), f"{rel}:{i}", False))
        opens, closes = line.count("{"), line.count("}")
        if opens and re.search(r":root[^{]*\{", line) and root_depth is None:
            root_depth = depth + 1
        depth += opens - closes
        if root_depth is not None and depth < root_depth:
            root_depth = None

VALUE_TOKENS = {n: v[0] for n, v in defs.items() if len(v) == 1 and v[0][2]}
SWITCHES = {n for n in defs if n not in VALUE_TOKENS}

VARFB = re.compile(r"var\(\s*(--[\w-]+)\s*,\s*([^()]*(?:\([^()]*\)[^()]*)*)\)")

def norm(v):
    v = re.sub(r"\s+", " ", v.strip().rstrip(";")).lower()
    m = re.fullmatch(r"#([0-9a-f]{3})", v)
    if m: v = "#" + "".join(c * 2 for c in m.group(1))
    v = re.sub(r"(?<![\w.])\.(\d)", r"0.\1", v)
    v = re.sub(r",\s*", ", ", v)
    return v

rows = []
for p in sorted([q for ext in ("astro", "tsx", "css") for q in SRC.rglob(f"*.{ext}")]):
    rel = str(p.relative_to(ROOT))
    text = p.read_text(encoding="utf-8")
    for m in VARFB.finditer(text):
        name, fb = m.group(1), m.group(2).strip()
        if not fb: continue
        ln = text[:m.start()].count("\n") + 1
        if name in VALUE_TOKENS:
            tval, tat, _ = VALUE_TOKENS[name]
            verdict = "일치" if norm(tval) == norm(fb) else "불일치"
        elif name in SWITCHES:
            verdict, tval, tat = "스위치 — 대조 제외", None, None
        else:
            verdict, tval, tat = "지역 변수 — 대조 제외", None, None
        rows.append({"at": f"{rel}:{ln}", "token": name, "fallback": fb,
                     "token_value": tval, "token_at": tat, "verdict": verdict})

by = collections.Counter(r["verdict"] for r in rows)
print(json.dumps({
  "value_tokens": len(VALUE_TOKENS), "switches": sorted(SWITCHES),
  "total": len(rows), "by_verdict": dict(by),
  "mismatches": [r for r in rows if r["verdict"] == "불일치"],
  "rows": rows,
}, ensure_ascii=False))
