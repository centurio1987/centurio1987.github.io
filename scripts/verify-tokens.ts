#!/usr/bin/env bun
/**
 * verify-tokens — 디자인 토큰을 안 쓴 값이 **새로 들어오는 것**을 막는다.
 *
 * 왜 필요한가.
 *   토큰 밖 색을 쓰거나 문서가 정한 간격 스케일을 벗어나도 **빌드도 타입도 초록이다.**
 *   SVG `<text>` 넘침(`verify-viz`)이나 한국어 조사 강조(`check-emphasis`)와 같은 종류의
 *   결함이다 — 눈 말고는 안 잡히고, 그래서 조용히 쌓인다. 실제로 전수 진단에서
 *   `src/**` 152파일 3,539 히트 중 위반이 **1,304건**(토큰 밖 580 + 문서 규칙 밖 724)
 *   나왔다 — `design-concept/UI_CONSISTENCY_AUDIT.md`. 그 문서의 초판은 1,567 을 적었는데
 *   이 게이트로 이식하면서 판정 규칙 둘을 고쳤다(간격 축 재분류 · 글자 역할값에 clamp 끝값).
 *   두 정의를 다 낼 수 있으므로 초판 수치도 그대로 재현된다.
 *
 * 왜 하드월이 아니라 래칫인가.
 *   위반 1,304건 상태에서 "0건이면 통과"로 올리면 첫 푸시부터 CI 가 빨간불이 되고,
 *   `.github/workflows/main.yml` 은 build → deploy 가 한 잡이라 **사이트 배포까지 멈춘다.**
 *   그러면 게이트가 첫 수가 아니라 부채를 다 갚은 뒤에야 켤 수 있는 마지막 수가 되고,
 *   그 사이 새로 들어오는 리터럴은 아무도 못 막는다. 그래서 지금 수를 기준선으로 박고
 *   **늘면 실패 / 같으면 통과 / 줄면 통과 + 기준선 갱신 안내** 로 판정한다.
 *   0 으로 수렴하면 그때 하드월로 승격한다(KAN-070).
 *
 * 왜 파일이 여럿인가.
 *   이 레포의 다른 게이트 다섯(`verify-viz`·`verify-deco`·`verify-widths`·`verify-talk`·
 *   `verify-graph`)은 전부 단일 파일이다. 여기만 다른 이유는 축 셋을 **병렬로** 채우기
 *   때문이다(`scripts/lib/tokens/{color,fallback,docrule}.ts`). 규약 — 셰뱅 · 이 주석 ·
 *   failures/notes 분리 · "고치는 법" 한 문단 · 비0 종료 — 은 **전부 이 진입점이 진다.**
 *   축 모듈은 판정만 돌려준다.
 *
 * 사용:
 *   bun scripts/verify-tokens.ts                    # 기준선 대비 판정
 *   bun scripts/verify-tokens.ts --update-baseline  # 줄어든 수를 기준선에 반영
 *   bun scripts/verify-tokens.ts --warn-only        # 비0 으로 안 끝낸다(CI 에서는 안 쓴다)
 *   bun scripts/verify-tokens.ts --no-self-test     # 자가검사를 건너뛴다(디버깅용)
 *   bun scripts/verify-tokens.ts --json             # 판정 전건을 JSON 으로(대조용)
 *
 * 기준선은 `scripts/tokens-baseline.json` 이고 손으로 고치지 않는다 —
 * `--update-baseline` 이 결정론적으로 다시 쓴다.
 *
 * 문제가 있으면 종료코드 1.
 */
import { extract } from "./lib/tokens/extract.ts";
import { color } from "./lib/tokens/color.ts";
import { fallback } from "./lib/tokens/fallback.ts";
import { docrule } from "./lib/tokens/docrule.ts";
import { EXCEPTIONS, validateExceptions } from "./lib/tokens/exceptions.ts";
import { selfTest } from "./lib/tokens/selftest.ts";
import { BASELINE_PATH, auditBasis, ratchet, readBaseline, tally, writeBaseline } from "./lib/tokens/baseline.ts";
import type { AxisModule, ScanContext } from "./lib/tokens/types.ts";

const ROOT = process.cwd();
const args = new Set(process.argv.slice(2));
const WARN_ONLY = args.has("--warn-only");
const AS_JSON = args.has("--json");
const NO_SELF_TEST = args.has("--no-self-test");
const UPDATE_BASELINE = args.has("--update-baseline");

const MODULES: AxisModule[] = [color, fallback, docrule];

const failures: string[] = [];
const notes: string[] = [];

// ── 다른 무엇보다 먼저 — 게이트가 자기 예외 표부터 검사한다.
//    근거 문서 위치가 비었거나 그 줄이 없으면 여기서 끝난다. 예외를 늘리는 값이
//    게이트를 무력화하는 값과 같아지면 안 된다(S10).
for (const bad of validateExceptions(ROOT)) failures.push(`예외 표: ${bad}`);
notes.push(
  `예외 ${EXCEPTIONS.length}건 — ` +
  EXCEPTIONS.map((e) => `${e.id}(${e.kind.join("+")}, 근거 ${e.evidence.length})`).join(" · "),
);

// ── 그다음 — 고장을 일부러 주입해 게이트가 아직 무는지 본다(S6).
//    래칫은 "줄었다"를 통과로 읽으므로, 죽은 게이트와 다 갚은 게이트가 같은 모양이 된다.
if (!NO_SELF_TEST) {
  const st = selfTest(ROOT);
  failures.push(...st.failures);
  notes.push(...st.notes);
}

const { files, dict, hits } = extract(ROOT);
const ctx: ScanContext = { root: ROOT, files, dict, hits };
const verdicts = [];
const classify = [];   // color · docrule — 감사 §0 표와 같은 구성(fallback 은 그 표 밖이다)

for (const m of MODULES) {
  const r = m.run(ctx);
  failures.push(...r.failures);
  notes.push(...r.notes);
  verdicts.push(...r.verdicts);
  if (m.id !== "fallback") classify.push(...r.verdicts);
}

const excluded = hits.filter((h) => h.excluded).length;
const inScope = hits.length - excluded;

// ── 래칫 — 제외분을 뺀 것만 센다. 생성물의 리터럴을 사람이 고칠 수는 없다.
const scored = verdicts.filter((v) => !v.hit.excluded);
const now = tally(scored, files.length);
if (UPDATE_BASELINE) {
  writeBaseline(ROOT, now);
  console.log(`기준선을 갱신했다 — ${BASELINE_PATH}`);
  for (const [k, n] of Object.entries(now.totals)) console.log(`  ${k} ${n}`);
  process.exit(0);
}
const rat = ratchet(now, readBaseline(ROOT), scored);
failures.push(...rat.failures);
notes.push(...rat.notes);

// 두 수를 한 자리에서 함께 낸다 — 감사 문서와 손으로 대조하지 않게(검토 항목 2).
notes.push(
  "감사 기준(제외분 포함 · fallback 제외 — UI_CONSISTENCY_AUDIT.md §0 과 같은 구성): " +
  Object.entries(auditBasis(classify)).map(([k, n]) => `${k} ${n}`).join(" · "),
);
notes.push(
  "래칫 기준(제외분 빼고 · fallback 포함 — 지금 고쳐야 할 것): " +
  Object.entries(now.totals).map(([k, n]) => `${k} ${n}`).join(" · "),
);

if (AS_JSON) {
  console.log(JSON.stringify({ root: ROOT, files: files.length, tokens: dict.byName.size,
    hits: hits.length, excluded, inScope, verdicts }, null, 0));
  process.exit(failures.length && !WARN_ONLY ? 1 : 0);
}

console.log(`파일 ${files.length}개 · 토큰 ${dict.byName.size}개 (src/styles/tokens.css)`);
console.log(`히트 ${hits.length}건 — 게이트 대상 ${inScope} · 제외 ${excluded}(생성물·복제물)`);
console.log(`판정 ${verdicts.length}건 · 축 ${MODULES.length}개`);
for (const m of MODULES) console.log(`  · ${m.id} — ${m.what}`);
for (const n of notes) console.log(`  · ${n}`);

if (failures.length) {
  console.error("\n✗ 토큰 게이트 실패 — 이 변경은 토큰 밖 값을 늘린다.");
  for (const f of failures) console.error(`  ${f}`);
  console.error(
    "\n  고치는 법: 위에 지목된 자리의 리터럴을 var(--토큰) 으로 바꿔라. 쓸 토큰이 없으면\n" +
    "  src/styles/tokens.css 에 세우고 design-concept/DESIGN_CONCEPT.md 에 적는다. 일부러\n" +
    "  다른 값이면 근거 문서의 위치를 예외 목록에 함께 등록해라 — 위치 없는 예외는 안 받는다.\n" +
    "  기준선을 올려 넘어가려면 그것이 옳은지 먼저 확인하고 --update-baseline 을 쓴다.",
  );
  if (!WARN_ONLY) process.exit(1);
  console.error("\n  (--warn-only 라 0 으로 끝낸다. CI 에서는 쓰지 마라.)");
}
console.log(verdicts.length ? "\n✓ 토큰 게이트 통과." : "\n검사 0건 — 축 모듈이 아직 비어 있다(S3·S4·S5 가 채운다).");
