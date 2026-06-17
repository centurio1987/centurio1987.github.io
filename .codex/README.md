# Codex Configuration

This directory contains Codex-facing equivalents of the repository's existing Claude configuration.

## Mapping

- `CLAUDE.md` → `AGENTS.md`
- `.claude/skills/*/SKILL.md` → `.codex/skills/*/SKILL.md`
- `.claude/skills/*/assets/*` → `.codex/skills/*/assets/*`

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
