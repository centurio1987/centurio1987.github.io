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

export interface VizFigureProps {
  /** 그림 아래 캡션(선택). */
  caption?: ReactNode;
  /** 그룹 레이블(스크린리더). 미지정 시 caption 사용. */
  label?: string;
  /** 스타일 가이드 오버라이드(기본: 블로그 가이드). */
  styleGuide?: VisualizationStyleGuide;
  /** 다중 preset 스타일 가이드일 때 활성 preset key. */
  foundationKey?: string;
  className?: string;
  children: ReactNode;
}

export default function VizFigure({
  caption,
  label,
  styleGuide = blogVizStyleGuide,
  foundationKey,
  className,
  children,
}: VizFigureProps) {
  return (
    <figure
      className={className ? `viz-figure ${className}` : "viz-figure"}
      role="group"
      aria-label={label ?? (typeof caption === "string" ? caption : undefined)}
    >
      <VisualizationStyleGuideProvider styleGuide={styleGuide} foundationKey={foundationKey}>
        {children}
      </VisualizationStyleGuideProvider>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
