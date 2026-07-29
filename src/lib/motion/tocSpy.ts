/**
 * tocSpy.ts — 포스트 우측 목차 레일의 "지금 읽는 절" 추적 (KAN-050).
 *
 * 진행적 향상이다. 목차 자체는 PostToc.astro 가 서버에서 그린 순수 앵커 링크라
 * 이 파일이 없거나 실패해도 "보여주고 클릭 이동"은 그대로 동작한다. 여기서 얹는 건
 * 활성 항목 하이라이트 하나뿐이다.
 *
 * 왜 IntersectionObserver 를 안 쓰는가:
 *   IO 는 reveal.ts 처럼 "한 번 들어오면 끝"인 관측에 맞는 도구다. 스파이는 연속
 *   추적이고, 활성 판정은 어차피 "임계선 위 마지막 헤딩"이라는 위치 계산이라
 *   IO 를 껴봐야 트리거 역할만 남아 코드가 늘어난다(교차 헤딩이 하나도 없는
 *   긴 섹션 구간에서 하이라이트가 비는 고전적 버그도 따라온다).
 *   헤딩은 글당 최대 30개라 매 프레임 rect 를 훑는 편이 단순하고 정확하다.
 *
 * 레일의 DOM 계약만 본다:
 *   .post-toc         레일 루트   ·  [data-toc-scroll]  실제 스크롤되는 박스
 *   a[data-slug]      항목        ·  .is-active         활성 표시
 *
 * 계약(reveal.ts 와 동일):
 *   - 멱등: 몇 번 호출해도 이전 리스너·rAF 를 먼저 걷어내고 다시 건다.
 *   - astro:page-load 재바인딩: ClientRouter 가 켜져 있어 모듈 스크립트는 재실행되지
 *     않는다. 목차가 없는 페이지로 넘어가면 건 것 없이 해제 상태로 끝낸다
 *     (죽은 DOM 을 붙잡고 매 스크롤 프레임을 도는 누수 방지).
 *   - 예외 시 조용히 물러난다 — 콘텐츠를 절대 건드리지 않는다.
 */

const ACTIVE_CLASS = "is-active";
/** 서브픽셀·반올림 여유. 착지 지점과 임계선이 같은 값이라 등호에서 갈리지 않게. */
const ACTIVATE_EPS = 2;

/**
 * 헤딩이 이 선을 넘어가면 "그 절을 읽는 중"으로 본다.
 *
 * 값의 출처가 중요하다 — 헤딩의 **scroll-margin-top 을 그대로 읽는다**. 목차를 클릭하면
 * 브라우저가 그 헤딩을 정확히 scroll-margin-top 위치에 세우므로, 임계선이 그보다 조금이라도
 * 위에 있으면 방금 도착한 헤딩이 "아직 안 지나갔다"로 세어져 **직전 절이 활성으로 남는다**
 * (헤더 높이에 임의의 패딩을 더해 쓰던 초기 구현이 딱 이 8px 차이로 어긋났다).
 * CSS 한 곳(PostLayout 의 .prose 헤딩 규칙)만 고쳐도 둘이 같이 움직이게 여기서 파생시킨다.
 */
let anchorLine = 0;

let headings: HTMLElement[] = [];
let links = new Map<string, HTMLAnchorElement>();
let rail: HTMLElement | null = null;
/** 레일 안에서 실제로 스크롤되는 박스. A안은 레일 자신, b1안은 안쪽 패널이다. */
let scroller: HTMLElement | null = null;
let activeSlug: string | null = null;
let frame = 0;
let bound = false;
let listenerBound = false;

function headerHeight(): number {
  const header = document.querySelector<HTMLElement>(".site-header");
  return header ? Math.round(header.getBoundingClientRect().height) : 61;
}

/**
 * 실제 헤더 높이를 CSS 변수로 흘려보낸다. 토큰의 정적 61px 은 무JS 폴백이고,
 * 여기서 덮어써야 앵커 오프셋(scroll-margin-top)과 레일 top 이 실측을 따른다.
 */
function syncHeaderVar(): void {
  document.documentElement.style.setProperty("--header-h", `${headerHeight()}px`);
}

/**
 * 임계선을 다시 잰다. --header-h 를 흘려보낸 **뒤에** 불러야 한다 — scroll-margin-top 이
 * 그 변수로 계산되기 때문이다. 헤딩마다 같은 규칙(.prose :is(h2,h3))을 받으므로 하나만
 * 재면 되고, 매 프레임 getComputedStyle 을 도는 대신 초기화·리사이즈에만 갱신한다.
 */
function measureAnchorLine(): void {
  const sm = headings[0] ? parseFloat(getComputedStyle(headings[0]).scrollMarginTop) : NaN;
  anchorLine = (Number.isFinite(sm) && sm > 0 ? sm : headerHeight() + 16) + ACTIVATE_EPS;
}

/**
 * 활성 항목이 레일 밖으로 나가면 레일'만' 스크롤한다. scrollIntoView 는 페이지까지 끌고 간다.
 *
 * offsetTop 이 아니라 rect 차이로 계산하는 이유: 레일이 position:fixed 라 그 자신의
 * offsetParent 는 null 이고 offsetTop 은 뷰포트 기준값이 나온다(= 레일의 top). 반면
 * 자식 링크의 offsetTop 은 레일 기준이라, 둘을 빼면 좌표계가 뒤섞여 항상 음수가 된다.
 * rect 는 어느 쪽이 컨테이닝 블록이든 같은 좌표계다.
 */
function keepInView(link: HTMLAnchorElement): void {
  const box = scroller;
  if (!box || box.scrollHeight <= box.clientHeight) return;
  const lr = link.getBoundingClientRect();
  const br = box.getBoundingClientRect();
  const top = lr.top - br.top + box.scrollTop; // 스크롤 콘텐츠 좌표계의 항목 위치
  const bottom = top + lr.height;
  if (top < box.scrollTop + 8) {
    box.scrollTop = top - 8;
  } else if (bottom > box.scrollTop + box.clientHeight - 8) {
    box.scrollTop = bottom - box.clientHeight + 8;
  }
}

function setActive(slug: string | null): void {
  if (slug === activeSlug) return;
  if (activeSlug) {
    const prev = links.get(activeSlug);
    prev?.classList.remove(ACTIVE_CLASS);
    prev?.removeAttribute("aria-current");
  }
  activeSlug = slug;
  if (!slug) return;
  const next = links.get(slug);
  if (!next) return;
  next.classList.add(ACTIVE_CLASS);
  next.setAttribute("aria-current", "true");
  keepInView(next);
}

/**
 * 지금 활성인 항목을 레일 안으로 끌어온다. 레일이 접혔다 펼쳐지는 순간에 필요하다 —
 * 접힘(눈금만)은 대개 넘치지 않아 스크롤이 0인데, 펼치면 항목이 두 배 가까이 높아져
 * 넘친다. setActive 는 활성이 '바뀔 때'만 도니, 펼침만으로는 아무도 스크롤을 옮기지
 * 않아 "지금 어디"를 보려고 펼친 사람이 목록 맨 위에 착지하게 된다.
 */
export function revealActive(): void {
  if (!activeSlug) return;
  const link = links.get(activeSlug);
  if (link) keepInView(link);
}

/** 임계선 위에 있는 마지막 헤딩 = 지금 읽는 절. 하나도 없으면(문서 최상단) 첫 번째. */
function recompute(): void {
  let current: HTMLElement | null = headings[0] ?? null;
  for (const h of headings) {
    if (h.getBoundingClientRect().top <= anchorLine) current = h;
    else break;
  }
  setActive(current?.id ?? null);
}

function onScroll(): void {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    recompute();
  });
}

function onResize(): void {
  syncHeaderVar();
  measureAnchorLine(); // 헤더가 접히거나 폰트가 바뀌면 착지 지점도 따라 움직인다
  onScroll();
}

function teardown(): void {
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  if (bound) {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    bound = false;
  }
  headings = [];
  links = new Map();
  rail = null;
  scroller = null;
  activeSlug = null;
}

export function initTocSpy(): void {
  try {
    teardown();

    // 재바인딩은 '가장 먼저' 건다. 이 글에 목차가 없어도(헤딩 2개 미만) 다음 글에는
    // 있을 수 있는데, 여기서 일찍 return 하면 그 뒤로 영영 되살아나지 못한다.
    if (!listenerBound) {
      document.addEventListener("astro:page-load", initTocSpy);
      listenerBound = true;
    }

    rail = document.querySelector<HTMLElement>(".post-toc");
    if (!rail) return; // 목차 없는 페이지 — 아무것도 걸지 않는다
    // 실제로 스크롤되는 건 레일 루트가 아니라 안쪽 패널이다(루트는 hover 히트영역용
    // 여백까지 포함한 껍데기라 넘침이 없다).
    scroller = rail.querySelector<HTMLElement>("[data-toc-scroll]") ?? rail;

    // 앵커의 href 를 파싱하지 않고 data-slug 를 읽는다. 한글 slug 는 브라우저가
    // href 를 퍼센트 인코딩해 돌려줄 수 있어(getAttribute 는 원문이지만 .hash 는 아니다)
    // 서버가 심어둔 원문을 그대로 쓰는 편이 어긋날 여지가 없다.
    for (const a of rail.querySelectorAll<HTMLAnchorElement>("a[data-slug]")) {
      links.set(a.dataset.slug!, a);
    }

    // 문서 순서대로 수집한다 — recompute 의 "마지막" 판정이 순서에 의존한다.
    headings = [
      ...document.querySelectorAll<HTMLElement>(".prose :is(h2, h3)[id]"),
    ].filter((h) => links.has(h.id));
    if (headings.length === 0) {
      rail = null;
      scroller = null;
      return;
    }

    syncHeaderVar();
    measureAnchorLine();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    bound = true;
    recompute();
  } catch {
    teardown(); // 하이라이트만 포기한다. 목차 링크는 그대로 산다.
  }
}
