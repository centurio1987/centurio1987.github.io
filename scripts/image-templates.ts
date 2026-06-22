// 구조형 이미지 HTML 템플릿 모듈. render-image.ts가 import 한다.
// 외부 검토 반영: 단순 토큰 치환 대신 타입별 함수 + HTML escaping으로 주입/깨짐을 방지한다.
// 가이드: .claude/skills/make-image/assets/IMAGE_GUIDE.md

export type FigureType =
  | "hero"
  | "compare-table"
  | "step-diagram"
  | "point-cards"
  | "quote-box";

// 모든 동적 텍스트는 이 함수를 거쳐 주입한다.
export function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// 공통 테마 CSS. 로컬 Pretendard가 있으면 우선, 없으면 CDN(사이트와 동일 소스) 폴백.
// 폰트 페인팅 완료는 render-image.ts가 document.fonts.ready로 보장한다.
const FONT_CSS = `
@font-face {
  font-family: "Pretendard Variable";
  font-weight: 45 920;
  font-style: normal;
  font-display: block;
  src: local("Pretendard Variable"),
       url("/fonts/PretendardVariable.woff2") format("woff2-variations");
}
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css");
`;

const BASE_CSS = `
${FONT_CSS}
* { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg0: #1a1a2e; --bg1: #16213e; --ink: #f5f6fb; --muted: #aab0c6;
  --accent: #8b7bd8; --accent2: #e8c97a; --line: rgba(255,255,255,.14);
  --card: rgba(255,255,255,.05); --mono: "JetBrains Mono", ui-monospace, monospace;
}
html, body {
  font-family: "Pretendard Variable", Pretendard, system-ui, -apple-system, sans-serif;
  color: var(--ink);
  background: transparent;
  -webkit-font-smoothing: antialiased;
}
#capture {
  background: linear-gradient(135deg, var(--bg0), var(--bg1));
  color: var(--ink);
}
.title { font-weight: 800; letter-spacing: -.01em; }
.muted { color: var(--muted); }
.accent-dot { width: 14px; height: 14px; border-radius: 4px; background: var(--accent2); display: inline-block; }
`;

function doc(width: number, inner: string, extraCss = ""): string {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<style>${BASE_CSS}${extraCss}
#capture { width: ${width}px; }
</style></head><body><div id="capture">${inner}</div></body></html>`;
}

// ── hero: 1080×1080 정사각형 대표 이미지 ──────────────────────────────
function hero(d: Record<string, unknown>): string {
  const css = `
#capture { width:1080px; height:1080px; display:flex; flex-direction:column;
  align-items:center; justify-content:center; text-align:center; padding:96px; position:relative; }
#capture .h-title { font-size:72px; line-height:1.18; font-weight:800; max-width:880px; }
#capture .h-sub { margin-top:28px; font-size:30px; color:var(--muted); }
#capture .h-cat { position:absolute; top:64px; left:64px; font-size:24px; color:var(--accent2);
  font-weight:700; letter-spacing:.02em; }
#capture .h-accent { position:absolute; bottom:64px; right:64px; display:flex; gap:10px; align-items:center; }
#capture .h-accent .sym { font-family:var(--mono); font-size:28px; color:var(--accent); }
`;
  const cat = d.category ? `<div class="h-cat">${esc(d.category)}</div>` : "";
  const sub = d.subtitle ? `<div class="h-sub">${esc(d.subtitle)}</div>` : "";
  return doc(1080, `
    ${cat}
    <div class="h-title title">${esc(d.title)}</div>
    ${sub}
    <div class="h-accent"><span class="accent-dot"></span><span class="sym">{ }</span></div>
  `, css);
}

// ── compare-table ────────────────────────────────────────────────────
function compareTable(d: Record<string, unknown>): string {
  const cols = (d.columns as string[]) ?? [];
  const rows = (d.rows as string[][]) ?? [];
  const css = `
#capture { padding:56px 64px 64px; }
#capture .c-title { font-size:40px; margin-bottom:32px; }
#capture table { width:100%; border-collapse:collapse; font-size:26px; }
#capture th, #capture td { text-align:left; padding:18px 22px; border-bottom:1px solid var(--line); }
#capture thead th { color:var(--accent2); font-weight:700; border-bottom:2px solid var(--accent); }
#capture tbody tr td:first-child { font-weight:700; color:var(--ink); }
#capture tbody td:not(:first-child) { color:var(--muted); }
`;
  const head = `<tr>${cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr>`;
  const body = rows
    .map((r) => `<tr>${r.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`)
    .join("");
  return doc(1200, `
    <div class="c-title title">${esc(d.title)}</div>
    <table><thead>${head}</thead><tbody>${body}</tbody></table>
  `, css);
}

// ── step-diagram ─────────────────────────────────────────────────────
function stepDiagram(d: Record<string, unknown>): string {
  const steps = (d.steps as Array<{ label: string; desc?: string }>) ?? [];
  const css = `
#capture { padding:56px 64px 64px; }
#capture .s-title { font-size:40px; margin-bottom:40px; }
#capture .s-row { display:flex; align-items:stretch; gap:0; }
#capture .s-step { flex:1; background:var(--card); border:1px solid var(--line); border-radius:16px;
  padding:28px 24px; display:flex; flex-direction:column; gap:12px; }
#capture .s-num { font-family:var(--mono); font-size:22px; color:var(--accent2); }
#capture .s-label { font-size:28px; font-weight:800; }
#capture .s-desc { font-size:22px; color:var(--muted); line-height:1.4; }
#capture .s-arrow { display:flex; align-items:center; color:var(--accent); font-size:40px; padding:0 14px; }
`;
  const items = steps
    .map((s, i) => {
      const arrow = i < steps.length - 1 ? `<div class="s-arrow">→</div>` : "";
      const desc = s.desc ? `<div class="s-desc">${esc(s.desc)}</div>` : "";
      return `<div class="s-step"><div class="s-num">0${i + 1}</div>
        <div class="s-label">${esc(s.label)}</div>${desc}</div>${arrow}`;
    })
    .join("");
  return doc(1200, `
    <div class="s-title title">${esc(d.title)}</div>
    <div class="s-row">${items}</div>
  `, css);
}

// ── point-cards (3~5장) ──────────────────────────────────────────────
function pointCards(d: Record<string, unknown>): string {
  const cards = ((d.cards as Array<{ title: string; body?: string }>) ?? []).slice(0, 5);
  const css = `
#capture { padding:56px 64px 64px; }
#capture .p-title { font-size:40px; margin-bottom:36px; }
#capture .p-grid { display:flex; flex-wrap:wrap; gap:24px; }
#capture .p-card { flex:1 1 calc(33.333% - 24px); min-width:300px; background:var(--card);
  border:1px solid var(--line); border-left:4px solid var(--accent); border-radius:14px; padding:28px; }
#capture .p-ct { font-size:28px; font-weight:800; margin-bottom:12px; }
#capture .p-cb { font-size:22px; color:var(--muted); line-height:1.45; }
`;
  const items = cards
    .map((c) => {
      const body = c.body ? `<div class="p-cb">${esc(c.body)}</div>` : "";
      return `<div class="p-card"><div class="p-ct">${esc(c.title)}</div>${body}</div>`;
    })
    .join("");
  return doc(1200, `
    <div class="p-title title">${esc(d.title)}</div>
    <div class="p-grid">${items}</div>
  `, css);
}

// ── quote-box ────────────────────────────────────────────────────────
function quoteBox(d: Record<string, unknown>): string {
  const css = `
#capture { padding:80px 72px; display:flex; flex-direction:column; justify-content:center; min-height:420px; }
#capture .q-mark { font-family:var(--mono); font-size:96px; color:var(--accent); line-height:.6; }
#capture .q-text { font-size:44px; font-weight:800; line-height:1.35; margin-top:8px; }
#capture .q-attr { margin-top:28px; font-size:24px; color:var(--accent2); }
`;
  const attr = d.attribution ? `<div class="q-attr">— ${esc(d.attribution)}</div>` : "";
  return doc(1100, `
    <div class="q-mark">&ldquo;</div>
    <div class="q-text">${esc(d.quote)}</div>
    ${attr}
  `, css);
}

const RENDERERS: Record<FigureType, (d: Record<string, unknown>) => string> = {
  hero,
  "compare-table": compareTable,
  "step-diagram": stepDiagram,
  "point-cards": pointCards,
  "quote-box": quoteBox,
};

export function renderTemplate(type: string, data: Record<string, unknown>): string {
  const fn = RENDERERS[type as FigureType];
  if (!fn) {
    throw new Error(
      `unknown figure type "${type}". allowed: ${Object.keys(RENDERERS).join(", ")}`,
    );
  }
  return fn(data);
}
