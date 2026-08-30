---
card: KAN-077-RA2SYG
title: 게이트 회피 경로를 막는다 — 상수로 끌어올린 리터럴 15건을 판정에 넣는다
created: 2026-08-30
scope: scripts/lib/tokens/**, scripts/verify-tokens.ts, scripts/check-recognize-invariant.ts, scripts/fixtures/tokens/**, scripts/tokens-baseline.json, src/components/posts/osi-7-layers-3/**, src/components/posts/osi-7-layers-4/**, src/components/posts/osi-7-layers-5/**, src/components/posts/osi-7-layers-6/**, src/styles/tokens.css, design-concept/UI_CONSISTENCY_AUDIT.md, design-concept/DESIGN_CONCEPT.md, CLAUDE.md
---

# KAN-077-RA2SYG — 게이트 회피 경로를 막는다 — 상수로 끌어올린 리터럴 15건을 판정에 넣는다

## 전략
### 무엇이 뚫려 있나 — 「고치면 게이트가 조용해진다」

게이트는 값을 **값 자리에서** 본다. 그런데 값을 다른 줄의 `const` 로 끌어올리면 값 자리에
남는 것은 식별자뿐이라 인식층 다섯이 전부 그것을 버린다. 그래서 **판정 대기 리터럴을
상수로 올리기만 하면 게이트를 피할 수 있다.**

이것은 가정이 아니라 실측 전례다. `KANBAN.cards/KAN-072-CPJCT1.md` 의 S10 수행 내역이
그 자리를 적어 뒀다 — osi EP4~6 에서 `158→0` 을 만들었는데 그중 **토큰으로 닫힌 것이
152, 상수로 올려 시야를 벗어난 것이 6** 이었다. 그 6건(`#9a5b2c`)을 원래 인라인 자리로
**되돌려** 게이트가 다시 물게 했고, 되돌린 자리에 왜 상수로 안 올리는지 주석을 박았다.
지금 남아 있는 15건은 그때 「원래부터 게이트 시야 밖이던 값」이라 되돌리지 않고 둔 것이다.

래칫이 0 일 때 그 0 이 **닫힌 것과 숨은 것을 섞는다.** KAN-073·075·076 이 갈래 다섯을
연 것과 같은 종류의 구멍이고, 이것이 **마지막 갈래**다.

### 실측 — 15건, 3색, 6파일

```
$ (스타일 값 자리 안에서 참조되는 리터럴 const 선언)
osi-7-layers-3/HopJourney.tsx:16        SAND      = #e8c97a   color:border
osi-7-layers-3/RoutingTableLab.tsx:20   SAND      = #e8c97a   color:border · color:borderLeft
osi-7-layers-4/HandshakeLab.tsx:18      SAND      = #e8c97a   color:border
osi-7-layers-4/HandshakeLab.tsx:19      TEAL_TINT = #e5f0ed   color:background
osi-7-layers-4/HandshakeLab.tsx:20      MUTED     = #b8b0a0   color:color
osi-7-layers-4/SlidingWindowLab.tsx:28  MUTED     = #b8b0a0   color:color
osi-7-layers-5/EncodingLab.tsx:22       TEAL_TINT = #e5f0ed   color:background
osi-7-layers-5/TlsHandshakeLab.tsx:22   SAND      = #e8c97a   color:border
osi-7-layers-5/TlsHandshakeLab.tsx:23   TEAL_TINT = #e5f0ed   color:background
osi-7-layers-5/TlsHandshakeLab.tsx:24   MUTED     = #b8b0a0   color:color
osi-7-layers-6/DnsResolveLab.tsx:22     SAND      = #e8c97a   color:borderLeft
osi-7-layers-6/DnsResolveLab.tsx:23     TEAL_TINT = #e5f0ed   color:background
osi-7-layers-6/DnsResolveLab.tsx:24     MUTED     = #b8b0a0   color:color
osi-7-layers-6/RequestJourneyLab.tsx:24 TEAL_TINT = #e5f0ed   color:background
osi-7-layers-6/RequestJourneyLab.tsx:25 MUTED     = #b8b0a0   color:color
```

**전부 색 축이고 숫자 상수는 한 건도 없다.** 세 색은 각자 주석에 최근접 토큰과 색차를
달고 있다 — `SAND` 최근접 `--pop-tint` ΔRGB 50 · `TEAL_TINT` 최근접 `--paper` ΔRGB 17 ·
`MUTED` 최근접 `--border` ΔRGB 54. KAN-072 배치5 규약(「ΔRGB 15 이상은 임의로 고르지
않는다」)에 걸려 옮기지 않은 값이고, **근거를 걸 자리가 없어 게이트가 못 보는 상태**다.

### 기법이 앞의 다섯과 다르다 — 정규식이 아니라 사용처 추적이다

앞의 다섯은 전부 「값 자리에 적힌 리터럴」을 찾았다. 여기서 찾을 것은 **다른 줄에 적힌
리터럴**이라, 선언만 봐서는 그 상수가 시각 값인지 알 수 없다. `const TOTAL = 12` 와
`const SAND = "#e8c97a"` 를 문법으로는 못 가른다.

그래서 **사용처가 축을 정한다.** 값 자리에서 참조되면 그 자리의 속성이 축이고,
참조가 없으면 히트를 안 낸다.

**범위를 값 자리로 한정하는 것이 이 인식기의 전부다.** 한정을 풀면 SVG 기하 데이터가
쏟아진다 — 실측으로 넷이 그렇다: `lib/viz/ProcessSteps.tsx:44` 의 `BADGE_R = 18`
(`height: Math.max(blockH, BADGE_R * 2)` — 평범한 객체 반환값이지 스타일이 아니다) ·
`lib/viz/Comparison.tsx:64` 의 `PANE_BOTTOM_PAD = 20` · `graph/GraphExplorer.tsx:76` 의
`W = 900` · `AuthorLineup.astro:53` 의 `SAG = 46`. 넷 다 값 자리 밖이라 범위를 지키면
저절로 빠진다. `styleNum`(갈래 A)이 같은 이유로 범위를 `style={{…}}` 와 `CSSProperties`
두 자리로만 연 그 기계를 **그대로 쓴다.**

### 어떻게 붙이나 — 여섯째 인식기

KAN-073·075·076 이 세운 규약 그대로다. **옛 정규식(`DECL`·`ATTR`·`JSXOBJ`)도 `AXIS` 표도
한 글자 안 고친다** — 고치면 감사 원자료 3,539 히트와의 대조가 깨지고, 그 붕괴는 빌드도
타입도 게이트도 초록인 채로 일어난다.

- `scripts/lib/tokens/recognize/constRef.ts` 를 여섯째 인식기로 붙인다(`src` 라벨 `const-ref`).
- 파일마다 ① 리터럴을 든 `const` 선언표를 만들고 ② 값 자리에서 그 식별자를 찾아
  ③ **선언 자리에 히트를 낸다.** 축은 참조된 속성에서 온다.
- 판정은 `color.ts`·`docrule.ts` 가 지금 코드 그대로 진다 — 값이 `#e8c97a` 라는 사실은
  인라인이든 상수든 같으므로 판정 코드에 분기가 생길 이유가 없다.

**히트를 선언 자리에 내는 것이 규칙이다.** 참조마다 내면 같은 값을 여러 번 세고(실측
15선언 · 45참조), 무엇보다 「고치는 법」이 45줄을 가리키는데 실제로 고칠 곳은 15줄이다.
한 상수가 두 축에서 쓰이면 축마다 한 건 — 지금 레포에는 그런 자리가 0건이다.

**`var(--x, fallback)` 을 든 상수는 안 문다.** 그쪽은 이미 `fallback` 축 관할이고
(실측 521자리 중 지역 변수 30), 겹쳐 물면 같은 자리를 두 축이 센다. 실제로 이 여섯
파일의 `INK`·`PANEL`·`HAIR`·`BORDER` 가 전부 그 꼴이다.

### 무엇을 안 하나

- **숫자 상수를 안 연다.** 값 자리에서 참조되는 숫자 상수가 실측 **0건**이라 열어도 얻을
  것이 없고, 범위를 넓히는 순간 위 SVG 기하 넷이 들어온다. 「0건이라 안 연다」가 아니라
  **「0건인 동안 안 연다」**이고, 인식기는 숫자도 같은 경로로 다루므로 그 자리가 생기면
  코드 수정 없이 저절로 걸린다.
- **`.ts` 를 스캔 범위에 넣지 않는다.** 감사 §6-1 이 소유한 별건이다(KAN-076 과 같은 이유).
- **하드월 승격을 안 한다.** 이 카드가 마지막 인식 갈래를 열지만, 승격 조건은
  「인식층이 다 열린 뒤의 **래칫 0**」이라 부채 처분이 끝난 뒤에 별건으로 판단한다.

### 부채 15건을 어떻게 처분하나 — 세 갈래를 재고 하나를 고른다

15건은 전부 색 축 위반으로 들어온다(세 값 다 토큰과 값이 안 같다). 갈래는 셋이고
**어느 것도 지금 단정하지 않는다** — S7 이 실측한 뒤 근거와 함께 검토서 판단 항목으로 낸다.

| 갈래 | 무엇 | 선례 |
|---|---|---|
| **토큰 신설** | 역할이 일관된데 이름이 없는 자리에 토큰을 세운다 | KAN-072 S2 보강이 `--ink-accent`·`--danger` 를 그렇게 세웠다 |
| **`color-mix` 환산** | 상태 배경 틴트를 기존 토큰의 옅은 단으로 | KAN-072 S13 이 **같은 값** `#e5f0ed` 를 `--cat-skills 11%` 로 옮겼다 |
| **자리 단위 예외** | 값을 안 고치고 근거 문서 위치를 걸어 내린다 | KAN-076 S7 의 `doodle-crayon-stroke` |

**파일 단위 예외는 안 쓴다** — 그 파일의 준수분과 다른 부채까지 판정에서 통째로 내려간다
(KAN-074 가 정한 규약).

## 실행 계획
work 는 `S<n>` 하나가 단위다. 완료 기준을 각 단계에 달았다.

- [ ] `S1` 실측을 굳힌다 — 리터럴 상수 전수와 그 참조 자리
      완료 기준: `src/**` 의 리터럴 `const` 선언 전수와, 그중 **스타일 값 자리에서
      참조되는 것**이 나뉘어 나온다. 계획이 적은 **15선언 · 3색 · 6파일 · 전부 색 축**과
      **값 자리에서 참조되는 숫자 상수 0건**이 재현된다. 재현되지 않으면 그 차이를 먼저
      적고 계획을 고친다(KAN-076 이 카드 메모의 갈림선·예시·건수를 다 정정한 선례).
      `.astro` 인라인 `style="…"` 과 템플릿 안 참조도 함께 센다 — 계획의 15는 style 객체
      기준이라 그 둘이 더 있으면 수가 늘어난다.

- [ ] `S2` 여섯째 인식기 `recognize/constRef.ts` — 선언표 + 사용처 추적
      완료 기준: `const SAND = "#e8c97a"` 가 `style={{ border: \`… ${SAND}\` }}` 에서
      참조될 때 **선언 줄**에 색 축 히트가 뜬다. 넷이 함께 확인된다 — ① 참조 없는 리터럴
      상수는 히트 0 ② `var(--x, #hex)` 상수는 히트 0(`fallback` 축 관할) ③ 값 자리 밖
      참조(`height: BADGE_R * 2` 같은 평범한 객체)는 히트 0 ④ 한 상수가 두 속성에서
      쓰여도 같은 축이면 히트 1.

- [ ] `S3` 판정 — 축 모듈은 한 줄도 안 고친다
      완료 기준: `bun run tokens:verify` 가 새 히트를 기존 색 축 판정으로 그대로 문다.
      `color.ts`·`docrule.ts` 에 `const-ref` 분기가 **0개**여야 한다 — 값이 `#e8c97a` 인
      사실은 인라인이든 상수든 같다. 위반 증분이 실측(15 예상)과 일치한다.

- [ ] `S4` 자가검사 — `constRef.faults` 와 고장 픽스처
      완료 기준: 고장 둘이 각자 다른 `(판정, 사유, 인식 경로)` 로 걸린다. ① 상수로 올린
      토큰 밖 색 → `위반 / color 축 / const-ref` ② 상수로 올린 **드리프트**(토큰과 값이
      같은 리터럴) → `드리프트 / D1 같은 표기 / const-ref`. 자가검사 줄이 고장 14종·
      사유 14가지로 늘고, 기준선의 `selfTestFaults` 도 함께 오른다(KAN-076 S8 이 세운
      자기 축소 게이트).

- [ ] `S5` 불변 증명 + 기준선 갱신 — **같은 커밋에서**
      완료 기준: `bun run tokens:invariant -- --before <착수 직전 스냅샷> --self-test` 가
      옛 히트 증분 **0** · 새·옛 인식 경로 겹침 **0** · 겹침 가드 자가검사 통과로 끝난다.
      갱신한 `scripts/tokens-baseline.json` 이 같은 커밋에 든다 — 나누면 그 사이 푸시에서
      CI 가 빨개져 사이트 배포가 멈춘다.

- [ ] `S6` 문서 — 갈래를 코드 밖에도 적는다
      완료 기준: ① 감사 정본 `UI_CONSISTENCY_AUDIT.md` §6 에 **이 갈래 항목을 신설**한다
      (지금 §6 에 상수 승격 항이 아예 없다 — 안 본 것을 안 봤다고 적지도 않은 자리다).
      ② `CLAUDE.md` 의 인식층 문단을 다섯째 → 여섯째로 갱신하고 「아직 안 연 갈래 하나」를
      **없앤다** — 그 문장이 이 카드로 참이 아니게 된다. 하드월 승격 조건 문장도 함께 고친다.
      ③ 되돌림 전례(KAN-072 S10)가 이제 게이트로 막힌다는 사실을 적는다.

- [ ] `S7` 부채 15건 처분 — 세 갈래를 재고 하나를 고른다
      완료 기준: 세 색마다 ① 최근접 토큰과 ΔRGB ② `color-mix` 로 재현 가능한지(가능하면
      그 비율과 오차) ③ 역할이 일관된지(같은 뜻으로 쓰이는 자리 수)를 실측해 표로 낸다.
      그 표를 근거로 갈래 하나를 골라 실행하고, **고른 이유와 버린 이유**를 수행 내역에
      남긴다. 값을 실제로 고쳤으면 `bun run render:compare` 로 화면 무변경(또는 변경분)을
      증명한다. 래칫이 0 으로 돌아오면 그 사실을, 안 돌아오면 남은 수와 사유를 적는다.

- [ ] `S8` 최종 검증 + 검토서
      완료 기준: 아래 「검증」 표 전건이 통과하고, 그 출력이 검토서 2항에 실린다.
      판단 항목에 **S7 의 처분 갈래 선택**이 근거와 함께 올라간다.

## 검증
착수한 쪽이 **먼저 돌리고 결과를 검토서에 싣는다.** 검토자에게 다시 시키지 않는다.

| # | 명령 | 통과 기준 |
|---|---|---|
| 1 | `bun run tokens:verify` | 종료 0. `const-ref` 히트가 새로 서고, 자가검사 줄이 고장 14종·사유 14가지 |
| 2 | `bun run tokens:invariant -- --before <착수 직전 스냅샷> --self-test` | 종료 0. 옛 히트 증분 **0** · 새·옛 인식 경로 겹침 **0** · 겹침 가드 자가검사 통과 |
| 3 | 인식기 죽이기 | `RECOGNIZERS` 에서 `constRef` 를 빼면 `tokens:verify` 가 **빨개져야 한다**(KAN-076 S8 의 `selfTestFaults` 래칫이 문다). 안 빨개지면 그 고장은 있어 보이기만 하는 검사다 |
| 4 | 회피 경로 재현 | 아무 값 하나를 인라인에서 `const` 로 끌어올려 본다. 게이트가 **여전히 물어야 한다** — 이 카드가 막으려던 것이 정확히 그 동작이고, 안 물면 인식기가 그 형태를 못 보는 것이다 |
| 5 | `bun run build` | 종료 0 |
| 6 | `bunx tsc --noEmit` | 고친 파일 에러 0 |
| 7 | `bun run render:compare` | **S7 이 값을 실제로 고쳤을 때만.** 격리 사본 둘(내 파일만 `HEAD` / 지금)을 각각 구워 `getComputedStyle` 로 전수 대조 — 의도한 변경분 외 0. 값을 안 고쳤으면 이 줄은 「해당 없음」으로 적고 8번이 그것을 판정한다 |
| 8 | `git diff --stat -- src/` | S7 이 값을 안 고쳤으면 **빈 출력**. 고쳤으면 그 파일 목록이 S7 이 적은 목록과 정확히 같아야 한다 |
| 9 | `bun run viz:verify` · `deco:verify` · `talk:verify` · `check-post-markers` · `check-emphasis`(+`--dist`) | 전부 종료 0. S7 이 발행 글의 시뮬을 건드리므로 회귀 그물을 다 친다 |

착수 직전 스냅샷 뜨는 법(2번):

```
git stash && bun scripts/verify-tokens.ts --json --no-self-test > /tmp/kan077-before.json && git stash pop
```

**`graph:verify` 는 이 카드의 통과 기준이 아니다.** 재생성이 main 워크트리 전용이라
카드 브랜치에서 못 돌리고, `src/data/`·`src/content/` 를 안 건드리므로 이 카드가 만든
상태가 아니다(KAN-072 배치5 가 같은 사유로 뺐다).

## 수행 내역
<!-- KANBAN:LOG append-only — 아래로만 덧붙인다. 위를 고치지 않는다. -->
- 2026-08-30T15:04 · s:0a6f09b5 — `전략` 섹션 교체
- 2026-08-30T15:05 · s:0a6f09b5 — `실행 계획` 섹션 교체
- 2026-08-30T15:06 · s:0a6f09b5 — `검증` 섹션 교체
