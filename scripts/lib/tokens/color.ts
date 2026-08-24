/**
 * 색 · radius · 선 굵기 축 판정 — 대조 상대는 `s4-classify.json` (KAN-070 S3).
 *
 * **아직 판정하지 않는다.** 골격만 서 있고 채우는 것은 `S3` 이다.
 * 완료 기준: 드리프트 71 · 토큰 밖 580 을 보고하고,
 * `scripts/fixtures/tokens/reference/s4-classify.json` 의 `rows` 와
 * (axis, prop, value, file, line, verdict) 여섯 쪽으로 차집합이 0.
 *
 * 채울 때 잊지 말 것 셋:
 *   D1 같은 표기 · D2 대소문자만 다름 · D3 `rgba` 전개 — 셋 다 드리프트다.
 *   D3 은 문자열 비교로 안 잡힌다(`rgba(32,38,74,.45)` ↔ `--ink #20264A`).
 */
import type { AxisModule, AxisResult, ScanContext } from "./types.ts";

export const color: AxisModule = {
  id: "color",
  what: "색 · radius · 선 굵기 — tokens.css 대비",
  run(_ctx: ScanContext): AxisResult {
    return { id: "color", verdicts: [], failures: [],
             notes: ["색 축: 미구현 — S3 이 채운다."] };
  },
};
