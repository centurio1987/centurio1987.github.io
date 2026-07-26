/**
 * viz 레이아웃 헬퍼 — apply-viz(코드생성)와 render-viz(래스터)가 공유.
 * kind별 기본 viewBox / 접근성 title·desc / top-level extra prop 을 단일 소스로 계산한다.
 */
import type { VizSpec } from "./schema";

/**
 * kind별 기본 viewBox (spec.viewBox 우선).
 *
 * **폭은 620 이하로 유지한다.** 인라인 SVG는 본문 폭(약 632px)에 맞춰
 * `width:100%`로 스케일되므로, viewBox 폭이 본문보다 넓으면 그만큼 축소 렌더돼
 * 글자가 작아진다(폭 760 → 0.83배). 620이 본문과 거의 등배다.
 * 높이도 콘텐츠에 맞춘다 — 남는 세로 여백은 그대로 빈 공간으로 렌더된다.
 */
export function defaultViewBox(spec: VizSpec): string {
  if (spec.viewBox) return spec.viewBox;
  switch (spec.kind) {
    case "ProcessSteps":
      return spec.orientation === "vertical" ? "0 0 480 520" : "0 0 620 200";
    case "Comparison":
      return "0 0 620 260";
    case "Statistics":
      return "0 0 620 220";
    case "PosterEditorial":
      // hero 래스터는 deviceScaleFactor 2 → 1200x676(OG 규격). 텍스트는 크게.
      return "0 0 600 338";
    case "Flowchart": {
      // 노드 bbox에서 자동 계산 — 저작자가 노드 x/width를 620 안에 배치해야 한다.
      let maxX = 0;
      let maxY = 0;
      for (const n of spec.data.nodes) {
        maxX = Math.max(maxX, n.x + n.width);
        maxY = Math.max(maxY, n.y + n.height);
      }
      return `0 0 ${Math.ceil(maxX + 40)} ${Math.ceil(maxY + 40)}`;
    }
  }
}

/** SVG 접근성 title/desc. alt > (PosterEditorial의 title) > caption > kind. */
export function a11yText(spec: VizSpec): { title: string; desc: string } {
  const title =
    spec.alt ??
    (spec.kind === "PosterEditorial" ? spec.data.title : undefined) ??
    spec.caption ??
    spec.kind;
  const desc = spec.caption ?? spec.alt ?? title;
  return { title, desc };
}

/** kind별 top-level extra prop(오브젝트). */
export function extraProps(spec: VizSpec): Record<string, string | boolean> {
  const p: Record<string, string | boolean> = {};
  if (spec.kind === "ProcessSteps" && spec.orientation) p.orientation = spec.orientation;
  if (spec.kind === "Comparison" && spec.mode) p.mode = spec.mode;
  if (spec.kind === "Statistics" && spec.mode) p.mode = spec.mode;
  if (spec.kind === "Flowchart" && spec.showGrid) p.showGrid = true;
  return p;
}

/** viewBox → 픽셀 크기(w,h). spec.size가 있으면 우선. */
export function pixelSize(spec: VizSpec & { size?: { w: number; h: number } }): { w: number; h: number } {
  if (spec.size?.w && spec.size?.h) return spec.size;
  const parts = defaultViewBox(spec).split(/\s+/).map(Number);
  if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) return { w: parts[2], h: parts[3] };
  return { w: 1200, h: 675 };
}
