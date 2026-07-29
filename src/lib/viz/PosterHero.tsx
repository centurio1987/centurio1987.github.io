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
 * 글리프 하나의 대략 폭(단위: fontSize 배수).
 *
 * 패키지의 `estimateWidth` 는 문자 종류와 무관하게 고정 비율을 쓰기 때문에
 * 한글을 크게 과소평가한다(그래서 "안 잘린다"는 판정이 틀린다). 여기서는
 * CJK/한글을 전각(1em)으로, 라틴·숫자·구두점을 좁게 잡는다.
 */
function glyphRatio(ch: string): number {
  const c = ch.codePointAt(0) ?? 0;
  const isWide =
    (c >= 0x1100 && c <= 0x11ff) || // 한글 자모
    (c >= 0x2e80 && c <= 0x303f) || // CJK 부수 · 기호(— 제외 범위 밖)
    (c >= 0x3130 && c <= 0x318f) || // 호환 자모
    (c >= 0x4e00 && c <= 0x9fff) || // 한자
    (c >= 0xac00 && c <= 0xd7af) || // 한글 음절
    (c >= 0xf900 && c <= 0xfaff) ||
    (c >= 0xff00 && c <= 0xff60); // 전각 형태
  if (isWide) return 1;
  if (ch === "—" || ch === "―") return 1; // em dash
  if (ch === " ") return 0.3;
  if (ch >= "A" && ch <= "Z") return 0.68;
  if (ch >= "a" && ch <= "z") return 0.56;
  if (ch >= "0" && ch <= "9") return 0.58;
  return 0.42; // 그 외 구두점 (· , . : / + = 등)
}

/** 문자열의 대략 렌더 폭(viewBox 단위). 약간 보수적으로(넉넉히) 잡는다. */
function textWidth(text: string, fontSize: number): number {
  let ratio = 0;
  for (const ch of text) ratio += glyphRatio(ch);
  return ratio * fontSize * 1.02;
}

/** 어절 단위 줄바꿈. 한 어절이 한 줄보다 길면 글자 단위로 쪼갠다. */
function wrap(text: string, maxWidth: number, fontSize: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const test = current ? `${current} ${word}` : word;
    if (current && textWidth(test, fontSize) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
    // 한 어절 자체가 폭을 넘으면 글자 단위로 강제 분리
    while (textWidth(current, fontSize) > maxWidth && current.length > 1) {
      let cut = current.length - 1;
      while (cut > 1 && textWidth(current.slice(0, cut), fontSize) > maxWidth) cut--;
      lines.push(current.slice(0, cut));
      current = current.slice(cut);
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

/**
 * 같은 줄 수를 유지하는 가장 좁은 폭으로 다시 감싼다(균형 줄바꿈).
 *
 * 그리디 줄바꿈은 첫 줄을 꽉 채워 "무엇을 고르든 어디서 / 넘어지는가" 처럼
 * 의미가 끊긴 자리에서 꺾인다. 줄 수를 늘리지 않는 선에서 폭을 줄이면
 * "무엇을 고르든 / 어디서 넘어지는가" 로 자연스러운 어절 경계에 붙는다.
 */
function balance(text: string, maxWidth: number, fontSize: number, lineCount: number): string[] {
  let best = wrap(text, maxWidth, fontSize);
  if (lineCount <= 1) return best;
  let lo = 1;
  let hi = maxWidth;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const lines = wrap(text, mid, fontSize);
    if (lines.length <= lineCount) {
      best = lines;
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return best;
}

/** 후보 크기 사다리에서 maxLines 안에 들어가는 가장 큰 크기를 고른다. */
function fit(
  text: string,
  maxWidth: number,
  maxLines: number,
  sizes: readonly number[],
): { size: number; lines: string[] } {
  for (const size of sizes) {
    const lines = wrap(text, maxWidth, size);
    if (lines.length <= maxLines) return { size, lines: balance(text, maxWidth, size, lines.length) };
  }
  const size = sizes[sizes.length - 1];
  const lines = wrap(text, maxWidth, size);
  return { size, lines: balance(text, maxWidth, size, lines.length) };
}

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

  const parts = viewBox.trim().split(/[\s,]+/).map(Number);
  const [vbX, vbY, vbW, vbH] = parts.length === 4 && !parts.some(Number.isNaN)
    ? (parts as [number, number, number, number])
    : [0, 0, 600, 338];

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
