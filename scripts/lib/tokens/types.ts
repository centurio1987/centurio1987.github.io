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
export type Axis = "color" | "spacing" | "radius" | "shadow" | "font" | "zindex" | "motion" | "other";

/** 추출된 히트 하나. 판정 전 상태다. */
export interface Hit {
  axis: Axis;
  /** `token` = `var(--x)` 를 썼다 · `literal_dup` = 값이 토큰과 같다 · `literal_new` = 토큰 밖 값. */
  kind: "token" | "literal_dup" | "literal_new";
  /** CSS 속성 이름 또는 JSX 속성 이름. 원문 표기 그대로(대소문자 안 고침). */
  prop: string;
  /** 리터럴 값, 또는 `var(--x)`. */
  value: string;
  /** `token` 이면 쓴 토큰. `literal_dup` 이면 값이 같은 토큰들. */
  token: string | string[] | null;
  /** 값은 같은데 축이 다른 토큰들 — 우연한 일치라 드리프트가 아니다. */
  sameValueOtherAxis: string[] | null;
  /** 레포 상대 경로. */
  file: string;
  /** 1부터 세는 줄 번호. */
  line: number;
  /** 어느 자리에서 읽었나 — CSS 선언 · JSX 속성 · 인라인 style 객체. */
  src: "css-decl" | "jsx-attr" | "style-obj";
  /**
   * 게이트 대상에서 빠지는 히트에는 사유가 붙는다(생성물·패키지 복제물 등).
   * **빼는 것이 아니라 표시만 한다** — 감사 원자료와 히트 단위로 대조하려면
   * 추출 결과가 감사와 같은 집합이어야 하기 때문이다. 총계는 두 벌로 보고한다.
   */
  excluded: string | null;
}

/** 축 모듈이 낸 판정 하나. */
export interface Verdict {
  hit: Hit;
  /** 감사가 쓴 다섯 갈래를 그대로 쓴다. 이름을 바꾸면 대조가 깨진다. */
  verdict: "준수" | "위반" | "드리프트" | "정당한 예외" | "판정 불가";
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
