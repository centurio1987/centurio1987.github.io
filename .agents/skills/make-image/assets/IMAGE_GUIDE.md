# viz 가이드 (구조형 시각물)

`make-image`(viz 엔진)가 **@centurio1987/bbangto-ui-visualization** 컴포넌트로 구현하는 구조형 시각물의 규격이다.
저작자는 본문에 ```` ```viz``` ```` 블록(JSON)을 남기고, `scripts/apply-viz.ts`가 이를 처리한다.

- **inline**(기본): co-located `.tsx` → **SSR 정적 SVG**(무JS 페인트, 전역 shim `src/styles/viz.css`).
- **hero**: 같은 컴포넌트를 `scripts/render-viz.ts`(Playwright)로 **webp 래스터**(OG·시리즈 썸네일용 실제 파일).

스타일은 `src/lib/viz/blogVizStyleGuide.ts`(밝은 흙빛 배경 + 잉크 외곽선 + 역할색)가 주입한다. 디자인 원칙은
`design-concept/DIAGRAM_STYLE_GUIDE.md`를 따른다: **관계가 주인공, 색은 의미(역할)만, 텍스트 최소화**.

> 인터랙티브(움직여야 이해되는) 것은 `react-sim`, 실재 인터넷 밈은 `meme-inserter`. viz는 정적 구조형만.

---

## 공통 필드 (모든 kind)

| 필드 | 필수 | 설명 |
|---|---|---|
| `kind` | ✓ | 아래 5종 중 하나 |
| `data` | ✓ | kind별 데이터(아래) |
| `target` | | `"inline"`(기본) \| `"hero"` |
| `caption` | | 그림 아래 캡션(figcaption) |
| `alt` | | 접근성 대체텍스트(SVG `<title>`). 없으면 caption/title에서 유도 |
| `name` | | 컴포넌트/파일명 힌트(hero면 보통 `"hero"`) |
| `viewBox` | | 예 `"0 0 820 220"`. 생략 시 kind별 기본값 |
| `size` | | hero 픽셀 크기 `{"w":1200,"h":675}` |

**텍스트는 짧게.** 노드당 1~2줄, 긴 설명은 본문·캡션에 둔다.

---

## v1 지원 kind (5종)

### 1. `ProcessSteps` — 순차 단계 (입력→처리→출력, 워크플로)
```json
{ "kind":"ProcessSteps", "orientation":"horizontal",
  "data": { "steps": [ {"title":"요청","description":"클라이언트 입력"}, {"title":"검증"}, {"title":"응답"} ] } }
```
- `orientation`: `"horizontal"`(기본) \| `"vertical"` \| `"zigzag"`. `steps[].description` 선택.

### 2. `Comparison` — 좌우 2열 비교 (A vs B) — 구 compare-table 대체
```json
{ "kind":"Comparison", "mode":"split",
  "data": { "left": {"label":"REST","items":["여러 엔드포인트","over-fetching"]},
            "right": {"label":"GraphQL","items":["단일 엔드포인트","정확한 조회"]} } }
```
- `mode`: `"split"`(기본) \| `"magnitude"`(pane에 `value` 숫자로 크기 비교).

### 3. `Flowchart` — 노드+엣지 흐름/아키텍처 (좌표 지정) — 구 step-diagram/개념도 대체
```json
{ "kind":"Flowchart", "showGrid": false,
  "data": {
    "nodes": [ {"id":"a","x":40,"y":40,"width":150,"height":60,"label":"클라이언트"},
               {"id":"b","x":320,"y":40,"width":150,"height":60,"label":"서버"} ],
    "edges": [ {"id":"e1","from":"a","to":"b","label":"요청"} ] } }
```
- 노드는 `x/y/width/height` 필수(레이아웃을 저작자가 배치). `shape`/`fill`/`stroke` 선택. viewBox 생략 시 노드 bbox에서 자동 계산.

### 4. `Statistics` — 수치·지표 카드 — 구 point-cards 대체
```json
{ "kind":"Statistics", "mode":"cards",
  "data": { "items": [ {"label":"응답시간","value":120,"unit":"ms"}, {"label":"가용성","value":99.9,"unit":"%","delta":-0.1} ] } }
```
- `mode`: `"cards"`(기본) \| `"isotype"` \| `"mosaic"` \| `"waffle"`. `value`는 숫자/문자열, `unit`/`delta`/`count` 선택.

### 5. `PosterEditorial` — hero 대표 이미지 (에디토리얼 포스터) — 구 OpenAI hero 대체
```json
{ "kind":"PosterEditorial", "target":"hero", "name":"hero",
  "alt":"로그인 뒤의 지형도",
  "data": { "eyebrow":"AUTH 해부 시리즈", "title":"로그인 화면 뒤에 숨은 지형도", "subtitle":"인증과 인가의 경계",
            "items":["세션 vs 토큰","인증 ≠ 인가"] },
  "size": { "w":1200, "h":675 } }
```
- 보통 `target:"hero"`로 써서 `public/images/<slug>/hero.webp`를 만든다(본문 최상단 + OG + 시리즈 썸네일 겸용).

> 구 make-image 5종(`compare-table`/`step-diagram`/`point-cards`/`quote-box`/`hero`)과 구 `[[[…]]]`·`(( ))`는 위 kind로 매핑되어 은퇴했다.

---

## 역할 팔레트 (blogVizStyleGuide, DIAGRAM_STYLE_GUIDE §2)

배경 paper `#F3EEE4` / surface, 외곽선 ink `#20264A`. 색은 **역할**에만:
핵심흐름 `#4E6CA8` · 강조 `#D8A33F` · 위험/반례 `#A84B4B` · 도메인 `#3E6B4F` · 기술 `#3E6B6B` · 설계 `#7A5C7E` · 품질 `#6B6B3E` · 리서치 `#B07A2E`.
그라데이션·네온·유리효과·3D 금지.

---

## 출력·참조 경로 (Astro)

- inline 컴포넌트: `src/components/posts/<slug>/<Name>.tsx`, MDX import `../../components/posts/<slug>/<Name>`.
- hero 래스터: `public/images/<slug>/hero.webp`, 본문 참조 `/images/<slug>/hero.webp`.
- `<slug>`: 입력 파일 stem에서 `.md`/`.mdx`·`-draft` 제거.

## 검증 (필수)

1. `bunx tsc --noEmit` — 생성된 `.tsx` 타입.
2. `bun run build` — 전체 빌드(단일 JSX 오류가 사이트 전체를 깬다).
3. 인라인 SVG 색 페인트는 **`astro preview`(HTTP)** 로 확인. `file://`는 외부 스타일시트 quirk로 색이 안 칠해져 보이니 판단 근거로 쓰지 않는다.

## 사전 요건 (hero 래스터, 발행 시점 로컬만)

- `bun add -d playwright` + `bunx playwright install chromium`.
- webp 변환: `cwebp`(libwebp) 또는 `sharp`.
- CI(astro build)는 커밋된 결과물만 소비하므로 이 도구들이 필요 없다.
