---
name: wk-report
description: Report worker session findings to mainframe via WNext -- problems found, solutions applied, files changed.
version: 1.0.0
allowed-tools: Read, Grep, Glob, Bash, mcp__wnext__register_actor, mcp__wnext__list_projects, mcp__wnext__list_tasks, mcp__wnext__create_task, mcp__wnext__create_note, mcp__wnext__read_note, mcp__wnext__list_notes, mcp__wnext__enqueue_queue_item, mcp__wnext__complete_queue_item, mcp__wnext__list_pending_queue_items, mcp__wnext__lease_queue_items, mcp__wnext__list_queue_items
---

# Worker Report

Report what a worker session did back to the mainframe via WNext working memory.

## Purpose

Capture the full picture of what happened during a worker session so the mainframe (and future sessions) have durable context. Every worker session discovers things, makes decisions, and changes files. Without a report, that context dies with the session.

## When to Use

- At the end of a worker session, after committing all changes
- After completing significant work on an issue
- When switching context away from an issue (even if not done)

## Prerequisites -- Commit First

**MANDATORY:** Before writing the report, commit and push all changes automatically.

```bash
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  git commit -m "chore(#<issue_number>): work in progress"
fi
git push
```

## What to Record

### Required
1. **Acceptance Criteria Status** -- for each AC: met, not met, or deferred
2. **Problems Found** -- bugs, broken tests, schema drift, dead code
3. **Solutions Applied** -- what was done to fix each problem and why
4. **Files Changed** -- every file modified with change type

### When Applicable
5. **Decisions Made** -- architecture choices, trade-offs
6. **Discovered Issues** -- problems found but NOT fixed (out of scope)
7. **Key Learnings** -- gotchas, conventions confirmed

## Actor & Project Setup

```
Read .worktree.json -> extract wnextTaskId, projectId, issue_number

mcp__wnext__register_actor:
  name: "claude-kanforge-<issue_number>"
  type: "ai"
  externalRef: "claude-kanforge-<issue_number>"
```

## Report Structure

Create a single note titled `"Resolution: GH#<issue_number> -- <short description>"`.

```markdown
# GH#<issue_number> -- Issue Inventory & Resolutions

## Acceptance Criteria Status

| AC | Status | Notes |
|----|--------|-------|
| <AC from issue> | Met / Not Met / Deferred | <evidence or reason> |

---

## Problems Found & Fixed

### 1. <Problem title>
- **File:** `<path>`
- **Problem:** <What was wrong>
- **Fix:** <What was changed and why>

---

## WNext Context

| Type | ID | Title |
|------|----|-------|
| Task | `<uuid>` | GH#<issue_number> - <title> |
| Note | `<uuid>` | Resolution: GH#<issue_number> -- ... *(this note)* |

---

## Files Modified

| File | Type |
|------|------|
| `path/to/file.tsx` | New file (description) |
| `path/to/existing.ts` | Modified (description) |

## Discovered Issues (Not Fixed)

- <Description> -- deferred because <reason>

## Key Learnings

- <Convention or gotcha for future sessions>
```

### Enqueue for Mainframe Review

```
mcp__wnext__enqueue_queue_item:
  taskId: <wnextTaskId>
  queueName: "mesh:review"
  actorId: <actorId>
  actionType: "worker-report-ready"
  payload:
    issueNumber: <issue_number>
    noteId: <resolution_note_id>
    noteTitle: "Resolution: GH#<issue_number> -- <description>"
    summary: "<1-2 sentence summary>"
    filesChanged: <N>
```

## Gathering the Information

### 1. Check changed files
```bash
git diff --name-status origin/main..HEAD
```

### 2. Read the diffs
```bash
git diff origin/main..HEAD -- <file>
```

### 3. Check for existing notes
```
mcp__wnext__list_notes:
  projectId: <projectId>
  taskId: <wnextTaskId>
```

### 4. Check for mainframe feedback
```
mcp__wnext__list_pending_queue_items:
  queueName: "mesh:issue:<issue_number>"
  actorId: <actorId>
```

## Quality Standards

- **Be specific** -- "swapped args in createProject" not "fixed a bug"
- **Include file paths** -- always the full relative path from repo root
- **Note impact** -- what would have happened without the fix

## Success Message

```
Worker report recorded for GH#<issue_number>

WNext Note: "<note_title>"
Queue: mesh:review (item enqueued for mainframe)
- Files changed: <N>
- Discovered issues: <N>
- Key learnings: <N>
```
