---
name: tech-deepdive
description: >
  글감(`raws/`) 또는 research 가 만든 angle 을 받아 독자를 끝까지 이해시키는 **깊은 기술 해설 글**을
  MDX 로 집필해 `draft/` 에 초안을 만드는 진입점. 골격·문체·품질 기준은 `authoring-kit` 플러그인의
  명세(`tech-deepdive`)와 퍼소나(voice)가 소유하고, 이 스킬은 **어느 명세로 쓸지 고르고 넘기는 일**과
  블로그 고유의 매체 위탁(React 시뮬·viz 이미지·밈)만 맡는다. 단일 글 또는 순서 있는 시리즈로 쓸 수 있다.
  "/tech-deepdive <메모>", "이 주제로 기술 글 깊게 써줘", "심층 기술 해설 작성",
  "OSI 7계층 글 써줘" 같은 표현에 반응한다. 품질 게이트는 `quality-gate`,
  개념이미지·태그·시리즈는 `post-finalize`, 발행은 `publish-post`, 배포는 `ship-post` 가 맡는다.
argument-hint: <angle 경로(~/blog-research/wiki/angles/) 또는 raws/ 글감>
---

# tech-deepdive (기술 해부 글 진입점)

> **집필 규칙은 이 파일에 없다.** 항목 골격·항목별 작성법·범위 원칙은 플러그인의
> `tech-deepdive` 명세에, 문체는 퍼소나 voice 에 산다. 세 프로젝트가 같은 규칙을 각자
> 한 벌씩 들고 있다가 갈라진 것을 정리한 결과다. 이 파일에는 **매체 결정**만 남는다.

## 0. 사전 확인

```bash
python3 ${CLAUDE_PLUGIN_ROOT}/scripts/authoring.py status
python3 ${CLAUDE_PLUGIN_ROOT}/scripts/authoring.py lock
```

- 플러그인이 없으면 **여기서 멈춘다.** 구 경로로 조용히 돌아가지 않는다 — 그러면 어떤
  규칙으로 쓰였는지 알 수 없게 된다. 구 자산은 git 이력에만 있고, 복구는 되돌리기지 우회로가 아니다.
- `lock` 이 stale 이면 규칙이 바뀐 것이다. 무엇이 바뀌었는지 보고 진행할지 정한다.

## 1. 입력과 범위

**입력 우선순위** — ① `research` 가 만든 `~/blog-research/wiki/angles/<slug>.md`
(있으면 1순위. 연결된 topic·entity 페이지와 근거 raws 도 함께 읽는다)
② angle 이 없으면 `raws/` 하위 글감 메모. 인자 경로가 있으면 그것을 쓴다.

전체를 읽어 주제·후크·타깃 독자 수준·근거·open questions·사용자가 이미 내린 결론을
파악한다. open questions 가 집필에 치명적이면 보고하고, 필요하면 가벼운 추가 조사로 메운다.

**단일 글인지 시리즈인지 `AskUserQuestion` 으로 확인한다.**
시리즈면 편 분할 목록(편별 제목 · 동일 `series` · `order` 1..N · 편별 선수지식)을 먼저
합의한 뒤 **이번 호출에서는 1편만** 쓴다. 나머지는 같은 스킬을 다시 부른다 —
한 번에 몰아 쓰면 컨텍스트가 터지고 편 간 중복이 생긴다.

## 2. 퍼소나를 고른다

| 저자 | voice | 언제 |
| --- | --- | --- |
| 빵토랩 연구원 | `ppangtolab-researcher` | 기본. 발견을 공유하는 글 |
| 빵토랩 선생님 | `ppangtolab-teacher` | 자료구조·알고리즘처럼 **가르치는** 글 |
| 빵관 토니 | `ppangto` | **AI 가 쓰지 않는다** — 사용자가 직접 쓰는 자리다 |

`ppangto` 는 `usage: "preserve"` 라 그 목소리로 새로 쓰지 않는다. 사용자 초안을
다듬을 때 지킬 색으로만 본다.

**고른 voice 를 frontmatter `author` 에 그대로 적는다.** 비워 두면 스키마 기본값으로
떨어져 AI 글이 사람 이름으로 나가고 AI 배너도 안 붙는다. 표시 의무 문제다.

## 3. 집필을 넘긴다

```
Skill(authoring-kit:authoring-write) --spec tech-deepdive --voice <위에서 고른 것>
```

플러그인이 L0(공통 원칙) + L1(퍼소나) + L2(명세)를 한 벌로 병합해 집필 에이전트에
넘기고, 외부 검토와 품질 게이트까지 완주시킨다.

산출은 `draft/<slug>.mdx`(시리즈면 `draft/<series-slug>-<order>.mdx`), `draft: true` 상태다.

## 4. 시각 자료 — 종류마다 다른 곳에 위탁한다

명세는 **그림이 있어야 한다**는 것까지만 말한다(SP9). 무엇으로 그리는지는 여기 소관이다.
집필은 **어디에 무엇이 필요한지만 명세**하고 넘긴다.

| 마커 | 무엇 | 위탁처 |
| --- | --- | --- |
| ` ```viz ` | 구조형 시각물 — 다이어그램·차트·인포그래픽 **그리고 hero**(`target:"hero"`) | `make-image` |
| `<Name client:visible />` | 움직여야 이해되는 것 — 상태 변화·단계 진행·파라미터→결과 | `react-sim` |
| `<<meme: … >>` | 실재 밈 | `meme-inserter` |
| `<Mark name="…" />` | 낱개 기호 — 문장 안의 판정·강조 | **위탁 없음. 집필이 그 자리에서 바로 적는다** |

네 마커는 서로 충돌하지 않는다. `viz` 블록은 JSON(`kind` + `data` + `caption`/`alt`)이고,
시뮬은 컴포넌트명·조작 파라미터·관찰 대상·교육 목표를 명세로 남긴다.
`make-image` 는 디자인 시스템 컴포넌트로 **직접 구현**한다 — 이미지 생성 모델을 쓰지 않는다.

### 이모지 대신 두들 마크 — 본문에 이모지 0

`- ❌ **"VPN 은 암호화된 프록시다."**` 같은 "흔한 오해" 목록은 이 블로그가 자주 쓰는
형식인데 **이모지로 쓰지 않는다.** 기기마다 다른 그림이 나오고, 컬러 이모지 폰트가
종이·크레용 팔레트와 겉돌며, 공통 원칙이 본문 이모지를 최고 등급 위반으로 잡는다.

```mdx
- <Mark name="no" /> **"VPN 은 암호화된 프록시다."** → 계층과 적용 범위가 다릅니다.
- <Mark name="check" /> 터널은 **인터페이스**로 붙습니다.
- <Mark name="warn" /> 리프레시 토큰을 회전 없이 오래 쓰면 유출 한 번이 영구 권한이 됩니다.
```

- **자주 쓰는 셋**: `no`(X·아님) · `check`(체크) · `warn`(느낌표 원·주의).
  51종 전체는 `/design/deco`, 표는 `src/lib/doodleMarks.ts`. **import 불필요.**
- 크기는 `size`(기본 `1.15em`). 문장이 이미 같은 뜻을 말해 스크린리더에 두 번 읽히면 `label={false}`.
- **뜻이 없는 이모지는 마크로 바꾸지 말고 아예 안 쓴다.** `🚀` 로 시작한다고 글이 빨라지지 않는다.
- **코드블록·터미널 출력 안의 `★`·`✔` 는 그대로 둔다** — 인용한 화면이라 고치면 인용이 거짓이 된다.
- **제목(`##`·`###`)에는 마크를 쓰지 않는다.** 목차가 JSX 에서 텍스트를 못 뽑아
  `자주 틀리는 포인트 ( → 교정)` 처럼 구멍이 난다. 제목에서는 기호 대신 말로 쓴다.

**레거시 마커는 은퇴했다** — ` ```figure `·`[[[이미지 단서]]]`·`(( ))` 를 쓰지 않는다.
전부 ` ```viz ` 로 대체한다(자유 회화형 hero 는 `PosterEditorial` 등 포스터 패턴).

**`[diagram: …]` 같은 텍스트 표시자만 남기면 미완성이다.** 위탁했으면 실제로 렌더된
결과가 본문에 들어와야 집필이 끝난 것이다.

draft 단계 컴포넌트는 `src/components/posts/<draft-slug>/` 에 두고, 발행 시
`publish-post` 가 위치와 슬러그를 정리한다.

## 5. 빌드 확인 후 인계

```bash
bun run build
```

**JSX 문법 오류 하나가 사이트 전체 빌드를 깬다.** MDX 를 쓴 뒤에는 반드시 통과를 확인한다.

다음 단계: `quality-gate`(품질 게이트) → `post-finalize`(개념이미지·태그·시리즈)
→ `publish-post`(발행) → `ship-post`(빌드 재검증 + 푸시).
시리즈면 남은 편 목록과 "다음 편은 같은 스킬 재호출"을 함께 안내한다.

## 참조

| 무엇 | 어디 |
| --- | --- |
| 명세 전문 | `authoring.py show spec tech-deepdive` |
| 다관점 메뉴 12종 | `assets/SECTION_PATTERNS.md` |
| 섹션 스켈레톤 | `assets/ARTICLE_TEMPLATE.mdx` |
| React 시뮬 규약 | `../react-sim/assets/REACT_SIM_GUIDE.md` |
| viz kind·규격 | `../make-image/assets/IMAGE_GUIDE.md` |
| 다이어그램 디자인 | `design-concept/DIAGRAM_STYLE_GUIDE.md` |

## 카테고리 (`category`)

`planning` · `architecture` · `strategy` · `skills` · `learning` · `design` ·
`research` · `quality` · `leadership` — `src/lib/categories.ts` enum 9종과 일치해야 한다.
기술 해설은 보통 `skills` 또는 `architecture`.
