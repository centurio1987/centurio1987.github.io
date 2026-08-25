/**
 * 문서 스케일 판정 + spacing 축 재분류 — 대조 상대는 `s4-docrules.json` (KAN-070 S5).
 *
 * ── 이 축이 다른 둘과 다른 점
 * `color`·`fallback` 은 `tokens.css` 를 대조 상대로 쓴다. 여기는 대조 상대가 **문서**다.
 * 간격·글자 크기에는 토큰이 없지만 `DESIGN_CONCEPT.md` 에는 규칙이 적혀 있다 —
 * 토큰이 없다는 것과 규칙이 없다는 것은 다르고, 규칙이 있으면 지켰는지 물을 수 있다.
 *
 *   §9 간격   "기준 4px. 사용 단위: 4·8·12·16·24·32·48·64·96px"
 *   §5 스케일  H2 26px · H3 20px · Body 18px · Meta/Label 12–13px
 *
 * 그림자·z-index 는 규칙이 없다("과한 그림자 금지"는 취향 서술이지 판정 가능한 값이
 * 아니다). 그래서 이 둘은 세기만 하고 판정하지 않는다.
 *
 * ── 왜 축을 셋으로 가르는가 (이 모듈의 핵심)
 * 감사의 `spacing` 축 정의(`s3-scan.py:34-38`)는 CSS 속성 26개를 한 통에 넣었다.
 * 그런데 §9 의 "기준 4px" 는 **여백 규칙**이다. 요소가 얼마나 큰지(치수)나 어디에
 * 놓이는지(절대 좌표)를 4의 배수로 맞추라고 적은 문장이 정본 어디에도 없다.
 * 한 통으로 재면 규칙이 없는 자리까지 "위반"으로 세게 되고, 그 수를 그대로 래칫에
 * 박으면 게이트가 **문서에 없는 규칙을 강제**한다. 그래서 셋으로 가른다:
 *
 *   spacing    padding* · margin* · gap · row-gap · column-gap             → §9 가 다스린다
 *   dimension  width · height · min/max-width · min/max-height · flex-basis → 안 다스린다
 *   position   top · right · bottom · left · inset                        → 안 다스린다
 *
 * 뒤 둘은 「규칙도 토큰도 없음」 칸으로 내린다. 감사가 쓴 라벨로는 `토큰 미존재` 인데
 * 그 문자열이 `types.ts` 의 `Verdict` union 에 없어서(보고함) `판정 불가` 로 담고,
 * 감사 라벨은 이 파일의 `DocruleRow.auditLabel` 에 원문 그대로 남긴다.
 *
 * ── `position` 이 특히 위험한 이유
 * 좌표 상위 파일이 전부 데코 실측값이다 — `src/pages/design/deco.astro` ·
 * `src/components/deco/patterns/PhotoFrame.astro` · `src/styles/viz-frame.css`.
 * `deco-kit` 스킬이 "좌표와 크기는 눈대중이 아니라 실측값이라 근거 없이 바꾸면 조용히
 * 깨진다"고 못박은 자리다. `top: 14px` 을 스케일에 맞춘다고 16px 로 밀면 테이프가
 * 모서리에서 떨어지고, **빌드도 타입도 초록이라 아무도 모른다.** 여기에 4px 스냅이
 * 도는 것 자체가 사고다. 그래서 관할 밖으로 내리는 것은 수를 줄이려는 완화가 아니라
 * **잘못 겨눈 총구를 치우는 것**이다.
 *
 * ── 재현 검증
 * 옛 축 정의(`legacySpacingAxis: true`)로 돌리면 감사와 같은 수가 나와야 한다 —
 * 간격 위반 821 · 글자 위반 166. 이식이 맞다는 증거가 그것 하나뿐이라 옵션을
 * 지웠다가 다시 만들지 말 것. `docrule.run` 은 두 정의를 다 돌려 둘 다 보고한다.
 *
 * 모듈은 규약을 안 진다 — 셰뱅·`process.exit`·"고치는 법" 은 진입점이 진다.
 */
import type { Axis, AxisModule, AxisResult, Hit, ScanContext, TokenDict, Verdict } from "./types.ts";
import { verdictExceptionFor } from "./exceptions.ts";

// ── 이 모듈이 보는 축. 나머지(color·radius, 그리고 S4 가 color 에서 갈라낸 stroke)는 color.ts 가 본다.
const OWNED: ReadonlySet<Axis> = new Set<Axis>(["spacing", "font", "shadow", "zindex"]);

/** `spacing` 축 안의 세 갈래. §9 관할은 `spacing` 하나뿐이다. */
export type SpacingGroup = "spacing" | "dimension" | "position";

// 속성 → 갈래. 원본 축 정의(`s3-scan.py:34-38`)의 26개를 빠짐없이 셋으로 나눈 것이다.
const SPACING_GROUP = new Map<string, SpacingGroup>();
const grp = (g: SpacingGroup, ...props: string[]) => props.forEach((p) => SPACING_GROUP.set(p, g));
grp("spacing", "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
  "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "gap", "row-gap", "column-gap");
grp("dimension", "width", "height", "min-width", "min-height", "max-width", "max-height", "flex-basis");
grp("position", "top", "right", "bottom", "left", "inset");

// ── 문서 규칙.
/** `DESIGN_CONCEPT.md` §9 — 기준 4px, 4·8·12·16·24·32·48·64·96px. 0 은 여백 없음이라 규칙 안이다. */
const SPACING_SCALE: ReadonlySet<number> = new Set([0, 4, 8, 12, 16, 24, 32, 48, 64, 96]);
/**
 * `DESIGN_CONCEPT.md` §5 의 역할값.
 *
 * **감사 원본은 px 로 적힌 다섯만 썼고, 그것이 결함이었다.** §5 는 Display 를
 * `clamp(36px, 5vw, 60px)`, H1 을 `clamp(28px, 5vw, 38px)` 로 정한다 — 그러니
 * `36`·`60`·`28`·`38` 도 **문서가 정한 값**이다. 그 넷을 리터럴로 쓴 자리 14건
 * (`28px` 6 · `38px` 5 · `36px` 2 · `60px` 1)이 원본에서는 "역할값 밖"으로 세어졌다.
 * 문서를 지킨 자리를 위반으로 부른 것이라 고친다(유저 승인 2026-08-25).
 *
 * 옛 집합은 **재현용으로 남긴다** — `legacyFontRoles: true` 로 돌리면 감사 원본과
 * 같은 글자 위반 166 이 나온다. 지우면 이식이 맞는지 확인할 길이 사라진다.
 */
const FONT_ROLES: ReadonlySet<number> = new Set([60, 38, 36, 28, 26, 20, 18, 13, 12]);
/** 감사 원본 `s4-docrules.py:23` 의 집합. 재현 검증에서만 쓴다. */
const FONT_ROLES_LEGACY: ReadonlySet<number> = new Set([26, 20, 18, 13, 12]);
/** Meta/Label 12–13px 이 문서상 최소치다. */
const FONT_MIN = 12;

const PX = /^(-?\d*\.?\d+)px$/;
/** px 값의 크기. 음수 여백도 스케일로 재므로 절댓값을 쓴다(`-14px` → 14). */
function px(v: string): number | null {
  const m = PX.exec(v.trim());
  return m ? Math.abs(Number(m[1])) : null;
}

// ── 감사(`s4-classify.py`)가 매긴 라벨. `토큰 미존재` 는 `types.ts` union 에 없어 여기서만 쓴다.
type AuditLabel = "준수" | "드리프트" | "위반" | "정당한 예외" | "토큰 미존재";

/**
 * 토큰이 사는 축 — **`extract.ts` 의 것과 다르다.**
 * 공통 추출은 `s3-scan.py` 를 옮긴 것이라 `--stroke`·`--page-pad` 류를 `spacing` 으로
 * 묶는데, S4 는 그것을 `stroke`·`layout` 으로 갈랐다(`s4-classify.py:44-55`).
 * 드리프트 판정에 쓰인 것은 S4 쪽이라 여기서 다시 만든다 — 이 차이를 무시하면
 * `--content-max: 720px` 때문에 `max-width: 720px` 이 드리프트로 잡혀 감사와 어긋난다.
 */
function auditTokenAxis(name: string): string {
  if (name.startsWith("--cat-")) return "color";
  if (["--paper", "--surface", "--cream", "--canvas", "--subtle", "--border",
    "--ink", "--ink-2", "--ink-3", "--accent", "--accent-tint", "--accent-tint2",
    "--pop", "--pop-tint", "--pop-ink", "--grid-line", "--hatch-border", "--hatch"].includes(name)) return "color";
  if (name.includes("radius")) return "radius";
  if (name.startsWith("--font-")) return "font";
  if (name === "--stroke") return "stroke";
  if (["--measure", "--content-max", "--wide-max", "--page-pad", "--header-h"].includes(name)) return "layout";
  if (["--ease", "--dur"].includes(name)) return "motion";
  return "other";
}

/**
 * 같은 축 토큰과 값이 같은가 — 있으면 드리프트다.
 *
 * 이 넷에서는 실제로 한 건도 안 잡힌다(감사도 0 이다). `auditTokenAxis` 에 spacing ·
 * shadow · zindex 바구니가 아예 없고, `--font-*` 는 값이 서체 이름이라 px 리터럴과
 * 같아질 수 없기 때문이다. 그래도 하드코딩하지 않고 실제로 훑는다 — `tokens.css` 에
 * 글자 크기 토큰이 생기는 날 이 검사가 **조용히** 빠지면 안 된다.
 * (색은 대소문자·축약형·rgba 전개까지 봐야 하지만 여기는 값이 전부 길이·숫자라
 *  소문자 문자열 비교 하나로 D1·D2 가 같이 덮인다.)
 */
function driftToken(dict: TokenDict, hit: Hit): string | null {
  const names = dict.byValue.get(hit.value.trim().toLowerCase()) ?? [];
  const same = names.filter((nm) => auditTokenAxis(nm) === hit.axis);
  if (!same.length) return null;
  return `${same[0]} (tokens.css = ${dict.byName.get(same[0])!.value})`;
}

// 정당한 예외는 `exceptions.ts` 한 곳에서만 정의된다(S10). 여기서 다시 적지 않는다.

/** 이 (축, 속성)에 대조할 토큰 체계가 `tokens.css` 에 있는가. `s4-classify.py:110-118`. */
const FAMILY_PROPS: ReadonlySet<string> = new Set(["font-family", "fontfamily", "font"]);
function comparable(axis: Axis, prop: string): boolean {
  // `--font-*` 는 서체 이름만 있다. size·weight·line-height 토큰은 없고 spacing·shadow·zindex 는 축째로 없다.
  return axis === "font" && FAMILY_PROPS.has(prop.toLowerCase());
}

/** 감사가 이 히트에 매겼을 라벨을 그대로 다시 낸다(`s4-classify.py` 의 판정 순서까지 같다). */
function auditLabelOf(dict: TokenDict, hit: Hit): { label: AuditLabel; reason: string } {
  if (hit.kind === "token") return { label: "준수", reason: "var(--토큰) 을 썼다" };
  const drift = driftToken(dict, hit);
  if (drift) return { label: "드리프트", reason: `D1 같은 표기 — ${drift}` };
  const exc = verdictExceptionFor(hit.file);
  if (exc) return { label: "정당한 예외", reason: `${exc.why} (근거 ${exc.evidence.join(" · ")})` };
  if (comparable(hit.axis, hit.prop)) {
    return { label: "위반", reason: `${hit.axis} 축에 토큰 체계가 있는데 토큰 밖 값이고 근거 문서를 못 걸었다` };
  }
  return { label: "토큰 미존재", reason: `${hit.axis}/${hit.prop} 에 대조할 토큰이 tokens.css 에 없다` };
}

// ── 문서 규칙 판정 라벨. 문자열은 `s4-docrules.json` 의 카운터 키 그대로다(대조에 쓴다).
export const DOC_LABELS = {
  spacingOff: "문서 스케일 밖 — 위반",
  spacingIn: "문서 스케일 안",
  spacingNa: "px 아님 — 판정 대상 아님",
  fontOffLow: "문서 최소치(12px) 미만 — 위반",
  fontOffHigh: "역할값 밖(12px 이상)",
  fontIn: "문서 역할값과 같음",
  fontNa: "px 아님(clamp·vw 등) — 판정 대상 아님",
} as const;

/** 판정 하나 — `Verdict` 에 안 담기는 것(감사 라벨·재분류 갈래)까지 들고 있다. */
export interface DocruleRow {
  hit: Hit;
  /** `spacing` 축일 때만 채워진다. */
  spacingGroup: SpacingGroup | null;
  /** 감사가 쓴 라벨 원문. `토큰 미존재` 는 `Verdict` union 에 없어서 여기에만 있다. */
  auditLabel: AuditLabel;
  /** 문서 규칙 판정 라벨. 관할 밖이면 `null`. */
  docLabel: string | null;
  verdict: Verdict["verdict"];
  reason: string;
}

export interface DocruleOptions {
  /**
   * 감사 원본의 `spacing` 축 정의(치수·좌표까지 한 통)로 판정한다. **이식 검증 전용.**
   * 켜면 `s4-docrules.json` 과 같은 수(간격 821 · 글자 166)가 나와야 한다.
   */
  legacySpacingAxis?: boolean;
  /** 글자 역할값을 감사 원본의 다섯으로 되돌린다(재현 검증용). */
  legacyFontRoles?: boolean;
}

export interface DocruleReport {
  rows: DocruleRow[];
  /** `s4-docrules.json` 의 `spacing` 카운터와 같은 모양. */
  spacing: Record<string, number>;
  /** `s4-docrules.json` 의 `font_size` 카운터와 같은 모양. */
  fontSize: Record<string, number>;
  /** §9 관할 밖으로 내린 것 — 갈래별 건수. */
  ungoverned: Record<string, number>;
  /** `"spacing / 토큰 미존재"` 꼴. `s4-classify.json` 의 `by_axis_verdict` 와 대조한다. */
  auditByAxis: Record<string, number>;
}

const bump = (m: Record<string, number>, k: string) => { m[k] = (m[k] ?? 0) + 1; };

/** 문서 축 판정 전건. 진입점이 아니라 **검증 스크립트도 부른다** — 그래서 옵션을 받는다. */
export function evaluateDocrule(ctx: ScanContext, opts: DocruleOptions = {}): DocruleReport {
  const rows: DocruleRow[] = [];
  const spacing: Record<string, number> = {};
  const fontSize: Record<string, number> = {};
  const ungoverned: Record<string, number> = {};
  const auditByAxis: Record<string, number> = {};

  for (const hit of ctx.hits) {
    if (!OWNED.has(hit.axis)) continue;

    const prop = hit.prop.trim().toLowerCase();
    // 표에 없는 spacing 속성은 여백으로 본다 — 축 정의가 닫혀 있어 지금은 안 생기지만,
    // 새 속성이 `extract.ts` 에 늘 때 조용히 관할 밖으로 새는 쪽이 더 나쁘다.
    const group = hit.axis === "spacing" ? (SPACING_GROUP.get(prop) ?? "spacing") : null;
    const { label, reason } = auditLabelOf(ctx.dict, hit);
    bump(auditByAxis, `${hit.axis} / ${label}`);

    // 문서 규칙은 「토큰이 없는 자리」에만 얹는다. 이미 토큰을 썼거나(준수) 근거 문서를
    // 건 자리(정당한 예외)를 스케일로 다시 재면 한 히트에 판정이 두 번 내려진다.
    if (label !== "토큰 미존재") {
      rows.push({ hit, spacingGroup: group, auditLabel: label, docLabel: null, verdict: label, reason });
      continue;
    }

    // ── 간격 — §9 가 다스리는 갈래만. 옛 정의를 켜면 셋 다 다스린 것으로 친다.
    if (hit.axis === "spacing" && (opts.legacySpacingAxis || group === "spacing")) {
      const v = px(hit.value);
      const [docLabel, verdict, why]: [string, Verdict["verdict"], string] =
        v === null
          ? [DOC_LABELS.spacingNa, "판정 불가", "px 가 아니라 문서 스케일로 잴 수 없다(%·rem·ch 등)"]
          : SPACING_SCALE.has(v)
            ? [DOC_LABELS.spacingIn, "준수", "DESIGN_CONCEPT.md §9 의 4px 스케일 안"]
            : [DOC_LABELS.spacingOff, "위반",
               `DESIGN_CONCEPT.md §9 의 4·8·12·16·24·32·48·64·96px 밖 (${hit.value})`];
      bump(spacing, docLabel);
      rows.push({ hit, spacingGroup: group, auditLabel: label, docLabel, verdict, reason: why });
      continue;
    }

    // ── 치수 · 위치 — §9 관할 밖. 규칙도 토큰도 없으니 판정하지 않는다.
    if (hit.axis === "spacing") {
      bump(ungoverned, group!);
      rows.push({
        hit, spacingGroup: group, auditLabel: label, docLabel: null, verdict: "판정 불가",
        reason: group === "position"
          ? `요소 좌표(${prop})다. §9 는 여백 규칙이고 좌표 규칙은 정본에 없다 — 데코 실측값이 여기 산다`
          : `요소 치수(${prop})다. §9 는 여백 규칙이고 치수 규칙은 정본에 없다`,
      });
      continue;
    }

    // ── 글자 크기 — §5 스케일. font 축이라도 size 가 아니면(weight·line-height·letter-spacing) 규칙이 없다.
    if (hit.axis === "font" && (prop === "font-size" || prop === "fontsize")) {
      const v = px(hit.value);
      const [docLabel, verdict, why]: [string, Verdict["verdict"], string] =
        v === null
          ? [DOC_LABELS.fontNa, "판정 불가", "px 가 아니라 역할값과 못 잰다(clamp·vw·rem·em 등)"]
          : (opts.legacyFontRoles ? FONT_ROLES_LEGACY : FONT_ROLES).has(v)
            ? [DOC_LABELS.fontIn, "준수",
               opts.legacyFontRoles
                 ? "DESIGN_CONCEPT.md §5 의 역할값(감사 원본 집합 26·20·18·13·12px)"
                 : "DESIGN_CONCEPT.md §5 의 역할값(clamp 끝값 60·38·36·28 포함)"]
            : v < FONT_MIN
              ? [DOC_LABELS.fontOffLow, "위반", `문서 최소치 12px 미만 (${hit.value})`]
              : [DOC_LABELS.fontOffHigh, "위반", `DESIGN_CONCEPT.md §5 역할값 밖 (${hit.value})`];
      bump(fontSize, docLabel);
      rows.push({ hit, spacingGroup: null, auditLabel: label, docLabel, verdict, reason: why });
      continue;
    }

    // ── 나머지 — 그림자 · z-index · font 의 size 아닌 속성. 문서에 판정 가능한 규칙이 없다.
    bump(ungoverned, hit.axis === "font" ? `font/${prop}` : hit.axis);
    rows.push({
      hit, spacingGroup: null, auditLabel: label, docLabel: null, verdict: "판정 불가",
      reason: `${hit.axis}/${prop} — tokens.css 에 토큰이 없고 DESIGN_CONCEPT.md 에 판정 가능한 규칙도 없다`,
    });
  }

  return { rows, spacing, fontSize, ungoverned, auditByAxis };
}

const at = (m: Record<string, number>, k: string) => m[k] ?? 0;

export const docrule: AxisModule = {
  id: "docrule",
  what: "간격 · 글자 크기 — DESIGN_CONCEPT.md 스케일 대비 + 축 재분류(여백/치수/위치)",
  run(ctx: ScanContext): AxisResult {
    const now = evaluateDocrule(ctx, {});
    // 옛 정의도 같이 낸다 — 재분류가 무엇을 옮겼는지 수로 보여야 사람이 판단할 수 있다.
    const old = evaluateDocrule(ctx, { legacySpacingAxis: true, legacyFontRoles: true });

    const sViol = at(now.spacing, DOC_LABELS.spacingOff);
    const fViol = at(now.fontSize, DOC_LABELS.fontOffLow) + at(now.fontSize, DOC_LABELS.fontOffHigh);
    const oldSViol = at(old.spacing, DOC_LABELS.spacingOff);
    const oldFViol = at(old.fontSize, DOC_LABELS.fontOffLow) + at(old.fontSize, DOC_LABELS.fontOffHigh);
    const exViol = now.rows.filter((r) => r.verdict === "위반" && r.hit.excluded !== null).length;

    const notes = [
      `문서 축 — 간격 §9(padding·margin·gap): 준수 ${at(now.spacing, DOC_LABELS.spacingIn)}` +
        ` · 위반 ${sViol} · 판정 대상 아님 ${at(now.spacing, DOC_LABELS.spacingNa)}`,
      `문서 축 — 치수 ${at(now.ungoverned, "dimension")}건(width·height·min/max·flex-basis)` +
        ` · 위치 ${at(now.ungoverned, "position")}건(top·right·bottom·left·inset): §9 관할 밖이라 판정하지 않는다` +
        ` — §9 는 여백 규칙이고, 좌표 상위 파일은 데코 실측값이다`,
      `문서 축 — 글자 크기 §5(font-size): 준수 ${at(now.fontSize, DOC_LABELS.fontIn)}` +
        ` · 위반 ${fViol} · 판정 대상 아님 ${at(now.fontSize, DOC_LABELS.fontNa)}`,
      `문서 축 — 그림자 ${at(now.ungoverned, "shadow")}건 · z-index ${at(now.ungoverned, "zindex")}건:` +
        ` 문서에 판정 가능한 규칙이 없다("과한 그림자 금지"는 값이 아니다)`,
      `문서 축 — 옛 축 정의(치수·좌표까지 한 통)로는 간격 위반 ${oldSViol} · 글자 위반 ${oldFViol}` +
        ` (감사 원본 s4-docrules.json 이 같은 정의로 낸 수는 821 · 166)`,
      `문서 축 — 위반 ${sViol + fViol}건 중 ${exViol}건은 게이트 제외 파일(생성물·복제물)에 있다`,
      `문서 축 — failures 는 비워 둔다(래칫 전. S7 이 채운다)`,
    ];

    return {
      id: "docrule",
      verdicts: now.rows.map((r) => ({ hit: r.hit, verdict: r.verdict, auditLabel: r.auditLabel, reason: r.reason })),
      failures: [],
      notes,
    };
  },
};
