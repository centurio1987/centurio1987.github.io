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
import { useId, type ReactNode } from "react";
import {
  VisualizationStyleGuideProvider,
  type VisualizationStyleGuide,
} from "@centurio1987/bbangto-ui-visualization";
import { blogVizStyleGuide } from "../../lib/viz/blogVizStyleGuide";

/**
 * 그림을 감싸는 액자(KAN-063). 그림 자체는 그대로 두고 **바깥 껍데기만** 바꾼다.
 *
 *   none       액자 없음(기본) — 지금 발행된 글 41개가 전부 이 값이다
 *   scrapbook  F-D 도트 종이 판 + 네 귀퉁이 홀더
 *   polaroid   F-A 흰 판 + 가운데 위 마테 + 손글씨 캡션
 *   taped      F-B 모눈 판 + 위 모서리 테이프 두 장
 *   kraft      F-C 네 변이 찢긴 크라프트 판
 *   crayon     F-G 크레용 칠 + 잉크 선 이중 테두리 + 별 하나
 *   quiet      F-E 1px 테두리 + 얕은 그림자
 *   bare       F-F 테두리 없이 바탕색 + 패딩만
 *
 * 다섯은 시안 사진 프레임(PF)에서 **무늬만** 물려받았고 둘은 대응 시안이 없는 조용한
 * 대안이다 — 계보와 사유는 `src/lib/photoFrames.ts` 의 `VIZ_FRAME_LINEAGE`,
 * 카탈로그는 `/design/viz-frames`. 사진 액자(`PhotoFrame.astro`)를 그대로 못 쓰는
 * 이유도 거기 있다: 그쪽은 칸 비율이 먼저 있어 담긴 것을 자르는데, 도식은 자르면
 * 축 이름과 범례가 잘려 나가 그림이 거짓말이 된다.
 *
 * **여섯 종은 CSS(`src/styles/viz-frame.css`)가 다 그린다.** 데코 부품은 전부
 * `.astro` 라 React 트리에 못 들어가지만 Tape/CornerMount/Polaroid/PaperSurface 가
 * 죄다 순수 CSS(gradient + clip-path)라 무늬를 옮겨 적을 수 있었다. **일곱째
 * `crayon` 만 예외**로 마크업이 더 붙는다 — 아래 `CrayonDefs` 주석.
 */
export type VizFrame =
  | "none"
  | "polaroid"
  | "taped"
  | "scrapbook"
  | "kraft"
  | "crayon"
  | "quiet"
  | "bare";

/**
 * F-G crayon 전용 — 손맛 필터 둘(`crayon` 칠 · `ink` 두른 선)을 이 figure 안에 심는다.
 * 값은 `src/components/deco/CrayonFilters.astro` 에서 그대로 가져왔다(같은 손이어야 한다).
 *
 * **이 액자만 CSS 로 안 끝나는 이유가 여기 있다.** SVG `filter` 정의는 CSS 에 못 적고
 * 문서 어딘가에 실물로 있어야 한다 — 다른 다섯 종이 gradient·clip-path 라 전부
 * `viz-frame.css` 에서 끝나는 것과 갈리는 지점이다.
 *
 * **필터를 SVG 안이 아니라 CSS 로 건다.** `feDisplacementMap` 의 `scale` 은 걸리는
 * 요소의 좌표계 단위인데, SVG `<svg preserveAspectRatio="none">` 로 테두리를 그리면
 * 그 단위가 viewBox 라 액자가 넓어질수록 흔들림이 함께 늘어난다(196 기준으로 그린 것을
 * 688px 에 펴면 가로 흔들림이 5.5 → 19px 이 되어 크레용이 아니라 번진 물감이 된다).
 * CSS `filter` 의 좌표계는 **CSS px** 이라 액자 크기와 무관하게 결이 일정하다 —
 * 데코 키트가 두들 D1·D2 를 HTML+CSS filter 로 남겨 둔 것과 같은 판단이다.
 *
 * id 는 `useId()` 로 인스턴스마다 가른다. 한 페이지에 도식이 여럿 올 때 같은 id 가
 * 겹치면 그 자체로 무효 문서이고, 나중에 정의를 갈랐을 때 어느 게 이길지도 안 정해진다.
 * (콜론은 `url(#…)` 안에서 안전하지만 굳이 남길 이유가 없어 털어 낸다.)
 */
function CrayonDefs({ id }: { id: string }) {
  return (
    <svg
      aria-hidden="true"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <filter id={`${id}-crayon`} x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves={4} seed={5} result="ed" />
          <feDisplacementMap in="SourceGraphic" in2="ed" scale={5.5} xChannelSelector="R" yChannelSelector="G" result="wob" />
          <feTurbulence type="fractalNoise" baseFrequency="0.14 0.2" numOctaves={5} seed={17} result="blot" />
          <feColorMatrix in="blot" type="luminanceToAlpha" result="lum" />
          <feComponentTransfer in="lum" result="patch">
            <feFuncA type="table" tableValues="1 1 0.86 0.34 0.72 0.2" />
          </feComponentTransfer>
          <feComposite in="wob" in2="patch" operator="in" />
        </filter>
        <filter id={`${id}-ink`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06 0.05" numOctaves={4} seed={11} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={3.4} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

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
  const crayonId = useId().replace(/:/g, "");

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
      {/* F-G crayon 만 마크업이 더 붙는다 — 필터 정의를 CSS 에 못 적기 때문이다
          (위 CrayonDefs 주석). 두 겹을 형제로 두는 이유는 부모에 filter 를 걸면
          자식이 그 필터를 한 번 더 뒤집어써서 결이 두 번 겹치기 때문이다. */}
      {frame === "crayon" && (
        <span className="viz-crayon" aria-hidden="true">
          <CrayonDefs id={crayonId} />
          <span className="cy-fill" style={{ filter: `url(#${crayonId}-crayon)` }} />
          <span className="cy-line" style={{ filter: `url(#${crayonId}-ink)` }} />
        </span>
      )}
    </figure>
  );
}
