#!/usr/bin/env python3
"""2차 대조 — TS 두 파일의 색 리터럴 전량이 tokens.css 어느 값과 같은가(주석 유무 무관)."""
import re, sys, json, pathlib
WT = pathlib.Path(sys.argv[1])
CSS = WT / "src/styles/tokens.css"
TS_FILES = [WT/"src/lib/motion/bbangtoTonyStyleGuide.ts", WT/"src/lib/viz/blogVizStyleGuide.ts"]

css = {}
for i, line in enumerate(CSS.read_text(encoding="utf-8").splitlines(), 1):
    m = re.match(r"\s*(--[\w-]+)\s*:\s*(.+?);\s*(?:/\*.*)?$", line)
    if m: css[m.group(1)] = (m.group(2).strip(), i)
by_val = {}
for tok,(v,l) in css.items():
    by_val.setdefault(v.strip().lower(), []).append((tok,l))

hexpat = re.compile(r'"(#[0-9a-fA-F]{3,8})"')
rows = []
for f in TS_FILES:
    for i, line in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
        for m in hexpat.finditer(line):
            val = m.group(1)
            ann = re.search(r"//.*?(--[\w-]+)", line)
            hit = by_val.get(val.lower(), [])
            rows.append({
                "at": f"{f.relative_to(WT)}:{i}", "value": val,
                "annotated_token": ann.group(1) if ann else None,
                "matches_css_token": [t for t,_ in hit] or None,
                "css_literal": css[hit[0][0]][0] if hit else None,
            })
silent = [r for r in rows if r["matches_css_token"] and not r["annotated_token"]]
orphan = [r for r in rows if not r["matches_css_token"]]
casediff = [r for r in rows if r["css_literal"] and r["value"] != r["css_literal"]]
print(json.dumps({
 "hex_literals_total": len(rows),
 "match_a_css_token": sum(1 for r in rows if r["matches_css_token"]),
 "silent_duplicates(주석 없이 CSS 값과 동일)": len(silent),
 "no_css_counterpart(파생색·TS 고유값)": len(orphan),
 "case_differs(같은 값, 대소문자만 다름)": len(casediff),
 "silent_rows": silent, "orphan_rows": orphan,
 "case_rows": [{"at":r["at"],"ts":r["value"],"css":r["css_literal"],"token":r["matches_css_token"]} for r in casediff],
}, ensure_ascii=False, indent=1))
