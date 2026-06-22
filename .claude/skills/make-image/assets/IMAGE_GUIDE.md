# 이미지 가이드 (구조형 이미지)

`make-image` 스킬이 **HTML+CSS로 그려 Playwright로 PNG 캡처**하는 구조형 이미지의 규격이다. 개념·은유 일러스트
(자유 회화)는 이 스킬이 아니라 `post-finalize`의 OpenAI `[[[…]]]` 경로가 담당한다(공존). 이 가이드는 **정보 전달용
도형 이미지**만 다룬다.

> 렌더 런타임은 **Node/TS Playwright**(`scripts/render-image.ts`). 레포가 Bun이므로 Python을 쓰지 않는다.

---

## 공통 규칙

- 모두 **HTML + CSS**로 만들고, **Playwright(chromium)** 로 PNG 캡처한다.
- 배경 톤은 **본문과 어울리는 AI/테크 분위기**(다크 블루-퍼플 계열 기본). 본문 팔레트(`src/styles/tokens.css`)와 충돌하지 않게.
- **텍스트는 최대한 짧게.** 이미지는 보조 수단 — 문장이 아니라 키워드·라벨 위주.
- 코드 블록 스타일을 디자인 요소로 활용 가능(모노스페이스, 어두운 배경, JetBrains Mono).
- **폰트는 로컬 Pretendard**를 `@font-face`로 임베드하고, 캡처 전 `document.fonts.ready`를 기다린다(CDN 비결정성·FOUT 방지).
- 입력은 **JSON 데이터**로 받고, 템플릿 주입 시 **HTML escaping**(`<`, `>`, `&`, 따옴표)을 반드시 적용한다(주입·깨짐 방지).
- **재생성 멱등**: 같은 출력 경로에 이미 파일이 있으면 덮어쓰지 않는다(명시적 force 시에만).

## 본문 삽입 이미지 종류 (4종 — 글 내용에 맞게 선택)

| 타입 키 | 용도 | 핵심 데이터(JSON) |
|---|---|---|
| `compare-table` | 제품/방법을 나란히 비교 | `title`, `columns[]`, `rows[][]` |
| `step-diagram` | 절차·순서 | `title`, `steps[] {label, desc}` |
| `point-cards` | 3~5개 요점 정리 | `title`, `cards[] {title, body}` (3~5장) |
| `quote-box` | 중요한 한 마디 강조 | `quote`, `attribution?` |

- 본문 가로폭에 맞춘 **가로형**(예: 1200×675 또는 내용에 따라 가변 높이). 텍스트가 넘치면 폰트·여백을 줄이기보다 항목 수를 제한.
- 표/카드/스텝은 **본문보다 정보를 압축**한다(이미지에 문단을 넣지 않는다).

## 대표 이미지 (hero) 규격

- 크기: **가로 1080px × 세로 1080px (1:1 정사각형)**.
- 배경: **어두운 블루-퍼플 그라데이션** (`#1a1a2e → #16213e`).
- 메인 텍스트: **글 제목** (큰 글씨, 흰색).
- 보조 텍스트: 카테고리/부제 (작은 글씨, 연한 회색).
- 모든 텍스트 **가로·세로 중앙 정렬**.
- 폰트: **Pretendard**(로컬) 또는 시스템 한글 폰트 폴백.
- **우측 하단 또는 좌상단에 작은 액센트**(도형·코드 심볼·단순 아이콘).
- 타입 키: `hero`. JSON: `title`, `subtitle?`, `category?`.

## 출력·참조 경로 (Astro)

- 저장: `public/images/<post-slug>/<name>.webp` 또는 `.png`. (대표 이미지는 `<slug>/hero.*` 권장)
- 본문 참조: `/images/<post-slug>/<name>.*` (Astro가 `public/`를 사이트 루트로 서빙).
- `<post-slug>`: 입력 파일 stem에서 `.md`/`.mdx`·`-draft` 제거.

## 본문 내 명세 마커 (집필자 → make-image)

집필 단계(tech-deepdive)는 구조형 이미지가 필요한 자리에 **펜스드 명세 블록**을 남긴다. `post-finalize`의 개념형
`[[[…]]]` 와 충돌하지 않는다.

````markdown
```figure
{ "type": "step-diagram",
  "name": "tcp-handshake",
  "alt": "TCP 3-way handshake 단계",
  "title": "3-way Handshake",
  "steps": [
    {"label": "SYN", "desc": "클라이언트→서버 연결 요청"},
    {"label": "SYN-ACK", "desc": "서버 응답"},
    {"label": "ACK", "desc": "클라이언트 확인, 연결 수립"}
  ]
}
```
````

- `make-image`는 이 블록을 파싱→PNG 생성→블록 전체를 `![<alt>](/images/<slug>/<name>.<ext>)`로 치환한다.
- 치환 후 **잔존 `figure` 블록이 없는지 검사**한다(누락 방지). 필수 이미지 생성 실패는 자동 모드에서 **hard fail**.
- `type`은 위 5종(`compare-table`/`step-diagram`/`point-cards`/`quote-box`/`hero`)만 허용. 그 외는 오류.

## 사전 요건

- `bun add -d playwright` + `bunx playwright install chromium`.
- 로컬 Pretendard 폰트 파일(`public/fonts/` 또는 npm `pretendard` 패키지) 접근 가능.
- 미설치 시 스킬이 설치 안내를 출력하고, 자동 모드에서 **필수 이미지**면 실패 처리(조용한 skip 금지).
