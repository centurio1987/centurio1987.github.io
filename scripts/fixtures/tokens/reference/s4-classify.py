#!/usr/bin/env python3
"""S4 예외 판정 (KAN-069-M724GH).

입력  s3-scan.json (S3 원자료) + src/styles/tokens.css + src/styles/deco.css
출력  s4-classify.json  — 히트 한 건마다 판정 하나

S3 는 분류만 했다(token / literal_dup / literal_new). 여기서 판정한다.
판정 다섯 갈래:

  준수        var(--x) 로 토큰을 썼다
  드리프트    토큰이 있는데 값을 다시 적었다 — 표기 세 가지를 다 본다
                D1 같은 표기        (S3 의 literal_dup)
                D2 대소문자/축약형   #3E6B4F vs #3e6b4f, #fff vs #ffffff
                D3 rgba 전개        rgba(32,38,74,α) 는 --ink(#20264A) 를 푼 것이다
  위반        그 축에 토큰 체계가 있는데 토큰 밖 값이고, 근거 문서를 못 걸었다
  정당한예외  근거 문서의 위치를 걸 수 있다
  토큰미존재  대조할 토큰 자체가 없는 축 — 위반이 아니라 체계의 공백이다

S3 원자료에 얹는 보정 셋(전부 S3 §7 이 미리 적어 둔 한계다):
  (1) 축 누수 — `border: 1px solid var(--border)` 의 `1px` 이 color 축으로 들어온다.
      색이 아닌 값은 color 축에서 빼내 stroke(선 굵기) 축으로 옮기거나 잡음으로 뺀다.
  (2) 표기 차이 — S3 은 문자열 비교라 대소문자만 달라도 못 잡는다(S2 §4-2 와 같은 함정).
  (3) rgba 전개 — 토큰의 RGB 를 풀어 적은 자리는 S3 에서 literal_new 로 샌다.

사용: python3 s4-classify.py <worktree> <s3-scan.json> > s4-classify.json
"""
import re, sys, json, pathlib, collections

ROOT = pathlib.Path(sys.argv[1])
SCAN = json.load(open(sys.argv[2], encoding="utf-8"))

# ---------- 토큰 표 (정본 tokens.css + 데코 전용 deco.css) ----------
def read_tokens(path, origin):
    out = {}
    if not path.exists(): return out
    for line in path.read_text(encoding="utf-8").splitlines():
        m = re.match(r"\s*(--[\w-]+)\s*:\s*(.+?);\s*(?:/\*.*)?$", line)
        if m: out[m.group(1)] = (m.group(2).strip(), origin)
    return out

TOKENS = read_tokens(ROOT / "src/styles/tokens.css", "tokens.css")
DECO_TOKENS = read_tokens(ROOT / "src/styles/deco.css", "deco.css")

def token_axis(name):
    if name.startswith("--cat-") or name in (
        "--paper","--surface","--cream","--canvas","--subtle","--border",
        "--ink","--ink-2","--ink-3","--accent","--accent-tint","--accent-tint2",
        "--pop","--pop-tint","--pop-ink","--grid-line","--hatch-border","--hatch"):
        return "color"
    if "radius" in name: return "radius"
    if name.startswith("--font-"): return "font"
    if name == "--stroke": return "stroke"
    if name in ("--measure","--content-max","--wide-max","--page-pad","--header-h"): return "layout"
    if name in ("--ease","--dur"): return "motion"
    return "other"

HEX = re.compile(r"^#([0-9a-fA-F]{3,8})$")
RGBA = re.compile(r"^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$")

def hex_triple(v):
    m = HEX.match(v.strip())
    if not m: return None
    h = m.group(1)
    if len(h) == 3: h = "".join(c*2 for c in h)
    if len(h) < 6: return None
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def rgb_triple(v):
    m = RGBA.match(v.strip())
    if not m: return None
    try: return tuple(int(round(float(m.group(i)))) for i in (1, 2, 3))
    except ValueError: return None

# 값 -> 토큰. 세 개의 색인을 만든다(같은 표기 / 색 삼원색 / 소문자 문자열).
by_exact, by_rgb, by_lower = {}, collections.defaultdict(list), collections.defaultdict(list)
for name, (val, origin) in list(TOKENS.items()) + list(DECO_TOKENS.items()):
    ax = token_axis(name)
    rec = (name, ax, origin, val)
    by_exact.setdefault(val, []).append(rec)
    by_lower[val.lower()].append(rec)
    t = hex_triple(val) or rgb_triple(val)
    if t: by_rgb[t].append(rec)

# ---------- 구획 ----------
def segment(p):
    if p.startswith("src/components/posts/"):   return "A. 글 안 React 시뮬"
    if p.startswith("src/components/deco/") or p == "src/styles/deco.css": return "B. 데코 키트"
    if p.startswith("src/lib/viz") or p.startswith("src/components/viz") \
       or p in ("src/styles/viz-frame.css", "src/styles/viz.css"):        return "C. viz 프레임"
    if p.startswith("src/components/motifs/"):  return "D. 손그림 모티프"
    if p.startswith("src/pages/design/"):       return "E. 디자인 카탈로그"
    if p.startswith("src/styles/"):             return "F. 전역 스타일"
    if p.startswith("src/layouts/"):            return "G. 레이아웃"
    return "H. 공용 셸·컴포넌트·페이지"

# ---------- 정당한 예외: 근거 문서의 위치를 걸 수 있는 것만 ----------
# (파일 접두, 축 또는 None=전축) -> 근거. 근거 문자열이 비면 예외가 아니다.
EXCEPTIONS = [
    ("src/styles/motion.css", None,
     "생성물 — `scripts/gen-motion-css.ts` 가 `bbangtoTonyFoundation` 에서 굽는다. "
     "정본이 TS 라 방향이 반대다(S2 §4-4)"),
]
def exception_for(path, axis):
    for pref, ax, why in EXCEPTIONS:
        if path.startswith(pref) and (ax is None or ax == axis) and why:
            return why
    return None

# ---------- 축별 대조 상대 유무 ----------
FAMILY_PROPS = {"font-family", "fontfamily", "font"}
def comparable(axis, prop):
    """이 (축, property) 에 대조할 토큰 체계가 tokens.css 에 있는가."""
    p = prop.lower()
    if axis == "color":  return True          # 색 토큰 18종
    if axis == "radius": return True          # --radius-sm/md/lg · --card-radius · --btn-radius
    if axis == "stroke": return True          # --stroke 한 종
    if axis == "font":   return p in FAMILY_PROPS   # --font-* 는 family 만. size/weight/line-height 없음
    return False                              # spacing · shadow · zindex — 토큰 자체가 없다

COLORVAL = re.compile(r"^(#[0-9a-fA-F]{3,8}$|rgba?\(|hsla?\()")
BORDERISH = re.compile(r"^(border|outline)")
LEN = re.compile(r"^-?\d*\.?\d+(px|rem|em)$")

out = []
for r in SCAN["rows"]:
    path, line = r["at"].rsplit(":", 1)
    axis, prop, val, kind = r["axis"], r["prop"], r["value"], r["kind"]
    note = None

    if kind == "token":
        out.append({**r, "seg": segment(path), "file": path, "line": int(line),
                    "axis2": axis, "verdict": "준수", "reason": None,
                    "token_hit": r.get("token"), "evidence": None})
        continue

    # (1) 축 누수 보정
    if axis == "color" and not COLORVAL.match(val):
        if BORDERISH.match(prop.lower()) and LEN.match(val):
            axis, note = "stroke", "S3 에서 color 축으로 샌 shorthand 폭 — stroke 축으로 옮겼다"
        else:
            out.append({**r, "seg": segment(path), "file": path, "line": int(line),
                        "axis2": "잡음", "verdict": "측정 제외",
                        "reason": "색 축 shorthand 에 섞인 비색 값(그라디언트 정지점 등)",
                        "token_hit": None, "evidence": None})
            continue

    # (2)(3) 드리프트 판정 — 같은 축의 토큰과 값이 같은가
    hits = []
    for rec in by_exact.get(val, []):
        if rec[1] == axis: hits.append(("D1 같은 표기", rec))
    if not hits:
        for rec in by_lower.get(val.lower(), []):
            if rec[1] == axis: hits.append(("D2 대소문자만 다름", rec))
    if not hits:
        t = hex_triple(val) or rgb_triple(val)
        if t:
            for rec in by_rgb.get(t, []):
                if rec[1] == axis:
                    kindlbl = "D2 축약형/대소문자" if hex_triple(val) else "D3 rgba 전개"
                    hits.append((kindlbl, rec))
    if hits:
        lbl, (name, ax, origin, tval) = hits[0]
        out.append({**r, "seg": segment(path), "file": path, "line": int(line),
                    "axis2": axis, "verdict": "드리프트", "reason": lbl,
                    "token_hit": f"{name} ({origin} = {tval})", "evidence": note})
        continue

    why = exception_for(path, axis)
    if why:
        out.append({**r, "seg": segment(path), "file": path, "line": int(line),
                    "axis2": axis, "verdict": "정당한 예외", "reason": None,
                    "token_hit": None, "evidence": why})
        continue

    if comparable(axis, prop):
        out.append({**r, "seg": segment(path), "file": path, "line": int(line),
                    "axis2": axis, "verdict": "위반",
                    "reason": f"{axis} 축에 토큰 체계가 있는데 토큰 밖 값이고 근거 문서를 못 걸었다",
                    "token_hit": None, "evidence": note})
    else:
        out.append({**r, "seg": segment(path), "file": path, "line": int(line),
                    "axis2": axis, "verdict": "토큰 미존재",
                    "reason": f"{axis}/{prop} 에 대조할 토큰이 tokens.css 에 없다",
                    "token_hit": None, "evidence": note})

by_verdict = collections.Counter(x["verdict"] for x in out)
by_seg_verdict = collections.Counter((x["seg"], x["verdict"]) for x in out)
by_axis_verdict = collections.Counter((x["axis2"], x["verdict"]) for x in out)
drift_reason = collections.Counter(x["reason"] for x in out if x["verdict"] == "드리프트")
viol_val = collections.Counter((x["axis2"], x["value"]) for x in out if x["verdict"] == "위반")
viol_file = collections.Counter(x["file"] for x in out if x["verdict"] == "위반")

print(json.dumps({
  "worktree": str(ROOT),
  "input_total": len(SCAN["rows"]),
  "judged_total": len(out),
  "tokens": {"tokens.css": len(TOKENS), "deco.css": len(DECO_TOKENS)},
  "by_verdict": dict(by_verdict),
  "by_segment_verdict": {f"{s} / {v}": n for (s, v), n in sorted(by_seg_verdict.items())},
  "by_axis_verdict": {f"{a} / {v}": n for (a, v), n in sorted(by_axis_verdict.items())},
  "drift_by_reason": dict(drift_reason),
  "violation_top_values": [[f"{a} {v}", n] for (a, v), n in viol_val.most_common(25)],
  "violation_top_files": viol_file.most_common(20),
  "rows": out,
}, ensure_ascii=False))
