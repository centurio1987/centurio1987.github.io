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
