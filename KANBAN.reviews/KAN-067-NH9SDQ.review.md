---
card: KAN-067-NH9SDQ
title: 폭신 대담에서 사용할 주제는 아래와 같다. 미리 주제에 대해 리서치를 하고, 대화를 대비한 준비를 해둬라.
created: 2026-08-18
branch: KAN-067-NH9SDQ
worktree: /Users/centurio/orca/workspaces/centurio1987.github.io/KAN-067-NH9SDQ
base: 06e9d96
status: 검토 대기
---

# KAN-067-NH9SDQ 검토 요청 — 폭신 대담에서 사용할 주제는 아래와 같다. 미리 주제에 대해 리서치를 하고, 대화를 대비한 준비를 해둬라.

카드: [KAN-067-NH9SDQ.md](../KANBAN.cards/KAN-067-NH9SDQ.md)

> 이 문서는 **검토를 위한 산출물**이다. 수행 내역은 카드 실행 문서에 있고, 착수 전
> 계획은 배치 문서에 있다. 여기 있는 것은 "지금 이 브랜치를 무엇으로 판정하는가" 뿐이다.

## 1. 검토 대상

| 항목 | 값 |
|---|---|
| 브랜치 | `KAN-067-NH9SDQ` |
| 워크트리 | `/Users/centurio/orca/workspaces/centurio1987.github.io/KAN-067-NH9SDQ` |
| 베이스 | `06e9d96` |
| 변경 훑기 | `git diff 06e9d96...HEAD` |

**커밋 4건**

```text
b89eb17 KAN-067-NH9SDQ S3~S7 완료 — 대담 준비 노트 2건 · _prep 규격 (배치2·3 완료)
fae53bc KAN-067-NH9SDQ S1·S2 완료 — 두 주제 리서치·위키 ingest (배치1 완료)
86dff03 kanban: KAN-067-NH9SDQ 착수 — 진행 중 이동 · 수행안 혼합(배치1만 병렬) 확정
c23d9bd kanban: KAN-067-NH9SDQ 착수 전 계획 — 전략·WBS 7단계·배치 3개·계획 리포트
```

**변경 파일 13개 (+960 −28)**

| 파일 | 상태 | 추가 | 삭제 |
|---|:--:|---:|---:|
| `.kanban/archive.jsonl` | M | 1 | 0 |
| `.kanban/log.md` | M | 1 | 1 |
| `.kanban/state.json` | M | 19 | 15 |
| `KANBAN.batches/KAN-067-NH9SDQ.batch1.md` | M | 77 | 0 |
| `KANBAN.batches/KAN-067-NH9SDQ.batch2.md` | M | 59 | 0 |
| `KANBAN.batches/KAN-067-NH9SDQ.batch3.md` | M | 68 | 0 |
| `KANBAN.cards/KAN-067-NH9SDQ.md` | M | 80 | 0 |
| `KANBAN.md` | M | 13 | 12 |
| `KANBAN.reports/KAN-067-NH9SDQ.report.html` | M | 240 | 0 |
| `raws/talks/README.md` | M | 5 | 0 |
| `raws/talks/_prep/README.md` | M | 52 | 0 |
| `raws/talks/_prep/dashboard-bulk-fetch.md` | M | 207 | 0 |
| `raws/talks/_prep/db-bound-performance.md` | M | 138 | 0 |

**롤백 태그 10개**

```text
kan/KAN-067-NH9SDQ/S1
kan/KAN-067-NH9SDQ/S2
kan/KAN-067-NH9SDQ/S3
kan/KAN-067-NH9SDQ/S4
kan/KAN-067-NH9SDQ/S5
kan/KAN-067-NH9SDQ/S6
kan/KAN-067-NH9SDQ/S7
kan/KAN-067-NH9SDQ/batch1
kan/KAN-067-NH9SDQ/batch2
kan/KAN-067-NH9SDQ/batch3
```

## 2. 검증 — 기준과 실행 결과

<!-- 기준은 카드 실행 문서 「검증」 절의 사본이다. 정본은 KANBAN.cards/KAN-067-NH9SDQ.md 이므로
     기준이 바뀌면 그쪽을 고치고 review-init --force 로 다시 뜬다.
     결과는 착수한 쪽이 이미 돌린 것이다 — 검토자에게 다시 돌리라고 시키지 않는다.
     **다시 돌려 아래와 다르게 나오면 그 자체가 반려 사유다.** -->

**기준**

```bash
bun run talk:verify        # _prep/ 이 slug 로 오인되지 않는가 — 대담 집계가 기존과 같아야 한다
bun run build              # 회귀 없음
ls raws/talks/_prep/       # README.md + 준비 노트 2건
```

- `~/blog-research/wiki/topics/` 에 주제별 topic 페이지가 생겼고 `index.md`·`log.md` 가 갱신됐다.
- 준비 노트 두 건이 각각 다섯 항(질문 순서 · 의견 판정 · 예상 반론 · 앵커 · 용어)을 모두 갖췄다.
- 유저 의견 셋이 **각각** 판정돼 있다 — "대체로 맞다" 같은 뭉뚱그림이 없다.
- 노트의 모든 수치·규격에 출처가 붙어 있다. 출처 없는 값은 적지 않는다.
- `src/content/posts/` 와 `raws/talks/<slug>/` 는 이 카드에서 **바뀌지 않았다**(대화 전이다).

**실행 결과**

```text
$ bun run talk:verify
[대담] raws/talks/ — 1건            ← 착수 전과 같다. _prep/ 은 slug 로 안 세어진다
  · ddd-entry-contradiction — 봉인만 됨 (integrity.usable=false, 정형본 없음)
[자가검사] 파서 규격 위반 — 9종 전부 통과
[자가검사] 고장 주입 — 5종 전부 통과
[verify-talk] ✓ 대담 3계층에 어긋남 없음

$ bun run build
[build] 46 page(s) built in 2.90s
[build] Complete!

$ ls raws/talks/_prep/
README.md  dashboard-bulk-fetch.md  db-bound-performance.md

$ git status --porcelain src/content/posts raws/talks/ddd-entry-contradiction
(비어 있음 — 대화 전이므로 발행물·원문은 바뀌지 않아야 한다)

$ ls ~/blog-research/wiki/topics/ | wc -l
33   (착수 전 23 → topic 10건 추가). index.md·log.md 갱신 확인, 커밋 fb5d585 푸시 완료
```

## 3. 판단 항목 — 스크립트가 판정할 수 없는 것

<!-- 스크립트가 판정할 수 없는 것만 적는다 — 값의 진위, 선택지 중 하나를 고른 근거,
     범위를 그은 자리. 2항에서 이미 돌아간 검증을 여기 옮겨 적지 않는다.
     한 줄 형식: 체크박스 하나에 물음 하나 — "<물음> — <지금 고른 값과 그 근거>".
     비어 있으면 "기계가 다 판정했고 사람이 정할 것이 없다"는 뜻이다. 그 판단도
     착수한 쪽이 하는 것이지 검토자가 빈칸을 보고 추측할 일이 아니다. -->
- [ ] 두 주제를 한 회차로 대담할 것인가 두 화로 나눌 것인가 — 준비 노트를 둘로 나눠 뒀고(주제①은 프론트 반응성, ②는 백엔드 질의) 노트①의 질문이 8개라 한 회차로는 깁니다. 노트①에 「성능축(Q1~4)·UX축(Q5~8)으로 나눌 여지를 열어 두고 대화한다」고 적었으나 실제 분리는 대화 방식의 문제라 제가 정할 수 없습니다
- [ ] 주제① 앵글이 draft 로 남은 상태에서 대화를 시작할 것인가 — open question 8건(요청 세분화 순비용 1차 벤치마크 부재 · LTTB/Arrow IPC 정량 절감 부재 · IndexedDB 대량쓰기 근거 부재 · Mejtoft 2018/2022 원문 미확보 등)이 남아 draft 로 뒀습니다. 그대로 들어가 「모르는 것을 모른다고 말하는」 재료로 쓸 수도 있고, 추가 리서치 라운드를 돌려 mature 로 올릴 수도 있습니다. 지금 고른 값은 전자입니다(주제②는 mature)
- [ ] 인용 보류로 표시한 값 넷을 유지할 것인가 — 스켈레톤 통설 수치(이탈률 9~20% 등, NN/g 원문에 근거 없음) · Mejtoft et al. 구체 수치(원문 미확보) · Roaring bitmap 2배/900배(측정 조건 미확인) · t-digest 45배(조건 미확인). 넷 다 노트의 앵커 항에 「인용하지 않기로 한 값」으로 명시했습니다. Mejtoft 2022 는 ACM 403, 2018 은 ResearchGate PDF 존재만 확인 — 원문 확보는 접근 장벽이라 제가 넘길 수 없습니다
- [ ] 준비 노트 자리를 raws/talks/_prep/ 로 둔 것이 맞는가 — 밑줄로 시작해 scripts/build-talk.ts:49 가 slug 목록에서 제외하는 성질을 이용했고 talk:verify 로 실제 확인했습니다(대담 집계 1건 유지). 대안은 raws/ 최상위에 별도 디렉터리를 파는 것인데, raws/talks/README.md 가 이미 「별도 루트 디렉터리를 새로 파면 유저 입력의 입구가 둘이 된다」고 적어 둔 판단과 부딪혀 뺐습니다
- [ ] ~/.claude/skills/manage-kanban/ 변경을 커밋할 것인가 — 이 카드 범위 밖입니다. 유저 지시로 독립성 판정에서 완료 카드를 빼고 직렬 중재(dep-serialize, 종료코드 11)를 추가했으며 test_dep_policy.py 를 신설했습니다(테스트 10종 전부 초록). 그 저장소에는 제 것이 아닌 미커밋 변경(board.py·report.py·test_derived.py)이 이미 있어 묶어 커밋하지 않았습니다

## 4. 판정

<!-- 승인 또는 반려를 적고 사유를 남긴다. frontmatter 의 status 도 함께 고친다. -->

**판정**: (승인 / 반려 중 하나를 적으세요)

**사유**:

- 승인이면 → `apply --op move --id KAN-067-NH9SDQ --to done`
- 반려면 → `apply --op move --id KAN-067-NH9SDQ --to doing` 뒤에 `doc-log --entry "<반려 사유>"`
