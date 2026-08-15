# raws/talks/

폭신 대담(`template: "talk"`) 에피소드의 **원본과 정본**이 사는 곳이다.
`raws/` 최상위가 자유 형식 글감이라면, 여기는 **형식이 정해져 있다.**

## 왜 여기인가

`raws/` 는 사용자가 직접 넣는 입력의 자리다(`raws/README.md`). 대화 원본도 사용자가
넣는 입력이므로 같은 지붕 아래 둔다. 별도 루트 디렉터리를 새로 파면 유저 입력의 입구가
둘이 되고, 어느 쪽에 넣어야 하는지가 매번 헷갈린다.

## 세 층

```text
  L1 원문        raws/talks/<slug>/source/ + source.json
      │          받은 그대로. 아무도 안 고친다
      │  ← talk-ingest 스킬: 노이즈 제거 · 톤앤매너·비문·맞춤법 교정
      ▼
  L2 정형본      raws/talks/<slug>/talk.md
      │          사람이 계속 손보는 정본
      │  ← scripts/build-talk.ts: 계약 검사 + 치환
      ▼
  L3 발행물      src/content/posts/talk-<slug>.mdx
                 파생물. 손으로 고치지 않는다 — 고칠 것이 있으면 L2 를 고쳐 다시 굽는다
```

L3 를 파생물로 못박은 것이 이 구조의 핵심이다. 발행물에 오타 하나만 손으로 고쳐도
그 순간 원문과 발행물의 연결이 끊어지고, "원문이 있으니 언제든 다시 만든다"가 거짓이 된다.

## 디렉터리 규격

```text
raws/talks/
├─ README.md                       ← 이 문서
├─ _rules/
│   └─ NORMALIZE_RULES.md          ← 원본에서 무엇을 버리고 남기는가
└─ <slug>/
    ├─ source/                     ← L1. 받은 파일을 이름·확장자 그대로 넣는다
    │   └─ <원본 파일>              여러 개여도 된다
    ├─ source.json                 ← L1 의 출처·해시·무결성
    └─ talk.md                     ← L2. 정형본 (문법은 S3 에서 확정)
```

`<slug>` 는 발행 URL 이 아니라 **대담의 이름**이다. 발행물은 `talk-<slug>.mdx` 가 되므로
여기에 `talk-` 접두사를 또 붙이지 않는다.

### `source/` 규칙 셋

1. **이름과 확장자를 바꾸지 않는다.** 어떤 도구가 내보낸 것인지가 확장자에 남아 있다.
2. **내용을 고치지 않는다.** 오타도, 경로도, 잘린 자리도 그대로 둔다.
3. **여러 파일을 넣어도 된다.** 대화가 몇 번에 나뉘어 저장됐으면 전부 넣고
   `source.json` 의 `files` 에 순서대로 적는다.

### `source.json` 스키마

```json
{
  "schemaVersion": 1,
  "slug": "ddd-entry-contradiction",
  "adapter": "antigravity-graph-mdx",
  "origin": {
    "tool": "어느 도구의 내보내기인가",
    "model": "어느 모델과 나눈 대화인가",
    "conversedAt": "대화한 시각 — 원본에서 건진다",
    "capturedAt": "여기 앉힌 날",
    "note": "필요하면 한 줄"
  },
  "files": [
    { "path": "source/<파일>", "bytes": 100125, "sha256": "22ecdd…" }
  ],
  "integrity": {
    "usable": false,
    "truncatedNodes": 5,
    "truncatedBytes": 7527,
    "keptUtterances": 11,
    "reason": "왜 못 쓰는가 — usable 이 false 일 때만 채운다"
  }
}
```

| 필드 | 무엇 | 누가 채우나 |
| --- | --- | --- |
| `adapter` | 어느 어댑터로 읽는가. `_rules/NORMALIZE_RULES.md` §1 의 id | 자동 |
| `origin.model` · `conversedAt` | **원본을 버리기 전에 건진 값**이다. 원본 안 말고는 적을 자리가 없다 | 자동 |
| `origin.capturedAt` | 여기 앉힌 날. 대화한 날과 다르다 | 자동 |
| `files[].sha256` | 원문이 안 움직였는지 판정하는 근거. `talk:verify` 가 이걸 재계산한다 | 자동 |
| `integrity.usable` | `false` 면 **L2 를 만들지 않는다.** L1 봉인까지만 한다 | 자동 |

`usable: false` 를 따로 둔 이유는, **못 쓰는 원본도 버리지 않고 보관하기 위해서**다.
지우면 나중에 "이건 왜 안 됐지"를 확인할 방법이 없다.

## 지금 들어 있는 것

| slug | 상태 | 왜 |
| --- | --- | --- |
| `ddd-entry-contradiction` | `usable: false` | 답변 5개가 중간부터 잘려 있다(유실 7,527 B = 26.8%). 원본을 다시 받아야 한다 — `_rules/NORMALIZE_RULES.md` §5 |

이 파일은 원래 `raws/ddd-transaction-account-discussion.mdx` 에 있던 것을
KAN-066-KK9Q50 에서 이 레이아웃으로 옮긴 것이다.

## 주의 — 이 저장소는 공개다

`raws/` 는 커밋된다. 대화 원본에는 시스템 프롬프트·절대 경로·세션 id 가 통째로 들어 있는
경우가 많다. `_rules/NORMALIZE_RULES.md` §7 의 필터가 **남길 발화**에서 그런 것을 발견하면
파이프라인을 실패시킨다. 다만 `source/` 안의 원문은 **일부러 손대지 않으므로**,
민감한 대화라면 애초에 여기 넣지 않는 편이 낫다.
