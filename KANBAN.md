# KANBAN — centurio1987.github.io

> hyper plan 보드. 앱 기능 백로그가 아니라 프로젝트 차원의 계획을 유저·AI가 공동 관리한다.
> 카드 메타(생성/최종/갱신)는 manage-kanban 스킬이 관리한다. 규칙은 스킬 SKILL.md를 따른다.

## 백로그
<!-- 아직 착수 결정 전. 우선순위 미정 후보 풀. 백로그→할 일 이동이 "할지 고민" → "하기로 확정" 전환점. -->
- `KAN-008` OCI, CRI — 생성:ai · 최종:ai · 갱신:2026-06-30
  - 메모: Docker 구성요소·개념 설명 + Docker 대안들 설명·구성요소 + Docker와 다면 비교
- `KAN-012` 블로그에 motion 요소들을 추가하고 싶다. 블로그 전체 디자인을 파악하여, motion이 들어가면 좋은 지점들을 포착해라. motion 적용은@centurio1987/bbangto-ui-core, @centurio1987/bbangto-ui-style-guide-catalog 를 설치하여 구현해라. — 생성:유저 · 최종:유저 · 갱신:2026-07-25
- `KAN-016` Tauri 해부 2편 — 예시 프로젝트 구현기 — 생성:ai · 최종:ai · 갱신:2026-07-26
  - 메모: KAN-007 후속. 주요 개념(invoke/command·capabilities·sidecar 등)을 두루 쓰는 예시 프로젝트 구현 과정. author: ppangto, series 'Tauri 해부' order:2. viz 엔진으로 시각화.
- `KAN-018` CI Node 20 deprecation 경고 해결 (Actions Node24 이관) — 생성:ai · 최종:ai · 갱신:2026-07-26
  - 메모: main.yml GitHub Actions 실행 시 'Node 20 is deprecated, will run on Node 24' 경고. actions/checkout·configure-pages·upload-pages-artifact·deploy-pages·setup-bun 등 사용 액션을 Node24 지원 최신 메이저 태그로 올려 경고 제거. 동작엔 지장 없으나 정리. 업그레이드 후 auth→install→check-markers→astro build→deploy 전 스텝 green 재확인(액션 major 업 시 입력 스키마 변화 주의).
  - 원문:
    ```text
    취약점 관련 작업이랑 node 20 deprecation 경고 해결 같은 태스크로 정의 해줘
    - kan-015 착수해
    ```
- `KAN-019` 낡은 미러 문서(AGENTS.md·.agents/·.codex/) viz 파이프라인 동기화 — 생성:ai · 최종:ai · 갱신:2026-07-26
  - 메모: KAN-013 viz 이관이 .claude 정본만 갱신하고 다른-런타임 미러는 구 OpenAI/HTML-template 파이프라인 그대로 방치(KAN-015에서 발견). 대상: AGENTS.md(집필 워크플로 섹션 전체 — [[[image clues]]]·generate-image.ts 서술), .agents/skills/make-image/{SKILL.md,assets/IMAGE_GUIDE.md}, .agents/skills/post-finalize/SKILL.md, .codex/skills/post-finalize/SKILL.md, .codex/agents/image-maker.toml. .claude 정본을 기준으로 viz(apply-viz/render-viz)로 서술 이관 + 삭제된 3스크립트 참조 제거. ORDER.md·KANBAN 이력은 보존(수정 안 함). KAN-015가 정본 트리만 정리했으므로 이 카드가 '전체 grep-0'를 마무리.
- `KAN-020` 전이 의존성 취약점 정리 (js-yaml·sharp/libvips) — 생성:ai · 최종:ai · 갱신:2026-07-26
  - 메모: KAN-017(astro 7 업그레이드) 중 bun audit로 발견한 별건 부채. 대상: js-yaml@4.1.1(GHSA-52cp-r559-cp3m high · GHSA-h67p-54hq-rp68 moderate, merge-key 체인 quadratic CPU DoS) — astro·@astrojs/markdown-remark·mdx·react가 모두 @astrojs/internal-helpers 경유로 끌어옴. sharp@0.34.5(GHSA-f88m-g3jw-g9cj high, libvips CVE-2026-33327/33328/35590/35591) — astro의 optionalDependency. 중요: 두 항목 모두 astro 5.18.2 시절 락파일과 버전이 동일해 KAN-017이 새로 들여온 것이 아니며, GitHub Dependabot 경보 8건에도 포함되지 않았다(경보는 전부 astro 본체). 즉시 수정 불가 사유: js-yaml 패치가 major 5.x뿐인데 @astrojs/internal-helpers가 ^4.1.1로 고정, sharp도 astro가 ^0.34.0으로 고정 → overrides 강제 시 peer 위반·빌드 리스크. 절차: 상류(@astrojs/internal-helpers·astro)가 범위를 올릴 때까지 대기하거나, overrides로 js-yaml 5.x·sharp 0.35.x를 시험 적용해 bun run build green + 렌더 회귀 없음을 확인한 뒤에만 반영. 정적 빌드 전용 사이트라 두 취약점의 실제 노출면(런타임 YAML 파싱·이미지 처리 입력이 모두 신뢰된 자체 콘텐츠)은 낮으므로 우선순위는 낮게 둔다.
  - 원문:
    ```text
    취약점 관련 작업이랑 node 20 deprecation 경고 해결 같은 태스크로 정의 해줘
    - kan-015 착수해
    ```
- `KAN-021` astro 7 네이티브 이관 — 마크다운 파이프라인 unified(호환 shim) → Sätteri — 생성:ai · 최종:ai · 갱신:2026-07-26
  - 메모: 전제: 2026-07-26 기준 astro 7.1.3 · @astrojs/mdx 7.0.3 · react 6.0.1 · sitemap 3.7.3 · markdown-remark 7.2.1 모두 레지스트리 최신이라 '버전 올리기'로 할 일은 없다. KAN-017이 astro 7로 올리면서 마크다운은 공식 호환 경로(@astrojs/markdown-remark + processor: unified({rehypePlugins}))로 남겨 뒀으므로, '최신 반영'의 실체는 v7 기본 파이프라인인 Sätteri(Rust)로 이관하는 것이다. 긴급도 낮음 — unified 프로세서는 v7에서 정식 지원이며 deprecated가 아니다(deprecated였던 것은 최상위 markdown.rehypePlugins 옵션뿐이고 KAN-017에서 이미 이관 완료). 따라서 이 카드는 선택 과제이며, 아래 '따옴표 정규화'를 어차피 할 가치가 있을 때 함께 착수하는 것을 권한다. || 사전 스파이크 실측(실제로 config를 Sätteri로 바꿔 빌드·비교 후 원복함, 커밋 없음): (1) 빌드 통과 — 30페이지, 경고 0. (2) rehypeWrapTables는 satteri의 defineHastPlugin으로 기계적 포팅 가능하며 MDX 본문에도 정상 적용됨(table-wrap 10개 일치). 함정: ctx.wrapNode(node, wrapper)의 wrapper는 children:[]로 둬야 한다. 공식 문서 예제대로 children:[node]로 넣으면 표가 두 번 렌더된다(실측: 표 3→6, 2→4개로 중복). (3) shikiConfig는 그대로 동작 — astro가 프로세서에 공통 전달하고 Sätteri가 자체 highlight 플러그인을 붙인다(astro-code 58개 일치). (4) MDX는 @mdx-js/mdx가 아니라 createSatteriMdxProcessor라는 전혀 다른 컴파일 경로를 타지만, React 아일랜드(astro-island 114)·viz SSR SVG(viz-figure 9)·QA 컴포넌트 모두 이상 없음. || 유일한 실질 장애물 = 스마트 따옴표. Sätteri와 unified가 11개 포스트 26곳에서 따옴표 방향을 다르게 판정한다(‘→’ 17건, ”→“ 8건, “→” 1건). 원인: 본문 원문이 전부 ASCII 직선 따옴표('"')이고(원문 내 휘어진 따옴표 0건) 두 엔진이 각자 자동 변환하는데, 따옴표가 **강조** 마커나 ? 에 인접하면 한글 맥락에서 판정이 갈린다. 예: 원문 '위임된 인가' → unified ‘위임된 인가’(정상) vs Sätteri ’위임된 인가’(닫는 따옴표 2개, 오류). 완화책 실측: features:{smartPunctuation:false}는 오히려 악화(휘어진 따옴표가 전부 직선 &quot;로 바뀌어 100여 곳 타이포 downgrade) → 채택 불가. 반면 원문에 휘어진 따옴표를 직접 쓰면 두 엔진 모두 변형 없이 보존함을 프로브로 확인 → 이것이 유효한 해법이며, 부수 효과로 출력이 엔진 비의존이 된다. || 절차: ①package.json에 @astrojs/markdown-satteri 명시 추가(현재는 astro의 전이 의존으로만 존재) ②src/lib/rehype-wrap-tables.mjs를 defineHastPlugin 버전으로 포팅(children:[] 주의) ③astro.config를 processor: satteri({hastPlugins:[...]})로 교체하고 @astrojs/markdown-remark 제거 ④빌드 후 KAN-017과 동일한 회귀 세트로 검증 — 가시 텍스트 다중집합 비교·기능 마커 수(table-wrap/astro-code/astro-island/viz-figure)·Playwright 콘솔에러/하이드레이션/픽셀·지오메트리 ⑤남는 차이는 따옴표 26곳뿐이어야 하며, 각 지점을 원문에 휘어진 따옴표로 확정해 0으로 만든다 ⑥diff가 따옴표 개선분만 남을 때 커밋. 롤백: astro.config 한 파일과 plugin 파일만 되돌리면 즉시 unified로 복귀(의존성은 남겨 둬도 무해). || 기대 이득: 의존성 1개 감소, v7 기본 경로와 일치(향후 astro 업그레이드 시 호환 shim 유지 부담 제거), Rust 엔진 빌드 속도(단 30페이지 규모에서는 유의미한 측정 안 함 — 성능은 착수 근거로 삼지 말 것).
  - 원문:
    ```text
    astro 최신 버전을 반영하여 마이그레이션 계획을 세우고, kanban에 추가하라
    ```

## 할 일

## 진행 중
- `KAN-007` Tauri 소개와 구현 예시 — 생성:ai · 최종:ai · 갱신:2026-07-26
  - 메모: 1편(개념·구조) 발행·라이브 배포 완료(/posts/tauri-1/). viz 엔진(KAN-013) 첫 실사용 카나리로 KAN-014 검증 동시 달성. 다이어그램 품질 보정(화살표·색·가독성)·OG 폴백·본문 이미지 분리 반영. 2편(예시 프로젝트 구현기)은 KAN-016으로 분리.

## 검토
- `KAN-001` GraphQL을 썼을 때 유리한 상황과 아닌 상황 — 생성:ai · 최종:ai · 갱신:2026-06-30
  - 메모: draft: draft/graphql-use-cases-draft.md · REST 대비 이득/복잡도 증가 상황, 조직·클라이언트·게이트웨이 판단 기준
- `KAN-002` 도메인 모델과 RDB — 생성:ai · 최종:ai · 갱신:2026-06-30
  - 메모: draft: draft/domain-model-rdb-draft.md · 외래키 신호, 상속/합성 테이블 표현, Aggregate↔테이블 대응, Value 영속화
- `KAN-003` DDD에서 Composition과 Aggregation — 생성:ai · 최종:ai · 갱신:2026-06-30
  - 메모: draft: draft/ddd-composition-aggregation-draft.md · Composition=의존 생명주기/Aggregate 소속, Aggregation=참조
- `KAN-004` 상속이냐 Composite냐 — 생성:ai · 최종:ai · 갱신:2026-06-30
  - 메모: draft: draft/inheritance-vs-composition-draft.md · 대부분 Composite 권장, 상속 고려 상황, Evolving 관점
- `KAN-005` 모델링 철학 고려 사항 — 생성:ai · 최종:ai · 갱신:2026-06-30
  - 메모: draft: draft/modeling-philosophy-draft.md · 속성 우연일치≠동일모델, 내러티브 중심. 모델 구분 기준 보강 필요
- `KAN-010` KAN-013 퍼소나를 정의 했고, 기존 포스트들에는 퍼소나를 나타내는 저자명, 저자의 프로필, 저자 및 포스트 유형을 나타내는 배너가 포함되어 있으나, 집필 workflow에는 그것들을 포함하는 과정이 생략되어 있다. 포스트 레이아웃의 재설계를 포함하여, 원인 분석과 해결 방법에 대한 전략을 구상하라. — 생성:유저 · 최종:ai · 갱신:2026-07-23
  - 메모: 퍼소나(저자) 시스템 + 포스트 레이아웃 재설계 구현·검증 완료. main 커밋 ecb3f9c·8e58d84·704d581(centurio1987/kan-013 ff). authors.ts 레지스트리(연구원/교수님/선생님)·author 스키마·AI 배너·저자 프로필 카드·목록 AI 칩·폭신 대담(talk) 레이아웃·시리즈 내비 배선. bun run build 통과·렌더 검증(연구원/대담/목록). voice=src/lib/personas/. 미push(배포 전 사용자 리뷰 대기). 열린 사항: 교수님 대담 샘플 미발행, raws 재편·pnpm-lock 보류.
- `KAN-011` 인증·인가 해부 시리즈(4편) — 퍼소나 배선·표적 보정 — 생성:ai · 최종:ai · 갱신:2026-07-24
  - 메모: main 병합으로 퍼소나(저자) 시스템 반영. 1~4편 author: ppangto 배선(상단 AI배너·저자명·프로필카드·시리즈 내비 자동 렌더). quality-gate/review-writing(PASS)/review-post 게이트로 정확성·하우스 보이스 표적 보정 완료(전면 재집필 아님). 커밋 0ef48e2·a31d487·84d55fe·b244bcb·012a095·b2d5830. 1편은 '지형도' 장르로 실무 시나리오 생략 유지.
  - 원문:
    ```text
    인증, 인가 주요 개념과 구현 실습
    - pkce, jwks 등 주요 개념을 설명한다.
    - 주요 사례를 실제 적용하는 베스트 프랙티스와 실습 예제.
    ```
- `KAN-013` 집필 워크플로 개정. 지금은  이미지를 생성할 때 chatgpt에게 요청하고 있다. 이제부터는 직접 시각화를 구현해라. @centurio1987/bbangto-ui-visualization 패키지를 이용해서 구현해라. — 생성:유저 · 최종:ai · 갱신:2026-07-25
  - 메모: viz 엔진 구현·검증 완료(미push, 배포 전 리뷰 대기). bbangto-ui-visualization(GitHub Packages)로 모든 구조형 시각물·hero를 코드 구현, ChatGPT 이미지 생성 완전 제거. 신규: scripts/apply-viz.ts·render-viz.ts·check-post-markers.ts, src/lib/viz(schema·layout·blogVizStyleGuide), src/components/viz/VizFigure, src/styles/viz.css, .npmrc. v1 kind 5종(ProcessSteps/Comparison/Flowchart/Statistics/PosterEditorial). 파이프라인 재배선(make-image=viz엔진·post-finalize OpenAI 제거·image-maker·tech-deepdive·orchestrator·ship-post·CLAUDE.md·DIAGRAM_STYLE_GUIDE). 레거시 스크립트 3종 deprecate(후속 삭제 카드). CI packages:read+미처리마커 가드. E2E(OPENAI 미설정) 통과·무JS SSR SVG 페인트(HTTP) 검증. webrtc-3 라이브 [[[ 마커 결함 수정. 기존 13글 백마이그레이션 별도.

## 완료
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
