/**
 * blogVizStyleGuide — 빵관 토니 블로그 전용 시각화 스타일 가이드.
 *
 * @centurio1987/bbangto-ui-visualization 의 headless 컴포넌트에 주입하는
 * VisualizationStyleGuide. baseVisualizationFoundation 을 펼친 뒤,
 * DESIGN_CONCEPT.md v0.3 토큰(src/styles/tokens.css)과
 * DIAGRAM_STYLE_GUIDE.md 의 역할 팔레트로 leaf 값만 덮어쓴다.
 *
 * "엄밀한 구조를 밝고 손맛 있는 표면으로" — 밝은 흙빛 배경 + 잉크(navy) 외곽선 +
 * 역할색만 사용(장식색 금지).
 */
import {
  baseVisualizationFoundation,
  type VisualizationFoundation,
  type VisualizationStyleGuide,
} from "@centurio1987/bbangto-ui-visualization";

/* --- 블로그 토큰 (tokens.css v0.3 + DIAGRAM_STYLE_GUIDE 역할색) --- */
const INK = "#20264A"; // --ink (navy)
const INK_2 = "#4a4f6a"; // --ink-2
const PAPER = "#F3EEE4"; // --paper
const SURFACE = "#F8F3E8"; // --surface (노드 채움)
const CREAM = "#EDE6D8"; // --cream (도형 기본 채움)
const BORDER = "#d8d0be"; // --border (옅은 그리드)

// 역할 팔레트 (DIAGRAM_STYLE_GUIDE §2 + 카테고리 컬러)
const ROLE_FLOW = "#4E6CA8"; // 핵심 흐름 / 아키텍처
const ROLE_EMPHASIS = "#D8A33F"; // 강조·전환점
const ROLE_DANGER = "#A84B4B"; // 위험·충돌·반례 / 전략
const ROLE_DOMAIN = "#3E6B4F"; // 도메인·업무 / 기획
const ROLE_TECH = "#3E6B6B"; // 기술·구현
const ROLE_DESIGN = "#7A5C7E"; // 설계 결정
const ROLE_QUALITY = "#6B6B3E"; // 품질·검증
const ROLE_RESEARCH = "#B07A2E"; // 리서치

// base 의 node 시맨틱(person/external/container/…)을 잉크 외곽선·밝은 채움으로 재도색
const node = Object.fromEntries(
  Object.entries(baseVisualizationFoundation.node).map(([kind, spec]) => [
    kind,
    { ...spec, fill: SURFACE, keyline: INK, keylineWidth: 1.6, tagColor: INK },
  ]),
) as VisualizationFoundation["node"];

const foundations: VisualizationFoundation = {
  ...baseVisualizationFoundation,
  name: "ppangkwan-tony",
  canvas: { bg: PAPER, grid: BORDER, gridUnit: 8 },
  shape: { fill: CREAM, stroke: INK, strokeWidth: 1.6 },
  palette: {
    p1: ROLE_FLOW,
    p2: ROLE_EMPHASIS,
    p3: ROLE_DANGER,
    p4: ROLE_DOMAIN,
    p5: ROLE_TECH,
    p6: ROLE_DESIGN,
    p7: ROLE_QUALITY,
    p8: ROLE_RESEARCH,
  },
  node,
  edge: {
    ...baseVisualizationFoundation.edge,
    stroke: INK,
    width: 1.6,
    marker: {
      ...baseVisualizationFoundation.edge.marker,
      arrow: INK,
      diamond: INK,
      circle: INK,
      cross: INK,
    },
  },
  boundary: {
    ...baseVisualizationFoundation.boundary,
    stroke: INK,
    labelColor: INK_2,
  },
  typography: {
    ...baseVisualizationFoundation.typography,
    titleFont: "'Gowun Dodum', sans-serif", // --font-body
    monoFont: "'Space Mono', monospace", // --font-mono
    titleWeight: 700,
  },
};

export const blogVizStyleGuide: VisualizationStyleGuide = {
  name: "ppangkwan-tony",
  description: "빵관 토니 블로그 — 밝은 흙빛 배경 + 잉크 외곽선 + 역할색 다이어그램",
  foundations,
};
