---
card: KAN-073-CVD8X7
title: 게이트 인식층 확장 — 추출층이 못 보는 두 갈래를 판정에 넣는다
created: 2026-08-28
branch: KAN-073-CVD8X7
worktree: /Users/centurio/orca/workspaces/centurio1987.github.io/KAN-073-CVD8X7
base: fefd83b279a54442bf9a789a33380c3949c5ebd4
status: 검토 대기
---

# KAN-073-CVD8X7 검토 요청 — 게이트 인식층 확장 — 추출층이 못 보는 두 갈래를 판정에 넣는다

카드: [KAN-073-CVD8X7.md](../KANBAN.cards/KAN-073-CVD8X7.md)

> 이 문서는 **검토를 위한 산출물**이다. 수행 내역은 카드 실행 문서에 있고, 착수 전
> 계획은 배치 문서에 있다. 여기 있는 것은 "지금 이 브랜치를 무엇으로 판정하는가" 뿐이다.

## 1. 검토 대상

| 항목 | 값 |
|---|---|
| 브랜치 | `KAN-073-CVD8X7` |
| 워크트리 | `/Users/centurio/orca/workspaces/centurio1987.github.io/KAN-073-CVD8X7` |
| 베이스 | `fefd83b279a54442bf9a789a33380c3949c5ebd4` |
| 변경 훑기 | `git diff fefd83b279a54442bf9a789a33380c3949c5ebd4...HEAD` |

**커밋 8건**

```text
bed2798 S6: 감사 정본 §6 정정·9~12항 신설 · CLAUDE.md 인식 범위 (KAN-073-CVD8X7)
be1a6de S5: 옛 축 표 확장(증분 1건) · rawValue 병기 · 새 기준선 0 → 778 (KAN-073-CVD8X7)
98c6417 S2: 갈래 A 인식기 — 인라인 스타일 숫자 리터럴 845건 (KAN-073-CVD8X7)
52f46c6 S3: 갈래 B 인식기 — 삼항·템플릿 안 리터럴 23건 (KAN-073-CVD8X7)
aa96c73 S4: 갈래 C 인식기 — 인라인 style="…" 속성 (KAN-073-CVD8X7)
319589f kanban: KAN-073-CVD8X7 계획 리포트 발행 (voice ppangtolab-teacher)
93d0b9d S1: 인식기 계약·공용 축 표·빈 스텁 셋 — 옛 히트 증분 0 (KAN-073-CVD8X7)
11ff5cf kanban: KAN-073-CVD8X7 착수 — 진행 중 이동 · 실행 문서 · 배치 3개
```

**변경 파일 27개 (+2600 −93)**

| 파일 | 상태 | 추가 | 삭제 |
|---|:--:|---:|---:|
| `.kanban/archive.jsonl` | M | 1 | 0 |
| `.kanban/log.md` | M | 1 | 1 |
| `.kanban/state.json` | M | 23 | 15 |
| `CLAUDE.md` | M | 13 | 2 |
| `KANBAN.batches/KAN-073-CVD8X7.batch1.md` | M | 74 | 0 |
| `KANBAN.batches/KAN-073-CVD8X7.batch2.md` | M | 114 | 0 |
| `KANBAN.batches/KAN-073-CVD8X7.batch3.md` | M | 83 | 0 |
| `KANBAN.board.html` | M | 4 | 4 |
| `KANBAN.cards/KAN-073-CVD8X7.md` | M | 222 | 0 |
| `KANBAN.md` | M | 12 | 10 |
| `KANBAN.reports/KAN-073-CVD8X7.draft.md` | M | 305 | 0 |
| `KANBAN.reports/KAN-073-CVD8X7.report.html` | M | 660 | 0 |
| `design-concept/UI_CONSISTENCY_AUDIT.md` | M | 32 | 0 |
| `scripts/fixtures/tokens/faults/cases/attr-css.astro` | M | 5 | 0 |
| `scripts/fixtures/tokens/faults/cases/expr-literal.tsx` | M | 13 | 0 |
| `scripts/fixtures/tokens/faults/cases/style-num.tsx` | M | 12 | 0 |
| `scripts/lib/tokens/baseline.ts` | M | 7 | 1 |
| `scripts/lib/tokens/docrule.ts` | M | 13 | 12 |
| `scripts/lib/tokens/extract.ts` | M | 55 | 22 |
| `scripts/lib/tokens/propAxis.ts` | M | 127 | 0 |
| `scripts/lib/tokens/recognize/attrCss.ts` | M | 119 | 0 |
| `scripts/lib/tokens/recognize/exprValue.ts` | M | 190 | 0 |
| `scripts/lib/tokens/recognize/styleNum.ts` | M | 298 | 0 |
| `scripts/lib/tokens/recognize/types.ts` | M | 101 | 0 |
| `scripts/lib/tokens/selftest.ts` | M | 44 | 18 |
| `scripts/lib/tokens/types.ts` | M | 20 | 2 |
| `scripts/tokens-baseline.json` | M | 52 | 6 |

**롤백 태그 8개**

```text
kan/KAN-073-CVD8X7/S1
kan/KAN-073-CVD8X7/S2
kan/KAN-073-CVD8X7/S3
kan/KAN-073-CVD8X7/S4
kan/KAN-073-CVD8X7/S5
kan/KAN-073-CVD8X7/S6
kan/KAN-073-CVD8X7/batch2
kan/KAN-073-CVD8X7/batch3
```

## 2. 검증 — 기준과 실행 결과

<!-- 기준은 카드 실행 문서 「검증」 절의 사본이다. 정본은 KANBAN.cards/KAN-073-CVD8X7.md 이므로
     기준이 바뀌면 그쪽을 고치고 review-init --refresh 로 이 항만 다시 뜬다.
     결과는 착수한 쪽이 이미 돌린 것이다 — 검토자에게 다시 돌리라고 시키지 않는다.
     **다시 돌려 아래와 다르게 나오면 그 자체가 반려 사유다.** -->

**기준**

<!-- 무엇을 실행해 무엇이 나오면 이 카드가 끝난 것인가. -->
1. **옛 히트 불변** — `bun scripts/verify-tokens.ts --json` 을 변경 전(`git show HEAD:` 격리 사본)과 후로 각각 떠서 히트를 `(file, line, prop, value)` 키 집합으로 대조한다. **`src` 로 거르지 않는다** — 관문 3 이 옛 `src` 라벨을 단 히트를 늘리므로 필터로는 안 걸린다. 기대 증분은 화이트리스트 1건(`NonceReuseLab.tsx:306` `minWidth: "10rem"`)이고 그 밖의 차이는 0.
2. **새 히트가 옛 히트를 겹쳐 세지 않는다** — 새 `src` 셋과 옛 셋을 `(file, line, value)` 로 교집합 내면 **0**. `.tsx` 템플릿 리터럴이 양쪽 경로에 모두 들어오는 유일한 자리이고 1번은 옛 히트만 봐서 못 잡는다.
3. **자가검사** — 맨몸 실행으로 "정상 1 + 고장 9종, 사유 9가지"(유일성 키 `(verdict, want, src)`). **기준선 갱신보다 먼저** 한다 — 죽은 게이트와 다 갚은 게이트가 화면에서 같은 모양이라, 살아 있음을 먼저 증명해야 새 기준선이 뜻을 갖는다.
4. **화면 변화 0** — `scripts/` 와 문서만 고치므로 `git status --porcelain src/ public/` 가 **비어 있음**을 확인하는 것으로 갈음한다. 안 비었으면 그때만 `dist` 전체 대조로 올린다(`sed -E 's/ uid="[^"]*"//g'` 로 `astro-island uid` 를 지우고 — 안 지우면 46쪽 중 26쪽이 달라졌다고 나온다).
5. **회귀 없음** — `bun run build` · `viz:verify` · `deco:verify` · `width:verify` · `talk:verify` · `check-post-markers` · `check-emphasis`(+`--dist`) · `tsc --noEmit` 신규 0. `graph:verify` 는 `src/data`·`src/content` 를 안 건드리므로 대상 밖이다.
6. **CI 가 안 빨개진다** — 인식층 확장과 기준선 갱신이 **같은 커밋**에 들어간다. 게이트는 `build` 잡 안에서 `astro build` 앞에 돌고 `deploy` 잡이 `needs: build` 로 물려 있어(`main.yml:76`), 둘을 나누면 그 사이 푸시에서 사이트 배포가 멈춘다.

**실행 결과**

```text
1) 옛 히트 불변 — 카드 착수 전 main 대비 (file,line,prop,value,src) 대조
   증분 1 · 화이트리스트 밖 0 · 소실 0  →  통과
2) 새 히트 ∩ 옛 히트 (file,line,value) = 0
   새 판정 925 · 교집합 0  →  통과
3) 자가검사
   자가검사: 정상 1 + 고장 9종, 사유 9가지
   인식기 셋을 각각 죽였을 때 전부 자기 사유로 물림(styleNum→§9/style-num · exprValue→color 축/expr-literal · attrCss→§9/attr-css)
4) 화면 변화 0 — git status --porcelain src/ public/
   0줄  →  통과
5) 회귀 — build 46쪽 · viz/deco/width/talk verify · check-post-markers · check-emphasis(+--dist) · check-quote-blocks · gen:motion 드리프트 0 · tsc scripts 신규 0  →  전부 통과
6) 게이트 최종
   래칫 기준(제외분 빼고 · fallback 포함 — 지금 고쳐야 할 것): 드리프트 608 · 위반 170 · 준수 2795 · 판정 불가 947
```

## 3. 판단 항목 — 스크립트가 판정할 수 없는 것

<!-- 스크립트가 판정할 수 없는 것만 적는다 — 값의 진위, 선택지 중 하나를 고른 근거,
     범위를 그은 자리. 2항에서 이미 돌아간 검증을 여기 옮겨 적지 않는다.
     한 줄 형식: 체크박스 하나에 의견 하나 — "<주제> — <지금 고른 값과 그 근거>".
     **의견마다 「상세」 접기가 따라붙는다** — 검토자는 이 카드를 수행하지 않았으므로
     내부 기호(`L10`·`P5`·`S8`)만 던지면 판정할 재료가 없다. 상세에는 그 기호를 풀어
     쓰고 원문 경로(`파일:줄`)나 링크를 건다.
     비어 있으면 "기계가 다 판정했고 사람이 정할 것이 없다"는 뜻이다. 그 판단도
     착수한 쪽이 하는 것이지 검토자가 빈칸을 보고 추측할 일이 아니다.
     **승계 절(3-0)이 있으면 그것이 먼저 온다** — 다른 검토서에서 넘어온 의견이고,
     판정은 승계를 받은 이 문서 하나에서만 내려진다. -->

**의견마다 판정과 추가 의견이 따로 붙습니다.** 판정은 상태이고 추가 의견은 말입니다 — 승인/반려를 아직
안 정했어도 의견 하나에만 추가 의견을 달 수 있고, 반대로 의견 하나만 먼저 닫을 수도 있습니다.
`<번호>`는 의견 순서이고, 주제의 문구 일부로도 찾습니다.

```
# 판정 — 승인 · 반려 · 철회
python3 scripts/kanban.py review-judge <project-root> --card KAN-073-CVD8X7 --item <번호> --verdict 승인
# 추가 의견
python3 scripts/kanban.py review-note <project-root> --card KAN-073-CVD8X7 --item <번호> --text "<추가 의견>"
# 추가 의견을 반영하다 새 의견이 생겼으면 (맨 뒤에 붙어 앞 번호가 안 밀립니다)
python3 scripts/kanban.py review-item <project-root> --card KAN-073-CVD8X7 --add "<주제>
  <상세>"
```

**전체 승인은 살아있는 항목이 전부 승인일 때만 섭니다**(철회는 분모에서 빠집니다). 하나라도
반려·추가 의견·미정이면 4항의 전체 승인도 `→ 완료` 이동도 종료코드 14로 거부됩니다.

- [ ] 새 기준선을 비0(위반 170 · 드리프트 608)으로 세운 것에 동의하는가 — 카드 목표대로 세웠다
    - **상세** — 카드 목표가 「그때 드러나는 건수로 새 기준선이 선다」까지이고 상환은 후속 카드다. 원문: KANBAN.md 의 이 카드 「목표:」 줄. 그 결과 CLAUDE.md 의 「0 으로 수렴하면 하드월로 승격한다」가 미뤄졌고 그 사실을 CLAUDE.md 의 토큰 게이트 절에 적었다. 기준선 파일은 scripts/tokens-baseline.json 이고 갱신은 bun run tokens:verify --update-baseline 하나가 한다(scripts/verify-tokens.ts:36). 되돌리려면 이 카드에서 778건을 상환해야 하는데, 옮기면 그림 액자가 2px 씩 줄고 반픽셀 글자가 정수로 접히는 화면 변화라 별도 검증 하네스가 필요하다 — 근거는 KANBAN.cards/KAN-072-CPJCT1.md:229 의 「검증 하네스에서 조용히 통과하는 고장 셋」

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 갈래 C 의 width:0·height:0 이 준수가 아니라 판정 불가로 남는 것에 동의하는가 — 규칙을 안 비틀었다
    - **상세** — 판정층이 width·height 를 치수 갈래로 내려 DESIGN_CONCEPT.md 9절 관할 밖에 둔다. 원문: scripts/lib/tokens/docrule.ts:61 부터의 SPACING_GROUP 정의와 그 위 주석(「9절 은 여백 규칙이지 치수·좌표 규칙이 아니다」, KAN-070 이 굳힌 자리). 준수로 만들려면 치수를 9절 관할로 되돌려야 하고 그러면 치수·좌표 63건이 래칫에 물린다. 구멍 자체는 닫혔다 — src/components/deco/CrayonFilters.astro:42 가 판정 0건에서 2건이 됐다

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 계획 수치 셋이 실측에서 갈린 것을 그대로 받은 판단에 동의하는가 — 셋 다 규칙을 안 비튼 쪽이다
    - **상세** — 갈래 A 836→845(차 아홉 = 삼항 4 · 산술 4 · 음수 2 · stroke 마이너스 1, 마지막은 계획이 src/lib/viz/PosterHero.tsx:124 의 strokeWidth: 2 를 앞 속성 fill 에 붙여 센 오류다) · 갈래 B 34→23(11건은 var() fallback 6 · 주석 2 · 값 자리 아님 1 · const 삼항 1 · 중복 1 로 게이트가 셀 수 없는 것) · 스케일 밖 175 대 게이트 위반 150(175 는 인식 단계 통계이고 9절 관할은 여백뿐이다). 항목별 내역은 KANBAN.cards/KAN-073-CVD8X7.md:1 의 「수행 내역」에 work 별로 있다. 수를 맞추려면 var() 제거를 끄거나 주석을 코드로 세거나 치수를 여백 자로 재야 한다

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 자가검사 유일성 키를 (판정, 사유, 인식 경로) 셋으로 넓힌 것에 동의하는가 — 느슨하게 푸는 대신 키를 늘렸다
    - **상세** — 원문: scripts/lib/tokens/selftest.ts:19 의 「유일성 키가 (verdict, want, src) 셋인 이유」 문단, 그리고 그 검사가 실제로 도는 자리는 scripts/lib/tokens/selftest.ts:105 다. 원래는 사유 하나였는데 새 갈래가 CSS 자리와 똑같은 코드로 판정돼 사유가 겹친다(.tsx 의 padding: 10 과 .astro 의 padding: 10px 이 둘 다 「9절」이다). 사유를 억지로 다르게 쓰면 「같은 코드로 판정한다」가 깨지고 scripts/lib/tokens/baseline.ts:52 의 judgeAxis 가 예약한 네 접두와도 부딪힌다. 외부 검토(plan-reviewer)는 검사 3 을 느슨하게 하는 쪽을 제안했으나 키를 늘리는 쪽이 원 주석의 취지를 그대로 지킨다. 실증: 인식기 셋을 각각 죽이니 셋 다 자기 사유로 물었고 styleNum·attrCss 는 사유가 같은데 인식 경로로 갈렸다

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 남긴 넷을 후속 카드로 올릴 것인가 — 올리는 쪽을 제안한다
    - **상세** — ① 부채 상환 778건 ② 여러 줄 CSS 선언 47건(선언 정규식의 값 클래스가 줄바꿈을 안 받아 여러 줄 선언이 통째로 안 잡힌다 — src/components/Logo.astro:58 의 box-shadow 세 줄. 옛 정규식을 고쳐야 해서 감사 원자료 대조가 깨진다) ③ stroke-width 계열 81건(viewBox 유무가 갈림선이다 — src/components/deco/Doodle.astro:437 의 stroke-width=9 는 사용자 단위이고 src/components/graph/GraphExplorer.tsx:1308 의 strokeWidth={2} 는 1단위=1px) ④ const 승격 리터럴 15건(정규식이 아니라 사용처 추적이 필요하다). 넷 다 design-concept/UI_CONSISTENCY_AUDIT.md:512 부터의 6절 11·12항과 이 카드 문서의 「이 카드가 하지 않는 것」에 적혀 있다

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 계획 리포트의 「루트 독립성 겹침 0」을 그대로 둘 것인가 — 조건을 함께 적었다
    - **상세** — 미완료 루트 14개 중 scope 를 적은 것이 이 카드(KANBAN.cards/KAN-073-CVD8X7.md:5)와 KAN-071-6361MY(KANBAN.cards/KAN-071-6361MY.md:5) 둘뿐이라 나머지 12개는 맞대 볼 상대가 아니다. 그리고 CLAUDE.md 는 어느 카드든 문서 절을 고칠 때 닿는 파일인데 지금 이 카드만 scope 에 적어 뒀다 — 경로 검사로는 안 보이는 겹침이다

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._


## 4. 판정

<!-- 문서 하나에 대한 판정이다. **항목별로 갈리는 말은 여기 적지 않는다** — 3항 각 의견의
     「판정」과 「추가 의견」이 그 자리다. 여기 남는 것은 그 항목들이 전부 승인으로 닫혔다는
     사실 하나뿐이다.
     아래 「판정 이력」은 **덧붙기만 하는 이력**이다. 왕복이 돌면 줄이 쌓이고, 그것이 이 문서가
     무엇을 거쳐 승인에 닿았는지의 전부다 — 지우지 않는다. **판정에는 사유 칸이 없다** —
     승인은 대체로 덧붙일 말이 없고, 있다면 그것은 문서 전체가 아니라 그 항목에 대한
     말이라 3항의 「추가 의견」이 받는다.
     `review-judge --card KAN-073-CVD8X7 --verdict 승인` 이 이 자리를 쓰고
     frontmatter 의 status 도 함께 고친다. 손으로 적어도 되지만, 그때는 수렴 검사를
     안 거치므로 `validate` 가 항목 판정과 어긋난 승인을 error 로 잡는다. -->

**판정**: (아직 없습니다)

**판정 이력**:

- 승인이면 → `apply --op move --id KAN-073-CVD8X7 --to done` 뒤에 `main` 병합과 워크트리 정리(출력의 `cleanup`)
- 반려면 → `apply --op move --id KAN-073-CVD8X7 --to doing` 뒤에 `doc-log --entry "<반려 사유>"`.
  요청서는 **지우지도 다시 뜨지도 않는다** — 고친 뒤 그 항목을 `review-judge --verdict 승인` 으로
  뒤집으면 같은 문서에서 수렴한다. 1·2항이 낡았으면 `review-init --refresh` 로 그 두 항만 간다.
