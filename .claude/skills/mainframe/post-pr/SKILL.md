---
name: mf-post-pr
description: Post-merge cleanup -- remove worktree, delete branch, close WNext task
version: 1.0.0
allowed-tools: Read, Bash, Glob, mcp__wnext__register_actor, mcp__wnext__resign_actor, mcp__wnext__list_projects, mcp__wnext__list_tasks, mcp__wnext__delete_task, mcp__wnext__list_queue_items, mcp__wnext__complete_queue_item, mcp__wnext__list_notes, mcp__wnext__read_note
---

# Post-PR (`mf-post-pr`)

Post-merge cleanup: remove worktree, delete branch, close WNext.

## Purpose

After a PR is merged, the mainframe cleans up everything:
- Remove the git worktree
- Delete the feature branch (local + remote)
- Close the WNext task and resign actor
- Verify clean state

## When to Use

- After a PR is merged
- After an issue is closed
- When reviewing merged PRs during a mainframe session

## Execution Steps

### 1. Read Worktree Config

```
Read ../worktrees/<issue_number>-*/.worktree.json
-> Extract: issue_number, branch, wnextTaskId, projectId
```

### 2. Verify PR is Merged

```bash
gh pr list --repo KexinLu/KanForge --head "<branch>" --state merged --json number,mergedAt
```

If not merged, stop -- do not clean up an active worktree.

### 3. Remove Worktree

```bash
git worktree remove ../worktrees/<worktree_dir> --force
```

### 4. Delete Feature Branch

```bash
git branch -D <branch>
git push origin --delete <branch>
```

### 5. Close WNext Task

```
mcp__wnext__register_actor:
  name: "claude-kanforge-mainframe"
  type: "ai"
  externalRef: "claude-kanforge-mainframe"
-> actorId

mcp__wnext__list_queue_items:
  taskId: <wnextTaskId>
-> Complete or delete each remaining item

mcp__wnext__delete_task:
  id: <wnextTaskId>
  actorId: <actorId>
```

### 6. Verify Clean State

```bash
git worktree list
git branch --list "<branch>"
git ls-remote --heads origin "<branch>"
```

## Success Message

```
Issue #<number> fully closed!

Worktree: removed (../worktrees/<dir>/)
Branch: <branch> deleted (local + remote)
WNext: task deleted

Clean state verified.
```

## Error Recovery

| Situation | Action |
|-----------|--------|
| PR not merged | STOP -- do not clean up |
| Worktree has uncommitted changes | Warn user, do not force-remove |
| Branch already deleted | Skip, continue |
| WNext task not found | Skip, continue |
| Worktree dir doesn't exist | Skip, verify with `git worktree list` |
