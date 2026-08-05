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
import VizMark, { HandFilters, type VizMarkName } from "./VizMark";
import VizNote from "./VizNote";

/**
 * 그림을 감싸는 액자(KAN-063). 그림 자체는 그대로 두고 **바깥 껍데기만** 바꾼다.
 *
 *   none       액자 없음 — 액자를 끈 그림의 탈출구(옛 렌더 그대로)
 *   polaroid   F-A 흰 판 + 가운데 위 마테 + 손글씨 캡션  ← **본문 도식의 기본값**
 *   scrapbook  F-D 도트 종이 판 + 네 귀퉁이 홀더
 *   note       F-H 마테 뗀 흰 판 + 캡션을 곡선 화살표·손글씨 메모 두들로
 *   taped      F-B 모눈 판 + 위 모서리 테이프 두 장
 *   kraft      F-C 네 변이 찢긴 크라프트 판
 *   crayon     F-G 크레용 칠 + 잉크 선 이중 테두리
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
 * `crayon` 만 예외**로 마크업이 더 붙는다(SVG 필터 정의는 CSS 에 못 적는다 —
 * `HandFilters` 주석). 액자 위에 얹는 두들 마크도 같은 이유로 마크업이다.
 */
export type VizFrame =
  | "none"
  | "polaroid"
  | "note"
  | "taped"
  | "scrapbook"
  | "kraft"
  | "crayon"
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
  /**
   * 액자. 기본은 `polaroid` (F-A) — **본문 도식의 기본값을 여기 한 줄로 정한다.**
   *
   * `src/components/posts/<slug>/*.tsx` 39개는 `scripts/apply-viz.ts` 가 자동
   * 생성한 파일이라, 거기에 `frame=` 을 박으면 다음 재생성에서 조용히 지워진다.
   * 그래서 파일을 40개 고치지 않고 **기본값 하나**로 41개 도식에 액자를 씌운다.
   *
   * **F-A 는 유저가 후보 여덟을 보고 고른 값이다**(`/design/frame-picks`).
   * 그 판단을 뒤집는 근거가 새로 나오기 전에는 바꾸지 않는다. 그림을 안 가리는
   * 액자라는 조건은 F-A 도 만족한다 — 마테가 판 **위**에만 걸치고 그림 위로는
   * 안 내려오며(`viz-frame.css` 의 polaroid 절), 768px 아래에서는 그 마테가 접힌다.
   *
   * 한때 기본값이 `scrapbook` 이었고 사유 둘 중 하나가 "인용·코드블록이 이미
   * **테이프 판**을 입고 있어 도식까지 테이프면 벽지가 된다" 였는데, **그 사유는
   * 지금 없다** — 인용·코드는 테이프를 떼고 두들 마크로 갈아탔다(`MarkedQuote` ·
   * `MarkedCode`, `DECO_KIT.md` 규칙 11). F-A 는 애초에 테이프 액자도 아니다.
   *
   * 알고 고른 대가 하나: **흰 판(#fffcf6)이 종이색보다 밝아 본문에서 눈에 띈다**
   * (`/design/frame-picks` 의 F-A 단점 줄). 캡션 없는 그림에서 아래가 비는 쪽은
   * `:not(:has(figcaption))` 이 아래 여백으로 메운다.
   *
   * 한 그림만 달리 입히려면 그 자리에서 `frame="…"` 으로 덮는다(`"none"` 포함).
   */
  frame?: VizFrame;
  /**
   * 액자 귀퉁이에 얹는 두들 마크. 기본은 없음 — **유저가 안 붙이기로 골랐다**
   * (액자 F-A 를 고른 자리에서 "두들마크는 안 붙여도 된다"). 그래서 발행된
   * 도식 41개에는 마크가 없다. 부품은 남겨 둔다 — 한 그림만 표시하고 싶을 때
   * 그 자리에서 `mark="…"` 로 켤 수 있게(`/design/frame-picks` 의 마크 후보 넷).
   *
   * **스티커 자리를 대신한다** — 크레용 액자에 있던 금별이 여기로 옮겨 왔다.
   * 스티커는 붙인 종이라 액자와 재질이 겹치는데(액자도 종이다) 마크는 그 위에
   * 손으로 그은 자국이라 겹치지 않는다.
   *
   * 자리·크기·티어는 액자마다 `viz-frame.css` 가 정한다(`--vzm`). 마크는 장식이라
   * 티어 3 을 지고 좁은 화면에서 접힌다 — 본문 마크(`DoodleMark`)가 뜻을 져서
   * 강도로 사라지지 않는 것과 반대다.
   */
  mark?: VizMarkName;
  className?: string;
  children: ReactNode;
}

export default function VizFigure({
  caption,
  label,
  styleGuide = blogVizStyleGuide,
  foundationKey,
  frame = "polaroid",
  mark,
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
  /**
   * F-H `note` 만 캡션의 **마크업**이 다르다 — 나머지 액자는 글씨체·자리만 CSS 로
   * 바꾸는데, 여기서는 캡션 옆에 화살표 두들이 하나 더 서고 글씨에 손맛 필터가
   * 걸린다(SVG 필터 정의는 CSS 에 못 적는다 — `HandFilters` 주석).
   */
  const figcaption = caption ? (
    <figcaption>{frame === "note" ? <VizNote>{caption}</VizNote> : caption}</figcaption>
  ) : null;

  /**
   * 액자가 없으면 **DOM 을 한 글자도 바꾸지 않는다.**
   *
   * 패딩을 0 으로 맞춰 픽셀을 재현하는 길은 막혀 있다 — viz.css 의
   * `.viz-figure > [data-bbangto-viz-style-guide] { width:100% }` 가 **직접 자식**
   * 선택자라, 래퍼를 한 겹만 끼워도 이 규칙이 조용히 죽어 Provider 가 폭 100% 를
   * 잃는다(빌드도 타입도 초록이라 눈 말고는 안 잡힌다). 액자를 쓸 때는
   * viz-frame.css 가 그 폭 규칙을 새 경로로 다시 깔고, 이 갈래는 액자를 **끈**
   * 그림이 옛 렌더 그대로 남게 하는 탈출구로 남는다.
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
          (`HandFilters` 주석). 두 겹을 형제로 두는 이유는 부모에 filter 를 걸면
          자식이 그 필터를 한 번 더 뒤집어써서 결이 두 번 겹치기 때문이다. */}
      {frame === "crayon" && (
        <span className="viz-crayon" aria-hidden="true">
          <HandFilters id={crayonId} kinds={["crayon", "ink"]} />
          <span className="cy-fill" style={{ filter: `url(#${crayonId}-crayon)` }} />
          <span className="cy-line" style={{ filter: `url(#${crayonId}-ink)` }} />
        </span>
      )}
      {/* 마크는 `.viz-frame-deco` 안이 아니라 형제로 둔다 — 그쪽은 액자마다
          의사요소 둘을 이미 테이프·홀더로 쓰고 있어 자리가 없다. */}
      {mark && <VizMark name={mark} />}
    </figure>
  );
}
