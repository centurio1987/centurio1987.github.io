/**
 * 색 · radius · 선 굵기 축 판정 — `scripts/fixtures/tokens/reference/s4-classify.py` 의 TS 이식 (KAN-070 S3).
 *
 * 추출은 다시 하지 않는다. `ctx.hits` 를 받아 **판정만** 붙인다.
 * 대조 상대는 `s4-classify.json` 의 `rows` 중 `axis2 ∈ {color, radius, stroke, 잡음}` 1,306 건이고,
 * (axis · prop · value · file · line · verdict) 여섯 쪽으로 차집합이 0 이어야 한다.
 *
 * ── 왜 축을 셋으로 가르나
 *   공통 추출의 축(`Hit.axis`)은 **CSS 속성 이름**으로 정해진다. 그래서 `border` 는 통째로
 *   color 축이고, `border: 1px solid var(--border)` 의 `1px` 이 색 축 히트로 들어온다
 *   (S3 §7 이 미리 적어 둔 한계다). 값이 색이 아닌 것을 색 토큰과 대조하면 전부 "토큰 밖 값"이
 *   되므로, 판정 단계에서 한 번 더 가른다:
 *     stroke   `border`·`outline` shorthand 에 섞인 길이 → `--stroke`(1.5px) 와 대조한다
 *     잡음     그 외 비색 값(그라디언트 정지점 등) → 대조 상대가 없다. 측정에서 뺀다
 *     color    남은 색 값
 *   radius 는 새지 않아 그대로 간다. 셋을 한 모듈이 지는 이유는 **가르는 규칙이 색 축의 일부**라서다 —
 *   색 판정을 하지 않고서는 무엇이 stroke 로 갈지 정할 수 없다.
 *
 * ── 왜 D3 은 문자열 비교로 못 잡나
 *   드리프트(토큰이 있는데 값을 다시 적음)는 표기가 세 갈래다.
 *     D1 같은 표기        `#20264A` ↔ `--ink: #20264A`      문자열이 같다
 *     D2 대소문자/축약형   `#20264a`·`#fff` ↔ `#FFFFFF`      소문자화·6자리 전개로 같아진다
 *     D3 rgba 전개        `rgba(32,38,74,.45)` ↔ `#20264A`   **문자열로는 한 글자도 안 겹친다**
 *   D3 은 표기가 아니라 **색 자체가 같다**. 알파를 붙이려고 토큰의 RGB 를 십진수로 풀어 적은
 *   자리라서, 잡으려면 양쪽을 (r,g,b) 삼원색으로 환산해 비교해야 한다. 그래서 색인이 셋이다 —
 *   같은 표기(`byExact`) · 소문자(`byLower`) · 삼원색(`byRgb`). 실측 3건이 전부 여기서만 잡힌다.
 *
 * ── 왜 토큰 표를 다시 만드나
 *   `ctx.dict` 는 **추출용** 표다. 추출 쪽 축 정의는 `--stroke` 를 spacing 으로 넣는데
 *   (`extract.ts:50`, 감사 S3 원본 그대로다), 판정 쪽은 `--stroke` 를 자기 축으로 본다.
 *   같은 이름을 두 축에 두면 위 stroke 보정이 대조할 토큰을 못 찾는다. 게다가 판정은
 *   `deco.css` 토큰까지 본다(감사 원본이 그렇다 — 지금은 전부 other 축이라 이 세 축에
 *   걸리지 않지만, 나중에 `--deco-*-radius` 같은 것이 생기면 걸려야 한다).
 *   그래서 **값은 `ctx.dict` 에서 그대로 받고, 축만 판정 기준으로 다시 매긴다.**
 *
 * ── 알아 둘 것: 축 누수 50건은 `측정 제외` 다
 *   색 축 shorthand(`border: 1px solid #ccc`·그라디언트)에 색이 아닌 값이 섞여 들어온다.
 *   판정할 대상이 아니라 **측정에서 걷어내는** 것이라 위반으로 세면 안 된다 — 셋으로
 *   뭉치면 고칠 수 있는 580건이 그 안에 묻힌다는 것이 감사의 판단이었고(검토 항목 1번 승인),
 *   그 이름을 그대로 쓴다.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { AxisModule, AxisResult, Hit, ScanContext, Verdict } from "./types.ts";
import { verdictExceptionFor } from "./exceptions.ts";

/**
 * 판정 쪽 축. `Axis`(추출 쪽)와 이름이 겹치지만 **다른 표다** — `stroke`·`layout` 이 있고
 * `spacing` 이 없다. 위 "왜 토큰 표를 다시 만드나" 참고.
 */
type JudgeAxis = "color" | "radius" | "stroke" | "font" | "layout" | "motion" | "other";

/** 색 토큰. `s4-classify.py:45-48` 그대로. */
const COLOR_TOKENS = new Set([
  "--paper","--surface","--cream","--canvas","--subtle","--border",
  "--ink","--ink-2","--ink-3","--accent","--accent-tint","--accent-tint2",
  "--pop","--pop-tint","--pop-ink","--grid-line","--hatch-border","--hatch",
]);
const LAYOUT_TOKENS = new Set(["--measure","--content-max","--wide-max","--page-pad","--header-h"]);

/** 토큰이 사는 축 — 판정 기준. `s4-classify.py:44-55` 그대로. */
function judgeTokenAxis(name: string): JudgeAxis {
  if (name.startsWith("--cat-") || COLOR_TOKENS.has(name)) return "color";
  if (name.includes("radius")) return "radius";
  if (name.startsWith("--font-")) return "font";
  if (name === "--stroke") return "stroke";
  if (LAYOUT_TOKENS.has(name)) return "layout";
  if (name === "--ease" || name === "--dur") return "motion";
  return "other";
}

const TOKEN_LINE = /^\s*(--[\w-]+)\s*:\s*(.+?);\s*(?:\/\*.*)?$/;
const HEX  = /^#([0-9a-fA-F]{3,8})$/;
const RGBA = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/;
/** 색 값인가 — 헥스는 전체 일치, `rgb(`·`hsl(` 은 접두만 본다. `s4-classify.py:120`. */
const COLORVAL = /^(#[0-9a-fA-F]{3,8}$|rgba?\(|hsla?\()/;
const BORDERISH = /^(border|outline)/;
const LEN = /^-?\d*\.?\d+(px|rem|em)$/;

type Rgb = [number, number, number];

function hexTriple(v: string): Rgb | null {
  const m = HEX.exec(v.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  if (h.length < 6) return null;   // #abcd·#abcde 는 색이 아니다
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
}

function rgbTriple(v: string): Rgb | null {
  const m = RGBA.exec(v.trim());
  if (!m) return null;
  const t = [1, 2, 3].map((i) => Math.round(Number(m[i])));
  // `[\d.]+` 는 `1.2.3` 도 통과시킨다 — 원본이 ValueError 로 버리는 자리다.
  return t.some((n) => Number.isNaN(n)) ? null : (t as Rgb);
}

interface TokenRec { name: string; axis: JudgeAxis; origin: string; value: string }

/** 값 → 토큰 색인 셋. D1(같은 표기) · D2(소문자) · D3(삼원색) 이 각각 하나씩 쓴다. */
interface TokenIndex {
  byExact: Map<string, TokenRec[]>;
  byLower: Map<string, TokenRec[]>;
  byRgb: Map<string, TokenRec[]>;
  counts: { "tokens.css": number; "deco.css": number };
}

function push(map: Map<string, TokenRec[]>, key: string, rec: TokenRec): void {
  const cur = map.get(key);
  if (cur) cur.push(rec);
  else map.set(key, [rec]);
}

function buildIndex(ctx: ScanContext): TokenIndex {
  // tokens.css 는 공통 추출이 이미 읽었다 — 값은 그대로 쓰고 축만 다시 매긴다.
  const recs: TokenRec[] = [...ctx.dict.byName.values()].map((t) => ({
    name: t.name, axis: judgeTokenAxis(t.name), origin: "tokens.css", value: t.value,
  }));
  const tokensCount = recs.length;

  // deco.css 는 추출 대상이 아니라 여기서 읽는다(감사 원본과 같은 정규식).
  // **이름으로 접는다** — 스위치 토큰 넷(`--deco-op`·`--deco-t3`·`--deco-t4`·`--deco-wob`)은
  // 미디어쿼리·변종마다 다시 선언돼 69줄이 53개로 줄고, 대조 상대가 되는 값은 마지막 선언이다.
  const decoPath = join(ctx.root, "src/styles/deco.css");
  const deco = new Map<string, string>();
  if (existsSync(decoPath)) {
    for (const line of readFileSync(decoPath, "utf-8").split("\n")) {
      const m = TOKEN_LINE.exec(line);
      if (m) deco.set(m[1], m[2].trim());
    }
  }
  for (const [name, value] of deco) {
    recs.push({ name, axis: judgeTokenAxis(name), origin: "deco.css", value });
  }

  const idx: TokenIndex = {
    byExact: new Map(), byLower: new Map(), byRgb: new Map(),
    counts: { "tokens.css": tokensCount, "deco.css": recs.length - tokensCount },
  };
  for (const rec of recs) {
    push(idx.byExact, rec.value, rec);
    push(idx.byLower, rec.value.toLowerCase(), rec);
    const t = hexTriple(rec.value) ?? rgbTriple(rec.value);
    if (t) push(idx.byRgb, t.join(","), rec);
  }
  return idx;
}

/**
 * 정당한 예외는 `exceptions.ts` 한 곳에서만 정의된다(S10) — 여기서 다시 적지 않는다.
 * 근거 문서 위치가 필수 필드이고, 비면 게이트가 자기 자신을 비0 으로 끝낸다.
 * 공통 추출의 `Hit.excluded`(스캔 제외)와 섞지 않는다 — `viz.css` 의 색 리터럴이
 * 감사에서 위반으로 남아 있는 것이 그 차이다.
 */
function exceptionFor(path: string, _axis: JudgeAxis): string | null {
  const e = verdictExceptionFor(path);
  return e ? `${e.why} (근거 ${e.evidence.join(" · ")})` : null;
}

/** 드리프트 판정 — D1 → D2 → D3 순으로 보고 먼저 걸리는 것을 쓴다. */
function driftOf(idx: TokenIndex, axis: JudgeAxis, value: string): { label: string; rec: TokenRec } | null {
  for (const rec of idx.byExact.get(value) ?? []) {
    if (rec.axis === axis) return { label: "D1 같은 표기", rec };
  }
  for (const rec of idx.byLower.get(value.toLowerCase()) ?? []) {
    if (rec.axis === axis) return { label: "D2 대소문자만 다름", rec };
  }
  const hex = hexTriple(value);
  const t = hex ?? rgbTriple(value);
  if (t) {
    for (const rec of idx.byRgb.get(t.join(",")) ?? []) {
      // 값이 헥스면 표기 축약이고, rgba 면 토큰의 RGB 를 푼 것이다.
      if (rec.axis === axis) return { label: hex ? "D2 축약형/대소문자" : "D3 rgba 전개", rec };
    }
  }
  return null;
}

export const color: AxisModule = {
  id: "color",
  what: "색 · radius · 선 굵기 — tokens.css 대비",

  run(ctx: ScanContext): AxisResult {
    const idx = buildIndex(ctx);
    const verdicts: Verdict[] = [];
    const tally = new Map<string, number>();
    const count = (axis: string, v: string) => {
      const k = `${axis} / ${v}`;
      tally.set(k, (tally.get(k) ?? 0) + 1);
    };
    // 1차 이름을 받아 최종 판정을 접는다 — `측정 제외` 는 물을 수가 없어 `판정 불가` 다.
    // 집계는 1차 이름으로 센다(`s4-classify.json` 의 by_axis_verdict 와 그것으로 대조한다).
    const emit = (hit: Hit, axis: string, auditLabel: Verdict["auditLabel"], reason: string) => {
      const verdict: Verdict["verdict"] = auditLabel === "측정 제외" ? "판정 불가" : auditLabel;
      verdicts.push({ hit, verdict, auditLabel, reason });
      count(axis, auditLabel);
    };

    for (const hit of ctx.hits) {
      // 이 모듈이 지는 것은 색 축과 radius 축뿐이다. stroke·잡음은 색 축에서 갈라져 나온다.
      if (hit.axis !== "color" && hit.axis !== "radius") continue;
      let axis: JudgeAxis = hit.axis;

      if (hit.kind === "token") {
        emit(hit, axis, "준수", `var() 로 토큰을 썼다 — ${hit.value}`);
        continue;
      }

      // (1) 축 누수 보정 — 색 축에 들어온 비색 값을 가른다.
      if (axis === "color" && !COLORVAL.test(hit.value)) {
        if (BORDERISH.test(hit.prop.toLowerCase()) && LEN.test(hit.value)) {
          axis = "stroke";
        } else {
          emit(hit, "잡음", "측정 제외",
               "측정 제외 — 색 축 shorthand 에 섞인 비색 값(그라디언트 정지점 등)");
          continue;
        }
      }

      // (2)(3) 드리프트 — 같은 축의 토큰과 값이 같은가(표기 세 갈래를 다 본다).
      const drift = driftOf(idx, axis, hit.value);
      if (drift) {
        emit(hit, axis, "드리프트",
             `${drift.label} — ${drift.rec.name} (${drift.rec.origin} = ${drift.rec.value})`);
        continue;
      }

      const why = exceptionFor(hit.file, axis);
      if (why) { emit(hit, axis, "정당한 예외", why); continue; }

      // 남은 것은 전부 위반이다. 이 세 축은 셋 다 대조할 토큰 체계가 있어서다 —
      // 색 18종 · radius 5종 · `--stroke` 1종. 감사가 쓴 「토큰 미존재」 갈래
      // (`s4-classify.py:112-118` 의 `comparable()`)는 여기 없고, 토큰 자체가 없는 축
      // (간격 · 그림자 · z-index · 글자 크기)을 지는 다른 축 모듈의 몫이다.
      emit(hit, axis, "위반",
           `${axis} 축에 토큰 체계가 있는데 토큰 밖 값이고 근거 문서를 못 걸었다`);
    }

    const notes = [...tally.entries()].sort(([a], [b]) => a.localeCompare(b))
      .map(([k, n]) => `${k} ${n}건`);
    const noise = tally.get("잡음 / 측정 제외") ?? 0;
    if (noise) {
      notes.push(`잡음 ${noise}건은 위반이 아니라 측정 제외다 — 색 축 shorthand 에 섞인 비색 값이라` +
                 ` 대조할 토큰이 없다(1차 이름은 「측정 제외」이고 최종 판정은 물을 수가 없어 「판정 불가」다)`);
    }

    return {
      id: "color",
      verdicts,
      // 래칫이 붙기 전이라 비워 둔다 — 기준선 대비 판정은 S7 이 진다.
      failures: [],
      notes: [
        `색 축 판정 ${verdicts.length}건 (토큰 ${idx.counts["tokens.css"]} + 데코 ${idx.counts["deco.css"]})`,
        ...notes,
      ],
    };
  },
};
