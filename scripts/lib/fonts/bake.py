"""Gowun Dodum 의 굵기 단을 굽고 사이트 글자로 서브셋한다 (KAN-080 S7).

배포본에는 400 한 종뿐이고 **업스트림에도 다른 굵기가 없다**(소스가 단일 마스터
`.glyphs` 하나다). OFL 에 Reserved Font Name 선언이 없어 개작이 열려 있으므로,
아웃라인을 `stroke` 로 확장해 원본과 합집합한다 — FontForge `ChangeWeight` 와 같은 방식이다.

**함정 셋을 밟았고 셋째가 결정적이다.**

1. `stroke` 직후 `convertConicsToQuads()` 를 안 부르면 `TTGlyphPen` 이
   `UnsupportedVerbError: CONIC` 으로 죽는다. — 시끄럽게 죽으므로 알아챈다.
2. `union` 앞에서 stroke 를 `simplify` 하지 않으면 컨투어가 20개로 쪼개진다(6개로 줄어든다).
3. **`stroke` 전에 원본 winding 을 `simplify(fix_winding=True)` 로 정규화하지 않으면
   stroke 고리의 안쪽 컨투어가 원본 채움을 상쇄해 글자 속이 빈다.**

셋째는 **조용히 지나간다.** 굽기는 「글리프 12,540개 · 실패 0」으로 끝나고, 잉크 총량을 재면
원본보다 오히려 많게 나오며(18px 기준 587k → 769k), 렌더도 「굵어 보이는」 그림이 나온다.
드러나는 곳은 화면뿐이다 — 획이 이중 가는 선이 되어 뿌옇고 연하게 읽힌다.
**면적으로 잡힌다**(`한` 글리프: 원본 184,758 → 버그 192,229(+4%) → 정상 306,883(+66%)).
그래서 굽고 나서 면적을 재고, 늘어난 비율이 기준에 못 미치면 **여기서 끝낸다.**
점 폭증도 같은 버그였다 — 고치면 명령 수가 원본의 3배가 아니라 1.11배다.

호출 규약은 `scripts/build-fonts.ts` 가 진다(이 파일은 굽기만 한다).
"""
import json
import sys
import time

import pathops
from fontTools import subset
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont

# 굵기 확장량(폰트 단위, upem 1000). S2 가 실지면 렌더로 고른 값이다.
WIDTHS = {500: 20.0, 700: 34.0}
SUBFAMILY = {400: "Regular", 500: "Medium", 700: "Bold"}
# 면적 자가검사 — 함정 3 이 걸리면 +4% 언저리에서 멈춘다. 정상은 +60% 를 넘는다.
MIN_AREA_GAIN = {500: 0.25, 700: 0.45}
# 면적을 재는 글리프. 획이 많아 속 빔이 잘 드러나는 글자다.
PROBE = "한"


def outline(glyph_set, name):
    """글리프 하나의 아웃라인. **winding 을 여기서 정규화한다**(함정 3)."""
    rec = DecomposingRecordingPen(glyph_set)
    glyph_set[name].draw(rec)
    path = pathops.Path()
    rec.replay(path.getPen())
    if not list(path.contours):
        return None
    path.simplify(fix_winding=True, keep_starting_points=False)
    return path


def embolden(path, width):
    """아웃라인을 `width` 만큼 굵힌다 — stroke 고리를 원본과 합집합한다."""
    thick = pathops.Path()
    path.draw(thick.getPen())
    thick.stroke(width, pathops.LineCap.BUTT_CAP, pathops.LineJoin.MITER_JOIN, 4.0)
    thick.convertConicsToQuads(0.25)                                  # 함정 1
    thick.simplify(fix_winding=True, keep_starting_points=False)      # 함정 2
    out = pathops.Path()
    pathops.union([path, thick], out.getPen())
    out.simplify(fix_winding=True, keep_starting_points=False)
    return out


def bake(src, weight, out_path):
    font = TTFont(src)
    glyf, glyph_set = font["glyf"], font.getGlyphSet()
    width = WIDTHS[weight]
    probe_name = font.getBestCmap().get(ord(PROBE))
    before = after = None

    t0 = time.time()
    done, failed = 0, []
    for name in font.getGlyphOrder():
        try:
            src_path = outline(glyph_set, name)
            if src_path is None:
                continue
            if name == probe_name:
                before = abs(src_path.area)
            out = embolden(src_path, width)
            if name == probe_name:
                after = abs(out.area)
            pen = TTGlyphPen(glyph_set)
            out.draw(pen)
            glyf[name] = pen.glyph()
            done += 1
        except Exception as exc:                       # noqa: BLE001 — 어느 글리프가 죽었는지 남긴다
            failed.append((name, str(exc)[:80]))

    font["OS/2"].usWeightClass = weight
    sub = SUBFAMILY[weight]
    for rec in font["name"].names:
        if rec.nameID == 2:
            font["name"].setName(sub, 2, rec.platformID, rec.platEncID, rec.langID)
        elif rec.nameID == 4:
            font["name"].setName(f"Gowun Dodum {sub}", 4, rec.platformID, rec.platEncID, rec.langID)
        elif rec.nameID == 6:
            font["name"].setName(f"GowunDodum-{sub}", 6, rec.platformID, rec.platEncID, rec.langID)
    font.save(out_path)

    gain = (after / before - 1.0) if before and after else None
    return {
        "weight": weight, "glyphs": done, "failed": len(failed),
        "seconds": round(time.time() - t0, 1),
        "area_before": before, "area_after": after, "area_gain": gain,
        "failed_sample": failed[:3],
    }


def make_subset(src, glyph_file, out_path):
    """사이트가 쓰는 글자만 남겨 woff2 로 굽는다. **자체 호스팅이라 서브셋을 우리가 정한다.**

    글자를 인자가 아니라 파일로 넘긴다 — 1,200자가 넘어 명령줄에 실으면 셸 인용에 걸린다.
    """
    subset.main([
        src,
        f"--text-file={glyph_file}",
        "--flavor=woff2",
        # **힌팅은 버린다.** 구운 아웃라인에는 원본 힌트가 안 맞는데, 남기면 woff2 가
        # 104.9 KB → 279.7 KB 로 부푼다(실측). 레이아웃 기능은 fontTools 기본 집합을 쓴다 —
        # `*` 로 전부 남기면 한국어에 안 쓰는 vert·palt 까지 실려 2.3 KB 가 는다(실측).
        "--no-hinting",
        f"--output-file={out_path}",
    ])


def main():
    cfg = json.loads(sys.argv[1])
    glyph_file = cfg["glyph_file"]
    report = {"weights": [], "failures": []}

    for weight in cfg["weights"]:
        if weight == 400:
            make_subset(cfg["src"], glyph_file, cfg["out"][str(weight)])
            report["weights"].append({"weight": 400, "glyphs": None, "baked": False})
            continue
        raw = f"{cfg['work']}/GowunDodum-{SUBFAMILY[weight]}.ttf"
        stat = bake(cfg["src"], weight, raw)
        gain = stat["area_gain"]
        need = MIN_AREA_GAIN[weight]
        if gain is None:
            report["failures"].append(f"{weight}: 면적을 못 쟀다 — `{PROBE}` 글리프를 못 찾았다")
        elif gain < need:
            report["failures"].append(
                f"{weight}: 면적이 {gain * 100:.1f}%% 만 늘었다(기준 {need * 100:.0f}%% 이상) — "
                f"stroke 전 winding 정규화가 빠졌을 때의 증상이다(그때 실측이 +4%%). "
                f"굽기는 실패 {stat['failed']} 로 조용히 끝나므로 이 검사 말고는 안 잡힌다"
            )
        if stat["failed"]:
            report["failures"].append(f"{weight}: 글리프 {stat['failed']}개가 실패했다 — {stat['failed_sample']}")
        make_subset(raw, glyph_file, cfg["out"][str(weight)])
        stat["baked"] = True
        report["weights"].append(stat)

    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()
