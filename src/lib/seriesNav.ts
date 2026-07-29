// 시리즈 네비게이션 헬퍼 — PostNav(이전화/다음화) · SeriesEpisodes(에피소드 카드)의 단일 소스
import type { CollectionEntry } from "astro:content";

type Post = CollectionEntry<"posts">;

/** 같은 시리즈 글을 order(없으면 pubDate) 오름차순으로 반환 */
export function getSeriesPosts(current: Post, allPosts: Post[]): Post[] {
  if (!current.data.series) return [];
  return allPosts
    .filter((p) => p.data.series === current.data.series)
    .sort(
      (a, b) =>
        (a.data.order ?? Number.MAX_SAFE_INTEGER) -
          (b.data.order ?? Number.MAX_SAFE_INTEGER) ||
        a.data.pubDate.getTime() - b.data.pubDate.getTime(),
    );
}

/** 에피소드 번호 (order 우선, 없으면 시리즈 내 위치) */
export function episodeNumber(post: Post, seriesPosts: Post[]): number {
  if (post.data.order != null) return post.data.order;
  return seriesPosts.findIndex((p) => p.id === post.id) + 1;
}

export interface SeriesBadge {
  /** 시리즈 이름 */
  name: string;
  /** 이 글의 회차 */
  n: number;
  /** 시리즈 전체 편수. **모르면 null** — 라벨에서 `??` 로 표시한다. */
  total: number | null;
}

/**
 * 글 목록 아이템에 붙는 시리즈 라벨 정보 (KAN-054).
 *
 * `allPosts` 는 반드시 **컬렉션 전체**를 넘긴다 — 카테고리 페이지나 필터로 걸러진
 * 부분집합을 넘기면 전체 편수가 목록에 따라 달라져 "04 / 06" 이 거짓말을 한다.
 *
 * 총 편수는 **발행된 글 수**로 세므로, 발행분이 1편뿐이면 "단편 시리즈"인지
 * "연재 시작"인지 구분할 수 없다. 그때는 `01 / 01`(완결처럼 보임) 대신 total 을
 * null 로 돌려 `??` 로 표시한다. 발행분이 2편 이상이면 실제 편수를 쓴다.
 */
export function getSeriesBadge(
  post: Post,
  allPosts: Post[],
): SeriesBadge | null {
  const name = post.data.series;
  if (!name) return null;
  const seriesPosts = getSeriesPosts(post, allPosts);
  if (seriesPosts.length === 0) return null;
  return {
    name,
    n: episodeNumber(post, seriesPosts),
    total: seriesPosts.length >= 2 ? seriesPosts.length : null,
  };
}

export interface PrevNext {
  prev: Post | null;
  next: Post | null;
  /** true면 시리즈 내 순서 기준, false면 전체 글 발행일 기준 */
  inSeries: boolean;
}

/** 이전화/다음화 — 시리즈 글은 시리즈 순서, 그 외는 발행일 기준 */
export function getPrevNext(current: Post, allPosts: Post[]): PrevNext {
  const seriesPosts = getSeriesPosts(current, allPosts);
  if (seriesPosts.length > 1) {
    const i = seriesPosts.findIndex((p) => p.id === current.id);
    return {
      prev: i > 0 ? seriesPosts[i - 1] : null,
      next: i >= 0 && i < seriesPosts.length - 1 ? seriesPosts[i + 1] : null,
      inSeries: true,
    };
  }
  const sorted = [...allPosts].sort(
    (a, b) =>
      a.data.pubDate.getTime() - b.data.pubDate.getTime() ||
      a.id.localeCompare(b.id),
  );
  const i = sorted.findIndex((p) => p.id === current.id);
  return {
    prev: i > 0 ? sorted[i - 1] : null,
    next: i >= 0 && i < sorted.length - 1 ? sorted[i + 1] : null,
    inSeries: false,
  };
}
