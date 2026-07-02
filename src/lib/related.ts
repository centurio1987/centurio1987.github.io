// 연관 글 하이브리드 랭킹: graphify 엣지 + frontmatter(series/tags/category) 시그널.
import type { CollectionEntry } from "astro:content";
import { getPostPair } from "./graph";

export interface RelatedReason {
  type: "series" | "concept" | "tag" | "category" | "recent";
  label: string;
}

export interface RelatedItem {
  post: CollectionEntry<"posts">;
  score: number;
  reasons: RelatedReason[];
}

const TOP_N = 4;
const MIN_FILL = 3;

export function getRelatedPosts(
  current: CollectionEntry<"posts">,
  allPosts: CollectionEntry<"posts">[],
): RelatedItem[] {
  const cur = current.data;
  const candidates = allPosts.filter((p) => p.id !== current.id);

  const scored = candidates.map((p) => {
    const d = p.data;
    const pair = getPostPair(current.id, p.id);
    const graphScore = pair?.score ?? 0;
    const sharedTags = d.tags.filter((t) => cur.tags.includes(t));
    const sameSeries = !!cur.series && d.series === cur.series;
    const adjacent =
      sameSeries &&
      cur.order != null &&
      d.order != null &&
      Math.abs(cur.order - d.order) === 1;

    const score =
      (sameSeries ? 3.0 : 0) +
      (adjacent ? 1.0 : 0) +
      2.5 * graphScore +
      0.5 * Math.min(sharedTags.length, 3) +
      (d.category === cur.category ? 0.5 : 0);

    // 이유 칩: series → 공유 개념 최대 2 → 공유 태그 최대 2 → (없을 때만) category
    const reasons: RelatedReason[] = [];
    if (sameSeries) reasons.push({ type: "series", label: cur.series! });
    for (const label of (pair?.sharedConcepts ?? []).slice(0, 2))
      reasons.push({ type: "concept", label });
    for (const label of sharedTags.slice(0, 2))
      reasons.push({ type: "tag", label });
    if (reasons.length === 0 && d.category === cur.category)
      reasons.push({ type: "category", label: d.category });

    return { post: p, score, reasons: reasons.slice(0, 3), pair };
  });

  const picked = scored
    .filter((s) => s.score > 0)
    .sort(
      (x, y) =>
        y.score - x.score ||
        (y.pair?.edgeCount ?? 0) - (x.pair?.edgeCount ?? 0) ||
        y.post.data.pubDate.getTime() - x.post.data.pubDate.getTime() ||
        x.post.id.localeCompare(y.post.id),
    )
    .slice(0, TOP_N);

  // 최소 보장: 3개 미만이면 최신 글(같은 카테고리 우선)로 패딩
  if (picked.length < MIN_FILL) {
    const pickedIds = new Set(picked.map((s) => s.post.id));
    const fillers = scored
      .filter((s) => !pickedIds.has(s.post.id))
      .sort(
        (x, y) =>
          Number(y.post.data.category === cur.category) -
            Number(x.post.data.category === cur.category) ||
          y.post.data.pubDate.getTime() - x.post.data.pubDate.getTime() ||
          x.post.id.localeCompare(y.post.id),
      )
      .slice(0, MIN_FILL - picked.length)
      .map((s) => ({ ...s, reasons: [{ type: "recent", label: "최근 글" } as RelatedReason] }));
    picked.push(...fillers);
  }

  return picked.map(({ post, score, reasons }) => ({ post, score, reasons }));
}
