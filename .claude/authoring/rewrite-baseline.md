# 기존 발행글 재집필 — 실측 기준선 (KAN-064)

> 잰 날: 2026-08-04 · 대상: `src/content/posts/` 29편 전수
> 잰 방법: `scan_ai_style.py --voice <frontmatter author> --json <file>` (authoring-kit 0.2.0)
> 이 문서는 **재집필 대상 선정의 근거**다. 규칙이나 voice 를 고치면 다시 재고 이 표를 갱신한다.

## 왜 재는가

집필 엔진이 2026-08-02~08-04 사이에 바뀌었다(L0 공통원칙 / L1 퍼소나 / L2 글 명세로 소유권 분리,
`humanize-post` 신설, 두들 마크). **발행 29편의 최신 pubDate 는 2026-07-28** 이라 전부 구엔진 산물이다.
"전부 다시 쓴다"는 판단은 비싸고 되돌릴 수 없으므로, 무엇이 실제로 어긋났는지 먼저 쟀다.

## 결론

**전면 재집필은 근거가 없다.** 기계 리듬(machine-rhythm) 축에서 합격선(B) 미달은 17편이지만,
치명(S1) 위반의 실제 분량은 **문장 35개**이고 그중 32개가 쉼표 과다(P1) 하나다.
필요한 것은 재집필이 아니라 ① 엔진 정합 ② 문장 단위 윤문 ③ 스캐너가 못 보는 축의 표본 정독이다.

## 등급 실측

등급 기준(L0 §자연스러움 등급): A = S1 0 · S2 ≤2 / B = S1 0 · S2 3~5 / C = S1 1~2 또는 S2 ≥6 / D = S1 ≥3.
단위는 **적발된 코드 수**(한 코드가 몇 번 걸렸든 1개). 합격선은 B.

| 글 | voice | 현재 | Phase 0 후 | 남는 S1 |
| --- | --- | --- | --- | --- |
| osi-7-layers-1 | researcher | A | A | — |
| osi-7-layers-3 | researcher | A | A | — |
| osi-7-layers-4 | researcher | A | A | — |
| osi-7-layers-5 | researcher | A | A | — |
| osi-7-layers-6 | researcher | A | A | — |
| osi-7-layers-2 | researcher | B | **A** | — |
| auth-authz-1 | researcher | B | B | — |
| auth-authz-2 | researcher | B | B | — |
| auth-authz-4 | researcher | B | B | — |
| vpn-anatomy-2 | researcher | B | B | — |
| vpn-anatomy-3 | researcher | B | B | — |
| webrtc-2 | researcher | B | B | — |
| container-anatomy-2 | teacher | C | **B** | — |
| tauri-1 | researcher | C | **B** | — |
| vpn-anatomy-5 | researcher | D | **C** | P1(2) R1a(1) |
| algorithm-at-40-prologue | ppangto | C | C | P1(4) H4(1) |
| aside-arc | ppangto | C | C | P1(6) |
| welcome | ppangto | C | C | P1(1) |
| auth-authz-3 | researcher | C | C | P1(1) |
| container-anatomy-1 | teacher | C | C | P1(1) |
| container-anatomy-3 | teacher | C | C | P1(1) |
| container-anatomy-4 | teacher | C | C | P1(3) |
| tauri-2 | researcher | C | C | P1(1) |
| vpn-anatomy-1 | researcher | C | C | P1(2) |
| vpn-anatomy-4 | researcher | C | C | P1(3) |
| vpn-anatomy-6 | researcher | C | C | P1(3) |
| vpn-anatomy-7 | researcher | C | C | P1(1) |
| webrtc-1 | researcher | C | C | P1(1) |
| webrtc-3 | researcher | C | C | P1(2) R1a(1) |

분포: 현재 **A 5 · B 7 · C 16 · D 1** → Phase 0 후 **A 6 · B 8 · C 15 · D 0**.

고칠 문장 총량: **P1 32문장(15편) · R1a 2건(2편) · H4 1건(1편)**.

## Phase 0 — 글을 건드리기 전에 엔진부터 맞춘다

글을 고쳐 스캐너를 만족시키기 전에, **스캐너와 voice 가 맞는 말을 하고 있는지** 먼저 봐야 한다.
아래 셋은 글의 결함이 아니라 엔진의 결함이고, 안 고치면 재집필 대상 선정 자체가 틀어진다.

### (1) `ppangtolab-researcher` 가 `status: "draft"` 다 — **유저 결정 필요**

`authoring.py resolve` 가 이렇게 경고한다:

```
⚠ 초안 상태다. 사람 승인 전까지 이 voice 로 발행하지 않는다.
```

그런데 **이미 22편이 이 voice 로 발행돼 있다.** 확정(`defined`)하든 고쳐서 확정하든 정하지 않으면
재집필 결과물도 같은 경고를 달고 나간다. voice 의 내용은 퍼소나 정체성이라 AI 가 임의로 정할 수 없다.

덧붙여 이 voice 의 `source.note` 는 스스로 이렇게 적고 있다 — *"발행 22편에서 역추출하지 않고 선언했다.
그 글들은 voice 문서 없이 쓰였고, 무엇이 이 퍼소나의 색이고 무엇이 그때그때의 편차인지 글만 봐서는
가릴 수 없다."* 재집필의 기준선이 되는 문서가 그 글들을 안 보고 쓰였다는 뜻이다.

### (2) `ppangtolab-*` 세 voice 의 `waivers` 가 비어 있다

L0_MACHINE_RHYTHM 은 R1b(종결형 4연속)에 대해 이렇게 적었다 — *"격식체 통일을 자기 톤으로 선언한
voice 에서는 R1b 가 waiver 대상이 되는 것이 정상이다."* researcher 의 register 는 `'~합니다 / ~했습니다'`,
teacher 는 존댓말 설명체다. 둘 다 해당하는데 `waivers: []` 라 **21편이 R1b 로 감점**됐다.

이건 글을 고쳐 맞출 문제가 아니라 voice 가 선언해야 할 문제다. 사람(`ppangto`)의 voice 에는
R1b·R2·F4 waiver 가 이미 있다 — AI 퍼소나 셋만 비어 있다.

> waiver 를 넣으면 `container-anatomy-2` · `tauri-1` 이 C→B 로, `osi-7-layers-2` 가 B→A 로 올라간다.
> **등급을 올리려고 넣는 게 아니라, 넣지 않으면 그 글들을 잘못 고치게 되기 때문에** 먼저 한다.

### (3) 스캐너 오탐 1건 — `♭` 가 이모지로 잡힌다

`vpn-anatomy-5` 의 유일한 D 등급은 P3(본문 이모지) 때문인데, 실제로 걸린 문자는 **`♭`(U+266D)** 하나다.
WireGuard 백서의 `"32♭"` 표기를 인용한 자리다. 스캐너의 `EMOJI` 정규식이 `U+2600–U+26FF`(기타 기호)를
통째로 포함해서 음악 기호를 집었다. 저장소 자체 게이트(`bun scripts/check-post-markers.ts`)는 **통과한다** —
둘이 어긋나면 게이트 쪽이 맞다.

L0 §"스캐너 오탐 예외 5종"과 같은 방식으로 예외 + 단위 테스트를 추가한다(오탐 케이스와 진짜로
잡아야 하는 케이스를 함께 넣어, 예외를 넓히다 탐지력을 죽이지 않았는지 확인한다).

## 세다가 틀렸던 것 — 같은 함정을 다시 밟지 마라

재집필 범위를 부풀릴 뻔한 오측 둘을 기록해 둔다. **둘 다 한글에 단어 경계(`\b`)가 없어서 생긴 병**이고,
L0 가 D6 항목에서 이미 경고한 것과 같은 종류다.

| 처음 나온 수 | 실제 | 왜 틀렸나 |
| --- | --- | --- |
| 개인 경험 사칭(`제가`/`저는`) **18편** | **0건** | `문제가` 의 "제가", `브라우저는` 의 "저는" 을 집었다. 앞 글자가 한글이 아닐 때만 세면 0이다 |
| 가르치는 말투 **18편** | **11건 / 8편**, 대부분 정상 | `보겠습니다` 를 함께 세서 부풀었다. 남은 11건도 대부분 `~라고 해 봅시다`(가정 도입)라 voice 가 금지한 강의 진행 말투가 아니다 |

## 스캐너가 보지 않는 축 — 진짜 재집필 대상은 여기서 나온다

`scan_ai_style.py` 는 **machine-rhythm 한 축만** 본다. 나머지는 자동 판정이 없다.

| 축 | 소유 | 자동 판정 | 현재 파악 |
| --- | --- | --- | --- |
| `machine-rhythm` | L0 | **있다**(위 표 전부) | 완료 |
| `grammar` (조사 오류) | L0_NATURAL_KOREAN | 없다 | **26편 전수 정독 완료(2026-08-04) — 아래 절** |
| `evidence` · `comprehension` | L0_PRINCIPLES · QUALITY_RUBRIC | 없다 | **미측정** |
| voice 일치(register·rhythm·device·lexicon) | L1 | 없다 | **미측정** — 글들이 voice 문서보다 먼저 쓰였다 |
| 글 골격 | L2 `tech-deepdive` | 없다 | 표본 4편 확인, 대체로 맞음 |

L2 골격이 대체로 맞는 데는 이유가 있다 — **명세가 이 글들에서 뽑혔다**(`spec.md` 의 참조 구현이
`vpn-anatomy-1` · `container-anatomy-1`). 다만 표본에서 어긋난 것 하나: **`tauri-1` 에 `들어가며`(intro)
절이 없다** — 명세의 필수 항목인데 `한눈에 보기`로 바로 시작한다.

## 조사 오류·구조적 자기모순 전수 재검사 (2026-08-04, KAN-064 재개)

`scan_ai_style.py` 가 못 보는 축이라고 위 표에 적어만 두고 넘어갔던 것을, `vpn-anatomy-7` 을 실제로
정독하다 걸린 결함(조사 오류 9건 + "네 개의 운영 함정"이라 못박고 kill switch 절에서 스스로
"함정이 아니라 함정을 막는 장치"라 부정하는 자기모순 1건)을 계기로 **표본이 아니라 ppangtolab 보이스
26편(.mdx) 전수**를 5그룹으로 나눠 병렬 정독했다. 두 축만 본다: (a) 받침 없는 명사에 받침용 조사가
붙는 오류(예: "갈래"+으로/은/을/과 — 올바르게는 로/는/를/와), (b) 제목·description·서론이 못박은
숫자·프레임을 본문이 스스로 뒤집는 구조적 자기모순.

| 글 | 조사 오류 | 구조적 자기모순 |
| --- | --- | --- |
| vpn-anatomy-7 | **9건**(desc, L50, L133/137/141/142/144/169, L157) | **있음** — "네 개의 운영 함정" 명시 후 kill switch 절이 스스로 "함정 아님"이라 부정 |
| webrtc-1 | 5건(desc L3, L32, L38, L42, L186) | 없음 |
| webrtc-3 | 3건(L127×2, L184) | 없음 |
| tauri-1 | 2건(L29, L166) | 없음 |
| container-anatomy-1 | 1건(L436, 기존 확인분) | 없음 |
| auth-authz-1 | 1건(L175) | 없음 |
| auth-authz-3 | 0건 | **있음** — "여섯 스텝" 표(L38~49)가 1단계="PKCE 준비"라 못박았는데, 실행 워크스루(L159~191)의 1단계는 표에 없던 "Discovery"로 바뀌고 PKCE 준비는 번호 체계에서 사라진다 |
| 나머지 19편(auth-authz-2/4·container-anatomy-2~4·osi-7-layers-1~6·tauri-2·vpn-anatomy-1~6·webrtc-2) | 0건 | 없음 |

**결론.** "전면 재집필은 근거가 없다"는 판단은 26편 중 24편에는 그대로 유지된다 — 이 축을 실제로
재봐도 깨끗했다. 다만 둘은 다르게 봐야 한다.

- **`vpn-anatomy-7` 은 윤문 대상이 아니라 부분 재집필 대상으로 재분류한다.** 조사 오류 9건이 전체
  적발분(21건)의 43%로 다른 어떤 글보다 압도적으로 많고, 자기모순은 이 26편 중 유일하게 "글의
  핵심 프레임 자체"(네 개의 함정)를 스스로 무너뜨리는 심각도다. 조사는 기계적으로 고칠 수 있지만
  "네 개의 함정" 프레이밍(제목·description·서론·마무리 4곳에 걸쳐 있다)은 kill switch를 뺀 세
  갈래로 다시 짜거나, kill switch를 진짜 함정으로 재정의하거나 둘 중 하나를 실제로 다시 써야
  풀린다 — 문장 단위 교정으로 안 끝난다.
- **`webrtc-1`·`webrtc-3`·`tauri-1`·`container-anatomy-1`·`auth-authz-1`** 은 조사 오류만 있고
  구조는 멀쩡하므로, 기존 계획대로 P1 윤문 라운드에 조사 교정만 얹으면 된다(재집필 아님).
- **`auth-authz-3`** 은 조사는 깨끗하지만 "여섯 스텝" 번호 체계가 실행 워크스루와 어긋난다 —
  Phase 3 표를 실행 절 제목과 일치시키는 국소 수정(PKCE 준비를 몇 단계로 넣을지 결정)이 필요하다.
  전면 재집필은 아니다.

**재현 방법 메모**: 정규식 하나로는 못 잡는다(한글 받침 유무 판정 + 조사 종류 매칭이 필요하고, 관형형
어미 "-는/-은/-가"·서술격조사 활용("갈래이다")과 혼동하기 쉽다). 이번엔 유니코드 종성 유무를 계산하는
스크립트 1차 스캔 + 수동 정독 교차검증으로 했다. 반복 작업이 되면 스크립트를 `scripts/` 에 정식으로
넣는 것을 고려한다(이 카드 범위 밖이라 지금은 안 함).

## 별건으로 발견한 문서 드리프트

`CLAUDE.md` 는 `src/lib/categories.ts` 를 "8 category slugs" 라고 적는데 실제로는 **9종**이다
(`planning` `architecture` `strategy` `skills` `learning` `design` `research` `quality` `leadership`).
L2 명세는 9종으로 맞게 적고 있다. 이 카드 범위 밖이라 고치지 않고 적어만 둔다.

## 재현

```bash
P=~/.claude/plugins/cache/centurio87-plugins/authoring-kit/0.2.0/scripts/scan_ai_style.py
python3 $P --voice ppangtolab-researcher --json src/content/posts/vpn-anatomy-5.mdx
```
