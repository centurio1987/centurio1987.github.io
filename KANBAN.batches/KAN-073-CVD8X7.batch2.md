---
card: KAN-073-CVD8X7
batch: 2
created: 2026-08-28
branch: KAN-073-CVD8X7
status: 계획
steps: S2, S3, S4
---

# KAN-073-CVD8X7 배치2 — 인식기 셋을 병렬로 채운다

카드: [KAN-073-CVD8X7.md](../KANBAN.cards/KAN-073-CVD8X7.md) · 범위 `S2` `S3` `S4`
선행: [배치1](KAN-073-CVD8X7.batch1.md)

> **이 문서는 착수 전 계획이다.** 수행 내역은 카드 실행 문서의 「수행 내역」에 있다.

**세 work 가 각각 자기 모듈 파일 하나 + 자기 고장 픽스처만 건드린다. 겹침 0.**
배치1 이 스텁을 등록해 뒀으므로 `extract.ts` 를 아무도 안 연다.

**확인 명령은 `bun scripts/verify-tokens.ts --json --warn-only` 다.**
인식기가 붙는 순간 판정 수가 기준선 위로 올라가 래칫이 실패하므로(기준선 갱신은 배치3),
`bun run tokens:verify` 로는 이 배치의 완료 기준을 못 잰다.
**`--warn-only` 는 로컬 전용이고 커밋에 안 들어간다** — `.github/workflows/main.yml:75` 가
금지한 것은 CI 사용이다.

**고장 케이스는 `(verdict, want, src)` 로 갈린다.** 배치1 이 유일성 키를 셋으로 바꿔 뒀으므로
사유가 기존과 같아도 된다 — `.tsx` 숫자 `padding: 10` 은 `("위반","§9","style-num")` 이고
`.astro` CSS `padding: 10px` 은 `("위반","§9","css-decl")` 이다. **사유를 억지로 다르게 쓰지
마라** — 그러면 "CSS 자리와 똑같은 코드로 판정한다"가 깨지고 `baseline.ts:52-58` 이 예약한
네 접두(`"stroke 축"`·`"radius 축"`·`"color 축"`·`"측정 제외"`)와도 부딪힌다.

## 1. 작업 패키지

### WP1 · `S2` 갈래 A — `recognize/styleNum.ts` (인라인 스타일 숫자 리터럴)

파일: `scripts/lib/tokens/recognize/styleNum.ts` · `scripts/fixtures/tokens/faults/cases/style-num.tsx`

**범위 한정이 이 WP 의 전부다.** `style={{ … }}` 와 `React.CSSProperties` 로 타입 지정된
객체 안으로만 본다. 밖에서 `prop: 숫자` 를 훑으면 `src/components/deco/Doodle.astro:143-170`
의 풍선 글씨 좌표표(`w: 126`·`fs: 22`·`top: 9`·`left: 12`)와 `src/components/viz/samples/*`
의 기하 데이터가 들어온다 — `deco-kit` 이 "눈대중이 아니라 실측값"이라 못박은 자리다.
**CSS 로 오인해 토큰으로 밀면 조용히 깨진다.**

소수는 새 경로용 정규식(`-?\d*\.?\d+`)으로 온전히 잡는다. 옛 `LITERAL`(`extract.ts:64`)의
`\b\d{1,4}\b` 는 **안 건드린다** — `11.5` 를 `11`·`5` 로 가르는 그 동작이 감사 원자료
3,539 히트 대조의 일부다.

**완료 기준**
- 시각 값 **836건**이 판정에 들어온다(spacing 407 · font-size 252 · radius 176 · stroke 1)
- 그중 **175건**이 스케일 밖(spacing 70 · font 53 · radius 52)
- `Doodle.astro` 좌표표에서 새 히트 **0**
- 단위 없는 속성 181건(`fontWeight` 101 · `lineHeight` 71 · `flex`/`flexShrink` 6 ·
  `zIndex` 2 · `opacity` 1)에서 새 히트 **0**
- `AUTO-GENERATED` 파일에서 나온 새 히트는 전부 `excluded` 가 붙어 있다

### WP2 · `S3` 갈래 B — `recognize/exprValue.ts` (삼항·템플릿 안 리터럴)

파일: `scripts/lib/tokens/recognize/exprValue.ts` · `scripts/fixtures/tokens/faults/cases/expr-literal.tsx`

`prop:` 뒤의 **값 표현식 전체**(같은 줄, 쉼표/줄바꿈까지)를 잘라 `classify()` 에 넘긴다.
`ok ? "#fff" : "#000"` 이면 hex 둘이, `` `${x}px ${y}px` `` 면 px 둘이 히트가 된다.

**중복 계수를 막는 것이 이 WP 의 함정이다.** `extract.ts:143` 이 `.tsx` 의 모든 백틱 구간을
CSS 영역으로 잡아 이미 `DECL` 을 돌리고 있다(실측 240히트 · 2파일, `GraphExplorer.tsx` 등).
**옛 경로와 새 경로가 같은 바이트를 두 번 보는 유일한 자리**다. `TEMPLATE` 구간 중 옛 `DECL`
이 이미 먹은 오프셋 범위를 제외한다.

**완료 기준**
- **34건**이 판정에 들어온다(삼항 20 · 템플릿 14)
- `src/components/posts/tauri-2/PermissionGate.tsx:124` 의
  `` `var(--stroke, 1.5px) solid ${BORDER}` `` 가 **위반이 아니다**(`classify()` 의 `VARCALL`
  제거가 처리한다 — 통째로 물면 준수분까지 잡는다)
- **새 히트와 옛 히트의 `(file, line, value)` 교집합이 0**

### WP3 · `S4` 갈래 C — `recognize/attrCss.ts` (인라인 `style="…"` 속성)

파일: `scripts/lib/tokens/recognize/attrCss.ts` · `scripts/fixtures/tokens/faults/cases/attr-css.astro`

`ATTR`(`extract.ts:59`)이 `style` 을 매칭하지만 `AXIS.get("style")` 이 `undefined` 라
버려지고(`:161-162`), `.astro` 의 CSS 훑기는 `<style>` 블록만 본다. 그래서 인라인
`style="…"` 속성 값이 통째로 판정 밖이다 — 실물 확인:
`src/components/deco/CrayonFilters.astro:42` 는 판정 0건이고, 같은 파일에서 잡히는 8건은
전부 `<style>` 블록이다.

**이 WP 는 부채를 거의 안 낸다.** 선언 42개(38자리)의 내역이 `transform` 32 ·
`--reveal-i` 3 · `position`/`display` 각 2 · `width`/`height`/`overflow` 각 1 이고,
축이 있는 것은 `width:0`·`height:0` 둘뿐이며 그 둘은 스케일 안이다.
**판정 건수가 아니라 구멍이 닫혔는지로 본다.**

**완료 기준**
- `CrayonFilters.astro:42` 의 `width:0`·`height:0` 이 **준수**로 판정된다
- 고장 픽스처(`style="padding:10px;color:#302d28"`)가 `("위반", …, "attr-css")` 로 걸린다

## 2. 의존과 순서

셋 다 배치1 완료에 의존하고, **서로에게는 의존하지 않는다.** 동시에 착수할 수 있다.
겹치는 파일이 없으므로 병합 순서도 자유다.

배치3 은 셋 다 끝나야 시작한다 — `S5` 의 기준선이 셋의 합을 재기 때문이다.

## 3. 리스크

- **`--warn-only` 가 커밋에 새어 들어가는 것.** `main.yml:75` 가 주석으로 금지한 자리다.
  세 work 다 로컬 확인에만 쓰고 `package.json`·`main.yml` 을 안 건드린다.
- **범위 한정이 느슨하면 좌표표가 들어온다**(WP1). 완료 기준에 "`Doodle.astro` 새 히트 0" 을
  둔 이유가 이것이다 — 건수가 맞아도 이 칸이 0 이 아니면 실패다.
- **중복 계수는 조용하다**(WP2). 새 기준선이 부풀고 "옛 히트 불변" 검증은 옛 히트만 봐서
  못 잡는다. 그래서 교집합 0 을 완료 기준으로 올렸다.
- **세 work 가 각자 기준선을 갱신하려 드는 것.** 기준선은 `S5` 소유다 —
  이 배치에서는 `--update-baseline` 을 **부르지 않는다.**

## 4. 착수 시점 판단

(착수할 때 채운다)
