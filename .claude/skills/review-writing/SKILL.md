---
name: review-writing
description: >
  작성된 글이 **거시 글쓰기 품질**(설득력·호소력 / 개연성·논리 / 글의 구조[PREP·3WR·4MAT·서사] /
  내 문체 일치)을 충족하는지 `assets/WRITING_CHECKLIST.md`로 채점·PASS/FAIL 판정하고, 미통과면
  보완 지시 → 수정 → 재채점을 통과까지(최대 3회) 반복하는 글쓰기 품질 게이트 스킬. 문체 기준은
  `_shared/STYLE_GUIDE.md`, 좋은 사례 근거는 `assets/WORMWLRM_NOTES.md`.
  "/review-writing <파일>", "이 글 설득력·구조 검토해줘", "글쓰기 품질 게이트 돌려줘" 같은 표현에 반응한다.
  문장·맞춤법 미시 교정은 `review-post`, 기술 깊이·정확성은 `quality-gate`가 맡는다(겹침 금지).
argument-hint: <article-file (보통 draft/*.mdx)>
---

# review-writing 스킬

글이 **거시 글쓰기 품질**(설득·논리·구조·문체)의 합격선을 넘었는지 `assets/WRITING_CHECKLIST.md`로
**판정**하고, 미달이면 **보완을 반복 요청**해 통과시킨다. `quality-gate`(기술)와 같은 *게이트+보완 루프* 형태지만
**보는 축이 다르다**.

## 리뷰 4단계 책임 경계 (겹침 방지 — 반드시 지킨다)

- **humanize-post(리듬)**: AI 기계 문체 — 쉼표·어미·버즈워드·헤지·상투 구조. → 이 스킬은 *리듬 교정을 직접 하지 않는다*(V7은 판정만).
- **review-post(미시)**: 문장/맞춤법/번역투/스캔성 + AI 문체 잔존 판정. → 이 스킬은 *맞춤법 재교정을 하지 않는다*(G1은 합격선만).
- **review-writing(이 스킬, 거시)**: 설득 흐름·논리 개연성·글 구조 형식·문체 일치. **이게 내 권한 범위.**
- **quality-gate(기술)**: 깊이·완전성·다관점·정확성. → 기술 사실 검증은 이 스킬이 하지 않는다.

구조를 바꿀 때 **앞 단계(humanize-post·review-post)의 문장 미세교정 결과를 되돌리지 않는다.** 특히 문단을
재배치하면서 humanize-post가 심어 둔 **단문 강타·어미 변주를 원상복구하지 않도록** 주의한다. 무엇을 왜
고쳤는지 기록해 다음 단계가 다시 건드리지 않게 한다.

## 워크플로우 상의 위치

```
tech-deepdive → humanize-post(리듬) → review-post(미시) → [review-writing: 채점→보완→재채점 (≤3회)] → quality-gate(기술) → post-finalize → publish-post → ship-post
```

## 입력 / 출력 계약

- **입력**: 채점할 글 경로(보통 `draft/<…>.mdx`). 없으면 `draft/` → `src/content/posts/`에서 mtime 최신을 골라 한 줄로 알린다.
- **출력**: 최종 **PASS / FAIL** + 라운드 수 + (auto에서) 직접 반영한 보완 목록 + 남은 미흡(있으면).
- **수정 권한**: 설득 흐름·구조 재배치·문체 일치에 한해 `Edit`. 맞춤법·기술 사실은 건드리지 않고 해당 단계로 돌린다.

## 동작 순서

### 1. 대상 글 결정
- 인자 경로가 있으면 사용. `Read`로 본문 전체를 읽는다. frontmatter·`draft/` 스캐폴드 잔재(`## 플롯 후보` 등)는 채점 제외.
- 글 **유형**을 먼저 판정한다(기술 설명형 / 서사·회고·설득형) — `WRITING_CHECKLIST` S1·IF-APPLICABLE 항목 평가 기준이 갈린다.

### 2. 채점 (1라운드)
`assets/WRITING_CHECKLIST.md`의 P(설득)·C(개연)·G(문법 게이트선)·S(구조)·V(문체) 항목을 순서대로 평가한다.
- 각 항목: **충족 / 미흡 / 해당없음** + **본문 인용 근거**(인용 못 하면 미흡). 문체(V)는 `_shared/STYLE_GUIDE.md`와 대조하고,
  V5·V6(자연스러운 한국어·영어투)은 `_shared/NATURAL_KOREAN_GUIDE.md`의 안티패턴 카탈로그·자가점검(§A·§C)으로 본문을 훑어 판정한다.
- **V7(AI 문체 잔존)** 은 `../humanize-post/scripts/scan_ai_style.py` 를 돌려 나온 **등급(A~D)** 을 인용해 판정하고,
  스캐너가 못 잡는 **F1~F4(상투 구조·마무리 공식)·R4·R6·R7** 은 본문을 읽고 채운다. 판정 근거는 `_shared/AI_KOREAN_PATTERNS.md`.
  **Part B(저자 색 보호 9항목)에 걸리는 것은 미흡 근거로 쓰지 않는다.**
- 좋은 사례 기준이 필요하면 `assets/WORMWLRM_NOTES.md`를 참조(P2/P3/S2/S3/S4).
- 판정 규칙(체크리스트와 동일):
  > **PASS** = MUST 전부 충족 · SHOULD 미흡 ≤ 2 · IF-APPLICABLE은 충족 또는 정당한 생략 메모. 그 외 **FAIL**.

### 3. 결과 출력
```
# 글쓰기 품질 게이트 (라운드 N): <파일>  · 유형: 기술설명 / 서사
판정: ✅ PASS  /  ❌ FAIL — 보완 필요
- MUST: 통과 X/Y   SHOULD: 미흡 K건   IF-APPLICABLE: 충족 a / 생략 b / 미흡 c

## ❌ 미흡 항목 (보완 지시)
- **[P2]** 인용: "원문 일부"
  - 문제: <기준 대비 무엇이 부족한가>
  - 보완: <어디에·무엇을·어떻게 — 설득/구조/문체 관점으로만>

## ✅ 충족 (항목코드 나열)
- P1, C1, C2, S1, V1, ...
```

### 4. 보완 루프 (FAIL일 때)
미통과면 **통과까지 반복**, **최대 3라운드**.
1. 보완 지시를 실행한다 — **설득 흐름·구조 재배치·문체 일치는 이 스킬이 직접 `Edit`**.
   단, **새 집필이 필요한 보완**(없는 근거·사례·섹션 추가)은 직접 쓰지 말고 **`tech-deepdive`에 위임**(해당 부분만 지시).
   맞춤법은 `review-post`, **AI 문체(V7)는 `humanize-post`**, 기술 사실은 `quality-gate`로 돌린다(직접 손대지 않음).
   - **V7이 D면 보완 루프에 넣지 않는다.** 리듬 교정은 수정률 상한·의미 보존 6점 가드가 있는 `humanize-post` 권한이다.
     그쪽을 한 번 돌린 뒤 재채점한다.
2. 보완 후 **2단계로 돌아가 재채점**, 라운드 번호를 올린다.
3. **PASS면 종료**. 3라운드를 채워도 FAIL이면 멈추고 남은 미흡 + 자동 보완이 어려운 이유를 보고한다(임의 통과 금지).

호출 맥락:
- **오케스트레이터 안에서**: 루프를 자동으로 돌리되 라운드마다 무엇을 고쳤는지 남긴다. 3라운드 후 FAIL이면 다음 단계를 막고 사용자 판단을 구한다.
- **사용자 직접 호출**: 라운드 1 결과를 보여준 뒤 "(a) 통과까지 자동 보완 / (b) 항목 골라 보완 / (c) 여기까지"를 묻는다.

### 5. 종료 보고
최종 판정, 돈 라운드 수, 라운드별 핵심 보완, 남은 미흡, **review-post/quality-gate로 넘긴 항목**을 한 번에 보고한다.
PASS면 다음 단계(`quality-gate`)를 안내한다.

## 참조 파일
- `assets/WRITING_CHECKLIST.md` — 설득/개연/문법선/구조/문체 루브릭(MUST/SHOULD/IF-APPLICABLE, PASS/FAIL).
- `assets/WORMWLRM_NOTES.md` — wormwlrm 3편 스냅샷(좋은 사례 근거).
- `../_shared/STYLE_GUIDE.md` — 내 문체 기준(V 항목 대조용). **집필(tech-deepdive)과 공유.**
- `../_shared/NATURAL_KOREAN_GUIDE.md` — 영어투 교정·수사 팔레트(V5·V6 채점 근거). **집필(tech-deepdive)과 공유.**
- `../_shared/AI_KOREAN_PATTERNS.md` — AI 문체 6범주 + **Part B 저자 색 보호 목록**(V7 채점 근거). **`humanize-post`·`review-post`와 공유.**
- `../humanize-post/scripts/scan_ai_style.py` — V7 등급 산출용 스캐너.

## 주의
- **판정 근거는 본문 인용**. 추측으로 충족 처리하지 않는다.
- **자동 통과 금지**: 라운드를 다 써도 미통과면 그대로 보고한다. 기준을 낮추지 않는다.
- **경계 엄수**: 맞춤법(→review-post)·AI 리듬(→humanize-post)·기술 사실(→quality-gate)은 손대지 않는다. 구조 변경 시 앞 단계 미세교정 보존.
- **저자 색은 미흡 근거가 아니다**: `결론적으로`·만연체·당위 마무리·병렬 점층 등 `AI_KOREAN_PATTERNS.md` Part B 9항목은 V7에서 제외한다.
- 문체 판정은 `STYLE_GUIDE` 기준이며, Part 1(샘플 추출 사실)은 절대 기준, Part 2(일반 규칙) 위반은 보완 대상.
