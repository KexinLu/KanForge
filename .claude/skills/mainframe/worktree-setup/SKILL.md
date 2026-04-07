---
name: mf-worktree-setup
description: Set up a new git worktree for a GitHub issue
version: 1.0.0
allowed-tools: Bash, Read, Glob
---

# Worktree Setup

Set up a new git worktree for a GitHub issue.

## Purpose

Create an isolated development environment with:
- Git worktree linked to a GitHub issue
- `.worktree.json` configuration file
- Branch pushed to remote

## When to Use

- User wants to start work on a new GitHub issue
- User asks to create a new worktree

## Execution Steps

### 1. Get Issue Information

If issue number not provided, ask the user.

```bash
gh issue view <number> --repo KexinLu/KanForge --json title -q .title
```

### 2. Determine Branch Name

Format: `{issue_number}-{slug}`
- Example: `42-upload-flow`
- Branch name and worktree directory name MUST match
- No prefixes (no `feat/`, `fix/`, etc.)

### 3. Create Worktree

```bash
# Ensure on main with latest
git pull origin main

# Create worktree
git worktree add ../worktrees/{issue_number}-{slug} -b {issue_number}-{slug} main

# Push branch to remote immediately
git -C ../worktrees/{issue_number}-{slug} push -u origin {issue_number}-{slug}
```

### 4. Write .worktree.json

Create `.worktree.json` in the worktree root:

```json
{
  "issue_number": 42,
  "branch": "42-upload-flow"
}
```

If WNext IDs are available, include them:

```json
{
  "issue_number": 42,
  "branch": "42-upload-flow",
  "wnextTaskId": "<wnext-task-id>",
  "projectId": "<project-id>",
  "actorId": "<actor-id>"
}
```

## Success Criteria

- Git worktree created at `../worktrees/{issue_number}-{slug}/`
- Branch pushed to remote with tracking
- `.worktree.json` exists with correct configuration

## Success Message

```
Worktree setup complete for issue #42!

Location: ../worktrees/42-upload-flow/
Branch: 42-upload-flow (pushed to remote)

Next steps:
  cd ../worktrees/42-upload-flow
  # Start developing!
```

## Error Recovery

| Error | Solution |
|-------|----------|
| Worktree already exists | Ask user to reuse or recreate |
| Branch already exists | Use existing branch: `git worktree add <path> <branch>` |
| Not on main | `git checkout main` first |
