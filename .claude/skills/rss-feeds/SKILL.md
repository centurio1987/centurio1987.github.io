---
name: rss-feeds
description: 이 블로그의 RSS 피드(`/rss.xml` 전체 · `/categories/<slug>/rss.xml` 카테고리별)를 고치거나 확장할 때 읽는다. `src/lib/feed.ts`·`src/pages/rss.xml.ts`·`src/pages/categories/[category]/rss.xml.ts`·`FeedLink.astro`·`BaseLayout` 의 `feeds` prop 을 손대거나, 피드에 본문 전문·새 항목·새 노출 지점을 넣으려 할 때 사용한다. 굳힌 판단(요약 피드인 이유, 회차 계산 기준, 상한, `dc:creator`, `lastBuildDate`)이 들어 있어 모르고 바꾸면 조용히 깨진다.
---

# RSS 피드 (KAN-047)

`@astrojs/rss` 기반 정적 피드. 빌드 타임에만 돌고 런타임 의존이 없다.

```
/rss.xml                          전체 피드 (src/pages/rss.xml.ts)
/categories/<slug>/rss.xml        카테고리별 피드 (src/pages/categories/[category]/rss.xml.ts)
src/lib/feed.ts                   채널 메타 · 아이템 조립 · 상한의 단일 소스
```

## 굳힌 판단

- **요약 피드다 — 본문 전문을 싣지 않는다.** 글이 MDX라 본문에 React 아일랜드(viz 도식·인터랙티브 시뮬)가 섞여 있는데 리더 안에서는 스크립트가 죽어 껍데기만 남는다. 그래서 아이템에는 **표지(enclosure + `content:encoded` 안의 `<img>`) · 요약(`description`) · 시리즈 회차 · 본문 링크**까지만 담는다. 전문 배급이 필요해지면 Container API 로 렌더한 HTML을 sanitize 해 넣는 확장 지점이 `toFeedItem` 하나뿐이다.
- **회차 표기는 항상 컬렉션 전체를 기준으로 센다.** 카테고리로 거른 부분집합을 `toFeedItem` 에 넘기면 같은 시리즈가 피드마다 다른 편수(`03 / 26` 같은)로 보인다 — `seriesNav.ts` 의 `getSeriesBadge` 주석과 같은 함정이다.
- **`FEED_MAX_ITEMS = 50`.** 리더는 매 폴링마다 피드 전량을 다시 받으므로 상한이 없으면 비용이 발행 수에 비례해 늘어난다. 넘어간 옛 글은 사이트·사이트맵에 그대로 남는다.
- **저자는 `<author>` 가 아니라 `dc:creator`.** RSS 스펙상 `<author>` 는 이메일 주소 자리라 이름을 넣으면 피드 검증기가 문다.
- **`lastBuildDate` 는 최신 글의 `pubDate`** — 빌드 시각을 쓰면 글이 안 바뀐 재배포에도 값이 흔들려 리더가 갱신으로 오인한다. 콘텐츠에서 유도되는 값만 쓴다.
- 글 없는 카테고리도 **빈 피드를 낸다.** 카테고리 페이지는 항상 존재하므로 그 페이지의 구독 링크가 404로 떨어지면 안 된다.

## 노출 지점

모든 페이지 `<head>` 의 자동발견 링크(전체 피드가 항상 **먼저** — 리더 대부분이 첫 항목을 고른다) ·
푸터 `RSS` · 목록/카테고리 페이지 제목 옆 `FeedLink.astro` 캡슐. 카테고리 페이지는 `BaseLayout` 의
`feeds` prop 으로 자기 피드를 하나 더 얹는다.

사이트맵은 피드를 싣지 않는다(`@astrojs/sitemap` 이 HTML 페이지만 수집 — 별도 필터 불필요).
XSL 스타일시트는 붙이지 않았다 — 브라우저 XSLT 지원이 걷히는 중이라 수명이 짧은 투자다.
