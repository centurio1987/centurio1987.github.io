// 카테고리별 RSS 피드 — `/categories/<slug>/rss.xml` (KAN-047).
//
// 카테고리 페이지(`[category].astro`)와 같은 디렉터리에 나란히 떨어진다
// (`/categories/planning/index.html` 옆의 `/categories/planning/rss.xml`).
// 왜 나누나: 이 블로그의 글은 기획부터 커널 해부까지 폭이 넓어, 특정 갈래만
// 따라 읽고 싶은 구독자에게 전체 피드는 소음이 된다. 카테고리는 이미 정본
// 분류(src/lib/categories.ts)이므로 여기에 얹는 것이 새 축을 만드는 것보다 싸다.
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { CATEGORIES, getCategory } from "../../../lib/categories";
import {
  FEED_TITLE,
  FEED_XMLNS,
  categoryFeedUrl,
  feedChannelData,
  sortForFeed,
  toFeedItem,
} from "../../../lib/feed";

export async function getStaticPaths() {
  const all = await getCollection("posts", ({ data }) => !data.draft);
  // 글이 없는 카테고리도 빈 피드를 낸다 — 카테고리 페이지 자체가 항상 존재하므로
  // (그 페이지의 구독 링크가 404 로 떨어지지 않게), 첫 글이 실리면 조용히 채워진다.
  return CATEGORIES.map((cat) => ({
    params: { category: cat.slug },
    props: { slug: cat.slug, all },
  }));
}

export async function GET(context: APIContext) {
  const { slug, all } = context.props as {
    slug: string;
    all: Awaited<ReturnType<typeof getCollection<"posts">>>;
  };
  const meta = getCategory(slug);
  const posts = sortForFeed(all.filter((p) => p.data.category === slug));

  return rss({
    title: `${FEED_TITLE} — ${meta.label}`,
    description: `${meta.label} 카테고리의 글 모음`,
    site: context.site!,
    xmlns: FEED_XMLNS,
    customData: feedChannelData(categoryFeedUrl(slug), posts, context.site),
    // 회차 표기는 컬렉션 전체(all)를 기준으로 센다 — 카테고리로 거른 부분집합을
    // 넘기면 같은 시리즈가 목록마다 다른 편수로 보인다(seriesNav.ts 주석 참고).
    items: posts.map((post) => toFeedItem(post, all, context.site)),
  });
}
