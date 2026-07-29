---
name: post-finalize
description: >
  작성된 Astro 포스트(또는 draft) 파일을 받아 사후처리하는 스킬.
  본문에서 핵심 키워드를 추출해 frontmatter `tags`에 넣고,
  frontmatter `series` 가 있으면 같은 시리즈 다른 글의 링크 목록을 본문 하단에 삽입한다.
  모든 구조형 시각물(다이어그램·차트·인포그래픽·hero)은 집필 단계에서 ```` ```viz``` ```` 블록으로 남겨
  **viz 엔진(`scripts/apply-viz.ts`)이 이미 구현**하므로, 이 스킬은 이미지를 생성하지 않는다.
  잔존한 레거시 마커(`[[[...]]]`·```figure```·`(( ))`)를 만나면 경고만 한다.
  "/post-finalize <파일경로>", "이 글 후처리해줘", "포스트 마무리해줘",
  "태그 뽑아줘" 같은 표현에 반응한다.
  새 글 스캐폴드 작성은 `post-draft`, 4축 리뷰는 `review-post` 가 담당한다.
argument-hint: <post-file-path>
---

# Post Finalize 스킬

작성 완료된 포스트 마크다운/MDX 파일에 대해 다음을 수행한다.

1. 본문에서 핵심 키워드를 뽑아 frontmatter `tags` 에 머지
2. 본문에 `## 이 시리즈의 다른 글` 섹션이 남아 있으면 **제거**(삽입 로직은 KAN-042에서 폐지 — `PostNav`·`SeriesEpisodes` 가 자동 렌더)
3. 잔존 레거시 마커(`[[[...]]]`·```figure```·`(( ))`) 검사 → 경고

본문을 새로 쓰거나 리뷰하지 않는다. **이미지를 생성하지 않는다**(시각물은 이미 `viz` 엔진이 처리).

## 대상과 경로 규약 (Astro)

- 포스트 본체: `src/content/posts/<slug>.md`/`.mdx` (발행 전이면 `draft/<…>.md`/`.mdx` 도 가능)
- 시리즈 네비게이션은 `PostNav.astro`·`SeriesEpisodes.astro` 가 자동 렌더한다 — 본문에 링크를 넣지 않는다.

## 동작 순서

### 1. 대상 파일 경로 확인

인자가 있으면 사용. 없으면 묻는다:

> "어느 포스트 파일을 사후처리할까요? (예: `src/content/posts/aggregate-rdb.mdx`)"

확장자가 `.md`/`.mdx` 가 아니면 중단. 공백/한글 경로는 따옴표 처리.

### 2. 파일 읽기 + frontmatter 파싱

파일 읽기로 전체를 읽고 YAML frontmatter 를 추출·분리한다.

- frontmatter가 없으면 빈 객체로 시작.
- `title` 이 없으면 한 번 묻는다.
- `series` 는 없어도 무관(시리즈 섹션만 생략).

### 3. 태그 추출

본문 전체에서 **3~8개** 핵심 키워드를 뽑는다.

- 검색·분류에 쓸 단어 우선, 기술 용어는 원어(DDD, Aggregate, RDB)
- 한국어 개념은 한국어("모델링", "도메인 설계")
- 너무 광범위한 단일어 단독은 피하고 특화 조합("DDD 모델링", "Aggregate 설계")

기존 `tags` 배열이 있으면 머지하고 중복 제거. 없으면 신규 추가.

### 4. 시리즈 섹션 삽입 (조건부)

`series` 가 비어 있으면 건너뛴다.

`series` 가 있으면:

1. `src/content/posts/` 전체를 글롭(`rg --files` 또는 `find` + frontmatter 파싱)으로 훑어 같은 `series` 값을 가진 `.md`/`.mdx` 를 모은다.
2. 현재 파일 제외.
3. 정렬: frontmatter `order`(숫자) 오름차순, 없으면 파일명 사전순.
4. 삽입하지 않는다. 이미 있는 `## 이 시리즈의 다른 글` 섹션은 헤딩부터 다음 `##` 직전(또는 파일 끝)까지 **제거**한다.
5. `series` frontmatter 자체는 건드리지 않는다 — 자동 렌더가 그 값을 쓴다.

### 5. 레거시 마커 검사 (경고만)

구조형 시각물은 이제 ```` ```viz``` ```` 블록 → **viz 엔진(`scripts/apply-viz.ts`)** 으로 구현한다. 다음 **레거시** 마커가 남아 있으면 처리하지 말고 **경고만** 한다(마이그레이션 유예; 자동 실패 아님):

- `[[[...]]]` (구 OpenAI 은유 일러스트) — 이제 `viz`(PosterEditorial 등)로 대체
- ```` ```figure``` ```` (구 make-image HTML 템플릿) — 이제 `viz` 블록으로 대체
- `(( ))` (구 mdx-concept-diagram) — 이제 `viz` 블록(Flowchart/ConceptMap 등)으로 대체
- ```` ```viz``` ``` 가 **미처리로 남아 있으면** 집필 단계의 viz 엔진 처리 누락 → 경고

이 스킬은 이미지를 생성하지 않으므로 `OPENAI_API_KEY` 가 필요 없다.

### 6. 저장 + 요약 보고

frontmatter + 본문을 합쳐 원본 경로에 덮어쓴다. 결과를 짧게 보고:

> "사후처리 완료:
> - 태그: `DDD, Aggregate, RDB 스키마, 모델링`
> - 시리즈 섹션: 제거 1건 (또는 '없음')
> - 레거시 마커: 0 (경고 없음)"

## 분석 시 지킬 원칙

- **frontmatter 보존.** 기존 필드(`title`, `description`, `pubDate`, `category`, `updatedDate` 등) 삭제 금지, 신규만 추가/갱신, 키 순서 유지.
- **태그는 본문 기반.** 제목만 보지 말 것.
- **재실행 멱등성.** 시리즈 섹션 교체, 태그 중복 없이 머지.
- **MDX 안전.** `.mdx` 글은 상단 `import` 문과 `<Component .../>`(viz·React 시뮬) 블록을 frontmatter처럼 보존하고 절대 깨지 말 것. 태그 추출 시 import 경로·컴포넌트명 같은 코드 토큰은 키워드로 넣지 않는다.
- **이미지 생성 안 함.** 시각물은 viz 엔진(`scripts/apply-viz.ts`)이 집필 단계에서 이미 구현했다.

## 참조 파일

- 시각물 엔진(레포 루트): `scripts/apply-viz.ts`(inline → co-located `.tsx` SSR 정적 SVG), `scripts/render-viz.ts`(hero → webp), 스키마 `src/lib/viz/schema.ts`
