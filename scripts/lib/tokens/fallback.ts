/**
 * `var(--x, fallback)` 자리 판정 — 대조 상대는 `s4-fallback.json` (KAN-070 S4).
 *
 * 원본은 `scripts/fixtures/tokens/reference/s4-fallback.py` 다. 정규식·`:root` 깊이 추적·
 * 정규화(`norm`)를 **한 글자도 안 바꿔 옮겼다.** 감사 원자료와 히트 단위로 대조할 수 없으면
 * 이식이 맞는지 판정할 방법이 사라지기 때문이다. 판정 이름만 이 레포의 계약
 * (`types.ts` 의 `Verdict.verdict`)에 맞춰 갈아 끼웠다 — 아래 「판정 이름 대응」 절.
 *
 * ── 왜 이 축만 자체 스캔인가
 * 공통 추출(`extract.ts`)은 리터럴을 세기 전에 `VARCALL = /var\([^)]*\)/g` 로 `var(...)` 를
 * **통째로 지운다.** `var()` 안쪽은 리터럴이 아니라는 판단이 맞기 때문인데, 그 결과
 * fallback 값은 `ctx.hits` 에 한 번도 안 들어온다. 그래서 여기서만 `ctx.files` 를 받아
 * 원문을 다시 훑는다. **`ctx.hits` 를 뒤져도 없다** — 찾다가 시간 버리지 마라.
 *
 * 파일 목록에 `src/styles/tokens.css` 를 도로 넣는 이유도 같다. `collectFiles` 가 "정본
 * 자신은 대상이 아니다"로 빼는데, 감사는 그 파일까지 훑어 `tokens.css:44` 의
 * `var(--shell-max, var(--content-max))` 를 한 자리로 셌다. 빼면 108 이 107 이 된다.
 *
 * ── 적재 경로가 판정을 가른다 (살아있음 / 죽음)
 * fallback 은 **그 토큰이 정의되지 않은 지면에서만** 뜬다. 그러니 "그 토큰의 정의가 실린
 * 스타일시트가 항상 적재되는가"가 곧 발동 여부다.
 *
 *   `tokens.css` ← `global.css:1` ← `BaseLayout.astro:2` → 전 페이지에 있다
 *     → 그 토큰들의 fallback 은 **죽은 값**이다. 안 뜬다. 값이 갈려도 화면은 안 바뀐다.
 *   `deco.css` → 쓰는 쪽에서만 들여온다(`design-concept/DECO_KIT.md:40`)
 *     → `--deco-*` 의 fallback 은 **발동한다**. deco.css 를 안 들여온 지면에서 다른 색이 뜬다.
 *
 * 이 갈래를 하드코딩하지 않고 `BaseLayout.astro` → `global.css` → `@import` 사슬을 실제로
 * 따라가 구한다. 나중에 누가 `deco.css` 를 전역으로 올리면 판정이 저절로 따라와야 한다.
 * 사슬이 끊기면(= `BaseLayout` 이 `global.css` 를 안 들여오면) 전부 살아있음으로 보수적으로
 * 판정하고 그 사실을 `notes` 로 낸다 — 조용히 틀린 값을 내는 것보다 낫다.
 *
 * ── 스위치 토큰은 대조 자체를 안 한다
 * `--deco-t3` 처럼 선택자마다 다시 정의되는 것은 **스위치**이지 값 토큰이 아니다. 스위치의
 * fallback 은 "기본 상태"라 토큰 값과 다른 것이 정상이다. 판정 대상은 `src/styles/*.css`
 * 전체에서 **정확히 한 번만, `:root` 안에서** 정의된 이름뿐이다(현재 119개). 이 판별을
 * 이름 목록으로 굳히지 않은 이유 — 목록은 스타일시트가 바뀌면 조용히 낡는다. 실제로 지금
 * 걸리는 다섯은 `--deco-op`·`--deco-t3`·`--deco-t4`·`--deco-wob`·`--shell-max` 다.
 *
 * ── 판정 이름 대응 (감사 → `Verdict.verdict`)
 *   일치                  → `준수`
 *   불일치 · 살아있음     → `위반`      실제로 다른 값이 뜬다. 고쳐야 하는 자리다
 *   불일치 · 죽음         → `드리프트`  값은 갈렸지만 안 뜬다. 지금 화면은 멀쩡하다
 *   스위치 — 대조 제외    → `판정 불가`
 *   지역 변수 — 대조 제외 → `판정 불가`
 * `정당한 예외` 는 안 쓴다 — 근거 문서 위치가 필수인데(S10) fallback 자리에 그 등록처가
 * 아직 없다. 예외로 볼 자리가 생기면 그때 목록과 함께 들어온다.
 *
 * ── 자체 타입을 쓰는 이유
 * 한 자리는 (파일·줄·토큰 이름·fallback 값·토큰 값·토큰 위치)인데 `Hit` 의 `prop`·`src` 는
 * 이 축에 대응물이 없다(선언 자리를 안 보고 원문을 훑으므로 CSS 속성도 자리 종류도 모른다).
 * 그래서 안에서는 `FallbackSite` 로 다루고 `Verdict.hit` 에 넣을 때만 `Hit` 로 맞춘다.
 * `types.ts` 는 축 셋이 함께 쓰므로 고치지 않는다.
 *
 * `failures` 는 비워 둔다 — 래칫이 아직 없다(S7 이 채운다). 지금은 `notes` 로만 낸다.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Axis, AxisModule, AxisResult, Hit, ScanContext, Verdict } from "./types.ts";

// ── 정규식. 원본 s4-fallback.py:22,46 그대로.
const DEF = /^\s*(--[\w-]+)\s*:\s*(.+?);\s*(?:\/\*.*)?$/;
const COMMENT = /\/\*[\s\S]*?\*\//g;
const ROOT_OPEN = /:root[^{]*\{/;
const VARFB = /var\(\s*(--[\w-]+)\s*,\s*([^()]*(?:\([^()]*\)[^()]*)*)\)/g;
const CSS_IMPORT = /@import\s+["']\.\/([\w.-]+\.css)["']/g;

/** 대조 제외 사유 — 감사가 쓴 문구 그대로 유지한다. */
const OFF_SWITCH = "스위치 — 대조 제외";
const OFF_LOCAL = "지역 변수 — 대조 제외";

/** `src/styles/*.css` 한 줄에서 읽은 정의 하나. */
interface Def {
  value: string;
  /** `파일:줄` 표기. */
  at: string;
  /** `:root` 블록 안에서 선언됐나. */
  inRoot: boolean;
}

/** `var(--x, fallback)` 자리 하나. `Hit` 에 대응물이 없어 안에서만 쓰는 모양이다. */
interface FallbackSite {
  file: string;
  line: number;
  name: string;
  fallback: string;
  /** 값 토큰일 때만 채운다. */
  tokenValue: string | null;
  tokenAt: string | null;
  klass: "일치" | "불일치" | typeof OFF_SWITCH | typeof OFF_LOCAL;
  /** 불일치일 때만 뜻이 있다 — fallback 이 실제로 뜨는가. */
  live: boolean | null;
}

const countNl = (s: string): number => (s.match(/\n/g) ?? []).length;

/**
 * 값 정규화. 원본 s4-fallback.py:48-54 그대로.
 * `#abc` → `#aabbcc`, `.5` → `0.5`, 쉼표 뒤 공백 통일, 공백 접기, 소문자.
 * 표기만 다른 같은 값을 불일치로 세지 않기 위한 것이다.
 */
function norm(v: string): string {
  let s = v.trim().replace(/;+$/, "");
  s = s.replace(/\s+/g, " ").toLowerCase();
  const m = /^#([0-9a-f]{3})$/.exec(s);
  if (m) s = "#" + [...m[1]].map((c) => c + c).join("");
  s = s.replace(/(?<![\w.])\.(\d)/g, "0.$1");
  s = s.replace(/,\s*/g, ", ");
  return s;
}

/**
 * `src/styles/*.css` 의 토큰 정의를 전부 모은다. 원본 s4-fallback.py:25-41 그대로.
 *
 * `:root` 안인지를 중괄호 깊이로 센다 — `@media` 안의 `:root` 도 같은 규칙으로 잡힌다.
 * 주석은 지우되 **줄 수를 보존**해 지운다(줄 번호가 근거로 나가므로).
 */
function readDefs(root: string): Map<string, Def[]> {
  const defs = new Map<string, Def[]>();
  const dir = join(root, "src/styles");
  const files = readdirSync(dir).filter((f) => f.endsWith(".css")).sort();

  for (const f of files) {
    const rel = `src/styles/${f}`;
    const text = readFileSync(join(dir, f), "utf-8")
      .replace(COMMENT, (m) => "\n".repeat(countNl(m)));
    let depth = 0;
    let rootDepth: number | null = null;
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].replace(/\r$/, "");
      const m = DEF.exec(line);
      if (m) {
        const inRoot = rootDepth !== null && depth === rootDepth;
        const list = defs.get(m[1]) ?? [];
        list.push({ value: m[2].trim(), at: `${rel}:${i + 1}`, inRoot });
        defs.set(m[1], list);
      }
      const opens = (line.match(/\{/g) ?? []).length;
      const closes = (line.match(/\}/g) ?? []).length;
      if (opens && ROOT_OPEN.test(line) && rootDepth === null) rootDepth = depth + 1;
      depth += opens - closes;
      if (rootDepth !== null && depth < rootDepth) rootDepth = null;
    }
  }
  return defs;
}

/**
 * 전 페이지에 항상 적재되는 스타일시트 집합.
 *
 * `BaseLayout.astro` 가 `global.css` 를 들여오는지부터 확인하고, 거기서 `@import` 사슬을
 * 따라간다. 사슬이 안 잡히면 빈 집합을 돌려주고 호출부가 보수적으로(전부 살아있음) 판정한다.
 */
function alwaysLoadedStyles(root: string): Set<string> {
  const loaded = new Set<string>();
  let base: string;
  try {
    base = readFileSync(join(root, "src/layouts/BaseLayout.astro"), "utf-8");
  } catch {
    return loaded;
  }
  if (!/import\s+["']\.\.\/styles\/global\.css["']/.test(base)) return loaded;

  const queue = ["global.css"];
  while (queue.length) {
    const name = queue.shift()!;
    const rel = `src/styles/${name}`;
    if (loaded.has(rel)) continue;
    loaded.add(rel);
    let text: string;
    try {
      text = readFileSync(join(root, rel), "utf-8");
    } catch {
      continue;
    }
    for (const m of text.replace(COMMENT, "").matchAll(CSS_IMPORT)) queue.push(m[1]);
  }
  return loaded;
}

/** 한 자리를 `Verdict.hit` 이 받는 `Hit` 모양으로 옮긴다. */
function toHit(s: FallbackSite, axis: Axis): Hit {
  return {
    axis,
    kind: "token",
    // 이 축은 선언 자리를 안 보고 원문을 훑으므로 CSS 속성 이름이 없다. 읽은 토큰을 놓는다.
    prop: s.name,
    value: `var(${s.name}, ${s.fallback})`,
    token: s.name,
    sameValueOtherAxis: null,
    file: s.file,
    line: s.line,
    // 같은 이유로 자리 종류도 모른다. 전부 선언 자리로 둔다.
    src: "css-decl",
    excluded: s.klass === OFF_SWITCH || s.klass === OFF_LOCAL ? s.klass : null,
  };
}

export const fallback: AxisModule = {
  id: "fallback",
  what: "var(--x, fallback) 108자리 — 값 일치와 발동 여부",
  run(ctx: ScanContext): AxisResult {
    const defs = readDefs(ctx.root);
    // 값 토큰 = 정확히 한 번, `:root` 안에서 정의된 이름. 나머지 정의된 이름은 스위치다.
    const valueTokens = new Map<string, Def>();
    const switches = new Set<string>();
    for (const [name, list] of defs) {
      if (list.length === 1 && list[0].inRoot) valueTokens.set(name, list[0]);
      else switches.add(name);
    }

    const loaded = alwaysLoadedStyles(ctx.root);
    const chainBroken = loaded.size === 0;

    // `collectFiles` 가 뺀 정본 자신을 도로 넣는다 — 감사 집합과 같아야 대조가 성립한다.
    const files = [...new Set([...ctx.files, "src/styles/tokens.css"])].sort();

    const sites: FallbackSite[] = [];
    for (const rel of files) {
      let text: string;
      try {
        text = readFileSync(join(ctx.root, rel), "utf-8");
      } catch {
        continue;
      }
      for (const m of text.matchAll(VARFB)) {
        const name = m[1];
        const fb = m[2].trim();
        if (!fb) continue;
        const line = countNl(text.slice(0, m.index)) + 1;
        const def = valueTokens.get(name);
        if (def) {
          const same = norm(def.value) === norm(fb);
          // 정의가 실린 파일이 항상 적재되면 fallback 은 뜰 자리가 없다 — 죽은 값이다.
          const live = chainBroken || !loaded.has(def.at.split(":")[0]);
          sites.push({ file: rel, line, name, fallback: fb, tokenValue: def.value,
                       tokenAt: def.at, klass: same ? "일치" : "불일치", live });
        } else {
          sites.push({ file: rel, line, name, fallback: fb, tokenValue: null, tokenAt: null,
                       klass: switches.has(name) ? OFF_SWITCH : OFF_LOCAL, live: null });
        }
      }
    }
    sites.sort((a, b) => (a.file === b.file ? a.line - b.line : a.file < b.file ? -1 : 1));

    // 이 축은 `s4-classify.json` 에 안 들어간다(자체 참조는 `s4-fallback.json`).
    // 감사가 이 자리에 1차/롤업을 따로 두지 않았으므로 두 층이 같다.
    const verdicts: Verdict[] = sites.map((s) => {
      const axis = ctx.dict.byName.get(s.name)?.axis ?? "other";
      const hit = toHit(s, axis);
      if (s.klass === OFF_SWITCH) {
        return { hit, verdict: "판정 불가", auditLabel: "판정 불가",
                 reason: `${OFF_SWITCH} — 선택자마다 다시 정의되는 스위치라 fallback 이 값이 아니라 기본 상태다.` };
      }
      if (s.klass === OFF_LOCAL) {
        return { hit, verdict: "판정 불가", auditLabel: "판정 불가",
                 reason: `${OFF_LOCAL} — src/styles/*.css 의 :root 에 없는 이름이라 대조할 정본 값이 없다.` };
      }
      const where = `${s.name} = ${s.tokenValue} (${s.tokenAt})`;
      if (s.klass === "일치") {
        return { hit, verdict: "준수", auditLabel: "준수", reason: `fallback 이 토큰 값과 같다 — ${where}.` };
      }
      const gap = `fallback ${s.fallback} ≠ ${where}`;
      return s.live
        ? { hit, verdict: "위반", auditLabel: "위반",
            reason: `${gap}. 정의가 항상 적재되는 스타일시트에 없어 그 파일을 안 들여온 지면에서 이 fallback 이 실제로 뜬다 — 살아있는 드리프트다.` }
        : { hit, verdict: "드리프트", auditLabel: "드리프트",
            reason: `${gap}. 정의가 ${def0(s)} 에 있어 전 페이지에 항상 적재된다 — 이 fallback 은 안 뜬다(죽은 값).` };
    });

    const n = (k: FallbackSite["klass"]) => sites.filter((s) => s.klass === k).length;
    const mismatch = sites.filter((s) => s.klass === "불일치");
    const live = mismatch.filter((s) => s.live);
    const notes = [
      `fallback 축: ${sites.length}자리 — 일치 ${n("일치")} · 불일치 ${mismatch.length} · ` +
        `대조 제외 ${n(OFF_SWITCH) + n(OFF_LOCAL)}(스위치 ${n(OFF_SWITCH)} · 지역 변수 ${n(OFF_LOCAL)})`,
      `fallback 축: 불일치 ${mismatch.length} = 살아있음 ${live.length}(실제로 뜬다) · ` +
        `죽음 ${mismatch.length - live.length}(정의가 전역이라 안 뜬다)`,
    ];
    for (const s of live) {
      notes.push(`fallback 축: 살아있는 자리 — ${s.file}:${s.line} ${s.name} ` +
                 `fallback ${s.fallback} ≠ ${s.tokenValue} (${s.tokenAt})`);
    }
    if (chainBroken) {
      notes.push("fallback 축: BaseLayout → global.css 적재 사슬을 못 찾았다 — " +
                 "발동 여부를 보수적으로 전부 살아있음으로 봤다. 사슬이 바뀌었는지 확인해라.");
    }

    // failures 는 래칫(S7)이 붙기 전까지 비워 둔다.
    return { id: "fallback", verdicts, failures: [], notes };
  },
};

/** 죽은 fallback 의 사유 문구에 쓸 "정의가 실린 파일". */
function def0(s: FallbackSite): string {
  return s.tokenAt ? s.tokenAt.split(":")[0] : "전역 스타일시트";
}
