/**
 * Comparison — 좌우 대비(로컬 viz kind).
 *
 * 패키지의 `Comparison` 은 각 항목을 **줄바꿈 없는 단일 <text fontSize=13>** 으로
 * 그린다. 판 폭은 `(620 − 48) / 2 − 12 = 274` 이고 글머리 여백을 빼면 약 226 인데,
 * 한글은 13px 당 13 단위를 먹으므로 **17자만 넘어도 판을 벗어난다**. SVG 는 넘친
 * 글자를 흘려보내므로 그대로 viewBox 경계에서 잘린 채 렌더된다(실측: vpn-anatomy-7
 * "OpenVPN 2.6 이전: 제어+데이터 모두 유저스페이스" +41px, vpn-anatomy-5 +39px).
 *
 * 이 컴포넌트는 그 자리를 대신하며 세 가지가 다르다:
 *
 *   1. **자동 줄바꿈** — 항목을 판 폭에 맞춰 감싼다(`text.ts`, 한글 전각 계산).
 *   2. **높이는 콘텐츠에서 계산** — viewBox 의 폭만 계약으로 쓰고 높이는 감싼
 *      결과에서 되뽑는다. 그래서 항목이 길어져도 넘치지 않고, 짧으면 빈 여백이
 *      남지 않는다(`.viz-figure svg { height: auto }` 라 폭만 맞으면 된다).
 *   3. **제목도 판 안에서 줄바꿈** — 긴 판 제목이 옆 판을 침범하지 않는다.
 *
 * `mode="magnitude"` 는 면적 비교라 텍스트가 블록 아래 가운데 정렬로 놓이고
 * 판이라는 상자 자체가 없다 — 넘칠 상자가 없으므로 패키지 배치를 그대로 옮기되
 * 라벨만 viewBox 폭 안에서 감싼다.
 *
 * 색·서체는 `vvar()` 로 스타일가이드 CSS 변수를 참조하므로
 * VisualizationStyleGuideProvider(블로그: blogVizStyleGuide) 안에서 써야 한다.
 */
import {
  Canvas,
  ProportionBlock,
  StatNumber,
  VsDivider,
  vvar,
  type CanvasProps,
} from "@centurio1987/bbangto-ui-visualization";
import { fit, parseViewBox, wrap } from "./text";

export interface ComparisonPaneData {
  label: string;
  /** split 모드의 글머리 항목. */
  items?: string[];
  /** magnitude 모드의 값(면적 비례). */
  value?: number;
}

export interface ComparisonData {
  left: ComparisonPaneData;
  right: ComparisonPaneData;
}

export interface ComparisonProps extends Omit<CanvasProps, "data"> {
  data?: ComparisonData;
  mode?: "split" | "magnitude";
}

/** 판 안쪽 여백 · 글머리 점 · 줄 간격 — 패키지 배치와 같은 인상을 유지한다. */
const PANE_PAD_X = 22; // 글머리 점 중심까지
const BULLET_GAP = 14; // 글머리 점 → 글 시작
const BULLET_R = 4;
const LABEL_SIZES = [17, 16, 15, 14] as const;
const ITEM_SIZE = 13;
const ITEM_LINE = 19; // 한 줄 높이
const ITEM_GAP = 10; // 항목 사이 추가 간격
const PANE_INSET = 12; // viewBox 가장자리 → 판
const LABEL_BASELINE = 34; // 판 위쪽 → 제목 baseline
const FIRST_ITEM_OFFSET = 30; // 제목 baseline → 첫 항목 중심
const PANE_BOTTOM_PAD = 20;
const GAP = 48; // 좌우 판 사이

/**
 * 판 하나의 줄바꿈 결과 · 각 항목의 y · 필요한 높이.
 *
 * **배치를 여기서 끝내고 렌더는 그대로 쓴다.** 높이를 따로 어림하고 그리기는 또
 * 따로 하면 둘이 어긋나 판 아래에 빈 띠가 남는다(어림이 후하면) 거나 마지막 항목이
 * 판을 뚫는다(박하면). 자와 그림이 같은 계산을 쓰게 묶는다.
 */
function layoutPane(pane: ComparisonPaneData, paneW: number) {
  const textW = paneW - PANE_PAD_X - BULLET_GAP - 16;
  const labelFit = fit(pane.label, paneW - 24, 2, LABEL_SIZES);
  const labelLead = labelFit.size * 1.2;
  const items = (pane.items ?? []).map((item) => wrap(item, textW, ITEM_SIZE));

  // 판 위쪽(y) 기준 상대 좌표로 항목 중심을 쌓는다.
  let cursor = LABEL_BASELINE + (labelFit.lines.length - 1) * labelLead + FIRST_ITEM_OFFSET;
  const tops = items.map((lines) => {
    const top = cursor;
    cursor += lines.length * ITEM_LINE + ITEM_GAP;
    return top;
  });

  // 마지막 항목의 **글 아래끝**(중심 정렬이라 반 줄 더한다). 항목 뒤 ITEM_GAP 은 뺀다.
  const last = items.length - 1;
  const lastBottom =
    last >= 0
      ? tops[last] + (items[last].length - 1) * ITEM_LINE + ITEM_SIZE / 2
      : LABEL_BASELINE + (labelFit.lines.length - 1) * labelLead;
  return { labelFit, labelLead, items, tops, height: lastBottom + PANE_BOTTOM_PAD };
}

function Pane({
  pane,
  layout,
  x,
  y,
  width,
  height,
  side,
}: {
  pane: ComparisonPaneData;
  layout: ReturnType<typeof layoutPane>;
  x: number;
  y: number;
  width: number;
  height: number;
  side: "left" | "right";
}) {
  const cx = x + width / 2;
  const { labelFit, labelLead, items, tops } = layout;

  return (
    <g data-viz-pane={side}>
      <rect data-viz-part="shape" x={x} y={y} width={width} height={height} rx={12} />
      {labelFit.lines.map((line, i) => (
        <text
          key={`l${i}`}
          x={cx}
          y={y + LABEL_BASELINE + i * labelLead}
          textAnchor="middle"
          fontSize={labelFit.size}
          fontWeight={700}
          fontFamily={vvar("typography", "titleFont")}
          style={{ fill: vvar("shape", "stroke") }}
        >
          {line}
        </text>
      ))}
      {items.map((lines, i) => {
        const top = y + tops[i];
        return (
          <g key={i} data-viz-compare-item>
            <circle
              cx={x + PANE_PAD_X}
              cy={top}
              r={BULLET_R}
              style={{ fill: vvar("palette", side === "left" ? "p2" : "p6") }}
            />
            {lines.map((line, j) => (
              <text
                key={j}
                x={x + PANE_PAD_X + BULLET_GAP}
                y={top + j * ITEM_LINE}
                dominantBaseline="central"
                fontSize={ITEM_SIZE}
                fontFamily={vvar("typography", "titleFont")}
                style={{ fill: vvar("shape", "stroke") }}
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </g>
  );
}

export default function Comparison({
  data,
  mode = "split",
  viewBox = "0 0 620 260",
  children,
  ...canvasProps
}: ComparisonProps) {
  const [vbX, vbY, vbW, vbH] = parseViewBox(viewBox, [0, 0, 620, 260]);

  if (!data) {
    return (
      <Canvas viewBox={viewBox} data-bbangto-viz-pattern="comparison" {...canvasProps}>
        {children}
      </Canvas>
    );
  }

  if (mode === "magnitude") {
    // 면적 비교 — 상자가 없어 넘칠 대상이 없다. 라벨만 viewBox 안에서 감싼다.
    const panes = [
      { ...data.left, cx: vbX + vbW * 0.28 },
      { ...data.right, cx: vbX + vbW * 0.72 },
    ];
    const maxValue = Math.max(...panes.map((p) => p.value ?? 0), 1);
    const maxSide = vbH * 0.5;
    const baseY = vbY + vbH * 0.72;
    return (
      <Canvas viewBox={viewBox} data-bbangto-viz-pattern="comparison" {...canvasProps}>
        {panes.map((p, i) => {
          const side = Math.sqrt((p.value ?? 0) / maxValue) * maxSide;
          const lines = wrap(p.label, vbW * 0.44, 13);
          return (
            <g key={i}>
              <ProportionBlock x={p.cx - side / 2} y={baseY - side} width={side} height={side} />
              <StatNumber x={p.cx} y={baseY + 34} value={p.value ?? 0} fontSize={26} />
              {lines.map((line, j) => (
                <text
                  key={j}
                  x={p.cx}
                  y={baseY + 58 + j * 17}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={600}
                  fontFamily={vvar("typography", "titleFont")}
                  style={{ fill: vvar("boundary", "labelColor") }}
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}
        <VsDivider x={vbX + vbW / 2} y1={vbY + 16} y2={vbY + vbH - 16} />
      </Canvas>
    );
  }

  const paneW = (vbW - GAP) / 2 - PANE_INSET;
  const leftLayout = layoutPane(data.left, paneW);
  const rightLayout = layoutPane(data.right, paneW);
  // 두 판은 긴 쪽에 맞춰 같은 높이로 두고, 그 높이에서 viewBox 높이를 되뽑는다.
  // 높이는 **콘텐츠가 정한다** — 저작자가 준 vbH 는 무시한다. 늘리기만 하면
  // 항목이 적은 그림이 빈 아래 여백을 그대로 렌더한다.
  const paneH = Math.ceil(Math.max(leftLayout.height, rightLayout.height));
  const fittedH = paneH + PANE_INSET * 2;
  const fittedViewBox = `${vbX} ${vbY} ${vbW} ${fittedH}`;
  const centerX = vbX + vbW / 2;
  const paneY = vbY + PANE_INSET;

  return (
    <Canvas viewBox={fittedViewBox} data-bbangto-viz-pattern="comparison" {...canvasProps}>
      <Pane
        pane={data.left}
        layout={leftLayout}
        x={vbX + PANE_INSET}
        y={paneY}
        width={paneW}
        height={paneH}
        side="left"
      />
      <Pane
        pane={data.right}
        layout={rightLayout}
        x={centerX + GAP / 2}
        y={paneY}
        width={paneW}
        height={paneH}
        side="right"
      />
      <VsDivider x={centerX} y1={paneY} y2={paneY + paneH} />
    </Canvas>
  );
}

Comparison.displayName = "Comparison";
