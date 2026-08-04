#!/usr/bin/env bun
/**
 * check-emphasis — 본문의 **강조**·*강조* 가 실제로 렌더되는지 검증한다.
 *
 * 왜 필요한가.
 *   CommonMark 는 `*` 를 만난 자리의 앞뒤 글자를 보고 그 자리가 강조를 열 수 있는지
 *   닫을 수 있는지를 정한다(flanking 규칙). 닫는 자리는 **앞이 문장부호이면 뒤가
 *   공백이나 문장부호여야만** 닫힌다. 한국어는 조사가 곧바로 붙어 뒤가 항상 글자라,
 *
 *       그래서 **창(window)**이 등장합니다.
 *                          ^^ 앞이 `)` 이고 뒤가 `이` → 닫지 못한다
 *
 *   처럼 괄호·따옴표·`—` 로 끝나는 강조가 **에러 없이** 별표째 화면에 나온다.
 *   빌드도 타입도 초록이고 눈으로만 잡히므로 게이트가 필요하다.
 *
 * 두 모드.
 *   (기본) 소스 모드 — md·mdx 원문을 훑는다. 빌드가 필요 없어 draft 에도 쓴다.
 *   --dist 렌더 모드 — 빌드 산출물 HTML 에 살아남은 별표를 찾는다. 이쪽이 정본이다.
 *                     (소스 모드는 CommonMark 의 "3의 배수" 규칙을 구현하지 않아
 *                      드물게 놓칠 수 있다. 발행 전에는 --dist 를 함께 돌린다.)
 *
 * 사용:
 *   bun scripts/check-emphasis.ts                 # src/content/posts/
 *   bun scripts/check-emphasis.ts draft/x.mdx     # 경로 지정
 *   bun scripts/check-emphasis.ts --dist          # 빌드 후 dist/ 검증
 *
 * 문제가 있으면 종료코드 1.
 */

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const POSTS_DIR = join(ROOT, "src/content/posts");
const DIST_DIR = join(ROOT, "dist");

type Finding = { file: string; line: number; reason: string; excerpt: string };

/* ─────────────────────────── 문자 분류 (CommonMark) ─────────────────────────── */

// 줄 경계는 공백으로 친다.
const isWs = (c: string | undefined) => c === undefined || /\s/u.test(c);
// CommonMark 0.31 은 유니코드 구두점(P)과 기호(S)를 문장부호로 본다.
// 한국어 본문의 `·` `—` `「」` `""` 가 전부 여기 걸린다.
const isPunct = (c: string | undefined) => c !== undefined && /[\p{P}\p{S}]/u.test(c);

/* ─────────────────────────── 소스 모드 ─────────────────────────── */

/** 강조 판정 대상이 아닌 구간을 같은 길이의 공백으로 덮는다(줄·열 번호 보존). */
function maskNonProse(src: string): string {
  let s = src;

  // 블록 단위로 통째로 빼는 것은 공백으로 덮어도 된다.
  const blank = (m: string) => m.replace(/[^\n]/gu, " ");
  // 인라인 요소는 **양 끝 글자를 남기고** 속만 덮는다. 강조의 열림·닫힘은 바로 옆
  // 글자가 공백인지 문장부호인지로 갈리므로, 백틱이나 `<` 를 공백으로 바꾸면
  // 판정이 통째로 뒤집힌다.
  const gut = (m: string) => m[0] + m.slice(1, -1).replace(/[^\n]/gu, "x") + m[m.length - 1];

  // frontmatter
  s = s.replace(/^---\n[\s\S]*?\n---\n/u, blank);
  // 펜스드 코드블록 (``` / ~~~)
  s = s.replace(/^([ \t]*)(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\2[^\n]*$/gmu, blank);
  // HTML 주석 · MDX 주석({/* … */}) — 둘 다 렌더되지 않는다
  s = s.replace(/<!--[\s\S]*?-->/gu, blank);
  s = s.replace(/\{\/\*[\s\S]*?\*\/\}/gu, blank);
  // MDX import/export 문
  s = s.replace(/^[ \t]*(?:import|export)\s[^\n]*$/gmu, blank);
  // 인라인 코드 (백틱 개수 일치)
  s = s.replace(/(`+)(?:[^`]|(?!\1)`)*?\1/gu, gut);
  // JSX/HTML 태그 — 속성값에 별표가 들어갈 수 있다
  s = s.replace(/<\/?[A-Za-z][^\n>]*>/gu, gut);
  // 이스케이프된 별표는 구분자가 아니다
  s = s.replace(/\\\*/gu, "\\x");

  return s;
}

type Run = { start: number; len: number; canOpen: boolean; canClose: boolean };

function scanRuns(text: string): Run[] {
  const runs: Run[] = [];
  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] !== "*") continue;
    const start = i;
    while (i + 1 < chars.length && chars[i + 1] === "*") i++;
    const len = i - start + 1;
    const before = start > 0 ? chars[start - 1] : undefined;
    const after = i + 1 < chars.length ? chars[i + 1] : undefined;

    const left = !isWs(after) && (!isPunct(after) || isWs(before) || isPunct(before));
    const right = !isWs(before) && (!isPunct(before) || isWs(after) || isPunct(after));

    runs.push({ start, len, canOpen: left, canClose: right });
  }
  return runs;
}

function why(text: string, run: Run): string {
  const chars = [...text];
  const before = run.start > 0 ? chars[run.start - 1] : "(줄머리)";
  const after = chars[run.start + run.len] ?? "(줄끝)";
  const tag = (c: string) =>
    c.startsWith("(") ? c : isWs(c) ? "공백" : isPunct(c) ? `\`${c}\`(문장부호)` : `\`${c}\`(글자)`;
  return `앞 ${tag(before)} · 뒤 ${tag(after)}`;
}

/**
 * 인라인 한 덩어리 안에서 별표 구분자를 짝지어 본다.
 * CommonMark 의 "3의 배수" 규칙은 생략했다 — 놓치는 쪽이지 없는 문제를 만들지는 않는다.
 */
function checkInline(text: string, file: string, lineBase: number, findings: Finding[]) {
  const runs = scanRuns(text);
  if (runs.length === 0) return;

  const stack: Run[] = [];
  const dead: Run[] = [];

  for (const run of runs) {
    let r = { ...run };
    while (r.len > 0 && r.canClose && stack.length > 0) {
      const opener = stack[stack.length - 1];
      const matched = Math.min(opener.len, r.len);
      opener.len -= matched;
      r.len -= matched;
      if (opener.len === 0) stack.pop();
    }
    if (r.len > 0) {
      if (r.canOpen) stack.push(r);
      else dead.push(run);
    }
  }

  const report = (run: Run, reason: string) => {
    const upto = [...text].slice(0, run.start).join("");
    const line = lineBase + (upto.match(/\n/gu)?.length ?? 0);
    const lineStart = upto.lastIndexOf("\n") + 1;
    const excerpt = text.slice(Math.max(lineStart, run.start - 30), run.start + 30).replace(/\n/gu, "⏎");
    findings.push({ file, line, reason: `${reason} (${why(text, run)})`, excerpt });
  };

  for (const run of dead) report(run, `\`${"*".repeat(run.len)}\` 가 강조를 열지도 닫지도 못함`);
  for (const run of stack) report(run, `\`${"*".repeat(run.len)}\` 가 닫히지 않음`);
}

function checkSourceFile(path: string, findings: Finding[]) {
  const raw = readFileSync(path, "utf8");
  const masked = maskNonProse(raw);
  const file = relative(ROOT, path);

  // 빈 줄로 블록을 가르고, 표 행은 셀 단위로 따로 본다(GFM 은 셀마다 인라인을 새로 판다).
  const lines = masked.split("\n");
  let block: string[] = [];
  let blockStart = 1;

  const flush = () => {
    if (block.length === 0) return;
    const text = block.join("\n");
    if (text.trim()) checkInline(text, file, blockStart, findings);
    block = [];
  };

  lines.forEach((line, idx) => {
    const lineNo = idx + 1;
    if (!line.trim()) {
      flush();
      return;
    }
    if (/^\s*\|/u.test(line)) {
      flush();
      let col = 0;
      for (const cell of line.split("|")) {
        if (cell.trim()) checkInline(cell, file, lineNo, findings);
        col += cell.length + 1;
      }
      blockStart = lineNo + 1;
      return;
    }
    if (block.length === 0) blockStart = lineNo;
    block.push(line);
  });
  flush();
}

/* ─────────────────────────── 렌더 모드 ─────────────────────────── */

function checkDistFile(path: string, findings: Finding[]) {
  let html = readFileSync(path, "utf8");
  const file = relative(ROOT, path);

  // 코드·스크립트, 그리고 viz SVG 는 마크다운을 거치지 않는다 — 거기 별표는 의도한 글자다.
  html = html.replace(/<(script|style|pre|code|svg)\b[^>]*>[\s\S]*?<\/\1>/giu, " ");
  html = html.replace(/<[^>]*>/gu, " ");

  for (const m of html.matchAll(/\*{1,}/gu)) {
    const at = m.index ?? 0;
    findings.push({
      file,
      line: 0,
      reason: `렌더된 화면에 별표 \`${m[0]}\` 가 그대로 남음`,
      excerpt: html.slice(Math.max(0, at - 40), at + 40).replace(/\s+/gu, " ").trim(),
    });
  }
}

/* ─────────────────────────── 실행 ─────────────────────────── */

function walk(dir: string, exts: string[]): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, exts));
    else if (exts.some((e) => name.endsWith(e))) out.push(p);
  }
  return out;
}

const args = process.argv.slice(2);
const distMode = args.includes("--dist");
const paths = args.filter((a) => !a.startsWith("--"));
const findings: Finding[] = [];
let targets: string[];

if (distMode) {
  if (!existsSync(DIST_DIR)) {
    console.error("[check-emphasis] ✗ dist/ 없음 — `bun run build` 를 먼저 돌린다");
    process.exit(1);
  }
  targets = walk(DIST_DIR, [".html"]);
  for (const t of targets) checkDistFile(t, findings);
} else {
  targets = paths.length
    ? paths.flatMap((p) => {
        const abs = join(ROOT, p);
        return statSync(abs).isDirectory() ? walk(abs, [".md", ".mdx"]) : [abs];
      })
    : walk(POSTS_DIR, [".md", ".mdx"]);
  for (const t of targets) checkSourceFile(t, findings);
}

const label = distMode ? "렌더" : "소스";

if (findings.length > 0) {
  console.error(`[check-emphasis] ✗ 강조가 렌더되지 않는 자리 ${findings.length}건 (${label} 모드):`);
  for (const f of findings) {
    console.error(`  ${f.file}${f.line ? `:${f.line}` : ""} — ${f.reason}`);
    console.error(`      …${f.excerpt}…`);
  }
  console.error("");
  console.error("  고치는 법: 강조를 조사 앞에서 끊지 말고 조사까지 안에 넣거나,");
  console.error("             강조 범위를 문장부호로 끝나지 않게 다시 잡는다.");
  console.error("             예) `**창(window)**이` → `**창(window)이**` 또는 `**창**(window)이`");
  process.exit(1);
}

console.log(`[check-emphasis] ✓ ${targets.length}개 파일에 렌더되지 않는 강조 없음 (${label} 모드)`);
