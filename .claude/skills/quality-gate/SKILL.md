---
name: quality-gate
description: >
  완성된(또는 작성 중인) 글이 발행 기준선을 넘었는지 채점하고, 미통과면 보완 → 재채점을
  최대 3라운드 반복하는 **발행 전 필수 게이트**. 채점 루브릭은 `authoring-kit` 플러그인이
  소유하고(`authoring-gate`), 이 스킬은 **어느 명세로 채점할지 고르고 넘기는 일**과
  블로그 파이프라인에서의 위치만 맡는다. 깊이·완전성·다관점·정확성이 이 게이트가 보는 축이다.
  "/quality-gate <파일>", "이 글 품질 게이트 돌려줘", "발행해도 되는지 봐줘",
  "기준 통과할 때까지 보완해줘" 같은 표현에 반응한다. 문장 단위 다듬기는 `review-post`,
  집필은 `tech-deepdive` 가 맡는다. AI 리듬은 이 게이트의 보완 루프가 직접 맡는다.
argument-hint: <article-file (보통 draft/*.mdx)>
---

# quality-gate (품질 게이트 진입점)

> **채점 기준은 이 파일에 없다.** MUST/SHOULD/IF-APPLICABLE 루브릭과 통과 조건은 플러그인의
> L0 `QUALITY_RUBRIC.md` 에, 글 종류별 항목은 spec 의 `principles[]` 에 산다.
> 세 프로젝트가 체크리스트를 각자 한 벌씩 들고 있다가 갈라진 것을 정리한 결과다.
> 이 파일에는 **파이프라인 위치와 위임 경계**만 남는다.

## 0. 사전 확인

```bash
python3 ${CLAUDE_PLUGIN_ROOT}/scripts/authoring.py status
python3 ${CLAUDE_PLUGIN_ROOT}/scripts/authoring.py lock
```

- 플러그인이 없으면 **여기서 멈춘다.** 구 체크리스트로 조용히 돌아가지 않는다 — 그러면
  어떤 기준으로 통과했는지 알 수 없게 된다. 구 자산은 git 이력에만 있고, 복구는 되돌리기지 우회로가 아니다.
- `lock` 이 stale 이면 기준이 바뀐 것이다. 무엇이 바뀌었는지 보고 진행할지 정한다.

## 1. 워크플로우 상의 위치

```
tech-deepdive(집필) → review-post(미시) → review-writing(거시)
  → [quality-gate: 채점 → 보완 → 재채점 (≤3R)]   ← 이 스킬
  → post-finalize → publish-post → ship-post
```

발행 오케스트레이터(`tech-article-publisher`)는 이 스킬을 **발행 전 필수 게이트**로 호출한다.
**PASS 전에는 `post-finalize`/`publish-post` 로 넘어가지 않는다.** 앞의 세 검토 스킬도
같은 `authoring-gate` 를 부르지만, 그쪽은 각자 한 축을 깊게 보고 이 스킬만이 **발행 여부를 막는다.**

## 2. 대상과 명세를 정한다

- 인자 경로가 있으면 사용. 없으면 `draft/` → `src/content/posts/` 에서 mtime 최신 `.md`/`.mdx` 를
  골라 한 줄로 알린다.
- **spec 을 고른다** — 기술 해부 글이면 `tech-deepdive`, 폴씬대담이면 `polssin-daedam`.
  frontmatter 의 `author` 가 곧 활성 voice 다. 비어 있으면 그것부터 보고한다(표시 의무 문제).

```bash
python3 ${CLAUDE_PLUGIN_ROOT}/scripts/authoring.py list specs
```

## 3. 채점을 넘긴다

```
Skill(authoring-kit:authoring-gate) <파일> --spec <tech-deepdive|polssin-daedam>
```

플러그인이 L0(공통 항목 A·E·F·V) + spec 의 `principles[]`(B 깊이 · C 구성 · D 다관점 · G 기술 건전성)를
한 벌로 해석해 채점한다. 빌드·검증 명령은 `.claude/authoring/paths.json` 의 `commands` 에서 온다 —
**명령을 이 파일에 박지 않는다.**

**이 게이트가 특히 보는 축** — 다른 세 검토 스킬과 겹치지 않게, 여기서는 아래를 판정 근거로 삼는다.

| 축 | 무엇 | 어디서 오나 |
| --- | --- | --- |
| 깊이 | 표면 설명에서 멈추지 않았는가 | spec `SP3` |
| 다관점 | 한 개념을 최소 3종 각도로 비췄는가 | spec `SP4` |
| 완전성 | 필수 절이 다 있고, 뺀 조건부 절에 사유가 있는가 | spec `sections` · `SP8` |
| 정확성 | 수치·경로·명령 결과가 실제로 확인된 것인가 | L0 `E1~E4` |
| 기술 건전성 | 빌드·시뮬 hydration·시각 자료 실제 렌더 | spec `SP9` · `paths.json` `commands` |

빌드(`bun run build`)와 hydration(`astro-island` 마크업)은 **추측하지 말고 실제로 확인한다.**
MDX 는 JSX 문법 오류 하나가 사이트 전체 빌드를 깬다.

## 4. 통과 조건과 보완 루프

점수제가 아니다.

> **PASS = MUST 전부 충족 + SHOULD 미흡 ≤ 2 + IF-APPLICABLE 은 충족 또는 정당한 생략 메모.**

- **항목마다 본문 인용 근거를 요구한다. 인용 못 하면 그 항목은 미흡이다.** 추측으로 충족 처리하지 않는다.
- 생략 사유는 **게이트 보고에만** 남긴다. 독자용 본문에 "해당 없음" 을 남기면 그 자체가 위반이다.
- 보완 루프는 **최대 3라운드**이고 **자동 통과는 없다.** 라운드를 다 써도 미통과면 그대로 보고한다.

**위임 경계** — 이 스킬은 *판정과 보완 오케스트레이션*이 책임이다.

- 새 집필이 필요한 보완(누락 절·깊이 부족·시나리오 보강) → `tech-deepdive`
- 문장·맞춤법 → `review-post` · 설득·구조 → `review-writing`
  (AI 리듬은 넘기지 않는다 — 이 스킬이 부르는 `authoring-gate` 의 보완 루프가 직접 맡는다)
- 시뮬/빌드 깨짐 → `react-sim` 규약으로 고친다

호출 맥락에 따라:

- **오케스트레이터 안에서**: 루프를 자동으로 돌리되 라운드마다 무엇을 고쳤는지 남긴다.
  3라운드 후에도 FAIL 이면 **발행을 막고** 사용자 판단을 구한다.
- **사용자 직접 호출**: 라운드 1 결과를 보여준 뒤
  "(a) 통과까지 자동 보완 / (b) 항목 골라 보완 / (c) 여기까지" 를 묻고 진행한다.

## 5. 종료 보고

최종 판정 · 돈 라운드 수 · 라운드별 핵심 보완 · 남은 미흡 · 생략한 조건부 절과 사유 ·
`resolve` 해시(어떤 규칙 조합으로 채점했는지)를 한 번에 보고한다.
PASS 면 다음 단계(`post-finalize` → `publish-post`)를 안내한다.

## 참조

| 무엇 | 어디 |
| --- | --- |
| 루브릭 전문 | `Skill(authoring-kit:authoring-method)` |
| 명세 전문 | `authoring.py show spec tech-deepdive` |
| 경로·빌드 명령 | `.claude/authoring/paths.json` |
| 이 프로젝트가 선 규칙 조합 | `.claude/authoring.lock.json` |

## 주의

- **루브릭을 이 파일에 다시 쓰지 않는다.** 그렇게 갈라진 것을 방금 합쳤다.
  기준을 바꾸려면 L0 루브릭이나 spec 의 `principles[]` 를 고친다.
- 활성 voice 를 깎아서 통과시키지 않는다. 면제된 코드를 "고쳐서" 카운터를 내리는 것은 실패다.
