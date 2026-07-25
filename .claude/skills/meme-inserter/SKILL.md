---
name: meme-inserter
description: >-
  글 본문에 남겨둔 `<<meme: 힌트>>` 플레이스홀더(예: `<<meme: 불타는 방 안에서 괜찮다는 강아지>>`,
  `<<meme: 리액션 놀란 표정 짤>>`)를 포착해, 힌트로 인터넷 밈 사진·움짤(GIF)을 검색·다운로드하고
  본문의 그 자리를 `![](로컬 경로)`로 치환하는 스킬. 한국 밈·짤을 최우선으로 찾는다. 소스 우선순위는
  ① 브라우저 조작 MCP(메인: aside, 없으면 다른 브라우저 MCP)로 유저의 실 로그인 세션을 타고 Pinterest
  고해상도 짤을 DOM에서 추출 → ② Tenor/Giphy API(ko 로케일) → ③ WebSearch+curl 폴백. 브라우저 MCP가
  없는 자동 발행 환경에선 ②③으로 조용히 폴백한다. 사용자가 "밈 넣어줘", "`<<meme:>>` 자리 채워줘", "움짤 포착해서 넣어줘", "이 글 밈 플레이스홀더
  처리해줘", "/meme-inserter <파일>" 같이 요청하거나, `.md`/`.mdx` 문서에 `<<meme: ... >>` 마커가 있고 이를
  실제 밈 이미지로 바꾸려는 맥락이면 반드시 이 스킬을 사용한다. raws→draft→post 집필 파이프라인에서
  post-finalize 단계가 이 스킬을 위탁 호출하기도 한다. 구조형 시각물(```viz``` → make-image/bbangto-ui-visualization),
  인터랙티브 시뮬(`<Name client:visible />` → react-sim)과는 마커가
  달라 서로 침범하지 않는다. AI로 밈을 "생성"하지는 않고, 실재하는 인터넷 밈을 가져온다.
argument-hint: <post-or-draft-file-path>
---

# Meme Inserter 스킬

글쓴이가 "여기에 밈/움짤이 들어갈 자리"로 남겨둔 `<<meme: 힌트>>` 플레이스홀더를,
힌트로 실제 인터넷 밈(사진·GIF)을 찾아 다운로드하고 본문의 그 자리를 `![](...)` 로 치환하는 스킬이다.

AI로 밈을 **생성**하지 않는다. 브라우저 MCP(aside)로 Pinterest를 긁거나, Tenor/Giphy·WebSearch로
실재하는 밈을 **가져온다**.

## 마커 규약 — 다른 이미지 스킬과 비충돌

이 프로젝트는 자리표시자 종류마다 마커가 다르다. 이 스킬은 **`<<meme: ...>>`만** 건드린다:

| 마커 | 담당 스킬 | 용도 |
|------|-----------|------|
| `<<meme: 힌트>>` | **meme-inserter (이 스킬)** | 실재 인터넷 밈 사진·움짤 |
| ` ```viz``` ` | make-image (viz 엔진) | 다이어그램·차트·인포그래픽·hero (bbangto-ui-visualization) |
| `<Name client:visible />` | react-sim | 인터랙티브 시뮬레이션 |
| ~~`(( ))`·`[[[ ]]]`·```figure```~~ | (은퇴) | 모두 ```viz``` 로 대체 |

정규식이 서로 겹치지 않으므로 한 문서에 여러 종류가 섞여 있어도 안전하다. 다른 마커는 절대 손대지 않는다.

## 경로 규약 (Astro)

- 대상 파일: `src/content/posts/<slug>.md`/`.mdx`, 또는 발행 전 `draft/<…>.md`/`.mdx`
- 밈 저장: `public/images/<slug>/memes/<n>.<ext>`  (`<ext>` = gif/webp/png/jpg)
- 참조 경로: `/images/<slug>/memes/<n>.<ext>`  (Astro는 `public/`를 사이트 루트로 서빙 → `public` 접두사 제거)
- `<slug>`: 입력 파일명 stem에서 `.md`/`.mdx`·`-draft` 접미사를 제거한 값.

## 동작 순서

### 1. 대상 파일 경로 확인
인자가 있으면 사용. 없으면 묻는다:

> "어느 파일의 `<<meme:>>` 자리를 채울까요? (예: `src/content/posts/webrtc-1.md`)"

확장자가 `.md`/`.mdx`가 아니면 중단. 공백/한글 경로는 따옴표 처리.

### 2. 마커 수집
빠뜨리지 않도록 스크립트로 전부 뽑아 순번·줄·소속 헤딩과 함께 확인한다:

```bash
python3 .claude/skills/meme-inserter/scripts/find_markers.py "<파일 경로>"
```

- `[in-fence]` 표시가 붙은 마커는 코드펜스 안 예시일 수 있으니 치환 대상에서 제외할지 본문 맥락으로 판단.
- 등장 순서대로 1부터 번호를 매긴다(저장 파일명 `<n>`이 된다).

### 3. 각 마커 처리 (순차, 병렬 금지)

각 마커의 힌트에 대해 순서대로:

**3-1. 검색 쿼리 정제 (한국 밈 우선).**
힌트를 밈 검색에 잘 걸리는 쿼리로 다듬는다. 이 블로그는 한국어 독자 대상이므로 **한국 밈·짤을 최우선**으로 찾는다. 원 힌트는 alt 텍스트로 그대로 보존한다.

우선순위:
1. **한국어 그대로 + 밈 키워드.** 한국어 힌트에 `짤`/`움짤`/`밈`/`드립`을 붙여 국내 밈을 먼저 노린다.
   - `괜찮다는 강아지` → `괜찮아 강아지 짤`
   - `놀란 표정 리액션` → `놀람 리액션 짤`, `충격 짤`
   - 한국 특유 밈이면 그 이름으로: `무한도전 정형돈 짤`, `주호민 예? 짤`, `침착맨 짤`
2. **한국어로 결과가 없을 때만 영어 밈 관용구로 폴백.**
   - `불타는 방 안에서 괜찮다는 강아지` → (국내 미검색 시) `this is fine dog fire`
   - `놀라서 땀 흘리며 버튼 고민` → `sweating guy two buttons`
- API 검색은 스크립트가 한국 로케일(`ko_KR`/`KR`/`lang=ko`)을 이미 걸어 국내 결과로 편향하므로, **한국어 쿼리를 그대로** 넘기면 된다.

**3-2. 소스 선택 (우선순위).**
상황에 따라 아래 순서로 시도한다. 각 티어가 실패하면 다음 티어로 폴백한다.

| 순위 | 티어 | 언제 | 강점 |
|------|------|------|------|
| 1 | **브라우저 MCP (메인: aside)** | 브라우저 조작 MCP가 연결돼 있을 때 | 유저 실 로그인 세션으로 Pinterest 벽 통과, 한국 짤 최적 |
| 2 | **API(Tenor→Giphy)** | `TENOR_API_KEY`/`GIPHY_API_KEY` 있을 때 | 빠르고 무인(無人)·헤드리스 가능 |
| 3 | **WebSearch+curl** | 위 둘 다 불가(자동 발행·키 없음) | 도구 의존 최소, 항상 동작 |

> **벤더 중립**: 1순위는 특정 제품이 아니라 "연결된 브라우저 조작 MCP"다. **메인은 aside**, 없으면 다른 브라우저 MCP(Playwright MCP, Browser MCP 등)도 원리가 같아 그대로 쓴다. 자동 파이프라인(post-finalize 헤드리스 발행) 등 브라우저 MCP가 없는 환경에선 1을 건너뛰고 2→3으로 간다. 브라우저 티어는 **있으면 쓰고 없으면 조용히 폴백**한다(스킬을 실패시키지 않는다).

**3-3. 브라우저 티어 — aside MCP로 Pinterest 로그인 세션 (메인, 한국 짤 최적).**
브라우저 조작 MCP로 유저의 **실 로그인 세션**을 그대로 타 Pinterest에서 고해상도 짤을 긁는다. **메인은 `aside` MCP**다. aside가 없으면 다른 브라우저 조작 MCP(Playwright MCP, Browser MCP 등)로도 동일하게 진행한다. 하나도 연결/사용 불가면 이 티어를 포기하고 **3-4로 폴백**한다.

> **전제(aside 기준).** `aside` MCP가 `mcp.json`에 등록·연결돼 있고, 로컬 **Aside 앱이 실행 + 계정 로그인** 상태여야 한다(`aside account status`로 확인). 미연결·미로그인이면 조용히 3-4로 간다(스킬을 실패시키지 않는다).

1. **브라우저 MCP 툴 확보.** 브라우저 조작 툴은 deferred일 수 있으니 `ToolSearch`로 검색해 로드한다. aside 우선:
   `ToolSearch "aside browser navigate"` (또는 알고 있으면 `select:mcp__aside__…`). 없으면 `ToolSearch "browser navigate scroll dom"`으로 연결된 다른 브라우저 MCP를 찾는다.
   - 필요한 능력: **페이지 열기(navigate)**, **스크롤**, **페이지 내 JS 실행/DOM 읽기**, (다운로드용) fetch. 이 능력을 제공하는 툴을 골라 쓴다. 툴 이름은 MCP마다 다르므로 하드코딩하지 말고 검색 결과에서 확인한다.
   - 검색 결과가 비면(브라우저 MCP 미연결) → 3-4.
2. **세션 확인.** 브라우저 MCP는 유저 로그인 프로필을 그대로 쓰므로 Pinterest 로그인 벽을 대개 통과한다. 그래도 로그인 화면으로 막히면(미로그인) 이 티어 포기 → 3-4.
3. **검색 열기.** Pinterest 핀 검색으로 navigate: `https://www.pinterest.com/search/pins/?q=<URL 인코딩한 한국어 힌트>` (예: `...?q=놀람%20리액션%20짤`).
4. **lazy-load 강제.** 아래로 여러 번 스크롤해 핀 이미지를 실제 렌더시킨다.
5. **DOM에서 원본 URL 추출.** 페이지 내 JS 실행으로 렌더된 `<img>`에서 `i.pinimg.com` src를 모으고 썸네일 크기를 `/originals/`로 승격:
   ```js
   [...new Set([...document.querySelectorAll('img')]
     .map(i => i.currentSrc || i.src)
     .filter(u => u && u.includes('i.pinimg.com'))
     .map(u => u.replace(/\/\d+x\//, '/originals/')))]
     .slice(0, 8)
   ```
   반환된 후보 중 힌트에 맞는 것을 고른다(여러 개면 상위부터). **이미 이 문서에서 쓴 URL은 건너뛰고** 다음 후보로(중복 금지).
6. **다운로드.** pinimg originals는 공개 CDN이라 셸에서 바로 저장:
   ```bash
   mkdir -p "public/images/<slug>/memes"
   curl -fsSL -A "Mozilla/5.0" "<originals URL>" -o "public/images/<slug>/memes/<n>.<ext>"
   ```
   `/originals/`가 404면(모든 크기에 originals가 있는 건 아님) 승격 전 최대 해상도(`/736x/` 등) URL로 재시도. curl이 막히면 브라우저 MCP의 페이지 컨텍스트에서 `fetch(url).then(r=>r.blob())` → base64로 받아 저장.

**3-4. API 티어 — Tenor → Giphy.**
```bash
bun run .claude/skills/meme-inserter/scripts/fetch-meme.ts "<정제 쿼리>" "public/images/<slug>/memes/<n>"
```
- 성공: stdout에 `{"ok":true,"path":"...","source":"tenor|giphy","url":"...","ext":"..."}` JSON 한 줄. `path`를 치환에 사용.
- **exit 3 + `NO_API_KEY`**: 키 둘 다 없음 → **3-5 WebSearch 폴백**으로.
- **exit 4 + `NO_RESULT`/`FETCH_FAILED`**: 키는 있으나 결과 없음/실패 → 한국어 쿼리를 한 번 더 다듬어 재시도, 그래도 없으면 WebSearch 폴백.
- bun 미설치 시 `bunx`/`node`로 대체 시도(스크립트는 bun 런타임 가정).

**3-5. WebSearch + curl 폴백 (브라우저·키 모두 불가할 때).**
헤드리스·무인 환경의 최후 수단. 여기서도 **Pinterest를 1순위**로 뒤진다.

1. **Pinterest 먼저.** `WebSearch`: `site:pinterest.com <한국어 힌트> 짤`.
   - 핀 페이지를 `WebFetch`로 열어 `i.pinimg.com/...` URL을 찾고, 썸네일(`/236x/`·`/564x/`)이면 `/originals/`로 승격.
2. **그다음 일반 웹.** 못 찾으면 `<한국어 힌트> 짤 gif`, 이어서 tenor/giphy/imgur 직접 미디어 링크.
3. 결과에서 **직접 미디어 URL**을 골라 다운로드:
   ```bash
   mkdir -p "public/images/<slug>/memes"
   curl -fsSL -A "Mozilla/5.0" "<미디어 URL>" -o "public/images/<slug>/memes/<n>.<ext>"
   ```
   (`i.pinimg.com`은 UA 없으면 403 → `-A` 필수.)
4. 저작권·부적절 콘텐츠 주의(안전한 공개 밈 위주, 성인/혐오/워터마크 과한 것 회피).

**3-6. 본문 치환.**
성공하면 `<<meme: 힌트>>` 마커 전체를 다음으로 교체:
```markdown
![<힌트 원문 그대로>](/images/<slug>/memes/<n>.<ext>)
```
- alt에는 **원 힌트 텍스트**를 그대로 넣어 접근성·검색성을 지킨다.
- 실패하면 그 마커는 원본 그대로 두고 다음으로. 전체 중단하지 않는다(부분 실패 허용).

### 4. (선택) webp 변환
용량이 큰 GIF/이미지는 프로젝트 관례(webp 선호)에 맞춰 변환을 권장한다.
`gif2webp`/`cwebp`가 있으면 `image-to-webp` 스킬로 위임하거나 직접 변환하고, 참조 경로의 확장자도 `.webp`로 갱신한다. 도구가 없으면 원본 확장자 그대로 두고 건너뛴다(스킬을 실패시키지 않는다).

### 5. 검증
`find_markers.py`를 **다시 돌려** 남은 `<<meme:>>` 마커가 0개인지(전부 치환·또는 의도적으로 남긴 것만인지) 확인한다.

### 6. 저장 + 요약 보고
frontmatter·JSX import·`(( ))`·`[[[ ]]]`·```figure``` 등 다른 영역을 건드리지 않았는지 확인하고 저장. 짧게 보고:

> "밈 삽입 완료:
> - 처리: 마커 3개 (성공 3 / 실패 0) — 각 마커당 서로 다른 밈 1개, 중복 없음
> - 소스: aside/pinterest 2, tenor 1
> - 저장: `public/images/webrtc-1/memes/` (1.jpg, 2.gif, 3.webp)"

(파일명 `1·2·3`은 마커 등장 순번이고 확장자는 각 밈의 파일 형식일 뿐 — 우선순위나 중복이 아니다.)

## 지킬 원칙

- **`<<meme:>>`만 건드린다.** `(( ))`·`[[[ ]]]`·```figure```·frontmatter·JSX는 절대 손대지 않는다.
- **원 힌트를 alt로 보존.** `<<meme: X>>`의 `X`가 그대로 alt 텍스트.
- **호출 직렬화.** 밈은 하나씩 순차 처리(병렬 금지) — 파일명 순번 꼬임·레이트리밋 방지.
- **중복 금지.** 한 문서 안에서 이미 쓴 밈은 다시 쓰지 않는다. 처리 중 **사용한 소스 URL(+ 파일 내용/해시)을 기록**해 두고, 검색·추출 결과가 기존과 겹치면 그 후보를 버리고 다음 후보를 고른다. 티어가 달라도(브라우저↔API) 같은 밈이면 중복으로 본다.
- **부분 실패 허용.** 실패한 마커는 원본 그대로 두고 계속, 마지막에 몇 개 실패했는지 보고.
- **키 없음은 조용히 폴백.** `NO_API_KEY`면 중단하지 말고 Pinterest→WebSearch로 넘어간다.
- **한국 밈 우선.** 한국어 짤을 먼저 찾고, 국내에서 못 찾을 때만 영어 밈으로 넓힌다.
- **실재하는 밈만.** AI 생성 금지(그건 `[[[ ]]]` post-finalize 담당). 여기선 인터넷에서 검색해 가져온다.
- **로컬 저장 후 참조.** 외부 URL 핫링크 금지 — 반드시 `public/images/<slug>/memes/`에 내려받아 `/images/...`로 참조(블로그 관례, 링크 소멸 대비).
- **MDX 안전.** `.mdx`에서 마커는 산문 영역에만 두고 JSX 블록 안에는 두지 않는다. 치환 결과 `![](...)`는 산문에서 안전. `<<meme:>>`는 반드시 전부 치환해야 하며(빌드 시 `<`가 JSX로 오인될 위험), 남기려면 코드펜스 안에 둔다.
- **멱등성.** 재실행 시 남은 `<<meme:>>`만 재처리. 이미 `![](...)`로 바뀐 자리는 다시 건드리지 않는다.

## 파이프라인 연동 (raws → draft → post)

이 스킬은 **단독**으로도, **집필 파이프라인 안에서 포착돼서도** 쓰인다.

- **raws → draft (post-draft):** 글쓴이가 초안에 `<<meme: ...>>`를 남길 수 있다. post-draft는 이 마커를 **그대로 보존**한다(치환하지 않음). 이 단계에서 바로 채우고 싶으면 이 스킬을 수동 호출.
- **draft 집필 중:** 글쓴이가 자유롭게 마커를 추가. 언제든 `/meme-inserter <draft파일>`로 미리 채워볼 수 있다.
- **draft → post (post-finalize):** post-finalize가 이미지 후처리 단계에서 `[[[ ]]]`를 처리하기 **직전에** 문서에 `<<meme:>>`가 남아 있으면 이 스킬을 위탁 호출해 함께 처리한다(발행 직전 한 곳에서 밈까지 완성).

## 사전 요건 (전부 선택 — 없으면 다음 티어로 폴백)

- **브라우저 티어(메인, 권장): `aside` MCP.**
  - 설치: `curl -fsSL https://releases.aside.com/install.sh | bash`
  - `mcp.json`에 등록:
    ```json
    { "mcpServers": { "aside": { "command": "aside", "args": ["mcp"] } } }
    ```
  - 실행 요건: 로컬 **Aside 앱 실행 + 계정 로그인**(`aside account status`로 확인). Pinterest에도 로그인돼 있어야 세션을 탄다.
  - aside 대신 다른 브라우저 조작 MCP(Playwright MCP, Browser MCP 등)가 연결돼 있어도 원리가 같아 그대로 쓴다.
- **API 티어: `TENOR_API_KEY` 또는 `GIPHY_API_KEY`** (있으면 API 검색, 없으면 폴백 — 없어도 동작)
- Bun (fetch-meme.ts 런타임) 또는 동등 실행 수단
- `curl` (다운로드 — `i.pinimg.com`은 `-A` User-Agent 필요)

## 참조 파일

- `scripts/fetch-meme.ts` — Tenor/Giphy 검색·다운로드 스크립트
- `scripts/find_markers.py` — `<<meme:>>` 마커 수집·검증

## 참고 예시

처리 전:
```markdown
오늘도 빌드가 깨졌다.

<<meme: 불타는 방 안에서 괜찮다는 강아지>>

로그를 열어보니 어제 내가 지운 그 줄이었다.
```
처리 후:
```markdown
오늘도 빌드가 깨졌다.

![불타는 방 안에서 괜찮다는 강아지](/images/build-broke/memes/1.gif)

로그를 열어보니 어제 내가 지운 그 줄이었다.
```

## 안 하는 것
- AI 밈 생성 → 은유·개념 일러스트는 `[[[ ]]]`(post-finalize) 담당.
- 개념도·비교표·다이어그램 → `(( ))`(mdx-concept-diagram), ```figure```(make-image) 담당.
- 본문 집필·리뷰 → post-draft / tech-deepdive / review-post 담당.
