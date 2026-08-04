/**
 * 두들 마크 — 이모지 자리에 놓는 손그림 기호. 시안 "데코 키트"의
 * `DOODLE MARK · 자주 쓰는 기호` 절을 그대로 들여온 것이다.
 *
 * **왜 이모지가 아니라 이것인가.** 이모지는 (1) 기기·OS마다 다른 그림이 나오고,
 * (2) 애플/구글의 컬러 폰트라 이 블로그의 종이·크레용 팔레트와 결이 안 맞으며,
 * (3) 본문 이모지는 AI 문체의 신호(`AI_KOREAN_PATTERNS.md` P3)로 잡힌다.
 * 그런데 `❌`·`✅` 처럼 **뜻을 지고 있는** 기호는 지우면 문장이 손해를 본다 —
 * "흔한 오해" 목록의 `❌` 는 장식이 아니라 그 항목의 판정이다. 그래서 장식
 * 이모지는 지우고, 뜻이 있는 기호는 여기 마크로 **갈아 끼운다**.
 *
 * 이 표가 단일 소스다 — 부품(`DoodleMark.astro`)·카탈로그(`/design/deco`)·
 * 발행 가드(`scripts/check-post-markers.ts`)가 전부 여기를 읽는다.
 *
 * ## 두 가지 필기구
 *
 * `kind: "glyph"`  글씨로 쓴 것(O·X·!·?·ㅇㅇ…). **필터를 걸지 않는다.**
 *   시안은 이 열아홉에 `om-ink-fine` 을 걸었지만 여기선 뺐다 — 이 레포는 이미
 *   `Doodle.astro` 의 풍선 글씨에서 같은 판단을 했다("Gaegu 는 이미 손글씨라
 *   노이즈를 더하면 읽기가 나빠지기만 한다"). 게다가 CSS `filter` 의 좌표계는
 *   **CSS px** 이라 흔들림(`scale 1.9`)이 절대값으로 남는다: 시안의 44px 칩에서
 *   4.3% 였던 것이 본문 크기(약 19px)에서 10% 가 되어, Gaegu 굵은 획이 끊긴다.
 *
 * `kind: "svg"`  펜·크레용으로 그린 것. 필터는 **viewBox 단위**에서 걸리므로
 *   렌더 크기와 무관하게 시안과 같은 결이 나온다(위 문제가 없다). 그래서 시안이
 *   HTML+clip-path 로 그린 `sparkle` 도 여기선 SVG path 로 옮겼다 — 그대로 두면
 *   본문 크기에서 크레용 결만 3배 거칠어진다.
 *
 * ## 색
 *
 * 시안 hex 를 그대로 쓴다(`--deco-pen-*`, `src/styles/deco.css`). 크레용 색과
 * 같은 이유다 — 코어 팔레트로 한 단 어둡게 환산하면 펜 자국이 아니라 **UI 아이콘**
 * 으로 읽힌다. 토큰이 없는 지면(폭신 대담은 `deco.css` 를 안 들여온다)에서도
 * 그려져야 하므로 `var(--deco-pen-x, #hex)` 로 fallback 을 함께 적는다.
 *
 * 색은 프레젠테이션 **속성**이 아니라 `style` 로 넣는다 — `fill="var(--x)"` 는
 * 브라우저가 치환하지 않아 검게 그려진다.
 */

/** 글씨로 쓴 마크 — HTML 로 그린다(필터 없음). */
export interface GlyphMark {
  kind: "glyph";
  /** 카탈로그·`aria-label` 기본값 */
  label: string;
  /** HTML 엔티티 허용(`&minus;` 등) — `set:html` 로 심는다 */
  char: string;
  /** 시안 글자 크기(px). 40 을 1 로 본 비율로 환산해 쓴다 */
  fs: number;
  /** 4방향 text-shadow 두께(px, `fs` 기준) — Gaegu 를 한 단 더 굵게 눌러 쓴 효과 */
  weight: number;
  color: string;
  /** 기울기(deg). 마크마다 다른 각도가 "한 번에 쓴 것"으로 읽히게 한다 */
  tilt: number;
}

/** 펜·크레용으로 그린 마크 — SVG 로 그린다. */
export interface SvgMark {
  kind: "svg";
  label: string;
  /** 시안 자연 크기(px). 40 을 1 로 본 비율로 환산해 쓴다 */
  w: number;
  h: number;
  tilt: number;
  /** 이 마크가 실제로 쓰는 필터만 심는다(없는 id 를 가리킨 SVG 는 아예 안 그려진다) */
  filters: ("crayon" | "crayon-dense" | "ink" | "ink-fine")[];
  /** `{ID}` 는 인스턴스 uid 로 치환된다 */
  body: string;
}

export type DoodleMarkDef = GlyphMark | SvgMark;

export const DOODLE_MARKS = {
  /* ── 기호 — 손으로 쓴 글자 하나. 필기구가 글씨라 SVG 가 아니라 HTML 이다(아래 머리글). */
  "ok": { kind: "glyph", label: "동의", char: "O", fs: 44, weight: 0.7, color: "var(--deco-pen-blue, #2540e8)", tilt: -7 },
  "no": { kind: "glyph", label: "아님", char: "X", fs: 44, weight: 0.7, color: "var(--deco-pen-red, #e8564e)", tilt: 6 },
  "bang": { kind: "glyph", label: "강조", char: "!", fs: 44, weight: 0.7, color: "var(--deco-pen-navy, #24314f)", tilt: -4 },
  "bang-bang": { kind: "glyph", label: "완전", char: "!!", fs: 44, weight: 0.7, color: "var(--deco-pen-red, #e8564e)", tilt: 5 },
  "huh": { kind: "glyph", label: "의문", char: "?", fs: 44, weight: 0.7, color: "var(--deco-pen-blue, #2540e8)", tilt: -8 },
  "huh-bang": { kind: "glyph", label: "당황", char: "?!", fs: 44, weight: 0.7, color: "var(--deco-pen-rose, #c2607c)", tilt: 7 },
  "plus": { kind: "glyph", label: "추가", char: "+", fs: 44, weight: 0.7, color: "var(--deco-pen-mint, #4fae94)", tilt: -3 },
  "minus": { kind: "glyph", label: "제외", char: "&minus;", fs: 44, weight: 0.7, color: "var(--deco-pen-red, #e8564e)", tilt: 4 },
  "equals": { kind: "glyph", label: "같음", char: "=", fs: 44, weight: 0.7, color: "var(--deco-pen-navy, #24314f)", tilt: -6 },
  "percent": { kind: "glyph", label: "비율", char: "%", fs: 44, weight: 0.7, color: "var(--deco-pen-amber, #d99b18)", tilt: 8 },
  "hash": { kind: "glyph", label: "태그", char: "#", fs: 44, weight: 0.7, color: "var(--deco-pen-violet, #7b78d0)", tilt: -5 },
  "at": { kind: "glyph", label: "멘션", char: "@", fs: 40, weight: 0.7, color: "var(--deco-pen-blue, #2540e8)", tilt: 5 },
  "amp": { kind: "glyph", label: "그리고", char: "&amp;", fs: 44, weight: 0.7, color: "var(--deco-pen-rose, #c2607c)", tilt: -7 },
  "tilde": { kind: "glyph", label: "물결", char: "~", fs: 44, weight: 0.7, color: "var(--deco-pen-mint, #4fae94)", tilt: 3 },
  "ellipsis": { kind: "glyph", label: "말줄임", char: "&hellip;", fs: 44, weight: 0.7, color: "var(--deco-pen-navy, #24314f)", tilt: -2 },
  "yesyes": { kind: "glyph", label: "좋아", char: "ㅇㅇ", fs: 34, weight: 0.9, color: "var(--deco-pen-blue, #2540e8)", tilt: -5 },
  "gogo": { kind: "glyph", label: "시작", char: "ㄱㄱ", fs: 34, weight: 0.9, color: "var(--deco-pen-amber, #d99b18)", tilt: 6 },
  "cry": { kind: "glyph", label: "슬픔", char: "ㅠㅠ", fs: 34, weight: 0.9, color: "var(--deco-pen-violet, #7b78d0)", tilt: -6 },
  "haha": { kind: "glyph", label: "웃음", char: "ㅎㅎ", fs: 34, weight: 0.9, color: "var(--deco-pen-rose, #c2607c)", tilt: 4 },

  /* ── 표시 — 체크·별·하트·음표. */
  "check": { kind: "svg", label: "체크", w: 40, h: 40, tilt: -4, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><path d="M5 21c4 2 8 7 11 12 3-11 10-21 19-27" stroke-width="4" stroke-linecap="round" style="stroke:var(--deco-pen-mint, #4fae94)" /></g>` },
  "check-double": { kind: "svg", label: "두번 체크", w: 40, h: 40, tilt: 3, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><g stroke-width="3.4" stroke-linecap="round" style="stroke:var(--deco-pen-blue, #2540e8)"><path d="M3 20c3 2 6 6 8 10 3-9 8-17 15-22" /><path d="M15 21c3 2 6 6 8 10 3-9 8-17 15-22" /></g></g>` },
  "checkbox": { kind: "svg", label: "체크박스", w: 40, h: 40, tilt: -2, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><rect x="5" y="7" width="27" height="27" rx="4" stroke-width="3" stroke-linejoin="round" style="stroke:var(--deco-pen-navy, #24314f)" /><path d="M11 21c2 2 4 4 6 7 2-7 6-12 11-16" stroke-width="3.4" stroke-linecap="round" style="stroke:var(--deco-pen-red, #e8564e)" /></g>` },
  "star": { kind: "svg", label: "별", w: 40, h: 40, tilt: 6, filters: ["crayon", "ink"], body: `<g filter="url(#{ID}-crayon)"><path d="M20 3l5.5 12 13 1.5-9.5 9 2.5 13L20 32 8.5 38.5 11 25.5 1.5 16.5l13-1.5z" style="fill:var(--deco-pen-gold, #f0c24a)" /></g><g filter="url(#{ID}-ink)"><path d="M20 3l5.5 12 13 1.5-9.5 9 2.5 13L20 32 8.5 38.5 11 25.5 1.5 16.5l13-1.5z" fill="none" stroke-width="2.6" stroke-linejoin="round" style="stroke:var(--deco-pen-ink, #2b2a28)" /></g>` },
  "star-outline": { kind: "svg", label: "빈 별", w: 40, h: 40, tilt: -6, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><path d="M20 4l5.5 12 13 1.5-9.5 9 2.5 13L20 33 8.5 39.5 11 26.5 1.5 17.5l13-1.5z" stroke-width="2.8" stroke-linejoin="round" style="stroke:var(--deco-pen-navy, #24314f)" /></g>` },
  "sparkle": { kind: "svg", label: "반짝", w: 34, h: 34, tilt: 0, filters: ["crayon-dense"], body: `<path d="M17.00 0.00 19.38 14.62 34.00 17.00 19.38 19.38 17.00 34.00 14.62 19.38 0.00 17.00 14.62 14.62Z" filter="url(#{ID}-crayon-dense)" style="fill:var(--deco-pen-blue, #2540e8)" />` },
  "heart": { kind: "svg", label: "하트", w: 40, h: 36, tilt: -8, filters: ["crayon", "ink"], body: `<g filter="url(#{ID}-crayon)"><path d="M20 34C9 26 2 19 2 12 2 6 6 2 11 2c4 0 7 2 9 5 2-3 5-5 9-5 5 0 9 4 9 10 0 7-7 14-18 22z" style="fill:var(--deco-pen-red, #e8564e)" /></g><g filter="url(#{ID}-ink)"><path d="M20 34C9 26 2 19 2 12 2 6 6 2 11 2c4 0 7 2 9 5 2-3 5-5 9-5 5 0 9 4 9 10 0 7-7 14-18 22z" fill="none" stroke-width="2.6" stroke-linejoin="round" style="stroke:var(--deco-pen-ink, #2b2a28)" /></g>` },
  "heart-outline": { kind: "svg", label: "빈 하트", w: 40, h: 36, tilt: 7, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><path d="M20 34C9 26 2 19 2 12 2 6 6 2 11 2c4 0 7 2 9 5 2-3 5-5 9-5 5 0 9 4 9 10 0 7-7 14-18 22z" stroke-width="3" stroke-linejoin="round" style="stroke:var(--deco-pen-rose, #c2607c)" /></g>` },
  "note": { kind: "svg", label: "음표", w: 40, h: 40, tilt: -5, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><g stroke-width="3.2" stroke-linecap="round" style="stroke:var(--deco-pen-violet, #7b78d0)"><path d="M15 31V8l19-4v6L15 14" /><ellipse cx="10" cy="31" rx="5.5" ry="4.5" stroke-width="2.6" style="fill:var(--deco-pen-violet, #7b78d0)" /></g></g>` },

  /* ── 화살표 — 방향·추세·되풀이. */
  "arrow-right": { kind: "svg", label: "다음", w: 40, h: 40, tilt: 2, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><g stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--deco-pen-blue, #2540e8)"><path d="M4 20h30" /><path d="M25 11l10 9-10 9" /></g></g>` },
  "arrow-left": { kind: "svg", label: "이전", w: 40, h: 40, tilt: -3, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><g stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--deco-pen-navy, #24314f)"><path d="M36 20H6" /><path d="M15 11L5 20l10 9" /></g></g>` },
  "arrow-up": { kind: "svg", label: "위로", w: 40, h: 40, tilt: 4, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><g stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--deco-pen-mint, #4fae94)"><path d="M20 36V6" /><path d="M11 15l9-10 9 10" /></g></g>` },
  "arrow-down": { kind: "svg", label: "아래로", w: 40, h: 40, tilt: -4, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><g stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--deco-pen-rose, #c2607c)"><path d="M20 4v30" /><path d="M11 25l9 10 9-10" /></g></g>` },
  "trend-up": { kind: "svg", label: "상승", w: 40, h: 40, tilt: 2, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><g stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--deco-pen-mint, #4fae94)"><path d="M6 34L33 7" /><path d="M20 6h14v14" /></g></g>` },
  "trend-down": { kind: "svg", label: "하락", w: 40, h: 40, tilt: -2, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><g stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--deco-pen-red, #e8564e)"><path d="M6 6l27 27" /><path d="M34 20v14H20" /></g></g>` },
  "arrow-curve": { kind: "svg", label: "곡선 화살", w: 40, h: 40, tilt: 5, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><g stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--deco-pen-amber, #d99b18)"><path d="M5 34C7 16 20 7 35 11" /><path d="M27 4l9 7-7 9" /></g></g>` },
  "redo": { kind: "svg", label: "다시", w: 40, h: 40, tilt: -5, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><g stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--deco-pen-violet, #7b78d0)"><path d="M34 20A14 14 0 1 1 24 7" /><path d="M17 3l8 5-6 7" /></g></g>` },
  "arrow-both": { kind: "svg", label: "양방향", w: 40, h: 40, tilt: 3, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><g stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--deco-pen-blue, #2540e8)"><path d="M4 20h32" /><path d="M12 12L4 20l8 8" /><path d="M28 12l8 8-8 8" /></g></g>` },

  /* ── 도형 — 둘러 치거나 자리를 표시할 때. */
  "triangle": { kind: "svg", label: "세모", w: 40, h: 40, tilt: -3, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><path d="M20 5l16 29H4z" stroke-width="3.2" stroke-linejoin="round" style="stroke:var(--deco-pen-amber, #d99b18)" /></g>` },
  "square": { kind: "svg", label: "네모", w: 40, h: 40, tilt: 4, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><rect x="5" y="5" width="30" height="30" rx="3" stroke-width="3.2" stroke-linejoin="round" style="stroke:var(--deco-pen-navy, #24314f)" /></g>` },
  "diamond": { kind: "svg", label: "다이아", w: 40, h: 40, tilt: -6, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><path d="M20 3l17 17-17 17L3 20z" stroke-width="3.2" stroke-linejoin="round" style="stroke:var(--deco-pen-mint, #4fae94)" /></g>` },
  "circle": { kind: "svg", label: "동그라미", w: 40, h: 40, tilt: 2, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><circle cx="20" cy="20" r="16" stroke-width="3.2" style="stroke:var(--deco-pen-rose, #c2607c)" /></g>` },

  /* ── 그림 — 표정·날씨·깃발. */
  "smile": { kind: "svg", label: "웃음 얼굴", w: 40, h: 40, tilt: -4, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><g stroke-width="3" stroke-linecap="round" style="stroke:var(--deco-pen-navy, #24314f)"><circle cx="20" cy="20" r="16" /><path d="M14 16v2" /><path d="M26 16v2" /><path d="M13 25c4 5 10 5 14 0" fill="none" /></g></g>` },
  "frown": { kind: "svg", label: "시무룩", w: 40, h: 40, tilt: 5, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><g stroke-width="3" stroke-linecap="round" style="stroke:var(--deco-pen-violet, #7b78d0)"><circle cx="20" cy="20" r="16" /><path d="M14 16v2" /><path d="M26 16v2" /><path d="M13 28c4-5 10-5 14 0" fill="none" /></g></g>` },
  "sun": { kind: "svg", label: "해", w: 40, h: 40, tilt: -2, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><g stroke-width="3" stroke-linecap="round" style="stroke:var(--deco-pen-amber, #d99b18)"><circle cx="20" cy="20" r="9" /><path d="M20 2v5" /><path d="M20 33v5" /><path d="M2 20h5" /><path d="M33 20h5" /><path d="M7 7l4 4" /><path d="M29 29l4 4" /><path d="M33 7l-4 4" /><path d="M11 29l-4 4" /></g></g>` },
  "cloud": { kind: "svg", label: "구름", w: 40, h: 34, tilt: 3, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><path d="M10 30h20a7.5 7.5 0 0 0 .5-15A11 11 0 0 0 10 12a6.5 6.5 0 0 0 0 18z" stroke-width="3" stroke-linejoin="round" style="stroke:var(--deco-pen-blue, #2540e8)" /></g>` },
  "umbrella": { kind: "svg", label: "우산", w: 40, h: 40, tilt: -5, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><g stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--deco-pen-rose, #c2607c)"><path d="M4 19a16 16 0 0 1 32 0z" /><path d="M20 19v13a5 5 0 0 0 9 3" /></g></g>` },
  "flag": { kind: "svg", label: "깃발", w: 40, h: 40, tilt: 4, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><g stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--deco-pen-red, #e8564e)"><path d="M10 37V4" /><path d="M10 6c7-4 14 4 21 0v13c-7 4-14-4-21 0z" /></g></g>` },

  /* ── 강조 — 지우고 두르고 밑줄 긋는 것들. */
  "cross": { kind: "svg", label: "취소", w: 40, h: 40, tilt: -3, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><g stroke-width="4" stroke-linecap="round" style="stroke:var(--deco-pen-red, #e8564e)"><path d="M7 7l26 26" /><path d="M33 7L7 33" /><path d="M9 5l24 24" opacity=".35" /></g></g>` },
  "circle-loop": { kind: "svg", label: "강조 원", w: 46, h: 34, tilt: -3, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><g stroke-width="2.6" stroke-linecap="round" fill="none" style="stroke:var(--deco-pen-blue, #2540e8)"><path d="M23 3C34 3 43 7 43 15s-10 16-21 16S2 25 2 16 12 3 23 3" /><path d="M20 5C31 4 41 9 41 17c0 7-9 12-19 13" /></g></g>` },
  "wavy": { kind: "svg", label: "물결 밑줄", w: 48, h: 18, tilt: 0, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><path d="M2 11C7 4 12 15 17 9s10 8 15 2 9 6 14 0" stroke-width="3.2" stroke-linecap="round" style="stroke:var(--deco-pen-pink, #f4a9b4)" /></g>` },
  "warn": { kind: "svg", label: "느낌표 원", w: 40, h: 40, tilt: 6, filters: ["ink-fine"], body: `<g filter="url(#{ID}-ink-fine)"><g stroke-width="3.2" stroke-linecap="round" style="stroke:var(--deco-pen-red, #e8564e)"><circle cx="20" cy="20" r="16" /><path d="M20 10v13" /><path d="M20 29v1.5" /></g></g>` },
} as const satisfies Record<string, DoodleMarkDef>;

export type DoodleMarkName = keyof typeof DOODLE_MARKS;

export const MARK_NAMES = Object.keys(DOODLE_MARKS) as DoodleMarkName[];

export function isMarkName(v: string): v is DoodleMarkName {
  return Object.hasOwn(DOODLE_MARKS, v);
}

/**
 * 이모지 → 마크. 본문에서 실제로 쓰였거나 쓰일 법한 것만 적는다.
 *
 * **여기 없는 이모지는 갈아 끼우지 말고 지운다.** 대응이 없다는 건 그 이모지가
 * 뜻이 아니라 장식이라는 뜻이다(🚀 로 시작한다고 글이 빨라지지 않는다).
 * 예외는 `💡`·`🎯` 처럼 "여기가 핵심"을 뜻하는 것들인데, 이건 마크가 아니라
 * **문장으로** 쓰는 게 맞다 — 키트에 전구도 과녁도 없는 건 그래서다.
 *
 * 코드블록·터미널 출력 안의 기호(`★`·`✔`·`✘` 로 그린 ASCII 도식)는 **건드리지
 * 않는다.** 그건 본문 장식이 아니라 인용한 화면이다.
 */
export const EMOJI_TO_MARK: Record<string, DoodleMarkName> = {
  "❌": "no",
  "✖": "no",
  "✗": "no",
  "✘": "cross",
  "❎": "no",
  "✅": "check",
  "✔": "check",
  "☑": "checkbox",
  "⭕": "ok",
  "⚠": "warn",
  "❗": "bang",
  "‼": "bang-bang",
  "❓": "huh",
  "⭐": "star",
  "🌟": "star",
  "★": "star",
  "☆": "star-outline",
  "✨": "sparkle",
  "❤": "heart",
  "♥": "heart",
  "➡": "arrow-right",
  "👉": "arrow-right",
  "⬅": "arrow-left",
  "⬆": "arrow-up",
  "⬇": "arrow-down",
  "📈": "trend-up",
  "📉": "trend-down",
  "🔄": "redo",
  "🚩": "flag",
  "🏳": "flag",
};
