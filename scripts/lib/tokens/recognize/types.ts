/**
 * 인식기 계약 — 추출층이 못 보던 자리를 갈래별로 하나씩 연다 (KAN-073 S1).
 *
 * 왜 모듈로 가르나.
 *   세 갈래는 **기법이 서로 다르다** — JSX 객체의 숫자 리터럴 · 표현식 안의 문자열
 *   리터럴 · 인라인 `style="…"` 속성의 CSS. 한 파일에 섞으면 읽는 사람이 매번 셋을
 *   갈라내야 하고, 무엇보다 **세 세션이 같은 파일을 3-way 로 고치게 된다.**
 *   `CLAUDE.md` 의 게이트 규약("축이 여럿이면 진입점 하나 + 축 모듈, 규약은 전부 진입점이
 *   진다")을 인식층에 그대로 적용한 것이다.
 *
 * 인식기는 규약을 안 진다.
 *   셰뱅·머리주석·`process.exit`·예외 표·`var()` 제거는 전부 진입점과 `classify()` 가 진다.
 *   인식기는 **"어디에 무슨 값이 적혀 있다"만** 돌려준다.
 *
 * 반드시 `classify()` 를 지나간다.
 *   예외 표(`Hit.excluded`)와 `var(...)` 제거가 거기 붙어 있다. 인식기가 `hits.push` 를
 *   직접 하면 `AUTO-GENERATED` viz 파일의 리터럴 26건이 그대로 새고,
 *   `` `var(--stroke, 1.5px) solid ${BORDER}` `` 같은 **이미 준수인 자리가 위반으로** 잡힌다.
 *
 * 갈래를 가르는 선은 문법이 아니라 **리터럴의 종류**다.
 *   `styleNum`  — 스타일 값 자리의 **숫자** 리터럴(표현식 안에 있어도 이쪽이다)
 *   `exprValue` — 스타일 값 자리의 **문자열·템플릿** 리터럴
 *   `attrCss`   — 인라인 `style="…"` 속성 **안의 CSS 선언**
 *   이렇게 가르면 빈틈도 겹침도 없다. 문법(삼항이냐 아니냐)으로 가르면
 *   `fontSize: ok ? 13 : 15` 가 어느 쪽도 아니게 된다.
 */
import type { Axis, Hit, VerdictName } from "../types.ts";

/** 진입점이 인식기에 넘기는 것. 파일 하나 분량이다. */
export interface RecognizeInput {
  /** 레포 상대 경로. 확장자로 갈래를 가르는 인식기가 있다. */
  file: string;
  /** 파일 전문. */
  text: string;
  /**
   * **옛 CSS 훑기가 이미 먹은 구간의 `[시작, 끝)` 오프셋.**
   *
   * `extract.ts` 는 `.tsx` 의 모든 백틱 구간을 CSS 영역으로 잡아 `DECL` 을 돌린다
   * (실측 240히트 · 2파일). 옛 경로와 새 경로가 **같은 바이트를 두 번 보는 유일한 자리**이고,
   * 겹쳐 세면 새 기준선이 조용히 부푼다. 「옛 히트 불변」 검증은 옛 히트만 봐서 못 잡는다.
   */
  legacyCssSpans: ReadonlyArray<readonly [number, number]>;
  /** 오프셋 → 1부터 세는 줄 번호. */
  lineAt(offset: number): number;
}

/** 인식기가 찾아낸 자리 하나. `classify()` 에 그대로 넘어간다. */
export interface Recognition {
  axis: Axis;
  /** 원문 표기 그대로(대소문자 안 고침) — 판정 쪽이 소문자화한다. */
  prop: string;
  /**
   * `classify()` 가 볼 값 문자열. 숫자는 **이미 px 로 승격돼 있다**(`propAxis.pxify`).
   * 표현식이면 값 자리 전체를 그대로 넘긴다 — `var()` 제거와 리터럴 추출은 `classify()` 몫이다.
   */
  value: string;
  /**
   * 소스에 실제로 적힌 표기. `value` 와 다를 때만 채운다(승격된 숫자 등).
   * 게이트가 지목하는 값이 파일에서 grep 되게 하려는 것이다.
   */
  rawValue?: string;
  line: number;
  src: Hit["src"];
}

/**
 * 고장 하나 — **인식기가 자기 자가검사를 함께 소유한다.**
 *
 * `selftest.ts` 의 `CASES` 배열을 세 세션이 동시에 고치면 충돌한다. 인식기가 자기 `faults`
 * 를 내면 겹침이 0 이 되고, 무엇보다 인식기와 그 검사가 한 자리에 산다.
 */
export interface FaultCase {
  /** `scripts/fixtures/tokens/faults/cases/` 안의 파일명. 확장자가 곧 스캔 경로를 정한다. */
  file: string;
  verdict: VerdictName;
  /** `reason` 에 들어 있어야 하는 조각. */
  want: string;
  /** 사람이 읽는 이름. */
  what: string;
  /**
   * 이 고장이 걸려야 하는 인식 경로.
   *
   * **자가검사의 유일성 키가 `(verdict, want, src)` 셋인 이유가 이 필드다.** 새 히트는
   * CSS 자리와 **똑같은 코드로** 판정되므로 `.tsx` 의 `padding: 10` 은 기존
   * `spacing-out.astro` 와 사유가 같은 `"§9"` 가 된다. 사유를 억지로 다르게 쓰면
   * "같은 코드로 판정한다"가 깨지고 `baseline.ts` 가 예약한 네 접두와도 부딪힌다.
   * **인식 경로가 다르면 다른 검사**라는 것이 이 확장의 논지 자체다.
   */
  src: Hit["src"];
}

/** 인식기 하나의 계약. */
export interface Recognizer {
  id: string;
  /** 무엇을 보는지 한 줄 — 진입점이 보고에 쓴다. */
  what: string;
  /** 이 인식기가 낸 자리들. 아무것도 못 찾으면 빈 배열이다. */
  scan(input: RecognizeInput): Recognition[];
  /** 이 인식기가 살아 있는지 보는 고장들. 비어 있으면 자가검사가 이 갈래를 안 본다. */
  faults: FaultCase[];
}
