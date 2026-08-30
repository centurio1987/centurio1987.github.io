---
card: KAN-076-X1C8PY
title: 게이트 인식층 — 선 굵기 81건에 viewBox 를 아는 판정 규칙을 세운다
created: 2026-08-30
branch: KAN-076-X1C8PY
worktree: /Users/centurio/orca/workspaces/centurio1987.github.io/KAN-076-X1C8PY
base: 599a011
status: 검토 대기
---

# KAN-076-X1C8PY 검토 요청 — 게이트 인식층 — 선 굵기 81건에 viewBox 를 아는 판정 규칙을 세운다

카드: [KAN-076-X1C8PY.md](../KANBAN.cards/KAN-076-X1C8PY.md)

> 이 문서는 **검토를 위한 산출물**이다. 수행 내역은 카드 실행 문서에 있고, 착수 전
> 계획은 배치 문서에 있다. 여기 있는 것은 "지금 이 브랜치를 무엇으로 판정하는가" 뿐이다.

## 1. 검토 대상

| 항목 | 값 |
|---|---|
| 브랜치 | `KAN-076-X1C8PY` |
| 워크트리 | `/Users/centurio/orca/workspaces/centurio1987.github.io/KAN-076-X1C8PY` |
| 베이스 | `599a011` |
| 변경 훑기 | `git diff 599a011...HEAD` |

**커밋 3건**

```text
81c410e S6+S7: 갈림선을 문서에 박고 부채 2건 처분 — 래칫 0 (KAN-076-X1C8PY)
ef0670e S1~S5: stroke-width 를 판정에 넣는다 — 옛 히트 증분 0 · 새 기준선 위반 2 (KAN-076-X1C8PY)
cca1067 kanban: KAN-076-X1C8PY 진행 중으로 이동 (KAN-076-X1C8PY)
```

**변경 파일 17개 (+501 −58)**

| 파일 | 상태 | 추가 | 삭제 |
|---|:--:|---:|---:|
| `.kanban/archive.jsonl` | M | 1 | 0 |
| `.kanban/log.md` | M | 1 | 1 |
| `.kanban/state.json` | M | 15 | 22 |
| `CLAUDE.md` | M | 12 | 4 |
| `KANBAN.board.html` | M | 4 | 4 |
| `KANBAN.cards/KAN-076-X1C8PY.md` | M | 21 | 7 |
| `KANBAN.md` | M | 8 | 7 |
| `design-concept/DESIGN_CONCEPT.md` | M | 18 | 0 |
| `design-concept/UI_CONSISTENCY_AUDIT.md` | M | 38 | 0 |
| `scripts/fixtures/tokens/faults/cases/svg-stroke.astro` | M | 16 | 0 |
| `scripts/lib/tokens/color.ts` | M | 27 | 2 |
| `scripts/lib/tokens/exceptions.ts` | M | 10 | 0 |
| `scripts/lib/tokens/extract.ts` | M | 16 | 6 |
| `scripts/lib/tokens/recognize/svgStroke.ts` | M | 258 | 0 |
| `scripts/lib/tokens/recognize/types.ts` | M | 8 | 1 |
| `scripts/lib/tokens/types.ts` | M | 44 | 2 |
| `scripts/tokens-baseline.json` | M | 4 | 2 |

**롤백 태그 0개** — 없음(`--tags` 를 넘기지 않았거나 아직 태그가 없습니다)

## 2. 검증 — 기준과 실행 결과

<!-- 기준은 카드 실행 문서 「검증」 절의 사본이다. 정본은 KANBAN.cards/KAN-076-X1C8PY.md 이므로
     기준이 바뀌면 그쪽을 고치고 review-init --refresh 로 이 항만 다시 뜬다.
     결과는 착수한 쪽이 이미 돌린 것이다 — 검토자에게 다시 돌리라고 시키지 않는다.
     **다시 돌려 아래와 다르게 나오면 그 자체가 반려 사유다.** -->

**기준**

착수한 쪽이 **먼저 돌리고 결과를 검토서에 싣는다.** 검토자에게 다시 시키지 않는다.

| # | 명령 | 통과 기준 |
|---|---|---|
| 1 | `bun run tokens:verify` | 종료 0. `stroke / 판정 불가` 가 새로 서고 **위반·드리프트 증분 0**. 자가검사 줄이 고장 12종·사유 12가지 |
| 2 | `bun run tokens:invariant -- --before <기준 커밋 스냅샷> --self-test` | 종료 0. 옛 히트 증분 **0** · 새·옛 인식 경로 겹침 **0** · 겹침 가드 자가검사 통과 |
| 3 | `bun run build` | 종료 0. 게이트를 고쳤지 `src/**` 를 안 고쳤으므로 회귀가 나오면 그것이 곧 반려 사유다 |
| 4 | `git diff --stat -- src/` | **빈 출력.** 이 카드는 값을 하나도 안 고친다 — `src/` 가 바뀌었으면 범위를 넘은 것이다 |
| 5 | 인식기 죽이기 | `RECOGNIZERS` 에서 `svgStroke` 를 빼면 `tokens:verify` 자가검사가 **빨개져야 한다**. 안 빨개지면 그 고장은 있어 보이기만 하는 검사다(KAN-075 가 가드 하나를 그렇게 지웠다) |

기준 커밋 스냅샷 뜨는 법(2번):

```
git stash && bun scripts/verify-tokens.ts --json --no-self-test > /tmp/kan076-before.json && git stash pop
```

**`render:compare` 는 안 돌린다.** 그 하네스는 「값을 바꿨는데 화면이 안 바뀌었음」을 증명하는
것이고, 이 카드는 값을 하나도 안 바꾼다(검증 4번이 그것을 판정한다). S7 에서 실제로 값을
고치게 되면 그때 이 표에 한 줄을 더한다.

**실행 결과**

```text
[tokens:verify]
자가검사: 정상 1 + 고장 12종, 사유 12가지
stroke / 정당한 예외 6건
stroke / 판정 불가 49건
기준선과 같다.
래칫 기준(제외분 빼고 · fallback 포함 — 지금 고쳐야 할 것): 정당한 예외 10 · 준수 3639 · 판정 불가 1130
✓ 토큰 게이트 통과.

[tokens:invariant --before <착수 직전 스냅샷> --self-test]
① 옛 히트 불변 — 판정 4790건이 열 필드 키로 그대로다(옛 src css-decl · ml-decl · jsx-attr · style-obj · expr-literal · attr-css · style-num)
② 겹쳐 세지 않는다 — 새 판정 51건과 옛 히트의 (file,line,value) 교집합 0
③ 겹침 가드 둘 + 양성 대조 — 셋 다 산다(각각 하나만 죽여도 빨개지는 것까지 확인한 구성이다)
✓ 인식층 불변 검사 통과.

[bun run build]
13:31:57 [build] 46 page(s) built in 1.99s
13:31:57 [build] Complete!

[git diff --stat -- src/]
빈 출력 — src/ 를 한 글자도 안 고쳤다

[다른 게이트]
viz:verify ✓ 텍스트 넘침 없음 (글 27편 / figure 43개)
deco:verify ✓ 겹침·가로챔·오버플로 없음 (검사 50회)
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
python3 scripts/kanban.py review-judge <project-root> --card KAN-076-X1C8PY --item <번호> --verdict 승인
# 추가 의견
python3 scripts/kanban.py review-note <project-root> --card KAN-076-X1C8PY --item <번호> --text "<추가 의견>"
# 추가 의견을 반영하다 새 의견이 생겼으면 (맨 뒤에 붙어 앞 번호가 안 밀립니다)
python3 scripts/kanban.py review-item <project-root> --card KAN-076-X1C8PY --add "<주제>
  <상세>"
```

**전체 승인은 살아있는 항목이 전부 승인일 때만 섭니다**(철회는 분모에서 빠집니다). 하나라도
반려·추가 의견·미정이면 4항의 전체 승인도 `→ 완료` 이동도 종료코드 14로 거부됩니다.

- [ ] 카드가 적은 갈림선을 실측을 근거로 다시 쓴 것에 동의하는가 — 「viewBox 유무」에서 「이 길이의 단위가 CSS px 인가」로 바꿨습니다
    - **상세** — 카드 메모와 감사 정본 §6-12 는 「viewBox 유무가 갈림선」이라고 적었는데, 그 선으로는 아무것도 안 갈립니다. 스캔 범위 안 stroke-width 자리 50 이 전부 viewBox 를 가진 SVG 안에 있고 viewBox 없는 SVG 는 0개입니다. 카드가 근거로 든 예시 둘도 실측과 달랐습니다 — Doodle.astro:437 의 9 는 「화면 1~2px」이 아니라 HeroCollage.astro:144 가 width={50} 을 넘겨 5.23px(카탈로그 기본은 9px)이고, GraphExplorer.tsx:1308 은 「안 스케일되는 인라인 SVG」가 아니라 viewBox 900x640 + CSS width:100% 라 스케일됩니다(GraphExplorer.tsx:1179·1395). 다시 쓴 선은 「그 자리의 길이 1 이 CSS px 인가」이고, 근거는 배율을 호출자가 정한다는 것입니다 — <Mascot size={40}/> 면 0.238 이라 같은 소스 한 줄이 지면마다 다른 굵기로 그려집니다. 정정 원문: design-concept/UI_CONSISTENCY_AUDIT.md:587

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 사용자 단위 자리 49건을 「위반」이 아니라 「판정 불가」로 둔 판단에 동의하는가
    - **상세** — 게이트가 무는 값은 고칠 수 있어야 한다는 것이 근거입니다. SVG 안에서는 var(--stroke) 를 써도 1.5px 가 px 가 아니라 사용자 단위 1.5 로 읽혀 화면에서 1.22px 가 됩니다 — 위반으로 물면 고칠 길이 없고, 그런 위반은 예외로 덮이거나 우회당합니다. 버린 대안 둘(정적으로 아는 배율만 환산 · SVG 전용 굵기 스케일 신설)과 그 사유는 scripts/lib/tokens/recognize/svgStroke.ts 머리주석에 있습니다. 대신 부채가 0 이 되는 것이 아니라 판정 불가가 47 늘어납니다(래칫은 위반·드리프트만 뭅니다)

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] Doodle.astro 의 크레용 획 2건을 값 수정이 아니라 자리 단위 예외로 내린 것에 동의하는가
    - **상세** — 이 둘은 진짜 위반이었습니다 — 속도선(34x26)·별표(28x28) 두 SVG 가 width·height 를 viewBox 치수 그대로 박아 배율이 1 이고, stroke-width=3.2 는 진짜 3.2 CSS px 이라 3단(1·1.5·2px) 밖입니다. 3단으로 접으면 나란히 서는 두 그림의 필압이 갈리고 크레용 필터를 지난 뒤의 굵기가 UI 테두리와 같은 자가 아니라고 보아 값을 안 고쳤습니다. 예외 id 는 doodle-crayon-stroke 이고 파일이 아니라 자리 단위입니다(site: axis==stroke && value==3.2px). 근거 문서: design-concept/DESIGN_CONCEPT.md:402. 반대 선택지는 3.2 → 2(--stroke-bold) 로 접고 예외를 안 만드는 것입니다

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 자가검사가 인식기 제거를 못 잡는 것을 이 카드에서 고칠 것인가 — 다섯 인식기 전부에 해당합니다
    - **상세** — 실측입니다: RECOGNIZERS 배열에서 인식기를 빼면 자가검사가 빨개지지 않고 고장 수만 12→10 으로 줄어듭니다. 인식기가 자기 고장을 소유하는 구조(recognize/types.ts 의 FaultCase)의 성질이라 이 카드가 만든 것이 아니고 다섯 인식기 모두에 해당합니다. scan 을 죽이는 쪽(정규식 표류)은 제대로 빨개지는 것을 확인했습니다. 막으려면 기대 고장 수를 기준선에 박고 줄면 실패시키는 한 줄이 필요한데, 그것은 baseline.ts 와 기준선 JSON 모양을 건드리는 일이라 KAN-077 과 같은 파일을 씁니다 — 이 카드에서 하면 두 카드가 그 자리를 다투고, 별건으로 빼면 그때까지 게이트가 조용히 죽을 수 있습니다

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
     `review-judge --card KAN-076-X1C8PY --verdict 승인` 이 이 자리를 쓰고
     frontmatter 의 status 도 함께 고친다. 손으로 적어도 되지만, 그때는 수렴 검사를
     안 거치므로 `validate` 가 항목 판정과 어긋난 승인을 error 로 잡는다. -->

**판정**: (아직 없습니다)

**판정 이력**:

- 승인이면 → `apply --op move --id KAN-076-X1C8PY --to done` 뒤에 `main` 병합과 워크트리 정리(출력의 `cleanup`)
- 반려면 → `apply --op move --id KAN-076-X1C8PY --to doing` 뒤에 `doc-log --entry "<반려 사유>"`.
  요청서는 **지우지도 다시 뜨지도 않는다** — 고친 뒤 그 항목을 `review-judge --verdict 승인` 으로
  뒤집으면 같은 문서에서 수렴한다. 1·2항이 낡았으면 `review-init --refresh` 로 그 두 항만 간다.
