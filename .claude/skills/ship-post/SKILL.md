---
name: ship-post
description: >
  발행된 글을 **최종 재검증하고 블로그 레포에 commit&push**하는 마무리 스킬. ① `bun run build`로
  회귀 없이 빌드되는지 확인하고 링크/이미지(잔존 figure·깨진 경로)/frontmatter 스키마를 재검증한 뒤,
  ② git-shipper(haiku)로 발행물(과 관련 컴포넌트·이미지) 경로만 commit&push 한다(공유 가드 스크립트 경유).
  "/ship-post <파일>", "이 글 배포까지 끝내줘", "빌드 확인하고 푸시해줘" 같은 표현에 반응한다.
  파이프라인 **맨 마지막 단계**로, 자동 모드에서는 push까지 완전 자동(가드 스크립트는 항상 적용).
argument-hint: <발행된 글 경로 (src/content/posts/*.mdx)>
---

# ship-post 스킬

발행 파이프라인의 **마지막 단계**다. `publish-post`가 글을 `src/content/posts/`로 정식 편입한 뒤, 이 스킬이
**최종 빌드 재검증 → 블로그 레포 commit&push**로 배포를 끝낸다(GitHub Pages는 `main` push 시 자동 배포).

git 처리는 직접 하지 않고 **git-shipper(haiku)** 가 공유 가드 스크립트(`scripts/git-commit-push.sh`)를 호출한다.
빌드·검증은 이 스킬(또는 오케스트레이터/ship-finalizer)이 하고 git만 위탁한다.

## 워크플로우 상의 위치

```
… → post-finalize → publish-post (src/content/posts/로 편입) → [ship-post: build 재검증 → git-shipper commit&push]
```

## 입력 / 출력 계약

- **입력**: 발행된 글 경로(`src/content/posts/<slug>.mdx`) + slug. (publish-post가 넘긴다.)
- **출력**: `bun run build` 통과 확인 + 블로그 레포 commit & (자동 모드) push 결과. 실패 시 원인 보고(자동 롤백 없음).

## 동작 순서

### 1. 최종 재검증
- **미처리 마커 하드 게이트**: `bun scripts/check-post-markers.ts` 실행 → 발행 글에 `[[[…]]]`·```viz```·```figure```·`<<meme:` 잔존이 있으면 **종료코드 1**. 실패면 **push로 넘어가지 않고** 처리(구조형은 make-image, 밈은 meme-inserter, 레거시는 viz로 대체/제거) 후 재검증. (CI `main.yml`도 동일 가드를 build 전에 돌린다.)
- **강조 렌더링 하드 게이트**: `bun scripts/check-emphasis.ts` 실행 → 강조가 닫히지 않아 별표째 화면에 나오는 자리가 있으면 **종료코드 1**. 한국어는 조사가 닫는 `**` 에 곧바로 붙어 `**창(window)**이` 가 강조로 성립하지 않는데, **빌드도 타입도 초록이라 이 게이트 말고는 잡히지 않는다.** (CI `main.yml` 도 build 전에 같은 가드를 돌린다.)
- **`bun run build`** 실행 → 회귀 없이 통과하는지 확인(JSX/MDX 오류 1건이 전체 빌드를 깬다). 실패면 멈추고 원인 보고.
- **데코 전수 하드 게이트**: `bun run deco:verify` 실행 → 글 상세 전수에서 **인용 하나라도 두들 하트가 없거나 코드블록 하나라도 테이프가 없으면 종료코드 1**. 데코는 예외 없이 붙는 게 규칙이라(유저 지시) 「붙은 것과 안 붙은 것」이 갈리면 그건 절제가 아니라 고장이다. 어댑터가 안 걸리는 경로(순수 `.md`, 낡은 콘텐츠 캐시)도 여기서 잡힌다 — 빌드·타입·강조 게이트는 전부 초록이다. 브라우저를 띄우므로 CI 가 아니라 이 단계에서 돈다.
- **빌드 뒤 `bun scripts/check-emphasis.ts --dist`** → 렌더된 HTML 을 직접 훑는 정본 검증. 소스 모드가 놓친 것이 여기서 잡힌다.
- **링크/이미지 재검증**:
  - 참조 이미지 경로가 실제로 존재하는지, co-located `.tsx` import 경로가 발행 위치 기준으로 맞는지.
  - 참조 이미지 경로(`/images/<slug>/…`)가 `public/images/<slug>/`에 실제로 존재하는지.
  - co-located `.tsx` import 경로가 발행 위치 기준으로 맞는지.
- **frontmatter 재검증**: `src/content.config.ts` 스키마와 호환되는지(`title`/`pubDate`/`category` 필수, `category`는 `src/lib/categories.ts` enum), `draft: true` 잔존이 없는지.
- 하나라도 실패하면 **push로 넘어가지 않고** 보고한다.

### 1.5 그래프 데이터 — **에이전트가 손대지 않는다** (KAN-056, KAN-046)
그래프 갱신은 **예약제**다. 실행은 main 의 git 훅이 하고, 에이전트는 `graph:refresh`를 직접 치지 않는다. 대신 **언제 갱신할지를 판단해 예약을 남기는 것이 이 단계의 책임**이다.

- **누가 하나**: `.githooks/post-merge`·`post-commit` → `scripts/graph-autorefresh.sh`. **예약 마커가 있을 때만** 게이트를 통과해 갱신을 백그라운드로 detach하고, verify 통과 시 그래프 경로만 자동 커밋한 뒤 예약을 지운다(**push는 안 한다**). 예약이 없으면 커밋이 아무리 쌓여도 조용히 넘어간다.
- **왜 예약제인가**: 커밋마다 도는 방식은 예외가 너무 많았다 — 집필 중 커밋·오타 수정·프론트매터 손질까지 전부 갱신을 불렀다. 그래프가 의미 있게 바뀌는 시점은 **시리즈 집필이 끝났을 때**인데, 그건 파일 변화만으로는 판정할 수 없다("EP7이 마지막 편인가"는 판단이다). 그래서 **감지는 에이전트가, 실행은 훅이** 한다.
- **감지 규칙 (이 단계에서 반드시 수행)**: 방금 발행한 글이 **시리즈의 마지막 편**이면 →
  1. `bun run graph:request "<시리즈명> 완결 (EP N)"` 으로 예약을 남긴다.
  2. `manage-kanban`으로 **`할 일` 컬럼에 카드**를 추가한다: "그래프 갱신 — <시리즈명> 완결분 반영".
  - **마지막 편 판정 근거**: 시리즈 계획(KANBAN 카드·`raws/` 메모)에 남은 편이 없거나, 사용자가 완결이라고 말했거나, frontmatter `order`가 계획된 총 편수에 도달했을 때.
  - **애매하면 묻는다.** 단독 글(시리즈 없음)은 그 글 하나로 완결이므로 동일하게 예약한다. 시리즈 중간 편이면 **예약하지 않는다** — 다음 편이 나올 때 함께 반영된다.
- **왜 에이전트가 안 하나**: 절차 전체에 판단이 0인데, 에이전트가 치면 10~40분짜리 실행 로그가 메인 컨텍스트로 통째로 들어오고 세션이 그동안 묶인다. 판단 없는 절차에 그 비용을 낼 이유가 없다.
- **훅이 줄이지 못하는 것**: graphify 추출 자체는 LLM 작업이다(`--backend claude-cli`). 그 비용은 훅이 아니라 시맨틱 캐시가 줄인다. 훅이 없애는 건 오케스트레이터의 컨텍스트 오염·세션 점유·실행 누락이다.
- **왜 발행 워크트리에서 안 하나**: 산출물(`graphify-out/` 1MB + `src/data/graph.json`)이 커밋 대상이라, 병렬 워크트리가 각자 갱신하면 머지 때 대용량 JSON이 다중 충돌한다. 게다가 각 워크트리엔 자기 편만 있어 만들어진 그래프가 형제 편 머지 즉시 stale이 된다(KAN-044 근거 ②③).
- **가드가 실제로 막는다**: 훅 게이트와 `scripts/refresh-graph.sh` 양쪽이 브랜치·워크트리를 본다. 여기서 억지로 돌리려 하지 마라.
- **실패 정책: 여전히 non-blocking.** 그래프가 stale이어도 연관 글은 frontmatter 폴백(`src/lib/related.ts`)으로, `/graph`는 평범한 글 목록으로 degrade될 뿐 발행을 막지 않는다.

### 1.6 빌드 재확인
1.5에서 아무것도 안 바꿨으므로 1의 `bun run build` 결과가 그대로 유효하다. 추가 빌드 불필요.

### 2. commit & push (git-shipper / haiku)
`git-shipper` 서브에이전트(haiku)에 위임한다. git-shipper는 직접 git을 쓰지 않고 **`scripts/git-commit-push.sh`만** 호출한다. 인자:
- `--repo <블로그 레포 경로>` · `--branch main` · `--message "post: <slug> 발행"`
- `--` 뒤에 **이번 글 관련 경로만**: `src/content/posts/<slug>.mdx`, `src/components/posts/<slug>/`, `public/images/<slug>/`. **전체 add 금지**. `graphify-out/`·`src/data/graph.json`은 **넣지 마라** — 그래프는 main에서 따로 갱신·커밋한다(1.5).
- 가드(브랜치 일치·secret·대용량·`pull --rebase`·`--force` 금지)는 스크립트가 적용. 자동 모드면 실제 push까지.
- 스크립트가 비0으로 끝나면 멈추고 원인(브랜치 불일치/secret/충돌 등)을 보고(자동 롤백 안 함).

### 3. 종료 보고
빌드 결과, 재검증 통과/실패 항목, commit 해시·push 결과(또는 실패 원인), 배포 URL 안내(`/posts/<slug>`).
- **후속 안내 필수**: 시리즈 완결로 판단해 예약을 남겼으면 "그래프 갱신을 예약했다 — main에 다음 커밋·머지가 들어오면 훅이 한 번 돈다(백그라운드, 수 분~수십 분). 결과는 `bun run graph:status`." 중간 편이면 "이 글은 시리즈 완결 시 그래프에 함께 반영된다 — 지금은 frontmatter 폴백으로 연관 글이 뜬다."

## 멱등성
- 이미 같은 내용이 커밋돼 staged 변경이 없으면 git 스크립트가 "nothing to commit"으로 무해하게 끝난다(중복 커밋 방지).
- 재실행해도 빌드·검증을 다시 돌릴 뿐 새 부작용이 없어야 한다.

## 참조 파일
- `scripts/git-commit-push.sh` — 공유 git 가드(git-shipper가 호출). research 단계와 **동일 스크립트 재사용**(repo만 다름).

## 주의
- **검증 실패 시 push 금지.** 빌드/링크/frontmatter 중 하나라도 깨지면 배포하지 않고 보고한다.
- git은 **항상 가드 스크립트 경유**(직접 `git add -A`·`--force` 금지). push 두 지점(blog-research/블로그) 동일 정책.
- 자동 모드는 push까지 자동이지만 가드는 항상 적용된다 — secret/대용량/브랜치 안전장치는 우회하지 않는다.
