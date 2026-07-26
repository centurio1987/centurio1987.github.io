/**
 * reveal.ts — 스크롤 진입 리빌용 공유 IntersectionObserver (콘텐츠 무JS 유지).
 *
 * [data-reveal] 요소가 뷰포트에 들어오면 [data-reveal-visible]을 세팅하고, motion.css의
 * 리빌 계약이 진입 애니(bbangto-slide-in / draw-on)를 재생한다. 관측을 이 한 조각의
 * 공유 IO로만 처리해 본문에 하이드레이션을 0으로 유지한다.
 *
 * 안전 원칙(콘텐츠는 절대 숨기지 않는다):
 *  - 숨김(opacity:0)은 <html class="reveal-ready"> 뒤에만 활성. reveal-ready 는 모션
 *    허용 + IO 지원일 때만 붙는다(1차: BaseLayout head 인라인 스크립트가 페인트 전 선-부착,
 *    2차: 여기 initReveal 이 멱등 보강). 무JS/reduced-motion/IO 미지원/예외 시 클래스가
 *    없어 콘텐츠가 항상 보인다.
 *  - reduced-motion 이면 arm 하지 않고 즉시 return(reveal-ready 제거).
 *  - 예외/IO 미지원 시 reveal-ready 제거 = 전부 표시.
 *  - 안전 타임아웃(3s): 관측이 어긋나도 미표시분을 강제 표시.
 *
 * 멱등: astro:page-load(Phase B ClientRouter) 마다 재호출돼도 observer 를 disconnect 후
 * 재생성하고, 이미 보인 요소는 스킵하며, document 리스너는 1회만 바인딩한다.
 */

const REVEAL_ATTR = "data-reveal";
const VISIBLE_ATTR = "data-reveal-visible";
const READY_CLASS = "reveal-ready";
const SAFETY_MS = 3000;

let observer: IntersectionObserver | null = null;
let listenerBound = false;
let safetyTimer: ReturnType<typeof setTimeout> | undefined;

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function markVisible(el: Element): void {
  el.setAttribute(VISIBLE_ATTR, "");
}

/** reveal-ready 제거 → opacity:0 규칙이 비활성 → 모든 [data-reveal] 이 보인다. */
function revealAll(): void {
  document.documentElement.classList.remove(READY_CLASS);
}

/**
 * 현재 문서의 미관측 [data-reveal] 을 관측 시작한다. 멱등하게 몇 번이든 호출 가능.
 */
export function initReveal(): void {
  try {
    // ① reduced-motion: 애니 없이 콘텐츠만 즉시 표시(arm 하지 않음).
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      revealAll();
      return;
    }

    // ② reveal-ready 보강(head 인라인 스크립트가 이미 붙였으면 no-op).
    document.documentElement.classList.add(READY_CLASS);

    // 멱등: 새 페이지(VT)의 요소를 위해 기존 observer 를 정리 후 재생성.
    observer?.disconnect();
    observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            markVisible(entry.target);
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    document
      .querySelectorAll<HTMLElement>(`[${REVEAL_ATTR}]`)
      .forEach((el) => {
        if (el.hasAttribute(VISIBLE_ATTR)) return; // 이미 보인 것 스킵
        observer!.observe(el);
      });

    // 안전 타임아웃: 아직 미표시인 요소는 강제 표시(관측 실패 대비).
    clearTimeout(safetyTimer);
    safetyTimer = setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>(
          `[${REVEAL_ATTR}]:not([${VISIBLE_ATTR}])`,
        )
        .forEach(markVisible);
    }, SAFETY_MS);

    // ④ VT 후 새 페이지에 재바인딩 — 리스너는 1회만(누수 방지).
    if (!listenerBound) {
      document.addEventListener("astro:page-load", initReveal);
      listenerBound = true;
    }
  } catch {
    revealAll(); // 예외 시 콘텐츠 절대 숨기지 않음
  }
}
