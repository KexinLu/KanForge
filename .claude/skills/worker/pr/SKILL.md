---
name: wk-pr
description: Create a Pull Request linked to a GitHub Issue with proper formatting. Pulls WNext summary for PR description.
version: 1.0.0
allowed-tools: Bash, Read, mcp__wnext__register_actor, mcp__wnext__list_projects, mcp__wnext__list_tasks, mcp__wnext__list_notes, mcp__wnext__read_note
---

# PR Create

Create a Pull Request linked to an Issue after implementation is complete.

## When to Use

- Implementation is complete and tested
- Ready to merge changes to main
- User requests to create a PR

## Prerequisites

- In a worktree with committed changes
- Branch pushed to remote
- Tests passing

## Execution Steps

### 1. Verify Ready State

```bash
git status  # Should be clean
```

### 2. Push if Needed

```bash
git push -u origin $(git branch --show-current)
```

### 3. Get Context

Read `.worktree.json` for issue number and WNext IDs.

If `wnextTaskId` exists, read WNext notes for summary:
```
mcp__wnext__list_notes:
  projectId: <projectId>
  taskId: <wnextTaskId>
```

Read the `"Summary: ..."` note if it exists (created by `/wk-pre-pr`).

Also read the GitHub issue:
```bash
gh issue view <issue_number> --repo KexinLu/KanForge --json title,body
```

### 4. Create Pull Request

```bash
gh pr create --repo KexinLu/KanForge \
  --title "<type>: <description>" \
  --body "$(cat <<'EOF'
## Summary
Closes #<issue_number>

- [Key change 1]
- [Key change 2]

## Changes
- `file1.tsx`: [what changed]
- `file2.py`: [what changed]

## Test Plan
- [ ] [How to verify change 1]
- [ ] [How to verify change 2]
- [ ] Frontend tests pass (`pnpm test`)
- [ ] Python lint clean (`ruff check packages/modal/`)
EOF
)"
```

### 5. Report Success

Provide the PR URL to the user.

## Title Conventions

Format: `{type}: {description}`

Types:
- `feat:` -- New feature
- `fix:` -- Bug fix
- `docs:` -- Documentation
- `refactor:` -- Code refactoring
- `test:` -- Adding tests
- `chore:` -- Maintenance

## Success Message

```
Pull Request created!

PR: #<pr_number> - <title>
URL: <url>
Closes: #<issue_number>

Next Steps:
1. Review the PR at <url>
2. Address any CI failures
3. Merge when approved
4. After merge, mainframe runs /mf-post-pr
```

## Error Recovery

| Error | Recovery |
|-------|----------|
| Uncommitted changes | Commit first |
| Branch not pushed | `git push -u origin <branch>` |
| PR already exists | Provide existing PR URL |
| Merge conflicts | Rebase: `git rebase main` |
| WNext unreachable | Use Issue-only context for PR body |
