/**
 * 자가검사 — **게이트가 죽었는지 게이트가 말한다** (KAN-070 S6).
 *
 * 왜 필요한가.
 *   이 게이트는 래칫이다 — 기준선보다 늘면 실패하고 줄면 통과한다. 그런데 게이트가
 *   조용히 고장 나면(정규식이 안 물거나 축 매핑이 빠지면) **판정이 0건이 되고, 래칫은
 *   그것을 "줄었다"로 읽어 통과시킨다.** 죽은 게이트와 부채를 다 갚은 게이트가 화면에서
 *   같은 모양이 된다. 1,300건이 0 으로 수렴하는 내내 그 착각이 유지될 수 있다.
 *
 *   그래서 매 실행마다 **고장을 일부러 주입해** 각각이 잡히는지 본다.
 *   `scripts/verify-talk.ts` 의 `selfTestFaults()` 와 같은 장치다.
 *
 * 어떻게 도나.
 *   `scripts/fixtures/tokens/faults/base/` 가 최소 정본 트리다(토큰 10개 + 정상 파일 하나).
 *   임시 디렉터리에 복사하고 `cases/` 의 고장 파일을 하나씩 얹어 돌린다.
 *   **각자 다른 사유로 걸려야 한다** — 하나의 규칙이 여럿을 다 잡으면 그건
 *   검사가 아니라 우연이다.
 *
 * 유일성 키가 `(verdict, want, src)` 셋인 이유 (KAN-073 S1).
 *   원래는 사유(`want`) 하나였다. 그런데 KAN-073 의 새 인식층은 새 갈래를 **CSS 자리와
 *   똑같은 코드로** 판정한다 — 그래야 축 모듈에 숫자 분기가 안 생긴다. 그 결과
 *   `.tsx` 의 `padding: 10` 은 기존 `spacing-out.astro` 와 사유가 같은 `"§9"` 가 된다.
 *   사유를 억지로 다르게 쓰면 「같은 코드로 판정한다」가 깨지고, `baseline.ts` 가 축을
 *   되뽑을 때 쓰는 네 접두와도 부딪힌다. **인식 경로가 다르면 다른 검사**라는 것이
 *   이 확장의 논지 자체이므로, 취지를 그대로 두고 키에 `src` 를 더했다.
 *
 * 고장은 인식기가 소유한다.
 *   갈래별 고장은 `recognize/<갈래>.ts` 의 `faults` 에 있고 여기서 모으기만 한다.
 *   한 배열에 몰아 두면 갈래를 병렬로 채우는 세션들이 같은 줄을 고치게 된다.
 *
 * 진짜 `src/` 를 안 쓰는 이유는 둘이다 — 빠르고, 실제 부채가 줄어도 검사가 안 흔들린다.
 */
import { cpSync, mkdtempSync, rmSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { extract, RECOGNIZERS } from "./extract.ts";
import { color } from "./color.ts";
import { docrule } from "./docrule.ts";
import type { Hit, Verdict } from "./types.ts";
import type { FaultCase } from "./recognize/types.ts";

const FAULTS = "scripts/fixtures/tokens/faults";

/**
 * 옛 경로(`css-decl`)의 고장 여섯. 갈래별 고장은 인식기가 각자 들고 있다 — 아래 `CASES`.
 */
const BASE_CASES: FaultCase[] = [
  { file: "drift.astro",      verdict: "드리프트", want: "D1 같은 표기", what: "토큰과 같은 값을 리터럴로", src: "css-decl" },
  { file: "color-out.astro",  verdict: "위반",     want: "color 축",    what: "토큰 밖 색",              src: "css-decl" },
  { file: "radius-out.astro", verdict: "위반",     want: "radius 축",   what: "radius 스케일 밖",         src: "css-decl" },
  { file: "stroke-out.astro", verdict: "위반",     want: "stroke 축",   what: "선 굵기 토큰 밖",           src: "css-decl" },
  { file: "spacing-out.astro",verdict: "위반",     want: "§9",          what: "여백 스케일 밖",            src: "css-decl" },
  { file: "font-min.astro",   verdict: "위반",     want: "최소치",       what: "글자 최소치 미만",          src: "css-decl" },
  // 자간은 옛 `css-decl` 이 이미 온전히 문다(단위가 붙어 있다). 못 보던 것은 자리가 아니라
  // **자**였으므로(굵기·행간·자간에 토큰이 0 이었다) 고장도 옛 경로에 심는다 — KAN-080 S6.
  { file: "type-track.astro", verdict: "위반",     want: "자간 단 밖",   what: "자간이 4단 밖(px 표기)",     src: "css-decl" },
];

/** 옛 여섯 + 인식기들이 낸 것. 인식기가 비어 있으면(스텁) 여섯 그대로다. */
const CASES: FaultCase[] = [...BASE_CASES, ...RECOGNIZERS.flatMap((r) => r.faults)];

/**
 * **고장이 몇 종인가** — 기준선이 이 수를 들고 래칫이 문다 (KAN-076, 검토 항목 4 승인).
 *
 * 왜 필요한가. 이 파일의 ②·③ 은 **등록된 고장들이 잡히는지**만 본다. 그런데 고장은
 * 인식기가 소유하므로(`RECOGNIZERS.flatMap`) **인식기를 배열에서 빼면 그 인식기의 고장도
 * 함께 사라진다.** 실측: `svgStroke` 를 빼면 게이트가 빨개지지 않고 고장 수만 12 → 10 으로
 * 줄어든 채 **통과한다.** 자가검사가 자기 축소를 못 보는 이 자리가 곧 이 게이트가 막으려던
 * 실패 그 자체다 — 죽은 게이트와 다 갚은 게이트가 화면에서 같은 모양이 된다.
 *
 * 그래서 수를 기준선에 박고 **줄면 실패**시킨다. 늘리는 것은 자유이고(`--update-baseline`),
 * 줄이는 것만 명시적 행위로 만든다. `--no-self-test` 로 돌 때도 이 값은 유효하다 —
 * 검사를 **돌린 결과**가 아니라 등록된 고장의 **개수**라 실행과 무관하다.
 */
export const FAULT_COUNT = CASES.length;

/** 유일성 키 — 같은 사유라도 인식 경로가 다르면 다른 검사다(위 머리주석). */
const keyOf = (c: { verdict: Verdict["verdict"]; want: string; src: Hit["src"] }) =>
  `${c.verdict} / ${c.want} / ${c.src}`;

function judge(root: string): Verdict[] {
  const { files, dict, hits } = extract(root);
  const ctx = { root, files, dict, hits };
  return [...color.run(ctx).verdicts, ...docrule.run(ctx).verdicts];
}

/** 돌려주는 문자열이 하나라도 있으면 그것이 곧 게이트 실패 사유다. */
export function selfTest(repoRoot: string): { failures: string[]; notes: string[] } {
  const failures: string[] = [];
  const tmp = mkdtempSync(join(tmpdir(), "tokens-selftest-"));
  try {
    cpSync(join(repoRoot, FAULTS, "base"), tmp, { recursive: true });

    // ① 정상 트리는 아무것도 안 걸려야 한다. 여기서 걸리면 아래 판정은 다 못 믿는다.
    const clean = judge(tmp).filter((v) => v.verdict === "위반" || v.verdict === "드리프트");
    if (clean.length) {
      failures.push(
        `자가검사 ①: 정상 픽스처에서 ${clean.length}건이 걸렸다 — ` +
        clean.slice(0, 3).map((v) => `${v.hit.file}:${v.hit.line} ${v.verdict}`).join(" · "),
      );
    }

    // ② 고장들 — 각자 기대한 사유로, 기대한 인식 경로에서 걸려야 한다.
    //    파일 이름을 확장자별로 만든다: `.tsx` 고장은 `.astro` 로 두면 스캔 경로가 달라진다.
    const seen: string[] = [];
    for (const c of CASES) {
      const ext = c.file.slice(c.file.lastIndexOf("."));
      const name = `_fault${ext}`;
      const dst = join(tmp, "src/components", name);
      copyFileSync(join(repoRoot, FAULTS, "cases", c.file), dst);
      const hit = judge(tmp).find(
        (v) => v.hit.file.endsWith(name) && v.verdict === c.verdict
            && v.reason.includes(c.want) && v.hit.src === c.src,
      );
      rmSync(dst, { force: true });
      if (!hit) { failures.push(`자가검사 ②: 「${c.what}」(${c.file}) 를 안 잡는다 — ${c.verdict} / "${c.want}" / ${c.src} 를 기대했다`); continue; }
      seen.push(keyOf(c));
    }

    // ③ 각자 **다른** 검사여야 한다. 하나가 다 잡으면 검사가 아니라 우연이다.
    const uniq = new Set(seen);
    if (seen.length === CASES.length && uniq.size < CASES.length) {
      failures.push(`자가검사 ③: 고장 ${CASES.length}종이 사유 ${uniq.size}가지로만 갈린다 — 한 규칙이 여러 고장을 덮고 있다`);
    }
    return { failures, notes: [`자가검사: 정상 1 + 고장 ${CASES.length}종, 사유 ${uniq.size}가지`] };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
