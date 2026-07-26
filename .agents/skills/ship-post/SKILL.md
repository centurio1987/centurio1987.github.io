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
- **`bun run build`** 실행 → 회귀 없이 통과하는지 확인(JSX/MDX 오류 1건이 전체 빌드를 깬다). 실패면 멈추고 원인 보고.
- **링크/이미지 재검증**:
  - 참조 이미지 경로가 실제로 존재하는지, co-located `.tsx` import 경로가 발행 위치 기준으로 맞는지.
  - 참조 이미지 경로(`/images/<slug>/…`)가 `public/images/<slug>/`에 실제로 존재하는지.
  - co-located `.tsx` import 경로가 발행 위치 기준으로 맞는지.
- **frontmatter 재검증**: `src/content.config.ts` 스키마와 호환되는지(`title`/`pubDate`/`category` 필수, `category`는 `src/lib/categories.ts` enum), `draft: true` 잔존이 없는지.
- 하나라도 실패하면 **push로 넘어가지 않고** 보고한다.

### 1.5 그래프 데이터 갱신 (non-blocking)
연관 글/글 지도 기능의 데이터(`src/data/graph.json`)를 새 글 반영본으로 갱신한다.
- 아래를 실행 → `bun scripts/build-graph-data.ts` → 그래프 데이터가 바뀌었으면 **`bun run build` 한 번 더** 통과 확인.
  ```bash
  graphify extract src/content/posts/ --backend claude-cli --mode deep --token-budget 15000 --out .
  ```
  `--backend claude-cli`는 API 키가 필요 없다. `--backend gemini`는 무료 티어 5 RPM·일일 상한에 걸려 청크 절반이 429로 죽는다(KAN-023). `--out .`을 빼면 `src/content/posts/`를 오염시킨다.
- **부분 실패 = 커밋 금지.** `WARNING: n/m semantic chunk(s) failed`가 뜨면 그 결과물을 버리고 기존 커밋 그래프를 유지한다. 부분 그래프를 커밋하면 일부 글이 통째로 그래프에서 사라진다. 전량 성공은 `graphify-out/graph.json`의 문서 노드 수 = 발행 글 수로 확인한다.
- **실패 정책: non-blocking.** graphify 실패(추출 오류·부분 실패) 시 경고만 남기고 기존 커밋 그래프로 발행을 계속한다 — 기능은 stale 데이터로 degrade될 뿐 글 발행을 막지 않는다.
- 갱신에 성공했으면 commit 경로에 `graphify-out/`(단 `cache/`·날짜 백업 디렉터리 제외)과 `src/data/graph.json`을 추가한다.

### 2. commit & push (git-shipper / haiku)
`git-shipper` 서브에이전트(haiku)에 위임한다. git-shipper는 직접 git을 쓰지 않고 **`scripts/git-commit-push.sh`만** 호출한다. 인자:
- `--repo <블로그 레포 경로>` · `--branch main` · `--message "post: <slug> 발행"`
- `--` 뒤에 **이번 글 관련 경로만**: `src/content/posts/<slug>.mdx`, `src/components/posts/<slug>/`, `public/images/<slug>/`, (1.5에서 갱신됐으면) `graphify-out/`, `src/data/graph.json`. **전체 add 금지**.
- 가드(브랜치 일치·secret·대용량·`pull --rebase`·`--force` 금지)는 스크립트가 적용. 자동 모드면 실제 push까지.
- 스크립트가 비0으로 끝나면 멈추고 원인(브랜치 불일치/secret/충돌 등)을 보고(자동 롤백 안 함).

### 3. 종료 보고
빌드 결과, 재검증 통과/실패 항목, commit 해시·push 결과(또는 실패 원인), 배포 URL 안내(`/posts/<slug>`).

## 멱등성
- 이미 같은 내용이 커밋돼 staged 변경이 없으면 git 스크립트가 "nothing to commit"으로 무해하게 끝난다(중복 커밋 방지).
- 재실행해도 빌드·검증을 다시 돌릴 뿐 새 부작용이 없어야 한다.

## 참조 파일
- `scripts/git-commit-push.sh` — 공유 git 가드(git-shipper가 호출). research 단계와 **동일 스크립트 재사용**(repo만 다름).

## 주의
- **검증 실패 시 push 금지.** 빌드/링크/frontmatter 중 하나라도 깨지면 배포하지 않고 보고한다.
- git은 **항상 가드 스크립트 경유**(직접 `git add -A`·`--force` 금지). push 두 지점(blog-research/블로그) 동일 정책.
- 자동 모드는 push까지 자동이지만 가드는 항상 적용된다 — secret/대용량/브랜치 안전장치는 우회하지 않는다.
