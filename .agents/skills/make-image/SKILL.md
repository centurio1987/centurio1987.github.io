---
name: make-image
description: >
  글에 들어갈 **구조형 정보 이미지**(비교표·단계 다이어그램·핵심 포인트 카드·인용 강조 박스, 그리고
  대표 1080² hero)를 HTML+CSS로 그려 Playwright(chromium)로 PNG 캡처하는 스킬. 본문의 펜스드 `figure`
  명세 블록(JSON)을 파싱해 `scripts/render-image.ts`로 렌더하고 `public/images/<slug>/`에 저장한 뒤
  블록을 `![alt](경로)`로 치환한다. 규격은 `assets/IMAGE_GUIDE.md`.
  "/make-image <파일>", "이 글 구조 이미지 만들어줘", "비교표 이미지로 뽑아줘" 같은 표현에 반응한다.
  개념·은유 일러스트(자유 회화)는 이 스킬이 아니라 `post-finalize`의 OpenAI `[[[…]]]` 경로가 맡는다(공존).
argument-hint: <article-file (figure 블록이 든 mdx)>
---

# make-image 스킬

**구조형 정보 이미지**(도형·표·카드)를 HTML+CSS로 그려 **Playwright로 PNG 캡처**한다. 자유 회화(개념·은유
일러스트)는 `post-finalize`의 OpenAI 경로가 담당하므로 두 방식은 **공존**한다 — 이 스킬은 *정보 전달용 도형*만.

> 렌더 런타임은 **Node/TS Playwright**(`scripts/render-image.ts`). 레포가 Bun이라 Python을 쓰지 않는다.

## 워크플로우 상의 위치

```
tech-deepdive (구조형 자리에 ```figure``` 명세 블록을 남김)
  → [make-image: figure 파싱 → render-image.ts → public/images/<slug>/ → 블록을 ![alt](경로)로 치환 → 잔존 검사]
  → (개념형 [[[…]]]는 post-finalize가 별도 처리)
```

## 입력 / 출력 계약

- **입력**: 펜스드 `figure` 명세 블록(JSON: `type`+`name`+`alt`+데이터)이 든 MDX 경로 + 글 slug.
- **출력**: `public/images/<slug>/<name>.png`(또는 webp) + MDX에서 각 `figure` 블록이 `![<alt>](/images/<slug>/<name>.ext)`로 치환됨.
  잔존 `figure` 블록 0개(검사 통과).
- **허용 type**(5종): `compare-table` / `step-diagram` / `point-cards` / `quote-box` / `hero`. 그 외는 오류.

## 동작 순서

### 1. figure 명세 수집
- 대상 MDX에서 모든 ```` ```figure ```` 블록을 찾아 JSON을 파싱한다. `type`이 5종 밖이면 오류로 멈춘다.
- 개념형 `[[[…]]]` 마커는 **건드리지 않는다**(정규식 비충돌 — post-finalize 담당).

### 2. 렌더 (`scripts/render-image.ts`)
각 블록마다:
```bash
bun run scripts/render-image.ts --spec '<figure JSON>' --out public/images/<slug>/<name>.png
```
- 입력은 JSON, 템플릿 주입 시 **HTML escaping** 적용(스크립트가 처리). **로컬 Pretendard `@font-face` + `document.fonts.ready`** 대기 후 캡처(FOUT 방지).
- **멱등**: 같은 출력 경로에 파일이 있으면 재생성하지 않는다(스크립트가 skip; `--force` 시에만 덮어씀).
- 규격은 `assets/IMAGE_GUIDE.md`(본문 4종 = 가로형, hero = 1080² 블루-퍼플 그라데이션·중앙 정렬).
- 사전 요건 미충족(playwright 미설치)이면 스크립트가 **종료코드 3**으로 설치 안내를 낸다.
  - **자동 모드 + 필수 이미지**: 이건 **hard fail**이다(조용한 skip 금지). 설치 안내를 보고하고 중단한다.
  - 사용자 직접 호출: 설치 명령(`bun add -d playwright && bunx playwright install chromium`)을 안내하고 재시도를 묻는다.

### 3. 본문 치환
- 렌더 성공한 블록을 `![<alt>](/images/<slug>/<name>.<ext>)`로 치환한다(Astro가 `public/`를 루트로 서빙).
- 모든 블록 처리 후 **잔존 `figure` 블록이 없는지 검사**한다. 남아 있으면 누락이므로 보고/재시도.

### 4. 종료 보고
생성한 이미지 경로 목록, 치환 건수, 잔존 figure 0 확인, (있으면) 실패한 블록과 원인을 보고한다.

## 참조 파일
- `assets/IMAGE_GUIDE.md` — 공통 규칙·본문 4종 규격·hero 1080² 규격·figure 마커 규약.
- `scripts/render-image.ts` — JSON spec → HTML 템플릿 → PNG 캡처(멱등, 폰트 대기).
- `scripts/image-templates.ts` — 5종 템플릿(escaping 포함).

## 주의
- **개념형/구조형 경계**: `[[[…]]]`(개념·은유)는 post-finalize, ```figure```(구조형)는 이 스킬. 서로 침범하지 않는다.
- **자동 모드 필수 이미지 실패 = hard fail.** 조용히 건너뛰지 않는다.
- 멱등: 이미 있으면 재생성 안 함(`--force` 예외).
- 이미지에 문단을 넣지 않는다 — 키워드·라벨 위주, 본문보다 압축.
- `<slug>`는 입력 파일 stem에서 `.md`/`.mdx`·`-draft` 제거.
