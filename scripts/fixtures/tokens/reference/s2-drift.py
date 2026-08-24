#!/usr/bin/env python3
"""tokens.css <-> TS 상수 값 드리프트 전량 대조 (KAN-069 S2).

대조 대상은 "TS 쪽이 스스로 어느 CSS 토큰을 옮겨 적었다고 밝힌 줄"이다.
즉 `// --token` 주석이 달린 TS 리터럴만 짝을 짓는다 — 짝이 없는 값은
드리프트 판정 대상이 아니라 '대조 불가'로 따로 센다.
"""
import re, sys, json, pathlib

WT = pathlib.Path(sys.argv[1])
CSS = WT / "src/styles/tokens.css"
TS_FILES = [
    WT / "src/lib/motion/bbangtoTonyStyleGuide.ts",
    WT / "src/lib/viz/blogVizStyleGuide.ts",
]

# 1) tokens.css
css = {}
for i, line in enumerate(CSS.read_text(encoding="utf-8").splitlines(), 1):
    m = re.match(r"\s*(--[\w-]+)\s*:\s*(.+?);\s*(?:/\*.*)?$", line)
    if m:
        css[m.group(1)] = (m.group(2).strip(), i)

# 2) TS 리터럴 + `// --token` 주석
#    (a) const NAME = "value"; // --token
#    (b) key: "value", // --token
pat = re.compile(
    r'^\s*(?:const\s+(?P<cname>\w+)\s*=|(?P<key>[\w"\']+)\s*:)\s*'
    r'"(?P<val>[^"]*)"\s*[,;]?\s*//\s*(?P<tok>--[\w-]+)(?P<tail>.*)$'
)
pairs = []
for f in TS_FILES:
    for i, line in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
        m = pat.match(line)
        if m:
            pairs.append({
                "file": str(f.relative_to(WT)), "line": i,
                "ts_name": m.group("cname") or m.group("key"),
                "ts_value": m.group("val"),
                "token": m.group("tok"),
            })

def norm(s):
    return re.sub(r"\s+", " ", s.strip())

exact, case_only, mismatch, no_token = [], [], [], []
for p in pairs:
    if p["token"] not in css:
        no_token.append(p); continue
    cval, cline = css[p["token"]]
    p["css_value"], p["css_line"] = cval, cline
    a, b = norm(p["ts_value"]), norm(cval)
    if a == b:
        exact.append(p)
    elif a.lower() == b.lower():
        case_only.append(p)
    else:
        mismatch.append(p)

out = {
    "css_tokens_total": len(css),
    "ts_annotated_literals": len(pairs),
    "exact": len(exact),
    "case_only": len(case_only),
    "mismatch": len(mismatch),
    "token_not_found": len(no_token),
    "mismatch_rows": [
        {"token": p["token"], "css": p["css_value"], "ts": p["ts_value"],
         "css_at": f"src/styles/tokens.css:{p['css_line']}",
         "ts_at": f"{p['file']}:{p['line']}"} for p in mismatch],
    "case_only_rows": [
        {"token": p["token"], "css": p["css_value"], "ts": p["ts_value"],
         "css_at": f"src/styles/tokens.css:{p['css_line']}",
         "ts_at": f"{p['file']}:{p['line']}"} for p in case_only],
    "token_not_found_rows": no_token,
    "exact_rows": [{"token": p["token"], "v": p["ts_value"],
                    "ts_at": f"{p['file']}:{p['line']}"} for p in exact],
}
print(json.dumps(out, ensure_ascii=False, indent=1))
