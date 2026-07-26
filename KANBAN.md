# KANBAN — centurio1987.github.io

> hyper plan 보드. 앱 기능 백로그가 아니라 프로젝트 차원의 계획을 유저·AI가 공동 관리한다.
> 카드 메타(생성/최종/갱신)는 manage-kanban 스킬이 관리한다. 규칙은 스킬 SKILL.md를 따른다.

## 백로그
<!-- 아직 착수 결정 전. 우선순위 미정 후보 풀. 백로그→할 일 이동이 "할지 고민" → "하기로 확정" 전환점. -->
- `KAN-008` OCI, CRI — 생성:ai · 최종:ai · 갱신:2026-06-30
  - 메모: Docker 구성요소·개념 설명 + Docker 대안들 설명·구성요소 + Docker와 다면 비교
- `KAN-012` 블로그에 motion 요소들을 추가하고 싶다. 블로그 전체 디자인을 파악하여, motion이 들어가면 좋은 지점들을 포착해라. motion 적용은@centurio1987/bbangto-ui-core, @centurio1987/bbangto-ui-style-guide-catalog 를 설치하여 구현해라. — 생성:유저 · 최종:유저 · 갱신:2026-07-25
- `KAN-017` Dependabot 취약점 8건 해소 (의존성 보안 업데이트) — 생성:ai · 최종:ai · 갱신:2026-07-26
  - 메모: GitHub Dependabot 경고 8건(high 2·moderate 4·low 2) 정리 — push마다 표시됨. 절차: dependabot alerts로 대상 의존성·경로 파악 → 안전 버전으로 업데이트(bun/npm), transitive는 overrides 검토 → bun run build green·회귀 없음 → 커밋. breaking 위험 있는 major 업데이트는 개별 판단(무리한 업그레이드로 빌드 깨뜨리지 않기). 이번 KAN-007/013 배포와 무관하게 발생한 기존 부채.
  - 원문:
    ```text
    취약점 관련 작업이랑 node 20 deprecation 경고 해결 같은 태스크로 정의 해줘
    - kan-015 착수해
    ```
- `KAN-018` CI Node 20 deprecation 경고 해결 (Actions Node24 이관) — 생성:ai · 최종:ai · 갱신:2026-07-26
  - 메모: main.yml GitHub Actions 실행 시 'Node 20 is deprecated, will run on Node 24' 경고. actions/checkout·configure-pages·upload-pages-artifact·deploy-pages·setup-bun 등 사용 액션을 Node24 지원 최신 메이저 태그로 올려 경고 제거. 동작엔 지장 없으나 정리. 업그레이드 후 auth→install→check-markers→astro build→deploy 전 스텝 green 재확인(액션 major 업 시 입력 스키마 변화 주의).
  - 원문:
    ```text
    취약점 관련 작업이랑 node 20 deprecation 경고 해결 같은 태스크로 정의 해줘
    - kan-015 착수해
    ```
- `KAN-023` graphify 그래프 데이터 갱신 (연관 글·/graph 10편 누락) — 생성:유저 · 최종:유저 · 갱신:2026-07-26
  - 메모: src/data/graph.json이 2026-07-02 생성분(8편: osi 1~~6·webrtc-1·welcome)에서 멈춰 있어 이후 발행한 10편(webrtc-2/3, auth-authz 1~~4, algorithm-at-40-prologue, aside-arc, tauri-1, tauri-2)이 그래프에 없다. 해당 글들의 연관 글 섹션은 frontmatter 폴백(series/tags/category)으로만 랭킹되고 /graph 지도에도 안 보임. KAN-016 ship-post에서 'graphify --update' 시도했으나 graphify 0.9.4의 markdown 추출기가 openai 패키지를 요구해 전 청크 실패(빌드는 non-blocking 계약대로 green). 절차: uv tool install "graphifyy[gemini]" --force 등으로 추출기 의존성 복구 → GEMINI_API_KEY로 graphify src/content/posts/ --update → bun scripts/build-graph-data.ts → graphify-out/(manifest 포함)+src/data/graph.json 함께 커밋 → 연관 글·/graph 렌더 확인. 주의: 실패한 실행이 src/content/posts/ 안에 graphify-out/cache/를 남길 수 있으니 콘텐츠 디렉터리 오염 여부 확인. tauri-1 발행 시점부터 누적된 선재 부채.

## 할 일

## 진행 중

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
- `KAN-019` 낡은 미러 문서(AGENTS.md·.agents/·.codex/) viz 파이프라인 동기화 — 생성:ai · 최종:ai · 갱신:2026-07-26
  - 메모: KAN-013 viz 이관이 .claude 정본만 갱신하고 다른-런타임 미러는 구 OpenAI/HTML-template 파이프라인 그대로 방치(KAN-015에서 발견). 대상: AGENTS.md(집필 워크플로 섹션 전체 — [[[image clues]]]·generate-image.ts 서술), .agents/skills/make-image/{SKILL.md,assets/IMAGE_GUIDE.md}, .agents/skills/post-finalize/SKILL.md, .codex/skills/post-finalize/SKILL.md, .codex/agents/image-maker.toml. .claude 정본을 기준으로 viz(apply-viz/render-viz)로 서술 이관 + 삭제된 3스크립트 참조 제거. ORDER.md·KANBAN 이력은 보존(수정 안 함). KAN-015가 정본 트리만 정리했으므로 이 카드가 '전체 grep-0'를 마무리.
- `KAN-016` Tauri 해부 2편 — 예시 프로젝트 구현기 — 생성:ai · 최종:유저 · 갱신:2026-07-26
  - 메모: 발행 완료 — /posts/tauri-2/ (src/content/posts/tauri-2.mdx, series 'Tauri 해부' order:2, author ppangto). 예시 앱 file-scout(폴더 선택→훑기→진행률 스트리밍→사이드카 체크섬)를 0~~8단계로 구현하며 command/invoke·State·Event/Channel·capabilities+scope·플러그인·사이드카·번들을 전부 관통. 1편 개념은 링크 참조로 위임. 게이트 전부 통과: 외부검토(codex+Gemini) 반영, review-post 🔴0·🟡3, review-writing PASS(MUST 9/9), quality-gate PASS(MUST 15/15) — shell:allow-spawn 권한 누락·Windows canonicalize UNC 검증 결함 등 실제 결함 교정. 리서치: blog-research raws/007 + angle tauri-example-project-part2 + topic tauri-implementation(push 9857238). 커밋 40b4f5b. [디자인 피드백 후속 2887f81] 유저 지적 4건(hero 글씨 작음·Comparison 글씨 작음·화살표 노드 겹침·화살표 이상하게 꺾임)은 모두 1편에서 고쳤던 것의 재발이었고, 원인은 1편 수정이 컴포넌트에만 국소 적용되고 가이드/엔진 기본값에 반영되지 않은 것. 조치: viewBox 폭 620 이하 통일·Flowchart 엣지 축정렬+routing:straight·엣지 label 미렌더라 정보를 노드 label로·hero PosterEditorial 600x338 제목/부제만. 재발 방지로 layout.ts 기본 viewBox 조정 + IMAGE_GUIDE R1~~R5 신설 + make-image SKILL 검증 배선(.claude/.agents 미러). Playwright 렌더 캡처로 육안 검증. build green(31 pages). 미결: graphify 그래프 미갱신(KAN-020).
- `KAN-007` Tauri 소개와 구현 예시 — 생성:ai · 최종:ai · 갱신:2026-07-26
  - 메모: 1편(개념·구조) 발행·라이브 배포 완료(/posts/tauri-1/). viz 엔진(KAN-013) 첫 실사용 카나리로 KAN-014 검증 동시 달성. 다이어그램 품질 보정(화살표·색·가독성)·OG 폴백·본문 이미지 분리 반영. 2편(예시 프로젝트 구현기)은 KAN-016으로 분리·발행 완료(/posts/tauri-2/). 카드 범위(1편) 종료.
