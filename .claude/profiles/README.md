# 세션 프로파일 — centurio1987.github.io

이 레포에서 작업할 때 역할(집필 / 툴 저작 / 코드)마다 스킬·플러그인·지시를 갈아끼우는 세트.
스킬 description 이 매 세션 컨텍스트에 상주하는 탓에 예산이 넘치는 문제를 세션 진입 시점에 잘라 해결한다.

> **용어 주의**: "프로파일" 은 Claude Code 공식 개념이 **아니다.** 이 레포의 로컬 규약이다.
> 실재하는 스펙은 `--settings <파일>` 플래그와 settings.json 의 네 스코프(managed / project /
> local / user) 뿐이다. `profiles/` 디렉터리를 Claude Code 가 스캔하지 않는다 — `--settings` 로
> 경로를 직접 넘겨야 동작한다.

## 단위

**프로파일 하나 = 설정 JSON + 그것이 `agent` 로 가리키는 에이전트 정의.** 둘은 한 벌이라 항상 같이 움직인다.

| 프로파일 | 에이전트 | 담당 |
|---|---|---|
| `write.json` | `../agents/writer.md` | 집필 — spec `polssin-daedam` · `tech-deepdive` |
| `tooling.json` | `../agents/toolsmith.md` | 이 레포 `.claude/` 자산 저작 |
| `code.json` | `../agents/coder.md` | 사이트 코드 구현·리뷰·커밋 |

## 왜 프로젝트 스코프인가

전부 이 레포 안에 있다. 유저 스코프(`~/.claude/agents/`)에 두면 **무관한 레포에서도 이 역할들이
에이전트 목록에 뜬다** — 줄이려던 오염을 새로 만드는 셈이다.

집필 역할도 마찬가지다. `code_test` · `resume` 가 같은 `authoring-kit` 파이프라인을 쓰지만
**퍼소나를 각자 확장해 쓰기 때문에 공유 대상이 아니다.** 이 레포의 기준은 `.claude/authoring.lock.json`
에 박힌 해시다. 다른 레포에 같은 이름 voice 가 있어도 같은 물건이 아니다.

## 띄우기

**레포 루트에서** 실행한다 — 경로가 상대경로다.

```bash
cd ~/centurio1987.github.io
cc-write     # 집필
cc-tool      # .claude 자산 저작
cc-code      # 사이트 코드
```

alias 는 `~/.zshrc` 에 있다. 실체는 이것뿐이다:

```bash
claude --settings .claude/profiles/write.json
```

상대경로라 **같은 규약(`.claude/profiles/{write,tooling,code}.json`)을 따르는 레포면 alias 를 그대로
재사용**할 수 있다. `code_test` · `resume` 에도 같은 배치를 깔면 된다.

### 확인

```
/status     # Setting sources 줄에 프로파일이 잡혔는지
/context    # Skills 항목 토큰 수
```

### 이어서 하기 — 함정 둘

`--settings` 는 CLI 플래그라 **resume 할 때도 다시 붙여야 한다.** 맨손으로 `claude -c` 하면
프로파일 없이 뜬다. `cc-write-c` 같은 `--continue` alias 를 따로 둔 이유다.

그리고 `-c` 는 **프로파일을 구분하지 않는다.** "현재 디렉터리의 가장 최근 대화" 를 이을 뿐이라
같은 레포에서 역할을 번갈아 썼으면 엉뚱한 쪽을 집는다. 헷갈릴 상황이면 `--resume` 으로 골라 잇는다.

### 세션 중 역할 전환은 안 된다

`agent` 는 launch 시점 설정이고 `/agent` 전환 명령이 없다. 바꾸려면 나갔다 다시 띄운다.
세션 중에 되는 건 `/skills`(개별 토글), `/reload-skills`(스킬 파일 재로드), `/config` 정도다.

## 이 레포가 지는 스킬 부하

세션에 올라오는 스킬은 네 갈래다. 프로파일은 넷을 각각 다르게 제어한다.

| 갈래 | 개수 | 제어 수단 |
|---|---|---|
| 이 레포 `.claude/skills/` | 18 | `skillOverrides` |
| 유저 `~/.claude/skills/` | 28 | `skillOverrides` |
| **플러그인** | 8종 | **`enabledPlugins` — `skillOverrides` 안 먹는다** |
| 번들 | ~14 | `skillOverrides` 개별 항목 |

`skillOverrides` 4단계:

| 값 | Claude 에게 노출 | `/` 메뉴 | 비용 |
|---|---|---|---|
| `on` | 이름 + description | 있음 | 전액 |
| `name-only` | 이름만 | 있음 | 소액 |
| `user-invocable-only` | **안 보임** | **있음** | **0** |
| `off` | 안 보임 | 없음 | 0 |

`user-invocable-only` 가 핵심이다. 가끔 손으로 쓰지만 Claude 가 알아서 부를 필요는 없는 스킬을
여기 둔다. 예산 0인데 `/이름` 은 그대로 된다.

`skillOverrides` 에 없는 스킬은 `on` 으로 취급된다. 그래서 세 프로파일 모두 스킬을 **전부 명시**한다.
**새 스킬을 만들면 세 파일에 항목을 추가할 것** — 빠뜨리면 모든 역할에 조용히 샌다.

## 집필 스킬은 authoring-kit 과 겹치지 않는다 — 끄지 말 것

`init-post` · `post-draft` · `post-finalize` · `publish-post` · `quality-gate` · `research` ·
`review-post` · `review-writing` · `tech-deepdive` 는 **전부 현역이다.**

커밋 `73320b0`("집필 계열 6종을 **플러그인 진입점으로**")과 `b2d47da`("집필 엔진을 authoring-kit
플러그인으로 교체")가 한 일은 대체가 아니라 **책임 분리**였다:

| | 소유 |
|---|---|
| `authoring-kit` 플러그인 | 채점 루브릭 · 퍼소나 · 공통 원칙 · 집필 명세 |
| 이 레포 스킬 | Astro/MDX 매체 특성 · 파이프라인 순서 · 어느 명세로 넘길지 고르는 일 |

근거:

- `b2d47da` 는 `post-finalize` · `quality-gate` · `review-post` · `review-writing` 을 **지운 게
  아니라 authoring-kit 과 맞물리게 고쳤다**. 지워진 건 `humanize-post` 하나뿐이다
- `tech-deepdive` 는 최신 커밋 `70494c9` 에서 갱신됐다
- 각 스킬이 서로를 교차 참조한다 ("문장 단위는 `review-post`, 발행 판정은 `quality-gate`").
  가리면 Claude 가 이 라우팅을 못 한다
- `init-post` · `publish-post` 는 Astro 콘텐츠 컬렉션 스키마를 다루는 매체 전용이라
  authoring-kit 에 대응물이 없다

그래서 `write.json` 에서 전부 `on` 이다. **끄면 집필 파이프라인이 끊긴다.**

`init-post` 는 자기 frontmatter 에 `disable-model-invocation: true` 가 있어 이미 사용자 호출
전용이다. 저자 의도를 덮지 않으려고 `skillOverrides` 에서 **일부러 뺐다** — 없으면 원래 frontmatter 가
적용된다.

`tooling.json` · `code.json` 에서는 이 9개가 내려가 있다. 스킬을 고치는 세션에서 그 스킬이 자동
발동하면 방해되고, 코드 세션에는 애초에 무관하기 때문이다.

## 검증 안 된 것

- 번들 스킬 슬러그(`review`, `simplify`, `dataviz`, `claude-api` 등)가 `skillOverrides` 키와 정확히
  일치하는지 미확인. 틀린 키는 무해하게 무시되니, `/context` 에서 안 줄어든 항목이 있으면
  `/skills` 메뉴에서 실제 이름을 확인해 고칠 것.
- `--settings` 로 넘긴 `skillOverrides` 가 **프로젝트 스킬**까지 제어하는지 미확인. 공식 문서는
  프로젝트 스킬을 `.claude/settings.local.json` 에 적는 예시만 든다. `/context` 로 실측할 것.
  안 먹으면 프로젝트 스킬 블록만 `settings.local.json` 으로 옮긴다.
