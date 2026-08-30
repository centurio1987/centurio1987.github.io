---
card: KAN-077-RA2SYG
title: 게이트 회피 경로를 막는다 — 상수로 끌어올린 리터럴 15건을 판정에 넣는다
created: 2026-08-30
branch: KAN-077-RA2SYG
worktree: /Users/centurio/orca/workspaces/centurio1987.github.io/KAN-077-RA2SYG
base: 3b355f8
status: 검토 대기
---

# KAN-077-RA2SYG 검토 요청 — 게이트 회피 경로를 막는다 — 상수로 끌어올린 리터럴 15건을 판정에 넣는다

카드: [KAN-077-RA2SYG.md](../KANBAN.cards/KAN-077-RA2SYG.md)

> 이 문서는 **검토를 위한 산출물**이다. 수행 내역은 카드 실행 문서에 있고, 착수 전
> 계획은 배치 문서에 있다. 여기 있는 것은 "지금 이 브랜치를 무엇으로 판정하는가" 뿐이다.

## 1. 검토 대상

| 항목 | 값 |
|---|---|
| 브랜치 | `KAN-077-RA2SYG` |
| 워크트리 | `/Users/centurio/orca/workspaces/centurio1987.github.io/KAN-077-RA2SYG` |
| 베이스 | `3b355f8` |
| 변경 훑기 | `git diff 3b355f8...HEAD` |

**커밋 3건**

```text
8e6db31 S7+S6+S8: 부채 15건 처분 · 문서 셋 — 래칫 0, 인식 갈래 여섯 완결 (KAN-077-RA2SYG)
f49dd80 S1~S5: 상수로 올린 리터럴을 판정에 넣는다 — 옛 히트 증분 0 · 새 기준선 드리프트 10 · 위반 5 (KAN-077-RA2SYG)
77a8fd4 kanban: KAN-077-RA2SYG 진행 중으로 이동 (KAN-077-RA2SYG)
```

**변경 파일 23개 (+511 −88)**

| 파일 | 상태 | 추가 | 삭제 |
|---|:--:|---:|---:|
| `.kanban/archive.jsonl` | M | 1 | 0 |
| `.kanban/log.md` | M | 1 | 1 |
| `.kanban/state.json` | M | 12 | 19 |
| `CLAUDE.md` | M | 20 | 5 |
| `KANBAN.board.html` | M | 4 | 4 |
| `KANBAN.cards/KAN-077-RA2SYG.md` | M | 73 | 22 |
| `KANBAN.md` | M | 8 | 7 |
| `design-concept/UI_CONSISTENCY_AUDIT.md` | M | 37 | 0 |
| `scripts/fixtures/tokens/faults/cases/const-ref-drift.tsx` | M | 13 | 0 |
| `scripts/fixtures/tokens/faults/cases/const-ref.tsx` | M | 13 | 0 |
| `scripts/lib/tokens/extract.ts` | M | 2 | 1 |
| `scripts/lib/tokens/recognize/constRef.ts` | M | 239 | 0 |
| `scripts/lib/tokens/recognize/styleNum.ts` | M | 9 | 4 |
| `scripts/lib/tokens/types.ts` | M | 7 | 1 |
| `scripts/tokens-baseline.json` | M | 3 | 3 |
| `src/components/posts/osi-7-layers-3/HopJourney.tsx` | M | 4 | 1 |
| `src/components/posts/osi-7-layers-3/RoutingTableLab.tsx` | M | 4 | 1 |
| `src/components/posts/osi-7-layers-4/HandshakeLab.tsx` | M | 11 | 4 |
| `src/components/posts/osi-7-layers-4/SlidingWindowLab.tsx` | M | 9 | 2 |
| `src/components/posts/osi-7-layers-5/EncodingLab.tsx` | M | 9 | 2 |
| `src/components/posts/osi-7-layers-5/TlsHandshakeLab.tsx` | M | 11 | 4 |
| `src/components/posts/osi-7-layers-6/DnsResolveLab.tsx` | M | 11 | 4 |
| `src/components/posts/osi-7-layers-6/RequestJourneyLab.tsx` | M | 10 | 3 |

**롤백 태그 0개** — 없음(`--tags` 를 넘기지 않았거나 아직 태그가 없습니다)

## 2. 검증 — 기준과 실행 결과

<!-- 기준은 카드 실행 문서 「검증」 절의 사본이다. 정본은 KANBAN.cards/KAN-077-RA2SYG.md 이므로
     기준이 바뀌면 그쪽을 고치고 review-init --refresh 로 이 항만 다시 뜬다.
     결과는 착수한 쪽이 이미 돌린 것이다 — 검토자에게 다시 돌리라고 시키지 않는다.
     **다시 돌려 아래와 다르게 나오면 그 자체가 반려 사유다.** -->

**기준**

착수한 쪽이 **먼저 돌리고 결과를 검토서에 싣는다.** 검토자에게 다시 시키지 않는다.
아래는 S8 이 실제로 돌린 결과다.

| # | 명령 | 통과 기준 | 결과 |
| --- | --- | --- | --- |
| 1 | `bun run tokens:verify` | 종료 0 · 자가검사 14종·14사유 · 기준선과 같다 | **통과** — 래칫 위반 0 · 드리프트 0 |
| 2 | `bun run tokens:invariant -- --before <착수 직전 스냅샷> --self-test` | 옛 히트 증분 **0** · 겹침 **0** · 가드 자가검사 | **통과 (기준점 주의 — 아래)** |
| 3 | 인식기 죽이기 | `RECOGNIZERS` 에서 `constRef` 를 빼면 게이트가 빨개진다 | **통과** — 고장 14 → 12 로 `selfTestFaults` 래칫이 물었다 |
| 4 | 회피 경로 재현 | 값을 인라인에서 `const` 로 올려도 게이트가 문다 | **통과** — `#ab12cd` 를 `const PROBE` 로 올렸더니 **선언 줄**(`EncodingLab.tsx:30`)을 위반으로 지목했다 |
| 5 | `bun run build` | 종료 0 | **통과** — 46쪽 |
| 6 | `bunx tsc --noEmit` | 고친 파일 에러 0 | **통과** — 남은 3건은 선행 상태(`s2-declared-layers.ts` 2 · `baseline.ts:167` 1, 둘 다 이 카드가 안 건드린 파일) |
| 7 | `bun run render:compare` | 의도한 변경분 외 0 | **통과** — 지면 4곳 중 **EP5·EP6 에서 `background-color` 28건만** 움직였다(`rgb(229,240,237)` → `rgb(234,237,232)`). 문서 높이·기하 변화 0 |
| 8 | `git diff --stat -- src/` | S7 이 고친 8파일과 정확히 같을 것 | **통과** — 8파일 |
| 9 | `viz:verify` · `deco:verify` · `talk:verify` · `width:verify` · `check-post-markers` · `check-emphasis`(+`--dist`) | 전부 종료 0 | **통과** — 7종 전부 |

**2번의 기준점은 HEAD 가 아니라 `S5` 커밋(`f49dd80`)이다.** 이 하네스는 「인식층을 넓혔는데
옛 집합이 안 움직였는가」를 묻는데, `S7` 이 그 뒤에 `src/` 값을 **일부러** 바꿨으므로 HEAD 에서
돌리면 ①이 「빠짐 363 · 늘음 373」으로 빨개진다 — 그것은 고장이 아니라 부채를 갚은 흔적이다.
재현은 그 커밋을 detached 워크트리로 꺼내 돌린다:

```
git worktree add --detach /tmp/kan077-s5 f49dd80
cd /tmp/kan077-s5 && bun scripts/check-recognize-invariant.ts --before /tmp/kan077-before.json --self-test
```

착수 직전 스냅샷 뜨는 법(2번):

```
bun scripts/verify-tokens.ts --json --no-self-test > /tmp/kan077-before.json
```

**`graph:verify` 는 이 카드의 통과 기준이 아니다.** 재생성이 main 워크트리 전용이라
카드 브랜치에서 못 돌리고, `src/data/`·`src/content/` 를 안 건드리므로 이 카드가 만든
상태가 아니다(KAN-072 배치5 가 같은 사유로 뺐다).

**실행 결과**

```text
1. tokens:verify               exit 0 — 자가검사 정상 1 + 고장 14종·사유 14가지 · 「기준선과 같다」
                               래칫 기준: 위반 0 · 드리프트 0 · 정당한 예외 10 · 준수 3649 · 판정 불가 1130
2. tokens:invariant            exit 0 (기준점 = S5 커밋 f49dd80, HEAD 아님 — S7 이 그 뒤 src/ 를 일부러 고쳤다)
                               ① 옛 판정 4841건이 열 필드 키로 그대로 ② 새 판정 15건과 옛 히트의 (file,line,value) 교집합 0 ③ 겹침 가드 자가검사 통과
3. 인식기 죽이기               ✗ 로 빨개짐(기대대로) — RECOGNIZERS 에서 constRef 제거 시 고장 14 → 12 로 selfTestFaults 래칫이 물었다
4. 회피 경로 재현              ✗ 로 빨개짐(기대대로) — #ab12cd 를 const PROBE 로 올렸더니 EncodingLab.tsx:30(선언 줄)을 위반으로 지목
5. build                       exit 0 — 46쪽
6. tsc --noEmit                고친 파일 에러 0 (남은 3건은 선행 상태: s2-declared-layers.ts 2 · baseline.ts:167 1)
7. render:compare              지면 4곳 중 EP5·EP6 에서 background-color 28건만 이동 (rgb(229,240,237) → rgb(234,237,232))
                               문서 높이·기하 변화 0. EP3 은 무변경(TEAL_TINT 가 이미 6% color-mix), EP4 는 하네스가 active 상태 미도달
8. git diff --stat -- src/     8파일 (+69 −21) — S7 이 고친 목록과 정확히 같다
9. 나머지 게이트 7종           viz:verify · deco:verify · talk:verify · width:verify · check-post-markers · check-emphasis · check-emphasis --dist  전부 exit 0
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
python3 scripts/kanban.py review-judge <project-root> --card KAN-077-RA2SYG --item <번호> --verdict 승인
# 추가 의견
python3 scripts/kanban.py review-note <project-root> --card KAN-077-RA2SYG --item <번호> --text "<추가 의견>"
# 추가 의견을 반영하다 새 의견이 생겼으면 (맨 뒤에 붙어 앞 번호가 안 밀립니다)
python3 scripts/kanban.py review-item <project-root> --card KAN-077-RA2SYG --add "<주제>
  <상세>"
```

**전체 승인은 살아있는 항목이 전부 승인일 때만 섭니다**(철회는 분모에서 빠집니다). 하나라도
반려·추가 의견·미정이면 4항의 전체 승인도 `→ 완료` 이동도 종료코드 14로 거부됩니다.

- [ ] SAND 5자리를 var(--field-dst) 로 모은 것이 맞는가 — 값은 똑같은데 그 토큰의 뜻이 다르다
    - **상세** — 무엇을 정하는가. 「OSI 7계층」 시리즈 3~6화의 글 안 시뮬 여섯 곳이 모래색 테두리 #e8c97a 를 「이 구간은 평문이다 / 캐시에 없다」는 뜻으로 쓴다(청록 테두리가 그 반대다). 그 색을 지금까지 파일마다 const SAND = "#e8c97a" 로 적어 뒀는데, 그것이 곧 이 카드가 막으려는 회피 경로였다. 옮길 곳을 골라야 한다.
      무엇을 했나. 토큰 var(--field-dst) 로 모았다(src/styles/tokens.css:124). **값이 한 비트도 안 달라 화면이 그대로다** — render:compare 가 이 색으로는 차이 0 을 냈다.
      대가는 무엇인가. 그 토큰의 원래 뜻이 다르다. --field-dst 는 2화의 이더넷 프레임 그림에서 「목적지 MAC 주소 칸」을 칠하는 색이다(src/components/posts/osi-7-layers-2/FrameAnatomy.tsx:38). 즉 **한 이름이 두 뜻을 지게 되고**, 나중에 그 프레임 그림의 색표를 다시 고르면 3~6화의 테두리가 같이 움직인다. 그것을 막는 장치는 없다.
      왜 다른 길을 안 갔나. 뜻이 정확히 맞는 토큰은 --fate-direct-border(「평문 직결」, src/styles/tokens.css:136)인데 색이 ΔRGB 24.4 만큼 멀다 — 발행된 글 넷의 테두리 색을 눈에 띄게 바꾸는 일이라 「색차 15 이상은 임의로 고르지 않는다」는 이 레포의 규약에 걸린다(KANBAN.cards/KAN-072-CPJCT1.md 의 배치5 판정). 새 토큰을 세우는 길도 막혀 있다 — 같은 값에 이름이 둘이 되기 때문이고, 그것이 KAN-072 가 --state-* 를 안 세운 이유다. 값이 같을 때 그냥 var() 로 치환한 선례도 그 카드에 있다(const OK=#3E6B4F → --cat-planning).
      정할 것. 값 동일을 우선한 이 선택에 동의하는지. 추천은 그대로 두는 것입니다 — 다른 두 길은 각각 발행된 글의 화면을 바꾸거나 레포 규약을 어깁니다.

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] TEAL_TINT 5자리를 기존 관용구로 모은 것이 맞는가 — 발행된 글 두 편의 배경색이 실제로 바뀐다
    - **상세** — 무엇을 정하는가. 같은 시뮬 여섯 곳이 아주 옅은 청록 배경 #e5f0ed 를 「지금 활성이다 / 암호화됐다」는 뜻으로 쓴다. 세 색 중 유일하게 값이 같은 토큰이 아예 없는 값이다.
      무엇을 했나. 새 토큰을 세우는 대신 **이 시리즈가 이미 쓰고 있는 표현**으로 모았다 — color-mix(in srgb, var(--cat-skills) 11%, var(--surface-hi)). 그 표현은 이미 일곱 자리에 있다: src/components/posts/osi-7-layers-1/EncapsulationLab.tsx:57 · osi-7-layers-1/LayerTriage.tsx:128 · osi-7-layers-2/SwitchLearningLab.tsx:123 · osi-7-layers-3/HopJourney.tsx:110 · osi-7-layers-3/RoutingTableLab.tsx:132 과 :160, 그리고 「인증과 인가」 시리즈 4편(src/components/posts/auth-authz-1/AuthzMap.tsx:21 등).
      대가는 무엇인가. 색이 ΔRGB 7.7 만큼 달라져 **발행된 글의 화면이 실제로 바뀐다.** 눈이 아니라 도구로 쟀다 — bun run render:compare 가 4쪽을 전수 대조해 5화·6화에서 활성 칩 배경 28자리가 rgb(229,240,237) → rgb(234,237,232) 로 바뀌는 것만 잡았다. 문서 높이도 요소 크기도 변화 0 이다. 3화는 그 자리가 이미 같은 표현(6%)이라 무변경이고, 4화는 대조 하네스가 그 활성 상태에 도달을 못 해 안 잡혔을 뿐 같은 값이 걸려 있다.
      왜 다른 길을 안 갔나. --fate-tunnel-bg(#e7efe6, src/styles/tokens.css:131)가 색으로는 더 가깝지만(Δ7.3) 「VPN 터널로 보호됨」이라는 다른 시리즈 전용 뜻이라 OSI 편에 그 뜻이 없다. 새 토큰은 같은 역할에 이름이 둘이 되는 자리다 — 관용구가 이미 일곱 자리이므로.
      정할 것. 발행된 글 두 편의 배경이 이만큼 바뀌는 것을 받아들일지. 추천은 받아들이는 것입니다 — 시리즈 안에서 같은 뜻이 두 표기로 갈려 있던 것을 하나로 모으는 변경이고, 사람 눈에는 거의 안 보이는 차이입니다.

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 인식기가 굳힌 규칙 둘 — 「선언 줄을 지목한다」와 「숫자도 본다」
    - **상세** — 무엇을 정하는가. 새 인식기(scripts/lib/tokens/recognize/constRef.ts)가 내린 설계 판단 둘이고, 앞으로 이 게이트가 사람에게 무엇을 보여줄지를 정한다.
      ① 선언 줄을 지목한다. 상수 하나가 여러 곳에서 쓰이므로 「어디를 지목할 것인가」를 골라야 했다. 실측은 선언 15개에 쓰임 18곳이다. 쓰임마다 지목하면 한 파일에서 같은 값이 두 번 세어지고(src/components/posts/osi-7-layers-3/RoutingTableLab.tsx 가 그렇다 — 테두리와 왼쪽 막대), 무엇보다 게이트의 「고치는 법」이 18줄을 가리키는데 실제로 고칠 곳은 15줄이다. 그래서 선언을 지목한다. 실제로 그렇게 도는지 확인했다 — 임시로 색 하나를 상수로 올렸더니 게이트가 선언 줄을 짚었다(카드 문서 「검증」 표 4번).
      ② 숫자도 본다. 지금 이득이 0 이다 — 상수에 담긴 숫자가 스타일 값 자리에서 쓰이는 경우가 **한 건도 없다**(전수 확인). 그런데도 본다: 안 보면 다음 사람이 const PAD = 18 을 만들어 style={{ padding: PAD }} 로 쓰는 순간 회피 경로가 그대로 다시 열린다. 이 카드가 막으려는 것이 그 **동작**이지 지금 남은 15건이 아니다.
      대가는 무엇인가. ②가 헛것을 물 위험이다. 실제로는 안 문다 — 상수에 담긴 리터럴 89개 중 71개가 스타일 값 자리 **밖**에 있고(그림 좌표·예시 데이터 같은 것들, 예: src/components/graph/GraphExplorer.tsx:76 의 W = 900), 인식기가 값 자리로만 범위를 좁히므로 그 71개는 전부 안 걸린다. 이것도 확인했다.
      정할 것. 두 규칙에 동의하는지. 추천은 그대로입니다.

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] render:compare 가 대조를 안 하고도 「전후 동일」이라고 답한다 — 어떻게 처리할까
    - **상세** — 무엇이 문제인가. 화면이 안 바뀌었음을 증명하는 도구(bun run render:compare)에 --self-test 옵션을 붙이면, **전후 비교를 한 번도 하지 않은 채** 마지막에 「✓ 전후 동일.」을 찍는다. 자가검사와 실제 대조가 갈래로 나뉘어 있는데 마지막 줄이 두 갈래 공통이기 때문이다(scripts/compare-render.ts:667 의 if/else 와 파일 끝줄).
      실제로 밟았다. 이 카드에서 --self-test 로 돌려 「전후 동일」을 받았고, 옵션을 빼고 다시 돌리니 **28건의 차이**가 나왔다. 그 사이 코드는 한 글자도 안 바뀌었다. 도구가 조용히 통과한 것이고, 그것이 이 카드가 다룬 결함과 정확히 같은 종류다.
      왜 안 고쳤나. compare-render.ts 가 **이 카드의 작업 범위 밖**이다(범위는 토큰 게이트 쪽 파일들과 이번에 색을 고친 글 여덟 편이고, 카드 문서 머리의 scope 에 적혀 있다). 범위를 말없이 넓히지 않는다는 것이 이 레포의 규율이다. 고칠 것은 한 줄이다.
      정할 것. 새 카드로 낼지, 아니면 여기서 범위를 넓혀 고칠지. 추천은 **새 카드**입니다 — 이 카드의 되돌릴 단위(인식기 + 부채 처분)와 섞이지 않습니다.

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 하드월 승격 — 조건이 이 카드로 처음 충족됐다. 다음에 할 것인가
    - **상세** — 무엇을 정하는가. 지금 토큰 게이트는 「래칫」이다 — 위반이 **늘면** 실패하고, 0 이어도 하드월(하나라도 있으면 실패)로 올리지는 않았다. 올릴 조건이 이제 처음 갖춰졌다.
      왜 지금인가. CLAUDE.md 가 정한 조건은 「위반 0」이 아니라 「**인식 범위를 다 연 뒤의** 위반 0」이었다. 승격은 네 번 미뤄졌다 — KAN-072·074·075·076 이 각각 0 을 만들었지만 그때마다 게이트가 못 보던 갈래가 새로 열려 다시 0 이 아니게 됐기 때문이다. 이 카드가 그 마지막 갈래(여섯째)를 열었고 지금 위반이 0 이다. 진단 정본(design-concept/UI_CONSISTENCY_AUDIT.md)의 §6 에 남은 13항은 지금 소스에 해당 사례가 0건이라 열 대상이 아니다.
      왜 여기서 안 했나. 하드월은 다음 위반 하나가 CI 를 빨갛게 만드는 변경이고, 이 레포는 배포가 빌드에 물려 있어 **사이트 배포까지 멈춘다.** 인식기를 넓힌 커밋과 한 덩이로 묶으면 문제가 생겼을 때 되돌릴 단위가 뭉개진다.
      정할 것. 별건 카드로 낼지. 추천은 **별건 카드**입니다.

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
     `review-judge --card KAN-077-RA2SYG --verdict 승인` 이 이 자리를 쓰고
     frontmatter 의 status 도 함께 고친다. 손으로 적어도 되지만, 그때는 수렴 검사를
     안 거치므로 `validate` 가 항목 판정과 어긋난 승인을 error 로 잡는다. -->

**판정**: (아직 없습니다)

**판정 이력**:

- 승인이면 → `apply --op move --id KAN-077-RA2SYG --to done` 뒤에 `main` 병합과 워크트리 정리(출력의 `cleanup`)
- 반려면 → `apply --op move --id KAN-077-RA2SYG --to doing` 뒤에 `doc-log --entry "<반려 사유>"`.
  요청서는 **지우지도 다시 뜨지도 않는다** — 고친 뒤 그 항목을 `review-judge --verdict 승인` 으로
  뒤집으면 같은 문서에서 수렴한다. 1·2항이 낡았으면 `review-init --refresh` 로 그 두 항만 간다.
