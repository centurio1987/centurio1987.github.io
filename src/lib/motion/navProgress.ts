/**
 * navProgress.ts — View Transitions 네비게이션 진행 표시 (KAN-055).
 *
 * 왜 필요한가 (실측 근거):
 *   <ClientRouter /> 가 켜져 있으면 링크 클릭이 SPA 네비게이션으로 처리되어 **브라우저
 *   기본 로딩 표시가 뜨지 않는다.** 그동안 이전 화면이 그대로 남아 있어 "클릭했는데
 *   멈췄다"로 인지된다. 프로덕션·Fast 3G·가장 무거운 글 기준 무피드백 구간이 1985ms 였고,
 *   리다이렉트를 없애고 prefetch 까지 완료된 최선의 경우에도 653ms 가 남는다.
 *
 * 왜 이 방식이 통하는가:
 *   같은 구간을 rAF 로 재보니 프레임 167개 · 최대 간격 9ms · 50ms 초과 0건이었다.
 *   즉 대기 중 메인스레드는 **놀고 있다**. 그래서 진행 바가 끊기지 않고 60fps 로 돈다
 *   (메인스레드가 막혀 있었다면 스피너가 얼어붙어 오히려 더 나빠 보였을 것이다).
 *
 * 동작:
 *   before-preparation → SHOW_DELAY_MS 뒤에 바를 띄우고 90%까지 점근 진행 +
 *                        클릭한 카드를 흐리게(어디를 눌렀는지 되돌려 보여준다)
 *   after-swap/page-load → 100%로 채우고 사라진다
 *   SHOW_DELAY_MS 안에 끝나면 아예 뜨지 않는다 → 빠른 네비게이션에서 깜빡임 없음
 *
 * 접근성: 바는 aria-hidden. 페이지 전환 안내는 Astro 라우터의 announcer 가 이미 하므로
 * 중복 낭독을 만들지 않는다. reduced-motion 이면 점근 애니메이션 없이 상태만 바꾼다.
 */

const BAR_ID = "nav-progress";
const DIM_CLASS = "is-nav-source";
/** 이 시간 안에 끝나는 네비게이션은 표시하지 않는다(깜빡임 방지). */
const SHOW_DELAY_MS = 180;
/** 완료 전까지 도달할 수 있는 최대 진행률 — 끝을 남겨둬야 "아직 진행 중"으로 읽힌다. */
const CEILING = 0.9;

let bound = false;
let showTimer: ReturnType<typeof setTimeout> | undefined;
let creepTimer: ReturnType<typeof setInterval> | undefined;
let hideTimer: ReturnType<typeof setTimeout> | undefined;
let progress = 0;
let dimmed: Element | null = null;

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function bar(): HTMLElement | null {
  return document.getElementById(BAR_ID);
}

function paint(): void {
  const el = bar();
  if (el) el.style.setProperty("--p", String(progress));
}

function clearTimers(): void {
  clearTimeout(showTimer);
  clearInterval(creepTimer);
  clearTimeout(hideTimer);
  showTimer = creepTimer = hideTimer = undefined;
}

function undim(): void {
  dimmed?.classList.remove(DIM_CLASS);
  dimmed = null;
}

function start(sourceElement?: Element): void {
  // 이전 네비게이션이 정리되기 전에 새 네비게이션이 시작될 수 있다(빠른 연타).
  clearTimers();
  undim();

  progress = 0;
  paint();

  // 클릭한 링크를 흐리게 — "이 글로 가는 중"을 클릭 지점에서 되돌려 보여준다.
  const anchor = sourceElement?.closest?.("a") ?? null;
  if (anchor) {
    dimmed = anchor;
    anchor.classList.add(DIM_CLASS);
  }

  showTimer = setTimeout(() => {
    const el = bar();
    if (!el) return;
    el.dataset.state = "loading";
    if (prefersReducedMotion()) {
      // 점근 애니메이션 없이 "진행 중"임만 정적으로 보여준다.
      progress = 0.5;
      paint();
      return;
    }
    // 실제 진행률을 알 수 없으므로 남은 거리의 일정 비율씩 좁혀 90%로 점근시킨다.
    creepTimer = setInterval(() => {
      progress += (CEILING - progress) * 0.12;
      paint();
    }, 100);
  }, SHOW_DELAY_MS);
}

function finish(): void {
  clearTimers();
  undim();

  const el = bar();
  if (!el) return;

  // 한 번도 뜨지 않았으면 조용히 접는다(깜빡임 방지).
  if (el.dataset.state !== "loading") {
    progress = 0;
    paint();
    el.dataset.state = "idle";
    return;
  }

  progress = 1;
  paint();
  el.dataset.state = "done";
  hideTimer = setTimeout(() => {
    const e2 = bar();
    if (!e2) return;
    e2.dataset.state = "idle";
    progress = 0;
    paint();
  }, 260);
}

/** 멱등 — 몇 번 호출해도 리스너는 한 번만 붙는다(document 는 스왑에도 살아남는다). */
export function initNavProgress(): void {
  if (bound) return;
  bound = true;

  document.addEventListener("astro:before-preparation", (e) => {
    start((e as unknown as { sourceElement?: Element }).sourceElement);
  });
  // 스왑이 끝나면 새 문서가 이미 화면에 있다 — 이때 바를 닫는다.
  document.addEventListener("astro:after-swap", finish);
  // 네비게이션이 취소·실패해 스왑까지 못 간 경우의 안전망.
  document.addEventListener("astro:page-load", finish);
}
