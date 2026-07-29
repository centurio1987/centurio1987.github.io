// 전체 RSS 피드 — `/rss.xml` (KAN-047).
//
// 정적 빌드라 이 엔드포인트도 빌드 타임에 한 번 돌아 dist/rss.xml 로 떨어진다.
// 조립 규칙은 전부 src/lib/feed.ts 에 있다 — 카테고리 피드와 같은 소스를 쓴다.
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import {
  FEED_DESCRIPTION,
  FEED_TITLE,
  FEED_URL,
  FEED_XMLNS,
  feedChannelData,
  sortForFeed,
  toFeedItem,
} from "../lib/feed";

export async function GET(context: APIContext) {
  const all = await getCollection("posts", ({ data }) => !data.draft);
  const posts = sortForFeed(all);

  return rss({
    title: FEED_TITLE,
    description: FEED_DESCRIPTION,
    site: context.site!,
    xmlns: FEED_XMLNS,
    customData: feedChannelData(FEED_URL, posts, context.site),
    // 회차 표기는 컬렉션 전체(all)를 기준으로 세야 편수가 맞는다.
    items: posts.map((post) => toFeedItem(post, all, context.site)),
  });
}
