/**
 * 글자 역할표 — **어느 역할이 어떤 얼굴을 어떤 굵기로 쓰는가**의 단일 소스 (KAN-080 S8).
 *
 * 왜 파일이 필요한가: 이 표는 `DESIGN_CONCEPT.md` §5 의 마크다운 표에만 있었고, 그래서
 * **기계가 읽을 수 없었다.** 읽을 수 없으면 검사할 수 없고, 검사가 없으니 「Gowun Dodum 700」
 * 처럼 **존재하지 않는 웨이트를 규정한 서술**이 문서에 1년 넘게 서 있었다(그 굵기는 화면에서
 * 전부 브라우저 합성이었다). `bun run type:verify` 가 이 파일을 입력으로 받는다.
 *
 * **값을 다른 곳에 복사하지 마라.** `DESIGN_CONCEPT.md` §5 는 이 파일을 가리키기만 한다 —
 * 두 곳이 값을 들면 갈리고, 갈린 것을 아무도 모르는 것이 이 카드가 고치는 결함 자체다.
 * 같은 이유로 `src/lib/categories.ts`·`src/lib/authors.ts`·`src/lib/doodleMarks.ts` 가
 * 각자 자기 축의 단일 소스다.
 *
 * **`latin`·`hangul` 두 칸인 이유** (§5): 스택 하나에 얼굴이 둘이다. `--font-mono` 는
 * `'Space Mono', 'Gowun Dodum', monospace` 인데 Space Mono 의 `unicode-range` 에 한글이 **0** 이라
 * 그 자리 한글은 Gowun Dodum 이 그린다. 칸이 하나이던 시절에는 그 배정을 적을 자리가 문서에
 * 없었고, 실제로 지면 11곳에서 `--font-mono` 텍스트 141조각 중 **57조각이 한글**이었다.
 *
 * **`weights` 는 「이 역할에 허용된 굵기」다.** 라틴 얼굴과 한글 얼굴 **둘 다** 그 굵기를
 * 실재하는 면으로 가져야 한다 — 한쪽만 있으면 그쪽 글자만 진짜 굵기로 그려지고 나머지는
 * 폴백이나(합성이 꺼져 있으므로) 요청보다 가는 면으로 떨어진다.
 * 스택 중간의 폴백(예: `--font-code` 의 Space Mono)은 여기 안 적는다 — 그 자리 라틴은 앞의
 * JetBrains Mono 가 이미 그리고, 한글은 뒤의 Gowun Dodum 이 그린다.
 */

export type TypeRole = {
  /** `tokens.css` 의 커스텀 프로퍼티 이름. 스택의 첫 실제 패밀리가 `latin` 이어야 한다. */
  token: string;
  /** 라틴·숫자를 실제로 그리는 패밀리. */
  latin: string;
  /** 한글을 실제로 그리는 패밀리. 라틴 얼굴에 한글이 없으면 스택 뒤의 것이 온다. */
  hangul: string;
  /** 이 역할에 허용된 굵기. 두 얼굴 모두 실재하는 면을 가져야 한다. */
  weights: number[];
  /** 어디에 쓰는가 — 사람이 읽는 칸. 판정에 안 쓴다. */
  use: string;
};

/**
 * 역할 다섯. 순서는 `DESIGN_CONCEPT.md` §5 표와 같다.
 *
 * 굵기 배정의 근거(§5 「굵기 — 3단」):
 * - Regular 400 = 본문 기본값 · Medium 500 = 링크 강조·배지·필터·한글 라벨 ·
 *   Bold 700 = h2·h3·`strong`·시뮬 강조. 600·800 은 700 으로 접었다.
 * - **`--font-display`(Jua)에 700 을 안 준다.** Jua 는 배포본에 400 한 종뿐이고 원래 굵은
 *   장식 서체다. 700 을 허용하면 이 표가 다시 「없는 웨이트를 규정하는 문서」가 된다.
 * - **`--font-mono` 에 500 을 안 준다.** Space Mono 는 구글에 400·700 뿐이라, 500 을 허용하면
 *   그 자리 라틴이 요청보다 가늘게 떨어진다(합성이 꺼져 있다). 한글 라벨의 500 이 필요하면
 *   그 자리는 `--font-body` 를 쓴다.
 * - **`--font-code` 에 700 을 안 준다.** JetBrains Mono 를 400·500 만 받고 있고, 코드 블록에서
 *   굵기로 뜻을 나누는 자리가 없다.
 */
export const TYPE_ROLES: TypeRole[] = [
  {
    token: "--font-display",
    latin: "Jua",
    hangul: "Jua",
    weights: [400],
    use: "홈 h1, 섹션 제목, 로고, 포스트 h1",
  },
  {
    token: "--font-body",
    latin: "Gowun Dodum",
    hangul: "Gowun Dodum",
    weights: [400, 500, 700],
    use: "본문, 포스트 h2/h3/h4",
  },
  {
    token: "--font-mono",
    latin: "Space Mono",
    hangul: "Gowun Dodum",
    weights: [400, 700],
    use: "날짜·카테고리 레이블, nav, 버튼, 메타",
  },
  {
    token: "--font-hand",
    latin: "Gaegu",
    hangul: "Gaegu",
    weights: [400, 700],
    use: "손글씨 포인트 텍스트 (홈 hero 인트로)",
  },
  {
    token: "--font-code",
    latin: "JetBrains Mono",
    hangul: "Gowun Dodum",
    weights: [400, 500],
    use: "코드 블록 전용",
  },
];

/**
 * 자체 호스팅하는 패밀리. `src/styles/fonts.css` 의 `@font-face` 와
 * `public/fonts/<slug>-<weight>.woff2` 가 이 이름을 따른다.
 *
 * **왜 굽는가**: 배포본에 400 한 종뿐이고 업스트림에도 다른 굵기가 없다. OFL 에 Reserved
 * Font Name 선언이 없어 개작이 열려 있으므로 `bun run fonts:build` 가 아웃라인을 확장한다.
 */
export const SELF_HOSTED = { family: "Gowun Dodum", slug: "gowun-dodum" } as const;

/** 폴백 generic 계열. 여기 닿았다는 것은 「설계가 고른 얼굴이 아니다」와 같은 말이다. */
export const GENERIC_FAMILIES = new Set([
  "sans-serif",
  "serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-monospace",
  "ui-sans-serif",
  "ui-serif",
  "ui-rounded",
  "-apple-system",
  "BlinkMacSystemFont",
]);

/** 역할표가 요구하는 (패밀리 → 굵기 집합). 두 얼굴을 합쳐 뽑는다. */
export function requiredFaces(roles: TypeRole[] = TYPE_ROLES): Map<string, Set<number>> {
  const out = new Map<string, Set<number>>();
  for (const r of roles) {
    for (const family of [r.latin, r.hangul]) {
      const set = out.get(family) ?? new Set<number>();
      for (const w of r.weights) set.add(w);
      out.set(family, set);
    }
  }
  return out;
}
