---
card: KAN-070-DRF0QF
title: UI 토큰 게이트를 세운다 — verify-tokens 래칫 신설과 집필 규칙 개정
created: 2026-08-25
scope: scripts/verify-tokens.ts, scripts/lib/tokens/**, scripts/fixtures/tokens/**, scripts/tokens-baseline.json, package.json, .github/workflows/main.yml, .claude/skills/react-sim/**, CLAUDE.md
---

# KAN-070-DRF0QF — UI 토큰 게이트를 세운다 — verify-tokens 래칫 신설과 집필 규칙 개정

## 전략
감사(`design-concept/UI_CONSISTENCY_AUDIT.md`)가 "첫 수는 게이트다"라고 정한 것을 그대로 따르되,
**형태를 하드월에서 래칫으로 바꾼다.**

**왜 래칫인가.** 감사 P3-1 은 "CI 하드 실패"라고 적었다. 그런데 지금 위반이 1,567건이라
그대로 CI 에 꽂으면 첫 푸시부터 빨간불이 되고, 더 나쁜 것은 `.github/workflows/main.yml` 이
`build` → `deploy`(`needs: build`) 한 잡이라 **게이트가 죽으면 사이트 배포가 통째로 멈춘다**는 점이다.
그러면 게이트가 첫 수가 아니라 마지막 수가 되고, 그 사이 새 리터럴 유입을 못 막는다.

**선례를 따르는 것이 아니라 선례를 못 따르는 이유가 규모다.** 이 레포의 성문 선례는
「다 갚고 하드월」 하나뿐이다 — `CLAUDE.md:212` 의 `check-post-markers` 가 KAN-062 로
옛 글 83건을 다 옮긴 뒤 올라갔다. 래칫은 이 레포에 전례가 없다. 83건과 1,567건은 자릿수가
다르고, "먼저 다 갚기"가 첫 수가 될 수 없는 것이 그 차이의 결과다.
0 으로 수렴하면 그때 순수 하드월로 승격한다.

**게이트의 정본은 문서가 아니라 `src/styles/tokens.css` 하나다.** 감사 판정기
`s4-docrules.py:23` 은 스케일을 코드에 박아 뒀다(`SPACING_SCALE`·`FONT_ROLES`).
그대로 올리면 KAN-072 가 `DESIGN_CONCEPT.md` §9 를 고쳐도 게이트는 옛 스케일로 판정한다.
문서를 정규식으로 파싱하는 것도 답이 아니다 — §9 는 산문 한 줄이고 §5 는 줄글이라 파서가
문서 서식에 묶인다. 색·radius 축은 이미 `tokens.css` 를 읽어 값→토큰 사전을 만든다
(`s3-scan.py:49-71`). KAN-072.2 가 `--space-*`·`--text-*` 를 세우면 **게이트는 문서를 아예 안 읽는다.**
그래야 이 카드(코드)와 KAN-072(데이터)의 의존이 경로 겹침 없이 한 방향으로만 흐른다.

**버린 대안 셋.**

- **하드월(감사 원안)** — 위 이유로 게이트가 마지막 수가 된다.
- **경고만(CI 에 넣되 실패 안 시킴)** — 아무도 안 본다. 게이트의 값은 막는 데 있다.
- **`HEAD` vs `HEAD^` 로 베이스라인 파일 없이 래칫** — 겹침이 0 이 되지만
  `actions/checkout@v7` 에 `fetch-depth: 2` 가 필요하고, squash 머지에서 "직전"이 흔들리며,
  "지금 N 에서 버틴다"는 의도를 사람이 읽을 수 없다.

**제약 넷.**

1. **`scripts/tokens-baseline.json` 은 이 카드 소유인데 KAN-072 가 갱신한다.** 경로로는 겹침이지만
   `motion.css` 와 같은 모양이다 — 커밋된 결정론적 생성물이고 갱신 명령이 정본이다.
   `dep-waive` 로 명시 용인한다. 스코프를 비틀어 없애려 들면 이 카드의 CI 활성화가
   KAN-072.1 완료에 묶여 병렬이 깨진다.
2. **감사와 똑같은 파일집합으로 먼저 짠다.** `.ts` 28개·`.mdx` 31개는 미측정이라 범위를 넓히면
   베이스라인이 감사 수치와 안 맞고, 그러면 P3-1 의 검증 기준("같은 수로 보고해야 한다")과
   부딪힌다. 확장은 별도 work 로 두고 상승분을 `doc-log` 에 남긴다.
2. **`AUTO-GENERATED` 파일 41개와 `src/styles/motion.css`·`viz.css` 는 스캔에서 뺀다.**
   앞은 `apply-viz` 생성물이고(발행 글에 원본 ```viz``` 블록이 0개라 지금은 재생성도 불가),
   뒤는 생성물·패키지 복제물이다.
3. **자가검사가 없으면 안 된다.** 1,567 → 0 으로 수렴하는 동안 게이트가 죽어도 카운트는
   계속 줄어든 것처럼 보인다. `verify-talk.ts:selfTestFaults()` 형식을 그대로 쓴다.

---

**수행 방식은 오케스트레이션이다 (유저 선택, 2026-08-25).** 배치 4개 · 병렬 폭 3.
단일 에이전트 3배치와 나란히 놓고 고른 결과다. 이 선택이 **전제 하나를 강제**하고,
그 전제가 다시 리스크 셋을 만든다. 셋 다 대책이 있어야 선택이 성립한다.

**전제 — 축을 파일로 분리한다.** `S3`·`S4`·`S5` 가 병렬로 돌려면 같은
`scripts/verify-tokens.ts` 를 세 세션이 동시에 못 고치므로 축마다 모듈을 갖는다.

```
scripts/verify-tokens.ts            진입점 — 규약을 지고, 축 모듈을 불러 모은다
scripts/lib/tokens/color.ts         S3 — 색·radius·선 굵기      ↔ s4-classify.json
scripts/lib/tokens/fallback.ts      S4 — var(--x, fb) 108자리   ↔ s4-fallback.json
scripts/lib/tokens/docrule.ts       S5 — 문서 축 + 축 재분류    ↔ s4-docrules.json
```

**대책 셋.**

1. **게이트가 파일 넷이 되는 것** — 기존 `verify-*.ts` 다섯은 전부 단일 파일이고
   `scripts/lib/` 라는 자리는 이 레포에 아직 없다. 새 관례를 만드는 것이므로 그 사실을
   적어 둔다. 지키는 것은 파일 수가 아니라 **진입점 하나**다 — 셰뱅 · "왜 필요한가" 머리주석 ·
   `failures[]`/`notes[]` 분리 · `console.error("고치는 법: …")` · `process.exit(1)` 은
   전부 `verify-tokens.ts` 가 진다. 축 모듈은 규약을 지지 않고 판정만 돌려준다.
2. **축마다 다른 세션이 짜면 판정 규칙이 갈리는 것** — `S2` 가 **공통 계약을 먼저 박는다.**
   축 모듈은 같은 시그니처(`scan(files: string[]): Hit[]`)와 같은 `Verdict` 타입을 쓰고,
   토큰 사전(`tokens.css` 파싱)·파일 목록·제외 규칙(`AUTO-GENERATED`·생성물)은
   진입점이 한 번 만들어 넘긴다. 축 모듈이 각자 파일을 훑으면 제외 규칙이 세 벌이 된다.
   그래서 `S2` 가 배치3 전체의 선행이고, 배치2에 혼자 있지 않고 `S9` 와 함께 있다.
3. **히트 단위 대조를 세 번 해야 하는 것** — 이건 비용이 아니라 오히려 이 안의 이점이다.
   회수한 참조 JSON 이 이미 축마다 하나씩이라(`s4-classify` ↔ 색 · `s4-fallback` ↔ fallback ·
   `s4-docrules` ↔ 문서 축) 모듈과 **1:1로 맞는다.** 축 모듈의 완료 기준을 자기 참조 JSON 과의
   차집합 0 으로 두면 세 세션이 서로를 안 기다린다.

## 실행 계획
<!-- `S<n>`은 고정 id — 이름을 바꾸지 않는다. 체크 상태는 doc-step 이 갱신한다. -->
- [x] `S1` 판정기 회수 — 스크래치패드의 판정기와 출력 JSON 을 레포로 옮긴다
- [x] `S2` 스켈레톤 — 레포 게이트 규약대로 `scripts/verify-tokens.ts` 를 세운다
- [ ] `S3` 색·radius·선굵기 축 포팅 — 대조 상대는 `tokens.css` 하나
- [ ] `S4` fallback 축 포팅 — `var(--x, fb)` 108자리
- [ ] `S5` 문서 축 포팅 + 축 재분류 — 간격을 spacing/dimension/position 셋으로
- [ ] `S6` 자가검사 — 축마다 고장 픽스처
- [ ] `S7` 래칫 + 베이스라인 — `--update-baseline`
- [ ] `S8` 배선 — `package.json` 의 `tokens:verify` 와 CI 스텝
- [x] `S9` 규칙 개정 — REACT_SIM_GUIDE 의 "조화"를 판정 가능한 말로
- [ ] `S10` 예외 표 — 근거 문서 위치를 필수 필드로

**단계별 완료 기준**

- `S1` — 레포에서 다시 돌린 출력이 검토서 verify 절의 sha256 넷과 일치한다.
  **다른 work 를 시작하기 전에 끝난다** — `/private/tmp` 는 재부팅에 지워지고, 지워지면
  이 카드의 검증 기준선 자체가 사라진다.
- `S2` — `bun scripts/verify-tokens.ts` 가 0 으로 끝나고 "검사 0건"을 보고한다.
  규약 넷을 갖춘다: `#!/usr/bin/env bun` 셰뱅 · 머리주석이 "왜 필요한가"부터(빌드·타입이
  초록인 이유) · `failures[]`/`notes[]` 분리(`verify-graph.ts:74-75`) ·
  `console.error("고치는 법: …")` + `process.exit(1)`.
- `S3` — 드리프트 **71** · 토큰 밖 **580** 을 보고하고, `s4-classify.json` 의 `rows` 3,539건과
  **히트 단위**(`file:line:prop:value:verdict`)로 차집합이 0 이다. 총계만 맞추면 두 군데가
  서로 상쇄돼도 통과한다.
- `S4` — 일치 42 · 불일치 23(살아있는 4 · 죽은 19) · 제외 43. `s4-fallback.json` 과 히트 단위 일치.
  `tokens.css`(전역, `global.css:1` ← `BaseLayout.astro:2`)와 `deco.css`(opt-in) 적재 차이로
  살아있음/죽음을 가른다.
- `S5` — 옛 축 정의로 돌리면 간격 821 + 글자 166 을 재현하고, 새 축 정의로 돌리면
  spacing/dimension/position 셋의 수를 낸다. **둘 다 보고하고 차이를 사유와 함께 낸다.**
  여기서 유저 확인을 한 번 받는다 — 감사 문서 §3-5 수치를 고쳐 적는 일이 된다.
- `S6` — 정상 픽스처 통과 + 고장 픽스처 여섯이 **각자 다른 사유**로 실패한다.
  게이트를 통째로 no-op 으로 만들면 자가검사가 먼저 빨개진다.
- `S7` — 리터럴 한 줄을 일부러 더한 워킹트리에서 비0 + 그 `파일:줄`을 지목한다.
  지운 상태에서 0. `--update-baseline` 을 두 번 돌려 바이트 동일.
  판정 규칙은 셋 — 늘면 실패 / 같으면 통과 / 줄면 통과 + `notes` 에 갱신 안내.
- `S8` — CI 초록(래칫이라 현 상태는 통과가 맞다). 자리는 `gen:motion` 드리프트 가드 **뒤**,
  `astro build` **앞** — 정적 스캔끼리 모아 둔 자리다. 위반을 넣은 브랜치에서 그 스텝만
  빨갛고 메시지에 고치는 법이 들어 있다. `--warn-only` 탈출구를 두되 CI 에서는 안 쓴다.
- `S9` — `REACT_SIM_GUIDE.md:19` 의 "색은 tokens.css 팔레트와 **조화**"가 사라지고
  "토큰을 쓴다(`var(--x)` 문자열). 토큰 밖 색이 필요하면 근거를 문서에 적는다"가 그 자리에 온다.
  좋은 예로 `src/components/posts/tauri-2/PermissionGate.tsx:57-58` 을 인용한다.
  **자급식 원칙(같은 문서 10행)은 그대로 둔다** — 공용 팔레트 모듈을 만들지 않는다.
  `CLAUDE.md` 시각 규칙 절에 `tokens:verify` 를 다른 게이트와 나란히 적는다.
- `S10` — 근거 문서 위치 없는 예외를 넣으면 게이트가 자기 자신을 비0 으로 끝낸다.
  초기 등록 넷: `motion.css`(생성물) · `AUTO-GENERATED` 41파일 · 두들 크레용 19색
  (`DECO_KIT.md:24-27`) · `--deco-pen-*` fallback(`DoodleMark.astro:15`).

## 검증
<!-- 무엇을 실행해 무엇이 나오면 이 카드가 끝난 것인가. -->
1. **게이트가 감사를 재현한다** — `bun run tokens:verify` 가 드리프트 **71** · 토큰 밖 **580** ·
   fallback 불일치 **23** 을 보고하고, `scripts/fixtures/tokens/reference/s4-classify.json` 의
   `rows` 와 히트 단위 차집합이 0 이다.
2. **게이트가 죽지 않았다** — 자가검사에서 고장 픽스처 여섯이 각자 다른 사유로 실패한다.
3. **래칫이 실제로 문다** — 리터럴 한 줄을 더하면 비0 + 파일:줄 지목, 지우면 0,
   `--update-baseline` 두 번이 바이트 동일.
4. **CI 가 초록이다** — `main.yml` 에 스텝이 꽂힌 채로 통과하고, 위반 브랜치에서는 그 스텝만 빨갛다.
5. **회귀 없음** — `bun run build`(46 page) · `bun scripts/check-post-markers.ts` ·
   `bun scripts/check-emphasis.ts`(+`--dist`) · `bun scripts/check-quote-blocks.ts` 전부 통과.
   `bun run gen:motion` 후 `git diff --exit-code -- src/styles/motion.css` 통과.
6. **규칙에 판정 불가능한 낱말이 없다** — `REACT_SIM_GUIDE.md`·`CLAUDE.md` 에서
   "조화"·"어울리게" 류가 0건이다.

## 수행 내역
<!-- KANBAN:LOG append-only — 아래로만 덧붙인다. 위를 고치지 않는다. -->
- 2026-08-25T00:16 · s:9eba7c52 — `전략` 섹션 교체
- 2026-08-25T00:16 · s:9eba7c52 — `실행 계획` 섹션 교체
- 2026-08-25T00:16 · s:9eba7c52 — `검증` 섹션 교체
- 2026-08-25T00:23 · s:9eba7c52 — `전략` 섹션 교체
- 2026-08-25T00:32 · s:9eba7c52 · S1 doing — 착수
- 2026-08-25T00:32 · s:9eba7c52 · S1 done — 판정기·출력 JSON·중간 판정 기록 19개 + README 를 scripts/fixtures/tokens/reference/ 로 회수. 원본과 바이트 동일, 출력 sha256 4/4 검토서 값과 일치. 감사 부록 A 의 s3-scan 해시 76ec13fd 는 S3 시점 값이라 낡음 — 실제는 e5e69a55331207dc, 정정은 S5 로 넘긴다
- 2026-08-25T01:32 · s:9eba7c52 · S2 doing — 착수
- 2026-08-25T01:37 · s:9eba7c52 — S2 측정: AUTO-GENERATED 41파일의 히트가 0건이다 — 게이트 정규식이 그 파일들에서 시각 값을 하나도 안 읽는다(패키지 컴포넌트 래퍼라 값이 패키지 쪽에 있다). 제외 규칙은 유지하되 실효는 motion.css 3 + viz.css 12 뿐이다. 좌표 228개 위험은 게이트가 아니라 KAN-072.5 의 간격 코드모드 쪽 이야기다
- 2026-08-25T01:37 · s:9eba7c52 · S2 done — 진입점 verify-tokens.ts + 축 모듈 셋 골격 + 공통 추출층(extract.ts) + 타입 계약(types.ts). s3-scan.py 를 그대로 이식해 **감사와 히트 단위 차집합 0**(3,539건, axis·kind·prop·value·file:line·src 여섯 쪽 일치, kind 분포도 literal_new 2634 / token 858 / literal_dup 47 동일). 축 모듈은 판정만 하고 규약은 진입점이 진다. tsc 통과
- 2026-08-25T01:39 · s:9eba7c52 · S9 doing — 착수
- 2026-08-25T01:40 · s:9eba7c52 · S9 done — REACT_SIM_GUIDE.md 의 '팔레트와 조화'를 판정 가능한 규칙으로 교체(규칙 6 신설: var(--x) 문자열로 쓴다 · 토큰 밖이면 근거 문서 위치를 남긴다 · 공용 팔레트 모듈 금지). PermissionGate.tsx:57 을 좋은 예로, 옛 규칙 아래 준수율 3.6% 였다는 사실을 인용 블록으로 박음. CLAUDE.md Design 절에 토큰 게이트 셋(래칫인 이유 · 판정 불가 낱말 금지 · 생성물 제외) 추가. 판정 불가 낱말 잔존 0건, check-emphasis 두 파일 통과
