---
card: KAN-067-NH9SDQ
title: 폭신 대담에서 사용할 주제는 아래와 같다. 미리 주제에 대해 리서치를 하고, 대화를 대비한 준비를 해둬라.
created: 2026-08-18
branch: KAN-067-NH9SDQ
worktree: /Users/centurio/orca/workspaces/centurio1987.github.io/KAN-067-NH9SDQ
base: 06e9d96
status: 승인
---
# KAN-067-NH9SDQ 검토 요청 — 폭신 대담에서 사용할 주제는 아래와 같다. 미리 주제에 대해 리서치를 하고, 대화를 대비한 준비를 해둬라.

카드: [KAN-067-NH9SDQ.md](../KANBAN.cards/KAN-067-NH9SDQ.md)

> 이 문서는 **검토를 위한 산출물**이다. 수행 내역은 카드 실행 문서에 있고, 착수 전
> 계획은 배치 문서에 있다. 여기 있는 것은 "지금 이 브랜치를 무엇으로 판정하는가" 뿐이다.

## 1. 검토 대상


| 항목    | 값                                                                       |
| ----- | ----------------------------------------------------------------------- |
| 브랜치   | `KAN-067-NH9SDQ`                                                        |
| 워크트리  | `/Users/centurio/orca/workspaces/centurio1987.github.io/KAN-067-NH9SDQ` |
| 베이스   | `06e9d96`                                                               |
| 변경 훑기 | `git diff 06e9d96...HEAD`                                               |


**커밋 7건**

```text
52000d6 KAN-067-NH9SDQ S8·S9 완료 — 주제① 추가 리서치(angle mature)와 노트① 갱신
d3a28fa kanban: KAN-067-NH9SDQ 검토 피드백 반영 — 회차는 주제별, 주제① 추가 리서치 (S8~S10 · 배치4)
f03884d kanban: KAN-067-NH9SDQ 검토 요청 — 준비 노트 2건, 판단 항목 5건
b89eb17 KAN-067-NH9SDQ S3~S7 완료 — 대담 준비 노트 2건 · _prep 규격 (배치2·3 완료)
fae53bc KAN-067-NH9SDQ S1·S2 완료 — 두 주제 리서치·위키 ingest (배치1 완료)
86dff03 kanban: KAN-067-NH9SDQ 착수 — 진행 중 이동 · 수행안 혼합(배치1만 병렬) 확정
c23d9bd kanban: KAN-067-NH9SDQ 착수 전 계획 — 전략·WBS 7단계·배치 3개·계획 리포트
```

**변경 파일 16개 (+1527 −48)**


| 파일                                          | 상태  | 추가  | 삭제  |
| ------------------------------------------- | :---: | ---: | ---: |
| `.kanban/archive.jsonl`                     | M   | 3   | 0   |
| `.kanban/log.md`                            | M   | 3   | 3   |
| `.kanban/state.json`                        | M   | 40  | 33  |
| `KANBAN.batches/KAN-067-NH9SDQ.batch1.md`   | M   | 77  | 0   |
| `KANBAN.batches/KAN-067-NH9SDQ.batch2.md`   | M   | 59  | 0   |
| `KANBAN.batches/KAN-067-NH9SDQ.batch3.md`   | M   | 68  | 0   |
| `KANBAN.batches/KAN-067-NH9SDQ.batch4.md`   | M   | 93  | 0   |
| `KANBAN.cards/KAN-067-NH9SDQ.md`            | M   | 91  | 0   |
| `KANBAN.md`                                 | M   | 14  | 12  |
| `KANBAN.reports/KAN-067-NH9SDQ.report.html` | M   | 240 | 0   |
| `KANBAN.reviews/KAN-067-NH9SDQ.review.html` | M   | 248 | 0   |
| `KANBAN.reviews/KAN-067-NH9SDQ.review.md`   | M   | 143 | 0   |
| `raws/talks/README.md`                      | M   | 5   | 0   |
| `raws/talks/_prep/README.md`                | M   | 52  | 0   |
| `raws/talks/_prep/dashboard-bulk-fetch.md`  | M   | 253 | 0   |
| `raws/talks/_prep/db-bound-performance.md`  | M   | 138 | 0   |


**롤백 태그 13개**

```text
kan/KAN-067-NH9SDQ/S1
kan/KAN-067-NH9SDQ/S2
kan/KAN-067-NH9SDQ/S3
kan/KAN-067-NH9SDQ/S4
kan/KAN-067-NH9SDQ/S5
kan/KAN-067-NH9SDQ/S6
kan/KAN-067-NH9SDQ/S7
kan/KAN-067-NH9SDQ/S8
kan/KAN-067-NH9SDQ/S9
kan/KAN-067-NH9SDQ/batch1
kan/KAN-067-NH9SDQ/batch2
kan/KAN-067-NH9SDQ/batch3
kan/KAN-067-NH9SDQ/batch4
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
[자가검사] 파서 규격 위반 9종 · 고장 주입 5종 — 전부 통과
[verify-talk] ✓ 대담 3계층에 어긋남 없음

$ bun run build
[build] 46 page(s) built in 2.14s
[build] Complete!

$ ls raws/talks/_prep/
README.md  dashboard-bulk-fetch.md  db-bound-performance.md

$ git status --porcelain src/content/posts raws/talks/ddd-entry-contradiction
(비어 있음 — 대화 전이므로 발행물·원문은 바뀌지 않아야 한다)

추가 라운드(S8) 검증 — ~/blog-research 커밋 e2d7725
  raws/014 신규(012 는 불변 확인), topic 5종 sources [012, 014] 로 갱신,
  angle dashboard-aggregated-fetch-talk: draft → mature
  겨냥 8건 결과: 메움 3 · 부분 4 · 못 메움 1 (못 메운 것은 사유와 함께 남김)
```

## 3. 판단 항목 — 스크립트가 판정할 수 없는 것

<!-- 스크립트가 판정할 수 없는 것만 적는다 — 값의 진위, 선택지 중 하나를 고른 근거,
     범위를 그은 자리. 2항에서 이미 돌아간 검증을 여기 옮겨 적지 않는다.
     한 줄 형식: 체크박스 하나에 물음 하나 — "<물음> — <지금 고른 값과 그 근거>".
     비어 있으면 "기계가 다 판정했고 사람이 정할 것이 없다"는 뜻이다. 그 판단도
     착수한 쪽이 하는 것이지 검토자가 빈칸을 보고 추측할 일이 아니다. -->

- [ ] [1차 검토 응답 반영 완료] 회차는 주제별로 나눈다 — 노트①의 「성능축·UX축으로 나눌 여지」 문구를 걷어내고 「이 노트가 한 회차, 주제②는 다른 회차」로 못박았습니다. 추가로 정하실 것 없습니다
- [ ] [1차 검토 응답 반영 완료] 주제① 추가 리서치를 돌렸다 — raws/014 신설, angle 이 draft → mature. 겨냥한 8건 중 메움 3(요청 세분화 순비용 실측 · 배치완료 기준 캐시 무효화의 정형 패턴 2종 · SSE 커넥션 제한 스펙 원문) · 부분 4 · 못 메움 1(프로그레시브 렌더링→CLS 실측). 못 메운 것은 「두 라운드를 돌리고도 못 찾았다」로 남겼습니다. 추가로 정하실 것 없습니다
- [ ] [미응답 · 전제가 바뀌었습니다] 인용 보류로 표시한 값을 유지할 것인가 — 1차 검토 때 넷이었고 지금은 여섯입니다. 추가 라운드에서 Mejtoft 2018 원문을 다시 시도했으나 ACM DL·ResearchGate 모두 403 이라 여전히 미확보이고 LTTB 원논문은 두 번 다 hCaptcha 에 막혔습니다. 대신 우리 쪽 오인용을 하나 잡았습니다 — 1차 라운드가 「Mejtoft et al.(2022) 후속 논문」이라고 적은 DOI 의 실제 저자는 van Nimwegen·van Rijn 으로 별개 논문입니다. 지금 고른 값은 여섯 전부 인용 배제 유지이고 노트에 사유와 함께 명시돼 있습니다
  - [ ] 유지
- [x] [미응답 · 값 유지] 준비 노트 자리를 raws/talks/_prep/ 로 둔 것이 맞는가 — 밑줄로 시작해 scripts/build-talk.ts:49 가 slug 목록에서 제외하는 성질을 이용했고 talk:verify 로 재확인했습니다(대담 집계 1건 유지). 대안은 raws/ 최상위에 별도 디렉터리인데 raws/talks/README.md 가 이미 「별도 루트 디렉터리를 새로 파면 유저 입력의 입구가 둘이 된다」고 적어 둔 판단과 부딪혀 뺐습니다
- [x] [미응답 · 값 유지 · 항목 하나 늘었습니다] ~/.claude/skills/manage-kanban/ 변경을 커밋할 것인가 — 이 카드 범위 밖이고 아직 커밋하지 않았습니다. ① 유저 지시로 독립성 판정에서 완료 카드를 빼고 직렬 중재(dep-serialize · 종료코드 11)를 추가하고 test_dep_policy.py 를 신설했습니다. ② 이번 재검토를 만들다 발견한 결함도 함께 고쳤습니다 — review-init 의 --commits 가 쉼표로도 쪼개져 한국어 커밋 제목이 잘리고(7건이 9건으로) 잘린 조각에 카드 id 가 없어 「남의 커밋이 섞였다」는 거짓 경고가 났습니다. split_commit_lines 로 분리하고 test_review_flow.py 의 픽스처에 쉼표 든 제목을 넣어 회귀를 막았습니다. 테스트 10종 전부 초록입니다. 그 저장소에는 제 것이 아닌 미커밋 변경(board.py·report.py·test_derived.py)이 이미 있어 묶어 커밋하지 않았습니다

## 4. 판정

<!-- 승인 또는 반려를 적고 사유를 남긴다. frontmatter 의 status 도 함께 고친다. -->

**판정**: 승인

**사유**:

- 승인이면 → `apply --op move --id KAN-067-NH9SDQ --to done`
- 반려면 → `apply --op move --id KAN-067-NH9SDQ --to doing` 뒤에 `doc-log --entry "<반려 사유>"`

