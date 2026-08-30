/**
 * 공통 추출 — `scripts/fixtures/tokens/reference/s3-scan.py` 의 TS 이식 (KAN-070 S2).
 *
 * 이것은 축 모듈이 아니다. **진입점이 소유하는 공통 층**이다.
 *   토큰 사전 · 파일 목록 · 제외 규칙 · 히트 추출을 여기서 한 번에 만들어
 *   축 모듈 셋에 같은 것을 넘긴다. 축마다 각자 파일을 훑으면 제외 규칙이 세 벌이 된다.
 *
 * **원본을 한 글자도 안 바꿔 옮겼다.** 정규식·축 정의·분류 규칙이 원본과 다르면
 * 감사 원자료(3,539 히트)와 히트 단위로 대조할 수 없고, 그러면 이식이 맞는지 판정할
 * 방법이 사라진다. 고칠 것이 있으면 여기가 아니라 축 모듈에서 고친다.
 *
 * **KAN-073 이 인식층을 넓혔다 — 옛 경로는 그대로 두고 덧붙였다.**
 *   정규식 넷(`DECL`·`ATTR`·`JSXOBJ`·`LITERAL`)과 아래 A·B/C 구간은 한 글자도 안 바뀌었다.
 *   새 갈래는 `recognize/` 의 인식기들이 내고 **새 `src` 라벨**을 달고 나오므로,
 *   `src ∈ {css-decl, jsx-attr, style-obj}` 로 거르면 옛 집합이 그대로 재현된다.
 *
 * **KAN-076 이 다섯째 갈래를 열었다 — `stroke-width` 계열.**
 *   `AXIS` 표에 속성 자체가 없어서 네 형태(svg 속성 · CSS 선언 · JSX 표현식 · style 객체)가
 *   통째로 판정 밖이었다. 표에 보태지 않고 인식기(`recognize/svgStroke.ts`)로 붙였으므로
 *   옛 경로는 이 축(`Axis` 의 `"stroke"`)을 **영영 못 낸다** — 그것이 옛 집합 불변의 근거다.
 *   그 인식기가 `Hit.coord` 를 채우고, 판정은 그 단위를 **드리프트 검사보다 먼저** 본다.
 *
 * **KAN-075 가 넷째 갈래를 열었다 — 여기서는 옛 히트가 한 건도 안 움직인다.**
 *   줄바꿈을 넘는 CSS 선언(`multilineDecl`)이고, `DECL` 을 고치는 대신 같은 구간을
 *   다시 훑는 별도 패스로 붙였다. 그래서 KAN-073 이 관문 3 에서 옛 집합을 1건 움직인 것과
 *   달리 **증분이 정확히 0** 이다. 그 인식기가 A 구간과 **같은 바이트**를 보게 하려고
 *   아래 A 구간이 주석을 걷어낸 본문을 `cssChunks` 로 모아 넘긴다.
 *   축 표(`AXIS`)는 `propAxis.ts` 로 자리만 옮겼고 **내용은 원본 그대로다** —
 *   거기에 camelCase 를 보태면 그 값을 줍는 것이 새 인식기가 아니라 기존 `JSXOBJ` 라서
 *   옛 집합이 움직인다. 새 인식기만 `propAxis.axisOfProp()` 의 넓은 표를 쓴다.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import type { Axis, CoordUnit, Hit, TokenDef, TokenDict } from "./types.ts";
import { scanExceptionFor } from "./exceptions.ts";
import { axisOfProp } from "./propAxis.ts";
import type { RecognizeInput, Recognizer } from "./recognize/types.ts";
import { styleNum } from "./recognize/styleNum.ts";
import { exprValue } from "./recognize/exprValue.ts";
import { attrCss } from "./recognize/attrCss.ts";
import { multilineDecl } from "./recognize/multilineDecl.ts";
import { svgStroke } from "./recognize/svgStroke.ts";

/**
 * 새 인식층 — 갈래마다 하나. 진입점이 자가검사 고장도 여기서 모은다.
 * 순서는 보고 순서일 뿐이고 판정에는 영향이 없다.
 */
export const RECOGNIZERS: Recognizer[] = [styleNum, exprValue, attrCss, multilineDecl, svgStroke];

// ── 축 정의는 `propAxis.ts` 가 소유한다(내용은 원본 s3-scan.py:29-46 그대로 + camelCase 생성).
//
//    **옛 경로도 넓은 표를 쓴다 (KAN-073 S5, 관문 3).** 원본 표는 camelCase 를 일부만
//    들고 있어서(`backgroundcolor`·`fontsize` 는 있고 `minwidth`·`margintop` 은 없다)
//    `marginLeft: "16px"` 같은 **따옴표 값**이 축이 없다는 이유로 버려지고 있었다.
//    이 한 줄이 옛 히트를 움직이는 유일한 변경이고, 실측 증분은 정확히 1건이다 —
//    `src/components/posts/vpn-anatomy-2/NonceReuseLab.tsx:306` 의 `minWidth: "10rem"`.
//    (`marginLeft: "auto"` 5자리는 `LITERAL` 이 안 물어 0건이다.)
//    그 1건은 `scripts/fixtures/tokens/reference/` 대조에서 화이트리스트로 다룬다.

/**
 * 토큰이 사는 축. 원본 s3-scan.py:56-72 그대로.
 *
 * 축을 따로 매기는 이유가 있다 — `padding: 8px` 이 `--radius-sm: 8px` 와 값이 같다고
 * "토큰이 있는데 안 썼다"로 세면 안 된다. 그건 드리프트가 아니라 **우연**이다.
 */
const COLOR_TOKENS = new Set([
  "--paper","--surface","--cream","--canvas","--subtle","--border",
  "--ink","--ink-2","--ink-3","--accent","--accent-tint","--accent-tint2",
  "--pop","--pop-tint","--pop-ink","--grid-line","--hatch-border","--hatch",
]);
function tokenAxis(name: string): Axis {
  if (name.startsWith("--cat-") || COLOR_TOKENS.has(name)) return "color";
  if (name.includes("radius")) return "radius";
  if (name.startsWith("--font-")) return "font";
  if (["--stroke","--measure","--content-max","--wide-max","--page-pad","--header-h"].includes(name)) return "spacing";
  if (["--ease","--dur"].includes(name)) return "motion";
  return "other";
}

// ── 정규식. 원본 s3-scan.py:74-87 그대로.
const TOKEN_LINE = /^\s*(--[\w-]+)\s*:\s*(.+?);\s*(?:\/\*.*)?$/;
const DECL       = /(?<![\w-])([a-zA-Z-]{3,30})\s*:\s*([^;{}\n]{1,200});/g;
const ATTR       = /(?<![\w-])([a-zA-Z-]{3,30})\s*=\s*"([^"\n]{1,200})"/g;
const JSXOBJ     = /(?<![\w-])([a-zA-Z-]{3,30})\s*:\s*"([^"\n]{1,200})"/g;
const STYLE_BLOCK= /<style[^>]*>([\s\S]*?)<\/style>/g;
const COMMENT_CSS= /\/\*[\s\S]*?\*\//g;
const TEMPLATE   = /`[^`]*`/gs;
const LITERAL    = /(#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|-?\d*\.?\d+(?:px|rem|em|vh|vw|ch|%)|\b\d{1,4}\b)/g;
const VARUSE     = /var\(\s*(--[\w-]+)/g;
const VARCALL    = /var\([^)]*\)/g;

function collectFiles(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(astro|tsx|css)$/.test(e.name)) out.push(relative(root, p).split(sep).join("/"));
    }
  };
  walk(join(root, "src"));
  // 정본 자신은 대상이 아니다.
  return out.filter((f) => f !== "src/styles/tokens.css").sort();
}

export function readTokenDict(root: string): TokenDict {
  const byName = new Map<string, TokenDef>();
  const byValue = new Map<string, string[]>();
  const text = readFileSync(join(root, "src/styles/tokens.css"), "utf-8");
  for (const line of text.split("\n")) {
    const m = TOKEN_LINE.exec(line);
    if (!m) continue;
    const name = m[1], value = m[2].trim();
    byName.set(name, { name, value, axis: tokenAxis(name) });
    const key = value.toLowerCase();
    byValue.set(key, [...(byValue.get(key) ?? []), name]);
  }
  return { byName, byValue };
}

function classify(
  dict: TokenDict, axis: Axis, prop: string, raw: string,
  file: string, line: number, src: Hit["src"], excluded: string | null,
  rawValue?: string, coord?: CoordUnit,
): Hit[] {
  const out: Hit[] = [];
  // 좌표계는 값이 아니라 **자리**의 성질이라 그 자리에서 나온 히트 전부가 같은 것을 진다
  // (한 값 자리가 리터럴 둘을 낼 수 있다 — `strokeWidth={1 + 2.4 * s}`).
  const extra = { ...(rawValue ? { rawValue } : {}), ...(coord ? { coord } : {}) };
  for (const m of raw.matchAll(VARUSE)) {
    out.push({ axis, kind: "token", prop, value: `var(${m[1]})`, token: m[1],
               sameValueOtherAxis: null, file, line, src, excluded, ...extra });
  }
  // var() 안쪽은 리터럴이 아니다 — 지우고 남은 것만 본다.
  const stripped = raw.replace(VARCALL, " ");
  for (const m of stripped.matchAll(LITERAL)) {
    const v = m[1];
    if (axis === "zindex" && !/^-?\d{1,4}$/.test(v)) continue;
    // 단위 없는 맨 숫자는 font-weight·line-height 에서만 뜻이 있다.
    if (axis !== "zindex" && /^\d{1,4}$/.test(v) && axis !== "font") continue;
    const all = dict.byValue.get(v.trim().toLowerCase()) ?? [];
    const hits = all.filter((t) => dict.byName.get(t)!.axis === axis);
    const loose = all.filter((t) => dict.byName.get(t)!.axis !== axis);
    out.push({ axis, kind: hits.length ? "literal_dup" : "literal_new", prop, value: v,
               token: hits.length ? hits : null,
               sameValueOtherAxis: loose.length ? loose : null,
               file, line, src, excluded, ...extra });
  }
  return out;
}

const nl = (s: string) => (s.match(/\n/g) ?? []).length;

export function extract(root: string): { files: string[]; dict: TokenDict; hits: Hit[] } {
  const dict = readTokenDict(root);
  const files = collectFiles(root);
  const hits: Hit[] = [];

  for (const rel of files) {
    const text = readFileSync(join(root, rel), "utf-8");
    // 예외 표는 `exceptions.ts` 하나뿐이다 — 여기서 다시 정의하지 않는다(S10).
    const exc = scanExceptionFor(rel, text);
    const ex = exc ? `${exc.id} — ${exc.why} (근거 ${exc.evidence.join(' · ')})` : null;

    // ── A. CSS 선언 — .css 전체 · .astro 의 <style> · .tsx 의 템플릿 리터럴
    let regions: [string, number][];
    if (rel.endsWith(".css")) regions = [[text, 0]];
    else if (rel.endsWith(".astro"))
      regions = [...text.matchAll(STYLE_BLOCK)].map((m) => [m[1], nl(text.slice(0, m.index! + m[0].indexOf(m[1])))]);
    else
      regions = [...text.matchAll(TEMPLATE)].map((m) => [m[0], nl(text.slice(0, m.index!))]);

    // 새 인식층이 **A 구간과 같은 바이트**를 보게 하려고 여기서 모아 둔다(KAN-075).
    // 인식기가 주석을 다시 걷으면 옛 경로와 다른 것을 보게 되고, 그러면
    // 「옛 경로가 못 보던 자리」라는 말이 성립하지 않는다.
    const cssChunks: [string, number][] = [];

    for (const [chunkRaw, off] of regions) {
      const chunk = chunkRaw.replace(COMMENT_CSS, (m) => "\n".repeat(nl(m)));
      cssChunks.push([chunk, off]);
      for (const m of chunk.matchAll(DECL)) {
        const axis = axisOfProp(m[1]);
        if (!axis) continue;
        hits.push(...classify(dict, axis, m[1], m[2], rel, off + nl(chunk.slice(0, m.index!)) + 1, "css-decl", ex));
      }
    }

    // ── 위 A 구간이 **먹은 바이트 범위**. 새 인식층이 같은 자리를 두 번 세지 않게 넘긴다.
    //    `.tsx` 의 템플릿 리터럴이 여기 들어온다 — 옛 경로와 새 경로가 겹치는 유일한 자리다.
    const legacyCssSpans: [number, number][] =
      rel.endsWith(".css")
        ? [[0, text.length]]
        : [...text.matchAll(rel.endsWith(".astro") ? STYLE_BLOCK : TEMPLATE)]
            .map((m) => [m.index!, m.index! + m[0].length] as [number, number]);

    // ── B/C. JSX 속성 + 인라인 style 객체
    if (rel.endsWith(".astro") || rel.endsWith(".tsx")) {
      const body = rel.endsWith(".astro")
        ? text.replace(STYLE_BLOCK, (m) => "\n".repeat(nl(m)))
        : text;
      for (const [pat, src] of [[ATTR, "jsx-attr"], [JSXOBJ, "style-obj"]] as const) {
        for (const m of body.matchAll(pat)) {
          const axis = axisOfProp(m[1]);
          if (!axis) continue;
          hits.push(...classify(dict, axis, m[1], m[2], rel, nl(body.slice(0, m.index!)) + 1, src, ex));
        }
      }
    }

    // ── D. 새 인식층 (KAN-073) — 옛 경로가 못 보는 갈래들.
    //    **반드시 같은 `classify()` 를 지나간다.** 예외 표(`ex`)와 `var()` 제거가 거기 붙어
    //    있어서, 직접 `hits.push` 하면 AUTO-GENERATED viz 파일의 리터럴이 새고
    //    `var(--stroke, 1.5px)` 같은 이미 준수인 자리가 위반으로 잡힌다.
    const input: RecognizeInput = {
      file: rel, text, legacyCssSpans, cssChunks,
      lineAt: (offset) => nl(text.slice(0, offset)) + 1,
    };
    for (const r of RECOGNIZERS) {
      for (const rec of r.scan(input)) {
        hits.push(...classify(dict, rec.axis, rec.prop, rec.value, rel, rec.line, rec.src, ex, rec.rawValue, rec.coord));
      }
    }
  }
  return { files, dict, hits };
}
