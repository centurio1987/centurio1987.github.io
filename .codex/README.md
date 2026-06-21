# Codex Configuration

This directory contains Codex-facing equivalents of the repository's existing Claude configuration.

## Mapping

- `CLAUDE.md` → `AGENTS.md`
- `.claude/skills/*/SKILL.md` → `.codex/skills/*/SKILL.md`
- `.claude/skills/*/assets/*` → `.codex/skills/*/assets/*`
- `.claude/agents/*.md` → `.codex/agents/*.toml`
- `.claude/settings.local.json` → `.codex/config.local.example.toml` 안내

## Permission Notes

`.claude/settings.local.json` contains one Claude-specific allow rule:

```json
{
  "permissions": {
    "allow": [
      "Bash(grep -v \"\\\\.md$\" -o)"
    ]
  }
}
```

Codex uses the active sandbox and approval profile instead of a project-local Claude-style `permissions.allow` list, so this rule is intentionally not translated into an executable Codex config file.

## Local Skills

The project-local skills in `.codex/skills/` preserve the blog writing workflow:

- `init-post`
- `post-draft`
- `review-post`
- `post-finalize`
- `publish-post`
- `quality-gate`
- `tech-deepdive`

## Custom Agent

`.codex/agents/tech-article-publisher.toml`은 다음 파이프라인을 오케스트레이션한다:

```text
tech-deepdive -> review-post -> quality-gate -> post-finalize -> publish-post
```

외부 검토, 품질 `PASS`, 발행 직전 사용자 승인을 필수 게이트로 유지한다.

## Commands, MCP, Hooks

- `.claude/commands/`와 프로젝트 MCP 정의가 없어 변환된 항목이 없다.
- Claude hook 정의가 없어 이식한 hook이 없다. 향후 hook은 실행 시점과 권한 모델을 검토해 Codex용으로 별도 재구현한다.

## Validation

Codex에서 프로젝트를 다시 열어 `quality-gate`, `tech-deepdive`,
`tech-article-publisher` 인식을 확인하고 `bun run build`를 실행한다.
