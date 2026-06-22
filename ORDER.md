# ORDER

이 파일은 문서로 지시를 받는 창구다. 처리할 항목은 아래 `## 신규 지시` 영역에만 적는다.
완료된 지시는 `## 처리 완료 (COMMITTED)` 영역에 봉인 블록으로 보존되며 **편집/삭제하지 않는다**.
철회·정정은 봉인 블록을 고치지 말고, `## 신규 지시`에 `reverts=ORD-NNN` 항목을 새로 추가한다.

## 신규 지시

<!-- 여기에 새 지시를 적으세요. 비어 있으면 처리할 신규 지시가 없습니다. -->

## 처리 완료 (COMMITTED)

<!-- ORDER:COMMITTED id=ORD-001 status=done committed=2026-06-20 -->
<!-- 봉인 구획: 편집 금지. 철회하려면 신규 지시에 reverts=ORD-001 항목을 추가하세요. -->

### ORD-001 — 기술 관련 글을 작성하는 skill 작성

- 지시 (원문):

  > 기술 관련 글을 작성하는 skill을 작성한다.
  >
  > skill이 작성하는 글은 다음 조건을 충족해야 한다.
  >
  > - 독자를 어떻게든 이해시키겠다는 마인드로 임한다. 독자가 고객이고 독자가 이해해야 수강료를 받을 수 있다고 생각해라.
  > - 읽기 쉽고 설득력, 몰입력 있는 문체를 사용해라. 드라이 하게 스펙만 나열하면 절대 안된다.
  > - 독자가 충분히 전문가가 아니어도 단계적으로 이해할 수 있게 구성해라.
  > - 굉장히 디테일한 사항까지 딥한 내용을 전부 포함한다. 해부학적으로 집요하게 파고들어야 한다.
  > - 내용이 충분하고, 생략된 항목이 없는지 검토한다(agy, codex에게 검토 받기).
  > - 모순되는 내용이 없는지 검토한다(agy, codex에게 검토 받기).
  > - 관련 장비와 장비에 대한 설명
  > - 관련 프로토콜과 기술에 대한 설명
  > - 실무 사례 각 시나리오 별 설명. 시나리오의 각 단계마다 자세한 원리와 동작을 설명. 구체적인 기술과 실무에서 나타날 수 있는 문제 및 해결 방법, 팁과 노하우 포함
  > - 여러 관점에서 설명한다. 사례, 묘사, 구현물, 실습 과제와 과제 수행 절차 및 설명, 엄밀한 정의, 오해하기 쉬운 포인트, 다이어그램, react simulation을 통한 설명

- 결과:
  - **새 스킬 `tech-deepdive`** — `.claude/skills/tech-deepdive/`
    - `SKILL.md`: 글감 메모 → 단일/시리즈 선택 → 해부학적 아웃라인(+근거 조사) → MDX 본문 집필 →
      외부검토(누락·모순·사실성) → `draft/<stem>.mdx` 완성. ORDER의 모든 원칙(독자=고객, 몰입 문체,
      점진적 공개, 해부학적 깊이, 다관점)을 명문화.
    - `assets/ARTICLE_TEMPLATE.mdx`, `assets/SECTION_PATTERNS.md`(다관점 섹션 메뉴=체크리스트),
      `assets/REACT_SIM_GUIDE.md`(검증된 co-located `.tsx` + `client:visible` 규약).
    - `scripts/review-article.sh`: codex/agy 3축 외부검토. 둘 다 실패 시 종료코드 2(완성 게이트).
  - **발행 오케스트레이터 서브에이전트** `.claude/agents/tech-article-publisher.md` —
    tech-deepdive → review-post → post-finalize → publish-post, 게이트(외부검토/4축 🔴/발행 전 승인) 포함.
  - **MDX 지원**: `src/content.config.ts` glob `**/*.{md,mdx}`; `publish-post`·`post-finalize` 스킬을
    `.md`/`.mdx` 모두 허용 + MDX 안전 규칙으로 보강.
  - 검증: React in MDX hydration을 PoC로 확정(인라인 불가 → co-located import), `bun run build` 통과(회귀 없음).
  - 계획: `~/.claude/plans/composed-soaring-pizza.md` (codex/agy 외부검토 반영본).
  <!-- /ORDER:COMMITTED id=ORD-001 -->

<!-- ORDER:COMMITTED id=ORD-002 status=done committed=2026-06-20 -->
<!-- 봉인 구획: 편집 금지. 철회하려면 신규 지시에 reverts=ORD-002 항목을 추가하세요. -->

### ORD-002 — 발행 오케스트레이터에 품질 검토·보완 단계(별도 스킬) 추가

- 지시 (원문):

  > 발행 오케스트레이터에 검토와 보완 단계가 들어가야 할 것 같다. 검토는 별도로 스킬을 만들어 줘.
  > 스킬에는 품질 체크리스트를 포함한다. 스킬 수행 시, 품질이 일정 수준을 충족하지 않으면,
  > 반복적으로 보완 요청을 하는 워크플로우를 형성해서 추가해라

- 결과:
  - **새 스킬 `quality-gate`** — `.claude/skills/quality-gate/`
    - `SKILL.md`: 글을 품질 체크리스트로 **채점 → PASS/FAIL 판정 → FAIL이면 구체 보완 지시 → 수정 →
      재채점**을 기준선 통과까지 **반복(최대 3라운드)**. 통과 못 하면 멈추고 보고(기준 낮춰 통과 처리 금지).
      새 집필이 필요한 보완은 `tech-deepdive`, 사실성은 `review-article.sh`로 위임.
    - `assets/QUALITY_CHECKLIST.md`: ORDER 기준선 루브릭(독자이해/해부학적 깊이/완전성 필수섹션/다관점/
      정확성/문체몰입/MDX 건전성), MUST·SHOULD·IF-APPLICABLE 가중치 + 통과 조건 + 점수 산정.
  - **오케스트레이터 통합** — `.claude/agents/tech-article-publisher.md`:
    파이프라인을 `tech-deepdive → review-post → **quality-gate** → post-finalize → publish-post`로 확장.
    **게이트 D(품질 PASS)** 추가 — PASS 전에는 finalize/발행으로 넘어가지 않음. 발행 전 확인(게이트 C)에
    품질 게이트 잔여 지적도 포함.
  - **참조 일관성**: `tech-deepdive` 워크플로우 다이어그램·인계 안내에 `quality-gate` 단계 반영.
  <!-- /ORDER:COMMITTED id=ORD-002 -->

<!-- ORDER:COMMITTED id=ORD-003 status=done committed=2026-06-22 -->
<!-- 봉인 구획: 편집 금지. 철회하려면 신규 지시에 reverts=ORD-003 항목을 추가하세요. -->

### ORD-003 — 발행 파이프라인 대확장: 리서치·글쓰기검토·react/이미지 분리·마무리 단계 추가

- 전제: 모든 항목은 `tech-article-publisher.md` 오케스트레이터를 쓰는 상황을 전제한다.

- 지시 (원문 요지):

  > ① 집필 전 **자료 수집 단계** 추가 — (1) 내 글 3개로 문체 스타일 가이드 1차 생성(말투·끝맺음·호흡,
  >   자주 쓰는 표현, 도입/마무리 패턴, 기타 특징) → 품질 게이트웨이(설득력·호소력/개연성/문법·맞춤법/
  >   글 구조[PREP·3WR·4MAT·서사] + wormwlrm 3편 좋은 사례)용 체크리스트 작성 → 게이트로 스타일 가이드 강화.
  >   (2) 자료 수집을 skill로 정의(문체 가이드와 무관, 리서치 가이드 참조), sonnet subagent 위탁.
  > ② 내가 쓴 글을 위 체크리스트로 **검토하는 스킬** 별도 제작.
  > ③ **리서치 스킬 + 리서치 가이드**(웹검색·최신 우선·신뢰 소스 5+·충실 정리·소주제 섹션·소스 URL 목록;
  >   출처없음/광고/추측 금지, 충돌 양쪽 기록). 세부 절차: 수집→`~/blog-research/raws` 저장 → wiki ingest →
  >   commit&push(haiku subagent).
  > ④ 집필 과정의 **react 다이어그램 생성은 별도 스킬**로 분리, sonnet subagent 위탁.
  > ⑤ 집필 과정에 **이미지 생성 단계** 추가 — 이미지 가이드(HTML+CSS→Playwright PNG; 본문 4종 비교표/
  >   단계 다이어그램/핵심 포인트 카드/인용·강조 박스; 대표 1080² 블루-퍼플 그라데이션) + 참조 스킬, sonnet subagent 위탁.
  > ⑥ workflow 마지막에 **마무리 스킬**(완성 포스트 배포 → commit&push), haiku subagent 위탁.

- 결과 (산출물은 `.claude/`가 소스 오브 트루스):

  - **새 가이드/문서**
    - `.claude/skills/_shared/STYLE_GUIDE.md` — 내 글 3개에서 문체 추출. Part 1(샘플 추출 문체 사실 F1~F6, 근거 인용·보존)
      + Part 2(일반 글쓰기 규칙 R1~R8). 품질 체크리스트로 Part 2만 1회 강화(Part 1 보존). 집필·검토 둘 다 참조.
    - `.claude/skills/review-writing/assets/WRITING_CHECKLIST.md` — 설득력(P)·개연성(C)·문법게이트선(G)·글구조(S)·문체(V)
      루브릭, MUST/SHOULD/IF-APPLICABLE, PASS/FAIL. + `WORMWLRM_NOTES.md`(wormwlrm 3편 스냅샷, 조회일 2026-06-22).
    - `.claude/skills/research/assets/RESEARCH_GUIDE.md` — 웹 수집 규칙(최신성·신뢰 소스 5+·주장↔출처 매핑·금지·산출물 형식).
      ingest/wiki 규약은 `~/blog-research/CLAUDE.md`(LLM Wiki 스키마)에 위임.
    - `.claude/skills/make-image/assets/IMAGE_GUIDE.md` — 구조형 이미지(HTML+CSS→**Node/TS Playwright** PNG; Python 폐기),
      본문 4종 + 대표 1080² 규격, ```figure``` 명세 마커, 로컬 Pretendard + `document.fonts.ready`.
    - `.claude/skills/react-sim/assets/REACT_SIM_GUIDE.md` — tech-deepdive에서 **이전**(react-sim 소유). 조기 `tsc --noEmit` 추가.

  - **새 스킬(SKILL.md, 입출력 계약 명시)**: `research`(웹수집→raws 불변저장→wiki ingest→git-shipper push, 출력=angle 경로,
    조건부 skip) · `review-writing`(WRITING_CHECKLIST 채점·보완 루프, 문체 일치) · `react-sim`(시뮬 명세→co-located `.tsx`+import,
    즉시 `tsc --noEmit`) · `make-image`(```figure```→render-image.ts→`public/images/<slug>/`→`![alt]` 치환, hard fail·멱등) ·
    `ship-post`(최종 build 재검증 → git-shipper로 블로그 레포 commit&push).

  - **새 서브에이전트(`.claude/agents/`)**: `research-gatherer`(sonnet) · `writing-reviewer`(sonnet) · `react-sim-builder`(sonnet) ·
    `image-maker`(sonnet) · **`git-shipper`(haiku, 공유)** — research·ship-post 양쪽에서 재사용, 직접 git 금지·가드 스크립트만 호출.

  - **새 스크립트**: `scripts/render-image.ts`(Bun+playwright, JSON 입력·HTML escaping·폰트 대기·멱등) +
    `scripts/image-templates.ts`(5종 템플릿) + `scripts/git-commit-push.sh`(공유 결정론적 가드: 지정 경로만 add·브랜치 확인·
    secret/대용량 검사·`pull --rebase`·no-`--force`·Co-Authored-By).

  - **기존 파일 수정**: `tech-article-publisher.md` 파이프라인 재배선
    (`research → tech-deepdive(+react-sim/make-image 위탁) → review-post → review-writing → quality-gate → post-finalize → publish-post → ship-post`),
    게이트 D(기술)·E(글쓰기)·입출력 계약·FAIL 흐름·멱등성·리뷰 3단계 책임 경계·push 가드 명문화.
    `tech-deepdive/SKILL.md`(입력=angle, STYLE_GUIDE 참조, 시뮬/이미지 위탁, ```figure``` 마커) ·
    `post-finalize/SKILL.md`(`[[[…]]]`=개념·은유 전용, 구조형은 make-image 경계). `tech-deepdive/assets/REACT_SIM_GUIDE.md` 삭제(이전).

  - **검증**: `bun run build` 통과(34 페이지, 회귀 없음). render-image 5종(hero+본문4종) 렌더·폰트 육안 확인 후 정리.
    git 가드 dry-run 4케이스(브랜치 불일치 2 / secret 4 / 정상 0 / 경로없음 1) 통과. 스킬·에이전트 상호참조 경로 정합성 확인.

  - **남은 후속(파생 미러)**: `.codex`/`AGENTS.md` 재생성은 codex CLI 0.141이 자기 설정 디렉토리(`.codex`)를 읽기전용으로
    보호해 이번 세션에서 차단됨. `.claude/`(소스 오브 트루스)는 완성. `.codex` 쓰기 가능한 세션에서 `claude-to-codex` 재실행 필요.

  - 계획: `~/.claude/plans/stateful-discovering-fairy.md`(codex/agy 외부검토 반영본).
  <!-- /ORDER:COMMITTED id=ORD-003 -->
