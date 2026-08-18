# scripts/fixtures/talk/

`build-talk.ts` · `verify-talk.ts` 가 쓰는 **대담 파이프라인 픽스처**다.

## 왜 `raws/talks/` 가 아니라 여기인가

`raws/talks/<slug>/` 에 두면 그 픽스처가 곧 **발행 글**이 된다. 검증용 가짜 대담이
사이트에 실리는 것을 막으려면 픽스처가 콘텐츠 디렉터리 밖에 살아야 하고,
그래서 `build-talk.ts` 가 `--talks-dir` · `--out-dir` 를 받는다.

## 한 픽스처의 구성

```text
minimal/
├─ source/conversation.mdx   L1 원문 — 손으로 만든 최소 대화. 진짜 대화가 아니다
├─ source.json               L1 메타. sha256 이 위 파일과 맞아야 한다
├─ talk.md                   L2 정형본
└─ expected.mdx              build-talk 가 내놓아야 할 결과. 바이트 단위로 비교한다
```

`expected.mdx` 를 손으로 고치지 않는다. 빌더의 출력이 **의도적으로** 달라졌으면
그때만 다시 굽는다:

```bash
bun scripts/build-talk.ts --all \
    --talks-dir scripts/fixtures/talk --out-dir scripts/fixtures/talk/minimal
mv scripts/fixtures/talk/minimal/talk-minimal.mdx scripts/fixtures/talk/minimal/expected.mdx
```

## `minimal` 이 덮는 것

- 질문 2개(번호 자동 부여) · 정수 인용구 1개 · `## 마치며`
- 정수 인용구가 답변 안에 쓰이고 발행물에서는 `</QA>` 뒤로 나가는 것
- `template: talk` 이 L2 에 없고 발행물에만 박히는 것
- L1 해시 검증과 `integrity.usable`

원본은 `antigravity-graph-mdx` 어댑터가 읽는 모양을 최소로 재현했고, 노이즈 노드
(`SYSTEM/EPHEMERAL_MESSAGE` · 빈 `PLANNER_RESPONSE` · `LIST_DIRECTORY`)도 실제 형태
그대로 섞어 두었다 — 정규화 규칙을 검증하려면 버릴 것이 실제로 들어 있어야 한다.

## 실제로 렌더되는지 한 번 확인한 기록

`expected.mdx` 를 `src/content/posts/talk-minimal.mdx` 로 옮기고 `draft: false` 로
바꿔 `bun run build` 를 돌린 결과(2026-08-16): `/posts/talk-minimal/` 이
생성되고 `Q.01` · `Q.02` 자동 번호, `<section class="qa">` 2개, `pull-quote` 1개,
화자 듀오(빵토 교수님), `마치며` 가 전부 들어갔다. 확인 후 그 파일은 지웠다 —
가짜 대담을 사이트에 남기지 않기 위해서다.

상시 그물은 `bun run talk:verify` 다.
