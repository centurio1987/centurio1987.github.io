#!/usr/bin/env bun
/**
 * check-recognize-invariant — 인식층을 넓힐 때 **옛 히트가 안 움직였음**을 증명한다.
 *
 * 왜 필요한가.
 *   `verify-tokens` 의 인식층은 갈래마다 새 `src` 라벨을 달고 늘어난다(KAN-073 셋,
 *   KAN-075 넷째). 그 확장이 옳은지는 **옛 집합이 한 건도 안 움직였는가**로만 판정할 수
 *   있다 — 감사 원자료 3,539 히트와의 대조가 거기 걸려 있기 때문이다. 그런데 그 대조는
 *   **빌드도 타입도 게이트도 초록인 채로 깨진다**: 옛 정규식을 한 글자 고치면 히트가
 *   조용히 늘거나 줄고, 래칫은 "늘었다/줄었다"로만 말할 뿐 **어느 집합이 움직였는지**는
 *   안 말한다. 실제로 KAN-073 은 그 증분이 정확히 1건임을 손으로 확인해야 했다.
 *
 *   겹쳐 세는 것도 같은 종류의 결함이다. `.tsx` 의 템플릿 리터럴은 옛 CSS 훑기와 새
 *   인식층이 **같은 바이트를 보는 유일한 자리**라, 겹쳐 세면 새 기준선이 조용히 부푼다.
 *   옛 히트만 대조해서는 안 잡힌다.
 *
 * 무엇을 하나 — 둘이고 서로 독립이다.
 *   `--before <snapshot.json>`  기준 커밋에서 뜬 `verify-tokens --json` 과 지금을 대조한다.
 *                              ① 옛 히트 불변 ② 새·옛 `src` 의 (file,line,value) 교집합 0.
 *                              **양쪽 다 판정(`verdicts`)으로 잰다** — 스냅샷에 히트 배열이
 *                              없어서이기도 하고, 히트가 그대로여도 판정이 갈리면 감사
 *                              원자료와의 대조는 똑같이 깨지기 때문이기도 하다.
 *   `--self-test`               겹침 가드가 아직 사는지 고장 픽스처로 본다(스냅샷 불필요).
 *                              **가드마다 하나씩 죽여 빨개지는 것을 확인한 구성이다** —
 *                              죽여도 아무 검사가 안 우는 가드는 있어 보이기만 하는 가드다.
 *
 * 스냅샷 뜨는 법:
 *   git stash && bun scripts/verify-tokens.ts --json --no-self-test > /tmp/before.json && git stash pop
 *   bun scripts/check-recognize-invariant.ts --before /tmp/before.json --self-test
 *
 * **CI 에 안 넣는다.** 스냅샷이 사람이 고른 기준 커밋에 묶여 있어 자동화할 대상이 아니다 —
 * 인식층을 넓히는 카드가 그 자리에서 한 번 돌리는 검증 하네스다(KAN-075 S2, KAN-076·077 재사용).
 *
 * 문제가 있으면 종료코드 1.
 */
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { extract } from "./lib/tokens/extract.ts";
import { color } from "./lib/tokens/color.ts";
import { fallback } from "./lib/tokens/fallback.ts";
import { docrule } from "./lib/tokens/docrule.ts";
import type { Hit, Verdict } from "./lib/tokens/types.ts";

const ROOT = process.cwd();
const argv = process.argv.slice(2);
const BEFORE = argv.includes("--before") ? argv[argv.indexOf("--before") + 1] : null;
const SELF = argv.includes("--self-test");

const failures: string[] = [];
const notes: string[] = [];

/**
 * 히트 아홉 필드 + **최종 판정**.
 *
 * 판정을 넣는 이유가 있다 — 히트가 그대로여도 축 모듈이 그것을 다르게 부르기 시작하면
 * 감사 원자료와의 대조는 똑같이 깨진다. 「값은 같은데 판정이 갈린」 이동이 그것이다.
 * 사유(`reason`)는 안 넣는다: 산문이라 문구만 다듬어도 빨개져서, 진짜 이동이 묻힌다.
 */
const keyOf = (v: { hit: Hit; verdict: string }) =>
  [v.hit.src, v.hit.axis, v.hit.kind, v.hit.prop, v.hit.value, v.hit.file, v.hit.line,
   JSON.stringify(v.hit.token), v.hit.excluded, v.verdict].join("|");

/** 같은 바이트를 두 번 세는지 보는 키. `src` 를 뺀 자리다. */
const siteOf = (h: Hit) => `${h.file}|${h.line}|${h.value}`;

/**
 * `verify-tokens` 의 판정 전건. **비교 대상이 `extract().hits` 가 아니라 이것인 이유**가 있다 —
 * `--json` 스냅샷에는 히트 배열이 없고 `verdicts` 만 있다(`hits` 는 개수뿐이다). 한쪽은
 * 히트, 다른 쪽은 판정으로 재면 축 모듈이 같은 히트를 두 번 판정하는 자리에서
 * **없는 「빠짐」이 무더기로 뜬다**(실측으로 밟았다 — `fallback` 축의 지역 변수 자리들).
 */
function judgeAll(root: string): Verdict[] {
  const { files, dict, hits } = extract(root);
  const ctx = { root, files, dict, hits };
  return [...color.run(ctx).verdicts, ...fallback.run(ctx).verdicts, ...docrule.run(ctx).verdicts];
}

function multiset(keys: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const k of keys) m.set(k, (m.get(k) ?? 0) + 1);
  return m;
}

// ── ① · ② 스냅샷 대조
if (BEFORE) {
  const before = JSON.parse(readFileSync(BEFORE, "utf-8"));
  const beforeV: { hit: Hit; verdict: string }[] = before.verdicts ?? [];
  if (!beforeV.length) failures.push(`스냅샷에 판정이 없다 — ${BEFORE} 가 verify-tokens --json 출력이 맞나`);

  // **옛 `src` 집합은 스냅샷이 정한다.** 여기에 목록을 적어 두면 다음 카드가 갈래를 늘릴
  // 때마다 이 파일도 같이 고쳐야 하고, 안 고치면 새 갈래가 옛 집합으로 세어져 통과한다.
  const oldSrc = new Set(beforeV.map((v) => v.hit.src));
  const now = judgeAll(ROOT);
  const oldNow = now.filter((v) => oldSrc.has(v.hit.src));
  const newNow = now.filter((v) => !oldSrc.has(v.hit.src));

  const a = multiset(beforeV.map(keyOf));
  const b = multiset(oldNow.map(keyOf));
  const gone: string[] = [], grew: string[] = [];
  for (const [k, n] of a) if ((b.get(k) ?? 0) < n) gone.push(`${k} (${n} → ${b.get(k) ?? 0})`);
  for (const [k, n] of b) if ((a.get(k) ?? 0) < n) grew.push(`${k} (${a.get(k) ?? 0} → ${n})`);

  if (gone.length || grew.length) {
    failures.push(
      `① 옛 히트가 움직였다 — 빠짐 ${gone.length} · 늘음 ${grew.length}. ` +
      `옛 집합이 감사 원자료와 대조되는 자리라 여기가 움직이면 그 대조가 깨진다.`,
    );
    for (const g of [...gone.slice(0, 5), ...grew.slice(0, 5)]) failures.push(`    ↳ ${g}`);
  } else {
    notes.push(`① 옛 히트 불변 — 판정 ${beforeV.length}건이 열 필드 키로 그대로다(옛 src ${[...oldSrc].join(" · ")})`);
  }

  const oldSites = new Set(oldNow.map((v) => siteOf(v.hit)));
  const dup = newNow.filter((v) => oldSites.has(siteOf(v.hit)));
  if (dup.length) {
    failures.push(`② 새 인식층이 옛 히트와 같은 자리를 ${dup.length}건 겹쳐 센다 — 새 기준선이 그만큼 부푼다.`);
    for (const v of dup.slice(0, 5)) failures.push(`    ↳ ${v.hit.file}:${v.hit.line} ${v.hit.prop}: ${v.hit.value} (${v.hit.src})`);
  } else {
    notes.push(`② 겹쳐 세지 않는다 — 새 판정 ${newNow.length}건과 옛 히트의 (file,line,value) 교집합 0`);
  }
}

// ── ③ 겹침 가드 자가검사. 지금 레포에 무는 자리가 없어서 **일부러 만들어** 본다.
if (SELF) {
  const tmp = mkdtempSync(join(tmpdir(), "recognize-invariant-"));
  try {
    cpSync(join(ROOT, "scripts/fixtures/tokens/faults/base"), tmp, { recursive: true });
    const put = (css: string) => {
      writeFileSync(join(tmp, "src/components/_guard.astro"), `---\n---\n<style>\n${css}\n</style>\n`);
      const hits = extract(tmp).hits.filter((h) => h.file.endsWith("_guard.astro"));
      return { ml: hits.filter((h) => h.src === "ml-decl"), all: hits };
    };

    // 가드 1 (값에 줄바꿈 없음) — 한 줄 선언은 옛 경로 관할이다.
    let r = put(`  .x { color: #302d28; }`);
    if (r.ml.length) failures.push(`③ 가드 1 이 죽었다 — 한 줄 선언에서 ml-decl 히트 ${r.ml.length}건`);
    if (!r.all.some((h) => h.src === "css-decl")) failures.push(`③ 가드 1 픽스처가 옛 경로에도 안 걸린다 — 픽스처가 틀렸다`);

    // 가드 1 은 값이 다음 줄에서 시작하는 자리도 덮는다 — 콜론 뒤 `\s*` 가 줄바꿈을
    //   흡수하므로 그 값이 한 줄이면 옛 경로가 이미 잡는다.
    r = put(`  .x {\n    color:\n      #302d28;\n  }`);
    if (r.ml.length) failures.push(`③ 가드 1 이 죽었다(줄바꿈 흡수 자리) — 값이 한 줄인데 ml-decl 히트 ${r.ml.length}건`);
    if (!r.all.some((h) => h.src === "css-decl" && h.value === "#302d28"))
      failures.push(`③ 가드 1 픽스처(줄바꿈 흡수)가 옛 경로에도 안 걸린다 — 픽스처가 틀렸다`);

    // 가드 2 — 값 안에 `prop:…;` 꼴이 들어가면 옛 경로가 그것을 이미 문다.
    //   그 바이트만 값에서 지운다(구간을 통째로 버리지 않는다).
    r = put(`  .x {\n    background: linear-gradient(\n      180deg, #F3EEE4\n    ) , url(color:#302d28);\n  }`);
    const inner = r.all.filter((h) => h.value === "#302d28");
    if (inner.length !== 1)
      failures.push(`③ 가드 2 가 죽었다 — 옛 경로가 이미 문 #302d28 이 ${inner.length}번 세어진다(1이어야 한다)`);
    if (!r.ml.some((h) => h.value === "#F3EEE4"))
      failures.push(`③ 가드 2 가 과하다 — 겹치는 바이트만 지워야 하는데 여러 줄 값 전체가 사라졌다`);

    // 양성 대조 — 가드 셋이 다 통과해도 인식기가 죽어 있으면 위 셋은 전부 초록이다.
    r = put(`  .x {\n    background: linear-gradient(\n      180deg,\n      #302d28\n    );\n  }`);
    if (!r.ml.length) failures.push(`③ 양성 대조 실패 — 진짜 여러 줄 선언에서 ml-decl 히트가 0건이다(인식기가 죽었다)`);

    if (!failures.some((f) => f.startsWith("③"))) notes.push("③ 겹침 가드 둘 + 양성 대조 — 셋 다 산다(각각 하나만 죽여도 빨개지는 것까지 확인한 구성이다)");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

if (!BEFORE && !SELF) {
  console.error("쓸 것을 안 골랐다 — --before <snapshot.json> 또는 --self-test 중 하나는 있어야 한다.");
  process.exit(1);
}

for (const n of notes) console.log(`  · ${n}`);
if (failures.length) {
  console.error("\n✗ 인식층 불변 검사 실패.");
  for (const f of failures) console.error(`  ${f}`);
  console.error(
    "\n  고치는 법: ① 이 뜨면 옛 정규식(extract.ts 의 DECL·ATTR·JSXOBJ)이나 옛 축 표(AXIS)를\n" +
    "  건드린 것이다 — 새 갈래는 새 src 라벨을 달고 나와야 한다. ② 는 새 인식기가 옛 CSS 훑기\n" +
    "  구간을 피하지 않은 것이다(legacyCssSpans·cssChunks 를 보라). ③ 은 가드가 죽었다는 뜻이고,\n" +
    "  가드가 죽으면 부채가 실제보다 커 보이거나(겹쳐 셈) 안 보이게 된다(과하게 버림).",
  );
  process.exit(1);
}
console.log("\n✓ 인식층 불변 검사 통과.");
