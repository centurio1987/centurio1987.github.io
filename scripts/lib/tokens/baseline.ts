/**
 * 래칫 — **늘면 실패, 같으면 통과, 줄면 통과 + 갱신 안내** (KAN-070 S7).
 *
 * 왜 하드월이 아닌가.
 *   위반이 1,300건 넘게 쌓인 상태에서 "0건이면 통과"로 올리면 첫 푸시부터 CI 가
 *   빨간불이 되고, `.github/workflows/main.yml` 은 build → deploy 가 한 잡이라
 *   **사이트 배포까지 멈춘다.** 그러면 게이트가 첫 수가 아니라 부채를 다 갚은 뒤에야
 *   켤 수 있는 마지막 수가 되고, 그 사이 새로 들어오는 리터럴은 아무도 못 막는다.
 *
 *   이 레포의 성문 선례는 「다 갚고 하드월」 하나뿐이다 — `check-post-markers` 가
 *   옛 글 83건을 다 옮긴 뒤 올라갔다(`CLAUDE.md:212`). 래칫은 전례가 없다.
 *   **선례를 따르는 것이 아니라 선례를 못 따르는 이유가 규모다**(83 vs 1,300).
 *   0 으로 수렴하면 그때 순수 하드월로 승격한다.
 *
 * 무엇을 세나.
 *   **최종 판정(`verdict`)으로 센다.** 1차 판정(`auditLabel`)은 감사 원자료와 대조할 때
 *   쓰는 값이고, 래칫이 무는 것은 "이 자리를 고쳐야 하는가"다. 둘을 섞으면
 *   `docrule` 의 롤업과 `color` 의 1차 이름이 같은 칸에 들어가 수가 조용히 틀어진다.
 *
 *   무는 것은 **위반과 드리프트 둘**이다. 준수·판정 불가·정당한 예외는 정보로만 적는다 —
 *   예외가 느는 것은 근거 문서 위치가 필수라 이미 다른 게이트가 막고 있고(S10),
 *   판정 불가가 느는 것은 대개 스캔 범위를 넓혔다는 뜻이라 실패로 볼 값이 아니다.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Verdict } from "./types.ts";

export const BASELINE_PATH = "scripts/tokens-baseline.json";
const GENERATOR = "verify-tokens@1";
/** 이 둘만 래칫이 문다. */
const RATCHETED = ["위반", "드리프트"] as const;

export interface Baseline {
  generator: string;
  /** 스캔한 파일 수. 크게 달라지면 범위가 바뀐 것이라 사람이 봐야 한다. */
  srcFiles: number;
  /** `축 / 판정` → 건수. 축은 판정 축(color·radius·stroke·spacing·font·…)이다. */
  counts: Record<string, number>;
  totals: Record<string, number>;
  /**
   * 파일 → 무는 판정(위반·드리프트) 건수.
   *
   * 축만 세면 "color / 위반 가 1건 늘었다"까지밖에 못 말한다. 368건 중 어느 것이
   * 새것인지는 사람이 찾아야 하고, 그러면 게이트가 **일을 넘기는** 도구가 된다.
   * 파일까지 세면 어느 파일이 늘었는지 그 자리에서 나오고, 그 파일의 위반 줄을
   * 지금 실행에서 뽑아 `파일:줄` 로 지목할 수 있다.
   */
  files: Record<string, number>;
  /**
   * **등록된 자가검사 고장 종수.** 줄면 실패한다 (KAN-076).
   *
   * 판정 수를 세는 나머지 필드와 성질이 다르다 — 이건 **게이트 자신의 크기**다.
   * 고장은 인식기가 소유하므로 인식기를 하나 빼면 그 고장도 함께 사라지고, 그러면
   * 자가검사는 「덜 검사하면서 통과」한다. 옛 기준선(이 필드가 없는 것)은 검사를
   * 건너뛴다 — 없는 값을 0 으로 읽으면 첫 실행이 무조건 통과해 도입이 무의미해진다.
   */
  selfTestFaults?: number;
}

/** 판정 축 — `Hit.axis` 가 아니라 사유에서 되뽑는다(색 축이 stroke·잡음으로 갈리기 때문). */
function judgeAxis(v: Verdict): string {
  const r = v.reason;
  if (r.startsWith("stroke 축")) return "stroke";
  if (r.startsWith("radius 축")) return "radius";
  if (r.startsWith("color 축")) return "color";
  if (r.startsWith("측정 제외")) return "잡음";
  return v.hit.axis;
}

export const isRatcheted = (v: Verdict) => (RATCHETED as readonly string[]).includes(v.verdict);

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

export function tally(verdicts: Verdict[], srcFiles: number, selfTestFaults: number): Baseline {
  const counts: Record<string, number> = {};
  const totals: Record<string, number> = {};
  const files: Record<string, number> = {};
  for (const v of verdicts) {
    const k = `${judgeAxis(v)} / ${v.verdict}`;
    counts[k] = (counts[k] ?? 0) + 1;
    totals[v.verdict] = (totals[v.verdict] ?? 0) + 1;
    if (isRatcheted(v)) files[v.hit.file] = (files[v.hit.file] ?? 0) + 1;
  }
  const sort = (o: Record<string, number>) =>
    Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : 1)));
  return { generator: GENERATOR, srcFiles, counts: sort(counts), totals: sort(totals),
           files: sort(files), selfTestFaults };
}

export const readBaseline = (root: string): Baseline | null => {
  const p = join(root, BASELINE_PATH);
  return existsSync(p) ? (JSON.parse(readFileSync(p, "utf-8")) as Baseline) : null;
};

/** 결정론적으로 쓴다 — 두 번 돌려 바이트가 같아야 한다. */
export const writeBaseline = (root: string, b: Baseline) =>
  writeFileSync(join(root, BASELINE_PATH), JSON.stringify(b, null, 2) + "\n");

export function ratchet(
  now: Baseline, base: Baseline | null, verdicts: Verdict[] = [],
): { failures: string[]; notes: string[] } {
  if (!base) {
    return { failures: [], notes: [
      `기준선이 없다 — \`bun run tokens:verify --update-baseline\` 으로 지금 수를 박아라. ` +
      `그전까지 래칫은 아무것도 안 문다.`] };
  }
  const failures: string[] = [];
  const notes: string[] = [];
  if (base.generator !== now.generator) {
    notes.push(`기준선이 다른 판정기(${base.generator})로 만들어졌다 — 지금은 ${now.generator} 다.`);
  }
  const keys = [...new Set([...Object.keys(base.counts), ...Object.keys(now.counts)])].sort();
  let up = 0, down = 0;
  for (const k of keys) {
    if (!RATCHETED.some((r) => k.endsWith(`/ ${r}`))) continue;
    const b = base.counts[k] ?? 0, n = now.counts[k] ?? 0;
    if (n > b) { failures.push(`${k} 가 ${b} → ${n} 으로 ${n - b}건 늘었다`); up++; }
    else if (n < b) down++;
  }
  // 어느 파일이 늘었는지, 그 파일의 무는 자리가 어디인지까지 낸다.
  if (failures.length) {
    const fkeys = [...new Set([...Object.keys(base.files ?? {}), ...Object.keys(now.files)])].sort();
    for (const f of fkeys) {
      const b = base.files?.[f] ?? 0, n = now.files[f] ?? 0;
      if (n <= b) continue;
      const sites = verdicts
        .filter((v) => v.hit.file === f && isRatcheted(v))
        // 승격된 숫자는 원문을 함께 낸다 — `6(→6px)`. 안 그러면 "고치는 법" 이
        // `borderRadius: 6px` 처럼 **그 파일에서 grep 이 안 되는 값**을 가리킨다
        // (인라인 스타일 원문은 `borderRadius: 6` 이다. KAN-073 S5).
        .map((v) => {
          const shown = v.hit.rawValue ? `${v.hit.rawValue}(→${v.hit.value})` : v.hit.value;
          return `${f}:${v.hit.line} ${v.hit.prop}: ${shown} — ${v.verdict}`;
        });
      failures.push(
        `  ↳ ${f} 가 ${b} → ${n} (${n - b}건). 이 파일의 무는 자리 ${sites.length}곳:\n` +
        sites.slice(0, 12).map((x) => `      ${x}`).join("\n") +
        (sites.length > 12 ? `\n      … 그리고 ${sites.length - 12}곳 더` : ""),
      );
    }
  }

  if (!failures.length && down) {
    notes.push(`${down}칸이 줄었다 — \`--update-baseline\` 으로 기준선을 내려 굳혀라(안 내리면 되돌아가도 안 잡힌다).`);
  }
  if (!failures.length && !down) notes.push("기준선과 같다.");
  // 게이트 자신이 작아졌는가 — 판정 수와 달리 **줄면 그 자체가 실패**다(위 `selfTestFaults`).
  if (typeof base.selfTestFaults === "number" && now.selfTestFaults < base.selfTestFaults) {
    failures.push(
      `자가검사 고장이 ${base.selfTestFaults} → ${now.selfTestFaults} 종으로 줄었다 — ` +
      `인식기가 배열에서 빠졌거나 고장이 지워졌다. 게이트가 덜 검사하면서 통과하는 자리다.`,
    );
  }
  if (base.srcFiles !== now.srcFiles) {
    notes.push(`스캔 파일 수가 ${base.srcFiles} → ${now.srcFiles} 로 바뀌었다 — 범위가 달라졌는지 확인해라.`);
  }
  return { failures, notes };
}
