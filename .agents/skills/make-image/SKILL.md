---
name: make-image
description: >
  글에 들어갈 **구조형 시각물**(다이어그램·차트·인포그래픽·hero)을 유저의 디자인 시스템 패키지
  **@centurio1987/bbangto-ui-visualization** 컴포넌트로 직접 구현하는 스킬(구 이름 유지 — 실제로는 viz 엔진).
  본문의 펜스드 ```` ```viz``` ```` 명세 블록(JSON)을 `scripts/apply-viz.ts`로 처리한다:
  target:"inline"이면 co-located React 컴포넌트(.tsx)를 만들어 **SSR 정적 SVG**로 본문에 심고,
  target:"hero"이면 그 컴포넌트를 `scripts/render-viz.ts`(Playwright)로 래스터해 `public/images/<slug>/<name>.webp`를 만든다.
  ChatGPT/OpenAI 이미지 생성을 쓰지 않는다. 규격·kind는 `assets/IMAGE_GUIDE.md`.
  "/make-image <파일>", "이 글 다이어그램 만들어줘", "비교/흐름 시각화해줘" 같은 표현에 반응한다.
argument-hint: <article-file (viz 블록이 든 mdx)>
---

# make-image 스킬 (viz 엔진)

글의 **구조형 시각물**(다이어그램·차트·인포그래픽·hero)을 유저 디자인 시스템 패키지
`@centurio1987/bbangto-ui-visualization`의 headless React 컴포넌트로 구현한다. 래스터 생성을 ChatGPT에
요청하지 않고 **코드로 직접 시각화**한다. 스타일은 블로그 전용 가이드(`src/lib/viz/blogVizStyleGuide.ts`)가
주입한다(밝은 흙빛 배경 + 잉크 외곽선 + 역할색).

> 렌더: 본문 다이어그램은 **client directive 없는 SSR 인라인 SVG**(무JS로 색이 칠해진다 — 전역 shim `src/styles/viz.css`).
> hero/OG 래스터만 Playwright로 webp를 굽는다.

## 워크플로우 상의 위치

```
tech-deepdive (구조형·hero 자리에 ```viz``` 명세 블록을 남김)
  → [make-image: apply-viz.ts → inline은 .tsx+SSR SVG, hero는 render-viz.ts webp → 블록 치환 → 검증]
  → (인터랙티브 시뮬은 react-sim, 실재 밈은 meme-inserter)
```

## 입력 / 출력 계약

- **입력**: 펜스드 ```` ```viz``` ```` 명세 블록(JSON)이 든 MDX 경로 + 글 slug.
- **출력**:
  - `target:"inline"` → `src/components/posts/<slug>/<Name>.tsx` 생성 + MDX 상단 import 삽입 + 블록을 `<Name />`로 치환(무 client directive = SSR 정적 SVG).
  - `target:"hero"` → `public/images/<slug>/<name>.webp` 생성 + 블록을 `![alt](/images/<slug>/<name>.webp)`로 치환.
  - 잔존 `viz` 블록 0개(검사 통과).
- **v1 지원 kind(5종)**: `ProcessSteps`(단계) · `Comparison`(비교) · `Flowchart`(흐름) · `Statistics`(수치) · `PosterEditorial`(hero). 그 외/오타는 Zod 검증 실패로 명확히 보고. (`src/lib/viz/schema.ts`)

## viz 블록 문법

````markdown
```viz
{ "target": "inline",
  "kind": "ProcessSteps",
  "caption": "요청 처리 4단계",
  "alt": "요청부터 응답까지의 처리 단계",
  "data": { "steps": [ {"title":"요청","description":"입력"}, {"title":"검증"}, {"title":"처리"}, {"title":"응답"} ] } }
```
````

- `target` 생략 시 `"inline"`. hero(본문 대표 이미지·OG)면 `"hero"` + `"name":"hero"`.
- kind별 `data` 필수 필드는 `assets/IMAGE_GUIDE.md` 참조.
- `alt`(접근성)·`caption`은 권장. `viewBox`·`size`(hero)는 선택.

## 동작 순서

### 1. 처리 실행
```bash
bun scripts/apply-viz.ts <대상 MDX> [--slug <slug>] [--force]
```
- 엔진이 모든 ```viz``` 블록을 찾아 Zod 검증 → inline은 코드생성+치환, hero는 래스터+치환.
- 검증 실패 블록은 **그대로 두고** 이유를 보고(부분 실패 허용).
- 멱등: 같은 컴포넌트/webp가 이미 있으면 `--force` 없이는 재생성 안 함.
- hero 래스터 사전 요건(발행 시점 로컬): playwright chromium + cwebp(libwebp) 또는 sharp. 미충족이면 명확히 안내(블록 유지).

### 2. 검증 (중요 — file:// 아닌 HTTP로)
- `bunx tsc --noEmit` 로 생성된 `.tsx` 타입 확인.
- `bun run build` 통과 확인(단일 JSX 오류가 전체 빌드 파괴).
- 인라인 SVG 색 페인트는 **`astro preview`(HTTP)** 로 확인한다. `file://`는 외부 스타일시트 적용 quirk로 색이 안 칠해져 보일 수 있으니 판단 근거로 쓰지 않는다.

### 3. 종료 보고
생성 컴포넌트/webp 경로, 치환 건수, 잔존 viz 0 확인, (있으면) 검증 실패 블록과 원인을 보고한다.

## 참조 파일
- `assets/IMAGE_GUIDE.md` — kind별 data 규격·역할 팔레트·"무엇을 어떤 kind로".
- `scripts/apply-viz.ts` — viz 블록 → inline 코드생성 / hero 위탁.
- `scripts/render-viz.ts` — 컴포넌트 → Playwright → webp 래스터.
- `src/lib/viz/{schema,layout,blogVizStyleGuide}.ts` · `src/components/viz/VizFigure.tsx` · `src/styles/viz.css`.
- 디자인 규칙: `design-concept/DIAGRAM_STYLE_GUIDE.md`.

## 주의
- **ChatGPT 이미지 생성 금지.** 시각물은 패키지 컴포넌트로 직접 구현한다.
- **인터랙티브 시뮬은 react-sim**, **실재 인터넷 밈은 meme-inserter** 담당. viz는 정적 구조형만.
- **레거시 마커 금지**: 새 글은 ```figure```·`[[[…]]]`·`(( ))` 대신 ```viz```를 쓴다(구 마커는 post-finalize가 경고).
- `<slug>`는 입력 파일 stem에서 `.md`/`.mdx`·`-draft` 제거.
- 자동 모드에서 hero 래스터 사전요건 미충족 시 조용히 넘기지 말고 보고한다.
