#!/usr/bin/env bun
/**
 * verify-tokens — 디자인 토큰을 안 쓴 값이 **새로 들어오는 것**을 막는다.
 *
 * 왜 필요한가.
 *   토큰 밖 색을 쓰거나 문서가 정한 간격 스케일을 벗어나도 **빌드도 타입도 초록이다.**
 *   SVG `<text>` 넘침(`verify-viz`)이나 한국어 조사 강조(`check-emphasis`)와 같은 종류의
 *   결함이다 — 눈 말고는 안 잡히고, 그래서 조용히 쌓인다. 실제로 전수 진단에서
 *   `src/**` 152파일 3,539 히트 중 위반이 1,567건 나왔다
 *   (`design-concept/UI_CONSISTENCY_AUDIT.md`).
 *
 * 왜 하드월이 아니라 래칫인가.
 *   위반 1,567건 상태에서 "0건이면 통과"로 올리면 첫 푸시부터 CI 가 빨간불이 되고,
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
 *   bun scripts/verify-tokens.ts --json             # 판정 전건을 JSON 으로(대조용)
 *
 * 문제가 있으면 종료코드 1.
 */
import { extract } from "./lib/tokens/extract.ts";
import { color } from "./lib/tokens/color.ts";
import { fallback } from "./lib/tokens/fallback.ts";
import { docrule } from "./lib/tokens/docrule.ts";
import type { AxisModule, ScanContext } from "./lib/tokens/types.ts";

const ROOT = process.cwd();
const args = new Set(process.argv.slice(2));
const WARN_ONLY = args.has("--warn-only");
const AS_JSON = args.has("--json");

const MODULES: AxisModule[] = [color, fallback, docrule];

const { files, dict, hits } = extract(ROOT);
const ctx: ScanContext = { root: ROOT, files, dict, hits };

const failures: string[] = [];
const notes: string[] = [];
const verdicts = [];

for (const m of MODULES) {
  const r = m.run(ctx);
  failures.push(...r.failures);
  notes.push(...r.notes);
  verdicts.push(...r.verdicts);
}

const excluded = hits.filter((h) => h.excluded).length;
const inScope = hits.length - excluded;

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
