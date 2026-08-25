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
 *   **여섯이 각자 다른 사유로 걸려야 한다** — 하나의 규칙이 여섯을 다 잡으면 그건
 *   검사가 아니라 우연이다.
 *
 * 진짜 `src/` 를 안 쓰는 이유는 둘이다 — 빠르고, 실제 부채가 줄어도 검사가 안 흔들린다.
 */
import { cpSync, mkdtempSync, rmSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { extract } from "./extract.ts";
import { color } from "./color.ts";
import { docrule } from "./docrule.ts";
import type { Verdict } from "./types.ts";

const FAULTS = "scripts/fixtures/tokens/faults";

/** 고장 하나와 그것이 걸려야 하는 사유. `want` 는 `reason` 에 들어 있어야 하는 조각이다. */
const CASES: { file: string; verdict: Verdict["verdict"]; want: string; what: string }[] = [
  { file: "drift.astro",      verdict: "드리프트", want: "D1 같은 표기", what: "토큰과 같은 값을 리터럴로" },
  { file: "color-out.astro",  verdict: "위반",     want: "color 축",    what: "토큰 밖 색" },
  { file: "radius-out.astro", verdict: "위반",     want: "radius 축",   what: "radius 스케일 밖" },
  { file: "stroke-out.astro", verdict: "위반",     want: "stroke 축",   what: "선 굵기 토큰 밖" },
  { file: "spacing-out.astro",verdict: "위반",     want: "§9",          what: "여백 스케일 밖" },
  { file: "font-min.astro",   verdict: "위반",     want: "최소치",       what: "글자 최소치 미만" },
];

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

    // ② 고장 여섯 — 각자 기대한 사유로 걸려야 한다.
    const seen: string[] = [];
    for (const c of CASES) {
      const dst = join(tmp, "src/components/_fault.astro");
      copyFileSync(join(repoRoot, FAULTS, "cases", c.file), dst);
      const hit = judge(tmp).find(
        (v) => v.hit.file.endsWith("_fault.astro") && v.verdict === c.verdict && v.reason.includes(c.want),
      );
      rmSync(dst, { force: true });
      if (!hit) { failures.push(`자가검사 ②: 「${c.what}」(${c.file}) 를 안 잡는다 — ${c.verdict} / "${c.want}" 를 기대했다`); continue; }
      seen.push(`${c.what} → ${c.want}`);
    }

    // ③ 여섯이 **각자 다른** 사유로 걸려야 한다. 하나가 다 잡으면 검사가 아니라 우연이다.
    const uniq = new Set(seen.map((s) => s.split(" → ")[1]));
    if (seen.length === CASES.length && uniq.size < CASES.length) {
      failures.push(`자가검사 ③: 고장 ${CASES.length}종이 사유 ${uniq.size}가지로만 갈린다 — 한 규칙이 여러 고장을 덮고 있다`);
    }
    return { failures, notes: [`자가검사: 정상 1 + 고장 ${CASES.length}종, 사유 ${uniq.size}가지`] };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
