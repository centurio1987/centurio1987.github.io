---
name: publish-post
description: >
  `*-draft.md` 파일을 정식 VitePress 포스트로 전환하는 스킬.
  대상 디렉토리에 포스트 파일을 생성하고, `.vitepress/config.ts`의 sidebar에
  등록하며, 원본 draft 파일을 제거한다.
  "/publish-post", "draft를 정식 포스트로 발행해줘", "이 draft 정식 포스트로 전환",
  "포스트 publish 해줘" 같은 표현에 반응한다.
argument-hint: <draft-path> [target-directory]
---

# Publish Post 스킬

`post-draft` 스킬로 만들어진 `*-draft.md` 초안을 정식 포스트로 발행한다. 다음 세 작업을 한 묶음으로 수행한다:

1. 대상 디렉토리에 정식 포스트 파일 생성
2. `.vitepress/config.ts`의 sidebar에 새 포스트 항목 등록
3. 원본 `*-draft.md` 파일 제거

세 작업 모두가 성공해야 발행이 끝난 것이다. 중간에 사용자 확인이 필요한 지점이 있다.

## 동작 순서

### 1. 입력 수집

**Draft 파일 경로**

- 인자로 전달된 경로가 있으면 그대로 쓴다.
- 없으면 `find docs -type f -name '*-draft.md'`로 후보를 찾는다.
  - 후보가 1개면 그것을 제안하며 확인을 받는다.
  - 후보가 여러 개면 `AskUserQuestion`으로 선택지를 보여준다.
  - 후보가 0개면 사용자에게 직접 경로를 묻는다.
- 경로에 공백/한글이 있을 수 있으므로 따옴표 처리에 유의한다.

**대상 디렉토리 경로**

- 인자로 전달된 경로가 있으면 그대로 쓴다.
- 없으면 `.vitepress/config.ts`의 sidebar를 읽어 등록된 `base` 경로(`/posts/planning`, `/posts/architecture`, …)와, 이미 존재하는 하위 디렉토리(예: `/posts/planning/practical-know-how/`)를 모아 제안 옵션으로 구성한다. 마지막 옵션으로 "직접 기입"을 둔다.
- `AskUserQuestion`은 최대 4개 옵션까지만 받으므로, 제안이 많으면 상위 카테고리만 1차로 묻고 사용자가 고른 카테고리 안에서 다시 좁힌다.
- "직접 기입"을 고르면 다음 응답에서 자유 입력을 받는다.

대상 디렉토리가 존재하지 않으면 `mkdir -p`로 생성한다.

### 2. Draft 파일 읽기 및 메타데이터 추출

`Read`로 draft 전체를 읽고 다음을 확인한다:

- **제목**: frontmatter의 `title`이 있으면 그것을, 없으면 첫 번째 `# ` 헤딩을 쓴다.
- **본문 영역**: 사용자가 채워 넣은 실제 내용.
- **스캐폴드 잔재 감지**: `## 플롯 후보`, `### Plot A/B/C`, `## 주의사항 / 잊지 말아야 할 점`, `## 선택한 플롯` 같은 `post-draft` 템플릿 섹션이 그대로 남아있는지 본다. 남아있으면 사용자에게 알리고 어떻게 할지 묻는다:
  - "스캐폴드 섹션을 빼고 발행" (권장 — 깔끔한 포스트)
  - "그대로 발행" (작성 메모까지 함께 나감)
  - "취소하고 먼저 정리"

### 3. 포스트 파일명 결정

기본값: draft 파일명에서 `-draft` 접미사를 제거한 형태.

예: `컨텐츠 모음-draft.md` → `컨텐츠 모음.md`

사용자가 다른 이름을 원하면 받는다. 한글/영문/공백 모두 허용한다.

대상 디렉토리에 동일한 이름의 파일이 이미 있으면 덮어쓰기 전에 명시적으로 확인을 받는다.

### 4. 사이드바 등록 항목 산출 및 확인

`.vitepress/config.ts`를 읽어 sidebar 구조를 파악한다. 대상 디렉토리를 사이드바 경로로 변환한다:

- `srcDir`이 `docs`이므로 `docs/posts/planning/practical-know-how/` → `/posts/planning/practical-know-how/`
- 가장 길게 일치하는 `base` prefix를 가진 sidebar 섹션을 매칭한다.
  - 예: `/posts/planning/practical-know-how/` → base가 `/posts/planning`인 "기획" 섹션 매칭.

추가할 항목 형식:

```ts
{ text: "<포스트 제목>", link: "<base 이후 경로>/<파일명(.md 제외)>" }
```

예시 — 대상이 `docs/posts/planning/practical-know-how/`, 파일명 `결정 트리.md`, 제목 "결정 트리 사용법":

- 매칭 섹션: "기획" (`base: "/posts/planning"`)
- 추가 항목: `{ text: "결정 트리 사용법", link: "/practical-know-how/결정 트리" }`

매칭되는 base가 없으면 사용자에게 어느 섹션 아래 추가할지 묻는다. **새 top-level 섹션을 멋대로 추가하지 않는다.**

이 단계에서 **편집 전에 사용자에게 다음을 보여준다**:
- 매칭된 섹션 이름
- 추가될 항목의 `text`와 `link`

확인을 받은 뒤 5단계로 진행한다.

### 5. 변경 일괄 적용

확인을 받았으면 다음을 순서대로 실행한다:

1. **포스트 파일 생성** — `Write`로 대상 경로에 저장. 2-3단계에서 결정한 본문(스캐폴드 제거 옵션이 적용된 상태)을 그대로 쓴다.
2. **config.ts 편집** — `Edit`으로 매칭 섹션의 `items` 배열 끝에 새 항목을 추가한다. 들여쓰기와 따옴표 스타일은 기존 코드를 따른다(큰따옴표 `"..."`, 2칸 들여쓰기, trailing comma).
3. **Draft 파일 삭제** — `Bash`로 `rm "<draft-path>"` 실행. 공백/한글 경로는 따옴표 처리.

세 작업은 의존관계가 없으므로 한 응답 안에서 세 도구 호출을 동시에 보내도 된다. 단, 실패 시 부분 적용 상태가 남을 수 있으니 결과를 확인한다.

### 6. 완료 안내

다음을 사용자에게 알린다:

- 생성된 포스트 파일 경로 (절대경로 또는 레포 루트 기준 상대경로)
- sidebar에 추가된 항목 (text/link)
- 제거된 draft 파일 경로
- 로컬 확인 방법: `bun docs:dev`

## 주의사항

- **destructive 작업이 둘**(draft 삭제, config.ts 수정). 4단계에서 사용자 확인을 받기 전까지는 파일 시스템을 수정하지 않는다.
- VitePress link 경로는 확장자(`.md`) 없이 쓴다.
- 대상 디렉토리에 `index.md`가 필요한 형태(예: 새 series를 만드는 경우)인지 자동 판단하지 않는다 — 명시적으로 요청받지 않은 작업은 하지 않는다.
- frontmatter가 없는 draft여도 막지 않는다. 본문만으로 발행 가능하다.
- 스캐폴드 잔재가 있어 사용자가 "취소"를 고르면 즉시 종료하고, 어떤 섹션을 정리해야 하는지 알린다.

## 참조 파일

- `/.vitepress/config.ts` — sidebar 구조 정의
- `docs/.claude/skills/post-draft/SKILL.md` — `*-draft.md` 파일을 만드는 선행 스킬. 본 스킬은 그 후속 단계다.

## 관련 스킬

- `post-draft` — 아이디어 메모 → `*-draft.md` 스캐폴드 생성
- `publish-post` (본 스킬) — `*-draft.md` → 정식 포스트 + sidebar 등록 + draft 정리
