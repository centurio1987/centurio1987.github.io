---
name: tech-deepdive
description: >
  글감 메모(보통 `raws/`)를 받아 독자를 끝까지 이해시키는 **깊은 기술 해설 글**을
  MDX로 집필하고, codex·agy(ChatGPT/Gemini) 외부 검토(누락·모순·사실성)를 거쳐
  `draft/`에 완성 초안을 만드는 스킬. 엄밀한 정의·장비·프로토콜·실무 시나리오·
  오해 포인트·실습 과제·다이어그램·React 시뮬레이션을 모두 담는다. 단일 글 또는
  순서 있는 시리즈로 쓸 수 있다.
  "/tech-deepdive <메모>", "이 주제로 기술 글 깊게 써줘", "심층 기술 해설 작성",
  "OSI 7계층 글 써줘" 같은 표현에 반응한다. 4축 검토는 `review-post`,
  이미지/태그/시리즈 링크는 `post-finalize`, 발행은 `publish-post`가 맡는다.
argument-hint: <idea-file-path (보통 raws/ 하위)>
---

# tech-deepdive 스킬

글감 메모를 받아 **해부학적으로 깊은 기술 해설 글**을 MDX로 끝까지 집필하고, 외부 모델(codex/agy)에게
**누락·모순·사실성** 검토를 받아 보강한 뒤 `draft/<stem>.mdx` 완성 초안을 만든다.

이 스킬의 책임은 **본문 작성 + 외부 검토까지**다. 4축 한국어 리뷰(`review-post`), 이미지·태그·시리즈
링크(`post-finalize`), 정식 발행(`publish-post`)은 후속 스킬이 맡는다. 실제 "글 써줘" 요청을 발행까지
끝내는 일은 `tech-article-publisher` 서브에이전트가 이 스킬을 첫 단계로 호출해 오케스트레이션한다.

## 워크플로우 상의 위치

```
raws/<메모>.md
  → [tech-deepdive]   draft/<stem>.mdx   (완성 본문 + 외부검토 반영)
  → review-post (4축) → quality-gate (체크리스트+보완 루프) → post-finalize (이미지/태그/시리즈) → publish-post → src/content/posts/
```

## 이 글이 반드시 충족해야 하는 것 (ORDER 원칙)

집필 내내 아래를 기준으로 삼는다. 어기면 글을 고친다.

- **독자 = 고객.** 독자가 이해하지 못하면 실패다. "어떻게든 이해시킨다"는 태도로 쓴다.
- **몰입·설득 문체.** 스펙·용어를 건조하게 나열하지 않는다. 왜 중요한지, 무슨 문제를 푸는지 먼저 건다.
- **점진적 공개.** 비전문가도 따라오도록 쉬운 것 → 어려운 것 순서로 쌓는다. 약어는 첫 등장 시 풀어쓴다("OSI(Open Systems Interconnection)").
- **해부학적 깊이.** 표면 설명에서 멈추지 않는다. "왜 그렇게 동작하는가"까지 집요하게 파고든다.
- **다관점.** 한 개념을 엄밀한 정의·비유/묘사·다이어그램·실무 사례·구현/코드·실습 과제·오해 포인트·React 시뮬레이션 중
  여러 각도로 비춘다(자세한 메뉴는 `assets/SECTION_PATTERNS.md`).
- **한국어 본문 + 기술 용어 원어**(TCP, MTU, ARP 등은 원어 유지).

## 동작 순서

### 1. 글감 메모 읽기 + 범위 결정

- 인자 경로가 있으면 사용. 없으면 `raws/` 하위를 살펴 후보를 제시하거나 묻는다. 공백/한글 경로는 따옴표 처리.
- 파일 읽기 도구로 **파일 전체**를 읽어: 주제, 대상 독자 수준, 메모가 명시한 필수 포함 항목, 사용자가 이미 내린 결론을 파악한다.
- **단일 글 vs 시리즈**를 사용자에게 확인한다.
  - **단일 종합 글**: 한 편에 전부. `series` 없음.
  - **시리즈**: 편 분할 목록(편별 제목 + `series` 동일값 + `order` 1..N + 각 편 선수지식·내부링크)을 먼저 제시해 합의한 뒤,
    **이번 호출에서는 1편만** 집필한다(컨텍스트 폭주·편 간 중복 방지). 나머지 편은 같은 스킬을 다시 호출.

### 2. 해부학적 아웃라인 작성 (+ 가벼운 근거 조사)

`assets/SECTION_PATTERNS.md`의 섹션 메뉴를 기준으로 이 주제의 아웃라인을 만든다.

- ORDER가 요구한 모든 관점을 **칸으로 두고 매핑**한다: 엄밀한 정의 / 관련 장비 / 관련 프로토콜·기술 /
  실무 시나리오(단계별 원리·동작·문제·해결·팁) / 오해하기 쉬운 포인트 / 실습 과제+수행 절차 / 다이어그램 / React 시뮬레이션.
- **필수 관점**(정의·핵심원리·실무 시나리오·오해 포인트·요약)은 항상 채운다. **조건부 관점**(장비/프로토콜 표, 시뮬레이션 등)은
  주제에 맞지 않으면 비우되 **왜 뺐는지 한 줄 메모**를 남긴다(억지 섹션 금지).
- **근거 조사(가벼운)**: 표준/RFC/스펙/공식·벤더 문서로 핵심 사실을 확인하고, 아웃라인에 `출처: …` `버전/검증일: …`을 메모한다.
  필요하면 `WebSearch`/`WebFetch`를 쓴다. 사전지식만으로 단정하지 않는다.
- 누락 칸이 남았는지 스스로 점검하고, 비운 칸은 이유를 적는다.

### 3. 본문 집필 (MDX)

`assets/ARTICLE_TEMPLATE.mdx`를 베이스로 `draft/<stem>.mdx`에 **섹션을 끝까지** 채운다(시리즈면 `draft/<series-slug>-<order>.mdx`).

- 문체·깊이·구성은 위 "ORDER 원칙"과 `assets/SECTION_PATTERNS.md`를 따른다.
- **다이어그램·React 시뮬레이션**은 `assets/REACT_SIM_GUIDE.md` 규약대로 작성한다:
  **글마다 co-located `.tsx` 컴포넌트**(`src/components/posts/<slug>/<Name>.tsx`)를 만들어 MDX 상단에서 `import` 하고
  `<Name client:visible />`로 삽입한다(인라인 정의는 hydration 안 됨). 외부 라이브러리 금지(inline style),
  브라우저 API는 `useEffect`/`typeof window` 가드. draft 단계에서는 컴포넌트를 `src/components/posts/<draft-slug>/`에 두고
  발행 시 `publish-post`가 위치/슬러그를 정리한다.
- 사진/일러스트가 필요한 자리는 `post-finalize`용 `[[[이미지 단서]]]`로 남긴다(산문 영역에만, JSX 블록 밖에).
- frontmatter는 임시값으로 채우되 `src/content.config.ts` 스키마와 호환되게 둔다(정식화는 `publish-post`).

### 4. 외부 검토 (누락·모순·사실성)

```bash
bash .codex/skills/tech-deepdive/scripts/review-article.sh "draft/<stem>.mdx"
```

- 스크립트 stdout을 **요약하지 말고 그대로** 사용자에게 보여준다(모델이 짚은 표현이 핵심).
- **완성 게이트**: 스크립트가 종료코드 2(둘 다 `[skip]`/실패)면 외부 검토 미통과다 — draft를 "완성"으로 보고하지 말고,
  원인(미설치/미인증: `codex login`, 터미널에서 `agy` 1회 실행)을 안내하고 재시도 여부를 묻는다. 한쪽만 성공하면 진행하되 그 사실을 알린다.
- 지적 중 **실제로 유효한 것**을 사용자와 함께 골라(다른 모델은 이 글의 의도/맥락을 모른다) 본문을 보강한다. 재검토는 1회까지.

### 5. 완료 안내 + 인계

- 만든 파일 경로(`draft/<stem>.mdx`, co-located 컴포넌트), 외부 검토 결과 요지(미통과면 그 사실)를 보고한다.
- 다음 단계 안내: `review-post`(4축) → `quality-gate`(품질 체크리스트+보완 루프) → `post-finalize`(이미지/태그/시리즈) → `publish-post`(발행).
- 시리즈면 남은 편 목록과 "다음 편 쓰려면 같은 스킬 재호출"을 안내한다.

## 참조 파일

- `assets/ARTICLE_TEMPLATE.mdx` — 심층 글 섹션 스켈레톤
- `assets/SECTION_PATTERNS.md` — 섹션 유형별 작성 메뉴(목적·필수요소·좋은예/나쁜예) = ORDER 다관점 체크리스트
- `assets/REACT_SIM_GUIDE.md` — Astro MDX용 자급식 React 시뮬레이션 작성 규약
- `scripts/review-article.sh` — codex/agy 외부 검토(누락·모순·사실성)

## 카테고리 슬러그 (frontmatter `category`)

`planning`(기획) · `architecture`(아키텍처) · `strategy`(전략) · `skills`(기술) · `design`(설계) · `research`(리서치) · `quality`(품질) · `leadership`(리더십). 기술 해설은 보통 `skills` 또는 `architecture`. `src/lib/categories.ts` enum과 일치해야 한다.

## 주의

- 이 스킬은 **본문 + 외부검토까지만**. 발행/이미지 생성/4축 리뷰는 후속 스킬에 맡긴다.
- 억지로 모든 섹션을 채우지 않는다 — 뺀 칸은 이유를 남긴다.
- 외부 검토 미통과(둘 다 실패) 상태를 "완성"으로 보고하지 않는다.
- MDX 작성 후에는 `bun run build`가 통과하는지 확인한다(JSX 문법 오류 1건이 사이트 전체 빌드를 깬다).
