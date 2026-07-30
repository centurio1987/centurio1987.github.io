/**
 * PosterHero — hero 전용 에디토리얼 포스터(로컬 viz kind).
 *
 * 패키지의 `PosterEditorial` 은 title 을 **줄바꿈 없는 단일 <text fontSize=54>** 로
 * 그린다. 그래서 viewBox 폭(600 − 패딩 = 약 528 단위)을 넘는 제목 — 한글 기준 약
 * 10자 — 은 오른쪽이 그대로 잘린다(items 목록도 같은 이유로 잘린다).
 * 이 컴포넌트는 그 자리를 대신하며 세 가지가 다르다:
 *
 *   1. **자동 줄바꿈** — 어절 단위로 감싼다(한글/CJK 폭을 1em 으로 계산).
 *   2. **자동 크기 맞춤** — 후보 사다리에서 `maxTitleLines` 안에 들어가는
 *      가장 큰 글자 크기를 고른다. 짧은 제목은 커지고 긴 제목은 줄어들 뿐,
 *      **절대 잘리지 않는다**.
 *   3. **items 없음** — 지면을 제목·부제에만 쓴다.
 *
 * 나머지(위/아래 괘선, eyebrow 키커, 잉크색·서체 토큰)는 PosterEditorial 과 같은
 * 인상을 유지해 같은 시리즈의 형제 편 hero 와 나란히 놓아도 튀지 않는다.
 *
 * 색·서체는 `vvar()` 로 스타일가이드 CSS 변수를 참조하므로
 * VisualizationStyleGuideProvider(블로그: blogVizStyleGuide) 안에서 써야 한다.
 */
import { Canvas, vvar, type CanvasProps } from "@centurio1987/bbangto-ui-visualization";
import { balance, fit, parseViewBox, wrap } from "./text";

export interface PosterHeroData {
  /** 상단 작은 키커. 예: "VPN의 해부 · EP7 · 완결". */
  eyebrow?: string;
  /** 주제목. 길면 자동으로 여러 줄로 감싸고 글자 크기를 낮춘다. */
  title: string;
  /** 부제. 길면 자동으로 감싼다. */
  subtitle?: string;
  /** 제목 최대 줄 수(기본 3). */
  maxTitleLines?: number;
  /** 부제 최대 줄 수(기본 2). */
  maxSubtitleLines?: number;
}

export interface PosterHeroProps extends Omit<CanvasProps, "data"> {
  data?: PosterHeroData;
}

const PAD = 36;
/** 제목 글자 크기 후보(큰 것부터). 들어가는 첫 값을 쓴다. */
const TITLE_SIZES = [64, 58, 52, 46, 41, 36, 32, 28];
const SUBTITLE_SIZES = [20, 18, 16, 15];

/**
 * hero 대표 이미지 — 제목·부제만 크게. 잘림 없음.
 *
 * 기본 viewBox 는 `0 0 600 338`(래스터 deviceScaleFactor 2 → 1200×676, OG 규격).
 */
export default function PosterHero({
  data,
  viewBox = "0 0 600 338",
  title = "Poster",
  children,
  ...canvasProps
}: PosterHeroProps) {
  if (!data) {
    return (
      <Canvas viewBox={viewBox} title={title} data-bbangto-viz-pattern="poster-hero" {...canvasProps}>
        {children}
      </Canvas>
    );
  }

  const [vbX, vbY, vbW, vbH] = parseViewBox(viewBox, [0, 0, 600, 338]);

  const left = vbX + PAD;
  const right = vbX + vbW - PAD;
  const contentW = right - left;

  const titleFont = vvar("typography", "titleFont");
  const monoFont = vvar("typography", "monoFont");
  const ink = vvar("shape", "stroke");
  const accent = vvar("palette", "p1");

  const ruleTop = vbY + PAD;
  const ruleBottom = vbY + vbH - PAD;
  const eyebrowBaseline = ruleTop + 28;

  // 제목·부제가 차지할 수 있는 세로 띠
  const bandTop = (data.eyebrow ? eyebrowBaseline + 18 : ruleTop + 16) + 8;
  const bandBottom = ruleBottom - 20;
  const bandH = bandBottom - bandTop;

  const maxTitleLines = data.maxTitleLines ?? 3;
  const maxSubLines = data.maxSubtitleLines ?? 2;

  // 부제를 먼저 확정한다 — 제목 크기는 "부제까지 담고도 띠 안에 드는지"로 고른다.
  const subFit = data.subtitle
    ? fit(data.subtitle, contentW, maxSubLines, SUBTITLE_SIZES)
    : null;
  const subLead = subFit ? subFit.size * 1.5 : 0;
  const subBlockH = subFit ? subFit.lines.length * subLead : 0;

  const blockHeightFor = (size: number, lineCount: number) =>
    lineCount * size * 1.18 + (subFit ? size * 0.44 + subBlockH : 0);

  // 줄 수 제한 + 세로 띠 높이를 **둘 다** 만족하는 가장 큰 제목 크기.
  // 높이를 안 보면 긴 제목이 부제를 지면 밖으로 밀어낸다.
  let titleFit = fit(data.title, contentW, maxTitleLines, TITLE_SIZES);
  for (const size of TITLE_SIZES) {
    const lines = wrap(data.title, contentW, size);
    if (lines.length > maxTitleLines) continue;
    if (blockHeightFor(size, lines.length) > bandH) continue;
    titleFit = { size, lines: balance(data.title, contentW, size, lines.length) };
    break;
  }

  const titleLead = titleFit.size * 1.18;
  const gap = titleFit.size * 0.44;

  const blockH = blockHeightFor(titleFit.size, titleFit.lines.length);
  // 띠보다 크면 위에서부터, 아니면 세로 가운데 정렬
  const blockTop = bandTop + Math.max(0, (bandH - blockH) / 2);

  const subTop = blockTop + titleFit.lines.length * titleLead + gap;

  return (
    <Canvas viewBox={viewBox} title={title} data-bbangto-viz-pattern="poster-hero" {...canvasProps}>
      <path
        data-bbangto-viz-edge
        d={`M ${left} ${ruleTop} L ${right} ${ruleTop}`}
        style={{ fill: "none", strokeWidth: 2 }}
      />
      {data.eyebrow ? (
        <text
          x={left}
          y={eyebrowBaseline}
          fontSize={13}
          fontWeight={700}
          letterSpacing="0.18em"
          fontFamily={monoFont}
          style={{ fill: accent }}
        >
          {data.eyebrow}
        </text>
      ) : null}

      {titleFit.lines.map((line, i) => (
        <text
          key={`t${i}`}
          data-bbangto-viz-poster-title={i === 0 ? true : undefined}
          x={left}
          y={blockTop + i * titleLead + titleFit.size * 0.8}
          fontSize={titleFit.size}
          fontWeight={800}
          fontFamily={titleFont}
          style={{ fill: ink }}
        >
          {line}
        </text>
      ))}

      {subFit
        ? subFit.lines.map((line, i) => (
            <text
              key={`s${i}`}
              x={left}
              y={subTop + i * subLead + subFit.size * 0.85}
              fontSize={subFit.size}
              fontWeight={500}
              fontFamily={titleFont}
              style={{ fill: ink, opacity: 0.72 }}
            >
              {line}
            </text>
          ))
        : null}

      <path
        data-bbangto-viz-edge
        d={`M ${left} ${ruleBottom} L ${right} ${ruleBottom}`}
        style={{ fill: "none" }}
      />
    </Canvas>
  );
}

PosterHero.displayName = "PosterHero";
