# KANBAN — [centurio1987.github.io](http://centurio1987.github.io)

> hyper plan 보드. 앱 기능 백로그가 아니라 프로젝트 차원의 계획을 유저·AI가 공동 관리한다.
> 카드 메타(생성/최종/갱신)는 manage-kanban 스킬이 관리한다. 규칙은 스킬 SKILL.md를 따른다.

## 백로그
<!-- 아직 착수 결정 전. 우선순위 미정 후보 풀. 백로그→할 일 이동이 "할지 고민" → "하기로 확정" 전환점. -->
- `KAN-024` 집필 파이프라인: 완성 글 스캔 → 연관 시리즈 자동 링크 삽입 — 생성:유저 · 최종:유저 · 갱신:2026-07-27
  - 메모: 발행 완료 글을 스캔해 연관 내용을 포착하고, 해당 시리즈로 가는 링크를 본문에 삽입하는 단계를 집필 워크플로에 추가
  - 원문:
    ```text
    글 작성 도중, 이미 작성한 다른 시리즈와 연관된 내용이 있을 경우, 그 시리즈를 보러 가는 링크를 제공하려고 한다. 이미 작성이 완료된 글을 스캔 하여, 연관된 내용을 포착하고, 링크를 삽입하는 방식으로 집필 파이프라인에 작업을 추가해라.
    ```
- `KAN-030` 글 목록 pagination 적용 여부 점검 후 미적용 시 도입 계획·수행 — 생성:유저 · 최종:ai · 갱신:2026-07-28
  - 메모: 글 항목이 많아질 때를 대비. 현행 글 목록(posts/index·index·categories/[category])에 pagination이 적용돼 있는지 먼저 확인하고, 미적용이면 도입 계획을 세워 수행한다.
  - 원문:
    ```text
    블로그 글을 로딩 할 때, 항목이 많아 지는 경우를 대비하여, pagination이 적용되어 있는지 확인하고, 안되어 있다면, 적용하기 위한 계획을 세우고 수행해라.
    ```
- `KAN-032` 프로그래밍 레벨에서 async/await를 가능하게 만드는 원리 시리즈 집필 — 생성:유저 · 최종:ai · 갱신:2026-07-28
  - 메모: async/await를 가능케 하는 저수준 구성요소(epoll·kqueue·pipe 등)와 각 런타임 비동기 엔진(Node·Rust·Python·Java)의 작동 원리를 절차별로 해설. 실제 코드 구현과 라인 레벨 내부 플로우까지, 개념적 큰 그림 + 실제 spec 근거로 설명.
  - 원문:
    ```text
    프로그래밍 레벨에서 async/await를 가능하게 만드는 원리 시리즈 집필
    - 가능케 하는 구성요소들 소개(epoll, kqueue, pipe, node, rust, pythom, java 비동기 엔진 etc.)
    - 각 구성요소들의 세부적인 작동 원리를 절차별로 설명
    - 실제 코드 구현 및 라인 레벨로 내부적으로 수행되는 플로우를 설명한다.
      - 전체 그림을 이해하기 위해 개념적 레벨 설명 포함
      - 전문성을 위해 실제 spec으로 설명 포함
    ```
- `KAN-060` 한국어 웹폰트 3종의 첫 화면 회선 점유(~530KB) 완화 방안 검토 — 생성:ai · 최종:ai · 갱신:2026-07-31
  - 메모: KAN-059 실측에서 드러난 별건. 홈 첫 화면이 Jua·Gowun Dodum·Gaegu(+Space Mono·JetBrains Mono) 서브셋 30여 개 ~530KB를 VeryHigh 로 받아 4.2초까지 회선을 문다 — 페이지 총 전송 798KB 중 최대 항목이고, 이미지·JS가 전부 그 뒤에 줄 선다. 게다가 fonts.googleapis.com 스타일시트가 **렌더 블로킹 서드파티**라 첫 페인트 자체를 잡는다(Slow 3G 실측 FCP 3.3초 중 상당분). 검토할 갈래: ① 패밀리 수 줄이기(--font-hand 인 Gaegu 와 --font-display 인 Jua 의 역할 겹침 여부) ② self-host + 필요한 unicode-range 만 서브셋(한글 상용 2350자) ③ 스타일시트 렌더 블로킹 해제(preload+onload swap) — 단 폴백 폰트와 메트릭이 달라 레이아웃이 흔들리므로 size-adjust/ascent-override 로 메트릭을 맞춘 뒤에만. **디자인 결정이 섞여 있으므로 유저 승인 없이 패밀리를 건드리지 않는다.** 착수 시 KAN-059 와 같은 방법으로 먼저 잰다(Playwright+CDP, Slow/Fast 3G · CPU 4×).
- `KAN-061` 홈 배경 모션 아일랜드(AmbientAurora/Waves)가 끌고 오는 JS ~130KB 재검토 — 생성:ai · 최종:ai · 갱신:2026-07-31
  - 메모: KAN-059 실측에서 드러난 별건. 홈(/)이 client.js 56KB + dist.js 67KB(= bbangto-ui-core 배럴) + react 등 ~130KB 를 High 로 받아 4.5초까지 회선·메인스레드를 문다. 받아오는 값은 "아주 옅은 배경 오로라 + 푸터 파도" 하나뿐이다. 이미 client:media 로 reduced-motion 사용자는 청크 로드 0 이고(코어 배럴은 tree-shake 가 안 돼 컴포넌트 1개=67KB gzip — 그래서 전역 Footer 에 안 올린 선례가 있다), 그 판단 자체는 유효하다. 재검토할 것: ① 같은 그림을 CSS 그라디언트/SVG 애니로 대체 가능한지(그러면 JS 0) ② 못 대체하면 client:visible 이나 로드 지연으로 첫 화면 회선 다툼에서 빼기 ③ 그대로 둘 근거를 남기기. 판단 근거는 KAN-059 처럼 실측으로 — 특히 이 JS 가 푸터 저자 라인업 이미지(Low)를 얼마나 뒤로 미는지.
- `KAN-063` viz 도식을 감싸는 액자 프레임 디자인 — 패턴 스크래치 + 예시 페이지 — 생성:유저 · 최종:ai · 갱신:2026-08-04
  - 원문:
    ```text
    액자 프레임을 디자인 해라. 액자 프레임은 vis 를 데코레이트 하는 목적으로 사용할 거다. 패턴 별로 몇 가지 스크래치로 작성해서, 예시와 함께 별도의 예시 페이지를 랜더링 해서 제공해라. 보고 검토하고 피드백 해서 최종 결정 하겠다.
    ```

## 할 일
- `KAN-048` 포스트에 좋아요를 누르는 기능을 추가할 수 있나, 있다면 추가 계획을 세우고 수행해라. — 생성:유저 · 최종:ai · 갱신:2026-07-30
  - 메모: 실행전략(5단계): ① 인프라 Cloudflare Workers+D1 — 무료 Workers 10만req/일·D1 쓰기 10만행/일, 저활동 정지 없음(Supabase 는 7일 정지로 탈락) ② 스키마 counts(slug,likes,shares)+dedupe(sha256(salt+ip+slug+day)), 증가는 ON CONFLICT DO UPDATE 로 원자적, 원본 IP 미저장 ③ 엔드포인트 GET /stats?slugs= 배치조회·POST /like(IP당 1일 1회, 토글 허용)·POST /share, CORS 오리진 고정 ④ 프론트 React 아일랜드 금지 — .astro + is:inline vanilla 를 astro:page-load 바인딩, 숫자 폭 예약으로 CLS 0, 조회 실패시 숫자만 숨기고 글에는 영향 0 ⑤ 공유수는 플랫폼 카운트 API 부재로 '공유 버튼 클릭' 집계(X·링크복사·navigator.share) — 라벨을 정직하게 표기

## 진행 중
- `KAN-001` GraphQL을 썼을 때 유리한 상황과 아닌 상황 — 생성:ai · 최종:ai · 갱신:2026-07-26
  - 메모: draft: draft/graphql-use-cases-draft.md · REST 대비 이득/복잡도 증가 상황, 조직·클라이언트·게이트웨이 판단 기준
- `KAN-002` 도메인 모델과 RDB — 생성:ai · 최종:ai · 갱신:2026-07-26
  - 메모: draft: draft/domain-model-rdb-draft.md · 외래키 신호, 상속/합성 테이블 표현, Aggregate↔테이블 대응, Value 영속화
- `KAN-003` DDD에서 Composition과 Aggregation — 생성:ai · 최종:ai · 갱신:2026-07-26
  - 메모: draft: draft/ddd-composition-aggregation-draft.md · Composition=의존 생명주기/Aggregate 소속, Aggregation=참조
- `KAN-004` 상속이냐 Composite냐 — 생성:ai · 최종:ai · 갱신:2026-07-26
  - 메모: draft: draft/inheritance-vs-composition-draft.md · 대부분 Composite 권장, 상속 고려 상황, Evolving 관점
- `KAN-005` 모델링 철학 고려 사항 — 생성:ai · 최종:ai · 갱신:2026-07-26
  - 메모: draft: draft/modeling-philosophy-draft.md · 속성 우연일치≠동일모델, 내러티브 중심. 모델 구분 기준 보강 필요

## 검토
- `KAN-064` 집필 엔진 교체(authoring-kit)에 따른 기존 글 재집필 계획 수립 — 생성:유저 · 최종:ai · 갱신:2026-08-04
  - 메모: 실측 기준선은 `.claude/authoring/rewrite-baseline.md` (2026-08-04, 29편 전수 `scan_ai_style.py`). **전면 재집필은 근거가 없다** — 기계 리듬 축 미달이 17편이지만 치명(S1) 위반의 실제 분량은 **문장 35개**이고 그중 32개가 쉼표 과다(P1) 하나다. 발행 29편의 최신 pubDate 가 2026-07-28 이라 전부 구엔진 산물인 건 맞지만, 어긋난 양은 그만큼이 아니다. **실행전략 4단계.** ① **Phase 0 — 글을 건드리기 전에 엔진부터 맞춘다.** (a) `ppangtolab-researcher` 가 `status:draft` 라 `resolve` 가 "사람 승인 전까지 발행 금지"를 띄우는데 이미 22편이 그 voice 로 나가 있다 — **유저 결정 사항**(확정할지 고칠지). (b) `ppangtolab-*` 세 voice 의 `waivers` 가 비어 있어 21편이 R1b 로 감점됐다 — L0 는 "격식체를 자기 톤으로 선언한 voice 에서 R1b waiver 는 정상"이라 적었고 사람 voice 에는 이미 있다. 등급을 올리려고가 아니라 **안 넣으면 그 글들을 잘못 고치게 되므로** 먼저 한다. (c) 스캐너 오탐 — `♭`(U+266D, WireGuard 백서 표기 인용)가 이모지로 잡혀 vpn-5 가 D 로 떨어졌다(저장소 게이트는 통과). L0 오탐 예외 5종과 같은 방식으로 예외+단위테스트. Phase 0 만으로 17→15편, D 0편. ② **윤문(재집필 아님)** — 남은 15편은 P1 32문장 + R1a 2 + H4 1 이 전부다. `authoring-kit:authoring-gate` 보완 루프 1회(의미보존 6점·수정률 상한 50% 를 2026-08-04 게이트 §5 로 이관 — `humanize-post` 는 폐지). 시리즈 단위로 묶고 그래프 재생성은 전량 머지 후 1회(KAN-044). ③ **미측정 축 표본 정독** — 스캐너는 machine-rhythm 한 축만 본다. 영어투(L0_NATURAL_KOREAN)·근거/이해(QUALITY_RUBRIC)·voice 일치(L1)는 자동 판정이 없고 **진짜 재집필 대상은 여기서 나온다**. 특히 글들이 voice 문서보다 먼저 쓰였다. L2 골격은 명세가 이 글들에서 뽑혀 대체로 맞으나 `tauri-1` 은 필수 항목 `들어가며` 가 없다. ④ **재측정·발행** — Phase 0 후 재스캔해 3분류 확정 → review-post → (재집필분만) review-writing+quality-gate → build·게이트 → ship. **하지 않을 것:** `ppangto`(사람) 글 3편은 `usage:preserve` 라 AI 가 다시 쓰지 않는다(쉼표·맞춤법만). 등급 올리려고 문장을 잘게 썰지 않는다(L0 R2 함정 — "표현이 처참하다" 전례). A 등급 5편(전부 OSI, 08-02 재집필분)은 손대지 않는다. **오측 기록:** 개인경험 사칭 18편→실제 0건, 가르치는 말투 18편→11건(대부분 정상). 둘 다 한글에 단어 경계가 없어서 생긴 오측이다. **재개(2026-08-04) — 조사 오류·구조적 자기모순 전수 재검사.** 사용자가 vpn-anatomy-7을 직접 정독하고 이전 진단에 반박(제목·내용이 처참하다) — 실제로 조사 오류 9건(`갈래으로`·`갈래은`·`갈래을`×6·`갈래과`)과 "네 개의 운영 함정"이라 못박고 kill switch 절에서 스스로 "함정 아님"이라 부정하는 자기모순이 있었다. 이를 계기로 ppangtolab 보이스 26편 전수를 이 두 축으로 재정독(근거: `.claude/authoring/rewrite-baseline.md` "조사 오류·구조적 자기모순 전수 재검사" 절). 결과: 24/26편은 여전히 깨끗해 ③ 단계의 "표본 확인"이 대체로는 맞았지만, `vpn-anatomy-7`은 조사 오류 9건(전체 21건의 43%)과 유일한 심각 자기모순으로 **윤문에서 부분 재집필로 재분류**한다(kill switch를 뺀 세 갈래로 다시 짜거나 kill switch를 진짜 함정으로 재정의 — 문장 교정으로는 안 풀린다). `auth-authz-3`는 "여섯 스텝" 표(1단계=PKCE 준비)가 실행 워크스루(1단계=Discovery)와 어긋나는 구조 불일치 1건으로 국소 수정 필요(전면 재집필 아님). `webrtc-1`(5건)·`webrtc-3`(3건)·`tauri-1`(2건)·`container-anatomy-1`(1건)·`auth-authz-1`(1건)은 조사 오류만 있어 기존 ② 윤문 라운드에 조사 교정만 얹으면 된다. **적용 완료(2026-08-04).** `vpn-anatomy-7`: 조사 오류 9건 전부 수정 + "네 개의 운영 함정"을 "세 개"(MTU 블랙홀·DNS 유출·split tunnel)로 재구성하고 kill switch는 함정 목록에서 빼 보완 장치로 재서술(본문 섹션 번호도 첫/두/세 번째로 재정렬, 사용자가 지적한 "골라 든" 어색한 표현도 정리). `webrtc-1`(5건)·`webrtc-3`(3건)·`tauri-1`(2건)·`container-anatomy-1`(1건)·`auth-authz-1`(1건)의 조사 오류도 기계적으로 교정. `build` 43쪽 통과 확인, 커밋·푸시 완료. **남은 것:** `auth-authz-3`의 "여섯 스텝" 표(1단계=PKCE 준비) vs 실행 워크스루(1단계=Discovery) 불일치는 아직 미착수 — 국소 수정 방식(PKCE를 단계에서 뺄지, 워크스루를 표에 맞출지)은 별도 결정 필요. **재반박 수용(2026-08-04, 2차) — 조사 오류 교정만으로는 부족했다.** 사용자가 vpn-anatomy-7을 다시 반박("여전히 처참, 제목도 그대로") — 정당한 지적이었다: 1차 조치는 문법(조사)과 논리(자기모순) 두 축만 봤고, **편집 품질**(제목이 시리즈 관례에 맞는지, 개념어가 문서 전체에서 일관되는지, 시각 자산이 텍스트와 맞는지)은 안 봤다. 재정독으로 실제 확인한 결함 셋. ① **제목** — EP1~6은 전부 "X 해부: 구체적 사실/숫자"(예: EP5 "선택지를 없애서 얻은 148바이트", EP3 "4개의 메시지") 관례인데 EP7만 "무엇을 고르든 어디서 넘어지는가"라는 추상적 수사의문문으로 이 관례를 깨고, 시리즈 표기("VPN의 해부 n편")와 완결 표시도 빠져 있었다. "VPN의 해부 7편 — 다섯 기준으로 고르고, 세 함정에서 넘어진다"로 교체(구체적 숫자 앵커 + 시리즈 표기 복원). description도 동일 기준으로 재작성. ② **"갈래" 용어 중복** — 시리즈 시그니처 개념인 "두 갈래"(터널링+암호화, EP1 정의, 마무리 표에서 반복)와 무관하게 "다섯 선택 기준"에도 같은 단어 "갈래"가 3곳(description·"이 다섯 갈래는…"·과제 힌트 3개)에 섞여 쓰여, 시리즈를 따라온 독자가 같은 글 안에서 같은 단어의 다른 뜻에 걸려 넘어지는 구조였다. "다섯 기준"으로 통일(본문 다수가 이미 "기준"을 쓰고 있어 그쪽이 지배적 표현이었다), "갈래"는 EP1 원 개념 자리에만 남김. ③ **hero.webp** — 옛 제목이 그림에 텍스트로 박혀 있어 frontmatter만 고치면 표지와 본문 제목이 어긋나는 상태였다. `scripts/render-viz.ts`로 PosterHero를 새 제목·부제로 재렌더. **검증**: `check-post-markers` 통과(29편 마커 이상 없음) · `build` 43쪽 통과 · 빌드된 `<title>`·`og:image`로 반영 확인. **auth-authz-3도 이번에 함께 결정·수정.** "여섯 스텝" 표(1단계=PKCE 준비)와 인터랙티브 컴포넌트 `PkceFlowStepper.tsx`(하드코딩된 스텝 라벨)가 이미 서로 일치하고, 이탈한 쪽은 프로즈 워크스루("1단계=Discovery") 하나뿐이었다 — 표·컴포넌트 두 독립 표면이 합의한 번호를 정본으로 삼았다. 워크스루의 "1단계 — Discovery로 엔드포인트를 안다"를 "1단계 — PKCE 준비와 Discovery"로 합쳐(클라이언트 내부에서 먼저 끝내는 두 가지로 묶음) 표·컴포넌트·워크스루 세 표면을 일치시켰다. 기존 Discovery 예시(curl·json)는 그대로 유지.
  - 원문:
    ```text
    집필 엔진이 바뀌었다. 기존의 글을 재집필 할 계획을 세워라.
    ```

## 완료
- `KAN-062` 발행된 글 14편의 본문 이모지 83건을 두들 마크로 갈아 끼운다 — 생성:ai · 최종:ai · 갱신:2026-08-04
  - 메모: 13편 77줄을 `<Mark>` 로 치환했다(`❌`→`no`, `✅`→`check`, `⚠️`→`warn`). 남은 한 편(container-anatomy-4)은 제목 하나뿐이라 마크가 아니라 말로 풀었다. **굳힌 판단 셋.** ① **제목에는 마크를 넣지 못한다** — 목차(`PostToc`)가 `render()` 의 `headings` 에서 텍스트만 뽑는데 JSX 는 텍스트를 안 남겨 `자주 틀리는 포인트 ( → 교정)` 처럼 뚫리고 앵커 slug 도 흔들린다. 그래서 `(❌ → 교정)` → `(오해 → 교정)`, `Kaniko — ⚠ 이제 고르면 안 됩니다` → `⚠` 삭제(문장이 이미 경고를 말한다). ② **볼드 앞머리는 마크를 볼드 밖으로 뺀다**(`**❌ 안티패턴**` → `<Mark name="no" /> **안티패턴**`) — 글리프 마크는 이미 굵게 그려져 보이는 건 같고, 강조 안에 JSX 를 넣지 않는다. ③ **코드블록 안의 `# ❌ …` 주석은 그대로 뒀다** — 인용한 화면이고 펜스 안에서는 JSX 가 안 산다. 표 셀·인용문·번호 목록 모두 렌더 확인(Playwright). 이어서 `check-post-markers` 의 이모지 검사를 **경고 → 하드 실패**로 올렸다(인질 게이트가 될 이유가 사라졌다). 검증: `build` 43쪽 · `deco:verify` 20회 · `viz:verify` 41개 · `tsc` 0.
- `KAN-009` KAN-009 집필 ai의 퍼소나 개념을 정의하고 관리하려고 한다. 퍼소나는 고유의 voice와 캐릭터 이미지를 가진다. — 생성:유저 · 최종:유저 · 갱신:2026-07-23
  - 원문:
    ```text
    KAN-009 집필 ai의 퍼소나 개념을 정의하고 관리하려고 한다. 퍼소나는 고유의 voice와 캐릭터 이미지를 가진다.
        - 기존 기술 블로그글을 집필하던 AI는 글의 프로필에 나와 있는 것 처럼 **빵토 연구원** 퍼소나로 정의 한다. 퍼소나의 프로필 이미지와 배너 또한, 기존 기술 글에 포함된 것을 빵토 연구원의 것으로서 사용한다.
        - **빵토 교수님**과의 인터뷰 시리즈는 **빵토 교수님**이란 퍼소나로 정의한다. 퍼소나에서 사용하는 프로필 이미지와 배너는, 빵토 교수님과의 인터뷰 시리즈에 포함하는 프로필 이미지와 배너를 사용한다.
        - **빵토 선생님** 퍼소나를 새로 정의한다.
            - 빵토 선생님 [프로필 이미지](ChatGPT Image 2026년 7월 22일 오후 02_10_31.png), [배너 이미지](ChatGPT Image 2026년 7월 22일 오후 02_11_10.png)
                - 두 이미지는 webp로 변환후 사용하고 원본은 삭제해라
            - **빵토 선생님**의 보이스는 아래와 같다.
        ```markdown
          ## 문체 규칙 10
    
        1. **존댓말 설명체.** "~예요 / ~합니다 / ~봅시다"로 말을 건다. 격식 논문체("~이다" 일변도) 금지.
    
        - 예: "먼저 수준을 맞추고 갈게요." / "작은 예로 직접 나열해 봅시다."
    
    
    
        2. **작은 단계로 쪼갠 전개.** 한 절에서 개념 하나만 전진시킨다. 개념을 제시하면 그 직후에
    
        바로 예시가 따른다 — "정의 → 다음 정의"로 건너뛰지 않는다.
    
        - 예: balance factor 정의 직후, 노드 3개짜리 트리로 즉시 계산해 보인다.
    
    
    
        3. **모든 핵심 개념 직후 ascii art.** 트리/배열/계산 과정을 ```text 코드 블록 그림으로
    
        즉시 보인다. 산문 3~4문단이 그림 없이 이어지면 신호 위반이다.
    
        - 예:
    
                ```text
    
                i = 6 = 0110₂
    
                -i = 1010₂
    
                i & -i = 0010₂ = 2
    
    ```
- `KAN-006` WebRTC 이해와 최적 활용 사례 — 생성:ai · 최종:ai · 갱신:2026-07-22
  - 메모: webrtc-1/2/3 전편 발행 완료
- `KAN-014` KAN-013 배포 안정화 검증 — 생성:ai · 최종:ai · 갱신:2026-07-26
  - 메모: KAN-013 push·배포 후: GitHub Pages 빌드 green(CI packages:read 인증·미처리마커 가드 통과), viz 인라인 SVG 라이브 렌더·색 페인트 정상, hero webp/OG 카드 정상, 신규 글 파이프라인 1회 실통과 확인. 이상 없으면 다음 삭제 카드 착수 가능.
- `KAN-015` deprecated 이미지 스크립트 3종 삭제 — 생성:ai · 최종:ai · 갱신:2026-07-26
  - 메모: 선행조건(gating): KAN-014 배포 안정화 검증 완료 후에만 착수. 대상: scripts/generate-image.ts·render-image.ts·image-templates.ts(KAN-013에서 호출 경로 제거+deprecated 주석, 롤백 유예). 조건 충족 시 3파일 삭제 + 잔존 참조 grep 0 확인 + bun run build green + 커밋.
- `KAN-017` Dependabot 취약점 8건 해소 (의존성 보안 업데이트) — 생성:ai · 최종:ai · 갱신:2026-07-26
  - 메모: 완료 — astro 5.18.2→7.1.3 업그레이드로 Dependabot 8건(high2·moderate4·low2) 전부 해소. 커밋 19d143d. 8건 모두 astro 단일 패키지였고 최상위 요구 패치가 7.1.0이라 메이저 2단계 점프가 불가피. 동반 업: @astrojs/mdx 4→7·react 5→6·sitemap 3.3→3.7.3, markdown-remark 7.2.1 신규. astro7이 마크다운 파이프라인을 remark/rehype→Sätteri로 바꿨으나 rehypeWrapTables 의존 때문에 공식 호환 경로(processor: unified({rehypePlugins}))로 기존 파이프라인 유지(최상위 markdown.rehypePlugins는 deprecated). 부수 수정: 목록 정렬이 pubDate 동점(07-22 6건·06-21 4건)에서 getCollection 반환순에 의존해 비결정적이던 선재 부채를 id 타이브레이크로 고정(seriesNav.ts 관례 준용). 검증: build green 경고0·30페이지, 2회 빌드 산출물 바이트 동일, CI명령(bunx --bun astro build)·check-post-markers·tsc 통과, Playwright 8페이지 콘솔에러0·하이드레이션 정상·깨진이미지0, 포스트 8종 픽셀·레이아웃 지오메트리 베이스라인과 완전 동일(차이는 의도한 목록 3페이지뿐). 남은 부채는 KAN-020으로 분리.
  - 원문:
    ```text
    취약점 관련 작업이랑 node 20 deprecation 경고 해결 같은 태스크로 정의 해줘
    - kan-015 착수해
    ```
- `KAN-018` CI Node 20 deprecation 경고 해결 (Actions Node24 이관) — 생성:ai · 최종:ai · 갱신:2026-07-26
  - 메모: 완료. main.yml 액션을 node24 런타임 메이저로 상향: actions/checkout v4→v7, actions/configure-pages v5→v6, actions/upload-pages-artifact v3→v5(내부 upload-artifact v4.6.2→v7), actions/deploy-pages v4→v5. oven-sh/setup-bun@v2는 이미 node24(v2.2.0)라 무변경. 입력 스키마는 전 액션 동일하나 upload-pages-artifact v4+가 tar에서 dotfile을 기본 제외하므로 include-hidden-files:true로 v3 동작 유지(현재 dist/엔 dotfile 없음). 커밋 d5d2789 → main ff push. 실행 30195799378 build/deploy 전 스텝 success, Node 20 deprecation 어노테이션 2건 → 0건(직전 런 30194386647 대비).
  - 원문:
    ```text
    취약점 관련 작업이랑 node 20 deprecation 경고 해결 같은 태스크로 정의 해줘
    - kan-015 착수해
    ```
- `KAN-019` 낡은 미러 문서(AGENTS.md·.agents/·.codex/) viz 파이프라인 동기화 — 생성:ai · 최종:ai · 갱신:2026-07-26
  - 메모: KAN-013 viz 이관이 .claude 정본만 갱신하고 다른-런타임 미러는 구 OpenAI/HTML-template 파이프라인 그대로 방치(KAN-015에서 발견). 대상: AGENTS.md(집필 워크플로 섹션 전체 — [[[image clues]]]·generate-image.ts 서술), .agents/skills/make-image/{SKILL.md,assets/IMAGE_GUIDE.md}, .agents/skills/post-finalize/SKILL.md, .codex/skills/post-finalize/SKILL.md, .codex/agents/image-maker.toml. .claude 정본을 기준으로 viz(apply-viz/render-viz)로 서술 이관 + 삭제된 3스크립트 참조 제거. ORDER.md·KANBAN 이력은 보존(수정 안 함). KAN-015가 정본 트리만 정리했으므로 이 카드가 '전체 grep-0'를 마무리.
- `KAN-020` 전이 의존성 취약점 정리 (js-yaml·sharp/libvips) — 생성:ai · 최종:유저 · 갱신:2026-07-26
  - 메모: 완료 — bun audit 4건(high 3·moderate 1) 전부 해소, 커밋 60cc722. 카드 작성 시점 판단이 뒤집혔다: '패치가 major 5.x뿐이라 즉시 수정 불가'로 봤으나, 실제로는 세 건 모두 상류가 선언한 semver 범위 안에서 패치본이 나와 있어 major 점프 없이 하한만 올리면 됐다. (1) js-yaml 4.1.1→4.3.0 — GHSA-52cp-r559-cp3m(high)의 4.x 패치가 4.3.0, GHSA-h67p-54hq-rp68(moderate)은 4.2.0. 소비자(astro·@astrojs/internal-helpers)가 ^4.1.1 선언이라 범위 내. (2) sharp 0.34.5→0.35.3 — astro optionalDependency 범위가 실제로는 '^0.34.0 || ^0.35.0'이라(카드에 ^0.34.0 고정으로 잘못 적혀 있었음) 범위 내, libvips 1.2.4→1.3.2. (3) svgo 4.0.1→4.0.2 — GHSA-2p49-hgcm-8545(high, removeScripts 우회), 카드 작성 이후 새로 뜬 경보라 원래 목록에 없던 4번째 건. || 수단은 package.json overrides. 패치본이 전부 범위 내라 이론상 락파일 갱신만으로 충분하지만 bun에 전이 의존성만 범위 내 최신으로 올리는 명령이 없다 — 'bun update &lt;이름&gt;'은 그 패키지를 직접 의존성으로 승격시키고 취약 사본을 nested로 남겨 오히려 미해결이 되고(실측), 인자 없는 'bun update'는 직접 의존성만 갱신한다. overrides는 캐럿 하한이라 상류가 범위를 올리면 무해한 잉여가 되므로 그때 제거 가능. || 검증: audit 4→0, 설치 트리에 중첩 사본 없이 각 1본 평탄, build green 경고0 30페이지, dist가 변경 전 베이스라인과 바이트 단위 동일(글 17편 프론트매터를 js-yaml 4.3.0으로 파싱한 결과 동일 포함), CI명령(bunx --bun astro build) 산출물도 구 의존성 결과와 바이트 동일해 배포 영향 0, CI 폴백 경로인 npm 격리 설치도 동일 해소, check-post-markers 통과, sharp 0.35.3 로드·webp 인코딩 정상(render-viz 폴백), 락파일 변경이 대상 3종+sharp 플랫폼 바이너리로 한정. || 부수 발견(별건 분리): OG 이미지 폴백이 fs.readdirSync 순서에 의존해 bun/node 런타임 간 결과가 갈린다 → 신규 카드로 분리.
  - 원문:
    ```text
    취약점 관련 작업이랑 node 20 deprecation 경고 해결 같은 태스크로 정의 해줘
    - kan-015 착수해
    ```
- `KAN-022` OG 이미지 폴백의 readdir 순서 비결정성 (bun/node 런타임 간 결과 상이) — 생성:ai · 최종:유저 · 갱신:2026-07-26
  - 메모: 완료(커밋 2e7412e). src/layouts/PostLayout.astro findFirstImage()를 이름 오름차순 정렬로 고정. localeCompare는 ICU 로캘 의존이라 배제하고 코드포인트 비교 사용. 재귀도 2패스로 분리해 '같은 디렉터리 이미지 &gt; 하위 디렉터리' 우선순위를 명시(기존에는 재귀 진입 시점이 readdir 순서에 좌우). 검증: (1) 'bun run build'(node)와 'bunx --bun astro build'(bun) 산출물 30페이지 diff -r 결과 완전 동일 — 카드의 수용 기준 충족. (2) 수정 후 산출물은 수정 전 node 런타임 베이스라인과 바이트 동일 = 정렬 결과가 node 순서와 일치. (3) 현재 배포본(bun 런타임) 대비 차이는 2개 글의 meta 이미지 태그 4개뿐이며, 그 태그를 제외한 나머지는 바이트 동일(본문 img src 불변 — algorithm-at-40-prologue 본문의 reality-1.webp는 그대로). (4) 합성 트리로 node/bun 양쪽 단위 확인 — 최상위 이미지가 하위 디렉터리보다 우선, 디렉터리만 있을 때는 이름순 첫 디렉터리로 재귀. (5) check-post-markers 통과, 빌드 경고 0. || 배포 시 바뀌는 것: algorithm-at-40-prologue OG reality-1.webp→expectation.webp, aside-arc OG memes/3.webp→memes/1.webp. 둘 다 각 글 본문의 '첫 이미지'와 같은 그림이라 대표 이미지로 오히려 적절해진다(1.webp는 본문 거지.webp와 같은 장면의 다른 인코딩). || 부수 발견(미조치): public/images/aside-arc/memes/{1,2,3}.webp는 본문이 참조하지 않는 고아 파일이며 본문의 거지·help-me·페페 이미지와 동일 장면의 리네임 전 원본으로 보인다(해시는 상이). 정렬 규칙상 OG가 이 고아 파일을 고르게 되므로, 정리한다면 OG 이미지가 다시 바뀐다 — 콘텐츠 판단이라 손대지 않음. → 이후 유저가 세 파일을 삭제했고 커밋 b582d5a로 반영, aside-arc OG는 memes/1.webp→memes/help-me.webp가 된다(위 '배포 시 바뀌는 것' 중 aside-arc 항목은 이 값으로 대체). scripts/check-post-markers.ts:36의 readdir도 정렬이 없으나 오류 보고 순서에만 영향하고 산출물과 무관해 범위에서 제외. TalkLayout·SeriesEpisodes는 existsSync 기반이라 이미 결정적.
- `KAN-016` Tauri 해부 2편 — 예시 프로젝트 구현기 — 생성:ai · 최종:ai · 갱신:2026-07-26
  - 메모: 발행 완료 — /posts/tauri-2/ (src/content/posts/tauri-2.mdx, series 'Tauri 해부' order:2, author ppangto). 예시 앱 file-scout(폴더 선택→훑기→진행률 스트리밍→사이드카 체크섬)를 0~~8단계로 구현하며 command/invoke·State·Event/Channel·capabilities+scope·플러그인·사이드카·번들을 전부 관통. 1편 개념은 링크 참조로 위임. 게이트 전부 통과: 외부검토(codex+Gemini) 반영, review-post 🔴0·🟡3, review-writing PASS(MUST 9/9), quality-gate PASS(MUST 15/15) — shell:allow-spawn 권한 누락·Windows canonicalize UNC 검증 결함 등 실제 결함 교정. 리서치: blog-research raws/007 + angle tauri-example-project-part2 + topic tauri-implementation(push 9857238). 커밋 40b4f5b. [디자인 피드백 후속 2887f81] 유저 지적 4건(hero 글씨 작음·Comparison 글씨 작음·화살표 노드 겹침·화살표 이상하게 꺾임)은 모두 1편에서 고쳤던 것의 재발이었고, 원인은 1편 수정이 컴포넌트에만 국소 적용되고 가이드/엔진 기본값에 반영되지 않은 것. 조치: viewBox 폭 620 이하 통일·Flowchart 엣지 축정렬+routing:straight·엣지 label 미렌더라 정보를 노드 label로·hero PosterEditorial 600x338 제목/부제만. 재발 방지로 layout.ts 기본 viewBox 조정 + IMAGE_GUIDE R1~~R5 신설 + make-image SKILL 검증 배선(.claude/.agents 미러). Playwright 렌더 캡처로 육안 검증. build green(31 pages). 후속 graphify 그래프 갱신은 KAN-023에서 완료.
- `KAN-007` Tauri 소개와 구현 예시 — 생성:ai · 최종:ai · 갱신:2026-07-26
  - 메모: 1편(개념·구조) 발행·라이브 배포 완료(/posts/tauri-1/). viz 엔진(KAN-013) 첫 실사용 카나리로 KAN-014 검증 동시 달성. 다이어그램 품질 보정(화살표·색·가독성)·OG 폴백·본문 이미지 분리 반영. 2편(예시 프로젝트 구현기)은 KAN-016으로 분리·발행 완료(/posts/tauri-2/). 카드 범위(1편) 종료.
- `KAN-023` graphify 그래프 데이터 갱신 (연관 글·/graph 10편 누락) — 생성:유저 · 최종:유저 · 갱신:2026-07-26
  - 메모: 완료 — graphify 그래프 전량 재추출로 8편→18편 전편 커버(커밋 e093876). 백엔드를 --backend claude-cli 로 전환: 카드에 적힌 gemini 경로는 graphifyy[gemini] 재설치로 openai 모듈은 복구했으나 무료 티어가 5 RPM + 일일 상한이라 18편 추출 시 청크 절반 이상이 429(3회 시도 모두 부분 실패 → 전량 폐기, 커버리지 4~~15편). 최종 실행: graphify extract src/content/posts/ --backend claude-cli --mode deep --token-budget 15000 --out . → 657노드/1064엣지/30커뮤니티 → graphify cluster-only . --backend claude-cli 로 커뮤니티 한국어 라벨링 → bun scripts/build-graph-data.ts → 18편 600개념 1064엣지 9쌍. 글별 개념 11~~72개로 균일. 함정 2건 발견·조치: (1) graphify가 source_file 을 스캔루트 상대경로('tauri-2.mdx')로 적어 build-graph-data 의 toPostSlug 정규식(레포루트 경로만 매칭)에 전 글이 매칭 실패 → 두 형태 모두 수용하도록 수정. 이게 없었으면 새 그래프가 통째로 무시됨. (2) --out . 누락 시 src/content/posts/graphify-out/ 로 써서 콘텐츠 디렉터리 오염. 재발 방지: CLAUDE.md·ship-post SKILL(정본+.agents 미러)에 실행 명령·백엔드 선택 근거·부분 실패 결과물 커밋 금지(문서 노드 수 = 글 수로 검증)·--out . 필수를 명시, .gitignore 에 graphify-out/cache/·날짜 백업 제외 추가. 검증: build green(31 pages)·tsc clean·마커 0, /graph 216 서클 렌더·tauri-2 연관 글에 tauri-1 + 그래프 개념 칩 노출 육안 확인. 콘텐츠 디렉터리 오염 없음.
- `KAN-013` 집필 워크플로 개정. 지금은  이미지를 생성할 때 chatgpt에게 요청하고 있다. 이제부터는 직접 시각화를 구현해라. @centurio1987/bbangto-ui-visualization 패키지를 이용해서 구현해라. — 생성:유저 · 최종:ai · 갱신:2026-07-26
  - 메모: viz 엔진 구현·배포·검증 완료(main==origin/main). bbangto-ui-visualization(GitHub Packages)로 모든 구조형 시각물·hero를 코드 구현, ChatGPT 이미지 생성 완전 제거. 신규: scripts/apply-viz.ts·render-viz.ts·check-post-markers.ts, src/lib/viz(schema·layout·blogVizStyleGuide), src/components/viz/VizFigure, src/styles/viz.css, .npmrc. v1 kind 5종(ProcessSteps/Comparison/Flowchart/Statistics/PosterEditorial). 파이프라인 재배선(make-image=viz엔진·post-finalize OpenAI 제거·image-maker·tech-deepdive·orchestrator·ship-post·CLAUDE.md·DIAGRAM_STYLE_GUIDE). CI packages:read+미처리마커 가드. [정정] 초기 메모의 '미push·배포 전 리뷰 대기'는 stale — 실제로는 배포 완료: 배포 안정화 검증=KAN-014, 레거시 스크립트 3종 삭제=KAN-015, 미러 문서 viz 동기화=KAN-019, graphify 그래프 재추출=KAN-023 전부 완료로 프로덕션 검증됨. 기존 글 백마이그레이션도 종료 — 발행 18글 전량 미처리 마커 0(check-post-markers ✓, E2E OPENAI 미설정 통과·무JS SSR SVG 페인트 HTTP 검증).
- `KAN-011` 인증·인가 해부 시리즈(4편) — 퍼소나 배선·표적 보정 — 생성:ai · 최종:유저 · 갱신:2026-07-26
  - 메모: main 병합으로 퍼소나(저자) 시스템 반영. 1~~4편 author: ppangto 배선(상단 AI배너·저자명·프로필카드·시리즈 내비 자동 렌더). quality-gate/review-writing(PASS)/review-post 게이트로 정확성·하우스 보이스 표적 보정 완료(전면 재집필 아님). 커밋 0ef48e2·a31d487·84d55fe·b244bcb·012a095·b2d5830. 1편은 '지형도' 장르로 실무 시나리오 생략 유지. 배포·검증 완료(main==origin/main, auth-authz-1~~4 라이브) — 완료 이동.
  - 원문:
    ```text
    인증, 인가 주요 개념과 구현 실습
    - pkce, jwks 등 주요 개념을 설명한다.
    - 주요 사례를 실제 적용하는 베스트 프랙티스와 실습 예제.
    ```
- `KAN-010` KAN-013 퍼소나를 정의 했고, 기존 포스트들에는 퍼소나를 나타내는 저자명, 저자의 프로필, 저자 및 포스트 유형을 나타내는 배너가 포함되어 있으나, 집필 workflow에는 그것들을 포함하는 과정이 생략되어 있다. 포스트 레이아웃의 재설계를 포함하여, 원인 분석과 해결 방법에 대한 전략을 구상하라. — 생성:유저 · 최종:ai · 갱신:2026-07-28
  - 메모: 퍼소나(저자) 시스템 + 포스트 레이아웃 재설계 구현·검증 완료. main 커밋 ecb3f9c·8e58d84·704d581(centurio1987/kan-013 ff). authors.ts 레지스트리(연구원/교수님/선생님)·author 스키마·AI 배너·저자 프로필 카드·목록 AI 칩·폭신 대담(talk) 레이아웃·시리즈 내비 배선. bun run build 통과·렌더 검증(연구원/대담/목록). voice=src/lib/personas/. 미push(배포 전 사용자 리뷰 대기). 열린 사항: 교수님 대담 샘플 미발행, raws 재편·pnpm-lock 보류.
- `KAN-012` 블로그에 motion 요소들을 추가하고 싶다. 블로그 전체 디자인을 파악하여, motion이 들어가면 좋은 지점들을 포착해라. motion 적용은@centurio1987/bbangto-ui-core, @centurio1987/bbangto-ui-style-guide-catalog 를 설치하여 구현해라. — 생성:유저 · 최종:ai · 갱신:2026-07-28
  - 메모: 기획 완료(승인 플랜: ~/.claude/plans/zazzy-enchanting-storm.md). 방향: viz.css 선례 미러 — core MOTION_CSS를 정적 CSS 셸(src/styles/motion.css)로 방출 + 멱등 공유 IntersectionObserver로 가장자리(hero·목록·카드·Squiggle draw-on) 진입 리빌, 콘텐츠 무JS/하이드레이션 0 유지. bbangto-ui-core=모션 엔진, style-guide-catalog 유틸(makeFoundations/makeSemantic/mergeFoundation)로 블로그 전용 bbangtoTonyStyleGuide(코발트+크림·한국어폰트·subtle) 저자화=정적셸+아일랜드 단일 진실원. FoundationProvider 금지(폰트 오염). 독립 배포·롤백 단계: Phase0 설치+스타일가이드 / A 정적셸+리빌(무JS·핵심) / B ClientRouter 크로스페이지 VT+제목 shared-element / C 은은한 배경 아일랜드(Aurora/Waves, reduced시 미마운트)+그래프 reduced-motion 가드 / D CI motion.css drift 가드. 강도=적극적+페이지전환. 외부검토(codex) 지적 9건 반영: reveal 멱등성·스태거 delay cap(min(i,4)*40ms)·name 유일성·persist Header 미적용·번들/접근성/정량 검증. 패키지매니저=bun 확정.
- `KAN-008` OCI, CRI — 생성:ai · 최종:ai · 갱신:2026-07-28
  - 메모: 시리즈 4편 "컨테이너의 해부" 발행 완료 · main 머지·배포됨(556a9ab EP1 / 21bef71 EP2 / de2c2ac EP3 / 43e82f5 EP4, + c632650 CLAUDE.md 검증 보완). 저자 퍼소나 ppangto-teacher(빵토 선생님) 첫 적용. 편당 파이프라인 전 구간 통과: research→tech-deepdive(외부검토 codex/agy)→react-sim→make-image→review-post→review-writing→quality-gate→post-finalize→publish-post→ship-post. 산출물: 글 4편 + React 시뮬 3종(OverlayLab·DigestChain·CriCallTrace) + viz 14종 + hero 4장, 전부 브라우저 육안·상호작용 검증. 리서치: ~/blog-research raws/008 + 위키 10p + angle 4개(306f255). 게이트가 잡은 실오류: whiteout=캐릭터디바이스0/0(.wh. 아님)·pstree 자기모순·copy_up 실습 무효·process.args만 보류(전체 아님)·Hyper-V root MUST NOT·prestart DEPRECATED·hero 제목 잘림. 미해결(별도 카드): 그래프 데이터에 시리즈 글 누락 — graphify 노드 ID 충돌.
- `KAN-029` 글 지도(/graph): 초기엔 글↔글 연관만 표시, 글 노드 호버 시 연관 키워드 노출 — 생성:유저 · 최종:ai · 갱신:2026-07-28
  - 메모: 구현·검증 완료(5b8e7b7, 미머지 — 배포 전 유저 리뷰 대기). 초기 뷰=글 노드+글↔글 엣지만, 개념 노드는 렌더에서 제외. 글↔글 엣지 3신호 합성: 개념 공유(postPairs.score)+본문 인용(문서 노드 직접 엣지, 자기참조 제외)+시리즈 이웃 화(order 체인). hover/focus(터치 첫 탭) 시 상위 8개 키워드를 부채로 펼침 — 방향은 뷰박스 이탈·주변 노드 혼잡도로 선택, 세로 간격 고정이라 키워드끼리 안 겹침. 개념 노드 제거 후에도 검색 유지(글별 searchText에 전체 개념 라벨 접음), 그래프 미포함 글(container-anatomy 4편 — KAN-028)은 tags로 degrade. 부수 수정: 제목 라벨 좌우 클램프·18자 절단·collide 확대로 잘림/겹침 해소, 키보드 접근(tabIndex/Enter/focus) 추가. 검증(Playwright headless): 초기 22노드·17엣지·키워드 0 / hover 키워드 8개·뷰박스 이탈 0 / 좌우 양쪽 방향 전환 / unhover 소멸 / 검색 PKCE→글 3 / 클릭·Enter·터치 2탭 진입 / reduced-motion 동일 배치 / 콘솔 에러 0. 페이로드 562KB→155KB.
  - 원문:
    ```text
    글지도에서, 최초에 나타나는 것은 글 노드와 글 노드 사이의 연관 관계만으로 한정해라. 글 노드에 포인터를 올렸을 때 연관 키워드가 나타나는 것으로 변경해라.
    ```
- `KAN-028` graphify 시리즈 글 노드 ID 충돌로 문서가 그래프에서 누락되는 문제 해결 — 생성:ai · 최종:ai · 갱신:2026-07-28
  - 메모: 구현·검증 완료(8072c28 정규화 + ae9e117 재생성, main 머지 25843f2). 카드 원안(하위 폴더별 extract + merge-graphs)은 폐기했다: cross-post 링크가 전부 같은 시리즈 안(cross-series 0)이라 시리즈 단위 분할은 충돌을 못 잡고, 파일 단위 분할은 그 링크(=postPairs 신호 전부)를 잃으며, merge-graphs는 prefix_graph_for_global로 모든 ID를 tag::id로 바꿔 증류 스크립트·커뮤니티 라벨까지 깨뜨린다. 실제로는 참조 문서 노드와 진짜 문서 노드가 같은 글을 가리키는 같은 실체라 병합이 옳고, dedup이 엣지를 survivor로 재배선하므로 손실이 없다 — 진짜 버그는 build-graph-data.ts가 문서 노드 정체성을 source_file로 판단해 글↔글 인용 엣지를 전부 자기루프로 버린 것이었다. 해결: ① representedPostSlug() 2단 결정론 규칙(①id 정확일치 <slug>/<slug>_post ②id 접두사 + 라벨↔제목 포함, 확신 없으면 source_file 폴백)으로 문서 노드를 가리키는 글에 귀속 — 문서 노드 57개 전수 감사 결과 오귀속 0건(OWASP·Keycloak·mediasoup 등 외부 문서는 전부 폴백). ② scripts/verify-graph.ts 신규: ⓪청크 실패 WARNING ①커버리지 ②껍데기 없음(글당 노드>=2) ③증류 커버리지를 한 번에 판정, 비0=커밋 금지. CLAUDE.md의 손수 python 검사와 ship-post 1.5 절차를 이 스크립트 호출로 교체하고 merge-graphs 금지 근거도 기록. ③ 그래프 전량 재생성(22/22 청크, 청크 실패 0건, ID 충돌 26건은 무해) + cluster-only로 GRAPH_REPORT/graph.html/커뮤니티 32개 동기화. 효과: graphify-out 657노드·1064링크→874·1466, src/data/graph.json 18편→22편(KAN-008 발행 후 재생성 누락으로 통째로 빠져 있던 container-anatomy 1~4편 편입), concepts 600→792, postPairs 25→31, 글↔글 인용 엣지 12→41(쌍 8→25). 검증: verify-graph 4단계 통과 · bun run build 통과 · 증류 멱등성 확인 · Playwright 헤드리스로 /graph 육안 확인(22노드·32엣지·평균차수 2.91·고립 3→1·hover 키워드 8개 부채 정상·콘솔 에러 0). 미해결(보수적 규칙이 놓친 인용 1건): osi_7_layers_5_l5_l6_anatomy 는 라벨이 제목의 의역이라 포함 판정 실패 — 시리즈 체인이 osi-4↔osi-5 를 이미 이어 지도상 손실 없음.
  - 원문:
    ```text
    2번 수행할 수 있도록 kanban에 추가해 주고, 집필은 이대로 마무리 해라.
    ```
- `KAN-027` Footer 임시 마스코트 → 등록 저자 전신샷(나란히) + 홈 마스코트 swing 모션 — 생성:유저 · 최종:ai · 갱신:2026-07-28
  - 메모: 완료. 푸터 임시 마스코트(svg.mascot) → 등록 저자 4인 전신 컷아웃 라인업(src/components/AuthorLineup.astro). 모션은 홈 히어로와 동일한 스윙 공유 — @keyframes tony-sway(2.8s steps(1) ±4deg)를 index.astro 로컬에서 global.css로 올려 단일 소스화, 저자별 음수 딜레이(--i × -0.7s)로 위상만 어긋냄. authors.ts에 fullBody 필드 — 채운 저자만 라인업에 서므로 저자 추가/삭제에 컴포넌트 수정 불필요(KAN-026의 avatarSm과는 쓰임이 겹치지 않는 별개 자산). 자산: scripts/extract-author-cutout.ts가 원본 테두리를 보고 3경로 자동 선택 — (A) 데코 컷=종이색 flood fill+최대 연결 컴포넌트, (B) 이미 투명=알파 임계값 8 바운딩 박스(발밑 그림자 배제), (C) 종이색 아닌 단색 배경=테두리색 ±4. 두 함정: 데코 원본도 테두리가 매끈해 (C)로 오판되던 것(→ 테두리색이 종이색이면 (A)로), 흰 실험복이 종이와 밝기가 겹쳐 배경으로 먹히던 것(→ isPaper에 따뜻함 r−b≥10 하한). 크기는 절반: 표시 높이 56px(모바일 42px), 자산 220px(파일당 9~13KB). 모바일 축소가 죽어 있던 버그도 수정(인라인 커스텀 프로퍼티가 미디어 쿼리를 이김 → --figure-base로 받고 --figure-h는 CSS에서 파생). 검증: 빌드 통과 · 데스크톱 187px/모바일 137px 넘침 없음 · reduced-motion에서 animation:none · 4x 확대 육안 확인. main 머지 완료(충돌은 authors.ts 필드 공존으로 해소).
  - 원문:
    ```text
    대상: footer 마스코트 (footer.site-footer > div.footer-inner > svg.mascot, aria-label 빵관 토니 마스코트 / 홈 http://localhost:4321/).
    
    현재 footer의 이미지는 블로그 설계 초기 때 만든 임시 이미지다. 이 이미지를 현재 등록된 저자들의 전신샷이 나란히 있는 형태로 전환 하라. 이 저자들 이미지 또한, 메인 화면 마스코트와 동일한 모션(swing)을 취해야 한다.
    ```
- `KAN-025` 글 목록에 저자별 필터 추가 (2축 필터 UX 리서치 + 필터에 저자 프로필 사진) — 생성:유저 · 최종:ai · 갱신:2026-07-28
  - 메모: 구현 완료(검토 대기, 커밋 8711454 계열). /posts 에 카테고리 × 글쓴이 2축 패싯 필터 신설 — src/components/PostFilter.astro. 채택 UX(패싯 필터 베스트프랙티스 리서치 기준): 결과 바로 위 수평 칩바 + 축별 라벨(옵션이 축당 10개 미만이면 사이드바보다 상단 칩바가 표준), 축 내 단일 선택(글 하나에 카테고리·저자가 각 1개뿐이라 같은 축 다중선택은 이득이 작다) + '전체' 해제 옵션, 적용 버튼 없는 즉시 반영, 옵션마다 결과 수 표기하되 반대 축 선택에 따라 갱신, 0건 조합은 흐리게(고른 칩은 제외), 0건이면 목록 대신 안내 문구, 글쓴이 칩에 프로필 사진 리딩 요소(요구사항). 구현: 시각적으로 숨긴 라디오 + label 칩 + :has() 기반 CSS-only 필터라 무JS·하이드레이션 0 에서도 필터가 동작한다(콘텐츠 무JS 원칙 유지). JS 는 URL 쿼리(?cat=&author=) 동기화라는 진행적 향상만 담당 — ClientRouter 가 popstate 를 가로채므로 pushState 대신 replaceState. 카운트는 --pf-n 커스텀 프로퍼티를 content 로 흘려 처리하되 기본값도 CSS 로 방출해야 한다(인라인 style 로 두면 인라인 우선순위가 오버라이드를 이겨 숫자가 영영 안 바뀜 — 1차 구현에서 실제로 난 버그). 기존 /posts 의 카테고리 링크 칩(nav.cats)은 필터로 대체했고, /categories/<slug> 정적 페이지는 유지(글 상단 CategoryBadge 가 계속 링크하므로 고아 아님). 검증(Playwright, 프리뷰 HTTP): 저자 필터 4글·조합 필터 1글·딥링크 ?cat=skills&author=ppangto 15글·0건 조합 빈 상태 전환·카운트 갱신·무JS 컨텍스트에서도 필터 동작·Tab 6회로 라디오 그룹 진입 후 화살표 키 즉시 필터·포커스 링 노출·모바일 390px 축 라벨 상단 배치·콘솔 에러 0·/categories,/graph,홈 회귀 없음. KAN-029(graph) 위로 리베이스한 뒤 재검증: build green 35 pages, tsc clean, check-post-markers 통과.
  - 원문:
    ```text
    대상: /posts 글 목록 (section.wrap — 현재 카테고리 필터 nav.cats 만 존재).
    
    지금은 블로그 글 목록에 카테고리 별 필터만 존재한다. 여기에 저자 별 필터도 추가 해라. 필터 분류가 2개이기 때문에 지금과 다른 UX를 채택해야 할 수 있다. 리서치를 통해, 가장 적절한 UX 패턴을 채택해라.
    
    선택 인터렉션 요소에는 저자의 프로필 사진을 포함해야 한다.
    ```
- `KAN-026` 글 목록 아이템에 저자 프로필 사진 노출 — 생성:유저 · 최종:ai · 갱신:2026-07-28
  - 메모: 구현 완료(검토 대기). PostList 아이템의 저자 표기(span.post-author)에 원형 프로필 사진을 이름 앞 리딩 요소로 추가 — src/components/PostList.astro. 22px 원형 + accent 링, 이름이 바로 옆 텍스트로 있으므로 alt 를 비워 장식 처리(스크린리더 중복 낭독 방지), avatar 없는 저자용 해칭+이니셜 폴백 유지, lazy/async 디코딩. 성능 부수 작업: 원본 아바타가 512~1254px(40~150KB)라 20px 자리에 그대로 쓰면 낭비 — scripts/make-author-avatars.ts(sharp, 멱등)로 64px webp 사본을 만들고 authors.ts 에 avatarSm 필드를 배선(4장 합계 355KB→5.6KB). 규약은 /images/authors/<id>-sm.webp — 경로를 바꾸면 스크립트와 authors.ts 를 함께 고쳐야 한다. PostList 는 /posts·/categories/*·/graph 폴백이 공유하므로 세 곳 모두에 동일 적용(의도). 같은 커밋에서 필터용 data-cat·data-author 속성도 아이템에 부여(KAN-025). 검증: 세 페이지 깨진 이미지 0·콘솔 에러 0, build green.
  - 원문:
    ```text
    대상: /posts 글 목록 아이템의 저자 표기 (li.post-item > a.post-link > span.post-body > span.post-meta > span.post-author, 예: 빵토 연구원 AI).
    
    현재 블로그 목록의 아이템에는 저자명과 ai 여부 태그만 나타난다. 저자 프로필 사진이 드러날 수 있도록 해라.
    ```
- `KAN-033` VPN 해부 리서치① — 스펙·RFC 근거 코퍼스 — 생성:ai · 최종:ai · 갱신:2026-07-29
  - 메모: 완료(검토 대기). VPN 해부 7편 공통 스펙·RFC 근거 코퍼스 수집·ingest·push 완료(~/blog-research 커밋 1b28e66). 산출: raws/009-vpn-anatomy-protocol-corpus.md(682줄·§근거 118회·RFC 56인용, 불변) + 위키 topic 11개(rfc5116-aead·rfc8439-chacha20-poly1305·rfc7748-x25519·ipsec-architecture·rfc7296-ikev2·rfc4303-esp·wireguard-protocol·rfc8446-tls13·openvpn-protocol=9 mature, vpn-threat-model·vpn-operational-pitfalls=2 draft) + angle 7개(vpn-anatomy-1~7; EP2~6 mature·EP1/EP7 draft). accept 충족: 와이어 레벨 필드 레이아웃을 섹션 번호까지 확보 — RFC 5116 §2/§5.1-2, RFC 8439 §2.3-2.8, RFC 7748 §5/6.1, NIST SP800-38D §5.2.1, RFC 7296 §3.1-3.10/§1.2-1.3, RFC 4301, RFC 4303 §2/§2.1-2.8/§3.1.1-2/§3.4.3, RFC 3948 §2.1-2.2, RFC 6479, RFC 1191, WireGuard 백서 §5.4.1-7(PDF pdftotext 직접 추출), RFC 8446 §5.1-2/§4.1.2-4.4.4/§7.1, OpenVPN wire §4-7. 1차 소스=RFC Editor 원문·공식 백서·openvpn.github.io wire 문서·NIST PDF. open questions 9건(코퍼스 §7): WireGuard 백서 RFC7539→8439 각주·IKEv2 Exchange Type IANA 코드값·RFC4303 §2 원문 다이어그램·OpenVPN TCP-meltdown 공식 FAQ(503)·커널vs유저스페이스 정량 성능(SEO 저품질이라 의도 배제)·BLAKE2 RFC7693 세부·IKEv2 Proposal/Transform 바이트 오프셋·OpenVPN P_ACK 필드순. 다음: EP2~6은 mature angle로 KAN-036~040 tech-deepdive 집필 착수 가능, EP1/EP7은 draft라 open question 유의. gate for EP1~7 해제.
- `KAN-034` VPN 해부 리서치② — 캡처 랩 환경·방법론 — 생성:ai · 최종:ai · 갱신:2026-07-29
  - 메모: 완료(검토 대기). 재현 가능한 캡처 랩 **설계** 확정 — ~/blog-research/raws/010-vpn-anatomy-capture-lab.md(불변, 22KB) + 위키 topic vpn-capture-lab 신설, blog-research 커밋·푸시. 설계 3원칙(재현성·충실성·안전성), underlay 192.0.2/203.0.113 · overlay 198.51.100 토폴로지에 MASQUERADE로 NAT-T 유발, 버전·암호군 고정(strongSwan 5.9.13 aes256gcm16 / WireGuard 커널내장 고정암호군 / OpenVPN 2.6 AES-256-GCM+tls-crypt), 프로토콜별 캡처·복호 절차, 마스킹 규약(합성 키·RFC5737/3849 IP·RFC7042 MAC), 증거 파일명 규약 + EP↔캡처 매핑표. EP3~7 집필 gate 해제. || ★후속(KAN-043)에서 **실장 시 토폴로지 구현이 대체됨**: 이 카드가 정한 Docker 2노드+NAT(NET_ADMIN·ip_forward)은 실제로는 **Lima VM 1개 + network namespace 3노드**로 지어졌다 — 컨테이너로는 이 카드가 스스로 내건 요구 2개(§6 RFC7042 MAC 부여 / 런타임 sysctl 조작)를 충족할 수 없기 때문. 설계 원칙·주소 대역·암호군·파일명 규약은 그대로 유효하고 **토폴로지 구현 수단만** 달라졌다. raws/010은 불변 원본으로 보존하고 실장 보고는 **raws/011**에 별도 기록(후자가 최신). 위키 topic vpn-capture-lab은 011 기준으로 개정됨. || open questions 5건 중: ④ AES-GCM ESP SA salt 배치 **해결** · ⑤ 컨테이너 wg-quick sysctl RO **소멸**(netns 채택으로 발생하지 않음) · ①②③은 KAN-043 메모 참조.
- `KAN-038` VPN 해부 EP4 집필 — IPsec② ESP·NAT-T·MTU — 생성:ai · 최종:ai · 갱신:2026-07-29
  - 메모: 완료(검토 대기). vpn-anatomy-4 발행·푸시 — 커밋 a3ce646(브랜치 centurio1987/kan-038, 미머지). 산출: src/content/posts/vpn-anatomy-4.mdx(본문 약 17.5천자) + viz 4종(hero PosterEditorial / EspFieldOrder Flowchart / TransportVsTunnel Comparison / MtuBlackhole ProcessSteps) + React 시뮬 2종(AntiReplayLab·EspOverheadLab). author ppangto(총괄 KAN-031 기준 — angle 문서의 '빵토 선생님' 표기는 오기라 무시). || 게이트 전 구간 통과: 외부검토 2라운드(codex+Gemini) → review-post(4축, 자동모드 반영) → review-writing(라운드2 PASS, MUST 11/11) → quality-gate(라운드2 PASS, MUST 전부·SHOULD 0). || 외부검토가 잡은 실오류(1차 소스로 전수 재확인 후 반영): ESP 필드 수 8→7(ESN은 옵션 확장) · AEAD 결합모드는 '검증 먼저 복호 나중'이 아니라 검증·복호 동시(RFC 4303 §3.4.4) · anti-replay 윈도우 갱신은 무결성 검증 성공 후에만(§3.4.3) + SA별 선택이며 무결성 없이는 활성화 불가 · NAT-keepalive 1바이트 0xFF 누락(RFC 3948 §2.3·§4, 20초/5분 기본값, 생존판정 사용 금지) · SPI·Seq가 AAD로 인증됨(RFC 4106 §5) + nonce=salt4+IV8(§4·§8.1) · ICV 16옥텟은 MUST-support이고 현행 실무 기준은 RFC 8221의 ENCR_AES_GCM_16 MUST · IPv6 경계(외부헤더 40B·DF 없음·ICMPv6 type2·정렬 8B·최소MTU 1280) · tunnel DF 복사 정책 3케이스(RFC 4301 §8.1-8.2) · TFC 패딩(§2.7) · WireGuard 백서는 두 방식을 '선택지로 명시'일 뿐 후자 채택 단정 불가. || 렌더 육안 검증(Playwright, astro preview HTTP): hero 제목 잘림 1건 발견→제목 단축 후 재렌더 · Comparison 우측 잘림+내부 여백 1건 발견→항목 단축·viewBox 268→218 재생성 · 시뮬 조작 검증에서 '아주 오래된 패킷' 버튼이 왼쪽밖 거부를 재현 못 하는 결함 발견(윈도우가 seq 1에서 시작해 왼쪽밖이 없음)→초기 상태를 size*2 지점으로 이동+빈칸 2개 배치+'늦게 온 빈칸 채우기' 버튼 신설로 판정 3종 전부 재현. MTU 계산 실측 1446→1438(NAT-T) 스펙 일치 확인, 콘솔 에러 0. || 미해결/후속: ① 시리즈 링크 섹션 미삽입 — 같은 series 'VPN의 해부' 글이 아직 0편 발행이라 목록이 빈 채로 들어감. EP1~3(KAN-035~037, 형제 워크트리 병렬 진행) 머지 후 post-finalize 재실행 필요(멱등, 기존 섹션 교체). 본문의 /posts/vpn-anatomy-2·3·5 링크도 그때까지 404. ② 실제 캡처 아티팩트(~/blog-research/raws/captures/) 미생성 — 본문은 스펙 유도 레이아웃 + 랩 재현 절차로 분리 서술(KAN-031 정확성 규칙 준수), 캡처 확보 시 발췌 인용 보강 가능. ③ graphify 그래프 재생성 진행 중.
- `KAN-035` VPN 해부 EP1 집필 — 큰 그림·프로토콜 지형도 — 생성:ai · 최종:ai · 갱신:2026-07-29
  - 메모: vpn-anatomy-1 발행 완료(05e8203) · 큰 그림: 터널링+암호화 두 축, 위협모델 trust transfer(관찰자 시뮬), 프로토콜 지형도 3가족→EP3~6, 레거시 배제 근거. 외부검토 2R 반영(NAT-T 원인 정정·SNI 보강·macOS dig 교정). 게이트: review-writing PASS·quality-gate PASS. viz 4종(hero+인라인3)+시뮬1. graph.json 재생성은 KAN-044 정책대로 편당 생략(7편 전량 머지 후 일괄).
- `KAN-036` VPN 해부 EP2 집필 — 암호 기반체력 — 생성:ai · 최종:ai · 갱신:2026-07-29
  - 메모: 발행 완료(검토 대기) — /posts/vpn-anatomy-2 · src/content/posts/vpn-anatomy-2.mdx · 브랜치 커밋 93a161e, main 병합 49f7584. 제목 '암호가 하는 세 가지 약속: AEAD와 키교환, 그리고 카운터 하나', series 'VPN의 해부' order:2, author ppangto, category skills, 공백제외 13,366자. || 저자 퍼소나 ppangto 확정(유저 확인): KAN-031 총괄 카드·angle 프론트매터 값 일치, 선수 시리즈 OSI 7계층 해부·인증인가 해부·WebRTC·Tauri가 전부 ppangto. angle vpn-anatomy-2.md의 '(빵토 선생님)' 괄호 라벨·ppangto-teacher 태그는 오기(ppangto-teacher는 컨테이너의 해부 4편 전용) — EP1·EP3~7도 ppangto로 통일할 것. || 게이트 전부 통과: 외부검토(codex+Gemini) 반영, review-post 4축 빨강6·노랑10 중 13건 반영, review-writing PASS(MUST 8/8), quality-gate PASS 2라운드(MUST 15/15). 게이트가 잡은 실오류 — (1) '미래는 rekey가 지킨다'가 논리적 오류: 단방향 파생은 앞→뒤 계산을 못 막으므로 유출 상태 탈출엔 새 키교환이 필요, 전면 수정. (2) KDF 단계 통째 누락으로 X25519 공유 비밀이 곧 AEAD 키인 것처럼 읽힘 → '공유 비밀은 아직 키가 아니다' 절 신설(RFC 8446 7.1). (3) NIST 인과 단정(ChaCha20이 GCM 권장값에 맞춰 들어왔다)은 코퍼스 근거 없음 → RFC 5116 2.1 공통 인터페이스 규약 기반 재서술. (4) Poly1305 인증 대상을 AAD+암호문으로 단순화했으나 실제는 패딩+길이 2개 포함(RFC 8439 2.8). (5) '카운터는 겹치지 않는다'에 상태 보존 전제(재시작·다중 송신자·wraparound) 단서 추가. (6) 카운터 3종(블록 카운터/nonce/재전송 번호) 혼용 위험 → 구분 표 신설. (7) AES-GCM·NIST 약어 미풀이. || 반려한 지적: Gemini의 'RFC 7748 6.1 all-zero 검사는 MUST' 주장은 1차 소스 확인 결과 원문이 MAY라 본문 유지. || 산출물: hero.webp(1200x676) + viz 3종(VizProcessSteps2·VizComparison3·VizFlowchart4, R1~R5 렌더 캡처 검증) + React 시뮬 NonceReuseLab(nonce 재사용 시 C1^C2=P1^P2 성립·붕괴와 P2 평문 복원 실측, hydration 경고 0) + ascii 도해 6개. || 검증: check-post-markers 통과, bun run build 통과(메인 대화가 독립 재확인), 미발행 EP 하드링크 0건. || graphify 재생성 skip — KAN-044 정책(7편 전량 머지 후 일괄 재생성)과 일치. 그동안 연관 글은 frontmatter 기준 degrade(의도된 동작). || 미배포: main 로컬 병합만 완료, origin/main 미푸시 — GitHub Pages 배포는 푸시 시점. || 인계: EP1(KAN-035)은 이미 발행돼 series 'VPN의 해부'로 EP2와 자동 연결됨. EP3으로 이월=PSK/PKI/EAP 인증 방식 세부(본문에 이월 명시, angle open question이라 코퍼스 2절로 충분한지 확인 필요). EP4(KAN-038 발행 완료)·EP5로 이월=anti-replay 윈도우 실제 크기·알고리즘(RFC 4303 vs 6479), 카운터를 nonce로 겸하는 구체적 방식.
- `KAN-043` VPN 해부 캡처 아티팩트 실제 생성 (랩 실행 → raws/captures/) 및 본문 발췌 보강 — 생성:ai · 최종:ai · 갱신:2026-07-29
  - 메모: 완료(검토 대기) — 랩 구축·아티팩트 생성·집필 인계까지. || ★환경이 KAN-034 설계와 달라졌다: Docker 2노드+NAT → **Lima VM 1개 + network namespace 3노드**(컨테이너 런타임 없음). 유저 가치(Docker Desktop급 무게 배제)가 1차 이유지만, 조사 결과 컨테이너는 raws/010이 스스로 내건 요구 2개를 깬다 — ① RFC7042 문서용 MAC 부여(Docker --mac-address는 다중 네트워크 컨테이너에 무효, r 노드는 정의상 2개 망) ② 런타임 sysctl 조작(/proc RO). 후보 10종의 커널 config를 직접 대조해 Lima 채택(스톡 Ubuntu만 CONFIG_MODULES=y; Apple container는 CONFIG_INET_ESP 부재로 IPv4 IPsec 불가, OrbStack은 config 비공개+modprobe 불가, Multipass는 macOS 26.5.2/25F84에서 restart 무한행 이슈 #5049). || 산출: ~/blog-research/lab/vpn-capture-lab/(Lima vz+Ubuntu24.04 digest핀, netns 토폴로지, 프로토콜 3종 기동, 게이트 5종, 캡처 러너, Makefile, README) + raws/011 실장보고 + raws/captures/vpn-anatomy-{3,4,5,6}/ 아티팩트 15개(텍스트 디섹션 + 소용량 pcap). blog-research 커밋 ca2a6e7·e240001(로컬). || 게이트 전 구간 통과: Phase0 커널실측 / Phase2 토폴로지(NAT'd 출발지·offload off·RFC7042 MAC·netns sysctl 격리) / Phase3 IPsec(charon 2인스턴스, **호스트 xfrm 0개 = netns 격리 증명**, NAT-T UDP4500 자동 발동) / Phase4 WireGuard(s1이 학습한 피어=203.0.113.1 → birth-namespace 함정 회피 증명) / Phase5 OpenVPN. || raws/010 §8 open questions: ④ salt 배치 **해결**(aead 키를 salt 포함 36B 통째로; tshark -o uat:esp_sa 만으로 복호 → Wireshark GUI 불필요) · ⑤ 컨테이너 wg-quick sysctl RO **소멸**(netns) · ① IKE_AUTH SK_ 미확립 유지 · ② WireGuard 완전복호는 충실성 원칙(유저스페이스 전환 금지) 충돌로 **부분복호 확정** · ③ OpenVPN 패치는 발행 직전 재확인. 신규: **Cookie Reply(type3,64B) 미관측**(부하 시에만 발생) — EP5는 백서 값으로 서술하고 미관측을 밝히거나 별도 유발 필요. || ★실장 발견(raws/011 §2): AppArmor가 charon/swanctl에 경로 기반 프로파일을 걸어 노드별 설정 경로 사용 시 EACCES가 아니라 조용히 'invalid configuration'으로 죽는다(010에 없던 항목) / charon pid 컴파일타임 고정 → netns private mount ns에서 bind-mount 분리 / **offload 미차단 시 캡처에 합쳐진 패킷·미계산 체크섬이 찍혀 '실물 패킷' 전제 붕괴** / WireGuard는 birth namespace 때문에 반드시 해당 netns 안에서 생성. || 집필 인계 정비(감사 후 발견한 오도 수정): topics/vpn-capture-lab을 011 기준 전면 개정(존재하지 않는 Docker 랩 사용법을 안내하고 있었음) · angles/vpn-anatomy-3~7의 '캡처 재현: §4.x'를 **실제 아티팩트 파일 경로 + 실측값**으로 교체하며 사실오류 3건 교정(EP5 wg-quick→wg setconf, 148/92/64B→64B 미관측, EP4 Wireshark GUI→불필요) · 블로그 레포 CLAUDE.md 'Packet captures' 절 + tech-deepdive SECTION_PATTERNS 지침 신설 · 크기 인용 시 계층(UDP 페이로드 vs 프레임) 명시 의무화. || 잔여: EP4(발행본)에 실측 발췌 retro 삽입 — 별도 카드로 분리.
- `KAN-046` graphify 증분 추출 복구 — 글 1편 추가에 전수 재추출 중단 — 생성:ai · 최종:ai · 갱신:2026-07-29
  - 메모: ✅ 부트스트랩 완료(2026-07-29, main 24ef578). 콜드 전량 재추출(1.66M in/352k out·~50분)로 커버리지 22편→25편(vpn-anatomy-1·4 포함). 합격기준 ①②③⑤ 통과: verify-graph 통과 · 캐시 25건 · build 38p 통과 · /graph·연관글 렌더 확인 · communityName 실명(플레이스홀더 0). || ③(핵심) 무변경 재실행 0토큰 실측 — 증분 복구 목표 달성. || ④(캐시 무변경 fixpoint) 미성립: graphify 클러스터링 비결정성으로 웜→웜에도 9파일 churn + graph.json ~560줄 churn. 유저 결정=캐시 계속 커밋(노이즈 감수) — 커밋 노이즈 대부분이 graph.json 자체라 gitignore 폴백은 이점 적음. CLAUDE.md/README '절대 gitignore 하지 마라' 규약 유지. || 기준선 실측(in/out·벽시계·hit/miss): 콜드 1,655,027/351,992·~50분 · 무변경 0/0·1s·25hit/0 · 1편본문(tauri-1) 59,336/10,101·86s·24hit/1miss · .mdx프론트매터만(updatedDate) 59,138/10,300·86s·24hit/1miss(→ cache.py 프론트매터 스트립 .md전용 확정: post-finalize의 tags·updatedDate·시리즈링크가 그 글 재추출 유발) · 형제3편(osi-7-layers-2·3·4) 181,821/51,825·438s·22hit/3miss. 증분비용=바뀐 글 수에 선형(글당 ~59k in), 1편=이전 전량(1.66M) 대비 ~96%절감. || 부수 버그수정(24ef578): refresh-graph.sh 가드③ — 캐시 디렉터리 없는 콜드 상태에서 find가 set -e pipefail로 경고도 못 찍고 스크립트를 죽이던 버그 → mkdir -p graphify-out/cache/semantic 선행. || 원인·해결 상세는 CLAUDE.md graphify 절 + 커밋 2394fcf/24ef578. KAN-044 함께 검토 이동.
- `KAN-044` graphify 그래프 일괄 재생성 (VPN 시리즈 7편 전량 발행·머지 후 1회) — 생성:ai · 최종:ai · 갱신:2026-07-29
  - 메모: ✅ KAN-046 부트스트랩으로 흡수·완료(2026-07-29, main 24ef578): 커버리지 25편(vpn-anatomy-1·4 포함), verify-graph 통과, 증분 복구 실측 완료 — 이후 그래프 갱신은 main 머지 직후 bun run graph:refresh 1회면 바뀐 글만 LLM을 탄다. 실측·결정 상세는 KAN-046. || **KAN-046으로 전제가 바뀌었다** — 근거 ①(매 실행 전량 재추출)은 원인이 규명·수정됐고, ②③은 '그래프 갱신은 main 워크트리 전용' 규약과 refresh-graph.sh 가드로 해소됐다. 이 카드는 'VPN 7편 모아서 1회'가 아니라 **KAN-046 부트스트랩 1회로 흡수**된다. 부트스트랩 후에는 main 머지 직후마다 `bun run graph:refresh` 를 돌리면 되고, 바뀐 글만 LLM 을 타므로 모아둘 이유가 없다. || 현재 상태: 커밋된 그래프는 22편(vpn-anatomy-1·4 누락)이라 verify-graph 가 실패한다 — 부트스트랩 전까지 연관 글·/graph 는 frontmatter 폴백으로 degrade(기능은 동작). || 절차는 KAN-046 참조. KAN-046 부트스트랩 완료 시 이 카드도 함께 닫는다.
- `KAN-037` VPN 해부 EP3 집필 — IPsec① IKEv2 협상 — 생성:ai · 최종:ai · 갱신:2026-07-29
  - 메모: 완료(검토 대기). vpn-anatomy-3 발행 — 커밋 b2edf14, 머지 b7cd07f, origin/main 반영 확인(2026-07-29 사후 검증). IPsec① IKEv2: SPD/SAD·SA/SPI, IKE_SA_INIT→IKE_AUTH 4메시지, UDP 500→4500 NAT-T 전환, IKE 헤더 28B·Proposal/Transform 2단 트리 분해. || 인계(draft/KAN-037-HANDOFF.md) 지시 전부 반영 확인: author ppangto · series "VPN의 해부" order:3 · category skills · draft:false · 캡처 발췌 인용 6곳(출처 `ike_sa_init.txt` 프레임1·2 / `ike_auth.txt` 프레임3·4를 본문에 명시) · IKE_AUTH 는 SK{} 암호문으로 정직하게 서술. viz 3종(VizFlowchartSpdSaSad·VizProcessStepsFourMessages·VizComparisonSpi) + 시뮬 2종(IkeHeaderDissector·ProposalTreeBuilder). || 2026-07-29 검증: bun run build 42p exit 0 · 내부 링크 /posts/vpn-anatomy-1~7 전량 생존 · 그래프 커버리지 포함(conceptCount 51 = 껍데기 아님).
- `KAN-039` VPN 해부 EP5 집필 — WireGuard — 생성:ai · 최종:ai · 갱신:2026-07-29
  - 메모: 완료(검토 대기). vpn-anatomy-5 발행 — 커밋 0a118ed, 머지 c0767f5, origin/main 반영 확인(2026-07-29 사후 검증). WireGuard: 고정 암호군(Curve25519+ChaCha20Poly1305+BLAKE2s), Noise_IKpsk2 와 실제 UDP message format 층위 구분, Cryptokey Routing·1-RTT 핸드셰이크, IPsec 대비. || 캡처 발췌 4곳 + 아티팩트 경로 출처 표기(~/blog-research/raws/captures/vpn-anatomy-5/ 의 wg-handshake.txt·wg-transport.txt·wg-sizes.txt·wg.pcap, 각 파일 첫머리 주석이 출처). CLAUDE.md 규약 준수 확인: 148/92/32B 를 **UDP 페이로드 길이**로 계층 명시(프레임은 +42B), 커널 wg 부분복호 사실 그대로 서술. viz 3종(CryptokeyRoutingFlow·OneRttFlow·WgVsIpsec) + 시뮬 CryptokeyRoutingLab. || 2026-07-29 검증: build 42p exit 0 · 그래프 conceptCount 50.
- `KAN-040` VPN 해부 EP6 집필 — TLS-VPN(OpenVPN·SSL-VPN) — 생성:ai · 최종:ai · 갱신:2026-07-29
  - 메모: 완료(검토 대기). vpn-anatomy-6 발행 — 커밋 7e3e330, 머지 88aeaf7, origin/main 반영 확인(2026-07-29 사후 검증). TLS-VPN/OpenVPN: 제어 채널만 TLS 를 빌려 쓰는 구조, opcode 1바이트 설계, tls-auth vs tls-crypt 가 캡처 두 장에서 갈리는 지점, P_DATA_V2 AEAD 헤더 24B, TCP-over-TCP meltdown. || 캡처 발췌 4곳(openvpn-opcode.txt tls-crypt 모드 Frame 1·3 / openvpn-tls-auth.txt Frame 2 / openvpn-compare.txt) — 전부 파일 경로·모드·프레임 번호까지 출처 표기. 데이터 채널 복호 불가(2.6 SSLKEYLOGFILE 미방출)를 위조 없이 명시. viz 3종 + 시뮬 OpcodeByte. || 2026-07-29 검증: build 42p exit 0 · 그래프 conceptCount 30.
- `KAN-041` VPN 해부 EP7 집필 — 선택 매트릭스·운영 총정리 — 생성:ai · 최종:ai · 갱신:2026-07-29
  - 메모: 완료(검토 대기). vpn-anatomy-7 발행 — 커밋 3610efb, 머지 44e000b, origin/main 반영 확인(2026-07-29 사후 검증). 선택 매트릭스 5축(보안·성능·NAT친화·모바일로밍·운영복잡도) + 운영 함정(MTU 블랙홀·DNS 유출·split tunnel·kill switch) + 세 가족 최종 비교표 + 전편 회수. || 후속 통합 패스 b4b4e7f 에서 선택 매트릭스·오버헤드표의 ⚠︎TBD 7셀을 형제편(EP4·EP5·EP6) 실측·서술로 확정 — 창작 수치 0, MOBIKE=RFC 4555·유효 터널 MTU ≈1438~1448B 등. 표의 셀마다 근거 주석({/* 근거: EP5 wg-sizes.txt … */})을 달아 캡처 파일까지 역추적 가능. 크기 인용은 UDP 페이로드 vs 프레임 계층을 전부 명시(CLAUDE.md 규약). viz 3종(MtuTriage·VizSplitLeak·KernelVsUserspace) + 시뮬 SplitTunnelLab. || 2026-07-29 검증: build 42p exit 0 · 그래프 conceptCount 38.
- `KAN-031` VPN 완벽 해부 시리즈 집필 — 생성:유저 · 최종:ai · 갱신:2026-07-29
  - 메모: VPN 해부 시리즈 총괄. author:ppangto, category:skills, slug vpn-anatomy-N. 확정 7편: EP1 큰그림 / EP2 암호기반 / EP3 IPsec-IKEv2 / EP4 IPsec-ESP·NAT-T / EP5 WireGuard / EP6 TLS-VPN / EP7 선택·운영. 하위카드 KAN-033~041. || ✅ 완료(유저 검토 완료, 2026-07-29). EP1~EP7 7편 전량 발행(draft:false)·origin/main 반영. series "VPN의 해부" order 1~7 · author ppangto · category skills 통일. bun run build 42p exit 0, 내부 링크 전량 생존, 그래프 커버리지 29/29편(VPN 7편 conceptCount 27~54, 껍데기 0). || 유저 요구 "실제 캡처와 완벽히 똑같은 실물 패킷" **7편 전편 이행 완료** — EP3·5·6·7은 집필 시점에 발췌 인용, EP4는 KAN-045로 retro 삽입(2026-07-29). 잔여 없음. || 부수 산출: KAN-042에서 "## 이 시리즈의 다른 글" 수동 섹션을 전 발행물(14편)에서 제거하고 post-finalize 삽입 로직을 폐지 — 시리즈 네비는 PostNav·SeriesEpisodes 자동 렌더로 일원화.
  - 원문:
    ```text
    VPN 완벽 해부 시리즈 집필
    - VPN의 원리, 작동 매커니즘, 절차 별 패킷 구성, 사용하는 알고리즘이나 표준 규격, 프로토콜을 심층 설명한다.
    - 독자가 큰 그림을 그릴 수 있도록 개념적 관점 설명을 포함한다.
    - 전문적 이해를 위해, 실제 환경과 완전히 일치하는 형식과 내용을 제공하여 설명한다.
      - ex. wireshark로 패킷을 캡쳐 했을 때와 완벽히 똑같은 실물 패킷을 제공하여 설명한다.
    ```
- `KAN-042` VPN 해부 시리즈 링크 섹션 삽입 (EP 발행 후 post-finalize 재실행) — 생성:ai · 최종:ai · 갱신:2026-07-29
  - 메모: ✅ 완료(검토 대기) — 2026-07-29. **유저 결정: 섹션은 없는 게 맞다 → 전 발행물에서 삭제해 통일.** || 조치 ①: "## 이 시리즈의 다른 글" 섹션을 발행물 **14편에서 일괄 제거**(auth-authz 1~4 · osi-7-layers 1~6 · webrtc 1~3 · vpn-anatomy-1). 전부 파일 끝 섹션이라 삭제 경계가 깨끗했다 — 검증 내장 스크립트로 처리(섹션 뒤 다른 헤딩 존재 / 목록 아닌 내용 혼입 시 거부, 미리보기 후 적용). 잔존 0건. || 조치 ②(핵심): **post-finalize의 삽입 로직 자체를 폐지.** 안 그러면 다음 발행 때 되살아난다. `.claude/skills/post-finalize/SKILL.md` 4단계를 "삽입"에서 "잔존 시 제거"로 뒤집고 frontmatter description·멱등성 원칙·보고 포맷까지 정리, `assets/SERIES_SECTION_TEMPLATE.md` 삭제(.codex 미러도 동일). 연쇄 참조 정리: tech-article-publisher(.md/.toml) · raw-to-draft · tech-deepdive(.codex) · README.md · CLAUDE.md. || 근거: PostNav.astro(이전화/다음화)·SeriesEpisodes.astro(지난 에피소드 그리드)가 모든 글에 시리즈 네비를 자동 렌더하므로 본문 수동 섹션은 순수 중복이고, 수동 목록은 형제 편 발행마다 손갱신이 필요해 "(작성 예정)"·404를 남긴다. || 검증: bun run build 42p exit 0. 내부 링크 /posts/vpn-anatomy-1~7 전량 생존.
- `KAN-045` VPN 해부 EP4 발행본에 실측 캡처 발췌 retro 삽입 — 생성:ai · 최종:ai · 갱신:2026-07-29
  - 메모: ✅ 완료(검토 대기) — 2026-07-29. vpn-anatomy-4 발행본에 랩 실측 캡처 발췌를 retro 삽입. 이로써 KAN-031 유저 요구("wireshark로 캡처했을 때와 완벽히 똑같은 실물 패킷")가 **7편 전편 이행**됐다. || 삽입 내역 5곳: ① 새 절 "### 스펙에서 캡처로: 실제 패킷 하나를 열어 본다"(필드 순서 절 뒤) — 암호화 상태 발췌(SPI·Seq 평문 노출 실증) + 복호 발췌(IV 8B·Pad 2·Pad Length·Next header IPIP까지 7필드 전부) ② tunnel 절 — 같은 프레임에 IP 헤더 2개(바깥 192.0.2.10→203.0.113.10 / 안쪽 198.51.100.2→198.51.100.1)로 "국경을 두 번" 실증 ③ NAT-T 절 — 같은 4500 포트에서 Frame 1은 ISAKMP, Frame 3은 ESP로 갈리는 실물 + 시퀀스 양방향 1~5 ④ MTU 절 — 실측 오버헤드 64B(고정 62 + 패딩 2) 산출, 시뮬 EspOverheadLab의 1438과 교차검증 ⑤ 실습 절 — 발췌 출처·재현 절차 명시. 도입부 "읽기 전 약속"도 "스펙 유도 + 캡처 대조"로 갱신. || 규약 준수: 블록당 최대 13줄(20줄 이내) · **디섹션 값 위조 0건**(인용 문자열 21건을 원본과 grep -F 전수 대조) · 크기 인용 시 계층 명시(프레임 162 vs IP 148을 본문에서 명시적으로 경고) · 각 .txt 헤더의 생성 명령·버전·캡처 지점을 출처로 표기. `[unchecked]`를 덮지 않고 "이 캡처가 증명하는 범위는 복호까지"라고 좁혀 서술. || 함께 교정(KAN-043 인계 반영): 실습 절 6단계의 "Wireshark GUI(Preferences→Protocols→ESP)"를 tshark `-o uat:esp_sa` 한 줄로 교체하고, aead 키는 32+4로 나누지 말고 **36옥텟 통째로** 넣는다는 확정 사실 반영. || 게이트: review-post 4축 자체검토 실행 → 🔴 1건(내가 만든 결함: 프레임별 프로토콜 요약 블록에 tshark가 출력하지 않는 `→` 서식을 지어냄) + 🟡 1건(생략 표시 누락) 발견해 둘 다 수정. 수정 후 재대조·재빌드 통과. || 검증: bun run build 42p exit 0, 코드블록 내 지어낸 서식 잔존 0건.
- `KAN-056` graphify 그래프 갱신을 에이전트 작업에서 git 훅 자동화로 전환 — 생성:유저 · 최종:ai · 갱신:2026-07-29
  - 메모: 예약제로 확정. 감지(시리즈 완결 판단)는 ship-post가, 실행은 git 훅이 맡는다. bun run graph:request 로 예약 마커를 남기면 main 다음 커밋·머지에서 훅이 한 번 돌고 예약을 지운다 — 예약이 없으면 커밋이 쌓여도 아무 일도 없다. 커밋마다 도는 초안은 집필 중 커밋·오타 수정까지 갱신을 불러 예외가 너무 많았다. graph-stamp.sh 는 임시 인덱스로 '커밋됐을 때의 posts 트리'를 미리 계산해 중복 실행을 막는다. 훅은 오케스트레이션 비용만 없앤다 — LLM 추출비는 캐시가 줄인다(전수 청킹 아님, 미스분만).
  - 원문:
    ```text
    graphify 작업은 ai 작업이 아닌데,  agent가 수행하면 토큰을 굉장히 소모하는 느낌이다. 어차피 graphify 작업은 글 작성 이후에 기계적으로 수행하는 작업 이므로, 훅으로 스크립트를 수행하게 하면 될 것 같다. 옳은 판단인지 고려하고 옳다면 그렇게 정책을 정하고 정책 수행에 필요한 작업을 수행해라
    ```
- `KAN-055` 포스트 글을 들어가는데 프리징이 생긴다. ux를 해치지 않기 위해 fallback loading ux를 추가하려고 한다. 프리징 원인을 진단하고, loading ux를 추가하는 것이 맞는 솔루션인지 검증 한 후, 최적의 솔루션을 채택하여, 수행 전략을 구상해라. — 생성:유저 · 최종:ai · 갱신:2026-07-29
- `KAN-054` 시리즈 글의 경우, 글 목록에서는 어떤 시리즈의 글인지 표시되어 있지 않아, 파악이 어렵다. 목록 아이템의 레이아웃에 시리즈를 파악할 수 있는 구성 요소를 설계 및 디자인 하고, 구현 할 수 있도록 전략을 구상해라. — 생성:유저 · 최종:ai · 갱신:2026-07-29
- `KAN-050` 헤더 레벨로 포스트 페이지 우측에 네비게이션을 보여주고, 헤더를 클릭하면 바로 스크롤해서 이동할 수 있는 기능을 추가해라. — 생성:유저 · 최종:ai · 갱신:2026-07-29
  - 메모: 포스트 목차 레일 — 오른쪽에 떠 있는 접힘/펼침 네비게이션. PostToc.astro(render() headings → 서버 렌더 앵커, h2+h3): 평소엔 눈금(tick)만 48px 폭·화면 절반 높이로 접혀 있고, 근처에 포인터가 오면 320px 패널로 펼쳐져 본문 위에 오버레이된다. 오버레이라 본문 칼럼 폭을 뺏지 않으므로 880px부터 켜진다(접힘 히트영역이 본문을 침범하지 않는 하한). 깊이 표현이 상태마다 다르다 — 접힘은 눈금 길이(h2 20px/h3 9px), 펼침은 눈금을 지우고 글자가 진다(크기·굵기·색 + h3 20px 들여쓰기 + h2 앞 여백). tocSpy.ts(scroll+rAF 스파이, 진행적 향상) + tocFloat.ts(hover 없는 입력의 첫 탭=펼치기, 펼침 완료 시 현재 절 끌어오기) + tokens.css --header-h + .prose 헤딩 scroll-margin-top. 활성 임계선은 헤딩의 scroll-margin-top에서 파생시킨다 — 임의 패딩을 쓰면 클릭 착지 지점과 8px 어긋나 직전 절이 활성으로 남는다. 본문 파일 무수정, 무JS에서도 목차 노출·클릭 점프·펼침(CSS :hover/:focus-within) 동작.
- `KAN-047` rss 기능 추가할 수 있나, 있다면 추가 계획을 세우고 수행해라. — 생성:유저 · 최종:ai · 갱신:2026-07-30
  - 메모: 구현 완료(머지 c287f9d). @astrojs/rss 기반 정적 피드 — /rss.xml(전체 29편) + /categories/<slug>/rss.xml(9개). src/lib/feed.ts 가 채널 메타·아이템 조립·상한(FEED_MAX_ITEMS=50)의 단일 소스. 요약 피드(표지·요약·시리즈 회차·본문 링크) — 본문이 MDX 아일랜드라 리더에선 껍데기가 되므로 전문 제외, 확장 지점은 toFeedItem 하나. 저자는 dc:creator(RSS <author>는 이메일 자리), lastBuildDate 는 최신 글 pubDate(빌드 시각은 무변경 재배포에도 흔들림). 노출: 전 페이지 head 자동발견 + 푸터 RSS + 목록/카테고리 제목 옆 FeedLink 캡슐. 검증: bun run build 통과, 피드 10개 xmllint 통과. || 계획 대비 차이 2건 — ① 카테고리별 피드를 '초판 제외(YAGNI)'로 잡아뒀으나 실제로는 포함했다(카테고리가 이미 정본 분류라 getStaticPaths 재사용으로 비용이 낮았고, 글 폭이 넓어 전체 피드가 소음이 되는 문제가 실재). 되돌리려면 src/pages/categories/[category]/rss.xml.ts 삭제 + [category].astro 의 FeedLink/feeds prop 제거면 끝. ② 검증에서 W3C Feed Validator·리더 앱 실물 확인은 미수행(로컬 xmllint + XML 파싱 점검으로 대체) — 배포 후 확인 필요. || 미확인: 목록/카테고리 제목 옆 캡슐 배치의 시각 확인(브라우저 확장 미연결로 빌드 HTML 구조만 확인).
- `KAN-049` 글지도에서 그래프가 확장 되어도 전체를 조감할 수 있도록, 확대, 축소와 캔버스 내 위치 이동 기능을 추가해라. — 생성:유저 · 최종:ai · 갱신:2026-07-30
  - 메모: 월드(레이아웃 공간)와 뷰포트를 분리해 구현. transform 2단 중첩(.graph-pan 사용자 카메라 × .graph-viewport 필터 fit)으로 자동 fit의 settle 추종을 유지한 채 카메라를 얹었다. 월드는 글 수에 비례 확장(worldScale=√(n/30), 상한 3) — 29편인 현재는 정확히 1.0이라 화면 변화 0. 제스처는 자체 포인터 이벤트(d3-zoom 미도입, 페이로드 유지) + non-passive wheel(ctrl/meta일 때만 줌, 평 휠은 페이지 스크롤), touch-action:pan-y, 지연 포인터 캡처(임계 5px)로 드래그≠클릭. ＋ − ⤢ 버튼으로 키보드 전용 경로 확보. 부채는 뷰포트 인식으로 확대 후에도 화면 안. 실측: Playwright 20/20(줌 클램프·팬 잠금·리스너 누수·pointercancel 복구·reduced-motion 포함), 빌드 42페이지 클린. 미검증: iOS Safari 실기기 touch-action(Chromium만 확인), 두 손가락 핀치는 후속.
- `KAN-051` 글지도에 연도별 필터를 추가해라. — 생성:유저 · 최종:ai · 갱신:2026-07-30
  - 메모: '연도별'을 데이터에 적응시켜 구현 — 29편이 전부 2026년이라 연도 칩은 '2026' 하나뿐인 죽은 UI가 된다. 36개월(3년)까지는 월 단위, 넘으면 연 단위로 접힌다(graph.astro에서 판정·집계·라벨까지 끝내 hydration 위험 차단). 눈금 도메인은 빈 칸도 count 0으로 채운 연속 구간 — 안 그러면 5월과 9월이 붙어 시간축이 거짓말을 한다. UI는 유저가 Claude Design으로 제공한 1e안(커맨드 바 + 토큰 + 끌어서 조절하는 게이지)으로 구현: 축별 칩 행 대신 입력 하나에 필터를 토큰으로 쌓고, 기간은 양끝 손잡이 게이지, 키워드는 AND. 드래그 중에는 값만 칸에 스냅하고 선은 손끝을 그대로 따라간다(손잡이는 칸이 아니라 가장 가까운 칸 경계에 스냅 — 칸 포함으로 재면 hi 손잡이가 늘 한 칸=280px 뒤처졌다). 실측: 1e 41/41 · 드래그 추종 14/14(커서 대비 오차 0px) · 12칸 mock에서 밴드 평행이동 15/15 · 드래그 프레임 중앙값 8.3ms. noFilter 센티널에 range 포함(빠뜨리면 기간 필터가 무음으로 무시되는 유일한 지점).
- `KAN-057` 데코 키트를 블로그 실제 페이지에 적용 (홈 히어로 · 글 목록 · 글 상세 · 글 지도) — 생성:ai · 최종:ai · 갱신:2026-07-30
  - 메모: 완료 — 네 지면에 얹음(강도: 홈 4, 나머지 3). 홈: P-02 HeroCollage 로 구운 tony-deco.webp 대체 + P-06 탭 배지·BAKED FRESH 테이프 + P-07 NEW 도장. 목록: P-06 리본(전부 N편) + P-03 필터 클립 카드 + P-07 도장(시리즈 테이프를 피해 top:34px, 768px 이하 접음). 글 상세: MDX components 매핑으로 blockquote→P-04 / pre→P-05 자동 치환(src/components/deco/mdx/), 시리즈 글 하단 P-08 티켓+손글씨(+마지막 편이면 완결 도장). 지도: P-01 TapedBoard + MAP·N편 인덱스 탭을 얹었다가 **되돌림** — 지도 개편이 다른 브랜치에서 진행 중이라 graph.astro 를 양쪽에서 고치면 충돌한다(개편 착지 후 재적용, 근거는 7절). 새로 얻은 규칙 3개를 DECO_KIT 5절에 추가(부품끼리 자리 다툼 / 겹치는 자리엔 hover=false / 되풀이 요소엔 첫 하나에만) + 7절에 적용 현황표. /categories·폭신 대담은 의도적으로 제외(이유는 7절). 시안 카탈로그 갱신분(D7~D9 낙서 두들 · W1~W2 걸이줄·집게)을 부품·토큰·쇼케이스에 반영하고, 히어로 콜라주의 두들 층을 그 부품으로 다시 설계했다(임시 &hearts; 글리프 둘 + 반쪽 D5 속도선 → D7 하트·D8 번개·D9 보리, 티어 4/4/3). **두들이 시안과 딴 그림이던 것을 고쳤다** — 시안의 두들은 하나도 예외 없이 feTurbulence 를 지고 있는데(칠 om-crayon/-dense, 두른 선 om-ink, 가는 펜은 .rgh → om-ink-fine) "래스터를 다시 굽는 비용"이라며 넷을 다 빼고 색까지 color-mix 로 코어에 환산해 들여왔던 탓에, path 는 같은데 크레용이 매끈한 벡터 아이콘이 되어 있었다. 필터를 CrayonFilters.astro 로 그대로 들이고(id 는 인스턴스마다 유일 + 정의를 부품 안에 동봉 — 없는 id 를 가리킨 SVG 는 아예 안 그려지므로), 크레용 색을 시안 hex 그대로 --deco-crayon-* 로 되돌렸다. D1·D2 는 시안대로 HTML+CSS filter 유지(SVG 로 옮기면 scale 이 viewBox 단위가 되어 결이 3배 잘게 갈린다), D4 물결은 viewBox 를 시안의 140×12 로 맞춰 산 간격을 되찾았다. 시안 카탈로그의 이름 스티커 S7~S9 도 부품으로 들였다(name-plate 명찰 · name-pill 배지 · name-blank 빈 서식 — 셋이 담는 말은 같고 "인쇄된 것 / 붙인 것 / 아직 안 적은 것"으로 격이 갈린다). 손글씨는 D10~D12 와 같은 ×0.88 환산, 활자(Space Mono)는 같은 폰트라 시안 값 그대로, 기울기는 쓰는 쪽에서. 지면에는 안 얹었다 — W1~W2·D10~D12 와 같은 재고 취급(7절).
  - 원문:
    ```text
    블로그에 데코를 적용하는 태스크를 생성해라
    ```
- `KAN-058` 글지도에 데코를 반영하기 위한 계획을 수립해라. — 생성:유저 · 최종:유저 · 갱신:2026-07-31
  - 메모: 완료(2026-07-30). **2차에서 지면 전체로 다시 설계했다** — 1차는 카드에 적힌 계획대로 지도 상자 하나만 얹고 끝냈고, 그 결과 머리·커맨드 바·도움말·후보 패널·빈 상태·줌 컨트롤이 검토조차 안 된 채 남았다(유저 지적: 성실의 의무 위반). 총 8커밋. ■ 1차(3): 아일랜드 데코 슬롯 구멍 · 지도 판 P-01 + MAP 탭 · 카탈로그 탭 위치 교정. ■ 2차(5): 겹침·가로챔 판정 스크립트(deco:verify) · /posts 클립×RSS 기존 결함 교정 · 지면 전체 데코 · 문서 · 칸반. ■ 얹은 곳 3+1: 머리 P-06 레터링 테이프(YOU ARE HERE, 배지 없음) · 후보 패널 P-03 ClippedCard + 크림(=/posts PostFilter 와 한 쌍, 최대 누락이었다) · 도움말 크림 + T5 도트 테이프 · 지도 판 P-01 + M2. 안 얹은 곳 열둘은 요소별 근거를 DECO_KIT §7 규칙 7 에 남겼다. ■ 구조적 판단 셋: (a) ClippedCard 를 값만 베끼지 않고 **빈 판으로 펴서** 쓴다 — 클립 값이 ClippedCard.astro 한 곳에만 남아 드리프트가 구조적으로 불가능(ChatGPT 외부검토의 유효 지적). (b) 도움말은 helpOpen && … 가 아니라 **hidden** 으로 여닫는다 — 조건부로 감싸면 SSR 에 astro-slot 이 안 나오고 하이드레이션이 거기서 슬롯을 되찾으므로 데코가 클라이언트에 영영 도착 못 한다(열어도 끝까지 빈다). (c) ClippedCard 에도 hover prop — TapedBoard 와 똑같은 구멍. ■ 실측값: 클립 offset 140px(첫 행 양 끝이 다 차 있어 모서리에 못 문다) · 도움말 padding-top 32px(769px 이하에서 글이 폭을 채워 테이프가 꼬리를 덮었다 — 1280px 만 봤으면 못 잡는다) · 여백 26/24/30px(인접 형제 마진 상쇄) · 768px 이하 클립도 접음(빈 구간 546→32px < 클립 37px). ■ 재발 방지가 핵심 산출물이다: verify-deco: dist/ 를 http://localhost:54213 로 띄운다 (astro preview)…
  - 원문:
    ```text
    글지도에 데코를 반영하기 위한 계획을 수립해라.
    ```
- `KAN-059` 메인 화면 이미지가 늦게 뜨는 문제 — 성능·UX 전략 구상 — 생성:유저 · 최종:ai · 갱신:2026-07-31
  - 메모: 수행 완료. 원인=폰트와의 회선 다툼(한국어 웹폰트 3종 서브셋 30여 개 ~530KB가 VeryHigh로 회선 독점) → 이미지가 그 뒤에 줄 섬. ① 성능: 히어로 다이컷 preload를 폰트 스타일시트 **앞**에(BaseLayout preloadImages prop) · 다이컷 재인코딩 q86→75로 78→45KB(-42%, 알파 무손실 동일) · 헤더 로고 fetchpriority=high(Low→High) · 첫 화면 폴라로이드 loading=lazy 제거. ② UX: [data-imgwait] 도착 대기 계약(motion.css + BaseLayout 인라인 스크립트) — 화면 밖 푸터 저자 라인업에만 적용, 무JS·reduced-motion·404·무한지연 5케이스 검증. 실측(Playwright, CPU 4×): Slow 3G LCP 7260→3356ms(-54%)로 마스코트가 첫 페인트에 포함 → "데코만 그려지고 주인공만 없는" 약 4초 구간 소멸. Fast 3G LCP 1080→1008ms. 총 전송 830→798KB, 이미지 128→95KB, CLS 0.0005 유지. 굳힌 판단: data-imgwait를 LCP 요소에 걸지 마라 — 히어로에 걸었더니 같은 빌드에서 LCP가 1032·1748·2760ms로 흔들려 되돌렸다. 남은 별건(별도 카드감): 웹폰트 ~530KB와 홈 React 아일랜드 JS ~130KB의 회선 점유.
  - 원문:
    ```text
    메인 화면의 이미지가 다른 요소들보다 늦게 뜨는 경우, 사용자 경험이 불쾌해진다. 배포 환경에선 늦게 뜨는 현상이 잘 나타난다. 이를 해소하기 위해 성능 측면에서의 전략과 ux 측면 전략(fallback loading 이라던가)을 구상하라.
    ```
