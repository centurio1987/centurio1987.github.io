// RSS 피드 단일 소스 (KAN-047).
//
// 전체 피드(`/rss.xml`)와 카테고리별 피드(`/categories/<slug>/rss.xml`)가 같은
// 아이템 변환을 공유한다. 채널 메타·아이템 조립을 여기 한 곳에 모아 둔 이유는,
// 피드가 두 군데 이상에서 생성되는 순간 "전체 피드엔 저자가 있는데 카테고리
// 피드엔 없다" 같은 조용한 어긋남이 생기기 때문이다.
//
// **본문 전문을 싣지 않는다.** 글이 MDX 라 본문에 React 아일랜드(viz 도식·인터랙티브
// 시뮬)가 섞여 있는데, 그것들은 리더 안에서 스크립트가 죽은 채 껍데기만 남는다.
// 그래서 피드는 **표지 + 요약 + 시리즈 위치**까지만 싣고 본문은 사이트로 보낸다
// (`FEED_NOTE` 참고). 전문 배급이 필요해지면 Container API 로 렌더한 HTML 을
// sanitize 해 `content` 에 넣는 확장 지점이 `toFeedItem` 하나뿐이다.

import fs from "node:fs";
import path from "node:path";
import type { CollectionEntry } from "astro:content";
import type { RSSFeedItem } from "@astrojs/rss";
import { getAuthor } from "./authors";
import { getCategory } from "./categories";
import { getSeriesBadge } from "./seriesNav";
import { postUrl } from "./urls";

type Post = CollectionEntry<"posts">;

/** 피드 채널 제목/설명 — 사이트 메타(BaseLayout)와 같은 문구를 쓴다. */
export const FEED_TITLE = "빵관 토니";
export const FEED_DESCRIPTION =
  "진지함 속에서 즐거움을 찾다. 기획 · 아키텍처 · 설계에 관한 글을 굽습니다.";
export const FEED_LANGUAGE = "ko";

/** 전체 피드 경로. 확장자가 있으므로 트레일링 슬래시를 붙이지 않는다. */
export const FEED_URL = "/rss.xml";

/** 카테고리 피드 경로. */
export function categoryFeedUrl(slug: string): string {
  return `/categories/${slug}/rss.xml`;
}

/**
 * 피드에 싣는 최대 글 수.
 *
 * 상한이 없으면 글이 쌓일수록 피드 XML 이 무한정 커진다 — 리더는 매 폴링마다
 * 전량을 다시 받으므로 그 비용이 발행 수에 비례해 늘어난다. 50 은 현재 발행량
 * (약 30편) 기준 수년치 여유이고, 넘어간 옛 글은 사이트/사이트맵에 그대로 남는다.
 */
export const FEED_MAX_ITEMS = 50;

const MIME_BY_EXT: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

/**
 * 글의 표지 이미지(`/images/<slug>/hero.webp`)를 찾아 URL·바이트 크기를 돌려준다.
 *
 * RSS `<enclosure>` 는 `length`(바이트)가 **필수**라 실제 파일을 stat 해야 한다.
 * 없는 글도 있으므로(표지 미제작) 못 찾으면 null — 그 글은 enclosure 없이 나간다.
 * 빌드 타임에만 도는 조회다(SeriesEpisodes.astro 의 썸네일 조회와 같은 방식).
 */
function heroOf(slug: string): { url: string; length: number; type: string } | null {
  for (const ext of Object.keys(MIME_BY_EXT)) {
    const file = path.join(process.cwd(), "public", "images", slug, `hero${ext}`);
    try {
      const stat = fs.statSync(file);
      if (stat.isFile()) {
        return {
          url: `/images/${slug}/hero${ext}`,
          length: stat.size,
          type: MIME_BY_EXT[ext],
        };
      }
    } catch {
      // 없으면 다음 확장자로
    }
  }
  return null;
}

/** XML 텍스트 노드에 그대로 끼워 넣기 전에 최소 이스케이프. */
function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 절대 URL — 피드 안의 링크·이미지는 리더가 어디서 열든 깨지면 안 되므로 항상 절대경로다. */
function abs(pathname: string, site: URL | undefined): string {
  return site ? new URL(pathname, site).href : pathname;
}

/**
 * 글 하나를 RSS 아이템으로. `allPosts` 는 **컬렉션 전체**를 넘긴다 —
 * 시리즈 회차(`03 / 07`)를 세는 데 쓰이므로 부분집합을 넘기면 편수가 거짓말을 한다.
 */
export function toFeedItem(
  post: Post,
  allPosts: Post[],
  site: URL | undefined,
): RSSFeedItem {
  const slug = post.id.replace(/\.(md|mdx)$/, "");
  const link = postUrl(post.id);
  const linkAbs = abs(link, site);
  const category = getCategory(post.data.category);
  const author = getAuthor(post.data.author);
  const badge = getSeriesBadge(post, allPosts);
  const hero = heroOf(slug);
  const description = post.data.description ?? post.data.title;

  const seriesLine = badge
    ? `${badge.name} · EP ${String(badge.n).padStart(2, "0")}${
        badge.total ? ` / ${String(badge.total).padStart(2, "0")}` : ""
      }`
    : null;

  // 요약 카드 HTML. 리더마다 지원 태그가 달라 <p>/<a>/<img>/<em> 만 쓴다.
  const content = [
    hero
      ? `<p><a href="${linkAbs}"><img src="${abs(hero.url, site)}" alt="${xmlEscape(post.data.title)}" /></a></p>`
      : "",
    seriesLine ? `<p><em>${xmlEscape(seriesLine)}</em></p>` : "",
    `<p>${xmlEscape(description)}</p>`,
    `<p><a href="${linkAbs}">전문 보기 →</a></p>`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    title: post.data.title,
    description,
    link,
    pubDate: post.data.pubDate,
    // 카테고리 라벨을 먼저, 그다음 태그. 리더의 키워드 필터가 읽는 자리다.
    categories: [category.label, ...post.data.tags],
    // RSS 의 <author> 는 스펙상 **이메일 주소**라 이름을 넣으면 피드 검증기가 문다.
    // 사람이 읽는 저자명은 Dublin Core 의 dc:creator 로 낸다(워드프레스 관례).
    customData: `<dc:creator>${xmlEscape(author.name)}</dc:creator>`,
    content,
    ...(hero
      ? { enclosure: { url: abs(hero.url, site), length: hero.length, type: hero.type } }
      : {}),
  };
}

/** 피드에 실을 글을 최신순으로 정렬하고 상한까지 자른다. */
export function sortForFeed(posts: Post[]): Post[] {
  return [...posts]
    .sort(
      (a, b) =>
        b.data.pubDate.valueOf() - a.data.pubDate.valueOf() ||
        b.id.localeCompare(a.id),
    )
    .slice(0, FEED_MAX_ITEMS);
}

/**
 * 채널 레벨 커스텀 데이터.
 *
 * - `language` — 리더가 본문 언어를 안다(한국어 타이포·번역 제안).
 * - `atom:link rel="self"` — 피드 자신의 정본 주소. 리더가 피드를 옮겨 다녀도
 *   같은 구독으로 인식하게 해 주는 항목이라 검증기가 없으면 경고한다.
 * - `lastBuildDate` — 최신 글 발행 시각. 빌드 시각을 쓰면 글이 안 바뀐 재배포에도
 *   값이 흔들려 리더가 갱신으로 오인하므로, **콘텐츠에서 유도되는 값**만 쓴다.
 */
export function feedChannelData(feedPath: string, posts: Post[], site: URL | undefined): string {
  const parts = [
    `<language>${FEED_LANGUAGE}</language>`,
    `<atom:link href="${abs(feedPath, site)}" rel="self" type="application/rss+xml" />`,
  ];
  const latest = posts[0]?.data.pubDate;
  if (latest) parts.push(`<lastBuildDate>${latest.toUTCString()}</lastBuildDate>`);
  return parts.join("");
}

/** 피드 XML 에 선언할 네임스페이스 (dc:creator · atom:link 용). */
export const FEED_XMLNS = {
  dc: "http://purl.org/dc/elements/1.1/",
  atom: "http://www.w3.org/2005/Atom",
};

/** 피드가 요약만 싣는다는 사실을 사람이 읽는 자리(구독 안내)에 쓰는 문구. */
export const FEED_NOTE = "표지와 요약이 실립니다 — 본문은 사이트에서 이어 읽습니다.";
