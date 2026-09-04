/**
 * 자가검사 — **게이트가 죽었는지 게이트가 말한다** (KAN-070 S6).
 *
 * 왜 필요한가.
 *   이 게이트는 하드월이다 — 무는 판정이 하나라도 있으면 실패하고 0건이면 통과한다.
 *   그런데 게이트가 조용히 고장 나면(정규식이 안 물거나 축 매핑이 빠지면) **판정이 0건이
 *   되고, 게이트는 그것을 "무는 것이 없다"로 읽어 통과시킨다.** 죽은 게이트와 부채를 다 갚은
 *   게이트가 화면에서 같은 모양이 된다 — **승격해도 이 착각은 그대로다.** 래칫이던 시절에는
 *   그것이 "줄었다"로 읽혔고, 1,300건이 0 으로 수렴하는 내내 유지될 수 있었다.
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
 *
 * 고장 픽스처가 **안 보는 것**이 있다 — 판정 방식 (KAN-079 S5).
 *   위의 ①②③ 은 전부 「판정기가 이 리터럴을 잡는가」를 본다. 그런데 게이트가 하드월이
 *   된 뒤 되돌아갈 수 있는 자리는 **판정기가 아니라 판정 방식**이다: `hardwall()` 이
 *   다시 기준선과 비교하기 시작하거나, `--update-baseline` 이 위반을 굳히는 문으로
 *   돌아가거나, 진입점이 그 문을 안 부르게 되는 것. **그 셋 중 무엇이 일어나도 고장
 *   픽스처 열여덟은 전부 초록이다** — 리터럴은 여전히 잡히기 때문이다.
 *
 *   그래서 ④ 로 `GUARDS` 를 둔다. 픽스처 파일이 아니라 **합성 판정을 만들어 판정 함수에
 *   직접 넣는다** — 그 편이 「기준선이 이 위반을 담고 있는 상태」처럼 파일로는 만들기
 *   번거로운 상황을 정확히 세울 수 있다. 셋째 가드가 소스를 읽는 것도 같은 이유다:
 *   함수가 살아 있어도 진입점이 안 부르면 문이 없고, 그 배선은 함수 호출로는 못 잰다
 *   (`compare-render.ts` 의 `selfTestEnding()` 이 같은 규약으로 쓰였다 — KAN-078).
 */
import { cpSync, mkdtempSync, readFileSync, rmSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { extract, RECOGNIZERS } from "./extract.ts";
import { color } from "./color.ts";
import { docrule } from "./docrule.ts";
import { hardwall, refuseBaselineUpdate, tally } from "./baseline.ts";
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

/**
 * 판정 방식 검사 하나. 고장 픽스처와 성질이 다르다 — 파일을 얹는 것이 아니라
 * **합성 판정을 판정 함수에 직접 넣거나 소스를 읽는다**(위 머리주석 ④).
 *
 * `run` 이 `null` 을 돌려주면 통과, 문자열이면 그것이 곧 실패 사유다.
 */
interface JudgmentGuard {
  id: string;
  /** 무엇을 지키는 검사인지 한 줄. 통과 시 요약에 쓴다. */
  what: string;
  run: (repoRoot: string) => string | null;
}

/** 자가검사용 합성 판정. 실재하지 않는 자리를 가리키므로 파일을 만들지 않는다. */
const synthetic = (verdict: "위반" | "드리프트"): Verdict => ({
  hit: {
    axis: "color", kind: "literal_new", prop: "color", value: "#123456",
    token: null, sameValueOtherAxis: null,
    file: "src/_judgment-guard.astro", line: 1, src: "css-decl", excluded: null,
  },
  verdict, auditLabel: verdict, reason: "color 축 — 판정 방식 검사용 합성 판정",
});

const GUARDS: JudgmentGuard[] = [
  {
    id: "hardwall-ignores-baseline",
    what: "기준선이 같은 위반을 담고 있어도, 기준선이 아예 없어도 무는가",
    run: () => {
      const v = synthetic("위반");
      // 기준선이 그 위반을 그대로 담은 상태 — 래칫이면 「같다」로 통과하던 자리다.
      const same = tally([v], 1, FAULT_COUNT, GUARD_COUNT);
      if (!hardwall(same, same, [v]).failures.length) {
        return "기준선이 같은 위반을 담고 있으면 통과한다 — 판정이 래칫으로 되돌아갔다";
      }
      // 기준선 없음 — 래칫은 "아무것도 안 문다"였다. 그러면 파일 삭제가 게이트 끄기가 된다.
      if (!hardwall(same, null, [v]).failures.length) {
        return "기준선이 없으면 안 문다 — 파일을 지우는 것이 게이트를 끄는 것이 된다";
      }
      // 드리프트도 무는 판정 둘 중 하나다.
      const d = synthetic("드리프트");
      if (!hardwall(tally([d], 1, FAULT_COUNT, GUARD_COUNT), null, [d]).failures.length) {
        return "드리프트를 안 문다 — 무는 판정 둘 중 하나가 빠졌다";
      }
      // 반대쪽 — 무는 판정 0건이 실패가 되면 게이트가 아무것도 통과시키지 못한다.
      const empty = tally([], 0, FAULT_COUNT, GUARD_COUNT);
      if (hardwall(empty, empty, []).failures.length) {
        return "무는 판정이 0건인데 실패한다 — 통과 조건이 깨졌다";
      }
      return null;
    },
  },
  {
    id: "baseline-update-gate",
    what: "위반이 있으면 기준선 갱신을 거부하고 없으면 허용하는가",
    run: () => {
      if (!refuseBaselineUpdate([synthetic("위반")]).refuse) {
        return "위반이 있는데 기준선 갱신을 허용한다 — 위반을 굳히는 문이 다시 열렸다";
      }
      if (!refuseBaselineUpdate([synthetic("드리프트")]).refuse) {
        return "드리프트는 기준선 갱신을 못 막는다 — 무는 판정 둘 중 하나가 문 밖에 있다";
      }
      if (refuseBaselineUpdate([]).refuse) {
        return "무는 판정이 0건인데 갱신을 거부한다 — 인식층을 넓히는 일이 막힌다";
      }
      return null;
    },
  },
  {
    id: "unjudged-escape-split",
    what: "판정 불가가 늘었을 때 「새 히트」와 「옮겨간 판정」을 가르는가",
    run: () => {
      // 판정 불가 하나를 합성한다 — 자리는 실재하지 않으므로 파일을 만들지 않는다.
      const un = (line: number): Verdict => ({
        hit: {
          axis: "spacing", kind: "literal_new", prop: "width", value: "33%",
          token: null, sameValueOtherAxis: null,
          file: "src/_judgment-guard.astro", line, src: "css-decl", excluded: null,
        },
        verdict: "판정 불가", auditLabel: "토큰 미존재", reason: "판정 방식 검사용 합성 판정",
      });
      const base = tally([un(1)], 1, FAULT_COUNT, GUARD_COUNT);

      // ① 판정 수가 그대로인데 판정 불가만 늘었다 — 옮겨간 것이다. 표식이 붙어야 한다.
      const moved: ReturnType<typeof tally> = {
        ...base,
        counts: { "spacing / 판정 불가": 2 },
        totals: { "판정 불가": 2 },
      };
      const a = hardwall(moved, base, []).notes.join("\n");
      if (!a.includes("⚠")) {
        return "인식 범위가 안 움직였는데 판정 불가가 늘어도 표식이 없다 — 도피처가 조용해졌다";
      }
      // ② 히트가 늘어 판정 불가도 늘었다 — 평범한 확장이다. 표식이 붙으면 안 된다.
      const grown = tally([un(1), un(2)], 1, FAULT_COUNT, GUARD_COUNT);
      const b = hardwall(grown, base, []).notes.join("\n");
      if (b.includes("⚠")) {
        return "판정 수가 함께 늘었는데도 표식이 붙는다 — 평범한 범위 확장이 매번 경고가 된다";
      }
      // ③ 안 늘었으면 아무 말도 안 한다.
      if (hardwall(base, base, []).notes.join("\n").includes("판정 불가가")) {
        return "판정 불가가 안 늘었는데도 그 말을 한다";
      }
      return null;
    },
  },
  {
    id: "entry-wires-the-gate",
    what: "진입점이 기준선을 쓰기 전에 그 문을 지나는가",
    run: (repoRoot) => {
      // 함수가 살아 있어도 진입점이 안 부르면 문이 없다 — 그 배선은 함수 호출로 못 잰다.
      const src = readFileSync(join(repoRoot, "scripts/verify-tokens.ts"), "utf-8");
      const gate = src.indexOf("refuseBaselineUpdate(");
      const write = src.indexOf("writeBaseline(");
      if (gate < 0) return "진입점이 refuseBaselineUpdate 를 안 부른다 — 문이 배선에서 빠졌다";
      if (write < 0) return "진입점에 writeBaseline 호출이 없다 — 이 검사가 가리키는 자리가 사라졌다";
      if (gate > write) return "문이 writeBaseline 뒤에 있다 — 거부하기 전에 이미 쓴다";
      return null;
    },
  },
];

/**
 * **판정 방식 검사가 몇 종인가** — 기준선이 이 수를 들고 줄면 실패한다 (KAN-079 S5).
 *
 * `FAULT_COUNT` 와 같은 이유로 있다. 검사 자체를 배열에서 빼면 아무도 안 우는데,
 * 이쪽은 특히 그렇다 — 하드월을 래칫으로 되돌리는 사람은 그것을 막는 검사도 함께 지운다.
 */
export const GUARD_COUNT = GUARDS.length;

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

    // ④ 판정 **방식**이 하드월인가. 위 셋은 판정기만 보므로 이 자리는 안 본다(머리주석).
    for (const g of GUARDS) {
      const bad = g.run(repoRoot);
      if (bad) failures.push(`자가검사 ④(${g.id}): ${bad}`);
    }

    return { failures, notes: [
      `자가검사: 정상 1 + 고장 ${CASES.length}종, 사유 ${uniq.size}가지`,
      `판정 방식 검사 ${GUARDS.length}종 — ${GUARDS.map((g) => g.id).join(" · ")}`,
    ] };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
