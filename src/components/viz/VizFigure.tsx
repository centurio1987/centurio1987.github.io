/**
 * VizFigure — 모든 본문 다이어그램/차트/인포그래픽의 공용 래퍼.
 *
 * @centurio1987/bbangto-ui-visualization 의 headless 컴포넌트를
 * VisualizationStyleGuideProvider(블로그 스타일 가이드)로 감싸고,
 * .prose 와 정합하는 <figure>/<figcaption> 셸을 씌운다.
 *
 * 접근성: 실제 SVG a11y(role="img"/<title>/<desc>)는 패키지 컴포넌트가
 * `accessible="img"` + `title`/`desc` prop 으로 네이티브 지원하므로,
 * 다이어그램 컴포넌트 쪽에 그 props 를 넘긴다. 여기서는 figure/figcaption
 * 시맨틱만 담당한다.
 *
 * 렌더는 기본적으로 client directive 없이 SSR 정적 SVG 로 나간다. 색 바인딩은
 * src/styles/viz.css(전역 shim)가 담당한다.
 */
import type { ReactNode } from "react";
import {
  VisualizationStyleGuideProvider,
  type VisualizationStyleGuide,
} from "@centurio1987/bbangto-ui-visualization";
import { blogVizStyleGuide } from "../../lib/viz/blogVizStyleGuide";

/**
 * 그림을 감싸는 액자(KAN-063 후보). 그림 자체는 그대로 두고 **바깥 껍데기만** 바꾼다.
 *
 *   none      액자 없음(기본) — 지금 발행된 글 전부가 이 값이다
 *   polaroid  F-A 흰 판 + 아래 여백 큰 손글씨 캡션      (Polaroid.astro)
 *   taped     F-B 모눈 판 + 위 모서리 테이프 두 장      (TapedBoard + Tape.astro)
 *   board     F-C 종이 판만                            (PaperSurface.astro)
 *   corner    F-D 네 귀퉁이 삼각 홀더                   (CornerMount.astro)
 *   quiet     F-E 1px 테두리 + 얕은 그림자
 *   bare      F-F 테두리 없이 바탕색 + 패딩만
 *
 * 후보 단계이므로 기본값은 "none" 이고, 카탈로그는 /design/viz-frames 다.
 * 그림은 전부 CSS(src/styles/viz-frame.css)가 그린다 — 데코 부품은 전부 `.astro`
 * 라 React 트리 안에 못 들어가지만, Tape/CornerMount/Polaroid/PaperSurface 가
 * 죄다 순수 CSS(gradient + clip-path)라 무늬를 그대로 옮겨 적을 수 있었다.
 */
/**
 * 액자 여섯 종. 넷은 시안 사진 프레임(PF)에서 **무늬만** 물려받았고 둘은 대응 시안이
 * 없는 조용한 대안이다 — 계보와 사유는 `src/lib/photoFrames.ts` 의
 * `VIZ_FRAME_LINEAGE`. 사진 액자(`PhotoFrame.astro`)를 그대로 못 쓰는 이유도 거기
 * 있다: 그쪽은 칸 비율이 먼저 있어 담긴 것을 자르는데, 도식은 자르면 축 이름과
 * 범례가 잘려 나가 그림이 거짓말이 된다.
 */
export type VizFrame =
  | "none"
  | "polaroid"
  | "taped"
  | "scrapbook"
  | "kraft"
  | "quiet"
  | "bare";

export interface VizFigureProps {
  /** 그림 아래 캡션(선택). */
  caption?: ReactNode;
  /** 그룹 레이블(스크린리더). 미지정 시 caption 사용. */
  label?: string;
  /** 스타일 가이드 오버라이드(기본: 블로그 가이드). */
  styleGuide?: VisualizationStyleGuide;
  /** 다중 preset 스타일 가이드일 때 활성 preset key. */
  foundationKey?: string;
  /** 액자(기본 none = 액자 없음). 위 VizFrame 주석 참고. */
  frame?: VizFrame;
  className?: string;
  children: ReactNode;
}

export default function VizFigure({
  caption,
  label,
  styleGuide = blogVizStyleGuide,
  foundationKey,
  frame = "none",
  className,
  children,
}: VizFigureProps) {
  const figureClass = className ? `viz-figure ${className}` : "viz-figure";
  const ariaLabel = label ?? (typeof caption === "string" ? caption : undefined);

  const provider = (
    <VisualizationStyleGuideProvider styleGuide={styleGuide} foundationKey={foundationKey}>
      {children}
    </VisualizationStyleGuideProvider>
  );
  const figcaption = caption ? <figcaption>{caption}</figcaption> : null;

  /**
   * 액자가 없으면 **DOM 을 한 글자도 바꾸지 않는다.**
   *
   * 패딩을 0 으로 맞춰 픽셀을 재현하는 길은 막혀 있다 — viz.css 의
   * `.viz-figure > [data-bbangto-viz-style-guide] { width:100% }` 가 **직접 자식**
   * 선택자라, 래퍼를 한 겹만 끼워도 이 규칙이 조용히 죽어 Provider 가 폭 100% 를
   * 잃는다(빌드도 타입도 초록이라 눈 말고는 안 잡힌다). 그래서 발행된 글 40개는
   * 아래 early return 으로 지금 렌더를 그대로 유지하고, 액자를 쓸 때만
   * viz-frame.css 가 그 폭 규칙을 새 경로로 다시 깐다.
   */
  if (frame === "none") {
    return (
      <figure className={figureClass} role="group" aria-label={ariaLabel}>
        {provider}
        {figcaption}
      </figure>
    );
  }

  return (
    <figure
      className={figureClass}
      data-viz-frame={frame}
      role="group"
      aria-label={ariaLabel}
    >
      <div className="viz-frame">
        <div className="viz-frame-inner">{provider}</div>
        {figcaption}
      </div>
      {/* 테이프·코너처럼 판 **위에** 얹히는 것. 장식이라 여기만 aria-hidden +
          pointer-events:none 이다 — 판(.viz-frame)에 걸면 그 안의 SVG 까지 포인터가
          죽어서, 링크나 툴팁이 든 그림이 하나 들어오는 순간 조용히 먹힌다. */}
      <span className="viz-frame-deco" aria-hidden="true" />
    </figure>
  );
}
