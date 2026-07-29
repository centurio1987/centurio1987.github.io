/**
 * tocFloat.ts — 플로팅 목차 레일(PostToc)의 "토글" 동작 (KAN-050).
 *
 * 펼침의 주 경로는 CSS 다 — :hover 와 :focus-within 이 마우스·키보드를 모두 덮으므로
 * 이 파일이 없어도 데스크톱에서는 완전히 동작한다. 여기서 보태는 건 **hover 가 없는
 * 입력**(터치·펜) 하나뿐이다:
 *   - 접힌 상태의 첫 탭은 점프하지 않고 펼치기만 한다(눈금만 보고 어디로 갈지 고를 수
 *     없으니 첫 탭에 이동하면 반드시 오폭이 난다). 두 번째 탭부터 평소처럼 앵커 이동.
 *   - 바깥 탭 · Esc 로 닫는다.
 *
 * 여기에 하나 더 있다: 펼침이 **끝난 뒤** 지금 읽는 절을 레일 안으로 끌어온다. 접힘은
 * 눈금만이라 대개 넘치지 않지만 펼치면 항목 높이가 두 배가 돼 넘치기 때문이다.
 * 폭 트랜지션이 끝난 뒤에 재야 한다 — 시작 시점엔 아직 안 넘쳐서 계산이 no-op 이 된다.
 *
 * 계약은 tocSpy.ts 와 같다 — 멱등, astro:page-load 재바인딩, 예외 시 조용히 물러남.
 */

import { revealActive } from "./tocSpy";

const OPEN_CLASS = "is-open";

let rail: HTMLElement | null = null;
let panel: HTMLElement | null = null;
let bound = false;
let listenerBound = false;

/** hover 가 없는 입력에서만 "첫 탭 = 펼치기" 규칙을 쓴다. */
function isCoarse(): boolean {
  return window.matchMedia("(hover: none)").matches;
}

function close(): void {
  rail?.classList.remove(OPEN_CLASS);
}

/** reduced-motion 이면 폭 전환이 없어 transitionend 가 영영 안 온다 — 그 경우엔
 *  다음 프레임에 이미 최종 레이아웃이라 여기서 끝난다. 전환이 있는 경우엔 아직
 *  넘치지 않아 조용히 no-op 이 되고, transitionend 가 마저 처리한다. */
function scheduleReveal(): void {
  requestAnimationFrame(revealActive);
}

function onRailPointerDown(e: Event): void {
  if (!rail || !isCoarse()) return;
  if (rail.classList.contains(OPEN_CLASS)) return;
  // 접힌 채로 눌렀다 — 펼치기만 하고 앵커 이동은 삼킨다.
  e.preventDefault();
  rail.classList.add(OPEN_CLASS);
  scheduleReveal();
}

function onDocPointerDown(e: Event): void {
  if (!rail) return;
  const target = e.target;
  if (target instanceof Node && rail.contains(target)) return;
  close();
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === "Escape") close();
}

/** 펼침이 끝나면(= 패널 폭 전환 종료) 현재 절을 보이는 자리로 끌어온다. 접힐 때도
 *  불리지만 그땐 넘치지 않아 keepInView 가 조용히 물러난다. */
function onPanelTransitionEnd(e: TransitionEvent): void {
  if (e.propertyName !== "width" || e.target !== panel) return;
  revealActive();
}

function teardown(): void {
  if (bound) {
    rail?.removeEventListener("pointerdown", onRailPointerDown);
    rail?.removeEventListener("pointerenter", scheduleReveal);
    rail?.removeEventListener("focusin", scheduleReveal);
    panel?.removeEventListener("transitionend", onPanelTransitionEnd);
    document.removeEventListener("pointerdown", onDocPointerDown);
    document.removeEventListener("keydown", onKeyDown);
    bound = false;
  }
  rail = null;
  panel = null;
}

export function initTocFloat(): void {
  try {
    teardown();

    // tocSpy 와 같은 이유로 재바인딩을 가장 먼저 건다 — 이 글에 목차가 없어도
    // 다음 글에는 있을 수 있다.
    if (!listenerBound) {
      document.addEventListener("astro:page-load", initTocFloat);
      listenerBound = true;
    }

    rail = document.querySelector<HTMLElement>(".post-toc");
    if (!rail) return;
    panel = rail.querySelector<HTMLElement>("[data-toc-scroll]");

    rail.addEventListener("pointerdown", onRailPointerDown);
    rail.addEventListener("pointerenter", scheduleReveal, { passive: true });
    rail.addEventListener("focusin", scheduleReveal, { passive: true });
    panel?.addEventListener("transitionend", onPanelTransitionEnd);
    document.addEventListener("pointerdown", onDocPointerDown, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    bound = true;
  } catch {
    teardown(); // CSS hover 경로는 그대로 산다.
  }
}
