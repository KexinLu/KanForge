---
name: mf-quick-work
description: Fast-track small tasks -- WNext-only tracking, worktree, worker prompt, review, merge, cleanup in one flow
version: 1.0.0
allowed-tools: Bash, Read, Grep, Glob, Edit, Write, Agent, mcp__wnext__register_actor, mcp__wnext__list_projects, mcp__wnext__create_task, mcp__wnext__create_note, mcp__wnext__read_note, mcp__wnext__list_notes, mcp__wnext__list_queue_items, mcp__wnext__lease_queue_items, mcp__wnext__complete_queue_item, mcp__wnext__delete_task, mcp__wnext__enqueue_queue_item
---

# Quick Work (`mf-quick-work`)

Fast-track small, well-scoped tasks without GitHub Issues or PRs. WNext for tracking, direct merge when done.

## When to Use

- Small config, devex, docs, or tooling changes (< ~15 files)
- Spinoff fixes discovered during review
- You are the sole reviewer
- No CI gate needed

## When NOT to Use

- Production logic changes that need CI
- Anything a teammate needs to review
- Scope is unclear or might grow

## Arguments

The skill receives a natural-language description of the work. Parse from it:

- **Description** -- what needs to happen
- **Target** -- where to merge (default: `main`). Can be:
  - `main` -- independent small task
  - A worktree branch name -- spinoff fix for an in-flight ticket

## Phase 1: Setup

### 1. Determine Target Branch

If the user mentions a ticket number, worktree, or branch -- that's the target. Otherwise default to `main`.

### 2. Create WNext Task + Brief

```
mcp__wnext__create_task:
  projectId: <projectId>
  actorId: <mainframe-actorId>
  title: "<short title>"
  externalRef: "<slug>"
  metadata:
    type: "quick-work"
    target: "main" | "<branch-name>"
```

Write a brief note with tasks and constraints.

### 3. Create Worktree

**Target = main:**
```bash
git worktree add ../worktrees/<slug> -b <slug> main
git -C ../worktrees/<slug> push -u origin <slug>
```

**Target = existing branch (spinoff):**
```bash
git worktree add ../worktrees/<slug> -b <slug> <target-branch>
git -C ../worktrees/<slug> push -u origin <slug>
```

### 4. Write .worktree.json

```json
{
  "issue_number": null,
  "branch": "<slug>",
  "wnextTaskId": "<task-id>",
  "projectId": "<project-id>",
  "actorId": "<mainframe-actor-id>",
  "target": "main"
}
```

### 5. Output Worker Prompt

Generate a self-contained prompt for the worker session. Print it so the developer can copy it into a worker session.

**Phase 1 ends here.**

---

## Phase 2: Review + Merge

Triggered when the developer says the work is done.

### 1. Review the Diff (MANDATORY)

```bash
git -C ../worktrees/<slug> diff --stat <target>..HEAD
git -C ../worktrees/<slug> diff <target>..HEAD
```

Review for correctness, no debug logging, no scope creep, clean code.

### 2. Merge

**Target = main:**
```bash
git merge <slug> --no-ff -m "<commit message>"
git push origin main
```

**Target = existing branch (spinoff):**
```bash
git -C ../worktrees/<target-worktree> merge <slug> --no-ff -m "<commit message>"
git -C ../worktrees/<target-worktree> push
```

### 3. Cleanup

```bash
git worktree remove ../worktrees/<slug> --force
git branch -D <slug>
git push origin --delete <slug>
```

### 4. Close WNext

```
mcp__wnext__delete_task:
  id: <wnextTaskId>
  actorId: <actorId>
```

## Commit Message Convention

```
<type>: <description>

<body -- what changed and why>

Quick-work via WNext (no GitHub issue).
Target: main | <branch-name>
```

Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`

## Error Recovery

| Situation | Action |
|-----------|--------|
| Target worktree doesn't exist | STOP -- ask user to clarify |
| Merge conflict | STOP -- show conflict, ask user |
| Review finds issues | Send feedback, do NOT merge |
