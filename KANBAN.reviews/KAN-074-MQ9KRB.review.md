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

**커밋 13건**

```text
659f44c kanban: KAN-074-MQ9KRB 검토로 이동 — 검토서 · 판단 항목 5 (KAN-074-MQ9KRB)
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

**변경 파일 57개 (+3926 −730)**

| 파일 | 상태 | 추가 | 삭제 |
|---|:--:|---:|---:|
| `.kanban/archive.jsonl` | M | 2 | 0 |
| `.kanban/log.md` | M | 2 | 2 |
| `.kanban/reviews/KAN-074-MQ9KRB.events.jsonl` | M | 11 | 0 |
| `.kanban/reviews/KAN-074-MQ9KRB.review.json` | M | 21 | 0 |
| `.kanban/state.json` | M | 37 | 26 |
| `CLAUDE.md` | M | 17 | 1 |
| `KANBAN.batches/KAN-074-MQ9KRB.batch1.md` | M | 109 | 0 |
| `KANBAN.batches/KAN-074-MQ9KRB.batch2.md` | M | 76 | 0 |
| `KANBAN.batches/KAN-074-MQ9KRB.batch3.md` | M | 58 | 0 |
| `KANBAN.board.html` | M | 4 | 4 |
| `KANBAN.cards/KAN-074-MQ9KRB.md` | M | 212 | 0 |
| `KANBAN.md` | M | 9 | 6 |
| `KANBAN.reports/KAN-074-MQ9KRB.report.html` | M | 555 | 0 |
| `KANBAN.reviews/KAN-074-MQ9KRB.review.html` | M | 1164 | 0 |
| `KANBAN.reviews/KAN-074-MQ9KRB.review.md` | M | 248 | 0 |
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
예외 5건(근거 전건 실재) · 자가검사 정상 1 + 고장 9종 사유 9가지 · 기준선과 같다
래칫: 위반 0 · 드리프트 0 · 정당한 예외 8 · 준수 3571 · 판정 불가 953
(착수 전: 위반 170 · 드리프트 608 · 준수 2795)

— 회귀 아홉 —
build 46쪽 · tsc(posts) 신규 0 · viz/deco/talk/width verify
check-post-markers · check-emphasis(+--dist) · check-quote-blocks · gen:motion 후 motion.css 드리프트 0

— 화면: 계산값 전수 대조 (compare-render, getComputedStyle) —
배치1(드리프트 608): 24쪽 x 뷰포트 2 x 상태 9 에서 차이 0
배치2(위반 170): 높이 바뀐 지면 45곳 전부 감소 · 늘어난 곳 0 · 최대 -0.26%
가로 넘침 961 -> 952(새 넘침 0). 961 은 선행 상태이고 대부분 가로 스크롤 컨테이너 안이다

— 화면: 실제 브라우저로 확인 (aside, 24쪽 전수) —
글자 크기가 바뀐 요소 116 · 줄 수가 바뀐 요소 10 · **줄이 늘어난 요소 0** · 요소 수 어긋난 쪽 0
줄이 바뀐 10건은 전부 줄어든 쪽(3->2, 2->1)이고 글자 크기는 그대로다.
원인을 끝까지 짚었다 — auth-authz-2 의 라벨에서 조상 padding 이 18->16px 이 되며 안쪽 폭이
586 -> 590px 로 넓어져 짧은 라벨이 더는 안 접힌다. 액자가 2px 줄었는데 글자 자리는 늘었다.
모서리는 vpn-anatomy-3 토글 버튼을 3.4배로 확대해 양쪽을 찍어 대조했다 —
확대해야 겨우 구별되고 1배에서는 구별되지 않는다. 같은 지면 radius 분포 6px10+10px2+8px1 -> 8px13.

— 하네스 자가검사 —
잡음 0 · 고장1 맨 var() 토큰 삭제 80건 · 고장2 값 반전 80건 · 고장3 셀렉터 0곳 대 계산값 1770곳

— 판정이 필요 없어 뺀 것 셋 (기록) —
1) 하드월 승격을 안 했다. 고를 여지가 없다 — 하드월에는 기준선이 없어서, 인식층을 여는
   KAN-075~077 이 새 위반을 들고 오는 순간 CI 가 빨개지고 deploy 가 needs: build 라
   사이트 배포가 멈춘다(main.yml:78). 승격 조건을 「인식층이 다 열린 뒤의 0」으로 CLAUDE.md:135 에 적었다.
2) 예외 표에 자리 단위 좁히기(site)를 열었다. 유저 판정(5px 막대·크래프트 네 색을 그대로 둔다)을
   실행할 다른 수단이 없었다 — 파일 단위로 걸면 그 파일의 준수분과 다른 부채까지 판정에서 내려간다.
   선택 필드 하나 + 호출부 둘이고, 안 쓰면 동작이 이전과 같다.
3) 「눈으로 봤는가」는 위 절에서 답했다. 물을 것이 아니라 하면 되는 일이었다.
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

- [ ] 비활성 글자 한 자리가 이름이 어긋난 토큰을 가리킵니다 — 값을 지킬까요, 이름을 지킬까요
    - **상세** — src/components/posts/osi-7-layers-3/HopJourney.tsx:213 은 step===0 일 때의 버튼 글자색이고 바로 옆 줄이 cursor: not-allowed 입니다. 곧 비활성 글자이고, 그것은 --ink-muted 의 문서상 역할과 정확히 같습니다(DESIGN_CONCEPT.md:72 「흐린·비활성 글자」). 그런데 지금은 --fate-blocked-border 를 가리킵니다. 게이트는 리터럴 값이 어떤 토큰의 값과 한 글자도 다르지 않으면 그 토큰을 가리키는데, #b8b0a0 이 그 토큰 값과 정확히 같았기 때문입니다. 치환기는 값이 같은 자리만 옮기므로 화면 변화는 0 이었습니다. --fate-blocked-border 는 구분 팔레트 --fate-blocked-* 세 색(배경·글자·테두리) 중 테두리이고(DESIGN_CONCEPT.md:127), 원래 쓰임은 SplitTunnelLab.tsx:51 의 border 입니다. --ink-muted 로 옮기면 색차 34.7 이라 눈에 보이게 흐려집니다. 같은 갈래를 이미 한 번 판정하셨습니다 — #a9a294 는 색차 11.5 라 --ink-muted 로 모으기로 했고, DESIGN_CONCEPT.md:85 는 #b8b0a0 6자리가 아직 남았다고 적고 있습니다(그중 게이트가 보는 것은 이 한 자리뿐입니다). 이 카드가 심은 823자리를 전수로 훑어 이름과 쓰인 자리가 어긋난 것은 이 하나뿐임을 확인했습니다

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] scripts/compare-render.ts 를 레포에 남길까요, 지울까요
    - **상세** — 670줄이고 CI 에 안 물립니다(main.yml 언급 0). 남기는 값은 KAN-075·076·077 이 같은 대조를 다시 필요로 한다는 것입니다 — KAN-072 의 하네스는 스크래치패드에만 있어 사라졌고, 이 카드가 다시 지으면서 조용히 통과하는 고장 셋을 실제로 밟았습니다(하드링크 사본이 원본 레포를 덮음 · 시간에 끌려다니는 값 · 브라우저가 죽어도 안 끝나는 대기). 지우는 값은 scripts/ 가 670줄만큼 가벼워진다는 것이고, 그때 세 카드는 각자 다시 지어야 합니다. 게이트 다섯(verify-tokens 142줄 · verify-deco 360줄 등)과 달리 이것은 판정을 안 하는 개발 도구라 CLAUDE.md 의 게이트 규약 대상도 아닙니다. 원문: scripts/compare-render.ts:1 머리주석 · package.json:16 · 고장 셋의 출처 KANBAN.cards/KAN-072-CPJCT1.md:229

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
