/**
 * 판정 — **위반·드리프트가 하나라도 있으면 실패** (하드월, KAN-079).
 *
 * 옛 판정은 래칫이었다.
 *   게이트를 세울 때 위반이 1,304건이었다. 그 상태에서 "0건이면 통과"로 올리면 첫 푸시부터
 *   CI 가 빨간불이 되고, `.github/workflows/main.yml` 은 build → deploy 가 한 잡이라
 *   **사이트 배포까지 멈춘다.** 그러면 게이트가 첫 수가 아니라 부채를 다 갚은 뒤에야
 *   켤 수 있는 마지막 수가 되고, 그 사이 새로 들어오는 리터럴은 아무도 못 막는다.
 *   그래서 지금 수를 기준선에 박고 **늘면 실패 / 같으면 통과 / 줄면 통과 + 갱신 안내** 로
 *   판정했다(KAN-070 S7).
 *
 * 승격 조건은 「래칫 0」이 아니라 「**인식층이 다 열린 뒤의** 래칫 0」이었다.
 *   그래서 네 번 미뤄졌다 — KAN-072·074·075·076 이 각각 0 을 만들었지만, 그때마다 게이트가
 *   못 보던 인식 갈래가 새로 열려 0 이 다시 비0 이 됐다(KAN-073 이 셋을 열자 0 이 778 로,
 *   KAN-075 가 넷째, KAN-076 이 다섯째, KAN-077 이 여섯째). **KAN-077 이 마지막 갈래를
 *   열었고, 그 시점에 처음으로 열 갈래가 없으면서 래칫이 0 이었다.** 진단 정본
 *   `design-concept/UI_CONSISTENCY_AUDIT.md` §6 에 남은 13항은 지금 `src/**` 에 0건이라
 *   열 대상이 아니다(그 항 자체가 「0건인 동안만 괜찮다」는 기록이다).
 *
 * 그래서 무엇이 달라졌나.
 *   **기준선과 비교하지 않는다.** 무는 판정이 1건이면 실패다 — 기준선 파일에 무슨 수가
 *   적혀 있어도 판정이 안 흔들린다. 기준선이 아예 없어도 하드월은 그대로 문다(아래
 *   `hardwall` 의 `base === null` 갈래). 래칫이 남아 있는 자리는 **하나뿐이고 그것은
 *   판정 수가 아니다** — `selfTestFaults`(게이트 자신의 크기, 줄면 실패).
 *
 * 무엇을 세나.
 *   **최종 판정(`verdict`)으로 센다.** 1차 판정(`auditLabel`)은 감사 원자료와 대조할 때
 *   쓰는 값이고, 게이트가 무는 것은 "이 자리를 고쳐야 하는가"다. 둘을 섞으면
 *   `docrule` 의 롤업과 `color` 의 1차 이름이 같은 칸에 들어가 수가 조용히 틀어진다.
 *
 *   무는 것은 **위반과 드리프트 둘**이다(`BITING`). 준수·판정 불가·정당한 예외는 정보로만
 *   적는다 — 예외가 느는 것은 근거 문서 위치가 필수라 이미 다른 게이트가 막고 있고(S10),
 *   판정 불가가 느는 것은 대개 스캔 범위를 넓혔다는 뜻이라 실패로 볼 값이 아니다.
 *   **판정 불가가 위반의 도피처가 되는 것**은 이 파일이 아니라 별도 장치가 본다(KAN-079 S9).
 *
 * 기준선 파일이 승격 뒤에 하는 일 셋.
 *   ① `selfTestFaults` 래칫 ② `srcFiles` 알림(범위가 바뀌었다) ③ 정보 집계의 diff —
 *   인식층을 넓힌 커밋이 준수·판정 불가를 얼마나 움직였는지가 남는 자리가 여기뿐이다.
 *   **무는 판정 칸은 파일에 실릴 수 없다** — `verify-tokens.ts` 의 갱신 경로가 무는 판정이
 *   있으면 쓰기를 거부하므로(KAN-079 S4), 기록되는 순간 자체가 없다. 그것이 「기준선을
 *   갱신해 위반을 굳힌다」는 회피 경로를 닫는 방식이다.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Verdict } from "./types.ts";

export const BASELINE_PATH = "scripts/tokens-baseline.json";
const GENERATOR = "verify-tokens@1";
/** 이 둘만 게이트가 문다. */
const BITING = ["위반", "드리프트"] as const;
/** 실패 목록이 화면을 덮지 않게 — 파일당 자리 상한과 파일 상한. */
const SITES_PER_FILE = 12;
const FILES_SHOWN = 20;

export interface Baseline {
  generator: string;
  /** 스캔한 파일 수. 크게 달라지면 범위가 바뀐 것이라 사람이 봐야 한다. */
  srcFiles: number;
  /**
   * `축 / 판정` → 건수. 축은 판정 축(color·radius·stroke·spacing·font·…)이다.
   *
   * **무는 판정(위반·드리프트) 칸은 여기 들어올 수 없다** — 승격 뒤 갱신 경로가 무는 판정이
   * 있는 상태에서 쓰기를 거부한다(위 머리주석 ③). 옛 기준선에서 넘어온 그 칸은 판정에
   * 아무 영향이 없고, `hardwall` 이 「낡은 기준선」이라고 알리기만 한다.
   */
  counts: Record<string, number>;
  totals: Record<string, number>;
  /**
   * 파일 → 무는 판정(위반·드리프트) 건수.
   *
   * 래칫 시절에는 이 표가 「어느 파일이 늘었는가」를 짚는 데 쓰였다. 하드월에는 「늘었다」가
   * 없으므로 판정에는 안 쓰이고, **정상 상태에서 항상 비어 있어야 하는 칸**으로 남는다 —
   * 비어 있지 않은 기준선은 승격 전에 만들어진 것이다.
   */
  files: Record<string, number>;
  /**
   * **등록된 자가검사 고장 종수.** 줄면 실패한다 (KAN-076).
   *
   * 판정 수를 세는 나머지 필드와 성질이 다르다 — 이건 **게이트 자신의 크기**다. 고장은
   * 인식기가 소유하므로 인식기를 하나 빼면 그 고장도 함께 사라지고, 그러면 자가검사는
   * 「덜 검사하면서 통과」한다. **승격 뒤에도 이 자리만 래칫으로 남는다**(늘리는 것은 자유,
   * 줄이는 것만 명시적 행위). 옛 기준선(이 필드가 없는 것)은 검사를 건너뛴다 — 없는 값을
   * 0 으로 읽으면 첫 실행이 무조건 통과해 도입이 무의미해진다.
   */
  selfTestFaults?: number;
  /**
   * **등록된 판정 방식 검사 종수.** 줄면 실패한다 (KAN-079 S5).
   *
   * `selfTestFaults` 와 성질은 같고 보는 것이 다르다. 고장 픽스처는 「판정기가 리터럴을
   * 잡는가」를 보지만 **판정 방식(래칫이냐 하드월이냐)은 안 본다** — 그래서 승격을
   * 되돌려도 고장 검사는 전부 초록이다. 그 자리를 보는 검사가 `selftest.ts` 의 `GUARDS` 이고,
   * 검사 자체가 배열에서 빠지는 것을 이 수가 막는다. 옛 기준선(이 필드가 없는 것)은
   * 검사를 건너뛴다 — `selfTestFaults` 와 같은 이유다.
   */
  selfTestGuards?: number;
}

/** 판정 축 — `Hit.axis` 가 아니라 사유에서 되뽑는다(색 축이 stroke·잡음으로 갈리기 때문). */
function judgeAxis(v: Verdict): string {
  const r = v.reason;
  if (r.startsWith("stroke 축")) return "stroke";
  if (r.startsWith("radius 축")) return "radius";
  if (r.startsWith("color 축")) return "color";
  // 굵기·행간·자간 (KAN-080 S6). 셋을 접두로 가르지 않으면 전부 `font` 칸에 쌓여
  // 「어느 축이 무는가」를 못 말한다 — 크기 축의 수까지 같은 칸에 섞인다.
  if (r.startsWith("font-weight 축")) return "font-weight";
  if (r.startsWith("font-leading 축")) return "font-leading";
  if (r.startsWith("font-track 축")) return "font-track";
  if (r.startsWith("측정 제외")) return "잡음";
  return v.hit.axis;
}

export const isBiting = (v: Verdict) => (BITING as readonly string[]).includes(v.verdict);

/** 무는 판정만 골라 낸다. 갱신 경로의 문(S4)과 하드월 판정이 **같은 함수**를 쓴다. */
export const biting = (verdicts: Verdict[]) => verdicts.filter(isBiting);

/**
 * **감사 기준 집계** — `design-concept/UI_CONSISTENCY_AUDIT.md` §0 표와 같은 구성으로 센다.
 *
 * 왜 두 벌을 내나. 게이트가 세는 것과 감사가 센 것은 **구성이 다르다** —
 * 게이트는 제외분(생성물·복제물)을 빼고 세고 `fallback` 축을 함께 세는데, 감사 §0 은
 * 제외분까지 포함하고 `fallback` 은 별도 파일(`s4-fallback.json`)로 뺐다. 둘 다 맞지만
 * **숫자가 다르면 다음 사람이 먼저 의심하는 것은 게이트다.**
 *
 * 그렇다고 기준을 하나로 접을 수는 없다. 게이트가 감사처럼 세면 아무도 고칠 수 없는
 * 생성물의 리터럴을 부채로 세게 되고, 감사가 게이트처럼 세면 그때 실제로 무엇을 봤는지가
 * 기록에서 사라진다. **대신 사람이 손으로 맞추지 않게 한다** — 게이트가 두 수를 한 자리에서
 * 함께 내고, 감사 문서는 「현재 수는 게이트가 낸다」고 적은 뒤 다시 안 고친다.
 */
export function auditBasis(classifyVerdicts: Verdict[]): Record<string, number> {
  // 인자는 `color`·`docrule` 판정만이다 — `fallback` 은 감사 §0 표 밖이라 진입점이 빼고 넘긴다.
  // 제외분은 **빼지 않는다**: 감사는 생성물의 리터럴까지 세어 3,539 를 만들었다.
  const t: Record<string, number> = {};
  for (const v of classifyVerdicts) t[v.verdict] = (t[v.verdict] ?? 0) + 1;
  return Object.fromEntries(Object.entries(t).sort(([a], [b]) => (a < b ? -1 : 1)));
}

export function tally(
  verdicts: Verdict[], srcFiles: number, selfTestFaults: number, selfTestGuards: number,
): Baseline {
  const counts: Record<string, number> = {};
  const totals: Record<string, number> = {};
  const files: Record<string, number> = {};
  for (const v of verdicts) {
    const k = `${judgeAxis(v)} / ${v.verdict}`;
    counts[k] = (counts[k] ?? 0) + 1;
    totals[v.verdict] = (totals[v.verdict] ?? 0) + 1;
    if (isBiting(v)) files[v.hit.file] = (files[v.hit.file] ?? 0) + 1;
  }
  const sort = (o: Record<string, number>) =>
    Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : 1)));
  return { generator: GENERATOR, srcFiles, counts: sort(counts), totals: sort(totals),
           files: sort(files), selfTestFaults, selfTestGuards };
}

export const readBaseline = (root: string): Baseline | null => {
  const p = join(root, BASELINE_PATH);
  return existsSync(p) ? (JSON.parse(readFileSync(p, "utf-8")) as Baseline) : null;
};

/**
 * 결정론적으로 쓴다 — 두 번 돌려 바이트가 같아야 한다.
 *
 * **무는 판정 칸이 실린 기준선은 쓰지 않는다** (KAN-079 S6). 부르는 쪽이 이미
 * `refuseBaselineUpdate` 로 막고 있지만, 그 문은 진입점 배선에 달려 있고 배선은 지워질 수
 * 있다. 여기서 한 번 더 보는 이유는 **파일 형식의 불변식**이기 때문이다 — 하드월에서
 * 「위반이 N건 있는 것이 정상」이라고 적힌 기준선은 규칙과 반대되는 말을 하고, 다음 사람은
 * 게이트 코드가 아니라 그 파일을 근거로 읽는다. 던지는 것이 맞다: 조용히 쓰면 그 파일이
 * 커밋되고, 그때는 아무도 안 본다.
 */
export const writeBaseline = (root: string, b: Baseline) => {
  const bad = Object.entries(b.counts).filter(([k, n]) => n > 0 && BITING.some((r) => k.endsWith(`/ ${r}`)));
  if (bad.length || Object.keys(b.files).length) {
    throw new Error(
      `기준선에 무는 판정 칸이 실렸다 — ${bad.map(([k, n]) => `${k} ${n}`).join(" · ") || "files 표"}. ` +
      `하드월에서 기준선은 위반을 굳히는 자리가 아니다(refuseBaselineUpdate 를 먼저 지나야 한다).`,
    );
  }
  writeFileSync(join(root, BASELINE_PATH), JSON.stringify(b, null, 2) + "\n");
};

/**
 * 무는 자리를 **전량** `파일:줄 속성: 값 — 판정` 으로 낸다 (KAN-079 S3).
 *
 * 래칫 시절에는 「어느 칸이 늘었는가」를 먼저 내고 **늘어난 파일만** 자리를 냈다. 하드월에는
 * 「늘어난 칸」이 없으므로 그 게이팅이 통째로 사라진다. 옮겨 온 장치가 둘이다.
 *
 *   ① **승격된 숫자는 원문을 함께 낸다** — `6(→6px)`. 안 그러면 "고치는 법" 이
 *      `borderRadius: 6px` 처럼 **그 파일에서 grep 이 안 되는 값**을 가리킨다
 *      (인라인 스타일 원문은 `borderRadius: 6` 이다. KAN-073 S5).
 *   ② **상한** — 첫 실패가 수백 줄을 토하면 정작 무엇을 고칠지가 묻힌다.
 */
function sites(verdicts: Verdict[]): string[] {
  const byFile = new Map<string, Verdict[]>();
  for (const v of verdicts) {
    const a = byFile.get(v.hit.file);
    if (a) a.push(v); else byFile.set(v.hit.file, [v]);
  }
  const names = [...byFile.keys()].sort();
  const out = names.slice(0, FILES_SHOWN).map((f) => {
    const vs = byFile.get(f)!;
    const lines = vs.slice(0, SITES_PER_FILE).map((v) => {
      const shown = v.hit.rawValue ? `${v.hit.rawValue}(→${v.hit.value})` : v.hit.value;
      return `      ${f}:${v.hit.line} ${v.hit.prop}: ${shown} — ${v.verdict}`;
    });
    return `  ↳ ${f} — ${vs.length}곳\n` + lines.join("\n") +
      (vs.length > SITES_PER_FILE ? `\n      … 그리고 ${vs.length - SITES_PER_FILE}곳 더` : "");
  });
  if (names.length > FILES_SHOWN) {
    out.push(`  ↳ … 그리고 파일 ${names.length - FILES_SHOWN}개 더`);
  }
  return out;
}

/**
 * 하드월 판정. **기준선과 비교하지 않는다** — 무는 판정이 있으면 실패다.
 *
 * `base` 는 판정에 안 쓰인다. 쓰이는 자리는 둘뿐이다 — `selfTestFaults` 래칫(게이트가
 * 작아졌는가)과 `srcFiles` 알림. 그래서 `base === null` 이어도 하드월은 그대로 문다.
 * 래칫 시절에는 기준선이 없으면 "아무것도 안 문다"였는데, 그 갈래를 그대로 두면
 * **기준선 파일을 지우는 것이 곧 게이트를 끄는 것**이 된다.
 */
export function hardwall(
  now: Baseline, base: Baseline | null, verdicts: Verdict[] = [],
): { failures: string[]; notes: string[] } {
  const failures: string[] = [];
  const notes: string[] = [];

  const bites = biting(verdicts);
  if (bites.length) {
    failures.push(
      `무는 판정 ${bites.length}건 — 하드월이라 하나라도 있으면 실패다(기준선과 비교하지 않는다)`,
    );
    failures.push(...sites(bites));
  } else {
    notes.push("무는 판정 0건 — 위반·드리프트가 없다(하드월).");
  }

  if (!base) {
    notes.push(
      `기준선이 없다 — 하드월 판정은 그대로 돈다. 다만 자가검사 고장 종수 래칫이 기준선을 ` +
      `읽으므로 \`bun run tokens:verify --update-baseline\` 으로 한 번 박아라.`,
    );
    return { failures, notes };
  }
  if (base.generator !== now.generator) {
    notes.push(`기준선이 다른 판정기(${base.generator})로 만들어졌다 — 지금은 ${now.generator} 다.`);
  }
  // 옛 기준선에서 넘어온 무는 판정 칸 — 판정에는 아무 영향이 없다. 갱신 경로가 그 칸을
  // 다시 만들 수 없으므로(위 머리주석 ③) 남아 있다는 것은 승격 전 파일이라는 뜻이다.
  const staleBiting = Object.entries(base.counts ?? {})
    .filter(([k, n]) => n > 0 && BITING.some((r) => k.endsWith(`/ ${r}`)))
    .map(([k, n]) => `${k} ${n}`);
  if (staleBiting.length || Object.keys(base.files ?? {}).length) {
    notes.push(
      `기준선이 승격 전 파일이다 — 무는 판정 칸이 남아 있다(${staleBiting.join(" · ") || "files 표"}). ` +
      `판정에는 안 쓰이지만 파일이 규칙과 반대되는 말을 하므로 \`--update-baseline\` 으로 다시 써라.`,
    );
  }
  // 게이트 자신이 작아졌는가 — 판정 수와 달리 **줄면 그 자체가 실패**다(위 `selfTestFaults`).
  if (typeof base.selfTestFaults === "number" && now.selfTestFaults! < base.selfTestFaults) {
    failures.push(
      `자가검사 고장이 ${base.selfTestFaults} → ${now.selfTestFaults} 종으로 줄었다 — ` +
      `인식기가 배열에서 빠졌거나 고장이 지워졌다. 게이트가 덜 검사하면서 통과하는 자리다.`,
    );
  }
  if (typeof base.selfTestGuards === "number" && now.selfTestGuards! < base.selfTestGuards) {
    failures.push(
      `판정 방식 검사가 ${base.selfTestGuards} → ${now.selfTestGuards} 종으로 줄었다 — ` +
      `하드월이 래칫으로 되돌아가는 것을 보는 검사가 빠졌다.`,
    );
  }
  if (base.srcFiles !== now.srcFiles) {
    notes.push(`스캔 파일 수가 ${base.srcFiles} → ${now.srcFiles} 로 바뀌었다 — 범위가 달라졌는지 확인해라.`);
  }
  // 정보 집계의 diff — 인식층을 넓힌 커밋이 준수·판정 불가를 얼마나 움직였는지가 남는 자리다.
  const moved = [...new Set([...Object.keys(base.totals ?? {}), ...Object.keys(now.totals)])]
    .sort()
    .filter((k) => (base.totals?.[k] ?? 0) !== (now.totals[k] ?? 0))
    .map((k) => `${k} ${base.totals?.[k] ?? 0} → ${now.totals[k] ?? 0}`);
  notes.push(moved.length
    ? `정보 집계가 움직였다 — ${moved.join(" · ")}. 인식 범위가 바뀐 것이면 \`--update-baseline\` 으로 굳혀라.`
    : "정보 집계는 기준선과 같다.");
  return { failures, notes };
}

/**
 * 갱신 경로의 문 — **무는 판정이 있으면 기준선을 쓰지 못한다** (KAN-079 S4).
 *
 * 판정과 **같은 `biting()`** 을 쓴다. 여기에 판정 규칙을 다시 적으면 언젠가 한쪽만
 * 고쳐지고, 그 어긋남은 「부채가 적다」로 읽혀 통과한다.
 *
 * 함수로 뽑아 둔 이유는 자가검사다. 이 문이 진입점 `if` 블록 안에만 있으면 **검사할 자리가
 * 없고**, 그러면 다음 사람이 그 블록을 지워도 게이트는 초록이다(`selftest.ts` 의 `GUARDS`).
 * 배선까지 검사해야 하는 이유도 같다 — 함수가 살아 있어도 진입점이 안 부르면 문이 없다.
 */
export function refuseBaselineUpdate(scored: Verdict[]): { refuse: boolean; lines: string[] } {
  const bites = biting(scored);
  if (!bites.length) return { refuse: false, lines: [] };
  const lines = [`✗ 기준선 갱신을 거부한다 — 무는 판정이 ${bites.length}건 있다.`];
  for (const b of bites.slice(0, SITES_PER_FILE)) {
    const shown = b.hit.rawValue ? `${b.hit.rawValue}(→${b.hit.value})` : b.hit.value;
    lines.push(`  ${b.hit.file}:${b.hit.line} ${b.hit.prop}: ${shown} — ${b.verdict}`);
  }
  if (bites.length > SITES_PER_FILE) lines.push(`  … 그리고 ${bites.length - SITES_PER_FILE}건 더`);
  lines.push(
    "",
    "  이 게이트는 하드월이다 — 기준선은 위반을 굳히는 자리가 아니다.",
    "  위에 지목된 자리를 먼저 고쳐라(또는 근거 문서 위치를 걸어 예외로 등록해라).",
    "  그 뒤에 다시 부르면 정보 집계와 검사 종수만 갱신된다.",
  );
  return { refuse: true, lines };
}
