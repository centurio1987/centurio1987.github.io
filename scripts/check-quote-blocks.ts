#!/usr/bin/env bun
/**
 * check-quote-blocks — 인용(`> …`) 안에서 **문단이 무너진 자리**를 잡는다.
 *
 * 왜: 이 블로그의 글머리에는 「읽기 전 약속 N」 꼴의 인용 프리앰블이 관례로 붙는데,
 * 항목이 둘 이상이면서 한 문단에 이어 붙는 사고가 반복됐다. 지적 당시 vpn-anatomy-6
 * 의 프리앰블은 **564자 한 문단**에 「둘째」·「셋째」가 문장 중간에 박혀 있어서,
 * 화면에서는 세 약속이 아니라 벽 하나로 읽혔다.
 *
 * **빌드도 타입도 초록이고 강조 게이트도 안 잡는다** — 마크다운 문법이 틀린 게
 * 아니라 문단을 안 나눈 것이라서, 이 게이트 말고는 눈으로만 잡힌다.
 *
 * 하드 실패(종료코드 1): 인용 **한 문단 안**에 서수 표지가 그 문단의 첫머리가 아닌
 * 자리에서 나오는 경우. 고치는 법은 그 표지 앞에서 문단을 끊는 것뿐이고(`>` 빈 줄
 * 하나), **글자는 한 자도 안 바뀐다** — 그래서 기계가 판정해도 안전하다.
 *
 * 보고만(종료코드에 안 넣음): 서수는 없지만 한 문단이 유난히 긴 인용.
 * 어디서 끊을지는 뜻을 읽어야 정해지므로 사람이 본다.
 *
 * 인용 안의 여러 문단이 헐거워 보이지 않는 건 `PostLayout` 이 첫·끝 문단의 바깥
 * 여백을 죽여 두기 때문이다(그 규칙이 없으면 나눌수록 인용이 늘어져서, 이 게이트가
 * 시키는 일이 오히려 손해가 된다 — 둘은 한 쌍이다).
 *
 * 사용: bun scripts/check-quote-blocks.ts [파일…]   (경로 생략 시 src/content/posts/ 전체)
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "src", "content", "posts");

/** 서수 표지 — 「첫째」는 문단 첫머리에만 오므로 뒤엣것만 센다. */
const ORDINAL = /(둘째|셋째|넷째|다섯째|[②③④⑤])/;
/** 한 문단이 이보다 길면 보고한다. 발행 글 중앙값의 약 두 배 언저리. */
const LONG = 300;

type Hard = { file: string; line: number; para: number; marks: string[]; text: string };
type Soft = { file: string; line: number; len: number; text: string };

/** `> ` 로 시작하는 연속 줄을 인용 하나로 묶는다(중첩 인용은 안 다룬다 — 본문에 없다). */
function quoteBlocks(src: string) {
  const lines = src.split("\n");
  const out: { line: number; body: string[] }[] = [];
  let i = 0;
  while (i < lines.length) {
    if (!/^>/.test(lines[i])) {
      i++;
      continue;
    }
    const start = i;
    const body: string[] = [];
    while (i < lines.length && /^>/.test(lines[i])) {
      body.push(lines[i].replace(/^>\s?/, ""));
      i++;
    }
    out.push({ line: start + 1, body });
  }
  return out;
}

async function main() {
  const argv = process.argv.slice(2);
  const files = argv.length
    ? argv
    : (await readdir(POSTS_DIR))
        .filter((f) => /\.mdx?$/.test(f))
        .map((f) => path.join(POSTS_DIR, f));

  const hard: Hard[] = [];
  const soft: Soft[] = [];

  for (const file of files) {
    const rel = path.relative(process.cwd(), file);
    const src = await readFile(file, "utf8");
    for (const q of quoteBlocks(src)) {
      const paras = q.body.join("\n").split(/\n\s*\n/);
      paras.forEach((para, k) => {
        const flat = para.replace(/\n/g, " ").trim();
        if (!flat) return;
        /* 문단이 서수로 시작하는 건 정상이다(그게 나눈 결과다). 그 첫 표지를
           떼어 내고 **남은 자리**에 또 있는지만 본다. */
        const rest = flat.replace(/^[^가-힣0-9A-Za-z]*(?:둘째|셋째|넷째|다섯째|[①②③④⑤])[,.\s]*/, "");
        const marks = [...rest.matchAll(new RegExp(ORDINAL, "g"))].map((m) => m[1]);
        if (marks.length) {
          hard.push({ file: rel, line: q.line, para: k + 1, marks, text: flat.slice(0, 60) });
        } else if (flat.length > LONG) {
          soft.push({ file: rel, line: q.line, len: flat.length, text: flat.slice(0, 60) });
        }
      });
    }
  }

  if (soft.length) {
    console.log(`[check-quote-blocks] · 한 문단이 ${LONG}자를 넘는 인용 ${soft.length}건 (보고만 — 어디서 끊을지는 사람이 정한다)`);
    for (const s of soft) console.log(`    ${s.file}:${s.line}  ${s.len}자  ${s.text}…`);
  }

  if (hard.length) {
    console.error(`[check-quote-blocks] ✗ 한 문단에 항목 여럿을 이어 붙인 인용 ${hard.length}건:`);
    for (const h of hard) {
      console.error(`  ${h.file}:${h.line} (문단 ${h.para})  「${h.marks.join("」·「")}」가 문장 중간에 있음`);
      console.error(`      ${h.text}…`);
    }
    console.error("  → 그 표지 앞에서 문단을 끊는다: 표지 앞에 `>` 만 있는 빈 줄 한 줄. 글자는 안 바꾼다.");
    process.exit(1);
  }

  console.log(`[check-quote-blocks] ✓ ${files.length}개 글의 인용에 무너진 문단 없음`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
