# 감사 판정기 참조본 (KAN-069-M724GH)

`design-concept/UI_CONSISTENCY_AUDIT.md` 의 **모든 수치가 여기서 나왔다.**
`scripts/verify-tokens.ts`(토큰 게이트)를 만들 때 **이식이 옳은지 대조할 기준선**이다.

## 왜 레포에 있나

KAN-069 의 카드 전략은 "추출기는 스크래치패드에 두고 레포에는 넣지 않는다"였고
그대로 지켰다. 그 결과 판정기 넷이 `/private/tmp/…/scratchpad/` 에만 남았는데,
**`/private/tmp` 는 재부팅에 지워진다.** 지워지면 감사 수치(위반 1,567 · 드리프트 71 ·
준수율 44.3%)를 재현할 길이 없고, 게이트가 감사를 제대로 재현하는지 **대조할 상대가
사라진다.** 그래서 게이트 카드의 첫 work 로 회수했다.

**한 바이트도 안 고쳤다.** 원본과 `cmp` 로 19/19 동일을 확인했다.

## 무엇이 있나

| 파일 | 무엇 | 출력 sha256(앞 16자) |
|---|---|---|
| `s3-scan.py` → `s3-scan.json` | `src/**` 152파일 전수 추출 (3,539 히트) | `e5e69a55331207dc` |
| `s4-classify.py` → `s4-classify.json` | 다섯 갈래 판정 + 보정 셋. **`rows` 3,539건이 히트 단위 대조용이다** | `f278448e106d83eb` |
| `s4-fallback.py` → `s4-fallback.json` | `var(--x, fallback)` 108자리 대조 | `568ff12229198f08` |
| `s4-docrules.py` → `s4-docrules.json` | `DESIGN_CONCEPT.md` §9·§5 스케일 대조 | `2d588fc5edd10f4c` |
| `s2-drift.py`·`s2-drift2.py` → `.json` | `tokens.css` ↔ TS 상수 값 대조 | — |
| `s1-catalog-layers.json` | 카탈로그 51종 층별 구현 카운트 (생성기 `.mjs` 는 유실) | — |
| `s2-declared-layers.ts` | 두 선언의 필드 유무를 런타임으로 찍는다 | — |
| `s1-contract.md`·`s2-declaration.md`·`s3-implementation.md`·`s4-verdict.md`·`s5-plan.md` | 단계별 중간 판정 기록 | — |

## 알려진 어긋남 하나

**`UI_CONSISTENCY_AUDIT.md` 부록 A 의 `s3-scan` 해시 `76ec13fd…` 는 낡았다.**
그것은 S3 종료 시점 값이고(`KANBAN.cards/KAN-069-M724GH.md:112`, 17:50), 그 뒤
S4 보강(18:17)에서 스캔이 다시 돌아 `e5e69a55331207dc` 가 됐다. 검토서의 검증 기록
(`.kanban/reviews/KAN-069-M724GH.review.json` verify 절)이 새 값을 적었고 위 표도 그것이다.
**회수본은 검토서가 검증한 값과 정확히 일치한다** — 넷 다 맞다.
부록 A 를 고치는 것은 게이트 카드의 「감사 수치 정정」 work 에서 함께 한다.

## 쓰는 법

이식본이 옳은지는 **총계가 아니라 히트 단위로** 판정한다. 총계만 맞추면 두 군데가
서로 상쇄돼도 통과한다.

```bash
# s4-classify.json 의 rows[] 와 verify-tokens 출력을 (file, line, prop, value, verdict) 로 차집합
```

**이 디렉터리는 손으로 고치지 않는다.** 값이 바뀌어야 하면 그건 판정 규칙이 바뀐 것이고,
바뀐 규칙은 게이트 쪽에 적고 여기 원본은 "그때 이랬다"로 남긴다.
