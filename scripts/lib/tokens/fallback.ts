/**
 * `var(--x, fallback)` 자리 판정 — 대조 상대는 `s4-fallback.json` (KAN-070 S4).
 *
 * **아직 판정하지 않는다.** 골격만 서 있고 채우는 것은 `S4` 다.
 * 완료 기준: 일치 42 · 불일치 23(살아있는 4 · 죽은 19) · 제외 43.
 *
 * 이 축만 자체 스캔이 필요하다 — 공통 추출의 정규식이 `var(...)` 를 통째로 지우므로
 * fallback 값이 히트에 한 번도 안 들어온다. `ctx.files` 를 받아 따로 훑는다.
 *
 * 살아있음/죽음은 **적재 경로**가 가른다:
 *   `tokens.css` ← `global.css:1` ← `BaseLayout.astro:2` → 전 페이지에 있다 → fallback 은 죽은 값
 *   `deco.css` → 쓰는 쪽에서만 들여온다(`DECO_KIT.md:40`) → fallback 이 발동한다
 *
 * 스위치 토큰 다섯은 대조 제외다 — 값이 아니라 "기본 상태"라서:
 *   `--deco-op` · `--deco-t3` · `--deco-t4` · `--deco-wob` · `--shell-max`
 */
import type { AxisModule, AxisResult, ScanContext } from "./types.ts";

export const fallback: AxisModule = {
  id: "fallback",
  what: "var(--x, fallback) 108자리 — 값 일치와 발동 여부",
  run(_ctx: ScanContext): AxisResult {
    return { id: "fallback", verdicts: [], failures: [],
             notes: ["fallback 축: 미구현 — S4 가 채운다."] };
  },
};
