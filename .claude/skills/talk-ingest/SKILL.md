---
name: talk-ingest
description: >
  빵토 교수님과의 **대화 원본**(AI 대화 export 파일)을 받아 폭신 대담 에피소드로 만드는 스킬.
  ① `scripts/ingest-talk.ts` 로 원문을 `raws/talks/<slug>/` 에 불변 봉인하고 노이즈를 걷어
  발화 목록만 뽑고, ② 그 발화를 `authoring-kit` 의 `polssin-daedam` 명세 · `ppangtolab-prof`
  퍼소나로 교정해 정형본 `talk.md` 를 쓰고, ③ `scripts/build-talk.ts` 로 발행물
  `src/content/posts/talk-<slug>.mdx` 를 굽고 `bun run talk:verify` 로 확인한다.
  **원문은 한 바이트도 바꾸지 않는다** — 방향이 바뀌면 talk.md 부터 다시 만든다.
  "대화 원본 넣어줘", "이 대화로 대담 만들어줘", "/talk-ingest <파일>", "대담 정형화해줘"
  같은 표현에 반응한다. 빈 대담 스켈레톤만 필요하면 `init-post --talk` 를 쓴다.
argument-hint: <대화 원본 파일> [slug]
---

# talk-ingest 스킬

대화 원본 하나를 **폭신 대담 에피소드**로 만든다. 이 스킬이 존재하는 이유는 셋이다.

- 대화 export 는 사람 발화보다 시스템 프롬프트·도구 호출이 훨씬 많다 — 실측 표본에서
  100,125 B 중 **남는 발화가 23.4%** 였다. 매번 집필자가 그걸 다 읽을 수는 없다.
- 대담의 골격(`<QA n q>` · `<PullQuote>` · `series`/`order`)은 기계가 검사할 수 있는
  계약이다. 손으로 지키면 반드시 어긋난다.
- 방향이 바뀔 때 **다시 만들 수 있어야** 한다. 그러려면 원문이 살아 있어야 한다.

## 세 층 — 이 스킬이 오가는 자리

```text
  L1 원문        raws/talks/<slug>/source/ + source.json     아무도 안 고친다
      │  ← ① ingest-talk.ts (결정론: 봉인 + 노이즈 제거)
      ▼
  L2 정형본      raws/talks/<slug>/talk.md                    사람이 계속 손본다
      │  ← ② 이 스킬의 판단 (교정) — 여기가 유일한 판단 구간이다
      ▼          ← ③ build-talk.ts (결정론: 계약 검사 + 치환)
  L3 발행물      src/content/posts/talk-<slug>.mdx            손으로 고치지 않는다
```

**규격의 정본은 스킬이 아니라 저장소에 있다.** 읽어야 할 것 둘.

- `raws/talks/_rules/NORMALIZE_RULES.md` — 원본에서 무엇을 버리고 남기는가
- `raws/talks/_rules/TALK_MD.md` — `talk.md` 문법

## 동작

### ① 봉인과 정규화 — 스크립트가 한다

```bash
bun scripts/ingest-talk.ts --from <원본 파일> --slug <slug>
```

`raws/talks/<slug>/source/` 에 원본을 **이름·확장자 그대로** 복사하고 `source.json`
(출처·모델·대화 시각·sha256·무결성)을 쓴 뒤, 정규화된 **발화 목록**을 stdout 으로 낸다.
그 목록을 파일로 저장하지 않는다 — 정본은 `talk.md` 하나뿐이다.

`slug` 를 안 받았으면 대화 주제에서 영문 케밥으로 만들어 **사용자에게 확인받는다.**
발행 URL 이 `/posts/talk-<slug>` 가 되므로 나중에 바꾸기 어렵다.

**비0으로 끝나면 거기서 멈춘다.** 우회하지 않는다. 넷 중 하나다.

| 사유 | 무엇을 해야 하나 |
| --- | --- |
| `<truncated N bytes>` | **원본을 다시 받아야 한다.** 잘린 대화로 만든 대담은 다시 만들 수 없다 |
| 알 수 없는 형식 | `NORMALIZE_RULES.md` §1 에 어댑터를 추가한다. 추측해서 읽지 않는다 |
| 남는 발화 0개 | 대화가 아니거나 어댑터가 잘못 골렸다 |
| 민감 패턴 | 봉인 자체가 안 된다. 이 저장소는 공개다 |

### ② 교정 — 이 스킬이 판단한다

발화 목록을 받아 `talk.md` 를 쓴다. 문법은 `TALK_MD.md`, 문체와 골격은
**`authoring-kit` 이 소유한다.**

```bash
python3 ${CLAUDE_PLUGIN_ROOT}/scripts/authoring.py resolve \
    --voice ppangtolab-prof --spec polssin-daedam --profile main
```

`polssin-daedam` 명세의 원칙 여덟 중 **넷은 기계가 잡고 넷은 여기서 지킨다.**

| 사람(이 스킬)이 지키는 것 | 무엇 |
| --- | --- |
| SP2 | 한 `<QA>` 는 질문 하나만. 답이 옆으로 새면 다음 질문의 몫이다 |
| SP3 | **고민에서 나온 질문만.** 설명을 끌어내려는 형식적 질문은 위장한 강의다 |
| SP7 | 질문이 깊어지는 순서로. 뒤 질문이 앞 답변을 딛고 서야 한다 |
| SP8 | 모르는 것은 모른다고 말하게 둔다 |

교정에서 하는 것과 안 하는 것.

- **한다**: 톤앤매너를 `ppangtolab-prof` 로 맞춤 · 비문·맞춤법 교정 · 원본 대화의
  군더더기(도구 호출을 설명하는 대목, "잠시만요" 류) 제거 · 질문문을 다듬어 `## Q.` 로
  세우기 · 정수 인용구 1~2개 뽑기 · `## 마치며` 쓰기
- **안 한다**: 원본에 없는 주장 만들기 · 답변을 근거 없이 강화하기 · 질문 순서를 이유
  없이 뒤집기. 원본의 `[n]`(step_index)을 곁에 두고 대조한다

**본문에 이모지를 쓰지 않는다** — `<Mark name="…" />` 두들 마크로 쓴다(저장소 규약).
**강조를 조사 앞에서 끊지 않는다** — `**용어(term)**이` 는 화면에 별표가 그대로 나온다.

### ③ 굽기와 확인 — 스크립트가 한다

```bash
bun run talk:build <slug>     # → src/content/posts/talk-<slug>.mdx
bun run talk:verify           # 3계층이 어긋나지 않았는지
bun run build                 # 실제로 렌더되는지
bun scripts/check-post-markers.ts
bun scripts/check-emphasis.ts && bun scripts/check-emphasis.ts --dist
```

`talk:build` 가 거부하면 `talk.md` 를 고쳐서 다시 부른다 — **발행물을 손으로 고치지
않는다.** 고치면 `talk:verify` 가 다음 실행에서 잡는다.

발행물은 `draft: true` 로 나온다. 발행 준비가 되면 `talk.md` 의 `draft` 를 `false` 로
바꾸고 다시 굽는다.

## 다른 진입점과의 경계

| 원하는 것 | 쓸 것 |
| --- | --- |
| 대화 원본이 있고 그것으로 에피소드를 만든다 | **이 스킬** |
| 원본 없이 바로 쓸 빈 대담 스켈레톤 | `init-post --talk` |
| 이미 발행된 대담의 태그·시리즈 손질 | `post-finalize` |
| 발행물을 고치고 싶다 | 고치지 않는다. `talk.md` 를 고치고 `talk:build` |

`init-post --talk` 와 합치지 않은 이유는 진입점이 다르기 때문이다 — 그쪽은 빈 스켈레톤,
이쪽은 내용이 찬 것을 굽는다. 둘 다 `src/templates/talk-episode.mdx` 를 공유한다.

## 주의

- **`source/` 안을 절대 고치지 않는다.** 오타도, 경로도, 잘린 자리도 그대로 둔다.
  고치면 `talk:verify` 의 해시 검사가 즉시 잡는다.
- **문체 규칙을 이 스킬이 들고 있지 않는다.** 전부 `authoring-kit` 위임이다. 이 저장소는
  같은 규칙을 여러 곳이 각자 들고 있다가 갈라진 적이 있다.
- 픽스처는 `scripts/fixtures/talk/` 에 있다. `raws/talks/` 에 두면 그게 곧 발행 글이 된다.
