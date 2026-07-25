/**
 * viz 블록 스키마 — ```viz``` 펜스드 블록(JSON)의 런타임 검증.
 *
 * 저작자가 본문에 남기는 구조형 시각물 명세를 kind별로 검증한다.
 * apply-viz 엔진(scripts/apply-viz.ts)이 이 스키마로 파싱→코드생성/래스터한다.
 *
 * v1 지원 kind(5종): ProcessSteps · Comparison · Flowchart · Statistics · PosterEditorial.
 * 나머지 ~65종은 후속 확장.
 */
import { z } from "zod";

/** 공통 필드 — 모든 kind가 공유. */
const commonShape = {
  /** "inline"(본문 정적 SVG) | "hero"(래스터 webp). 기본 inline. */
  target: z.enum(["inline", "hero"]).default("inline"),
  /** 그림 아래 캡션. */
  caption: z.string().optional(),
  /** 접근성 대체텍스트(SVG <title>). 미지정 시 caption/제목에서 유도. */
  alt: z.string().optional(),
  /** 컴포넌트/파일명 힌트(PascalCase 권장). inline이면 컴포넌트명, hero면 파일명. */
  name: z.string().optional(),
  /** SVG viewBox. 예: "0 0 760 220". */
  viewBox: z.string().optional(),
};

const step = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
});

const comparisonPane = z.object({
  label: z.string(),
  items: z.array(z.string()).optional(),
  value: z.number().optional(),
});

const flowNode = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  label: z.string().optional(),
  shape: z.string().optional(),
  fill: z.string().optional(),
  stroke: z.string().optional(),
  strokeWidth: z.number().optional(),
  strokeDasharray: z.string().optional(),
});

const flowEdge = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
  routing: z.string().optional(),
  dashed: z.boolean().optional(),
  markerEnd: z.string().optional(),
});

const statItem = z.object({
  label: z.string(),
  value: z.union([z.number(), z.string()]),
  unit: z.string().optional(),
  delta: z.number().optional(),
  count: z.number().optional(),
});

export const vizSpecSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("ProcessSteps"),
    orientation: z.enum(["horizontal", "vertical", "zigzag"]).optional(),
    data: z.object({ steps: z.array(step).min(1) }),
    ...commonShape,
  }),
  z.object({
    kind: z.literal("Comparison"),
    mode: z.enum(["split", "magnitude"]).optional(),
    data: z.object({ left: comparisonPane, right: comparisonPane }),
    ...commonShape,
  }),
  z.object({
    kind: z.literal("Flowchart"),
    showGrid: z.boolean().optional(),
    data: z.object({
      nodes: z.array(flowNode).min(1),
      edges: z.array(flowEdge).optional(),
    }),
    ...commonShape,
  }),
  z.object({
    kind: z.literal("Statistics"),
    mode: z.enum(["cards", "isotype", "mosaic", "waffle"]).optional(),
    data: z.object({ items: z.array(statItem).min(1) }),
    ...commonShape,
  }),
  z.object({
    kind: z.literal("PosterEditorial"),
    data: z.object({
      eyebrow: z.string().optional(),
      title: z.string(),
      subtitle: z.string().optional(),
      items: z.array(z.string()).optional(),
    }),
    ...commonShape,
  }),
]);

export type VizSpec = z.infer<typeof vizSpecSchema>;
export type VizKind = VizSpec["kind"];

export const SUPPORTED_VIZ_KINDS: readonly string[] = [
  "ProcessSteps",
  "Comparison",
  "Flowchart",
  "Statistics",
  "PosterEditorial",
];

/** raw(파싱된 JSON)을 검증한다. 실패 시 읽기 좋은 에러 메시지를 던진다. */
export function parseVizSpec(raw: unknown, blockLabel = "viz block"): VizSpec {
  const result = vizSpecSchema.safeParse(raw);
  if (!result.success) {
    const kind = (raw as { kind?: unknown } | null)?.kind;
    const hint =
      typeof kind === "string" && !SUPPORTED_VIZ_KINDS.includes(kind)
        ? `\n  지원하지 않는 kind "${kind}". v1 지원: ${SUPPORTED_VIZ_KINDS.join(", ")}.`
        : "";
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`[${blockLabel}] 스키마 검증 실패:${hint}\n${issues}`);
  }
  return result.data;
}
