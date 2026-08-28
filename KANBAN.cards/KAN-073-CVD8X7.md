---
card: KAN-073-CVD8X7
title: 게이트 인식층 확장 — 추출층이 못 보는 두 갈래를 판정에 넣는다
created: 2026-08-28
scope: scripts/verify-tokens.ts, scripts/lib/tokens/**, scripts/fixtures/tokens/**, scripts/tokens-baseline.json, design-concept/UI_CONSISTENCY_AUDIT.md, CLAUDE.md
---

# KAN-073-CVD8X7 — 게이트 인식층 확장 — 추출층이 못 보는 두 갈래를 판정에 넣는다

## 전략
## 전략
KAN-072 가 래칫을 1,786 → 0 으로 만들었지만 **그 0 은 추출층이 보는 범위 안에서의 0** 이다.
`scripts/lib/tokens/extract.ts:59-60` 의 `ATTR`·`JSXOBJ` 가 **큰따옴표 문자열 값만** 봐서
`style={{ fontSize: 13, borderRadius: 8 }}` 도 `color: ok ? "#fff" : "#000"` 도 판정 밖이다.

**실측 (착수 전).** 지금 게이트는 `파일 152 · 토큰 108 · 히트 3,135(css-decl 2,513 ·
style-obj 413 · jsx-attr 209) · 래칫 0` 을 낸다. 안 보는 것은 셋이다.

| 갈래 | 건수 | 스케일 밖 | 어디 |
| --- | ---: | ---: | --- |
| A 인라인 스타일 숫자 리터럴 | 836 | **175 (21%)** | 38파일 중 34가 `src/components/posts/**`(99.4%) |
| B 삼항·템플릿 안 리터럴 | 34 | — | 삼항 20 · 템플릿 14 |
| C `.astro` 인라인 `style="…"` | 42선언(38자리) | 0 | 축 있는 것은 `width:0`·`height:0` 둘뿐 |

갈래 A 축별: spacing 407(밖 70) · font-size 252(밖 53) · radius 176(밖 52) · stroke 1.
스케일 밖 최다는 spacing `18` 29건(`padding` 26 + `gap` 2 + `paddingLeft` 1)과
`borderRadius: 6` 28건이고 둘이 스케일 밖의 3분의 1이다 — 시뮬 13편 이상에서 같은 자리에
반복되므로 독립 판단이 아니라 **한 번 굳은 관용구가 복제된 것**이다.

성격을 한 줄이 보여 준다 — `container-anatomy-2/DigestChain.tsx:127` 은 같은 줄에서
`padding` 은 이미 토큰인데 `fontSize`·`borderRadius`·`marginBottom` 만 맨 숫자다.
**정리가 안 된 자리가 아니라 게이트가 안 무는 속성만 정리에서 빠진 자리다.**

갈래 C 는 부채를 거의 안 낸다(선언 42 중 `transform` 32 · 커스텀 속성 3 · 축 없는 것 5).
**값은 부채 발굴이 아니라 구멍 막기다.**

---

---

## 착수 후 정정 — 위 실측 표의 수 셋이 갈렸다

**위 표는 착수 전 거친 스캐너가 잰 값이고, 게이트가 실제로 무는 수는 다르다.** 그대로 두는 것은
그것이 「무엇을 근거로 이 카드를 세웠는가」의 기록이기 때문이다. 갈린 내역과 근거는 아래
「수행 내역」에 work 별로 있고, 요지는 셋이다.

- **갈래 A 836 → 845** — 차 +9 가 삼항 가지 4 · 산술식 피연산자 4 · 음수 리터럴 2 · stroke −1 로
  갈렸다. 마지막은 **위 표가 틀린 것**이다: `src/lib/viz/PosterHero.tsx:124` 의
  `strokeWidth: 2` 를 앞 속성 `fill` 에 붙여 stroke 축으로 셌고, `strokeWidth` 는 축 표에 없다.
  스케일 밖도 175 → 181 인데, **게이트 위반은 150** 이다 — 175 는 인식 단계 통계이고
  §9 관할은 여백(padding·margin·gap)뿐이라 치수·좌표의 스케일 밖 31건은 판정 불가다.
- **갈래 B 34 → 23** — 34 는 옛 `TEMPLATE` 정규식이 본 **문자열의 수**였다. 게이트가 셀 수 없는
  11건이 섞여 있다: `var()` fallback 6(준수로 들어오는 것이 맞다) · 주석 안 백틱 2 ·
  값 자리 아님 1 · `const` 삼항 1(별도 카드 갈래) · 두 훑기 중복 1.
- **갈래 C** — `width:0`·`height:0` 은 **준수가 아니라 판정 불가**다. `docrule` 이 치수를
  §9 관할 밖에 두기 때문이고(KAN-070 S5 가 굳힌 자리), 준수로 만들려면 치수를 §9 로 되돌려야 해서
  치수·좌표 63건이 래칫에 물린다. 구멍은 닫혔다 — 그 자리가 판정 0건에서 2건이 됐다.

**셋 다 규칙을 안 비틀고 차이를 낸 쪽이다.** 수를 맞추려면 `var()` 제거를 끄거나(계약 위반),
주석을 코드로 세거나, 치수를 여백 자로 재야 한다.

## 정규식 한 줄로는 안 열린다 — 관문이 넷

1. `extract.ts:60` `JSXOBJ` — 값이 큰따옴표 문자열일 때만 뜬다.
2. `extract.ts:112` 맨 숫자 필터 — `axis !== "font"` 인 단위 없는 숫자를 버린다.
   정규식을 넓혀 `borderRadius: 8` 을 봐도 **이 줄이 그 `8` 을 다시 버린다.**
3. `extract.ts:20-34` `AXIS` 표의 camelCase 누락 — `margintop`·`minwidth`·`rowgap`·
   `flexbasis`·`strokewidth` 가 없다.
4. `docrule.ts:64-70` `SPACING_GROUP` 의 camelCase 누락 — 없는 키는 `?? "spacing"` 으로
   떨어져 여백 취급된다. 그대로 열면 `minWidth: 200` 이 §9 로 재어져 **가짜 위반**이 된다.

---

## 왜 이 접근인가

**옛 히트는 한 건도 안 움직인다.** `extract.ts:8-10` 이 "원본을 한 글자도 안 바꿔 옮겼다"를
계약으로 걸고 있다(감사 원자료 3,539 히트와의 히트 단위 대조). 기존 정규식 넷과
`classify()` 의 기존 경로는 안 건드리고 **덧붙인다.** `Hit["src"]` 에
`"style-num" | "expr-literal" | "attr-css"` 를 더한다.

**축 표는 공유하지 않고 새 경로 전용으로 세운다.** 공유 `AXIS` 맵에 `minwidth` 를 넣으면
그 값을 줍는 것은 새 인식기가 아니라 **기존 `JSXOBJ`** 이고, 새 히트에 `"style-obj"` 라는
옛 라벨이 붙어 계약이 깨진다(실측 증분 정확히 1건 —
`src/components/posts/vpn-anatomy-2/NonceReuseLab.tsx:306` 의 `minWidth: "10rem"`).
그래서 `propAxis.ts` 는 **새 경로와 `SPACING_GROUP` 만** 읽고, 옛 `AXIS` 확장은
S5 에서 1건짜리 화이트리스트와 함께 따로 한다.

**인식기를 모듈로 가른다.** CLAUDE.md 의 게이트 규약("축이 여럿이면 진입점 하나 +
`scripts/lib/<게이트명>/` 의 축 모듈, 규약은 전부 진입점이 진다")을 인식층에 그대로 적용한다 —
세 갈래는 기법이 서로 다르다(JSX 객체 숫자 · 표현식 리터럴 · 속성 CSS). **S1 이 세 모듈을
빈 스텁으로 만들고 배열 등록까지 해 두어야** 배치2 의 셋이 `extract.ts` 를 3-way 로 안 고친다.
인식기가 **자기 고장 픽스처를 함께 소유**해 `selftest.ts` 의 `CASES` 겹침도 0 이 된다.

**숫자값은 px 로 정규화하되 원문 표기를 함께 들고 다닌다.** `13` → `13px` 로 승격해야
`docrule` 의 §9·§5 와 `color` 의 radius 검사가 CSS 자리와 **똑같은 코드로** 판정한다.
다만 그러면 게이트가 지목하는 「값」이 파일에 문자열로 존재하지 않게 되므로
(`verify-tokens.ts:134` 의 "고치는 법" 이 grep 으로 못 찾는 값을 가리킨다),
`Hit.rawValue` 에 원문을 남기고 출력에서 `13(→13px)` 로 병기한다.

**자가검사 유일성 키를 `(verdict, want, src)` 셋으로 바꾼다.** `selftest.ts:76-80` 은 사유가
케이스 수만큼 달라야 통과하는데, 설계가 새 히트를 CSS 와 같은 코드로 판정하게 하므로
`.tsx` 의 `padding: 10` 은 기존 `spacing-out.astro` 와 사유가 같은 `"§9"` 가 된다.
사유를 억지로 다르게 만들면 "같은 코드로 판정한다"가 깨지고 `baseline.ts:52-58` 이 예약한
네 접두와도 부딪힌다. **인식 경로가 다르면 다른 검사**라는 것이 이 확장의 논지 자체다.

---

## 반드시 피할 함정 여섯 (전부 실측 근거)

1. **범위를 한정하지 않으면 좌표표가 통째로 들어온다.** `style={{}}`/`CSSProperties` 밖에서
   `prop: 숫자` 를 훑으면 `src/components/deco/Doodle.astro:143-170` 의 풍선 글씨 좌표표
   (`w: 126`·`fs: 22`·`top: 9`·`left: 12`)와 `src/components/viz/samples/*` 의 기하 데이터가
   들어온다. `deco-kit` 이 "눈대중이 아니라 실측값"이라 못박은 자리다.
2. **단위 없는 속성 181건을 px 로 읽으면 안 된다.** `fontWeight` 101 · `lineHeight` 71 ·
   `flex`/`flexShrink` 6 · `zIndex` 2 · `opacity` 1. 앞의 둘은 `AXIS` 에서 font 축이라
   거르지 않으면 `lineHeight: 1.45` 가 `--text-*` px 스케일과 대조된다.
3. **`.tsx` 템플릿 리터럴은 이미 옛 경로가 훑는다 — 갈래 B 가 중복 계수한다.**
   `extract.ts:143` 이 모든 백틱 구간을 CSS 영역으로 잡아 `DECL` 을 돌린다(실측 240히트·2파일).
   **옛·새 경로가 같은 바이트를 두 번 보는 유일한 자리**이고, "옛 히트 불변" 검증은 옛 히트만
   봐서 이걸 못 잡는다.
4. **예외 표를 새 갈래도 통과해야 한다.** `AUTO-GENERATED by scripts/apply-viz.ts` 파일
   (`src/` 안 42개 — `.tsx` 41 + `.css` 1) 안의 viz JSON 스펙 26건이 정확히 갈래 A·B 모양이다.
   **같은 `classify()` 를 지나가면 자동으로 붙는다**(`ex` 를 파일당 한 번 계산해 넘긴다).
   인식기가 `classify()` 를 안 거치고 직접 `hits.push` 하면 그때 샌다.
5. **`LITERAL` 이 소수를 두 조각으로 자른다.** `\b\d{1,4}\b` 라 `fontSize: 11.5` 가 `11`·`5`
   두 히트가 된다(`OverlayLab.tsx:148`). 카드가 말한 "반픽셀 글자"가 이 자리다.
   **옛 정규식은 안 건드리고 새 경로용 숫자 정규식을 따로 둔다.**
6. **갈래 B 를 통째로 위반으로 물면 준수분까지 잡는다.**
   `PermissionGate.tsx:124` 의 `` `var(--stroke, 1.5px) solid ${BORDER}` `` 는 템플릿 안이지만
   이미 준수다. `classify()` 의 `VARCALL` 제거가 처리하므로 **새 경로도 같은 `classify()` 를
   지나가야 한다.**

---

## 버린 대안 셋

- **`docrule` 식 legacy 옵션 플래그** — 두 정의를 매 실행 돌려야 한다. 새 히트가 새 `src` 를
  달고 나오므로 **필터 하나면 옛 집합이 그대로 나온다.**
- **옛 `LITERAL` 정규식을 소수까지 넓히기** — 감사 원자료 3,539 히트 대조가 그 자리에서 깨진다.
- **자가검사 검사 ③ 을 느슨하게(한 사유가 절반을 덮으면 실패)** — 키를 늘리는 쪽이
  원 주석의 취지("한 규칙이 여섯을 다 잡으면 우연")를 그대로 지킨다.

---

## 이 카드가 하지 않는 것

- **부채 상환** — 드러난 175건+를 옮기는 일은 후속 카드다(목표가 "새 기준선이 선다"까지).
  옮기면 그림 액자가 2px 줄고 반픽셀 글자가 정수로 접히는, **게이트가 검증 못 하는 화면 변화**다.
- **여러 줄 CSS 선언 47건** — `DECL` 의 값 클래스가 `[^;{}\n]` 이라 줄바꿈을 넘는 선언이 통째로
  안 잡힌다(`src/components/Logo.astro:58` 의 `box-shadow:` 세 줄). 옛 정규식을 고쳐야 한다.
- **`stroke-width` 계열 81건**(속성 72 · `strokeWidth={N}` 3 · `strokeWidth: N` 3 · CSS 3) —
  `AXIS` 에 속성 자체가 없다. 넣더라도 `--stroke` 3단으로 재면 안 된다:
  `Doodle.astro:437` 의 `stroke-width="9"` 는 86×74 viewBox **사용자 단위**라 화면 px 로는
  1~2px 이고 분포가 9·8·10·3.6·3.4…로 스케일이 아니라 연속 스펙트럼이다. 반대로
  `GraphExplorer.tsx:1308` 의 `strokeWidth={2}` 는 안 스케일되는 인라인 SVG 라 1단위 = 1px 이다.
  **viewBox 유무가 갈림선**이라 판정 규칙을 따로 세워야 한다.
- **`const WARN = "#9a5b2c"` 꼴 승격 리터럴 15건** — 유저 판정으로 별도 카드다(정규식이 아니라
  사용처 추적이 필요하다).

넷 다 카드를 닫을 때 후속 카드로 올린다.

---

**수행 방식은 오케스트레이션이다 (유저 선택, 2026-08-28).** 배치 3 · 병렬 폭 3.
단일 에이전트 1배치와 나란히 놓고 고른 결과다. **병렬은 공짜가 아니고 배치1 이 그 값이다** —
세 인식기가 같은 `extract.ts` 를 안 건드리게 하려면 계약과 스텁을 먼저 박아야 하며,
단일 에이전트로 갔다면 안 냈을 비용이다. KAN-070 이 축 셋을 병렬로 채우려고 S2 에서 공통
계약을 먼저 박은 것과 같은 모양이다.

**인식 범위는 유저가 정했다 (2026-08-28)** — 카드 원문 두 갈래에 `.astro` 인라인 `style="…"`
속성을 더한 셋. `const` 승격 리터럴은 기법이 달라(사용처 추적) 별도 카드로 뺐다.

플랜 파일: `~/.claude/plans/kan-073-cvd8x7-toasty-minsky.md`
(`plan-reviewer` 검토 1회 · 지적 13건 전부 반영). 지시 원문은 `KANBAN.md` 카드의 `원문:` 블록에 있다.

## 실행 계획
<!-- `S<n>`은 고정 id — 이름을 바꾸지 않는다. 체크 상태는 doc-step 이 갱신한다. -->
**배치1 — 계약과 스텁 (직렬, 폭 1)**

- [x] `S1` 인식기 계약 · 공용 축 표 · 빈 스텁 셋 — 완료 기준: `bun run tokens:verify` 가 **지금과 완전히 같은 수**(히트 3,135 · 래칫 0)를 내고 자가검사 6종이 그대로 산다

**배치2 — 인식기 셋 (병렬, 폭 3)** · 확인 명령은 `bun scripts/verify-tokens.ts --json --warn-only`
(인식기가 붙으면 래칫이 실패하므로 `tokens:verify` 로는 못 잰다. `--warn-only` 는 **로컬 전용**이고 커밋에 안 들어간다 — `main.yml:75` 가 금지한 것은 CI 사용이다)

- [x] `S2` 갈래 A `recognize/styleNum.ts` — 완료 기준: 836건이 판정에 들어오고 그중 175건이 스케일 밖 · `Doodle.astro` 좌표표 새 히트 0 · 단위 없는 속성 181건에서 새 히트 0
- [x] `S3` 갈래 B `recognize/exprValue.ts` — 완료 기준: 34건이 들어오고 `PermissionGate.tsx:124` 의 `var(--stroke, 1.5px)` 가 위반이 아니며 **새 히트와 옛 히트의 `(file, line, value)` 교집합이 0**
- [x] `S4` 갈래 C `recognize/attrCss.ts` — 완료 기준: `CrayonFilters.astro:42` 의 `width:0`·`height:0` 이 준수로 판정된다(부채를 거의 안 내므로 건수가 아니라 구멍이 닫혔는지로 본다)

**배치3 — 수렴 (직렬, 폭 1)**

- [x] `S5` 관문 3 + 검증 하네스 + 새 기준선 — 완료 기준: 옛 히트 증분이 화이트리스트 1건(`NonceReuseLab.tsx:306` `minWidth: "10rem"`)뿐이고, 자가검사 생존 확인 **뒤에** `--update-baseline` 이 돌아 `tokens:verify` exit 0
- [x] `S6` 문서 — 완료 기준: `UI_CONSISTENCY_AUDIT.md` §6 4항에 정정 블록 + 9·10항으로 갈래 A·C 신설, `CLAUDE.md` 에 인식 범위와 **"0 수렴 → 하드월 승격이 미뤄졌다"** 가 적힌다

각 work 는 자기 고장 케이스가 기존 여섯과 **다른 `(verdict, want, src)` 조합**으로 걸리는 것까지 확인한다.

## 검증
<!-- 무엇을 실행해 무엇이 나오면 이 카드가 끝난 것인가. -->
1. **옛 히트 불변** — `bun scripts/verify-tokens.ts --json` 을 변경 전(`git show HEAD:` 격리 사본)과 후로 각각 떠서 히트를 `(file, line, prop, value)` 키 집합으로 대조한다. **`src` 로 거르지 않는다** — 관문 3 이 옛 `src` 라벨을 단 히트를 늘리므로 필터로는 안 걸린다. 기대 증분은 화이트리스트 1건(`NonceReuseLab.tsx:306` `minWidth: "10rem"`)이고 그 밖의 차이는 0.
2. **새 히트가 옛 히트를 겹쳐 세지 않는다** — 새 `src` 셋과 옛 셋을 `(file, line, value)` 로 교집합 내면 **0**. `.tsx` 템플릿 리터럴이 양쪽 경로에 모두 들어오는 유일한 자리이고 1번은 옛 히트만 봐서 못 잡는다.
3. **자가검사** — 맨몸 실행으로 "정상 1 + 고장 9종, 사유 9가지"(유일성 키 `(verdict, want, src)`). **기준선 갱신보다 먼저** 한다 — 죽은 게이트와 다 갚은 게이트가 화면에서 같은 모양이라, 살아 있음을 먼저 증명해야 새 기준선이 뜻을 갖는다.
4. **화면 변화 0** — `scripts/` 와 문서만 고치므로 `git status --porcelain src/ public/` 가 **비어 있음**을 확인하는 것으로 갈음한다. 안 비었으면 그때만 `dist` 전체 대조로 올린다(`sed -E 's/ uid="[^"]*"//g'` 로 `astro-island uid` 를 지우고 — 안 지우면 46쪽 중 26쪽이 달라졌다고 나온다).
5. **회귀 없음** — `bun run build` · `viz:verify` · `deco:verify` · `width:verify` · `talk:verify` · `check-post-markers` · `check-emphasis`(+`--dist`) · `tsc --noEmit` 신규 0. `graph:verify` 는 `src/data`·`src/content` 를 안 건드리므로 대상 밖이다.
6. **CI 가 안 빨개진다** — 인식층 확장과 기준선 갱신이 **같은 커밋**에 들어간다. 게이트는 `build` 잡 안에서 `astro build` 앞에 돌고 `deploy` 잡이 `needs: build` 로 물려 있어(`main.yml:76`), 둘을 나누면 그 사이 푸시에서 사이트 배포가 멈춘다.

## 수행 내역
<!-- KANBAN:LOG append-only — 아래로만 덧붙인다. 위를 고치지 않는다. -->
- 2026-08-28T18:58 · s:557e0f67 — `전략` 섹션 교체
- 2026-08-28T18:58 · s:557e0f67 — `실행 계획` 섹션 교체
- 2026-08-28T18:58 · s:557e0f67 — `검증` 섹션 교체
- 2026-08-28T19:04 · s:557e0f67 · S1 doing — 착수
- 2026-08-28T19:10 · s:557e0f67 · S1 done — 계약·축 표·스텁 셋을 박았다. propAxis.ts 가 축 표를 소유하되 옛 AXIS 는 내용 그대로 두고 camelCase 는 새 경로 전용 axisOfProp() 에만 넓혔다 — 공유 맵에 보태면 그 값을 줍는 것이 새 인식기가 아니라 기존 JSXOBJ 라 옛 집합이 움직인다. docrule 의 SPACING_GROUP 도 같은 표를 읽게 했고(지금 판정 불변 — camelCase spacing 히트가 0건), selftest 는 고장 파일을 확장자별로 얹고 CASES 를 인식기 faults 에서 모으며 유일성 키를 (verdict, want, src) 로 바꿨다. 검증: 히트 3135·판정 3654·토큰 108·파일 152 로 변경 전과 완전 동일, 옛 집합 (file,line,prop,value,src) 키 대조에서 증분 0·소실 0, 자가검사 정상 1 + 고장 6종 사유 6가지, scripts/ tsc 신규 0
- 2026-08-28T19:14 · s:557e0f67 · S2 doing — 착수
- 2026-08-28T19:14 · s:557e0f67 · S3 doing — 착수
- 2026-08-28T19:14 · s:557e0f67 · S4 doing — 착수
- 2026-08-28T19:22 · s:557e0f67 · S4 done — 갈래 C 인식기. 히트 2건(CrayonFilters.astro:42 의 width·height) · 옛 히트와 겹침 0 · 축 없는 속성 38자리에서 0건 · 자가검사 7종 사유 7가지. 계획과 다른 것 하나 — 그 둘은 준수가 아니라 판정 불가로 뜬다. docrule 이 width·height 를 dimension 갈래로 내려 §9 관할 밖에 두기 때문이고(KAN-070 S5 가 굳힌 자리), 준수로 만들려면 치수를 §9 로 되돌려야 해서 치수·좌표 63건이 래칫에 물린다 — 규칙을 안 비틀고 뒀다. 구멍은 닫혔다(판정 0건 → 2건). 맨 숫자 0 을 0px 로 승격했다: 승격 안 하면 classify 의 맨 숫자 필터가 버려 attr-css 히트가 실소스에서 0건이 된다. 계획서의 「같은 파일 8건은 전부 style 블록」은 틀렸다 — 실제로는 width="150%" 꼴 jsx-attr 이다
- 2026-08-28T19:27 · s:557e0f67 · S3 done — 갈래 B 인식기. 히트 78 → 판정 78(준수 55 · 위반 20 · 드리프트 3), 그중 리터럴 23(삼항 17 · 템플릿 6)이고 55는 var() 토큰 히트다. 옛 히트와 (file,line,value) 교집합 0 · 옛 판정 3654 불변 · PermissionGate.tsx:124 는 준수 · .astro 침범 0 · 자가검사 8종 사유 8가지. 정규식이 아니라 왼쪽→오른쪽 훑개로 짰다 — prop: 를 전역 정규식으로 찾으면 문자열 안의 prop:(title: "padding: 10px")까지 걸려 따옴표 짝이 어긋난 채 잘린다. 계획 수치 34 가 아니라 23 이 맞다: 34 는 옛 TEMPLATE 정규식이 본 문자열 수였고 게이트가 셀 수 없는 11건이 섞여 있었다 — var() fallback 6(classify 의 VARCALL 이 지워 준수로 들어온다, 완료 기준 2번이 요구한 동작) · 주석 안 마크다운 백틱 2 · 값 자리 아님 1 · const 삼항 1(별도 카드 갈래) · 두 훑기 중복 1
- 2026-08-28T19:30 · s:557e0f67 · S2 done — 갈래 A 인식기. 판정 845(spacing 415 · font 252 · radius 178) · 스케일 밖 181 · 그중 게이트 위반 150(spacing 44 · font 53 · radius 53) · Doodle.astro 새 히트 0 · 단위 없는 속성 0 · 옛 히트와 교집합 0 · 파일 37개(99.5% posts). 범위는 style={{ 와 CSSProperties 값 자리 둘만 열고, 그 안에서 문자열·템플릿·주석을 공백으로 지운 사본 위에서 짝 } 를 세며, 값 표현식의 괄호 안쪽과 삼항 조건부를 지운다 — 안 지우면 tint(DANGER, 12.2) 같은 자리에서 색 축에 헛것 33건이 든다. 계획 836 과의 차 +9 를 검산했다: 삼항 가지 4 · 산술식 피연산자 4(전부 width 라 판정 불가) · 음수 리터럴 2(docrule.px 가 Math.abs 로 음수 여백도 잰다) · stroke -1. 마지막은 계획이 틀렸다 — PosterHero.tsx:124 의 strokeWidth: 2 를 앞 속성 fill 에 붙여 stroke 로 셌던 것이고 strokeWidth 는 AXIS 에 없다(이 카드가 명시적으로 뺀 갈래). 속성 바로 뒤 숫자만 세고 음수를 빼면 spacing 407 · font 252 · radius 176 으로 계획과 정확히 일치한다. 175 vs 위반 150 은 성격이 다른 수다 — 175 는 인식 단계 통계이고 게이트 위반은 §9 관할(padding·margin·gap)만 문다(치수·좌표 스케일 밖 31건은 판정 불가)
- 2026-08-28T19:31 · s:557e0f67 — 배치2 종료 — 인식기 셋이 붙었다. 계획 수치 셋 중 둘이 실측에서 갈렸고 둘 다 규칙을 안 비튼 쪽이다: 갈래 B 34→23(11건은 var() fallback 6·주석 2·값 자리 아님 1·const 삼항 1·중복 1 로 게이트가 셀 수 없는 것) · 갈래 C 는 준수가 아니라 판정 불가(§9 는 치수 규칙이 아니다) · 갈래 A 는 836→845 인데 검산으로 차 +9 가 삼항 4·산술 4·음수 2·stroke -1 로 갈렸고 마지막은 계획 오류였다(strokeWidth: 2 를 앞 속성 fill 에 붙여 셌다). 세 work 모두 옛 히트와 (file,line,value) 교집합 0. 배치3 에 넘길 것 하나 — Hit.rawValue 는 채워지는데 진입점이 출력에 안 써서 「고치는 법」이 grep 안 되는 값을 가리킨다
- 2026-08-28T19:32 · s:557e0f67 · S5 doing — 착수
- 2026-08-28T19:36 · s:557e0f67 · S5 done — 관문3 + 검증 + 새 기준선. 옛 AXIS 를 넓은 표(axisOfProp)로 바꿨고 옛 집합 증분이 예측대로 정확히 1건이다 — NonceReuseLab.tsx:306 minWidth 10rem, 화이트리스트 밖 0 · 소실 0. 새 히트 925건과 옛 히트의 (file,line,value) 교집합 0. src 별 판정: css-decl 3032 · style-num 845 · style-obj 414 · jsx-attr 209 · expr-literal 78 · attr-css 2. 자가검사를 먼저 검증했다 — 정상 1 + 고장 9종 사유 9가지이고, 인식기 셋을 각각 죽여 보니 셋 다 자기 사유로 물었다(styleNum·attrCss 는 사유가 똑같이 §9 인데 src 로 갈린다 — 유일성 키에 셋째 자리를 넣은 이유가 실제로 작동한다). 그 다음에 --update-baseline: 래칫 0 → 778(위반 170 · 드리프트 608), 준수 2703 → 2795, 히트 3135 → 4061. baseline.ts 의 무는 자리 출력에 rawValue 병기를 붙였다(6(→6px)) — 안 붙이면 「고치는 법」이 소스에서 grep 안 되는 값을 가리킨다(S2 가 넘긴 것). 회귀: build 46쪽 · viz/deco/width/talk verify · check-post-markers · check-emphasis(+--dist) · check-quote-blocks · gen:motion 후 motion.css 드리프트 0 · tsc scripts 신규 0 · src/ public/ 변경 0(화면 변화 없음)
- 2026-08-28T19:38 · s:557e0f67 — `전략` 섹션 교체
- 2026-08-28T19:38 · s:557e0f67 · S6 done — 문서. UI_CONSISTENCY_AUDIT.md §6 4항(계산값·조건부 값)에 정정 블록을 붙였다 — 그 항이 「리터럴로만 잡힌다」고 적었지만 실제로는 한 건도 안 잡히고 있었다. 그리고 9~12항을 신설했다: 9 인라인 숫자값(진단이 안 봤다고 적지도 않은 갈래) · 10 .astro 인라인 style 속성(같음) · 11 여러 줄 CSS 선언 47건(안 여는 이유는 옛 정규식을 고쳐야 해서 원자료 대조가 깨진다) · 12 stroke-width 81건(viewBox 유무가 갈림선이라 판정 규칙을 따로 세워야 한다). 3항 이름 색은 이 카드와 무관해 안 건드렸다. CLAUDE.md 토큰 게이트 절에 「게이트의 0 은 인식 범위 안에서의 0 이다」 항목을 세우고, 하드월 승격이 미뤄졌다는 사실·인식층과 기준선은 같은 커밋이어야 한다는 것·자가검사 유일성 키가 셋인 이유·13(→13px) 병기를 적었다. build→deploy 를 「한 잡」이라 적은 옛 표현도 needs: build 로 고쳤다. 숫자는 안 적었다. 검증: tokens:verify · build 46쪽 · check-emphasis(+--dist) · check-post-markers 전부 통과, src/ public/ 변경 0
