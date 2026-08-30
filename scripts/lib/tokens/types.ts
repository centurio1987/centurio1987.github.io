/**
 * 토큰 게이트 공통 타입 — 축 모듈 셋이 공유하는 계약 (KAN-070 S2).
 *
 * 왜 타입을 따로 두나.
 *   축 셋(색·fallback·문서 규칙)을 서로 다른 세션이 병렬로 채운다. 각자 `Hit` 모양을
 *   스스로 정하면 판정 규칙이 미묘하게 갈리고, 그 어긋남은 감사 원자료와 히트 단위로
 *   대조할 때에야 드러난다. 그래서 **모양은 여기 한 곳에서만 정한다.**
 *
 * `Hit` 여섯 필드는 임의로 고른 것이 아니다 — 감사 원자료
 * `scripts/fixtures/tokens/reference/s4-classify.json` 의 `rows` 와 차집합을 낼 때
 * 쓰는 키가 그대로 여섯이다(axis · prop · value · file · line · verdict).
 * 여기서 이름을 바꾸면 대조가 성립하지 않는다.
 */

/** `src/styles/tokens.css` 한 줄에서 뽑은 토큰 하나. */
export interface TokenDef {
  /** `--ink` 처럼 `--` 로 시작하는 이름. */
  name: string;
  /** 선언된 값 그대로(트림만 함). */
  value: string;
  /** 이 토큰이 사는 축. 축이 다른 우연한 값 일치를 드리프트로 세지 않기 위해 필요하다. */
  axis: Axis;
}

/** 토큰 사전 — 진입점이 한 번 만들어 축 모듈에 넘긴다. */
export interface TokenDict {
  /** 이름 → 정의. */
  byName: Map<string, TokenDef>;
  /** 소문자 값 → 그 값을 가진 토큰 이름들. 드리프트 판정의 핵심. */
  byValue: Map<string, string[]>;
}

/**
 * 시각 값이 사는 축.
 *
 * `spacing` 은 감사가 쓴 이름 그대로다. **그 안이 셋으로 갈린다는 것이 S5 의 일이고**
 * (여백 / 치수 / 위치 — `DESIGN_CONCEPT.md` §9 는 여백 규칙이지 치수·좌표 규칙이 아니다),
 * 여기서는 원본 축 이름을 유지한다. 재분류는 `docrule` 모듈이 `spacingGroup` 으로 낸다.
 */
export type Axis =
  | "color" | "spacing" | "radius" | "shadow" | "font" | "zindex" | "motion" | "other"
  /**
   * **`stroke` 는 새 인식층만 낸다** (KAN-076). 옛 경로가 이 축을 내려면 `propAxis.AXIS` 에
   * `stroke-width` 가 있어야 하는데 거기 없고, 보태지 않는 것이 그 파일의 명시적 제약이다
   * (보태면 값을 줍는 것이 새 인식기가 아니라 기존 `DECL`/`ATTR` 이라 옛 집합이 움직인다).
   * 그래서 이 값이 붙어도 감사 원자료 3,539 히트와의 대조는 안 깨진다 —
   * `bun run tokens:invariant` 가 그것을 증명한다.
   */
  | "stroke";

/**
 * 길이 값 하나가 사는 좌표계 (KAN-076).
 *
 * `why` 가 필수인 이유는 이것이 **사람에게 보이는 판정 사유의 일부**이기 때문이다.
 * 「판정 불가」라고만 하면 게이트가 무엇을 못 봤는지 알 수 없고, 다음 사람이 그 자리를
 * 「게이트가 놓친 부채」로 다시 파헤친다. viewBox 원문을 함께 실어 그 왕복을 없앤다.
 */
export interface CoordUnit {
  /** `css-px` = 1 단위가 1 CSS px · `svg-user` = SVG 사용자 단위(배율은 호출자가 정한다). */
  unit: "css-px" | "svg-user";
  /** 왜 그렇게 봤는지 한 줄. 판정 사유에 그대로 실린다. */
  why: string;
}

/** 추출된 히트 하나. 판정 전 상태다. */
export interface Hit {
  axis: Axis;
  /** `token` = `var(--x)` 를 썼다 · `literal_dup` = 값이 토큰과 같다 · `literal_new` = 토큰 밖 값. */
  kind: "token" | "literal_dup" | "literal_new";
  /** CSS 속성 이름 또는 JSX 속성 이름. 원문 표기 그대로(대소문자 안 고침). */
  prop: string;
  /** 리터럴 값, 또는 `var(--x)`. */
  value: string;
  /**
   * 소스에 실제로 적힌 표기 — `value` 와 다를 때만 채운다.
   *
   * 새 인식층이 `fontSize: 13` 을 `13px` 로 승격해 넘기기 때문에 생긴 필드다. 승격은
   * 판정을 CSS 자리와 똑같은 코드로 하려는 것인데, 그대로 두면 게이트가 지목하는 「값」이
   * **그 파일에 문자열로 존재하지 않게** 된다 — `verify-tokens.ts` 의 "고치는 법" 이
   * grep 으로 못 찾는 값을 가리킨다. 출력에서 `13(→13px)` 로 병기하는 데 쓴다.
   */
  rawValue?: string;
  /**
   * **이 자리의 길이 1 이 무엇인가** — `svgStroke` 인식기만 채운다 (KAN-076).
   *
   * `--stroke-hair/--stroke/--stroke-bold` 3단은 **CSS px 자**인데(`DESIGN_CONCEPT.md` §8)
   * SVG 좌표계 안의 `stroke-width` 는 **사용자 단위**다. 그리고 그 배율은 **호출자가 정한다** —
   * `<Mascot size={40}/>` 면 0.238 이고 같은 `Doodle` 한 줄이 `/design/deco` 에서는 1.0,
   * `HeroCollage` 에서는 0.581 이다. **같은 소스 한 줄이 지면마다 다른 px 로 그려지므로**
   * 정적 게이트가 px 를 알아낼 방법이 없다.
   *
   * 그래서 이 값을 **판정보다 먼저** 본다. 단위가 안 맞는 자를 들이대면 81 자리가 통째로
   * 가짜 위반이 되고, 고칠 길이 없는 위반은 예외로 덮이거나 우회당한다.
   * 판정에 쓰는 입력이므로 `prop` 문자열에 숨기지 않고 필드로 싣는다(`rawValue` 와 같은 이유).
   */
  coord?: CoordUnit;
  /** `token` 이면 쓴 토큰. `literal_dup` 이면 값이 같은 토큰들. */
  token: string | string[] | null;
  /** 값은 같은데 축이 다른 토큰들 — 우연한 일치라 드리프트가 아니다. */
  sameValueOtherAxis: string[] | null;
  /** 레포 상대 경로. */
  file: string;
  /** 1부터 세는 줄 번호. */
  line: number;
  /**
   * 어느 자리에서 읽었나.
   *
   * 앞의 셋이 **옛 경로**(감사 원자료 3,539 히트와 대조되는 집합)이고, 뒤의 셋은
   * KAN-073 이 연 **새 인식층**이다. 갈라 둔 이유가 둘이다 —
   *   ① 옛 집합만 골라 「한 건도 안 움직였다」를 증명할 수 있어야 하고,
   *   ② 자가검사의 사유 유일성 키가 `(verdict, want, src)` 셋이라
   *      같은 사유라도 인식 경로가 다르면 다른 검사가 된다(`recognize/types.ts`).
   *
   * `ml-decl` 은 KAN-075 가 연 넷째 갈래다 — **줄바꿈을 넘는 CSS 선언**.
   * 옛 `DECL` 을 고치지 않고 별도 패스로 열었기 때문에 여기서도 옛 집합은 안 움직인다.
   *
   * `svg-stroke` 는 KAN-076 이 연 다섯째 갈래다 — **`stroke-width` 계열**. 여기는 앞의
   * 넷과 다른 점이 하나 있다: 갈래를 가르는 것이 자리도 리터럴 종류도 아니라 **속성 하나**다.
   * 그 속성이 `AXIS` 표에 없어서 네 형태(svg 속성 · CSS 선언 · JSX 표현식 · style 객체)가
   * 통째로 판정 밖이었고, 표에 보태는 대신 인식기를 세운 이유는 위 `Axis` 의 `stroke` 주석에 있다.
   */
  src: "css-decl" | "jsx-attr" | "style-obj"
     | "style-num" | "expr-literal" | "attr-css"
     | "ml-decl" | "svg-stroke";
  /**
   * 게이트 대상에서 빠지는 히트에는 사유가 붙는다(생성물·패키지 복제물 등).
   * **빼는 것이 아니라 표시만 한다** — 감사 원자료와 히트 단위로 대조하려면
   * 추출 결과가 감사와 같은 집합이어야 하기 때문이다. 총계는 두 벌로 보고한다.
   */
  excluded: string | null;
}

/**
 * 판정 이름 — **감사 판정기가 쓴 것 그대로다.** 바꾸면 원자료와 대조가 안 된다.
 *
 * 감사가 이름을 두 층으로 썼다는 것을 알고 있어야 한다.
 *
 *   1차(`s4-classify.json`)  준수 858 · 위반 580 · 드리프트 71 · 정당한 예외 3
 *                            **토큰 미존재 1977** · 측정 제외 50            합계 3,539
 *   롤업(`UI_CONSISTENCY_AUDIT.md` §0)  1977 이 셋으로 갈린다 —
 *                            문서 스케일 안 445 → 준수 · 문서 규칙 밖 987 → 위반
 *                            · 규칙도 토큰도 없는 축 545 → 판정 불가
 *
 * 그래서 `토큰 미존재` 는 **중간 판정**이다 — `docrule` 모듈이 문서 규칙을 얹어 셋으로
 * 가른다. 축 모듈은 1차 이름으로 내고, 사람이 보는 요약은 진입점이 롤업한다.
 * 중간 이름을 빼면 `s4-classify.json` 과 히트 단위 대조가 성립하지 않는다.
 */
export type VerdictName =
  | "준수" | "위반" | "드리프트" | "정당한 예외"
  | "토큰 미존재"   // 중간 — docrule 이 문서 규칙으로 가른다
  | "측정 제외"     // 축 누수(색 shorthand 에 섞인 그라디언트 정지점 등)
  | "판정 불가";    // 롤업 — 규칙도 토큰도 없어 물을 수가 없다

/** 축 모듈이 낸 판정 하나. */
export interface Verdict {
  hit: Hit;
  /**
   * **최종 판정** — 이 자리를 어떻게 할 것인가. 게이트가 세고 래칫이 무는 값이다.
   * `토큰 미존재` 와 `측정 제외` 는 여기 안 온다(둘 다 중간 이름이라 `판정 불가` 로 접힌다).
   */
  verdict: VerdictName;
  /**
   * **1차 판정** — 감사 판정기(`s4-classify.py`)가 매긴 이름 그대로.
   * `s4-classify.json` 과 히트 단위로 대조할 때 쓰는 것이 이 필드다.
   *
   * 둘을 가른 이유가 있다. `docrule` 은 `토큰 미존재` 1,977건에 문서 규칙을 얹어
   * 준수·위반·판정 불가로 **가르는 모듈**이라 최종 판정이 1차와 다르고, `color` 는
   * 축 누수 50건을 1차로는 `측정 제외` 로 부르지만 최종으로는 물을 수가 없다.
   * 한 필드로 뭉치면 두 모듈이 서로 다른 층의 이름을 같은 자리에 넣게 되고,
   * 그것을 합산하는 쪽(S7 베이스라인)이 **조용히 틀린 수를 낸다.**
   */
  auditLabel: VerdictName;
  /** 왜 그 판정인지 한 줄. `정당한 예외` 는 근거 문서 위치가 필수다(S10). */
  reason: string;
}

/** 진입점이 축 모듈에 넘기는 것 전부. */
export interface ScanContext {
  /** 레포 루트 절대 경로. */
  root: string;
  /** 스캔 대상 파일의 레포 상대 경로들. 제외 규칙이 이미 적용돼 `excluded` 가 붙어 있다. */
  files: string[];
  /** `tokens.css` 에서 뽑은 토큰 사전. */
  dict: TokenDict;
  /** 공통 추출이 낸 히트 전부(제외분 포함, 표시만 돼 있다). */
  hits: Hit[];
}

/** 축 모듈 하나가 돌려주는 것. */
export interface AxisResult {
  /** 축 이름 — 보고에 쓴다. */
  id: string;
  /** 이 축이 낸 판정 전부. */
  verdicts: Verdict[];
  /** 게이트를 비0 으로 끝내야 하는 사유. 비어 있으면 통과다. */
  failures: string[];
  /** 실패는 아니지만 사람이 알아야 하는 것. */
  notes: string[];
}

/**
 * 축 모듈의 계약.
 *
 * **모듈은 규약을 안 진다** — 셰뱅·머리주석·`process.exit`·"고치는 법" 한 문단은
 * 전부 진입점(`scripts/verify-tokens.ts`)이 진다. 모듈은 판정만 돌려준다.
 */
export interface AxisModule {
  id: string;
  /** 이 모듈이 무엇을 보는지 한 줄 — 진입점이 "검사 0건"을 보고할 때 쓴다. */
  what: string;
  run(ctx: ScanContext): AxisResult;
}
