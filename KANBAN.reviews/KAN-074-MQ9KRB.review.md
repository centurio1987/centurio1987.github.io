---
card: KAN-074-MQ9KRB
title: 토큰 게이트 부채 상환 — 인식층 확장으로 드러난 778건을 옮긴다
created: 2026-08-29
branch: KAN-074-MQ9KRB
worktree: /Users/centurio/orca/workspaces/centurio1987.github.io/KAN-074-MQ9KRB
base: d082433b
status: 검토 대기
---

# KAN-074-MQ9KRB 검토 요청 — 토큰 게이트 부채 상환 — 인식층 확장으로 드러난 778건을 옮긴다

카드: [KAN-074-MQ9KRB.md](../KANBAN.cards/KAN-074-MQ9KRB.md)

> 이 문서는 **검토를 위한 산출물**이다. 수행 내역은 카드 실행 문서에 있고, 착수 전
> 계획은 배치 문서에 있다. 여기 있는 것은 "지금 이 브랜치를 무엇으로 판정하는가" 뿐이다.

## 1. 검토 대상

| 항목 | 값 |
|---|---|
| 브랜치 | `KAN-074-MQ9KRB` |
| 워크트리 | `/Users/centurio/orca/workspaces/centurio1987.github.io/KAN-074-MQ9KRB` |
| 베이스 | `d082433b` |
| 변경 훑기 | `git diff d082433b...HEAD` |

**커밋 12건**

```text
aabd999 S8: 새 기준선 778 → 0 · 문서 셋 — 하드월 승격은 KAN-075~077 뒤로 (KAN-074-MQ9KRB)
fe47253 S6+S7: 위반 170건 처분 — 기하 97 · 글자 53 · 색 9 · 음수 여백 3 · 예외 8 (KAN-074-MQ9KRB)
dfa7df0 S6: 예외 표에 자리 단위 좁히기(site) — 파일 단위로 걸면 그 파일의 준수분까지 내려간다 (KAN-074-MQ9KRB)
f9e074c S4: auth-authz 드리프트 65건 + tauri 19건 토큰화 — 화면 변화 0 · 배치1 종료(래칫 778→170) (KAN-074-MQ9KRB)
49f70e1 S4: webrtc 드리프트 78건 토큰화 — 화면 변화 0 (KAN-074-MQ9KRB)
d931548 S4: container-anatomy 드리프트 67건 토큰화 — 화면 변화 0 (KAN-074-MQ9KRB)
559640c S3: vpn-anatomy 드리프트 175건 토큰화 — 화면 변화 0 (KAN-074-MQ9KRB)
747ca3c S3: osi-7-layers 드리프트 204건 토큰화 — 화면 변화 0 (KAN-074-MQ9KRB)
fc689c5 S3: 하네스 보강 — 안 그려지는 노드 제외 · 상태별 잡음 표본 · 밀폐 실행 (KAN-074-MQ9KRB)
146784d S1: 격리 대조 하네스 compare-render — 자가검사 4종 통과 (KAN-074-MQ9KRB)
96357bd kanban: KAN-074-MQ9KRB 계획 리포트 발행 (voice ppangtolab-teacher)
a6a65c3 kanban: KAN-074-MQ9KRB 착수 — 진행 중 이동 · 실행 문서 · 배치 3개
```

**변경 파일 53개 (+2465 −717)**

| 파일 | 상태 | 추가 | 삭제 |
|---|:--:|---:|---:|
| `.kanban/archive.jsonl` | M | 1 | 0 |
| `.kanban/log.md` | M | 1 | 1 |
| `.kanban/state.json` | M | 23 | 14 |
| `CLAUDE.md` | M | 17 | 1 |
| `KANBAN.batches/KAN-074-MQ9KRB.batch1.md` | M | 109 | 0 |
| `KANBAN.batches/KAN-074-MQ9KRB.batch2.md` | M | 76 | 0 |
| `KANBAN.batches/KAN-074-MQ9KRB.batch3.md` | M | 58 | 0 |
| `KANBAN.board.html` | M | 4 | 4 |
| `KANBAN.cards/KAN-074-MQ9KRB.md` | M | 212 | 0 |
| `KANBAN.md` | M | 8 | 6 |
| `KANBAN.reports/KAN-074-MQ9KRB.report.html` | M | 555 | 0 |
| `design-concept/DESIGN_CONCEPT.md` | M | 24 | 0 |
| `design-concept/UI_CONSISTENCY_AUDIT.md` | M | 11 | 0 |
| `package.json` | M | 1 | 0 |
| `scripts/compare-render.ts` | M | 670 | 0 |
| `scripts/lib/tokens/color.ts` | M | 3 | 3 |
| `scripts/lib/tokens/docrule.ts` | M | 1 | 1 |
| `scripts/lib/tokens/exceptions.ts` | M | 48 | 2 |
| `scripts/tokens-baseline.json` | M | 10 | 54 |
| `src/components/posts/auth-authz-1/AuthzMap.tsx` | M | 19 | 19 |
| `src/components/posts/auth-authz-2/JwtVerifyLab.tsx` | M | 23 | 23 |
| `src/components/posts/auth-authz-3/PkceFlowStepper.tsx` | M | 26 | 24 |
| `src/components/posts/auth-authz-4/AuthRequestLab.tsx` | M | 15 | 15 |
| `src/components/posts/container-anatomy-1/OverlayLab.tsx` | M | 21 | 21 |
| `src/components/posts/container-anatomy-2/DigestChain.tsx` | M | 19 | 19 |
| `src/components/posts/container-anatomy-3/CriCallTrace.tsx` | M | 22 | 22 |
| `src/components/posts/osi-7-layers-1/EncapsulationLab.tsx` | M | 7 | 7 |
| `src/components/posts/osi-7-layers-1/LayerTriage.tsx` | M | 12 | 12 |
| `src/components/posts/osi-7-layers-2/FrameAnatomy.tsx` | M | 14 | 14 |
| `src/components/posts/osi-7-layers-2/SwitchLearningLab.tsx` | M | 28 | 28 |
| `src/components/posts/osi-7-layers-3/HopJourney.tsx` | M | 29 | 29 |
| `src/components/posts/osi-7-layers-3/RoutingTableLab.tsx` | M | 19 | 19 |
| `src/components/posts/osi-7-layers-4/HandshakeLab.tsx` | M | 20 | 20 |
| `src/components/posts/osi-7-layers-4/SlidingWindowLab.tsx` | M | 16 | 16 |
| `src/components/posts/osi-7-layers-5/EncodingLab.tsx` | M | 18 | 18 |
| `src/components/posts/osi-7-layers-5/TlsHandshakeLab.tsx` | M | 21 | 21 |
| `src/components/posts/osi-7-layers-6/DnsResolveLab.tsx` | M | 19 | 19 |
| `src/components/posts/osi-7-layers-6/RequestJourneyLab.tsx` | M | 19 | 19 |
| `src/components/posts/tauri-2/PermissionGate.tsx` | M | 16 | 16 |
| `src/components/posts/vpn-anatomy-1/ObserverView.tsx` | M | 17 | 17 |
| `src/components/posts/vpn-anatomy-2/NonceReuseLab.tsx` | M | 31 | 31 |
| `src/components/posts/vpn-anatomy-3/IkeHeaderDissector.tsx` | M | 9 | 9 |
| `src/components/posts/vpn-anatomy-3/ProposalTreeBuilder.tsx` | M | 10 | 10 |
| `src/components/posts/vpn-anatomy-4/AntiReplayLab.tsx` | M | 19 | 19 |
| `src/components/posts/vpn-anatomy-4/EspOverheadLab.tsx` | M | 18 | 18 |
| `src/components/posts/vpn-anatomy-5/CryptokeyRoutingLab.tsx` | M | 22 | 22 |
| `src/components/posts/vpn-anatomy-6/OpcodeByte.tsx` | M | 20 | 20 |
| `src/components/posts/vpn-anatomy-7/SplitTunnelLab.tsx` | M | 18 | 18 |
| `src/components/posts/webrtc-1/IceTraversalLab.tsx` | M | 15 | 15 |
| `src/components/posts/webrtc-1/LoopbackNegotiationDemo.tsx` | M | 15 | 15 |
| `src/components/posts/webrtc-1/SdpNegotiationStepper.tsx` | M | 17 | 17 |
| `src/components/posts/webrtc-2/JitterBufferLab.tsx` | M | 24 | 24 |
| `src/components/posts/webrtc-3/ParticipantScaleLab.tsx` | M | 15 | 15 |

**롤백 태그 0개** — 없음(`--tags` 를 넘기지 않았거나 아직 태그가 없습니다)

## 2. 검증 — 기준과 실행 결과

<!-- 기준은 카드 실행 문서 「검증」 절의 사본이다. 정본은 KANBAN.cards/KAN-074-MQ9KRB.md 이므로
     기준이 바뀌면 그쪽을 고치고 review-init --refresh 로 이 항만 다시 뜬다.
     결과는 착수한 쪽이 이미 돌린 것이다 — 검토자에게 다시 돌리라고 시키지 않는다.
     **다시 돌려 아래와 다르게 나오면 그 자체가 반려 사유다.** -->

**기준**

<!-- 무엇을 실행해 무엇이 나오면 이 카드가 끝난 것인가. -->
1. **래칫 0** — `bun run tokens:verify` 가 **위반 0 · 드리프트 0**(예외로 등록한 잔여가 있으면
   그 건수와 근거 문서 위치까지)을 내고 exit 0. 손으로 세지 않는다.
2. **자가검사가 살아 있다** — 맨몸 실행이 "정상 1 + 고장 9종, 사유 9가지". **기준선 갱신보다
   먼저** 확인한다 — 죽은 게이트와 다 갚은 게이트는 화면에서 같은 모양이고, 래칫은 "줄었다"를
   통과로 읽는다.
3. **드리프트 구간은 화면 변화 0** — 배치1 이 고친 34파일에 대해 격리 사본(자기 파일만
   `git show HEAD:`)으로 전후 두 벌을 구워 `getComputedStyle` 전수 대조. **차이 0.** 인라인
   hex 셀렉터를 안 쓰고(React 가 `rgb()` 로 정규화한다) 셀렉터에 리터럴을 안 박는다.
4. **하네스가 죽지 않았다** — 3번의 0건을 믿기 전에 고장을 주입해 무는지 본다. 두 갈래를
   모두 — 토큰 이름 지우기(이름 감사만 문다) · 값 지역 반전(화면 대조만 문다).
5. **위반 구간은 유저 판정과 일치한다** — S5 판정표의 각 결정이 실제 코드에 그대로 반영됐는지
   값 단위로 대조하고, 판정과 다르게 간 자리는 0. 화면 변화는 글마다 문서 높이·오버플로·새로
   잘린 요소로 기록한다(1280 · 390px).
6. **회귀 없음** — `bun run build` · `viz:verify` · `deco:verify` · `width:verify` ·
   `talk:verify` · `check-post-markers` · `check-emphasis`(+`--dist`) · `check-quote-blocks` ·
   `gen:motion` 후 `motion.css` 드리프트 0 · `tsc --noEmit` 신규 0.
   `graph:verify` 는 `src/data`·`src/content` 를 안 건드리므로 대상 밖이다.
7. **CI 가 안 빨개진다** — 부채 상환과 기준선 갱신이 **같은 커밋**에 들어간다. 게이트는
   `build` 잡 안에서 `astro build` 앞에 돌고 `deploy` 가 `needs: build` 라, 나누면 그 사이
   푸시에서 사이트 배포가 멈춘다.
8. **하드월로 안 올렸다** — 래칫이 0 이어도 `verify-tokens.ts` 의 판정 방식은 그대로다.
   승격이 KAN-075~077 뒤라는 근거가 `CLAUDE.md` 에 적혀 있다.

**실행 결과**

```text
— tokens:verify —
  · 예외 5건 — motion-css-generated(scan+verdict, 근거 2) · viz-css-vendored(scan, 근거 1) · accent-bar-5px(verdict, 근거 1) · kraft-toggle-set(verdict, 근거 1) · apply-viz-generated(scan, 근거 1)
  · 자가검사: 정상 1 + 고장 9종, 사유 9가지
  · color / 정당한 예외 4건
  · stroke / 정당한 예외 4건
  · 기준선과 같다.
  · 래칫 기준(제외분 빼고 · fallback 포함 — 지금 고쳐야 할 것): 정당한 예외 8 · 준수 3571 · 판정 불가 953
✓ 토큰 게이트 통과.

— 회귀 —
build 46쪽 OK · tsc(posts) 신규 0 · viz/deco/talk/width verify OK
check-post-markers OK · check-emphasis OK · --dist OK · check-quote-blocks OK · gen:motion 드리프트 0

— 화면 (compare-render, getComputedStyle 전수) —
배치1(드리프트 608): 24쪽 x 뷰포트 2 x 상태 9 에서 차이 0
배치2(위반 170): 높이 바뀐 지면 45곳 전부 감소 · 늘어난 곳 0 · 최대 -0.26%(auth-authz-2 desktop 15212.1 -> 15172.5)
가로 넘침 961 -> 952 (새 넘침 0). 961 은 선행 상태이고 대부분 가로 스크롤 컨테이너 안이다

— 하네스 자가검사 —
잡음 0 · 고장1 맨 var() 토큰 삭제 80건 · 고장2 값 반전 80건 · 고장3 셀렉터 0곳 대 계산값 1770곳
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
python3 scripts/kanban.py review-judge <project-root> --card KAN-074-MQ9KRB --item <번호> --verdict 승인
# 추가 의견
python3 scripts/kanban.py review-note <project-root> --card KAN-074-MQ9KRB --item <번호> --text "<추가 의견>"
# 추가 의견을 반영하다 새 의견이 생겼으면 (맨 뒤에 붙어 앞 번호가 안 밀립니다)
python3 scripts/kanban.py review-item <project-root> --card KAN-074-MQ9KRB --add "<주제>
  <상세>"
```

**전체 승인은 살아있는 항목이 전부 승인일 때만 섭니다**(철회는 분모에서 빠집니다). 하나라도
반려·추가 의견·미정이면 4항의 전체 승인도 `→ 완료` 이동도 종료코드 14로 거부됩니다.

- [ ] 게이트가 「0」인데 하드월로 안 올린 것에 동의하는가 — 안 올렸습니다
    - **상세** — 래칫이 0 이 되면 하드월(0건이면 통과)로 올린다는 것이 원래 계획이었습니다. 안 올린 이유는 뒤에 인식층을 더 여는 카드 셋이 서 있어서입니다 — KAN-075(여러 줄 CSS 선언 47건) · KAN-076(선 굵기 81건) · KAN-077(상수로 올린 리터럴 15건). KAN-073 이 인식층 셋을 열었을 때 실제로 0 이 778 로 다시 섰습니다. 지금 올리면 그 셋이 CI 를 빨갛게 만들며 착수하고, 게이트가 build 잡 안 astro build 앞에 돌며 deploy 가 needs: build 라 사이트 배포까지 멈춥니다. 원문: .github/workflows/main.yml:78 · 승격 조건을 고쳐 적은 자리는 CLAUDE.md:135

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 게이트에 자리 단위 예외(site)를 연 것이 이 카드 범위 안인가 — 열었습니다
    - **상세** — 카드 전략은 「인식층을 넓히지 않는다」였는데 예외 표는 인식층이 아니라 판정 층입니다. 연 이유는 유저 판정을 실행할 수단이 없어서입니다 — borderLeft 5px 4자리와 크래프트 네 색을 「그대로 둔다」로 판정받았는데 기존 예외는 파일 단위라 그 파일의 준수분과 다른 부채까지 판정에서 통째로 내려갑니다. KAN-072 가 구분 팔레트 11건을 예외로 안 올린 이유가 정확히 그것입니다. 바꾼 것은 선택 필드 하나와 호출부 둘입니다. 원문: scripts/lib/tokens/exceptions.ts:47 · scripts/lib/tokens/color.ts:131 · scripts/lib/tokens/docrule.ts:214

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 대조 하네스를 레포에 커밋한 것이 맞는가 — 커밋했습니다
    - **상세** — KAN-072 의 하네스는 스크래치패드에만 있었고 세션과 함께 사라졌습니다. 이 카드가 다시 지었고 KAN-075·076·077 이 또 지어야 합니다. 게이트가 아니라 개발 도구라 CI 에 안 물립니다(main.yml 변경 0). 안 커밋했을 때의 대안은 「세 번 다시 짓는다」이고 그때마다 조용히 통과하는 고장 셋을 다시 밟습니다 — 이 카드에서 셋을 다 밟았고 전부 코드로 막았습니다. 원문: scripts/compare-render.ts:1 의 머리주석 · package.json:16 · 고장 셋의 출처는 KANBAN.cards/KAN-072-CPJCT1.md:229

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 드리프트 치환에서 #b8b0a0 이 --fate-blocked-border 로 간 것을 그대로 둘 것인가 — 그대로 뒀습니다
    - **상세** — 그 자리의 글자 색 #b8b0a0 이 --fate-blocked-border 와 값이 정확히 같아 게이트의 D1(같은 표기) 규칙이 그 토큰을 가리켰고, 치환기는 값이 같은 것만 옮기므로 그대로 갔습니다. 화면 변화 0. 다만 역할로 보면 「테두리」 토큰을 글자 색에 쓴 것이라 어긋나고, 문서가 「--ink-muted 는 아직 한 값으로 모이지 않았다 — #b8b0a0 6자리가 남았다」고 적은 그 값이기도 합니다. 이번에 옮긴 것은 게이트가 무는 1자리뿐입니다. 원문: src/components/posts/osi-7-layers-3/HopJourney.tsx:213 · design-concept/DESIGN_CONCEPT.md:85

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 글 21편의 화면이 실제로 바뀐 것을 눈으로 봤는가 — 못 봤습니다. 수치로만 확인했습니다
    - **상세** — compare-render 는 계산된 스타일과 상자 크기를 전수로 재지 눈으로 보지 않습니다. 배치2 의 변화는 높이 기준 최대 -0.26% 이고 늘어난 지면이 없으며 새 가로 넘침이 없습니다. 그래도 「모서리 28자리가 6px 에서 8px 이 된 것」과 「반픽셀 글자 35자리가 정수로 접힌 것」이 실제로 어떻게 보이는지는 사람 눈으로만 판정됩니다. 워크트리에서 bun run build 뒤 bun run preview 로 보실 수 있고, 대상 글은 osi-7-layers 6편 · vpn-anatomy 7편 · container-anatomy 3편 · webrtc 3편 · auth-authz 4편 · tauri-2 입니다. 원문: scripts/compare-render.ts:200 의 「재는 속성은 좁히되 요소는 안 좁힌다」 절

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
     `review-judge --card KAN-074-MQ9KRB --verdict 승인` 이 이 자리를 쓰고
     frontmatter 의 status 도 함께 고친다. 손으로 적어도 되지만, 그때는 수렴 검사를
     안 거치므로 `validate` 가 항목 판정과 어긋난 승인을 error 로 잡는다. -->

**판정**: (아직 없습니다)

**판정 이력**:

- 승인이면 → `apply --op move --id KAN-074-MQ9KRB --to done` 뒤에 `main` 병합과 워크트리 정리(출력의 `cleanup`)
- 반려면 → `apply --op move --id KAN-074-MQ9KRB --to doing` 뒤에 `doc-log --entry "<반려 사유>"`.
  요청서는 **지우지도 다시 뜨지도 않는다** — 고친 뒤 그 항목을 `review-judge --verdict 승인` 으로
  뒤집으면 같은 문서에서 수렴한다. 1·2항이 낡았으면 `review-init --refresh` 로 그 두 항만 간다.
