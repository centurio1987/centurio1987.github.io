#!/usr/bin/env python3
"""S3 구현 층 전수 스캔 (KAN-069-M724GH).

무엇을 하는가
  src/**.{astro,tsx,css} 에서 시각 값(색·간격·radius·shadow·폰트·z-index)을 기계 추출해
  src/styles/tokens.css 대비로 분류한다. 판정은 하지 않는다(S4 의 일).

분류 세 갈래
  token       var(--x) 로 토큰을 쓴 자리          → 준수
  literal_dup 리터럴인데 그 값이 tokens.css 에 있다 → 토큰이 있는데 값을 다시 적었다
  literal_new 리터럴인데 tokens.css 에 없는 값     → 토큰 밖 값(정당한 예외일 수 있다)

읽는 자리 셋
  A. CSS 선언  `prop: value;`  — .css 전체 · .astro 의 <style> 블록 · .tsx 의 템플릿 리터럴
  B. JSX/SVG 속성  fill="…" stroke="…" stopColor="…" color="…"
  C. 인라인 style 객체  { background: "…", padding: "…" }  (B 와 같은 정규식으로 잡힌다)

사용: python3 s3-scan.py <worktree> > s3-scan.json
"""
import re, sys, json, pathlib, collections

ROOT = pathlib.Path(sys.argv[1])
SRC = ROOT / "src"
CSSFILE = SRC / "styles/tokens.css"

# ---- 축 정의: property -> axis
AXIS = {}
def reg(axis, *props):
    for p in props: AXIS[p] = axis
reg("color", "color","background","background-color","background-image","border-color",
    "border","border-top","border-right","border-bottom","border-left",
    "border-top-color","border-right-color","border-bottom-color","border-left-color",
    "outline","outline-color","fill","stroke","stop-color","stopcolor",
    "text-decoration-color","caret-color","accent-color","backgroundcolor","bordercolor")
reg("spacing","margin","margin-top","margin-right","margin-bottom","margin-left",
    "padding","padding-top","padding-right","padding-bottom","padding-left",
    "gap","row-gap","column-gap","top","right","bottom","left","inset",
    "width","height","min-width","min-height","max-width","max-height","flex-basis")
reg("radius","border-radius","border-top-left-radius","border-top-right-radius",
    "border-bottom-left-radius","border-bottom-right-radius","borderradius")
reg("shadow","box-shadow","text-shadow","filter","boxshadow","textshadow")
reg("font","font","font-family","font-size","font-weight","line-height","letter-spacing",
    "fontfamily","fontsize","fontweight","lineheight","letterspacing")
reg("zindex","z-index","zindex")

# ---- tokens.css 값 집합
tokens = {}
for i, line in enumerate(CSSFILE.read_text(encoding="utf-8").splitlines(), 1):
    m = re.match(r"\s*(--[\w-]+)\s*:\s*(.+?);\s*(?:/\*.*)?$", line)
    if m: tokens[m.group(1)] = m.group(2).strip()
# 토큰마다 축이 있다. 축이 다른 우연한 값 일치(padding:8px 가 --radius-sm:8px 와 같음)를
# "토큰이 있는데 안 썼다"로 세면 안 된다 — 그건 우연이지 드리프트가 아니다.
TOKEN_AXIS = {}
for t in tokens:
    if t.startswith("--cat-") or t in (
        "--paper","--surface","--cream","--canvas","--subtle","--border",
        "--ink","--ink-2","--ink-3","--accent","--accent-tint","--accent-tint2",
        "--pop","--pop-tint","--pop-ink","--grid-line","--hatch-border","--hatch"):
        TOKEN_AXIS[t] = "color"
    elif "radius" in t:
        TOKEN_AXIS[t] = "radius"
    elif t.startswith("--font-"):
        TOKEN_AXIS[t] = "font"
    elif t in ("--stroke","--measure","--content-max","--wide-max","--page-pad","--header-h"):
        TOKEN_AXIS[t] = "spacing"
    elif t in ("--ease","--dur"):
        TOKEN_AXIS[t] = "motion"
    else:
        TOKEN_AXIS[t] = "other"

val2token = collections.defaultdict(list)
for t, v in tokens.items():
    val2token[v.strip().lower()].append(t)

DECL = re.compile(r"(?<![\w-])([a-zA-Z-]{3,30})\s*:\s*([^;{}\n]{1,200});")
ATTR = re.compile(r'(?<![\w-])([a-zA-Z-]{3,30})\s*=\s*"([^"\n]{1,200})"')
JSXOBJ = re.compile(r'(?<![\w-])([a-zA-Z-]{3,30})\s*:\s*"([^"\n]{1,200})"')
STYLE_BLOCK = re.compile(r"<style[^>]*>(.*?)</style>", re.S)
COMMENT_CSS = re.compile(r"/\*.*?\*/", re.S)

LITERAL = re.compile(
    r"(#[0-9a-fA-F]{3,8}\b"
    r"|rgba?\([^)]*\)|hsla?\([^)]*\)"
    r"|-?\d*\.?\d+(?:px|rem|em|vh|vw|ch|%)"
    r"|\b\d{1,4}\b)"
)
VARUSE = re.compile(r"var\(\s*(--[\w-]+)")

def axis_of(prop):
    p = prop.strip().lower()
    return AXIS.get(p)

def classify(axis, prop, raw, path, line, source):
    out = []
    used = VARUSE.findall(raw)
    for t in used:
        out.append({"axis": axis, "kind": "token", "prop": prop, "value": f"var({t})",
                    "token": t, "at": f"{path}:{line}", "src": source})
    # var() 내부를 지우고 남은 리터럴만 본다
    stripped = re.sub(r"var\([^)]*\)", " ", raw)
    for m in LITERAL.finditer(stripped):
        v = m.group(1)
        if axis == "zindex" and not re.fullmatch(r"-?\d{1,4}", v): continue
        if axis != "zindex" and re.fullmatch(r"\d{1,4}", v):
            # 단위 없는 숫자는 font-weight/line-height 만 의미가 있다
            if axis != "font": continue
        hits = [t for t in val2token.get(v.strip().lower(), []) if TOKEN_AXIS.get(t) == axis]
        loose = [t for t in val2token.get(v.strip().lower(), []) if TOKEN_AXIS.get(t) != axis]
        out.append({"axis": axis, "kind": "literal_dup" if hits else "literal_new",
                    "prop": prop, "value": v, "token": hits or None,
                    "same_value_other_axis": loose or None,
                    "at": f"{path}:{line}", "src": source})
    return out

rows = []
files = sorted([p for ext in ("astro","tsx","css") for p in SRC.rglob(f"*.{ext}")])
scanned = collections.Counter()
for p in files:
    rel = str(p.relative_to(ROOT))
    if rel == "src/styles/tokens.css":   # 정본 자신은 대상이 아니다
        continue
    text = p.read_text(encoding="utf-8")
    scanned[p.suffix] += 1
    # ---- A. CSS 선언
    if p.suffix == ".css":
        regions = [(text, 0)]
    elif p.suffix == ".astro":
        regions = [(m.group(1), text[:m.start(1)].count("\n")) for m in STYLE_BLOCK.finditer(text)]
    else:
        regions = [(m.group(0), text[:m.start()].count("\n"))
                   for m in re.finditer(r"`[^`]*`", text, re.S)]
    for chunk, off in regions:
        chunk = COMMENT_CSS.sub(lambda m: "\n"*m.group(0).count("\n"), chunk)
        for m in DECL.finditer(chunk):
            ax = axis_of(m.group(1))
            if not ax: continue
            ln = off + chunk[:m.start()].count("\n") + 1
            rows += classify(ax, m.group(1), m.group(2), rel, ln, "css-decl")
    # ---- B/C. JSX 속성 + 인라인 style 객체 (astro·tsx)
    if p.suffix in (".astro", ".tsx"):
        body = text
        if p.suffix == ".astro":
            body = STYLE_BLOCK.sub(lambda m: "\n"*m.group(0).count("\n"), text)
        for pat, src in ((ATTR, "jsx-attr"), (JSXOBJ, "style-obj")):
            for m in pat.finditer(body):
                ax = axis_of(m.group(1))
                if not ax: continue
                ln = body[:m.start()].count("\n") + 1
                rows += classify(ax, m.group(1), m.group(2), rel, ln, src)

by_axis_kind = collections.Counter((r["axis"], r["kind"]) for r in rows)
by_file = collections.Counter(r["at"].split(":")[0] for r in rows if r["kind"].startswith("literal"))
dup_values = collections.Counter(r["value"].lower() for r in rows if r["kind"] == "literal_dup")
new_values = collections.Counter(r["value"].lower() for r in rows if r["kind"] == "literal_new")

print(json.dumps({
  "worktree": str(ROOT),
  "files_scanned": {k.lstrip("."): v for k, v in sorted(scanned.items())},
  "tokens_in_tokens_css": len(tokens),
  "total_hits": len(rows),
  "by_kind": dict(collections.Counter(r["kind"] for r in rows)),
  "by_axis_kind": {f"{a}/{k}": n for (a, k), n in sorted(by_axis_kind.items())},
  "top_files_by_literals": by_file.most_common(30),
  "top_literal_dup_values": dup_values.most_common(25),
  "top_literal_new_values": new_values.most_common(30),
  "rows": rows,
}, ensure_ascii=False))
