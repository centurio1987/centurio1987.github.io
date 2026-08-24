#!/usr/bin/env python3
"""S4 보강 — **토큰은 없지만 문서에는 규칙이 있는** 축을 다시 잰다.

왜 다시 재는가
  s4-classify.py 는 대조 상대를 `tokens.css` 에서만 찾았다. 그래서 간격·글자 크기를
  「토큰 미존재」로 묶었는데, `DESIGN_CONCEPT.md` 를 읽어 보니 **둘 다 규칙이 적혀 있다.**
  토큰이 없다는 것과 규칙이 없다는 것은 다르다 — 규칙이 있으면 지켰는지 물을 수 있다.

    §9 간격   "기준 4px. 사용 단위: 4·8·12·16·24·32·48·64·96px"
    §5 스케일  Display clamp(36px,5vw,60px) · H1 clamp(28px,5vw,38px) · H2 26px ·
               H3 20px · Body 18px · Meta/Label 12–13px

  그림자·z-index 는 규칙이 없다(24행의 "과한 그림자 금지"는 취향 서술이지 판정 가능한 값이 아니다).

사용: python3 s4-docrules.py <s4-classify.json> > s4-docrules.json
"""
import json, sys, re, collections

D = json.load(open(sys.argv[1], encoding="utf-8"))
ROWS = D["rows"]

SPACING_SCALE = {0, 4, 8, 12, 16, 24, 32, 48, 64, 96}   # DESIGN_CONCEPT.md §9
FONT_ROLES = {26.0, 20.0, 18.0, 13.0, 12.0}             # DESIGN_CONCEPT.md §5 (px 로 적힌 역할값)
FONT_MIN = 12.0                                          # Meta/Label 이 문서상 최소치다
PX = re.compile(r"^(-?\d*\.?\d+)px$")

def px(v):
    m = PX.fullmatch(v.strip())
    return abs(float(m.group(1))) if m else None

out = {"spacing": collections.Counter(), "font_size": collections.Counter()}
detail = {"spacing_off": collections.Counter(), "font_off": collections.Counter()}
files = {"spacing_off": collections.Counter(), "font_off": collections.Counter()}

for r in ROWS:
    if r["verdict"] != "토큰 미존재":
        continue
    prop = r["prop"].lower()
    v = px(r["value"])
    if r["axis2"] == "spacing":
        if v is None:
            out["spacing"]["px 아님 — 판정 대상 아님"] += 1
        elif v in SPACING_SCALE:
            out["spacing"]["문서 스케일 안"] += 1
        else:
            out["spacing"]["문서 스케일 밖 — 위반"] += 1
            detail["spacing_off"][r["value"]] += 1
            files["spacing_off"][r["file"]] += 1
    elif r["axis2"] == "font" and prop in ("font-size", "fontsize"):
        if v is None:
            out["font_size"]["px 아님(clamp·vw 등) — 판정 대상 아님"] += 1
        elif v in FONT_ROLES:
            out["font_size"]["문서 역할값과 같음"] += 1
        elif v < FONT_MIN:
            out["font_size"]["문서 최소치(12px) 미만 — 위반"] += 1
            detail["font_off"][r["value"]] += 1
            files["font_off"][r["file"]] += 1
        else:
            out["font_size"]["역할값 밖(12px 이상)"] += 1
            detail["font_off"][r["value"]] += 1
            files["font_off"][r["file"]] += 1

print(json.dumps({
  "rule_source": {
    "spacing": "design-concept/DESIGN_CONCEPT.md §9 — 기준 4px, 4·8·12·16·24·32·48·64·96px",
    "font_size": "design-concept/DESIGN_CONCEPT.md §5 「스케일」 — 60/38/26/20/18/12–13px",
    "shadow": "규칙 없음 — 24행의 '과한 그림자 금지'는 판정 가능한 값이 아니다",
    "zindex": "규칙 없음",
  },
  "spacing": dict(out["spacing"]),
  "font_size": dict(out["font_size"]),
  "spacing_off_values": detail["spacing_off"].most_common(20),
  "spacing_off_files": files["spacing_off"].most_common(12),
  "font_off_values": detail["font_off"].most_common(20),
  "font_off_files": files["font_off"].most_common(10),
  "spacing_off_distinct": len(detail["spacing_off"]),
  "font_off_distinct": len(detail["font_off"]),
}, ensure_ascii=False, indent=1))
