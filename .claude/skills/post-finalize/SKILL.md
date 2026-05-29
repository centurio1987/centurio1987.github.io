---
name: post-finalize
description: >
  작성된 Astro 포스트(또는 draft) 파일을 받아 사후처리하는 스킬.
  본문 내 `[[[...]]]` 단서를 OpenAI 이미지 API로 생성한 webp로 치환하고,
  본문에서 핵심 키워드를 추출해 frontmatter `tags`에 넣고,
  frontmatter `series` 가 있으면 같은 시리즈 다른 글의 링크 목록을 본문 하단에 삽입한다.
  "/post-finalize <파일경로>", "이 글 후처리해줘", "포스트 마무리해줘",
  "태그 뽑고 이미지 생성해줘" 같은 표현에 반응한다.
  새 글 스캐폴드 작성은 `post-draft`, 4축 리뷰는 `review-post` 가 담당한다.
argument-hint: <post-file-path>
---

# Post Finalize 스킬

작성 완료된 포스트 마크다운 파일에 대해 다음 세 가지를 한 번에 수행한다.

1. 본문 내 `[[[...]]]` 자리표시자를 OpenAI `gpt-image-1` 로 생성한 webp 로 치환
2. 본문에서 핵심 키워드를 뽑아 frontmatter `tags` 에 머지
3. frontmatter `series` 가 명시된 경우, 같은 series 값의 다른 포스트 링크 목록을 본문 끝에 `## 이 시리즈의 다른 글` 섹션으로 삽입

본문을 새로 쓰거나 리뷰하지는 않는다.

## 대상과 경로 규약 (Astro)

- 포스트 본체: `src/content/posts/<slug>.md` (발행 전이면 `draft/<…>.md` 도 가능)
- 이미지 저장: `public/images/<post-slug>/<n>.webp`
- 이미지 참조 경로: `/images/<post-slug>/<n>.webp`  (Astro는 `public/` 를 사이트 루트에 서빙하므로 `public` 접두사를 떼고 `/images/…` 로 시작)
- 시리즈 링크 경로: `/posts/<slug>`  (Astro 라우팅. `src/content/posts/<slug>.md` → `/posts/<slug>`, 확장자 제거)

## 동작 순서

### 1. 대상 파일 경로 확인

인자가 있으면 사용. 없으면 묻는다:

> "어느 포스트 파일을 사후처리할까요? (예: `src/content/posts/aggregate-rdb.md`)"

확장자가 `.md` 가 아니면 중단. 공백/한글 경로는 따옴표 처리.

### 2. 파일 읽기 + frontmatter 파싱

`Read`로 전체를 읽고 YAML frontmatter 를 추출·분리한다.

- frontmatter가 없으면 빈 객체로 시작.
- `title` 이 없으면 한 번 묻는다.
- `series` 는 없어도 무관(시리즈 섹션만 생략).

### 3. `[[[...]]]` 이미지 자리표시자 처리

`OPENAI_API_KEY` 환경변수를 먼저 확인. 없으면 빨리 알리고 진행 방법(건너뛰기 vs 중단)을 묻는다.

정규식 `\[\[\[([\s\S]+?)\]\]\]` 로 자리표시자를 모두 찾고 등장 순서대로 1부터 번호를 매긴다.

각 매치마다 **순차적으로**(병렬 금지):

1. 안쪽 단서를 이미지 생성에 적합한 **영문 프롬프트로 확장**한다.
   - 다이어그램 단서: `"minimal, technical diagram, clean line art, no text labels"`
   - 콘셉트/은유 단서: `"editorial illustration, muted palette, conceptual"`
   - 글의 톤에 맞춘다.
2. 이미지를 생성한다:
   ```bash
   bun run scripts/generate-image.ts "<expanded prompt>" "public/images/<post-slug>/<n>.webp"
   ```
   - `<post-slug>`: 입력 파일명 stem에서 `.md` 와 `-draft` 접미사를 제거한 값.
   - bun 미설치 환경이면 `bunx` 또는 `node`로 대체 실행을 시도하되, 스크립트는 bun 런타임(`#!/usr/bin/env bun`)을 가정한다.
3. 성공하면 `[[[...]]]` 블록 전체를 다음으로 치환:
   ```markdown
   ![<원본 단서 텍스트 그대로>](/images/<post-slug>/<n>.webp)
   ```
4. 실패하면 어느 자리표시자가 실패했는지 알리고 해당 블록은 그대로 두고 다음으로. 전체 중단하지 않는다.

### 4. 태그 추출

본문 전체(이미지 치환 후 기준)에서 **3~8개** 핵심 키워드를 뽑는다.

- 검색·분류에 쓸 단어 우선, 기술 용어는 원어(DDD, Aggregate, RDB)
- 한국어 개념은 한국어("모델링", "도메인 설계")
- 너무 광범위한 단일어 단독은 피하고 특화 조합("DDD 모델링", "Aggregate 설계")

기존 `tags` 배열이 있으면 머지하고 중복 제거. 없으면 신규 추가.

### 5. 시리즈 섹션 삽입 (조건부)

`series` 가 비어 있으면 건너뛴다.

`series` 가 있으면:

1. `src/content/posts/` 전체를 글롭(`Glob` + frontmatter 파싱)으로 훑어 같은 `series` 값을 가진 `.md` 를 모은다.
2. 현재 파일 제외.
3. 정렬: frontmatter `order`(숫자) 오름차순, 없으면 파일명 사전순.
4. 본문 끝에 `assets/SERIES_SECTION_TEMPLATE.md` 형식대로 섹션 삽입. 링크는 `/posts/<slug>` 절대 경로.
5. **멱등성**: 이미 `## 이 시리즈의 다른 글` 섹션이 있으면 통째로 교체.

### 6. 저장 + 요약 보고

frontmatter + 본문을 합쳐 원본 경로에 덮어쓴다. 결과를 짧게 보고:

> "사후처리 완료:
> - 이미지: 3개 (성공 3 / 실패 0) → `public/images/<slug>/`
> - 태그: `DDD, Aggregate, RDB 스키마, 모델링`
> - 시리즈 링크: 4개 항목"

## 분석 시 지킬 원칙

- **원본 이미지 단서를 alt 텍스트로 보존.** `[[[X]]]` 의 `X` 가 그대로 alt.
- **API 호출 직렬화.** 동시 호출 금지.
- **부분 실패 허용.** 실패한 자리표시자는 원본 그대로 두고 계속.
- **frontmatter 보존.** 기존 필드(`title`, `description`, `pubDate`, `category`, `updatedDate` 등) 삭제 금지, 신규만 추가/갱신, 키 순서 유지.
- **태그는 본문 기반.** 제목만 보지 말 것.
- **`OPENAI_API_KEY` 누락은 빨리 실패.**
- **재실행 멱등성.** `[[[]]]` 남은 것만 재처리, 시리즈 섹션 교체, 태그 중복 없이 머지.

## 참조 파일

- `assets/SERIES_SECTION_TEMPLATE.md` — 시리즈 링크 섹션 템플릿
- `scripts/generate-image.ts` (레포 루트) — OpenAI 이미지 생성 스크립트(인자: 프롬프트, 출력경로)

## 사전 요건

- 환경변수 `OPENAI_API_KEY`
- Bun(이미지 스크립트 런타임) 또는 동등한 실행 수단

## 참고 예시

처리 전:
```markdown
[[[Aggregate 루트(주문)와 두 자식 엔티티를 잇는 UML 클래스 다이어그램, 카디널리티 표기]]]
```
처리 후:
```markdown
![Aggregate 루트(주문)와 두 자식 엔티티를 잇는 UML 클래스 다이어그램, 카디널리티 표기](/images/aggregate-rdb/1.webp)
```
