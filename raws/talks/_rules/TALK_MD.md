# `talk.md` 문법 — L2 정형본

> KAN-066-KK9Q50 `S3` 산출물. **이 문서가 정본이고 `src/lib/talkSource.ts` 가 그 구현이다.**
> 문법 버전 1 (`TALK_MD_GRAMMAR_VERSION`).

`raws/talks/<slug>/talk.md` 는 대담 한 편의 **정본**이다. 사람이 계속 손보는 물건이라
평범한 마크다운처럼 읽히게 만들었고, 형식이 흐물해지지 않도록 파서가 계약을 잡는다.

## 전체 모양

````markdown
---
title: "Entry 는 누구의 것인가"
description: "두 분석 패턴이 같은 이름으로 다른 것을 가리킬 때"
pubDate: 2026-08-16
category: architecture
author: ppangto
tags: ["AI대담", "DDD"]
series: "폭신함 외길 인생"
order: 1
draft: true
source: ddd-entry-contradiction
---

## Q. 같은 Entry 인데 두 문서의 정의가 다릅니다. 어느 쪽이 맞습니까?

둘 다 맞습니다. 다만 서로 다른 것을 보고 있었을 뿐이에요.

> [!정수]
> 모순은 모델에 있지 않았습니다. 모델을 잘라 본 단면에 있었어요.

## Q. 그러면 Entry 를 어디에 두어야 합니까?

둘 사이에 둡니다.

## 마치며

두 문서를 합치고 나니 이름 하나가 남았습니다.
````

## 굳힌 판단 넷

1. **질문 번호를 쓰지 않는다.** `<QA n>` 의 `n` 은 파서가 순서에서 매긴다. 손으로 적게 하면
   질문 하나를 중간에 끼울 때마다 반드시 어긋나기 때문이다 — **어긋남을 검출하는 대신
   어긋날 수 없게 만들었다.**
2. **`template` 을 적지 않는다.** 빌더가 항상 `talk` 을 박는다. 두 곳이 값을 들고 있으면
   언젠가 다투고, 다투면 레이아웃이 조용히 바뀐다.
3. **frontmatter 는 YAML 이 아니라 YAML 의 문서화된 부분집합이다.** 아래 §1 밖의 문법을
   만나면 조용히 다르게 해석하지 않고 `FRONTMATTER_UNSUPPORTED` 로 멈춘다.
4. **정수 인용구는 답변 안에 쓰고 발행물에서는 답변 뒤에 놓인다.** 쓰는 자리와 놓이는
   자리가 다른 것은 템플릿(`src/templates/talk-episode.mdx`)이 `<PullQuote>` 를
   `</QA>` 뒤에 두기 때문이다.

## 1. frontmatter

`---` 로 열고 닫는다. **한 줄에 `키: 값` 하나**이고, 값으로 받는 것은 다섯 가지뿐이다.

| 값 꼴 | 예 |
| --- | --- |
| 따옴표 문자열 | `title: "Entry 는 누구의 것인가"` |
| 맨 스칼라 | `category: architecture` |
| 정수 | `order: 1` |
| 참·거짓 | `draft: true` |
| 인라인 배열 | `tags: ["AI대담", "DDD"]` |

여러 줄 값(`|`·`>`), 중첩 맵, 여러 줄 배열은 **없다.** 빈 줄과 `#` 주석 줄은 넘어간다.

### 필드

| 키 | 필수 | 무엇 |
| --- | --- | --- |
| `title` | ● | 에피소드 제목. 질문형이 좋다 |
| `description` | | 한 줄 리드 |
| `pubDate` | ● | `YYYY-MM-DD` |
| `category` | ● | `src/lib/categories.ts` 의 9종 중 하나 |
| `author` | ● | **인터뷰어**. `src/lib/authors.ts` 의 id. `ppangtolab-prof` 는 거부된다 |
| `tags` | | 기본 `[]` |
| `series` | ● | 시리즈명. EP 네비게이션을 구동한다 |
| `order` | ● | EP 번호. 양의 정수 |
| `draft` | | 기본 `true` |
| `source` | ● | L1 이 앉아 있는 `raws/talks/<slug>/` 의 slug |

`series` 와 `order` 가 선택이 아니라 필수인 이유는, 이 둘이 이전화·다음화·지난 대담 카드를
전부 구동하기 때문이다. 비워 두면 글은 나가지만 시리즈에서 떨어져 나간다.

`author` 가 인터뷰어인 이유는 대담을 **기록해 올리는 쪽**이 저자이기 때문이다.
답변 화자인 교수님은 `src/lib/talk.ts` 가 화자 듀오에 세운다.

## 2. 질문 — `## Q. <질문문>`

`##` 헤딩에 `Q.` 접두사를 붙이고 그 뒤가 질문문이다.

- **번호를 적지 않는다.** 파서가 순서대로 1부터 매긴다.
- 질문문이 비면 `Q_EMPTY`.
- 첫 `## Q.` **앞에 본문을 두지 않는다** — 대담은 질문으로 시작한다.
  들어가는 말이 필요하면 첫 질문 안에 넣는다(`CONTENT_BEFORE_FIRST_Q`).
- 질문이 하나도 없으면 `NO_QA`.

한 질문에는 **질문 하나만** 담는다. 답이 옆으로 새면 그건 다음 질문의 몫이다 —
이건 파서가 못 잡으므로 사람이 지킨다.

## 3. 답변 — 헤딩 다음의 본문

평범한 마크다운이다. 문단·목록·코드블록·표 전부 쓸 수 있다.
비어 있으면 `ANSWER_EMPTY`.

`###` 이하 헤딩은 답변 안에서 자유롭게 쓴다 — 파서는 `##` 만 구획으로 본다.

## 4. 정수 인용구 — `> [!정수]`

```markdown
> [!정수]
> 그 대담을 거쳐야만 할 수 있게 된 말 한 문장.
```

- 답변 안 아무 자리에나 쓰고, 발행물에서는 그 `<QA>` **뒤에** 놓인다.
- **에피소드당 1~2개.** 0개거나 3개 이상이면 `PULLQUOTE_COUNT`.
- 비면 `PULLQUOTE_EMPTY`.
- 여러 줄로 써도 된다 — 이어지는 `>` 줄이 한 인용구로 묶인다.

개수를 조인 이유는 정수가 **요약이 아니라 도달점**이기 때문이다. 요약이라면 여러 개일 수
있지만, 도달점은 그렇지 않다.

일반 인용(`> …`)은 `[!정수]` 표식이 없으므로 답변 본문에 그대로 남는다.

## 5. 마치며 — `## 마치며` (선택)

회고 한두 문단. 있으면 **마지막**에 온다(`CLOSING_NOT_LAST`). 비면 `CLOSING_EMPTY`.

## 6. 에러 코드

| 코드 | 언제 |
| --- | --- |
| `FRONTMATTER_MISSING` | 파일이 `---` 로 시작하지 않는다 |
| `FRONTMATTER_UNTERMINATED` | 닫는 `---` 이 없다 |
| `FRONTMATTER_UNSUPPORTED` | §1 밖의 문법 |
| `FRONTMATTER_DUPLICATE_KEY` | 같은 키가 두 번 |
| `FRONTMATTER_INVALID` | 스키마 위반(필수 누락·enum 밖·형식 오류) |
| `TEMPLATE_IN_FRONTMATTER` | `template` 을 적었다 |
| `AUTHOR_IS_INTERVIEWEE` | `author` 가 `ppangtolab-prof` |
| `CONTENT_BEFORE_FIRST_Q` | 첫 질문 앞에 본문 |
| `NO_QA` | 질문 0개 |
| `Q_EMPTY` | 질문문 없음 |
| `ANSWER_EMPTY` | 답변 없음 |
| `CLOSING_NOT_LAST` | `## 마치며` 뒤에 질문이 더 있다 |
| `CLOSING_EMPTY` | `## 마치며` 가 비었다 |
| `PULLQUOTE_COUNT` | 정수가 1~2개가 아니다 |
| `PULLQUOTE_EMPTY` | 정수가 비었다 |

전부 `TalkParseError` 로 던지고 가능하면 줄 번호를 붙인다.

## 7. 명세와의 대응

`.claude/authoring/specs/polssin-daedam/spec.json` 의 원칙 중 **기계가 잡는 것**과
**사람이 지키는 것**을 갈라 둔다.

| 원칙 | 파서가 잡나 |
| --- | --- |
| SP1 `n` 은 1부터 연속 · 목차를 손으로 쓰지 않는다 | **문법에서 제거** — 번호를 안 쓰므로 어긋날 수 없다 |
| SP4 정수는 1~2개 | 잡는다 (`PULLQUOTE_COUNT`) |
| SP5 `template: talk` · `series` · `order` | 잡는다 (`TEMPLATE_IN_FRONTMATTER` · `FRONTMATTER_INVALID`) |
| SP6 `author` 는 인터뷰어 | 잡는다 (`AUTHOR_IS_INTERVIEWEE`) |
| SP2 한 질문에 주제 하나 | 못 잡는다 — 사람이 지킨다 |
| SP3 고민에서 나온 질문만 | 못 잡는다 — 사람이 지킨다 |
| SP7 질문이 깊어지는 순서 | 못 잡는다 — 사람이 지킨다 |
| SP8 모르는 것은 모른다고 | 못 잡는다 — 사람이 지킨다 |
