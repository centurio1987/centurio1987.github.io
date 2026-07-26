---
name: init-post
description: >
  raws→draft 파이프라인을 건너뛰고, 바로 쓸 수 있는 Astro 포스트 스켈레톤을
  `src/content/posts/<slug>.md` 에 생성하는 스킬. frontmatter 스키마를 갖춘 빈 글을 만든다.
  "/init-post <slug> <category>", "새 글 스켈레톤 만들어줘", "빈 포스트 하나 만들어줘"
  같은 표현에 반응한다. 아이디어 메모로 플롯을 잡는 작업은 `post-draft` 가 담당한다.
argument-hint: <slug> <category> [title]
---

# init-post 스킬

이미 무엇을 쓸지 아는 경우, 플롯 스캐폴드 단계 없이 **바로 쓸 수 있는 포스트 스켈레톤**을 `src/content/posts/` 에 만든다. 기본은 `draft: true` 라 발행 전까지 사이트에 노출되지 않는다.

> 아이디어 메모에서 플롯을 뽑아 잡고 싶으면 `init-post` 가 아니라 `post-draft` 를 쓴다.

## 동작

1. **인자 파악**
   - `<slug>`: 파일명 겸 URL. 영문 소문자+하이픈 권장(예: `ddd-rdb-schema`). 없으면 묻는다.
   - `<category>`: 아래 슬러그 중 하나. 없거나 enum에 없으면 묻는다.
   - `[title]`: 없으면 slug에서 임시 제목을 만들고 사용자가 나중에 고치게 한다.

2. **경로 결정**: `src/content/posts/<slug>.md`. 이미 있으면 덮어쓰기 전에 확인.

3. **스켈레톤 생성** (`apply_patch` 또는 파일 쓰기):

   ```markdown
   ---
   title: <title 또는 "제목을 입력하세요">
   description: 
   pubDate: <오늘 YYYY-MM-DD>
   category: <category>
   tags: []
   draft: true
   ---

   <!-- 여기부터 본문을 작성하세요. 다이어그램·차트·hero 가 필요하면 ```viz``` 명세 블록으로 적어두면
        make-image(viz 엔진, bbangto-ui-visualization)가 코드로 구현합니다. kind: ProcessSteps/Comparison/Flowchart/Statistics/PosterEditorial. -->
   ```

4. **완료 안내**: 생성 경로와, 발행 준비가 되면 `draft: true` → `false` 로 바꾸거나 그대로 두면 됨을 알린다. 로컬 미리보기는 `npm run dev`. (draft는 기본적으로 목록에서 숨겨진다.)

## 카테고리 슬러그

`planning`(기획) · `architecture`(아키텍처) · `strategy`(전략) · `skills`(기술) · `design`(설계) · `research`(리서치) · `quality`(품질) · `leadership`(리더십)

`src/content.config.ts` 의 enum 과 일치해야 한다.

## 주의

- frontmatter는 `src/content.config.ts` 스키마를 통과해야 한다(`pubDate` 날짜, `category` enum, `draft` 불리언).
- 본문을 임의로 채우지 않는다 — 빈 스켈레톤만 만든다.
