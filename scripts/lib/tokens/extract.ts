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
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import type { Axis, Hit, TokenDef, TokenDict } from "./types.ts";
import { scanExceptionFor } from "./exceptions.ts";

// ── 축 정의: CSS 속성 → 축. 원본 s3-scan.py:29-46 그대로.
const AXIS = new Map<string, Axis>();
const reg = (axis: Axis, ...props: string[]) => props.forEach((p) => AXIS.set(p, axis));
reg("color", "color","background","background-color","background-image","border-color",
  "border","border-top","border-right","border-bottom","border-left",
  "border-top-color","border-right-color","border-bottom-color","border-left-color",
  "outline","outline-color","fill","stroke","stop-color","stopcolor",
  "text-decoration-color","caret-color","accent-color","backgroundcolor","bordercolor");
reg("spacing","margin","margin-top","margin-right","margin-bottom","margin-left",
  "padding","padding-top","padding-right","padding-bottom","padding-left",
  "gap","row-gap","column-gap","top","right","bottom","left","inset",
  "width","height","min-width","min-height","max-width","max-height","flex-basis");
reg("radius","border-radius","border-top-left-radius","border-top-right-radius",
  "border-bottom-left-radius","border-bottom-right-radius","borderradius");
reg("shadow","box-shadow","text-shadow","filter","boxshadow","textshadow");
reg("font","font","font-family","font-size","font-weight","line-height","letter-spacing",
  "fontfamily","fontsize","fontweight","lineheight","letterspacing");
reg("zindex","z-index","zindex");

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
): Hit[] {
  const out: Hit[] = [];
  for (const m of raw.matchAll(VARUSE)) {
    out.push({ axis, kind: "token", prop, value: `var(${m[1]})`, token: m[1],
               sameValueOtherAxis: null, file, line, src, excluded });
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
               file, line, src, excluded });
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

    for (const [chunkRaw, off] of regions) {
      const chunk = chunkRaw.replace(COMMENT_CSS, (m) => "\n".repeat(nl(m)));
      for (const m of chunk.matchAll(DECL)) {
        const axis = AXIS.get(m[1].trim().toLowerCase());
        if (!axis) continue;
        hits.push(...classify(dict, axis, m[1], m[2], rel, off + nl(chunk.slice(0, m.index!)) + 1, "css-decl", ex));
      }
    }

    // ── B/C. JSX 속성 + 인라인 style 객체
    if (rel.endsWith(".astro") || rel.endsWith(".tsx")) {
      const body = rel.endsWith(".astro")
        ? text.replace(STYLE_BLOCK, (m) => "\n".repeat(nl(m)))
        : text;
      for (const [pat, src] of [[ATTR, "jsx-attr"], [JSXOBJ, "style-obj"]] as const) {
        for (const m of body.matchAll(pat)) {
          const axis = AXIS.get(m[1].trim().toLowerCase());
          if (!axis) continue;
          hits.push(...classify(dict, axis, m[1], m[2], rel, nl(body.slice(0, m.index!)) + 1, src, ex));
        }
      }
    }
  }
  return { files, dict, hits };
}
