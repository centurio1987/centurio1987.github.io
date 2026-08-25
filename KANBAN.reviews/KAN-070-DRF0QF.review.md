---
card: KAN-070-DRF0QF
title: UI 토큰 게이트를 세운다 — verify-tokens 래칫 신설과 집필 규칙 개정
created: 2026-08-25
branch: KAN-070-DRF0QF
worktree: /Users/centurio/orca/workspaces/centurio1987.github.io/KAN-070-DRF0QF
base: 1512ded
status: 검토 대기
---

# KAN-070-DRF0QF 검토 요청 — UI 토큰 게이트를 세운다 — verify-tokens 래칫 신설과 집필 규칙 개정

카드: [KAN-070-DRF0QF.md](../KANBAN.cards/KAN-070-DRF0QF.md)

> 이 문서는 **검토를 위한 산출물**이다. 수행 내역은 카드 실행 문서에 있고, 착수 전
> 계획은 배치 문서에 있다. 여기 있는 것은 "지금 이 브랜치를 무엇으로 판정하는가" 뿐이다.

## 1. 검토 대상

| 항목 | 값 |
|---|---|
| 브랜치 | `KAN-070-DRF0QF` |
| 워크트리 | `/Users/centurio/orca/workspaces/centurio1987.github.io/KAN-070-DRF0QF` |
| 베이스 | `1512ded` |
| 변경 훑기 | `git diff 1512ded...HEAD` |

**커밋 10건**

```text
f9ed3bd Merge branch 'main' into KAN-070-DRF0QF
2e063ac KAN-070-DRF0QF S10·S6·S7·S8: 예외 표를 자기검증으로, 자가검사로 게이트의 죽음을 잡고, 래칫을 CI 에 건다
196cfb6 hotfix(ci): 손으로 붙인 imgwait 계약을 생성기로 옮긴다 — motion.css 드리프트로 2026-07-31 부터 배포가 33회 멈춰 있었다
89eb7cd KAN-070-DRF0QF: 감사 정본을 새 판정 규칙으로 정정한다 — 준수율 44.3%→47.9%, 위반 1,567→1,304
083eb30 KAN-070-DRF0QF S5: 문서 축을 이식하고 간격 축을 여백·치수·위치로 가른다 — 감사 3,539건 전량 히트 단위 재현
36a7d29 KAN-070-DRF0QF S3·S4: 색·radius·선굵기와 fallback 축을 판정으로 채운다 — 감사와 히트 단위 차집합 0(1,306 + 108)
7975c2e KAN-070-DRF0QF S9: 판정할 수 없는 규칙을 판정 가능한 규칙으로 바꾼다 — 준수율 3.6% 구획이 '조화' 아래에서 만들어졌다
db82181 KAN-070-DRF0QF S2: 진입점과 축 모듈 계약을 세운다 — 추출층이 감사와 히트 단위로 일치한다(3,539건 차집합 0)
e922b29 KAN-070-DRF0QF S1: 감사 판정기와 출력 JSON 을 레포로 회수한다 — 스크래치패드가 비면 수치 재현이 불가하다
8dd9baa git guard: secret 패턴이 CSS 커스텀 프로퍼티를 오탐하던 것을 고친다 — 값 첫 글자에서만 하이픈을 뺀다
```

**변경 파일 57개 (+5505 −93)**

| 파일 | 상태 | 추가 | 삭제 |
|---|:--:|---:|---:|
| `.claude/skills/react-sim/assets/REACT_SIM_GUIDE.md` | M | 17 | 2 |
| `.github/workflows/main.yml` | M | 10 | 0 |
| `.kanban/archive.jsonl` | M | 2 | 0 |
| `.kanban/log.md` | M | 2 | 2 |
| `.kanban/state.json` | M | 30 | 29 |
| `CLAUDE.md` | M | 17 | 0 |
| `KANBAN.batches/KAN-070-DRF0QF.batch1.md` | M | 50 | 2 |
| `KANBAN.batches/KAN-070-DRF0QF.batch2.md` | M | 35 | 1 |
| `KANBAN.batches/KAN-070-DRF0QF.batch3.md` | M | 74 | 2 |
| `KANBAN.batches/KAN-070-DRF0QF.batch4.md` | M | 69 | 2 |
| `KANBAN.board.html` | M | 235 | 5 |
| `KANBAN.cards/KAN-070-DRF0QF.md` | M | 36 | 11 |
| `KANBAN.cards/KAN-072-CPJCT1.md` | M | 1 | 1 |
| `KANBAN.md` | M | 11 | 11 |
| `design-concept/UI_CONSISTENCY_AUDIT.md` | M | 51 | 24 |
| `package.json` | M | 1 | 0 |
| `scripts/fixtures/tokens/faults/base/src/components/Ok.astro` | M | 15 | 0 |
| `scripts/fixtures/tokens/faults/base/src/styles/global.css` | M | 1 | 0 |
| `scripts/fixtures/tokens/faults/base/src/styles/tokens.css` | M | 13 | 0 |
| `scripts/fixtures/tokens/faults/cases/color-out.astro` | M | 4 | 0 |
| `scripts/fixtures/tokens/faults/cases/drift.astro` | M | 4 | 0 |
| `scripts/fixtures/tokens/faults/cases/font-min.astro` | M | 4 | 0 |
| `scripts/fixtures/tokens/faults/cases/radius-out.astro` | M | 4 | 0 |
| `scripts/fixtures/tokens/faults/cases/spacing-out.astro` | M | 4 | 0 |
| `scripts/fixtures/tokens/faults/cases/stroke-out.astro` | M | 4 | 0 |
| `scripts/fixtures/tokens/reference/README.md` | M | 48 | 0 |
| `scripts/fixtures/tokens/reference/s1-catalog-layers.json` | M | 784 | 0 |
| `scripts/fixtures/tokens/reference/s1-contract.md` | M | 94 | 0 |
| `scripts/fixtures/tokens/reference/s2-declaration.md` | M | 116 | 0 |
| `scripts/fixtures/tokens/reference/s2-declared-layers.ts` | M | 26 | 0 |
| `scripts/fixtures/tokens/reference/s2-drift.json` | M | 190 | 0 |
| `scripts/fixtures/tokens/reference/s2-drift.py` | M | 79 | 0 |
| `scripts/fixtures/tokens/reference/s2-drift2.json` | M | 170 | 0 |
| `scripts/fixtures/tokens/reference/s2-drift2.py` | M | 41 | 0 |
| `scripts/fixtures/tokens/reference/s3-implementation.md` | M | 125 | 0 |
| `scripts/fixtures/tokens/reference/s3-scan.json` | M | 1 | 0 |
| `scripts/fixtures/tokens/reference/s3-scan.py` | M | 167 | 0 |
| `scripts/fixtures/tokens/reference/s4-classify.json` | M | 1 | 0 |
| `scripts/fixtures/tokens/reference/s4-classify.py` | M | 205 | 0 |
| `scripts/fixtures/tokens/reference/s4-docrules.json` | M | 277 | 0 |
| `scripts/fixtures/tokens/reference/s4-docrules.py` | M | 78 | 0 |
| `scripts/fixtures/tokens/reference/s4-fallback.json` | M | 1 | 0 |
| `scripts/fixtures/tokens/reference/s4-fallback.py` | M | 80 | 0 |
| `scripts/fixtures/tokens/reference/s4-verdict.md` | M | 274 | 0 |
| `scripts/fixtures/tokens/reference/s5-plan.md` | M | 233 | 0 |
| `scripts/gen-motion-css.ts` | M | 44 | 0 |
| `scripts/git-commit-push.sh` | M | 6 | 1 |
| `scripts/lib/tokens/baseline.ts` | M | 133 | 0 |
| `scripts/lib/tokens/color.ts` | M | 259 | 0 |
| `scripts/lib/tokens/docrule.ts` | M | 323 | 0 |
| `scripts/lib/tokens/exceptions.ts` | M | 109 | 0 |
| `scripts/lib/tokens/extract.ts` | M | 169 | 0 |
| `scripts/lib/tokens/fallback.ts` | M | 298 | 0 |
| `scripts/lib/tokens/selftest.ts` | M | 85 | 0 |
| `scripts/lib/tokens/types.ts` | M | 148 | 0 |
| `scripts/tokens-baseline.json` | M | 117 | 0 |
| `scripts/verify-tokens.ts` | M | 130 | 0 |

**롤백 태그 14개**

```text
kan/KAN-070-DRF0QF/S1
kan/KAN-070-DRF0QF/S10
kan/KAN-070-DRF0QF/S2
kan/KAN-070-DRF0QF/S3
kan/KAN-070-DRF0QF/S4
kan/KAN-070-DRF0QF/S5
kan/KAN-070-DRF0QF/S6
kan/KAN-070-DRF0QF/S7
kan/KAN-070-DRF0QF/S8
kan/KAN-070-DRF0QF/S9
kan/KAN-070-DRF0QF/batch1
kan/KAN-070-DRF0QF/batch2
kan/KAN-070-DRF0QF/batch3
kan/KAN-070-DRF0QF/batch4
```

## 2. 검증 — 기준과 실행 결과

<!-- 기준은 카드 실행 문서 「검증」 절의 사본이다. 정본은 KANBAN.cards/KAN-070-DRF0QF.md 이므로
     기준이 바뀌면 그쪽을 고치고 review-init --refresh 로 이 항만 다시 뜬다.
     결과는 착수한 쪽이 이미 돌린 것이다 — 검토자에게 다시 돌리라고 시키지 않는다.
     **다시 돌려 아래와 다르게 나오면 그 자체가 반려 사유다.** -->

**기준**

<!-- 무엇을 실행해 무엇이 나오면 이 카드가 끝난 것인가. -->
1. **게이트가 감사를 재현한다** — `bun run tokens:verify` 가 드리프트 **71** · 토큰 밖 **580** ·
   fallback 불일치 **23** 을 보고하고, `scripts/fixtures/tokens/reference/s4-classify.json` 의
   `rows` 와 히트 단위 차집합이 0 이다.
2. **게이트가 죽지 않았다** — 자가검사에서 고장 픽스처 여섯이 각자 다른 사유로 실패한다.
3. **래칫이 실제로 문다** — 리터럴 한 줄을 더하면 비0 + 파일:줄 지목, 지우면 0,
   `--update-baseline` 두 번이 바이트 동일.
4. **CI 가 초록이다** — `main.yml` 에 스텝이 꽂힌 채로 통과하고, 위반 브랜치에서는 그 스텝만 빨갛다.
5. **회귀 없음** — `bun run build`(46 page) · `bun scripts/check-post-markers.ts` ·
   `bun scripts/check-emphasis.ts`(+`--dist`) · `bun scripts/check-quote-blocks.ts` 전부 통과.
   `bun run gen:motion` 후 `git diff --exit-code -- src/styles/motion.css` 통과.
6. **규칙에 판정 불가능한 낱말이 없다** — `REACT_SIM_GUIDE.md`·`CLAUDE.md` 에서
   "조화"·"어울리게" 류가 0건이다.

**실행 결과**

```text
카드 「검증」 6항을 그대로 실행한 결과 (2026-08-25, 워크트리 KAN-070-DRF0QF)

1) 게이트가 감사를 재현한다
   파일 152개 · 토큰 44개 (src/styles/tokens.css)
   히트 3539건 — 게이트 대상 3524 · 제외 15(생성물·복제물)
   판정 3647건 · 축 3개
   히트 단위 대조 — s4-classify.json rows 와 (axis·prop·value·file·line·auditLabel) 여섯 쪽:
   PASS  color     1306 건 · 차집합 0/0
   PASS  docrule   2233 건 · 차집합 0/0
   PASS  두 축 합계 3539 = 감사 rows 3539
   PASS  fallback 축 108자리 — s4-fallback.json 과 차집합 0 (일치 42 · 불일치 23 · 제외 43)

2) 게이트가 죽지 않았다 — 자가검사
   PASS  자가검사: 정상 1 + 고장 6종, 사유 6가지
   PASS  color.run 을 no-op 으로 바꾸면 자가검사가 먼저 exit 1 로 죽는다(실측)

3) 래칫이 문다
   PASS  리터럴 한 줄 주입 → exit 1 + 'color / 위반 368→369' + Logo.astro:35 지목
   PASS  지우면 exit 0 · --update-baseline 두 번 돌려 sha256 동일(1b8acce5e286be2e)
   PASS  기준선을 올려 두면 '1칸이 줄었다' 안내가 나오고 exit 0

4) 예외 표가 자기를 검사한다
   PASS  예외 3건 — motion-css-generated(scan+verdict, 근거 2) · viz-css-vendored(scan, 근거 1) · apply-viz-generated(scan, 근거 1)
   PASS  근거를 비우면 exit 1 · 없는 줄(:99999)을 걸어도 exit 1 (둘 다 실측)

5) 회귀 없음
   PASS  bun run build — 46 page(s)
   PASS  check-post-markers
   PASS  check-emphasis (소스)
   PASS  check-emphasis --dist
   PASS  check-quote-blocks
   PASS  gen:motion 후 motion.css drift 0
   PASS  tsc — 새 파일 오류 0건

6) 판정 불가능한 낱말이 규칙 문서에 없다
   PASS  REACT_SIM_GUIDE.md · CLAUDE.md 에 남은 '조화' 2건은 전부 '옛 규칙은 …이었다'·'…는 규칙이 아니다' 문맥
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
python3 scripts/kanban.py review-judge <project-root> --card KAN-070-DRF0QF --item <번호> --verdict 승인
# 추가 의견
python3 scripts/kanban.py review-note <project-root> --card KAN-070-DRF0QF --item <번호> --text "<추가 의견>"
# 추가 의견을 반영하다 새 의견이 생겼으면 (맨 뒤에 붙어 앞 번호가 안 밀립니다)
python3 scripts/kanban.py review-item <project-root> --card KAN-070-DRF0QF --add "<주제>
  <상세>"
```

**전체 승인은 살아있는 항목이 전부 승인일 때만 섭니다**(철회는 분모에서 빠집니다). 하나라도
반려·추가 의견·미정이면 4항의 전체 승인도 `→ 완료` 이동도 종료코드 14로 거부됩니다.

- [ ] 게이트가 CI 에서 실제로 도는 것은 병합 뒤다 — 그대로 검토를 받는가
    - **상세** — 워크플로 트리거가 push: main 이라(.github/workflows/main.yml:3) 카드 브랜치를 밀어도 그 스텝이 안 돈다. 이 카드에서 확인한 것은 셋뿐이다 — 게이트 명령이 로컬에서 exit 0, YAML 들여쓰기가 형제 스텝 14개와 동일, 그리고 main 자체는 지금 초록(핫픽스 뒤 성공). 「CI 초록」이라는 완료 기준을 이 범위에서 만족한 것으로 볼지, 병합 후 첫 실행까지 카드를 열어 둘지가 갈림길이다

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 게이트가 세는 수가 감사 문서의 수와 다르다 — 어긋난 것이 아니라 기준이 둘이라는 설명으로 충분한가
    - **상세** — 기준선(scripts/tokens-baseline.json)은 위반 1305 · 드리프트 90 인데 감사 정본은 1304 · 71 이다. 이유는 둘 — 게이트는 제외분(생성물·복제물 15건)을 빼고 세고, fallback 축(위반 4 · 드리프트 19)을 함께 센다. fallback 은 감사에서 별도 파일(s4-fallback.json)로 갔던 축이라 §0 표에 안 들어가 있다. 근거는 scripts/lib/tokens/baseline.ts:12-24 주석이다. 같은 것을 두 기준으로 센 값이라 어느 쪽도 틀리지 않았지만, 숫자가 다르면 다음 사람이 먼저 의심하는 것은 게이트다

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 발행된 아티팩트가 낡았다 — 재발행할 것인가
    - **상세** — 「UI 일관성 전수 진단」(https://claude.ai/code/artifact/85f8a1f2-49f6-4692-aaa7-8dec32fe0940)은 정본의 렌더인데 정정 전 수치를 보여 준다(준수율 44.3% · 위반 1,567 · 간격 821). 정본은 이 카드에서 47.9% · 1,304 · 572 로 고쳤다. 손으로 저작한 HTML 이라 자동 재생성이 안 되고, 파생물의 실패 모드가 「없다」가 아니라 「있는데 낡았다」라는 것이 이 레포의 규약이다(manage-kanban SKILL.md 핵심 규칙). 지금 고칠지, 후속 카드로 넘길지, 안 고치고 아티팩트를 폐기할지가 갈림길이다

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 게이트가 파일 넷이 됐다 — 기존 verify-*.ts 단일 파일 관례에서 벗어난 것을 인정하는가
    - **상세** — 이 레포의 다른 게이트 다섯(verify-viz·verify-deco·verify-widths·verify-talk·verify-graph)은 전부 단일 파일이고 scripts/lib/ 라는 자리가 없었다. 이 카드는 진입점 하나 + 축 모듈 여섯(types·extract·color·fallback·docrule·exceptions·selftest·baseline)으로 갈랐다. 이유는 오케스트레이션 배치안(유저 선택)이다 — 축 셋을 세 세션이 병렬로 채우려면 같은 파일을 동시에 못 고친다. 규약(셰뱅·왜 필요한가 주석·failures/notes 분리·고치는 법 한 문단·exit 1)은 전부 진입점이 지고 축 모듈은 판정만 돌려준다. 근거는 scripts/verify-tokens.ts:24-31 주석

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 감사 정본을 두 번 고쳤다 — 정정 각주 방식에 동의하는가
    - **상세** — design-concept/UI_CONSISTENCY_AUDIT.md 는 승인된 정본인데 이 카드에서 14곳을 고쳤다(승인 2026-08-25). 고친 이유는 판정 규칙 둘이다 — 간격 축이 여백·치수·좌표를 한 통에 담고 있었고(§9 는 여백 규칙이다), 글자 역할값 집합에 §5 의 clamp 끝값이 빠져 있었다. 숫자만 바꾸지 않고 §0 과 §3-5 에 「왜 바뀌었는지」를 인용 블록 각주로 남겼다. 옛 정의는 legacySpacingAxis·legacyFontRoles 로 그대로 재현되고 게이트가 두 수를 다 출력한다. 각주를 정본에 남기는 방식이 맞는지, 아니면 변경 이력을 카드 문서에만 두는 편이 나은지가 갈림길이다

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] CI 를 이 카드 밖 별도 커밋으로 고친 것을 인정하는가
    - **상세** — S8 에서 「CI 초록」 기준에 막혀 파 보니 2026-07-31 부터 33회 연속 실패 중이었다. 원인은 794c6b4(KAN-059)가 [data-imgwait] 계약 29줄을 생성물 src/styles/motion.css 에 손으로 붙인 것이고, 고치는 자리 scripts/gen-motion-css.ts 는 KAN-071 scope 였다. 유저 승인을 받아 main 에 별도 핫픽스(196cfb6)로 냈고 CI 가 초록으로 돌아왔다. 카드 경계를 넘지 않으려면 KAN-071 을 먼저 돌려야 했지만 그만큼 배포 정지가 길어진다 — 그 판단을 사후 인정하는지

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
     `review-judge --card KAN-070-DRF0QF --verdict 승인` 이 이 자리를 쓰고
     frontmatter 의 status 도 함께 고친다. 손으로 적어도 되지만, 그때는 수렴 검사를
     안 거치므로 `validate` 가 항목 판정과 어긋난 승인을 error 로 잡는다. -->

**판정**: (아직 없습니다)

**판정 이력**:

- 승인이면 → `apply --op move --id KAN-070-DRF0QF --to done` 뒤에 `main` 병합과 워크트리 정리(출력의 `cleanup`)
- 반려면 → `apply --op move --id KAN-070-DRF0QF --to doing` 뒤에 `doc-log --entry "<반려 사유>"`.
  요청서는 **지우지도 다시 뜨지도 않는다** — 고친 뒤 그 항목을 `review-judge --verdict 승인` 으로
  뒤집으면 같은 문서에서 수렴한다. 1·2항이 낡았으면 `review-init --refresh` 로 그 두 항만 간다.
