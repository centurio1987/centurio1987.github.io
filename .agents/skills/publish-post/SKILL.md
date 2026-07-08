---
name: publish-post
description: >
  `draft/` 의 작업물(`*-draft.md` 또는 작성 중 .md)을 정식 Astro 포스트로 발행하는 스킬.
  `src/content/posts/` 에 정식 포스트 파일을 생성하고, Astro 콘텐츠 컬렉션 스키마에 맞는
  frontmatter를 채우며, 원본 draft 파일을 제거한다.
  "/publish-post", "draft를 정식 포스트로 발행해줘", "이 draft 정식 포스트로 전환",
  "포스트 publish 해줘" 같은 표현에 반응한다.
argument-hint: <draft-path> [slug]
---

# Publish Post 스킬

`draft/` 의 초안을 정식 포스트로 발행한다. 다음을 한 묶음으로 수행한다:

1. `src/content/posts/<slug>.<ext>` (`.md` 또는 MDX면 `.mdx`) 에 정식 포스트 파일 생성 (Astro 스키마 frontmatter)
2. 원본 draft 파일 제거 (필요 시 co-located 컴포넌트도 함께 이동)

> **VitePress 때와 달리 사이드바 수동 등록 단계는 없다.** Astro 콘텐츠 컬렉션이 `src/content/posts/` 를 자동 탐색하고, 글의 `category` 필드가 분류·목록 그룹핑을 결정한다. `config.ts` 같은 파일을 건드리지 않는다.

## 동작 순서

### 1. 입력 수집

**Draft 파일 경로**

- 인자가 있으면 사용.
- 없으면 `find draft -type f \( -name '*.md' -o -name '*.mdx' \)` 로 후보를 찾는다.
  - 1개면 제안하며 확인.
  - 여러 개면 `AskUserQuestion` 으로 선택.
  - 0개면 직접 경로를 묻는다.
- 공백/한글 경로는 따옴표 처리.

### 2. Draft 읽기 및 메타데이터 추출

`Read` 로 전체를 읽고:

- **제목**: frontmatter `title` 이 있으면 그것을, 없으면 첫 `# ` 헤딩.
- **본문 영역**: 사용자가 채운 실제 내용.
- **스캐폴드 잔재 감지**: `## 플롯 후보`, `### Plot A/B/C`, `## 주의사항 / 잊지 말아야 할 점`, `## 선택한 플롯`, 그리고 DRAFT_TEMPLATE 상단의 안내 주석이 남아있는지 본다. 남아있으면 어떻게 할지 묻는다:
  - "스캐폴드 섹션 빼고 발행" (권장)
  - "그대로 발행"
  - "취소하고 먼저 정리"

### 3. 슬러그(파일명)·확장자 결정

`src/content/posts/<slug>.<ext>` 의 `<slug>` 가 곧 URL(`/posts/<slug>`)이 된다.

**확장자**: 본문에 MDX 문법(상단 `import` 문 또는 `<Component client:... />` 같은 JSX/React 시뮬레이션)이 있으면 `.mdx`, 순수 마크다운이면 `.md`. 보통 draft 확장자를 그대로 따른다. `.mdx` 로 발행할 때 import 경로가 `src/content/posts/` 기준으로 올바른지 확인한다(예: co-located 컴포넌트는 발행 위치 기준 상대경로여야 한다).

- 기본 제안: 영문 소문자 + 하이픈 슬러그 (깔끔한 URL 위해 권장). 제목/주제에서 생성.
  - 예: 제목 "DDD 도입 시 RDB 스키마 설계" → `ddd-rdb-schema`
- 사용자가 한글 슬러그를 원하면 허용한다(URL은 인코딩됨). 인자로 slug가 주어지면 그것을 쓴다.
- `src/content/posts/<slug>.md` 가 이미 있으면 덮어쓰기 전에 확인.

### 4. frontmatter 구성 (Astro 스키마)

`src/content.config.ts` 의 스키마에 맞춰 채운다. draft의 기존 값을 최대한 활용하고, 빠진 필수값은 묻는다.

```yaml
---
title: <제목>                      # 필수
description: <한 줄 요약>           # 권장
pubDate: <YYYY-MM-DD>              # 필수. 기본은 오늘 날짜, 사용자 확인
category: <슬러그>                  # 필수. 아래 목록 중 하나
tags: [..]                         # 선택 (post-finalize가 채울 수도 있음)
series: <시리즈명>                  # 선택
order: <숫자>                       # 선택 (시리즈 정렬용)
draft: false                       # 발행이므로 false
---
```

**카테고리 슬러그**: `planning`(기획) · `architecture`(아키텍처) · `strategy`(전략) · `skills`(기술) · `design`(설계) · `research`(리서치) · `quality`(품질) · `leadership`(리더십)

draft frontmatter에 `category` 가 이미 있으면 재사용하고, 없거나 불확실하면 본문을 보고 추정한 뒤 사용자에게 한 번 확인한다. 스키마 enum에 없는 값은 절대 쓰지 않는다.

### 5. 발행 전 확인

편집/이동 전에 사용자에게 보여준다:
- 생성될 경로 `src/content/posts/<slug>.md`
- 최종 frontmatter (title, pubDate, category, tags, series 등)
- 스캐폴드 제거 여부

확인을 받은 뒤 6단계로.

### 6. 변경 적용

1. **포스트 생성** — `Write` 로 `src/content/posts/<slug>.<ext>` 저장(2~4단계 결과 반영, 스캐폴드 제거 옵션 적용). MDX면 React 시뮬레이션 컴포넌트(co-located `.tsx`)도 발행 위치에 맞게 두고 import 경로를 갱신한다.
2. **Draft 제거** — `Bash` 로 `rm "<draft-path>"`. 공백/한글 경로 따옴표 처리.

config.ts 등 별도 등록 파일 수정은 없다.

### 7. 완료 안내

- 생성된 포스트 경로와 예상 URL(`/posts/<slug>`)
- 제거된 draft 경로
- 로컬 확인: `npm run dev` (또는 `bun dev`)
- 후속 제안: 이미지/태그/시리즈가 필요하면 `post-finalize` 안내

## 주의사항

- **destructive 작업**(draft 삭제, 포스트 생성)은 5단계 확인 전까지 수행하지 않는다.
- frontmatter는 반드시 `src/content.config.ts` 스키마를 통과해야 한다. 특히 `pubDate`(날짜), `category`(enum), `draft`(불리언).
- 새 카테고리를 멋대로 만들지 않는다 — enum에 없으면 사용자에게 어느 카테고리인지 묻는다.
- 스캐폴드 잔재가 있어 사용자가 "취소"를 고르면 즉시 종료하고 정리할 섹션을 알린다.

## 참조 파일

- `/src/content.config.ts` — 콘텐츠 컬렉션 스키마(필드·enum)
- `/src/lib/categories.ts` — 카테고리 슬러그·라벨·색
- `.Codex/skills/post-draft/SKILL.md` — 선행 스킬

## 관련 스킬

- `post-draft` — raws 메모 → `draft/*-draft.md`
- `publish-post` (본 스킬) — draft → `src/content/posts/` 발행
- `post-finalize` — 이미지·태그·시리즈 사후처리
