"""코드블록 보조 서체 「Code Grid」를 굽는다 — 라틴 밖 글자를 JetBrains Mono 의 칸에 앉힌다.

왜 필요한가. 코드블록 스택은 `'JetBrains Mono', 'Space Mono', 'Gowun Dodum', …` 인데
구글이 주는 JetBrains Mono 는 라틴·키릴·그리스 구간뿐이라 **상자 선(U+2500)·화살표(→)·
도형(▲)·한글이 전부 본문 서체로 떨어진다.** 본문 서체는 고정폭이 아니다 — 13.125px 실측으로
칸 하나가 7.87px 인데 `─`·`│` 은 13.12px(1.67칸), `가` 11.94 · `한` 12.20(글자마다 다르다),
`①` 14.43px 다. 그래서 상자 선으로 그린 도식이 한 줄도 안 맞는다.
**빌드도 타입도 게이트도 초록인 채로** 생기는 결함이고, KAN-080 이 스택 중간에 본문 서체를
끼운 뒤로는 상자 선까지 그쪽으로 떨어진다(그전에는 OS 고정폭이 칸에 맞게 그렸다).

`UI_CONSISTENCY_AUDIT.md` §7-6 은 「한 그리드가 되는 유일한 길은 한 서체가 라틴과 한글을 다
그리는 것」이라고 적었다. **덧붙이는 서체의 한글 폭을 칸의 정확히 두 배로 다시 정하면** 라틴
얼굴을 버리지 않고도 한 그리드가 된다 — 이 파일이 하는 일이 그것이다.

- 칸 하나 = JetBrains Mono 의 advance 600(upem 1000). 시작할 때 원본에서 다시 재서 대조한다.
- 동아시아 폭이 넓은 글자(W·F — 한글·전각 문장부호)는 **두 칸(1200)**. 본문 서체의 글리프를
  크기 그대로 가운데 앉힌다. 터미널과 편집기가 한글을 두 칸으로 세므로 글쓴이가 맞춘 열이
  그대로 화면에 선다.
- 나머지(상자 선·화살표·도형·`①`)는 **한 칸(600)**. JetBrains Mono 에 있으면 그 글리프를 쓰고,
  없으면 본문 서체 글리프를 한 칸에 들어가게 줄여 세로 가운데에 앉힌다.

출력은 `public/fonts/code-grid-400.woff2` 하나다. 칸 폭은 굽고 나서 **결과 파일을 다시 열어**
글자마다 대조한다 — 어긋나면 failures 로 돌려준다. 호출 규약은 `scripts/build-fonts.ts` 가 진다.
"""
import json
import os
import sys
import unicodedata

from fontTools import subset
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

FAMILY = "Code Grid"
# 한 칸 폭을 재는 글자. 고정폭이므로 어느 라틴이어도 같다.
CELL_PROBE = "0"
# 줄여 넣는 글리프의 좌우 여백 — 한 칸을 꽉 채우면 이웃 글자와 붙어 보인다.
NARROW_FILL = 0.9


def cells(ch):
    return 2 if unicodedata.east_asian_width(ch) in ("W", "F") else 1


def wanted(ch):
    """칸에 앉힐 글자인가. 라틴(U+0000–007F)은 구글 JetBrains Mono 가 이미 그린다.
    결합 문자·서식 문자(변이 선택자 등)는 폭이 0 이라 칸이 없다."""
    if ord(ch) <= 0x7F:
        return False
    return unicodedata.category(ch) not in ("Mn", "Me", "Cf", "Cc")


def bake(cfg):
    report = {"failures": [], "notes": [], "glyphs": {}}
    jbm = instantiateVariableFont(TTFont(cfg["jbm"]), {"wght": 400})
    gowun = TTFont(cfg["gowun"])
    for name, f in (("JetBrains Mono", jbm), ("Gowun Dodum", gowun)):
        if f["head"].unitsPerEm != 1000:
            report["failures"].append(f"{name} 의 upem 이 1000 이 아니다 — 칸 계산이 전제를 잃는다.")
    jcmap, gcmap = jbm.getBestCmap(), gowun.getBestCmap()
    cell = jbm["hmtx"][jcmap[ord(CELL_PROBE)]][0]
    if cell != 600:
        report["failures"].append(f"JetBrains Mono 의 칸이 600 이 아니다({cell}) — 원본이 바뀌었다.")
    if report["failures"]:
        return report

    chars = sorted({c for c in open(cfg["glyph_file"], encoding="utf-8").read() if wanted(c)})
    gset = gowun.getGlyphSet()
    glyf, hmtx = jbm["glyf"], jbm["hmtx"]
    order = list(jbm.getGlyphOrder())
    keep, missing = [], []
    from_jbm, from_gowun = 0, 0

    for ch in chars:
        cp, n = ord(ch), cells(ch)
        target = cell * n
        if n == 1 and cp in jcmap and hmtx[jcmap[cp]][0] == cell:
            keep.append(cp)
            from_jbm += 1
            continue
        gname = gcmap.get(cp)
        if gname is None:
            missing.append(ch)
            continue
        rec = DecomposingRecordingPen(gset)
        gset[gname].draw(rec)
        bounds = BoundsPen(gset)
        rec.replay(bounds)
        adv = gowun["hmtx"][gname][0]
        scale = 1.0
        if adv > target:
            scale = target * (NARROW_FILL if n == 1 else 1.0) / adv
        # 가로는 칸 가운데, 세로는 줄였을 때만 글리프 가운데를 기준으로 줄인다.
        dx = (target - adv * scale) / 2
        dy = 0.0
        if scale < 1.0 and bounds.bounds:
            y_mid = (bounds.bounds[1] + bounds.bounds[3]) / 2
            dy = y_mid * (1 - scale)
        pen = TTGlyphPen(None)
        rec.replay(TransformPen(pen, (scale, 0, 0, scale, dx, dy)))
        glyph = pen.glyph()
        new = f"cg.u{cp:04X}"
        order.append(new)
        glyf[new] = glyph
        glyph.recalcBounds(glyf)
        hmtx.metrics[new] = (target, getattr(glyph, "xMin", 0))
        for table in jbm["cmap"].tables:
            if table.isUnicode():
                table.cmap[cp] = new
        keep.append(cp)
        from_gowun += 1

    jbm.setGlyphOrder(order)
    for tag in ("hdmx", "LTSH", "VDMX"):
        if tag in jbm:
            del jbm[tag]
    for rec in jbm["name"].names:
        if rec.nameID in (1, 16):
            jbm["name"].setName(FAMILY, rec.nameID, rec.platformID, rec.platEncID, rec.langID)
        elif rec.nameID == 4:
            jbm["name"].setName(f"{FAMILY} Regular", 4, rec.platformID, rec.platEncID, rec.langID)
        elif rec.nameID == 6:
            jbm["name"].setName("CodeGrid-Regular", 6, rec.platformID, rec.platEncID, rec.langID)
    raw = os.path.join(cfg["work"], "code-grid-raw.ttf")
    jbm.save(raw)

    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = []  # 라틴 합자(calt)는 앞의 구글 JetBrains Mono 몫이다.
    opts.hinting = False
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    font = subset.load_font(raw, opts)
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=keep)
    sub.subset(font)
    subset.save_font(font, cfg["out"], opts)

    # 자가검사 — 결과 파일을 다시 열어 글자마다 칸 폭을 대조한다.
    out = TTFont(cfg["out"])
    ocmap, ohmtx = out.getBestCmap(), out["hmtx"]
    for cp in keep:
        ch = chr(cp)
        g = ocmap.get(cp)
        if g is None:
            report["failures"].append(f"«{ch}»(U+{cp:04X}) 이 결과 파일에 없다 — 서브셋이 빠뜨렸다.")
        elif ohmtx[g][0] != cell * cells(ch):
            report["failures"].append(
                f"«{ch}»(U+{cp:04X}) 의 폭이 {ohmtx[g][0]} 이다 — {cells(ch)}칸이면 {cell * cells(ch)} 이어야 한다."
            )
    report["glyphs"] = {"total": len(keep), "jbm": from_jbm, "gowun": from_gowun, "missing": "".join(missing)}
    return report


if __name__ == "__main__":
    print(json.dumps(bake(json.loads(sys.argv[1])), ensure_ascii=False))
