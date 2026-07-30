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
| `kind` | ✓ | 아래 6종 중 하나 |
| `data` | ✓ | kind별 데이터(아래) |
| `target` | | `"inline"`(기본) \| `"hero"` |
| `caption` | | 그림 아래 캡션(figcaption) |
| `alt` | | 접근성 대체텍스트(SVG `<title>`). 없으면 caption/title에서 유도 |
| `name` | | 컴포넌트/파일명 힌트(hero면 보통 `"hero"`) |
| `viewBox` | | 예 `"0 0 820 220"`. 생략 시 kind별 기본값 |

> **`size`는 없다.** 스키마(`commonShape`)에 없어 Zod가 버린다. hero 픽셀 크기는 **`viewBox` × 2**로 정해진다
> (`render-viz`가 deviceScaleFactor 2로 캡처). 그래서 `"0 0 600 338"` → 1200×676(OG 규격)이다.

**텍스트는 짧게.** 노드당 1~2줄, 긴 설명은 본문·캡션에 둔다.

---

## 렌더 규격 (필수 — 어기면 매번 같은 지적을 받는다)

아래는 tauri-1(KAN-007)·tauri-2(KAN-016)에서 실제 지적받고 고친 것들이다. **명세를 쓰는 시점에 지켜라.**

### R1. viewBox 폭은 620 이하

인라인 SVG는 본문 폭(약 632px)에 맞춰 `width:100%`로 스케일된다. viewBox 폭이 본문보다 넓으면
그만큼 **축소 렌더돼 글자가 작아진다**(폭 760 → 0.83배 → "글씨가 작다"). 620이 본문과 거의 등배다.
**높이도 콘텐츠에 맞춘다** — 남는 세로 여백은 그대로 빈 공간으로 렌더된다(Comparison 항목 4개면 250 안팎).

### R2. Flowchart 엣지는 축(수직·수평) 정렬로만

`routing:"straight"`를 **모든 엣지에 명시**한다(생략 시 orthogonal로 꺾이며 노드를 침범한다).
그리고 **연결할 두 노드의 중심을 x 또는 y 중 하나로 정렬**한다.
대각선 엣지는 앵커가 가장 가까운 면으로 잡혀 **선이 노드 몸통을 관통한다** — 분기도 예외가 아니다.
분기가 필요하면 주 경로는 아래로, 예외 경로는 옆으로 빼서 둘 다 축정렬로 만든다.

```
       [호출]                    ✗ 대각선 분기 (노드 관통)
          ↓                            [대조]
       [심사]                          ↙    ↘
          ↓                       [통과]    [거절]
       [대조] → [거절]           ✓ 아래로 주 경로, 옆으로 예외
          ↓
       [통과]
```

### R3. Flowchart 엣지 label 은 렌더되지 않는다

`edges[].label`은 화면에 그려지지 않는다. **정보는 노드 `label`에 담아라**
(예: 엣지 "invoke" 대신 노드 `"IPC — invoke ↓ · Channel send ↑"`). 엣지에만 적은 정보는 사라진다.

### R3-1. 노드 `shape` 는 정해진 이름만 — 모르는 이름은 **조용히 사각형**이 된다

`renderShapeElements` 의 `default` 가 `rectPath` 라, 오타나 짐작한 이름(mermaid 어휘 `"decision"` 등)을
써도 경고 없이 평범한 상자로 그려진다. 분기 노드를 넣었는데 다른 노드와 똑같이 보이면 이것이다
(vpn-anatomy-7 에서 실제로 그랬다 — 분기가 사각형으로 렌더되고 있었다).

쓸 수 있는 이름은 이 15개뿐이고, 이제 **Zod 스키마가 authoring 시점에 막는다**(`src/lib/viz/schema.ts`):

```
rect · rounded · stadium · circle · ellipse · diamond · cylinder · hexagon
parallelogram · trapezoid · subroutine · doubleCircle · cube · component · folder
```

분기·판단 노드는 **`diamond`** 다. 마름모는 같은 bbox 의 사각형보다 쓸 수 있는 넓이가 훨씬 좁으니
(가장 넓은 곳이 세로 중앙선 한 줄뿐) 라벨은 한 줄로 짧게 두고, 폭을 넉넉히 준다.

### R4. hero는 `PosterHero`를 쓴다 — 제목·부제만 크게

hero는 본문 최상단이자 **OG 이미지이자 시리즈 카드 썸네일**이다. 작은 썸네일에서 읽히지 않는 글자는 없느니만 못하다.
- **`PosterEditorial`을 hero로 쓰지 마라.** 패키지 구현이 `title`을 **줄바꿈 없는 단일 `<text fontSize=54>`**로
  그려서, 폭을 넘는 제목은 경고 없이 오른쪽이 **잘린다**(한글 약 10자가 한계, `subtitle`·`items`도 같다).
  로컬 kind `PosterHero`(`src/lib/viz/PosterHero.tsx`)가 자동 줄바꿈 + 자동 크기 맞춤으로 이 문제를 없앤다.
- `viewBox`는 `"0 0 600 338"` 안팎(래스터는 deviceScaleFactor 2로 1200x676 = OG 규격).
  viewBox를 키울수록 글자만 작아진다(1200x675로 렌더하면 글씨가 1.67배 작아진다).
- `title`은 프론트매터 제목의 앞부분(부제 분리 전), `subtitle`은 25자 이내 한 줄이 가장 크게 나온다.
  길수록 자동으로 작아질 뿐 잘리지는 않는다.

### R5. 발행 전 실제 렌더를 눈으로 본다

빌드 통과는 "그림이 읽힌다"를 보장하지 않는다. `astro dev`(또는 `preview`) 위에서 요소를 캡처해 확인한다.

```bash
# 예: figure 별 캡처 (프로젝트 node_modules 의 playwright 사용)
bun -e 'const {chromium}=await import("./node_modules/playwright/index.mjs");
const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:1200},deviceScaleFactor:2});
await p.goto("http://localhost:4321/posts/<slug>",{waitUntil:"networkidle"});
const f=p.locator("figure.viz-figure");for(let i=0;i<await f.count();i++)await f.nth(i).screenshot({path:`/tmp/fig-${i+1}.png`});
await b.close()'
```

### R6. 텍스트 넘침은 사람이 아니라 `viz:verify` 가 잡는다

**증상.** 그림의 글이 상자를 벗어나 문장 중간에서 잘린 채 렌더된다.

**원인.** SVG `<text>` 는 리플로도 클리핑도 하지 않는다. 상자보다 긴 라벨은 **에러 없이** 밖으로
흘러 viewBox 경계에서 잘린다. 빌드도 타입도 초록이다. 게다가 패키지 컴포넌트는 라벨을
**줄바꿈 없는 단일 `<text>`** 로 그리고, 패키지의 `estimateWidth` 는 글자 종류와 무관하게
`0.55 × fontSize` 를 쓰므로 **전각인 한글을 약 45% 과소평가**한다 — 패키지의 `wrapText` 를 써도
한글 줄은 넘치고, "안 잘린다"는 판정 자체가 틀린다.

**해결(구조).** 자주 쓰는 kind 는 레포 로컬 구현으로 대체했다(`src/lib/viz/`, `LOCAL_VIZ_KINDS`):
`PosterHero` · `Comparison` · `ProcessSteps`. 셋 다 `src/lib/viz/text.ts` 의 전각 기준으로
**자동 줄바꿈**하고, **높이를 콘텐츠에서 되뽑는다**(저작 viewBox 의 높이는 무시 — 폭만 계약이다).
그래서 항목이 길어도 넘치지 않고 짧아도 빈 여백이 남지 않는다.

**해결(재발 방지).** 판정을 사람 눈에서 기계로 옮겼다:

```bash
bun run viz:verify              # 전 글 (astro dev/preview 필요)
bun run viz:verify vpn-anatomy-7 --base http://localhost:4323
```

모든 `figure.viz-figure svg` 의 `<text>` 를 담는 상자(`rect[data-viz-part="shape"]`) 또는 viewBox 와
재서 넘치면 **비0으로 끝난다**. R5(눈으로 보기)는 배치·가독성용으로 남기고, 넘침은 여기서 끊는다.

> 이 규칙이 R1~R5 와 다른 점: **"텍스트를 짧게 써라"는 권고였고 두 번 다 지켜지지 않았다**
> (KAN-016 에서 고쳤다고 적었으나 vpn-anatomy-7 에서 재발). 권고는 재발을 막지 못한다.

---

## v1 지원 kind (6종)

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

### 5. `PosterHero` — hero 대표 이미지 (로컬 kind, **hero는 이걸 쓴다**)
```json
{ "kind":"PosterHero", "target":"hero", "name":"hero",
  "alt":"로그인 뒤의 지형도",
  "data": { "eyebrow":"AUTH 해부 · EP1", "title":"로그인 화면 뒤에 숨은 지형도", "subtitle":"인증과 인가의 경계" } }
```
- `target:"hero"`로 써서 `public/images/<slug>/hero.webp`를 만든다(본문 최상단 + OG + 시리즈 썸네일 겸용).
- 제목이 길면 **어절 경계에서 자동으로 줄바꿈**하고(균형 줄바꿈), 줄 수와 지면 높이에 맞춰 글자 크기를
  후보 사다리(64→28)에서 자동으로 낮춘다. 부제까지 지면 안에 드는지 함께 본다 — **잘리지 않는다.**
- 선택 필드: `maxTitleLines`(기본 3, 1~4) · `maxSubtitleLines`(기본 2, 1~3).
- 구현은 `src/lib/viz/PosterHero.tsx`(패키지 아님). `render-viz`/`apply-viz`의 KIND 맵에 등록돼 있다.

### 5-1. `PosterEditorial` — 패키지 원본 포스터 (**hero로 쓰지 마라**)
`items` 목록 지면이 필요할 때만 쓴다. `title`/`subtitle`/`items` 모두 **줄바꿈도 말줄임도 없이** 한 줄로
그려져 폭을 넘으면 잘린다(한글 약 10자). 자세한 건 R4.

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
