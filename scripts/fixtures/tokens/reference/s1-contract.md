# S1 산출 — 계약 확정 (KAN-069-M724GH)

측정 대상 버전: `bbangto-ui-core@1.1.1` · `-tokens@1.2.0` · `-style-guide-catalog@0.3.0`
(worktree `KAN-069-M724GH` 의 `node_modules`)

## 1. StyleGuide 인터페이스 필드 전량 (계약 정본 = 설치된 dist 타입)

`StyleGuide extends StyleGuideTokens` — 필드 13개.

| 필드 | 필수 | 근거 |
|---|:---:|---|
| `name` | O | tokens `dist/index.d.ts:370` |
| `description` | X | tokens:371 |
| `foundations` (`BbangtoFoundation`) | **O** | tokens:373 |
| `extendedFoundations` (`Record<string,string>`) | X | tokens:375 |
| `foundationPresets` (`readonly FoundationPreset[]`) | X | tokens:380 |
| `defaultFoundationKey` | X | tokens:382 |
| `guidelines` (`Record<string,Record<string,unknown>>`) | X | tokens:384 |
| `meta` (`StyleGuideMeta`) | X | tokens:386 |
| `wrapperComponents` (`WrapperComponents`) | X | core `dist/index.d.ts:63` (타입 34) |
| `wrapperBlocks` | X | core:68 |
| `wrapperPatterns` | X | core:73 |
| `patterns` (`Patterns`) | X | core:75 (타입 36) |
| `visualMotif` (`VisualMotif` = summary + components + example?) | X | core:77 (타입 49) |

`foundationToStyleGuide(theme)` 의 문서화된 용도: "BbangtoFoundation을 **foundations-only
StyleGuide로** 변환하는 헬퍼" — core:80~83. 즉 이 헬퍼가 만든 값은 foundations 한 층만 채운다.

## 2. 저자의 정본 어휘 = "StyleGuide 6요소"

원문의 다섯 낱말은 타입 필드명이 아니라 **저자 본인의 낱말**이다. 그 낱말의 정본은 두 자리에 있다.

- `~/bbangto-ui/ORDER.md:132-138` (= KAN-001 verbatim, 최초 지시) — 표의 5행:
  `foundations` · `extended foundations` · **`wrapper component`** · `pattern` · `guideline`
- `~/bbangto-ui/ORDER.md:156` — "각 카탈로그는 참조한 **foundations, extended foundations,
  wrapper component, pattern, visual motif, guideline** 으로 구성한다" (6개)
- `~/bbangto-ui/packages/core/style-guide-catalog.md:15-22` — 「StyleGuide 6요소 (생성 대상 스키마)」
  = `foundations` · `extendedFoundations` · `wrapperComponents` · `patterns` · `guidelines` · `visualMotif`
  (같은 파일 100줄의 약칭 F / EF / W / PT / VM / G)

## 3. 층 ↔ 필드 대응표 (S1 완료 기준 (a))

| 원문 낱말 | 대응 필드 | 확정 |
|---|---|:---:|
| `foundations` | `foundations` (+ `extendedFoundations` · `foundationPresets` · `defaultFoundationKey`) | **확정** |
| `visual motif` | `visualMotif` | **확정** |
| `guideline` | `guidelines` | **확정** |
| `component` | ? | **안 선다** |
| `wrapper` | ? | **안 선다** |

**`component` · `wrapper` 는 대응이 안 선다.** 임의로 정하지 않는다. 근거:

저자의 정본 6요소에는 `wrapper component` 가 **한 항목**이고 `pattern` 이 따로 있다. 원문
KAN-069 는 그 둘을 `component` 와 `wrapper` 로 **떨어뜨려** 적었고, 사이에 `visual motif` 가
끼어 있어 "한 항목을 둘로 쪼개 적었다"로도 단정할 수 없다. 성립 가능한 읽기가 셋이다.

| 읽기 | `component` | `wrapper` | 이 읽기가 낳는 기준선 |
|---|---|---|---|
| **R1** | `wrapperComponents` | `wrapperBlocks` + `wrapperPatterns` | 카탈로그 51종이 `wrapper` 층을 **0/51** 구현 → 기준선이 성립하지 않는다 |
| **R2** | `patterns` | `wrapperComponents` | 6요소와 1:1 로 맞고 잔여 없음. 카탈로그 51/51 구현 |
| **R3** | `wrapperComponents` | `patterns` | R2 의 이름만 뒤바뀐 것. 카탈로그 51/51 구현 |

**판정에 미치는 영향은 없다** — 어느 읽기든 검사할 필드 집합이 같기 때문이다. 그래서 S2 는
읽기를 고르지 않고 **필드 8개(`foundations` · `extendedFoundations` · `foundationPresets` ·
`guidelines` · `wrapperComponents` · `wrapperBlocks` · `wrapperPatterns` · `patterns` ·
`visualMotif`)를 전량 판정**하고, 낱말 대응은 검토 판단 항목으로 올린다.

## 4. "완전한 상태" 기준선 = 카탈로그 51종 층별 구현 카운트 (S1 완료 기준 (b))

측정 방법: `styleGuideMap` 을 런타임 로드해 필드별 키 개수를 셌다.
추출기 `s1-catalog-layers.mjs`, 원자료 `s1-catalog-layers.json` (둘 다 스크래치패드).

| 필드 | 구현 종수 | 종당 개수(min~max) |
|---|---:|---|
| `foundations` | **51/51** | 1 |
| `extendedFoundations` | **51/51** | 2~10 |
| `foundationPresets` | **51/51** | 3 (전 종 동일) |
| `guidelines` | **51/51** | 3~4 |
| `wrapperComponents` | **51/51** | 3 (전 종 동일) |
| `wrapperBlocks` | **0/51** | 0 |
| `wrapperPatterns` | **0/51** | 0 |
| `patterns` | **51/51** | 1 (전 종 동일) |
| `visualMotif` | **51/51** | components 3 · example 1 (전 종 동일) |
| `meta` | **51/51** | 1 |

교차 확인: 패키지가 함께 배포하는 `catalog.manifest.json` 51개 항목의 `completeness` 가
`hasWrappers` 51 · `hasPatterns` 51 · `hasVisualMotif` 51 · `foundationPresetCount ≥ 2` 51 로
같은 값을 낸다(`metaStatus: authored` 51/51).

**기준선 결론.** "전부 구현한 상태"의 실물 기준은 **`wrapperBlocks` · `wrapperPatterns` 를 뺀
나머지 전 필드**다. 이 둘은 나중에 인터페이스에 추가된 확장 슬롯이고(`~/bbangto-ui/ORDER.md:247`
— "`StyleGuide` 에 `wrapperBlocks`/`wrapperPatterns`(optional) 추가 … 기존 `wrapperComponents`·24
preset 무수정(후방호환)"), 저자의 51종 어느 것도 채우지 않았다. **미구현이라고 감점하면 카탈로그
전량이 같이 감점된다** — 그래서 축 A 판정에서 이 둘은 「해당 없음」으로 둔다.
