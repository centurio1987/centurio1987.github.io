---
card: KAN-073-CVD8X7
batch: 1
created: 2026-08-28
branch: KAN-073-CVD8X7
status: 계획
steps: S1
---

# KAN-073-CVD8X7 배치1 — 계약과 스텁을 먼저 박는다

카드: [KAN-073-CVD8X7.md](../KANBAN.cards/KAN-073-CVD8X7.md) · 범위 `S1`
선행: 없음 (이 카드의 첫 배치)

> **이 문서는 착수 전 계획이다.** 수행 내역은 카드 실행 문서의 「수행 내역」에 있다.

**이 배치가 존재하는 이유가 병렬이다.** 배치2 의 세 인식기가 같은 `scripts/lib/tokens/extract.ts`
를 3-way 로 고치면 병렬 근거가 그 자리에서 무너진다. 계약·축 표·빈 스텁·자가검사 수집기를
여기서 먼저 박아야 배치2 가 각자 파일 하나만 만진다. KAN-070 이 축 셋을 병렬로 채우려고
`S2` 에서 공통 계약을 먼저 박은 것과 같은 모양이다.

## 1. 작업 패키지

### WP1 · `S1` 인식기 계약 · 공용 축 표 · 빈 스텁 셋

손대는 파일 여섯이다.

| 파일 | 무엇 |
| --- | --- |
| `scripts/lib/tokens/types.ts` | `Hit["src"]` 에 `"style-num" \| "expr-literal" \| "attr-css"` 추가 · `rawValue` 필드 추가 |
| `scripts/lib/tokens/propAxis.ts` (신규) | kebab 원형 → camelCase 축 생성. **새 경로와 `SPACING_GROUP` 전용** |
| `scripts/lib/tokens/recognize/types.ts` (신규) | 인식기 계약 — `id` · `what` · `scan(input): RawHit[]` · `faults: FaultCase[]` |
| `scripts/lib/tokens/recognize/{styleNum,exprValue,attrCss}.ts` (신규) | **`scan()` 이 `[]` 를 돌려주는 빈 스텁** · `faults: []` |
| `scripts/lib/tokens/extract.ts` | 인식기 배열 호출 자리 · 숫자 px 승격 · 단위 없는 속성 제외. **기존 정규식 넷과 `classify()` 의 기존 경로는 한 글자도 안 건드린다** |
| `scripts/lib/tokens/selftest.ts` | `judge()` 가 케이스별 파일명(`.tsx` 포함)을 받게 · `CASES` 를 인식기 `faults` 에서 수집 · 검사 ③ 유일성 키를 `(verdict, want, src)` 로 |

**지켜야 할 것 넷.**

1. **옛 `AXIS` 맵(`extract.ts:20-34`)을 안 건드린다.** 거기에 `minwidth` 를 넣으면 그 값을 줍는
   것은 새 인식기가 아니라 기존 `JSXOBJ` 이고, 새 히트에 `"style-obj"` 라는 옛 라벨이 붙어
   "옛 히트 불변" 계약이 깨진다(실측 증분 1건 — `NonceReuseLab.tsx:306` `minWidth: "10rem"`).
   그 확장은 `S5` 소유다.
2. **`docrule.ts:SPACING_GROUP` 은 `propAxis` 를 읽게 바꿔도 오늘 판정이 안 바뀐다** —
   지금 camelCase spacing 히트가 0건이기 때문이다. 그래서 관문 4 는 이 배치에 남는다.
3. **새 인식기는 반드시 같은 `classify()` 를 지나간다.** 예외 표(`ex`)와 `VARCALL` 제거가
   거기 붙어 있다 — 직접 `hits.push` 하면 `AUTO-GENERATED` viz JSON 26건이 새고
   `var(--stroke, 1.5px)` 준수분이 위반으로 잡힌다.
4. **단위 없는 속성은 승격하지 않고 히트를 아예 안 낸다** — `fontWeight`·`lineHeight`·
   `flex`·`flexShrink`·`zIndex`·`opacity`(실측 181건). 앞의 둘은 `AXIS` 에서 font 축이라
   거르지 않으면 `--text-*` px 스케일과 대조된다.

**완료 기준**: 인식기 셋이 전부 빈 스텁인 상태에서
`bun run tokens:verify` 가 **지금과 완전히 같은 수**를 낸다 —
`파일 152 · 토큰 108 · 히트 3,135 · 기준선과 같다(래칫 0)` · `자가검사: 정상 1 + 고장 6종, 사유 6가지`.
`tsc --noEmit` 신규 0.

## 2. 의존과 순서

배치 안 의존은 없다(WP 하나). **배치2·3 전부가 이 배치에 의존한다** — 계약이 안 서면
셋이 같은 파일을 고치고, `S5` 의 화이트리스트도 `rawValue` 가 있어야 뜻이 선다.

## 3. 리스크

- **`extract.ts` 를 고치면서 옛 경로를 건드리는 것.** 이 배치의 유일한 진짜 위험이다.
  완료 기준을 "같은 수"로 잡은 이유가 그것이고, 수가 하나라도 달라지면 되돌린다.
- **`selftest.ts` 의 `judge()` 가 `_fault.astro` 고정 이름을 쓴다**(`:66`). 확장자를 받게
  바꾸면서 기존 여섯 케이스가 그대로 살아야 한다 — 여기서 깨지면 배치2 가 자기 고장을
  등록할 자리가 없다.
- **`Hit` 에 필드를 더하면 축 모듈 셋이 전부 타입을 다시 받는다.** `rawValue` 는 옵셔널로
  두어 기존 생성 지점을 안 건드린다(`fallback.ts:186-201` 의 `toHit` 포함).

## 4. 착수 시점 판단

(착수할 때 채운다)
