// 내부 링크 URL 단일 소스 (KAN-055).
//
// Astro 의 기본 build.format 은 "directory" 라 모든 페이지가 `<경로>/index.html` 로
// 나온다. 그래서 정본(canonical) URL 은 **트레일링 슬래시가 붙은 형태**다. 링크를
// `/posts/foo` 로 적으면 GitHub Pages 가 `/posts/foo/` 로 **301 리다이렉트**하는데,
// 이 왕복 1회가 View Transitions 네비게이션에서 그대로 "클릭했는데 반응 없는 시간"
// 으로 쌓인다 — 프로덕션 Fast 3G 실측 기준 약 580ms(1985ms → 1406ms).
//
// 그러므로 내부 링크는 반드시 이 헬퍼로 만든다. 문자열로 직접 적지 않는다.

/** 포스트 URL. `post.id` 는 확장자를 포함할 수 있으므로(.md/.mdx) 함께 벗겨낸다. */
export function postUrl(id: string): string {
  return `/posts/${id.replace(/\.(md|mdx)$/, "")}/`;
}

/** 카테고리 목록 URL. */
export function categoryUrl(slug: string): string {
  return `/categories/${slug}/`;
}

/** 정적 최상위 경로들(전부 디렉터리 형식이므로 슬래시로 끝난다). */
export const HOME_URL = "/";
export const POSTS_URL = "/posts/";
export const GRAPH_URL = "/graph/";
