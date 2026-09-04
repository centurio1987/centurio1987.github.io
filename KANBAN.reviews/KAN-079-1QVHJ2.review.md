---
card: KAN-079-1QVHJ2
title: 토큰 게이트를 래칫에서 하드월로 승격한다 — 조건이 KAN-077 로 처음 충족됐다
created: 2026-09-04
branch: KAN-079-1QVHJ2
worktree: /Users/centurio/orca/workspaces/centurio1987.github.io/KAN-079-1QVHJ2
base: ae5949c
status: 검토 대기
---

# KAN-079-1QVHJ2 검토 요청 — 토큰 게이트를 래칫에서 하드월로 승격한다 — 조건이 KAN-077 로 처음 충족됐다

카드: [KAN-079-1QVHJ2.md](../KANBAN.cards/KAN-079-1QVHJ2.md)

> 이 문서는 **검토를 위한 산출물**이다. 수행 내역은 카드 실행 문서에 있고, 착수 전
> 계획은 배치 문서에 있다. 여기 있는 것은 "지금 이 브랜치를 무엇으로 판정하는가" 뿐이다.

## 1. 검토 대상

| 항목 | 값 |
|---|---|
| 브랜치 | `KAN-079-1QVHJ2` |
| 워크트리 | `/Users/centurio/orca/workspaces/centurio1987.github.io/KAN-079-1QVHJ2` |
| 베이스 | `ae5949c` |
| 변경 훑기 | `git diff ae5949c...HEAD` |

**커밋 9건**

```text
dd51e93 KAN-079 S8 — 무는 것과 안 무는 것을 실측으로 갈랐다(검증 12항)
605c336 KAN-079 S7 — 게이트를 래칫이라고 말하는 자리를 전수로 고친다
e92e6f4 KAN-079 S9 — 판정 불가가 위반의 도피처가 되는 것을 「무는 대신 가른다」
f4680ba KAN-079 S5·S6 — 자가검사가 판정 방식을 보고, 기준선이 무는 판정 칸을 담을 수 없게 된다
bb98214 KAN-079 배치1(S2·S3·S4) — 토큰 게이트를 하드월로: 절대 0 판정 · 무는 자리 전량 지목 · --update-baseline 이 위반을 굳히는 문 차단
da57090 KAN-079 계획 리포트 — kanban-report 명세·teacher voice 로 집필한 초안과 렌더 산출물
4b3b094 KAN-079 배치 계획 3장 — 단일 에이전트 순차안 채택(유저 선택 2026-09-04): 배치1 S2·S3·S4 · 배치2 S5·S6·S9 · 배치3 S7·S8
1f2a087 KAN-079 S1 — 실행 문서 신설(전략·WBS 9work·검증)과 착수 조건 실측: 제외분 뺀 위반 0 · 드리프트 0, 남은 무는 4건은 전부 제외 파일 viz.css
d347f55 kanban: KAN-079-1QVHJ2 를 진행 중으로 — 토큰 게이트 하드월 승격 착수
```

**변경 파일 23개 (+1758 −159)**

| 파일 | 상태 | 추가 | 삭제 |
|---|:--:|---:|---:|
| `.kanban/archive.jsonl` | M | 1 | 0 |
| `.kanban/log.md` | M | 1 | 1 |
| `.kanban/state.json` | M | 24 | 16 |
| `CLAUDE.md` | M | 31 | 11 |
| `KANBAN.batches/KAN-079-1QVHJ2.batch1.md` | M | 105 | 0 |
| `KANBAN.batches/KAN-079-1QVHJ2.batch2.md` | M | 98 | 0 |
| `KANBAN.batches/KAN-079-1QVHJ2.batch3.md` | M | 72 | 0 |
| `KANBAN.board.html` | M | 4 | 4 |
| `KANBAN.cards/KAN-079-1QVHJ2.md` | M | 212 | 0 |
| `KANBAN.md` | M | 12 | 10 |
| `KANBAN.reports/KAN-079-1QVHJ2.draft.md` | M | 116 | 0 |
| `KANBAN.reports/KAN-079-1QVHJ2.report.html` | M | 571 | 0 |
| `design-concept/DESIGN_CONCEPT.md` | M | 2 | 1 |
| `design-concept/UI_CONSISTENCY_AUDIT.md` | M | 40 | 5 |
| `scripts/check-recognize-invariant.ts` | M | 2 | 2 |
| `scripts/lib/tokens/baseline.ts` | M | 245 | 70 |
| `scripts/lib/tokens/color.ts` | M | 1 | 1 |
| `scripts/lib/tokens/docrule.ts` | M | 6 | 6 |
| `scripts/lib/tokens/fallback.ts` | M | 2 | 2 |
| `scripts/lib/tokens/selftest.ts` | M | 160 | 6 |
| `scripts/lib/tokens/types.ts` | M | 1 | 1 |
| `scripts/tokens-baseline.json` | M | 14 | 1 |
| `scripts/verify-tokens.ts` | M | 38 | 22 |

**롤백 태그 12개**

```text
kan/KAN-079-1QVHJ2/S1
kan/KAN-079-1QVHJ2/S2
kan/KAN-079-1QVHJ2/S3
kan/KAN-079-1QVHJ2/S4
kan/KAN-079-1QVHJ2/S5
kan/KAN-079-1QVHJ2/S6
kan/KAN-079-1QVHJ2/S7
kan/KAN-079-1QVHJ2/S8
kan/KAN-079-1QVHJ2/S9
kan/KAN-079-1QVHJ2/batch1
kan/KAN-079-1QVHJ2/batch2
kan/KAN-079-1QVHJ2/batch3
```

## 2. 검증 — 기준과 실행 결과

<!-- 기준은 카드 실행 문서 「검증」 절의 사본이다. 정본은 KANBAN.cards/KAN-079-1QVHJ2.md 이므로
     기준이 바뀌면 그쪽을 고치고 review-init --refresh 로 이 항만 다시 뜬다.
     결과는 착수한 쪽이 이미 돌린 것이다 — 검토자에게 다시 돌리라고 시키지 않는다.
     **다시 돌려 아래와 다르게 나오면 그 자체가 반려 사유다.** -->

**기준**

<!-- 무엇을 실행해 무엇이 나오면 이 카드가 끝난 것인가. -->

**게이트가 무는가.** 위반을 일부러 심고 지웠을 때 판정이 갈려야 한다 — 통과만 확인하면
죽은 게이트와 다 갚은 게이트가 같은 모양이 된다(이 게이트가 자가검사를 두는 이유와 같다).

```bash
bun run tokens:verify                       # 종료코드 0 · 마지막 줄 「✓ 토큰 게이트 통과」
# 임의 .astro 에 `color: #123456` 한 줄을 심고
bun run tokens:verify; echo "exit=$?"       # 종료코드 1 · 그 파일:줄이 실패 목록에 뜬다
bun run tokens:verify --update-baseline; echo "exit=$?"   # 비0 · 기준선 파일이 안 바뀐다
git diff --stat scripts/tokens-baseline.json              # 비어 있어야 한다
# 심은 줄을 되돌리고
bun run tokens:verify                       # 다시 0
```

**기준선을 지워도 무는가.** 래칫 시절에는 기준선이 없으면 「아무것도 안 문다」였다 —
그 갈래를 그대로 두면 **파일을 지우는 것이 곧 게이트를 끄는 것**이 된다.

```bash
mv scripts/tokens-baseline.json /tmp/bl.json
# 위반 한 줄을 심고
bun run tokens:verify                       # 종료코드 1 — 「기준선이 없다」는 note 로만 뜬다
mv /tmp/bl.json scripts/tokens-baseline.json
```

**인라인 숫자값의 원문이 병기되는가.** 안 그러면 「고치는 법」이 소스에서 grep 되지 않는
값을 가리킨다(KAN-073 S5 가 밟은 자리다).

```bash
# 임의 .tsx 에 style={{ padding: 18 }} 를 심고
bun run tokens:verify | grep "→"            # `padding: 18(→18px)` 꼴이어야 한다
```

**옛 판정이 안 움직였는가.** 이 카드는 인식층을 안 건드리므로 증분이 정확히 0 이어야 한다.
`--before` 는 사람이 고른 기준 커밋의 스냅샷이 필요하다(이 카드에서는 `S1` 태그).

```bash
git stash && bun scripts/verify-tokens.ts --json --no-self-test > /tmp/before.json && git stash pop
bun run tokens:invariant -- --before /tmp/before.json --self-test    # 종료코드 0
```

**게이트가 작아지지 않았는가.** `selfTestFaults` 가 `S5` 만큼 오르고 그보다 줄면 실패한다.

```bash
bun run tokens:verify | grep '자가검사'      # 고장 종수가 기준선과 같거나 크다
```

**갱신이 결정론인가.**

```bash
bun run tokens:verify --update-baseline && git diff --stat scripts/tokens-baseline.json
```

**빌드 회귀.**

```bash
bun run build                                # 통과
```

**문서가 게이트와 같은 말을 하는가.**

```bash
grep -rn "래칫" CLAUDE.md design-concept/UI_CONSISTENCY_AUDIT.md scripts/verify-tokens.ts scripts/lib/tokens/
```

남은 「래칫」이 **이력 서술과 `selfTestFaults` 뿐**이어야 한다 — 지금의 판정 방식을 래칫이라고
말하는 자리가 하나도 없어야 한다. `selfTestFaults` 는 승격 뒤에도 진짜 래칫이므로 예외다.
남긴 자리는 `S7` 이 목록으로 낸다.

**CI 는 안 고쳤다.** `git diff --stat .github/` 가 비어 있어야 한다 — 하드월이 배포를
멈추는 것은 의도한 의미이므로 워크플로를 손보는 것이 이 카드의 일이 아니다.

**실행 결과**

```text
카드 「검증」 절 12항 — 전부 통과 (2026-09-04, 이 브랜치에서 실행)

 ① bun run tokens:verify                exit 0 · 「✓ 토큰 게이트 통과」
 ② 위반 한 줄 주입 후 같은 명령          exit 1 · src/components/PostNav.astro:115 color: #123456 — 위반
 ③ 그 상태에서 --update-baseline        exit 1 · git diff --stat scripts/tokens-baseline.json 비어 있음
 ④ 기준선 파일을 치우고 위반 주입        「무는 판정 1건」으로 여전히 뭄(래칫이면 안 물던 자리)
 ⑤ 주입한 줄을 되돌린 뒤                exit 0
 ⑥ .tsx 에 style={{ padding: 18 }} 주입  「padding: 18(→18px)」로 원문 병기됨
 ⑦ tokens:invariant --before <S1 스냅샷> --self-test
                                        exit 0 · 옛 판정 5222건이 열 필드 키로 그대로 · 새·옛 교집합 0 · 겹침 가드 셋 생존
 ⑧ 자가검사                             고장 18종(사유 18가지) + 판정 방식 검사 4종
 ⑨ --update-baseline 두 번 실행          두 번째 결과가 첫 번째와 바이트 동일(결정론)
 ⑩ bun run build                        46 page(s) built in 2.60s · 회귀 없음
 ⑪ git diff --stat main..HEAD -- .github/  비어 있음(CI 워크플로 무수정)
 ⑫ grep -rn "래칫"                      남은 32자리가 전부 이력 서술 또는 selfTestFaults·selfTestGuards 래칫

가드를 하나씩 죽여 빨개지는 것까지 확인했다(KAN-075 규약).
 · hardwall 이 기준선 있을 때 안 물게 → 자가검사 ④(hardwall-ignores-baseline) 발화
 · 갱신 문이 항상 통과하게              → 자가검사 ④(baseline-update-gate) 발화
 · 진입점이 그 문을 안 부르게            → 자가검사 ④(entry-wires-the-gate) 발화
 · writeBaseline 에 무는 판정 칸을 실어 호출 → throw

이 검토서의 경고 둘은 확인했고 아래와 같다.
 · 「커밋 9건 중 8건에 카드 id 가 없다」 — 커밋 메시지에 `KAN-079` 로만 적고 뒤 6자를 뺐다.
   base(ae5949c)는 이 브랜치가 갈라져 나온 바로 그 커밋이라 남의 변경은 안 섞였다.
 · 「변경 파일 2개가 scope 밖」 — S7 의 전수 스윕이 design-concept/DESIGN_CONCEPT.md 와
   scripts/check-recognize-invariant.ts 까지 짚어서 나온 것이다. 카드 문서 frontmatter 의
   scope 에 둘을 보탰다(KANBAN.cards/KAN-079-1QVHJ2.md:5).
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
python3 scripts/kanban.py review-judge <project-root> --card KAN-079-1QVHJ2 --item <번호> --verdict 승인
# 추가 의견
python3 scripts/kanban.py review-note <project-root> --card KAN-079-1QVHJ2 --item <번호> --text "<추가 의견>"
# 추가 의견을 반영하다 새 의견이 생겼으면 (맨 뒤에 붙어 앞 번호가 안 밀립니다)
python3 scripts/kanban.py review-item <project-root> --card KAN-079-1QVHJ2 --add "<주제>
  <상세>"
```

**전체 승인은 살아있는 항목이 전부 승인일 때만 섭니다**(철회는 분모에서 빠집니다). 하나라도
반려·추가 의견·미정이면 4항의 전체 승인도 `→ 완료` 이동도 종료코드 14로 거부됩니다.

- [ ] 기준선 파일에 정보 집계(준수 4,251 · 판정 불가 894 · 정당한 예외 14)를 계속 두기로 했다 — 동의하는가
    - **상세** — 카드가 「정할 것 ①」로 남긴 항목이다. 승격 전 기준선(scripts/tokens-baseline.json)은 「지금 부채가 몇 건인가」를 적어 두고 그것과 비교해 통과를 판정하는 장부였는데, 이제 판정에 안 쓰인다. 그러면 그 파일에 남은 숫자들이 무엇을 하느냐가 문제가 된다.
      선택지는 둘이었다. (가) 다 지우고 게이트 자신의 크기(자가검사 종수)와 파일 수만 남긴다 (나) 정보로 계속 둔다. (나)를 골랐다.
      근거: 판정 불가 894건이 위반의 도피처가 될 수 있는데(아래 3번 항목), 그 수를 어디에도 안 적어 두면 늘어나는 것을 볼 자리가 아예 없어진다. 그리고 인식층을 넓힌 커밋이 준수·판정 불가를 얼마나 움직였는지가 남는 자리도 이 파일의 diff 뿐이다.
      대가: 인식층을 손댈 때마다 이 파일이 함께 바뀌므로 커밋에 잡음이 하나 는다.
      근거 위치: scripts/lib/tokens/baseline.ts:36 (「기준선 파일이 승격 뒤에 하는 일 셋」 주석) · 파일 자체는 scripts/tokens-baseline.json

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] -update-baseline 을 이름은 그대로 두고 「위반이 있으면 거부」로만 막았다 — 동의하는가
    - **상세** — 카드가 「정할 것 ②」로 남긴 항목이다. `--update-baseline` 은 게이트에 붙은 명령줄 옵션으로, 기준선 파일을 지금 수로 다시 쓴다. 래칫 시절에는 부채를 갚아 줄어든 수를 굳히는 것이 이 옵션의 일이었다.
      문제: 하드월에서는 이 옵션이 게이트를 피하는 유일한 길이 된다. 위반 하나를 넣고 이 옵션을 부르면 그 위반이 기준선에 「정상」으로 박힌다.
      한 것 셋 — ① 무는 판정이 있으면 아무것도 안 쓰고 비0 으로 끝난다(scripts/verify-tokens.ts:103 의 UPDATE_BASELINE 블록) ② 그 판정을 게이트 본체와 같은 함수로 한다(scripts/lib/tokens/baseline.ts:341 의 refuseBaselineUpdate 가 판정과 같은 biting 을 쓴다 — 두 벌이면 언젠가 한쪽만 고쳐진다) ③ 파일을 쓰는 함수 자체가 무는 판정 칸이 실린 기준선을 거부한다(throw). 배선이 지워져도 남는 불변식이다.
      안 한 것: 옵션 이름을 안 바꿨다. 역할이 「부채를 굳힌다」에서 「정보를 새로 잰다」로 바뀌었으니 이름도 그래야 한다는 견해가 있을 수 있다. 안 바꾼 이유는 손에 익은 명령이고 문서·커밋 메시지 여러 곳이 이 이름을 부르기 때문이다.
      정할 것: 이름을 그대로 두는 것에 동의하는가. 바꾸는 쪽을 원하면 고칠 자리는 scripts/verify-tokens.ts:59 (인자 파싱)과 같은 파일 33행(머리주석 사용법)이다.

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 판정 불가 894건이 위반의 도피처가 되는 것을 「실패로 물지 않고 가르기만」 하기로 했다 — 동의하는가
    - **상세** — 카드가 「정할 것 ③」으로 남긴 항목이고, 이 카드에서 가장 판단이 필요한 자리다.
      무엇이 문제냐: 게이트가 「위반이 하나라도 있으면 실패」가 되면, 통과하는 가장 짧은 길이 값을 고치는 것이 아니라 그 값을 「판정 불가」로 옮기는 것이 된다. 판정 불가는 「규칙도 토큰도 없어서 옳고 그름을 물을 수 없는 자리」이고 지금 894건 있다. 예외 쪽은 근거 문서 위치를 필수로 요구하고 예외 목록 자체를 검사해 막혀 있는데(scripts/verify-tokens.ts:66 의 validateExceptions), 판정 불가에는 그 문이 없다.
      왜 실패로 못 무는가: 「판정 불가가 늘었다」는 정상 신호이기도 하다. 게이트가 보는 범위를 넓히면 그 수가 정당하게 오르고, width 200px 을 100% 로 바꾸는 평범한 작업도 올린다. 실패로 두면 그런 커밋이 전부 배포를 멈춘다.
      한 것: 무는 대신 가른다. 기준선이 「게이트가 본 범위」를 재는 잣대 셋(파일 수 · 판정 수 · 인식 갈래 목록)을 함께 들고, 판정 불가가 늘었을 때 그 셋이 하나라도 움직였으면 「새로 들어온 값」으로 읽고, 하나도 안 움직였으면 「있던 판정이 옮겨간 것」이라고 표식과 함께 말한다. 실측 둘 — 토큰 쓰던 padding 을 5% 로 바꾸면 표식이 붙고, 같은 자리에 gap 5% 를 더하면(판정 수 5159→5160) 안 붙는다.
      남는 구멍: 「새 판정 불가가 어느 규칙에서 나왔는가」는 못 센다. 그것을 세려면 판정 사유를 키로 써야 하는데 사유는 산문이라 문구만 다듬어도 키가 바뀐다(scripts/check-recognize-invariant.ts:57 이 같은 이유로 사유를 대조 키에서 뺐다). 닫으려면 판정에 구조화된 필드를 새로 세워야 하고 그것은 축 모듈 셋을 전부 손대는 별건이다.
      정할 것: 이 절반을 받아들이고 나머지를 후속 카드로 둘 것인가, 아니면 이 카드에서 끝까지 갈 것인가. 추천은 후속 카드다 — 이 카드가 이미 CI 를 멈출 수 있는 변경이라 되돌릴 단위를 키우고 싶지 않다.
      근거 위치: design-concept/UI_CONSISTENCY_AUDIT.md:694 (§6-16 「절반만 막았다」) · 규칙 요약은 CLAUDE.md:165 의 「하드월을 피하는 길이 하나 열려 있다」 불릿 · 구현은 scripts/lib/tokens/baseline.ts:97

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] CI 워크플로를 한 글자도 안 고쳤다 — 하드월이 배포를 멈추는 것을 그대로 둔다. 동의하는가
    - **상세** — 사실관계: .github/workflows/main.yml:78 에서 이 게이트가 build 잡 안 astro build(같은 파일 93행) 앞에 돌고, 배포 잡이 needs: build(같은 파일 110행)로 물려 있다. 그래서 승격 뒤 위반이 하나라도 들어오면 사이트 배포까지 멈춘다.
      그리고 그 워크플로는 main 푸시와 수동 실행에서만 돈다(.github/workflows/main.yml:3-7, 실측). 그래서 이 카드가 도는 동안 CI 는 조용했고, 하드월이 실제로 배포를 잡는 것은 이 브랜치를 main 에 병합한 뒤다.
      완화 선택지가 있긴 했다 — 게이트를 별도 잡으로 빼서 배포와 분리하거나, CI 에서만 --warn-only 로 돌리는 것. 둘 다 안 했다: 그러면 「위반 하나가 배포를 멈춘다」는 성질이 사라지고 승격이 이름만 남는다.
      정할 것: 병합 뒤 첫 위반이 배포를 멈추는 것을 감수할 것인가. 감수하지 않으려면 지금이 아니라 별도 카드로 워크플로 구조를 바꾸는 것이 맞다.

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 자가검사에 「판정 방식 검사」 넷을 픽스처가 아닌 방식으로 넣었다 — 규약에서 벗어난 것이 맞는가
    - **상세** — 기존 규약: 이 게이트의 자가검사는 고장 난 소스 파일(픽스처)을 임시 디렉터리에 얹고 게이트가 그것을 잡는지 본다. 지금 18종이고 scripts/fixtures/tokens/faults/ 에 있다.
      문제: 그 18종은 전부 「판정기가 이 리터럴을 잡는가」를 본다. 게이트가 하드월에서 래칫으로 되돌아가거나, 기준선 갱신이 다시 위반을 굳히는 문이 되거나, 진입점이 그 문을 안 부르게 되면 — 셋 중 무엇이 일어나도 18종은 전부 초록이다. 리터럴은 여전히 잡히기 때문이다.
      한 것: 넷째 검사로 판정 방식 검사 4종을 넣었다(scripts/lib/tokens/selftest.ts:115 의 GUARDS). 파일을 얹는 대신 합성 판정을 판정 함수에 직접 넣고, 넷째 하나는 진입점 소스를 읽어 배선을 본다 — 함수가 살아 있어도 안 부르면 문이 없고, 그 배선은 함수 호출로 못 잰다. 같은 규약을 쓴 선례가 이 레포에 있다(scripts/compare-render.ts 의 selfTestEnding, KAN-078).
      대가: 자가검사가 두 종류가 됐다(픽스처 18 + 합성 4). 읽는 사람이 「자가검사」라는 말 아래 성질이 다른 둘을 봐야 한다. 그 대신 각각의 수를 기준선이 따로 들어 어느 쪽이 줄어도 실패한다(scripts/lib/tokens/selftest.ts:219 의 GUARD_COUNT).
      정할 것: 이 이원화를 받아들일 것인가.

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 착수 전에 main 에 커밋 하나(ae5949c)를 직접 밀었다 — 사후 승인을 청한다
    - **상세** — 무엇을 했나: 카드 착수 직전 main 체크아웃에 보드 스냅샷(.kanban/state.json)과 보드 화면(KANBAN.board.html) 2줄짜리 미커밋 변경이 남아 있었다. 지난 커밋에서 KAN-083 의 컬럼 인덱스가 어긋난 것을 이번 세션의 reconcile 이 되돌린 결과다. 그것을 커밋해 main 에 푸시하고 그 위에서 워크트리를 만들었다.
      왜: 새 워크트리는 메인 체크아웃의 미커밋 변경을 보지 못한다. 그대로 두면 카드 브랜치와 main 이 같은 파일에서 갈라진 채로 진행되고, 병합할 때 그 두 줄이 충돌 후보가 된다.
      범위 문제: 「KAN-079 수행」이라는 지시가 main 에 대한 커밋·푸시까지 포함한다고 보기는 어렵다. 카드 범위 밖의 공유 상태 변경이다.
      같은 자리에 손대지 않은 것도 있다: raws/talks/_prep/ 의 유저 작성 파일 3개(README.md 수정 1 · 미추적 2)는 그대로 뒀다. 이 카드 범위 밖이고 내용이 유저 것이다.
      정할 것: 이 푸시를 승인할 것인가, 되돌릴 것인가. 되돌리려면 git revert ae5949c 이지만 그러면 보드 스냅샷이 다시 어긋난 상태로 돌아간다. 근거 위치: git show ae5949c

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
     `review-judge --card KAN-079-1QVHJ2 --verdict 승인` 이 이 자리를 쓰고
     frontmatter 의 status 도 함께 고친다. 손으로 적어도 되지만, 그때는 수렴 검사를
     안 거치므로 `validate` 가 항목 판정과 어긋난 승인을 error 로 잡는다. -->

**판정**: (아직 없습니다)

**판정 이력**:

- 승인이면 → `apply --op move --id KAN-079-1QVHJ2 --to done` 뒤에 `main` 병합과 워크트리 정리(출력의 `cleanup`)
- 반려면 → `apply --op move --id KAN-079-1QVHJ2 --to doing` 뒤에 `doc-log --entry "<반려 사유>"`.
  요청서는 **지우지도 다시 뜨지도 않는다** — 고친 뒤 그 항목을 `review-judge --verdict 승인` 으로
  뒤집으면 같은 문서에서 수렴한다. 1·2항이 낡았으면 `review-init --refresh` 로 그 두 항만 간다.
