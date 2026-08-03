---
name: research
description: >
  기술 글 집필 **전 단계**의 자료 수집 스킬. 주제/글감을 받아 ① `web-research` 플러그인에 위임해 신뢰 소스를 수집하고, 그 결과를 `assets/RESEARCH_GUIDE.md` 의 산출물 형식으로 정리해 `~/blog-research/raws/NNN-slug.md`
  (불변 원본)로 저장하고, ② `~/blog-research/CLAUDE.md`(LLM Wiki 스키마)의 Ingest 연산대로
  위키에 통합(요약·교차링크·angle 추출·index/log 갱신)하며, ③ git-shipper(haiku)로 blog-research
  레포를 commit&push 한다. 출력은 집필에 바로 넘길 **angle 페이지 경로**다.
  "/research <주제>", "이 주제 자료 조사해줘", "리서치 먼저 돌려줘" 같은 표현에 반응한다.
  코드 전용·개인 경험 글처럼 외부 자료가 불필요하면 오케스트레이터가 이 단계를 skip 할 수 있다.
argument-hint: <주제 또는 글감 (자유 텍스트)>
---

# research 스킬

기술 글을 쓰기 **전에** 웹에서 근거를 모아, 집필 에이전트가 다시 검색하지 않아도 될 만큼 충실히 정리하고,
이를 외부 지식 베이스 `~/blog-research`(Karpathy "LLM Wiki" 패턴)에 누적시킨다. 최종 산출물은 *그대로 글로
넘길 수 있는* **angle 페이지**다.

이 스킬의 책임은 **수집 → 정리 → 위키 통합 → 레포 푸시까지**다. 집필(`tech-deepdive`)·검토·발행은 후속이
맡는다. 발행 오케스트레이터(`tech-article-publisher`)가 이 스킬을 **파이프라인 첫 단계**로 호출한다.

> **문체 스타일 가이드와 무관하다.** 리서치는 *사실 수집*만 한다. 문체는 집필·검토 단계의 책임이다.

## 워크플로우 상의 위치

```
[research]  주제 → ~/blog-research/raws/NNN-slug.md (불변) → wiki ingest → angle 페이지 → commit&push
  → tech-deepdive (angle을 입력으로 집필) → quality-gate → post-finalize → publish-post → ship-post
```

## 입력 / 출력 계약

- **입력**: 조사할 주제 또는 글감(자유 텍스트). 오케스트레이터가 글감 메모 경로를 함께 줄 수 있다.
- **출력**: 성숙(`mature`) 또는 최소 `draft` 상태의 **angle 페이지 경로** `~/blog-research/wiki/angles/<slug>.md`.
  집필 단계는 이 angle(+연결된 topic/entity 페이지, 근거 raws)을 입력으로 받는다.
- **skip 조건**: 외부 자료가 의미 없는 글(순수 코드 튜토리얼, 개인 회고·경험담)은 오케스트레이터가 이 단계를
  건너뛸 수 있다. 그 경우 집필은 글감 메모를 직접 입력으로 쓴다.

## 동작 순서

### 1. 웹 수집 — `web-research` 플러그인에 위임한다

```
Skill(web-research:research) <주제>
```

수집 자체는 이 스킬이 하지 않는다. `web-research` 가 소주제로 쪼개 워커에 병렬 위임하고
(메인 컨텍스트 보호), 출처 추적이 되는 구조화 findings 를 텍스트로 돌려준다.

**같은 수집 규칙을 두 곳에 두지 않는다.** `assets/RESEARCH_GUIDE.md` 의 수집 규칙
— 최신성(고정 날짜 금지) · 신뢰 소스 5개 이상 · 1차 자료 우선 · 주장마다 출처 연결 ·
게시일·조회일 기록 · 수치·버전·고유명사는 원문 그대로 · 출처 없는 정보와 추측 금지 ·
충돌하면 양쪽 기록 · 모르면 open question — 은 `web-research` 가 이미 같은 내용을
갖고 있었다. 두 벌로 두면 갈라진다.

`RESEARCH_GUIDE.md` 에서 이 프로젝트가 계속 소유하는 것은 **산출물 형식**뿐이다 —
raws 문서의 구성(개요 → 소주제별 충실 정리 → open questions → 주장↔소스 매핑 → 소스 목록).
그건 아래 2단계에서 쓴다.

### 2. raws에 불변 저장

수집·정리 결과를 `~/blog-research/raws/NNN-slug.md`에 저장한다.
- **NNN = 기존 최대값 + 1**, 0 채움 3자리. (`raws/` 목록을 읽어 자동 산정. 시퀀스 충돌 주의.)
- 파일 맨 위에 출처 메타데이터 HTML 주석(`source`/`author`/`added`/`note`)을 둔다(`raws/README.md` 규약).
- 본문은 RESEARCH_GUIDE "산출물 형식"(개요 → 소주제별 충실 정리 → open questions → 주장↔소스 매핑 → 소스 목록).
- **raws는 불변이다.** 한 번 쓰면 수정·삭제하지 않는다(이후 위키만 갱신).

### 3. wiki ingest (`~/blog-research/CLAUDE.md` Ingest 연산)

`~/blog-research/CLAUDE.md`를 읽고 그 스키마대로 통합한다(이 스킬이 규약을 재정의하지 않는다):
1. 방금 추가한 raws를 **요약**한다.
2. 관련 위키 페이지(특히 topic/entity) **10~15개를 확인**해 교차 통합하거나 새 페이지를 만든다. 내부 링크는 `[[slug]]`.
3. **블로그 앵글을 `wiki/angles/<slug>.md`에 기록**한다(후크·타깃 독자·핵심 주장·근거 링크·open questions·톤/길이).
   이게 집필로 넘기는 핵심 산출물이다 — 가능하면 `mature`까지, 자료가 얇으면 `draft`로.
4. `index.md`에 새/변경 페이지를 반영하고, `log.md`에 `YYYY-MM-DD | ingest | 요약`을 (최신 위로) 남긴다.
5. 관련 페이지 frontmatter `sources`에 이번 raws 번호를 추가한다.
- 모든 wiki 페이지 frontmatter는 `title/type/status/sources/created/updated/tags`(스키마 §3)를 채운다.

### 4. blog-research 레포 commit & push (git-shipper / haiku)

`git-shipper` 서브에이전트(haiku)에 위임한다. git-shipper는 직접 git 명령을 쓰지 않고 **`scripts/git-commit-push.sh`만**
호출한다(이 블로그 레포의 스크립트를 절대경로로 호출). 인자:
- `--repo ~/blog-research` · `--branch <blog-research 기본 브랜치>` · `--message "research: <slug> 수집·ingest"`
- `--` 뒤에 이번에 추가/수정한 경로만(`raws/NNN-slug.md`, `wiki/...`, `index.md`, `log.md`). **전체 add 금지**.
- 자동 모드면 실제 push까지. 스크립트가 비0으로 끝나면(브랜치 불일치·secret·대용량·pull 충돌 등) 멈추고 원인을 보고한다.

### 5. 종료 보고 (집필 인계)

- 만든 것: raws 경로(번호), 새/갱신 위키 페이지, **angle 페이지 경로 + 상태(mature/draft)**.
- push 결과(성공/실패 원인). open questions(집필 시 주의할 부족 자료).
- 다음 단계: "이 angle로 `tech-deepdive` 집필" 안내.

## 참조 파일

- `assets/RESEARCH_GUIDE.md` — **산출물 형식만** 이 프로젝트가 소유한다(raws 문서 구성).
  수집 규칙은 `web-research` 플러그인이 소유한다 — 같은 규칙을 두 벌로 두지 않는다.
- `~/blog-research/CLAUDE.md` — LLM Wiki 스키마(Ingest/Query/Lint 연산, 페이지 규약). **ingest는 이 문서를 따른다.**
- `scripts/git-commit-push.sh` — 공유 git 가드(git-shipper가 호출).

## 주의

- **raws 불변**: 수정·삭제 금지. NNN 시퀀스는 항상 기존 최대+1로 자동 산정(충돌 주의).
- ingest 규약의 출처는 `~/blog-research/CLAUDE.md`다 — 이 스킬은 그걸 *실행*할 뿐, 규약을 바꾸지 않는다.
- 출처 없는 정보·추측 금지. 충돌은 양쪽 기록. 모르면 open question.
- push는 외부 작업이다 — 가드 스크립트를 항상 거치고, 실패 시 자동 롤백 없이 상태만 보고한다.
- 문체 가이드와 무관(사실 수집 전담). 글의 톤·문장은 집필/검토 단계가 책임진다.
