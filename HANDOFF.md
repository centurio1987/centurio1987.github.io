# HANDOFF — 블로그 저장소 인수인계

다른 머신에서 새 세션을 열었을 때 이 파일 하나로 이어 갈 수 있게 적은 문서입니다.
지금 붙잡고 있는 일은 둘입니다. 칸반 진행 중 칸의 초안 다섯 편이 플롯 고르기 단계에서 멈춰 있고,
11월 6일에 글 지도(graphify 지식그래프) 자동 갱신이 실패해 그래프가 낡은 채로 남아 있습니다.

- 기준 시각: 2026-11-25 KST
- 브랜치: `main` (원격 `origin/main` 과 맞춘 뒤 이 파일을 올렸습니다)
- 이 머신의 작업 트리: `/Users/centurio/centurio1987.github.io`
- 이 파일을 올리기 직전 커밋: `57ae0c4` (빈 초안 파일 정리)

## 1. 진행 중 카드 다섯 장 — 플롯 후보 단계에서 멈춤

### 목표

`KANBAN.md` 의 「진행 중」 칸에 있는 다섯 장을 글로 써서 발행하면 끝납니다.
다섯 장 모두 2026-07-26 에 ai 가 만들고 옮긴 카드이고, 카드 문서(`KANBAN/cards/`)는 없습니다.
원천 글감은 다섯 편 모두 `raws/IDEAS.md` 입니다.

| 카드 | 제목(보드 원문) | 초안 |
| --- | --- | --- |
| `KAN-001` | GraphQL을 썼을 때 유리한 상황과 아닌 상황 | `draft/graphql-use-cases-draft.md` |
| `KAN-002` | 도메인 모델과 RDB | `draft/domain-model-rdb-draft.md` |
| `KAN-003` | DDD에서 Composition과 Aggregation | `draft/ddd-composition-aggregation-draft.md` |
| `KAN-004` | 상속이냐 Composite냐 | `draft/inheritance-vs-composition-draft.md` |
| `KAN-005` | 모델링 철학 고려 사항 | `draft/modeling-philosophy-draft.md` |

### 지금 상태

다섯 초안은 모두 `post-draft` 스킬이 만든 스캐폴드(뼈대)입니다. 글 머리의 한 줄 주장과
`## 플롯 후보`(Plot A 부터) 만 있고 본문은 없습니다. 2026-06-10 에 만들어진 뒤 내용이 바뀌지 않았습니다.
`draft/` 는 발행 위치가 아니라서 이 상태로 두어도 사이트에는 나가지 않습니다.

`KAN-005` 의 보드 메모에는 「모델 구분 기준 보강 필요」가 적혀 있습니다.

### 다음 할 일

1. 초안 하나를 열어 플롯 후보를 읽습니다.
   ```bash
   sed -n '1,80p' draft/graphql-use-cases-draft.md
   ```
2. 주인이 플롯을 고르고 누가 본문을 쓸지 정합니다(아래 「주인에게 물어야 할 것」).
3. 본문이 서면 `CLAUDE.md` 의 집필 흐름을 따릅니다.
   `review-post` → `post-finalize` → `publish-post` → `ship-post`.
   AI 가 쓰는 심층 기술 글이면 `tech-deepdive` → `review-post` → `review-writing` → `quality-gate`
   → `post-finalize` → `publish-post` → `ship-post` 입니다. 게이트는 건너뛰지 않습니다.

### 이미 정한 것

- 플롯을 고르고 본문을 쓰는 일은 사람 몫이라고 `CLAUDE.md` 의 집필 흐름에 적혀 있습니다
  (`user picks a plot, writes the body`).
- 저자 `tony`(빵관 토니)의 목소리는 `usage: "preserve"` 라서 AI 가 그 목소리로 새로 쓰지 않습니다.
  AI 가 완전히 쓰는 글은 frontmatter 에 `author: ppangto` 를 둡니다.

### 주인에게 물어야 할 것

- 다섯 편을 직접 쓰는지, 아니면 `tech-deepdive` 경로로 AI 저자(`ppangto`)에게 맡기는지.
- 다섯 편 각각 어느 플롯으로 갈지.
- 넉 달 넘게 멈춘 카드라서, 계속 진행 중 칸에 둘지 백로그로 돌릴지. 칸 이동은 `manage-kanban` 스킬로 합니다.

## 2. 글 지도 자동 갱신 실패 (2026-11-06 14:41)

### 목표

`src/data/graph.json` 이 지금 글 34편을 모두 반영하고 `bun run graph:verify` 가 0 으로 끝나면 됩니다.
보드 「할 일」 칸의 `KAN-065`(「문체 스윕 후 graph:refresh 1회 (graph.json 라벨 낡음)」)도 같은 실행으로 끝납니다.

### 지금 상태

`71135ef` 커밋 직후 `post-commit` 갈고리(git 커밋 때 자동으로 도는 스크립트)가 자동 갱신을 돌렸고 실패했습니다.

- 로그 `graphify-out/logs/autorefresh-20261106T142436.log` 기준: 의미 추출 37조각 중 32조각이
  `claude -p exited 1` 로 실패했습니다. 오류 메시지는 비어 있어서 **원인은 확인 안 됨**입니다.
- 결과로 `graphify-out/graph.json` 이 274노드짜리 부분 그래프가 됐고, 시맨틱 캐시(`graphify-out/cache/semantic/`)
  54건이 지워지고 7건이 새로 생겼습니다. `src/data/graph.json` 은 검증에서 걸러져 바뀌지 않았습니다.
- `graph-pipeline` 스킬의 규칙상 「`n/m semantic chunk(s) failed` 가 뜨면 그 자체로 폐기」 대상입니다.
  그래서 이 실패 산출물은 **커밋하지 않았습니다.** 원격의 `graphify-out/` 은 실패 전 상태(2026-07-29 갱신분)입니다.

### 다음 할 일

다른 머신에서 이어 갈 때는 실패 산출물이 없으니 4번부터 하면 됩니다.

1. (이 머신에서만) 바뀐 파일부터 확인합니다.
   ```bash
   git diff --name-only graphify-out/ src/data/graph.json
   ```
2. (이 머신에서만) 실패 산출물만 있는 것을 확인한 뒤 되돌립니다.
   ```bash
   git checkout -- graphify-out/ src/data/graph.json
   git clean -n graphify-out/cache/semantic/   # 새로 생긴 캐시 7건 목록부터 봅니다
   ```
3. (이 머신에서만) 실패 표식을 지워 재시도를 엽니다. `rm graphify-out/.autorefresh/failed-posts-tree`
4. `main` 워크트리에서 수동으로 다시 돌립니다. 40~60분 걸리고 조각마다 `claude -p` 를 띄웁니다.
   ```bash
   bun run graph:refresh
   bun run graph:verify
   ```
5. 검증이 0 으로 끝나면 `graphify-out/` 과 `src/data/graph.json` 만 커밋합니다.
   비0 이면 그 결과는 버립니다.

### 이미 정한 것 (`CLAUDE.md`, `graph-pipeline` 스킬)

- 재생성은 `main` 워크트리에서만 합니다. CI 는 graphify 를 돌리지 않습니다.
- `--out .` 을 항상 붙입니다(`refresh-graph.sh` 가 붙여 줍니다).
- `graphify-out/cache/semantic/` 은 gitignore 하지 않고, `graphify-out/manifest.json` 은 커밋하지 않습니다.

### 주인에게 물어야 할 것

- `claude -p` 가 왜 32조각에서 멈췄는지는 확인 안 됨입니다. 다시 돌리기 전에 원인을 볼지,
  그냥 다시 돌려 볼지 정해야 합니다.

## 3. 그 밖에 알아 둘 것

- 브랜치 `centurio1987/kan-008` 의 마지막 커밋 `d47ea55`(같은 브랜치의 KAN-024 카드 추가를
  되돌린 커밋)는 2026-11-26 원격 `origin/centurio1987/kan-008` 에 올렸습니다. `KAN-008` 은 이미 완료 칸이고
  그 글 네 편은 `main` 에 들어와 있어서 진행 중 작업으로 보지 않았습니다. 이 브랜치를 남길지 지울지는 주인 판단입니다.
- 「할 일」 칸에는 시작 전 카드 넷이 있습니다: `KAN-048`(좋아요 기능), `KAN-065`(위 2절),
  `KAN-082-ER9NJ4`(실시간 동기화 서버 상태 대담 — 리서치와 준비 노트
  `raws/talks/_prep/realtime-sync-server-state.md` 는 끝났고, 남은 것은 대화 → export → `talk-ingest`),
  `KAN-083-1EEG2W`(hero 그림 27장 다시 굽기).

## 다른 머신에서 이어 가는 법

```bash
git fetch && git switch main && git pull --ff-only
bun install
bun run graph:hooks      # 클론마다 한 번. 자동 갱신 갈고리를 연결합니다
```

- 설치: `bun`, 글 지도를 다시 만들 때는 `graphify` CLI 와 `claude` CLI.
- 비공개 패키지 `@centurio1987/bbangto-ui-visualization` 이 GitHub Packages 에 있어서,
  전역 `~/.npmrc` 에 `read:packages` 권한 토큰이 있어야 `bun install` 이 됩니다(값은 여기 적지 않습니다).
  CI 는 `PACKAGES_READ_TOKEN` 시크릿을 씁니다.
- 본문 서체를 다시 구우려면 `bun run build` 뒤에 `bun run fonts:build` 를 돌립니다.
  작업 자리 `.fonts-build/` 는 커밋하지 않으므로 새 머신에서는 처음부터 받습니다.

### 이 머신에만 있고 원격에 없는 것

- 커밋하지 않은 실패 산출물: `graphify-out/graph.json`, `graphify-out/.graphify_analysis.json`,
  `graphify-out/.graphify_semantic_marker`, `graphify-out/cache/semantic/` 의 삭제 54건·추가 7건(2절).
- gitignore 된 자동 갱신 상태: `graphify-out/.autorefresh/`(예약 표식 `pending` 2026-10-23 · 실패 표식),
  `graphify-out/logs/`, 실패 직전 백업 `graphify-out/2026-11-06/`.
- 세션 기록: `~/.claude/projects/-Users-centurio-centurio1987-github-io/`.
- 글감 리서치 저장소 `~/blog-research/` 는 별도 저장소입니다.

## 마지막 세션 요약

- 이 머신에 남은 마지막 작업 세션 기록은 2026-11-06 의 커밋 메시지 생성 한 건뿐입니다.
  그 세션이 만든 커밋이 `71135ef`(「feat: 코드블록 칸 서체와 layout:verify 게이트를 더하고 대담 세 편을 들인다」)입니다.
  그 전 작업 세션의 기록은 이 머신에서 찾지 못했습니다(확인 안 됨).
- 이 파일을 쓴 세션(2026-11-25)의 요청은 「변경 내역을 내역별로 커밋하고 푸시하고, 진행 중인 작업은
  다른 머신에서 이어 갈 수 있게 맥락을 기록해 올려라」였습니다. 빈 초안 정리 커밋 하나와 이 파일을 올렸고,
  글 지도 실패 산출물은 위 이유로 커밋하지 않았습니다.
