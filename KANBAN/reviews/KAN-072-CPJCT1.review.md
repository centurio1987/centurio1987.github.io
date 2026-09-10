---
card: KAN-072-CPJCT1
title: UI 토큰 정합화 — 게이트가 무는 1,786건을 구획 단위로 0 으로 줄인다
created: 2026-08-28
branch: KAN-072-CPJCT1
worktree: /Users/centurio/orca/workspaces/centurio1987.github.io/KAN-072-CPJCT1
base: 997edf6
status: 검토 대기
---

# KAN-072-CPJCT1 검토 요청 — UI 토큰 정합화 — 게이트가 무는 1,786건을 구획 단위로 0 으로 줄인다

카드: [KAN-072-CPJCT1.md](../KANBAN.cards/KAN-072-CPJCT1.md)

> 이 문서는 **검토를 위한 산출물**이다. 수행 내역은 카드 실행 문서에 있고, 착수 전
> 계획은 배치 문서에 있다. 여기 있는 것은 "지금 이 브랜치를 무엇으로 판정하는가" 뿐이다.

## 1. 검토 대상

| 항목 | 값 |
|---|---|
| 브랜치 | `KAN-072-CPJCT1` |
| 워크트리 | `/Users/centurio/orca/workspaces/centurio1987.github.io/KAN-072-CPJCT1` |
| 베이스 | `997edf6` |
| 변경 훑기 | `git diff 997edf6...HEAD` |

**커밋 28건**

```text
6915ee2 kanban: KAN-072 하위 6장 완료 — 각자의 축 칸이 0 이다
388ffca 배치7: 마스코트 34 + 마지막 13 → 0 — 래칫이 1,786 에서 0 으로 수렴한다
ceca370 kanban: 배치6 종료 — 277건 닫힘(324 → 47) · 기준선 갱신
15ee1a6 S14: container-anatomy · tauri · orca 구획 68 → 0 (5파일) — 규약이 인용하는 파일을 참으로 만든다
a9befa4 S13: auth-authz 구획 80 → 0 (4파일) — 상태 배경 틴트를 축 색의 옅은 단으로 푼다
0b05e83 S12: webrtc 구획 131 → 2 (5파일) — posts/** 최대 파일을 닫는다
0d3eeb7 kanban: KAN-072-CPJCT1 진행률 8/16 → 11/16 — 배치5(S9·S10·S11) 종료 반영
d95b3ce S2 보강: §4 를 넓힌다 — --ink-accent · --danger (배치5 가 화면으로 드러낸 것)
54ea5d6 kanban: 배치5 종료 — 457건 닫힘(791 → 334) · 기준선 갱신
522b9b3 S11: vpn-anatomy 구획 149 → 4 (9파일) — 상태색은 값이 이미 토큰이라 var() 만 씌운다
19bcc79 S10: osi-7-layers EP4~6 구획 158 → 5 (6파일) — 판정 대기 값은 게이트 시야 안에 남긴다
a8ae29d S9: osi-7-layers EP1~3 구획 171 → 12 (6파일) — 시뮬 잉크를 사이트 팔레트로 통합한다
7fc56ca kanban: 배치4 종료 — 443건 닫힘(1,234 → 791) · 기준선 갱신
06cf7dd 배치4 부수 정리 — 세 세션이 구획 밖이라 못 건드린 자리 셋
11551b7 S8: viz·전역 스타일 구획 68 → 0 (2파일) — 복제 둘을 토큰으로 모은다
f1cca62 S7: 페이지·셸 구획 91 → 0 (10파일)
980ba92 S6: 글 컴포넌트·레이아웃 구획 284 → 0 (13파일)
f608d6f S2 보강: §5 를 넓힌다 — --text-small 15px (배치4 가 화면으로 드러낸 것)
19e9eaa kanban: 배치3 종료 — 552건 닫힘(1,786 → 1,234) · 기준선 갱신
428505d S5: 데코 구획 173건 → 0 (components/deco/** 18파일)
4d5f587 S4: 그래프 구획 94건 → 0 (components/graph/GraphExplorer.tsx)
dba42cb S3: 카탈로그 구획 285건 → 0 (pages/design/** 3파일)
10d94e6 S2 보강: §8 을 넓힌다 — --radius-xs 4px · --stroke-bold 2px (배치3 1차가 화면으로 드러낸 것)
5461f30 CLAUDE.md 토큰 게이트 절의 낡은 수치 정정 — 1,567/44.3% → 1,304/47.9% (감사 정정 KAN-070 의 미반영 파급분)
dbe0bdb kanban: KAN-072-CPJCT1 실행 계획의 구획 무게를 배치2 뒤 기준선으로 (81파일 1,395 → 83파일 1,786)
8021095 S2: 토큰 체계를 세운다 — 종이 흰색 · 선 굵기 2단 · 간격 13종 · 글자 9종 (KAN-072.2-BF75X5)
7c06dc2 S1: 게이트 인식층 — 토큰 이름 규칙을 코드에서 데이터로 (KAN-072.7-D6DCXJ)
fed5416 kanban: KAN-072-CPJCT1 착수 · KAN-072.3-SC3ADV 완료(KAN-070 S5 로 흡수, 수행 없음)
```

**변경 파일 107개 (+3740 −2241)**

| 파일 | 상태 | 추가 | 삭제 |
|---|:--:|---:|---:|
| `.kanban/archive.jsonl` | M | 14 | 0 |
| `.kanban/log.md` | M | 14 | 14 |
| `.kanban/state.json` | M | 168 | 175 |
| `CLAUDE.md` | M | 6 | 3 |
| `KANBAN.batches/KAN-072-CPJCT1.batch1.md` | M | 17 | 2 |
| `KANBAN.batches/KAN-072-CPJCT1.batch2.md` | M | 47 | 25 |
| `KANBAN.batches/KAN-072-CPJCT1.batch3.md` | M | 26 | 2 |
| `KANBAN.batches/KAN-072-CPJCT1.batch4.md` | M | 51 | 13 |
| `KANBAN.batches/KAN-072-CPJCT1.batch5.md` | M | 61 | 2 |
| `KANBAN.batches/KAN-072-CPJCT1.batch6.md` | M | 55 | 2 |
| `KANBAN.batches/KAN-072-CPJCT1.batch7.md` | M | 63 | 2 |
| `KANBAN.board.html` | M | 81 | 15 |
| `KANBAN.cards/KAN-072-CPJCT1.md` | M | 105 | 33 |
| `KANBAN.md` | M | 65 | 60 |
| `design-concept/DESIGN_CONCEPT.md` | M | 189 | 9 |
| `design-concept/UI_CONSISTENCY_AUDIT.md` | M | 25 | 3 |
| `scripts/lib/tokens/axis.ts` | M | 97 | 0 |
| `scripts/lib/tokens/color.ts` | M | 13 | 36 |
| `scripts/lib/tokens/docrule.ts` | M | 174 | 44 |
| `scripts/lib/tokens/fallback.ts` | M | 5 | 2 |
| `scripts/tokens-baseline.json` | M | 13 | 108 |
| `src/components/AiBanner.astro` | M | 1 | 1 |
| `src/components/AuthorLineup.astro` | M | 1 | 1 |
| `src/components/AuthorProfile.astro` | M | 26 | 26 |
| `src/components/CategoryBadge.astro` | M | 4 | 4 |
| `src/components/FeedLink.astro` | M | 11 | 7 |
| `src/components/Footer.astro` | M | 12 | 12 |
| `src/components/Header.astro` | M | 6 | 6 |
| `src/components/Logo.astro` | M | 2 | 2 |
| `src/components/PostFilter.astro` | M | 34 | 29 |
| `src/components/PostList.astro` | M | 30 | 31 |
| `src/components/PostNav.astro` | M | 7 | 7 |
| `src/components/PostToc.astro` | M | 12 | 12 |
| `src/components/RelatedPosts.astro` | M | 20 | 20 |
| `src/components/SeriesEpisodes.astro` | M | 15 | 15 |
| `src/components/deco/Clip.astro` | M | 7 | 7 |
| `src/components/deco/Clothespin.astro` | M | 6 | 3 |
| `src/components/deco/CornerMount.astro` | M | 1 | 1 |
| `src/components/deco/Doodle.astro` | M | 7 | 7 |
| `src/components/deco/IndexTab.astro` | M | 3 | 3 |
| `src/components/deco/PaperSurface.astro` | M | 2 | 2 |
| `src/components/deco/Polaroid.astro` | M | 4 | 4 |
| `src/components/deco/Stamp.astro` | M | 10 | 10 |
| `src/components/deco/Sticker.astro` | M | 40 | 40 |
| `src/components/deco/StickyNote.astro` | M | 2 | 2 |
| `src/components/deco/Tape.astro` | M | 13 | 4 |
| `src/components/deco/TicketStub.astro` | M | 12 | 9 |
| `src/components/deco/Twine.astro` | M | 1 | 1 |
| `src/components/deco/patterns/DecoHeading.astro` | M | 4 | 4 |
| `src/components/deco/patterns/HeroCollage.astro` | M | 4 | 4 |
| `src/components/deco/patterns/MarkedCode.astro` | M | 3 | 3 |
| `src/components/deco/patterns/MarkedQuote.astro` | M | 6 | 6 |
| `src/components/deco/patterns/PhotoFrame.astro` | M | 30 | 30 |
| `src/components/graph/GraphExplorer.tsx` | M | 88 | 86 |
| `src/components/motifs/Mascot.astro` | M | 41 | 33 |
| `src/components/posts/auth-authz-1/AuthzMap.tsx` | M | 40 | 20 |
| `src/components/posts/auth-authz-2/JwtVerifyLab.tsx` | M | 38 | 22 |
| `src/components/posts/auth-authz-3/PkceFlowStepper.tsx` | M | 43 | 25 |
| `src/components/posts/auth-authz-4/AuthRequestLab.tsx` | M | 29 | 18 |
| `src/components/posts/container-anatomy-1/OverlayLab.tsx` | M | 48 | 34 |
| `src/components/posts/container-anatomy-2/DigestChain.tsx` | M | 42 | 28 |
| `src/components/posts/container-anatomy-3/CriCallTrace.tsx` | M | 49 | 33 |
| `src/components/posts/orca-dev-env/Shot.astro` | M | 1 | 1 |
| `src/components/posts/osi-7-layers-1/EncapsulationLab.tsx` | M | 15 | 7 |
| `src/components/posts/osi-7-layers-1/LayerTriage.tsx` | M | 28 | 20 |
| `src/components/posts/osi-7-layers-2/FrameAnatomy.tsx` | M | 32 | 23 |
| `src/components/posts/osi-7-layers-2/SwitchLearningLab.tsx` | M | 49 | 40 |
| `src/components/posts/osi-7-layers-3/HopJourney.tsx` | M | 48 | 33 |
| `src/components/posts/osi-7-layers-3/RoutingTableLab.tsx` | M | 35 | 27 |
| `src/components/posts/osi-7-layers-4/HandshakeLab.tsx` | M | 40 | 26 |
| `src/components/posts/osi-7-layers-4/SlidingWindowLab.tsx` | M | 48 | 24 |
| `src/components/posts/osi-7-layers-5/EncodingLab.tsx` | M | 36 | 20 |
| `src/components/posts/osi-7-layers-5/TlsHandshakeLab.tsx` | M | 44 | 26 |
| `src/components/posts/osi-7-layers-6/DnsResolveLab.tsx` | M | 43 | 23 |
| `src/components/posts/osi-7-layers-6/RequestJourneyLab.tsx` | M | 54 | 25 |
| `src/components/posts/tauri-2/PermissionGate.tsx` | M | 17 | 9 |
| `src/components/posts/vpn-anatomy-1/ObserverView.tsx` | M | 34 | 21 |
| `src/components/posts/vpn-anatomy-2/NonceReuseLab.tsx` | M | 47 | 38 |
| `src/components/posts/vpn-anatomy-3/IkeHeaderDissector.tsx` | M | 30 | 24 |
| `src/components/posts/vpn-anatomy-3/ProposalTreeBuilder.tsx` | M | 20 | 14 |
| `src/components/posts/vpn-anatomy-4/AntiReplayLab.tsx` | M | 26 | 20 |
| `src/components/posts/vpn-anatomy-4/EspOverheadLab.tsx` | M | 21 | 15 |
| `src/components/posts/vpn-anatomy-5/CryptokeyRoutingLab.tsx` | M | 34 | 28 |
| `src/components/posts/vpn-anatomy-6/OpcodeByte.tsx` | M | 20 | 14 |
| `src/components/posts/vpn-anatomy-7/SplitTunnelLab.tsx` | M | 57 | 18 |
| `src/components/posts/webrtc-1/IceTraversalLab.tsx` | M | 33 | 19 |
| `src/components/posts/webrtc-1/LoopbackNegotiationDemo.tsx` | M | 55 | 36 |
| `src/components/posts/webrtc-1/SdpNegotiationStepper.tsx` | M | 40 | 23 |
| `src/components/posts/webrtc-2/JitterBufferLab.tsx` | M | 32 | 20 |
| `src/components/posts/webrtc-3/ParticipantScaleLab.tsx` | M | 21 | 10 |
| `src/components/talk/PullQuote.astro` | M | 7 | 7 |
| `src/components/talk/QA.astro` | M | 15 | 15 |
| `src/components/viz/VizFigure.tsx` | M | 1 | 1 |
| `src/layouts/PostLayout.astro` | M | 26 | 26 |
| `src/layouts/TalkLayout.astro` | M | 54 | 49 |
| `src/pages/404.astro` | M | 9 | 7 |
| `src/pages/categories/[category].astro` | M | 8 | 8 |
| `src/pages/design/deco.astro` | M | 153 | 149 |
| `src/pages/design/frame-picks.astro` | M | 62 | 62 |
| `src/pages/design/viz-frames.astro` | M | 43 | 42 |
| `src/pages/graph.astro` | M | 31 | 16 |
| `src/pages/index.astro` | M | 37 | 33 |
| `src/pages/posts/index.astro` | M | 12 | 5 |
| `src/styles/deco.css` | M | 2 | 2 |
| `src/styles/global.css` | M | 36 | 14 |
| `src/styles/tokens.css` | M | 163 | 1 |
| `src/styles/viz-frame.css` | M | 78 | 38 |

**롤백 태그 21개**

```text
kan/KAN-072-CPJCT1/S1
kan/KAN-072-CPJCT1/S10
kan/KAN-072-CPJCT1/S11
kan/KAN-072-CPJCT1/S12
kan/KAN-072-CPJCT1/S13
kan/KAN-072-CPJCT1/S14
kan/KAN-072-CPJCT1/S15
kan/KAN-072-CPJCT1/S16
kan/KAN-072-CPJCT1/S2
kan/KAN-072-CPJCT1/S3
kan/KAN-072-CPJCT1/S4
kan/KAN-072-CPJCT1/S5
kan/KAN-072-CPJCT1/S6
kan/KAN-072-CPJCT1/S7
kan/KAN-072-CPJCT1/S8
kan/KAN-072-CPJCT1/S9
kan/KAN-072-CPJCT1/batch3
kan/KAN-072-CPJCT1/batch4
kan/KAN-072-CPJCT1/batch5
kan/KAN-072-CPJCT1/batch6
kan/KAN-072-CPJCT1/batch7
```

## 2. 검증 — 기준과 실행 결과

<!-- 기준은 카드 실행 문서 「검증」 절의 사본이다. 정본은 KANBAN.cards/KAN-072-CPJCT1.md 이므로
     기준이 바뀌면 그쪽을 고치고 review-init --refresh 로 이 항만 다시 뜬다.
     결과는 착수한 쪽이 이미 돌린 것이다 — 검토자에게 다시 돌리라고 시키지 않는다.
     **다시 돌려 아래와 다르게 나오면 그 자체가 반려 사유다.** -->

**기준**

1. **게이트가 0 을 낸다** — `bun run tokens:verify` 가 `위반`·`드리프트` 전 칸 0 을 보고하고
   exit 0. `scripts/tokens-baseline.json` 이 그 수로 커밋돼 있다.
2. **게이트가 살아 있다** — 자가검사 6종이 각자 다른 사유로 걸린다. 리터럴 한 줄을 일부러
   더한 워킹트리에서 비0 + 그 `파일:줄` 을 지목하고, 지우면 0.
   **이 항이 1번보다 먼저다** — 죽은 게이트와 다 갚은 게이트는 화면에서 같은 모양이다.
3. **회귀 없음** — `bun run build` · `bun scripts/check-post-markers.ts` ·
   `bun scripts/check-emphasis.ts`(+`--dist`) · `bun run viz:verify` · `bun run deco:verify` ·
   `bun run width:verify` · `bun run talk:verify` · `bun run graph:verify` · `tsc --noEmit` 전부 통과.
   `bun run gen:motion` 후 `git diff --exit-code -- src/styles/motion.css` 통과.
4. **발행물이 안 깨졌다** — `posts/**` 를 건드린 글을 `astro preview` 로 열어 시뮬 인터랙션이
   돈다. 빌드만으로는 안 잡힌다.
5. **화면이 안 바뀐 것이 확인됐다** — 주요 지면(홈 · 글 목록 · 글 상세 · 글 지도 · 대담 ·
   `/design/deco`)을 웨이브 전후로 대조한다. 바뀐 자리는 **왜 바뀌었는지가 수행 내역에 적혀
   있다** — "화면 변화 0"이 목표지만 스케일 스냅은 값을 움직이는 일이라 0 을 단정하지 않는다.
6. **다음 리터럴이 막힌다** — 리터럴을 넣은 브랜치를 만들어 `tokens:verify` 가 무는 것을 본다.
   CI 는 `push: main` 트리거라 브랜치에서 안 도므로 로컬로 확인한다.

**실행 결과**

```text
[검증 1] 게이트가 0 을 낸다 — bun run tokens:verify exit 0.
  래칫 기준: 준수 2703 · 판정 불가 891. **위반·드리프트 칸이 아예 없다.**
  scripts/tokens-baseline.json 의 files 가 0개, 합 0. 토큰 72 → 108.
  감사 기준으로 남은 위반 2 · 드리프트 1 은 전부 src/styles/viz.css(패키지 복제물)이고
  게이트가 스스로 "위반 2건 중 2건은 게이트 제외 파일에 있다"고 적는다.

[검증 2] 게이트가 살아 있다 — "자가검사: 정상 1 + 고장 6종, 사유 6가지".
  **기준선을 굳히기 전에 맨몸으로 돌려 확인했다.** --update-baseline 은 자가검사·예외 검사
  실패를 무시하고 빠져나가므로(scripts/verify-tokens.ts:98) 이 순서가 규약이다.
  토큰이 실제로 먹는지도 3단으로 봤다 — :root 계산값 20/20 일치 · 지역에서 값을 뒤집으면 이동 ·
  **음성 대조**(base 에 같은 주입을 해도 안 바뀜). 셋째가 없으면 둘째는 공회전이다.

[검증 3] 회귀 없음 — 전부 exit 0.
  bun run build 46쪽 · viz:verify(글 27편/figure 43) · deco:verify(50회) · width:verify(지면 5개) ·
  talk:verify · check-post-markers(30개 글) · check-emphasis(30 소스) · --dist(46 렌더) ·
  gen:motion 후 motion.css 드리프트 0 · tsc 신규 에러 0.
  graph:verify 만 exit 1 인데 카드 전체(997edf6..HEAD)에서 src/data · src/content 를
  한 파일도 안 건드렸다 — 사유도 "graph.json 에 없는 글 1편"으로 콘텐츠 쪽이고,
  재생성은 main 워크트리 전용이다(CLAUDE.md 「Graph data」 절).

[검증 4] 발행물이 안 깨졌다 — posts/** 30개 시뮬을 astro preview(HTTP)로 실제 조작했다.
  배치5 20+42스텝 · 배치6 69항목+4종+9종 · 배치7 4상태×3역할.
  조건부 색은 양쪽 상태를 다 눌렀다. 콘솔 에러 0 · var() 미해석 0.

[검증 5] 화면 변화를 실측했다 — 자기 파일만 HEAD 로 되돌린 격리 사본과 대조.
  같은 워크트리의 전후 비교는 못 믿는다(배치4 에서 한 세션이 남의 변경 -483px 을 자기 몫으로 쟀다).
  달라진 페이지가 매번 자기 글 수와 정확히 일치하는 것까지 확인했다.
  의도한 변화: 시뮬 잉크가 따뜻한 먹색 → 사이트 코발트 남색(유저 판정, ΔRGB 38~44).
  기하 변화는 전 배치 통틀어 열 자리 안쪽이고 전부 간격 스냅에서 나왔다.

[검증 6] 다음 리터럴이 막힌다 — 고장 주입으로 확인.
  fallback 을 한 글자 틀리고(#d8d0be → #d8d0bf) padding 을 리터럴로 되돌리니 3건을 정확히 물었다.
  CI 는 push:main 트리거라 브랜치에서 안 도므로 병합 직후 첫 CI 를 지켜봐야 한다.

[알아둘 것] 커밋 메시지 관례가 배치5부터 어긋났다 — 아래 경고의 정체다.
  게이트가 "커밋 28건 중 25건에 KAN-072-CPJCT1 가 없습니다" 를 경고하는데, base 는 맞다.
  997edf6 은 착수 직전 커밋이고 카드 실행 문서의 착수 기록과 같다.
  어긋난 것은 커밋 제목이다 — 배치1~4 는 "KAN-072-CPJCT1 …" 으로 시작했는데
  배치5~7 은 "S9: …" 처럼 단위 id 로 시작했다. 28개를 되쓰지 않고 사실만 남긴다.
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
python3 scripts/kanban.py review-judge <project-root> --card KAN-072-CPJCT1 --item <번호> --verdict 승인
# 추가 의견
python3 scripts/kanban.py review-note <project-root> --card KAN-072-CPJCT1 --item <번호> --text "<추가 의견>"
# 추가 의견을 반영하다 새 의견이 생겼으면 (맨 뒤에 붙어 앞 번호가 안 밀립니다)
python3 scripts/kanban.py review-item <project-root> --card KAN-072-CPJCT1 --add "<주제>
  <상세>"
```

**전체 승인은 살아있는 항목이 전부 승인일 때만 섭니다**(철회는 분모에서 빠집니다). 하나라도
반려·추가 의견·미정이면 4항의 전체 승인도 `→ 완료` 이동도 종료코드 14로 거부됩니다.

- [ ] 하드월 승격을 이 카드가 하지 않고 KAN-070 으로 넘긴 것에 동의하는가 — 넘기는 쪽을 골랐다
    - **상세** — 래칫은 「커밋된 기준선 대비 늘면 실패」이고 하드월은 「0 이 아니면 실패」다. 지금은 기준선이 0 이라 둘의 판정이 같지만, 래칫은 기준선 파일이 지워지거나 잘못 갱신되면 뚫린다. 근거 원문: KANBAN.batches/KAN-072-CPJCT1.batch7.md:42 가 「하드월 승격은 이 카드가 안 한다 — 게이트 코드는 KAN-070 소유다」로 정해 뒀다. 게이트가 갱신 때 검사를 건너뛰고 빠져나가는 자리는 scripts/verify-tokens.ts:98 이다

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 게이트가 못 보는 축을 새 카드로 올릴 것인가 — 올리는 쪽을 제안한다
    - **상세** — 추출층 정규식이 큰따옴표 문자열 값만 봐서 React 인라인 숫자값(fontSize 13 · borderRadius 8 · padding 18)과 삼항·템플릿 리터럴 안을 판정에 안 넣는다. 원문: scripts/lib/tokens/extract.ts:60. 배치6 의 세 작업 단위(webrtc 구획 · auth-authz 구획 · container·tauri 구획)가 독립적으로 같은 것을 짚었고 각각 열 자리 · 열두 자리를 셌다 — KANBAN.cards/KAN-072-CPJCT1.md:244 부터의 배치6 기록에 있다. 옮기면 그림 액자가 2px 씩 줄고 반픽셀 글자가 정수로 접히는, 게이트가 검증 못 하는 화면 변화다. 하위 카드 KAN-072.7 은 카드 목표(이름 규칙을 하드코딩에서 데이터로)를 달성해 닫았으므로 이건 새 카드다

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] public/tony.svg 를 어떻게 할 것인가 — 판단하지 않고 남겼다
    - **상세** — 원문: public/tony.svg:1. 마스코트(src/components/motifs/Mascot.astro:1)와 같은 그림의 독립 사본이고 리터럴 34개가 새 팔레트와 값이 같다. 소스 전체 grep 에서 참조 0건이다. 스타일시트 없이 단독으로 뜨는 파일이라 토큰 참조를 못 쓰므로 대상이 아니었고, src/styles/tokens.css:86 블록 주석과 design-concept/DESIGN_CONCEPT.md:277 팔레트 표 아래에 「팔레트를 고치면 그쪽도 같이 고쳐라」를 남겼다. 지우는 선택지도 있으나 이 카드 범위 밖이라 안 정했다

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] -ink-muted 가 아직 한 값으로 안 모인 것을 후속으로 둔 것에 동의하는가
    - **상세** — 흐린·비활성 글자 역할에 단이 없어 값이 셋으로 갈려 있다 — src/components/posts/webrtc-1/LoopbackNegotiationDemo.tsx:335 의 값 하나만 토큰화했고, src/components/posts/auth-authz-3/PkceFlowStepper.tsx:104 의 다른 값 둘과 또 다른 값 일곱 자리가 남았다. 게이트가 무는 자리만 옮겼고 나머지는 값이 달라 옮기면 화면이 바뀐다. design-concept/DESIGN_CONCEPT.md:85 의 그 행에 「아직 한 값으로 모이지 않았다」를 명시해 표를 「이미 통일됨」으로 읽는 것을 막았다

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 구분 팔레트 열여덟 종을 모티프 절이 아니라 색 절에 넣은 것에 동의하는가 — 세션 판단을 받아들였다
    - **상세** — design-concept/DESIGN_CONCEPT.md:90 이 그 새 절이다. 배치5 가 색 절에 써 둔 「서로를 구분하는 색표는 여기 넣지 않는다 … 수렴 단계에서 함께 본다」가 프레임 필드 여섯 색과 상태 테두리 네 색을 이름으로 지목하고 있어, 답을 다른 절에 두면 그 절이 거짓 문장을 문 채 남는다. 그 문단을 새 절로 갈아 끼웠다. 모티프 절은 해치·손글씨·마스코트처럼 빼도 정보가 안 없어지는 장식 어휘의 자리인데 이 열여덟은 색이 곧 정보다. 마스코트 팔레트가 모티프 절로 간 것은 「고유 팔레트라서」가 아니라 「마스코트 절이 이미 거기 있어서」다

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 감사 정본을 지우지 않고 정정 블록으로 남긴 것에 동의하는가
    - **상세** — 원문: design-concept/UI_CONSISTENCY_AUDIT.md:345 의 「그 팔레트가 어디에도 안 적혀 있다」가 이번 마스코트 작업으로 거짓이 됐다. 진단 문장을 지우면 「왜 그 토큰이 생겼나」의 근거가 사라지므로 같은 파일 design-concept/UI_CONSISTENCY_AUDIT.md:17 의 선례대로 인용 블록으로 정정을 덧붙였다(design-concept/UI_CONSISTENCY_AUDIT.md:349). 건수가 28 이 아니라 34 였다는 사실도 함께 적었다 — 배치2 가 토큰을 세우면서 판정이 재분류돼 늘었다. 덤으로 깨져 있던 줄번호 인용 넷을 절 이름 참조로 바꿨다

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 같은 값이 다른 뜻으로 다섯 파일에 상수로 남은 것 — 안 옮겼다
    - **상세** — 원문: src/components/posts/osi-7-layers-3/HopJourney.tsx:17 의 모래색 상수. 같은 값이 RoutingTableLab · TlsHandshakeLab · HandshakeLab · DnsResolveLab · SlidingWindowLab 에도 있다. 이번에 세운 이더넷 프레임의 Destination MAC 필드 구분색과 값이 정확히 같지만 역할이 다르다(필드 구분색 ≠ 시뮬 강조 모래색). 모듈 상수라 게이트 시야 밖이다. 값이 같다고 밀면 이름이 뜻을 배반한다 — 마스코트에서 같은 이유로 UI 토큰에 안 묶은 것과 같은 판단이고, 그쪽은 유저가 2026-08-27 에 판정했다

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] work 태그를 배치5~7 것만 사후에 단 사실을 짚어 둔다
    - **상세** — 롤백 계획 명령이 kan/<카드id>/<단위> 태그를 읽는데, 배치5 착수 시점부터 태그를 안 달아 여덟째 단위와 batch4 까지만 있었다. 원문: KANBAN.cards/KAN-072-CPJCT1.md:237 부터의 배치6·7 종료 기록에 태그 언급이 없다. 수렴 확인 중에 발견해 열한 개를 각 단위의 커밋에 사후로 달았고 스물한 개 전부 HEAD 에서 도달 가능함을 확인했다. 규율은 「단위를 닫는 커밋마다 태그를 단다」이므로 다음 카드에서는 그때그때 단다

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
     `review-judge --card KAN-072-CPJCT1 --verdict 승인` 이 이 자리를 쓰고
     frontmatter 의 status 도 함께 고친다. 손으로 적어도 되지만, 그때는 수렴 검사를
     안 거치므로 `validate` 가 항목 판정과 어긋난 승인을 error 로 잡는다. -->

**판정**: (아직 없습니다)

**판정 이력**:

- 승인이면 → `apply --op move --id KAN-072-CPJCT1 --to done` 뒤에 `main` 병합과 워크트리 정리(출력의 `cleanup`)
- 반려면 → `apply --op move --id KAN-072-CPJCT1 --to doing` 뒤에 `doc-log --entry "<반려 사유>"`.
  요청서는 **지우지도 다시 뜨지도 않는다** — 고친 뒤 그 항목을 `review-judge --verdict 승인` 으로
  뒤집으면 같은 문서에서 수렴한다. 1·2항이 낡았으면 `review-init --refresh` 로 그 두 항만 간다.
