/**
 * ProcessSteps — 순서 있는 단계(로컬 viz kind).
 *
 * 패키지의 `ProcessSteps` 는 각 단계의 `title`·`description` 을 **줄바꿈 없는 단일
 * <text>** 로 그린다. vertical 배치는 글이 `vbX + 48 + BADGE_R + 14` 에서 시작해
 * 오른쪽으로 흐르는데 멈출 상자가 없어서, 한 줄 설명이 길면 그대로 viewBox 를
 * 넘어 잘린다(실측: vpn-anatomy-7 MtuTriage 다섯 단계 중 셋이 문장 중간에서 잘림,
 * 최대 +42px).
 *
 * 이 컴포넌트는 vertical 을 대신하며 두 가지가 다르다:
 *
 *   1. **자동 줄바꿈** — 제목·설명을 남은 가로 폭에 맞춰 감싼다(`text.ts`).
 *   2. **높이는 콘텐츠에서 계산** — 감싼 줄 수만큼 단계 간격을 벌리고 viewBox
 *      높이를 되뽑는다. 균등 분배(`distributeCenters`)를 쓰면 설명이 두 줄인
 *      단계와 없는 단계가 같은 간격을 먹어 글이 겹치거나 빈 칸이 생긴다.
 *
 * horizontal·zigzag 은 이 블로그에서 쓰지 않는다(전 12건이 vertical). 쓰게 되면
 * 패키지 구현으로 넘어가되 `scripts/verify-viz.ts` 가 넘침을 잡아준다.
 *
 * 색·서체는 `vvar()` 로 스타일가이드 CSS 변수를 참조하므로
 * VisualizationStyleGuideProvider(블로그: blogVizStyleGuide) 안에서 써야 한다.
 */
import {
  Canvas,
  IndexBadge,
  ProcessSteps as PackageProcessSteps,
  StepConnector,
  vvar,
  type CanvasProps,
} from "@centurio1987/bbangto-ui-visualization";
import { parseViewBox, wrap } from "./text";

export interface ProcessStepData {
  id?: string;
  title: string;
  description?: string;
}

export interface ProcessStepsProps extends Omit<CanvasProps, "data"> {
  data?: { steps: ProcessStepData[] };
  orientation?: "horizontal" | "vertical" | "zigzag";
}

const BADGE_R = 18;
const TITLE_SIZE = 14;
const TITLE_LINE = 19;
const DESC_SIZE = 11;
const DESC_LINE = 16;
const TITLE_DESC_GAP = 6;
const STEP_GAP = 30; // 단계 사이 최소 간격(커넥터가 지나갈 자리)
const PAD_TOP = 24;
const PAD_BOTTOM = 24;
const PAD_RIGHT = 16;

export default function ProcessSteps({
  data,
  orientation = "vertical",
  viewBox = "0 0 480 520",
  children,
  ...canvasProps
}: ProcessStepsProps) {
  // 이 블로그가 쓰지 않는 배치는 패키지 구현에 위임한다.
  if (orientation !== "vertical") {
    return (
      <PackageProcessSteps
        data={data}
        orientation={orientation}
        viewBox={viewBox}
        {...canvasProps}
      >
        {children}
      </PackageProcessSteps>
    );
  }

  const [vbX, vbY, vbW, vbH] = parseViewBox(viewBox, [0, 0, 480, 520]);

  if (!data) {
    return (
      <Canvas viewBox={viewBox} data-bbangto-viz-pattern="process-steps" {...canvasProps}>
        {children}
      </Canvas>
    );
  }

  const steps = data.steps ?? [];
  const x = vbX + 48; // 뱃지 중심
  const textX = x + BADGE_R + 14;
  const textW = vbX + vbW - PAD_RIGHT - textX;

  // 각 단계의 줄바꿈 결과 → 필요한 높이 → 중심 y
  const laid = steps.map((step) => {
    const titleLines = wrap(step.title, textW, TITLE_SIZE);
    const descLines = step.description ? wrap(step.description, textW, DESC_SIZE) : [];
    const blockH =
      titleLines.length * TITLE_LINE +
      (descLines.length ? TITLE_DESC_GAP + descLines.length * DESC_LINE : 0);
    // 뱃지가 글보다 클 수 있다 — 둘 중 큰 쪽이 그 단계의 높이다.
    return { titleLines, descLines, height: Math.max(blockH, BADGE_R * 2) };
  });

  let cursor = vbY + PAD_TOP;
  const placed = laid.map((l) => {
    const top = cursor;
    cursor += l.height + STEP_GAP;
    return { ...l, top, center: top + l.height / 2 };
  });
  // 높이는 **콘텐츠가 정한다** — 저작자가 준 vbH 는 무시한다. 늘리기만 하면 짧은
  // 단계 묶음이 빈 아래 여백을 그대로 렌더한다(그림이 붕 떠 보인다).
  const contentBottom = cursor - STEP_GAP + PAD_BOTTOM;
  const fittedH = Math.ceil(contentBottom - vbY);
  const fittedViewBox = `${vbX} ${vbY} ${vbW} ${fittedH}`;

  return (
    <Canvas viewBox={fittedViewBox} data-bbangto-viz-pattern="process-steps" {...canvasProps}>
      {placed.map((l, i) => {
        const step = steps[i];
        // 글 블록은 위에서부터 쌓고, 뱃지는 그 블록의 세로 가운데에 둔다.
        const blockH =
          l.titleLines.length * TITLE_LINE +
          (l.descLines.length ? TITLE_DESC_GAP + l.descLines.length * DESC_LINE : 0);
        const blockTop = l.center - blockH / 2;
        const descTop = blockTop + l.titleLines.length * TITLE_LINE + TITLE_DESC_GAP;
        return (
          <g key={step.id ?? i} data-viz-step>
            <IndexBadge cx={x} cy={l.center} index={i + 1} radius={BADGE_R} />
            {l.titleLines.map((line, j) => (
              <text
                key={`t${j}`}
                x={textX}
                y={blockTop + j * TITLE_LINE + TITLE_LINE * 0.72}
                fontSize={TITLE_SIZE}
                fontWeight={700}
                fontFamily={vvar("typography", "titleFont")}
                style={{ fill: vvar("shape", "stroke") }}
              >
                {line}
              </text>
            ))}
            {l.descLines.map((line, j) => (
              <text
                key={`d${j}`}
                x={textX}
                y={descTop + j * DESC_LINE + DESC_LINE * 0.75}
                fontSize={DESC_SIZE}
                fontFamily={vvar("typography", "titleFont")}
                style={{ fill: vvar("boundary", "labelColor") }}
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}
      {placed.slice(0, -1).map((l, i) => (
        <StepConnector
          key={`c${i}`}
          from={{ x, y: l.center + BADGE_R + 6 }}
          to={{ x, y: placed[i + 1].center - BADGE_R - 6 }}
        />
      ))}
    </Canvas>
  );
}

ProcessSteps.displayName = "ProcessSteps";
