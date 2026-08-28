/**
 * bbangtoTonyStyleGuide — 빵관 토니 블로그 전용 모션/디자인 파운데이션.
 *
 * KAN-012(모션 도입)의 **단일 진실원**. 소비자는 하나다 — 정적 셸 토큰을 굽는
 * scripts/gen-motion-css.ts:23,40 이 이 파운데이션에서 src/styles/motion.css 를 만든다.
 * blogVizStyleGuide.ts(시각화용 단일 진실원)의 자매 파일이며, 같은 패턴(base → 블로그
 * 값으로 leaf 덮어쓰기)을 따른다.
 *
 * **StyleGuide export 는 KAN-071 이 걷었다 — 다시 만들지 마라.** 한때 여기 있던
 * `bbangtoTonyStyleGuide`(foundationToStyleGuide 로 만든 StyleGuide)는 예고된
 * 아일랜드용 StyleGuideProvider(Phase C)가 끝내 안 들어와 **소비처가 0건**이었고, 그
 * 안 쓰이는 선언이 tokens.css 값의 두 번째 사본을 든 탓에 값 셋이 어긋나 있었다.
 * 근거와 A/B/C 판단은 design-concept/UI_CONSISTENCY_AUDIT.md:474 (P4).
 * 주입할 자리가 생기면 그때 이 파운데이션에서 다시 만든다 — 선언을 미리 세워 두면
 * 안 쓰이는 채로 사본만 하나 더 는다.
 *
 * 카탈로그(@centurio1987/bbangto-ui-style-guide-catalog)에서 무엇을·왜 picking했나:
 *  - `makeSemantic` : 핵심 색 몇 개만 주면 SemanticColors 전체(상태·카테고리 기본값
 *    포함)를 채워 주는 구성 유틸. 블로그 tokens.css의 코발트+크림 팔레트를 주입한다.
 *  - `makeFoundations` : 비색상 boilerplate(spacing·zIndex·기본 motion 등)를 채우고
 *    semantic·폰트·radius·shadow만 우리 값으로 조립한다.
 *  - `mergeFoundation`(tokens) : 조립된 파운데이션의 motion 파라미터만 블로그의
 *    "subtle 예산"(짧은 duration + 부드러운 ease)으로 조인다. 결정 #3의 "구성 유틸
 *    사용" 요구를 충족하되 사용 범위를 최소화한다 — 외형(색/폰트)은 우리가 정하고,
 *    카탈로그 프리셋(editorial-magazine-01 등)이 외형을 덮어쓰지 않는다.
 *  - editorial-magazine-01(`family: typographic-editorial`, `characteristics:
 *    sharp·thin·shadow:minimal·motion:subtle`)의 **특성만** 참고한다(코드로 import하지
 *    않음): 모션은 subtle, 그림자는 옅게, 잉크-온-페이퍼 편집 지면. 우리 팔레트는
 *    코발트+크림이라 세리프/색은 가져오지 않는다.
 *
 * "읽는 표면은 차분하게, 가장자리는 유쾌하게" (DESIGN_CONCEPT.md 원칙 #5) —
 * 모션 예산: 개별 ≤240ms, ease = 블로그 --ease.
 */
import { makeSemantic, makeFoundations } from "@centurio1987/bbangto-ui-style-guide-catalog";
import {
  mergeFoundation,
  type BbangtoFoundation,
} from "@centurio1987/bbangto-ui-tokens";

/* --- 블로그 토큰 (src/styles/tokens.css v0.3 — 코발트+크림 에디토리얼) --- */
const PAPER = "#F3EEE4"; // --paper
const SURFACE = "#F8F3E8"; // --surface (elevated)
const CREAM = "#EDE6D8"; // --cream (sunken)
const SUBTLE = "#e8e2d6"; // --subtle (border-muted)
const BORDER = "#d8d0be"; // --border
const INK = "#20264A"; // --ink
const INK_2 = "#4a4f6a"; // --ink-2
const INK_3 = "#6f7390"; // --ink-3
const ACCENT = "#2B3FD4"; // --accent (코발트)
const ACCENT_TINT2 = "#dfe3ff"; // --accent-tint2 (primary subtle)
const POP = "#d8a33f"; // --pop (강조·전환점)

// 코발트의 hover/active 파생색(블로그가 별도 정의하지 않아 여기서 살짝 어둡게).
const ACCENT_HOVER = "#2434b5";
const ACCENT_ACTIVE = "#1d2a92";

// 카테고리 8종 (tokens.css --cat-*). foundation의 category 키는 skills 대신 tech를 쓴다.
const CATEGORY = {
  planning: "#3e6b4f", // --cat-planning
  architecture: "#4e6ca8", // --cat-architecture
  strategy: "#a84b4b", // --cat-strategy
  tech: "#3e6b6b", // --cat-skills
  design: "#7a5c7e", // --cat-design
  research: "#b07a2e", // --cat-research
  quality: "#6b6b3e", // --cat-quality
  leadership: "#b5602e", // --cat-leadership
} as const;

/* --- semantic: 핵심 색만 주고 나머지는 makeSemantic 기본값 --- */
const semantic = makeSemantic({
  bg: PAPER,
  bgElevated: SURFACE,
  bgSunken: CREAM,
  overlay: "rgba(32, 38, 74, 0.5)", // 잉크 스크림
  fg: INK,
  fgMuted: INK_2,
  fgSubtle: INK_3,
  fgInverse: SURFACE, // 잉크 배경 위 밝은 글자
  border: BORDER,
  borderMuted: SUBTLE,
  borderStrong: INK, // 잉크 외곽선 모티프
  focus: ACCENT,
  primaryBase: ACCENT,
  primaryHover: ACCENT_HOVER,
  primaryActive: ACCENT_ACTIVE,
  primarySubtle: ACCENT_TINT2,
  primaryFg: "#ffffff",
  accent: POP,
  category: CATEGORY,
});

/* --- foundation 조립: 폰트·radius·shadow는 블로그 값, 나머지는 boilerplate --- */
const baseFoundation: BbangtoFoundation = makeFoundations({
  name: "bbangto-tony",
  description: "빵관 토니 블로그 — 코발트+크림 에디토리얼, 한국어 폰트, subtle 모션",
  semantic,
  fontSans: "'Gowun Dodum', system-ui, sans-serif", // --font-body
  fontMono: "'Space Mono', 'JetBrains Mono', monospace", // --font-mono
  radius: {
    none: "0px",
    sm: "8px", // --radius-sm
    md: "12px", // --radius-md
    lg: "16px", // --radius-lg
    xl: "16px",
    full: "9999px", // --btn-radius
  },
  shadow: {
    // 에디토리얼 — 옅은 잉크 그림자만. lg는 블로그 카드/본문 이미지 리프트 값.
    none: "none",
    sm: "0 1px 2px rgba(32, 38, 74, 0.06)",
    md: "0 3px 10px rgba(32, 38, 74, 0.08)",
    lg: "0 6px 18px rgba(32, 38, 74, 0.10)",
    xl: "0 10px 28px rgba(32, 38, 74, 0.12)",
  },
});

/**
 * 최종 파운데이션 — 모션만 블로그 "subtle 예산"으로 조인다.
 * duration.slow = 240ms(리빌 애니 길이, 원칙 #5의 ≤0.25s 취지 보전),
 * easing.out/default = 블로그 --ease. 나머지 motion 토큰(distance·preset·in/inOut,
 * instant)은 base 값을 유지한다.
 */
export const bbangtoTonyFoundation: BbangtoFoundation = mergeFoundation(
  baseFoundation,
  {
    motion: {
      duration: {
        instant: "0ms",
        fast: "120ms",
        normal: "180ms", // --dur
        slow: "240ms",
      },
      easing: {
        default: "cubic-bezier(0.2, 0.7, 0.2, 1)", // --ease
        out: "cubic-bezier(0.2, 0.7, 0.2, 1)", // --ease
      },
    },
  },
);
