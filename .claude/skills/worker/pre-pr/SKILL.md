---
name: wk-pre-pr
description: Pre-PR cleanup -- address cleanup items, compile summary, sync GitHub.
version: 1.0.0
allowed-tools: Read, Grep, Glob, Bash, Edit, mcp__wnext__register_actor, mcp__wnext__list_projects, mcp__wnext__list_tasks, mcp__wnext__list_queue_items, mcp__wnext__lease_queue_items, mcp__wnext__enqueue_queue_item, mcp__wnext__complete_queue_item, mcp__wnext__fail_queue_item, mcp__wnext__create_note, mcp__wnext__read_note, mcp__wnext__list_notes
---

# Pre-PR (`wk-pre-pr`)

Pre-PR cleanup: address cleanup items, compile summary, sync GitHub.

## Purpose

Ensure all discovered cleanup items are addressed and compile a complete implementation summary before creating a PR:
- Read WNext notes for the full picture
- Process cleanup queue items (mesh:cleanup)
- Compile everything into a single summary note
- Sync to GitHub Issue with compiled summary

## When to Use

- After implementation is complete, before creating a PR
- When the developer says "wrapup" or "clean up before PR"

## Actor & Project Setup

```
Read .worktree.json -> extract wnextTaskId, projectId, issue_number

mcp__wnext__register_actor:
  name: "claude-kanforge-<issue_number>"
  type: "ai"
  externalRef: "claude-kanforge-<issue_number>"
```

## Pre-PR Process

### Phase 1: Read WNext State

```
mcp__wnext__list_notes:
  projectId: <projectId>
  taskId: <wnextTaskId>
```

Read all notes. Also read the GitHub Issue for AC status.

### Phase 2: Execute Cleanup Tasks

For each item in the mesh:cleanup queue:

| Task Type | Action |
|-----------|--------|
| **Test Gap** | Add missing tests |
| **Type Regen** | Regenerate Supabase types |
| **Lint Fix** | Fix lint errors |

Complete each item after addressing it.

### Phase 3: Verify Tests Pass

```bash
# Frontend
pnpm lint
pnpm test

# Python
ruff check packages/modal/
ruff format --check packages/modal/
pytest packages/modal/tests/
```

### Phase 4: Compile Summary

```
mcp__wnext__create_note:
  projectId: <projectId>
  actorId: <actorId>
  taskId: <wnextTaskId>
  title: "Summary: Implementation for GH#<issue_number>"
  content: |
    ## What Was Done
    [Completed items]

    ## Key Decisions
    [Architecture decisions with rationale]

    ## Cleanup Completed
    [Cleanup items addressed]

    ## Follow-up Items
    [Deferred items with issue links]
```

### Phase 5: Sync to GitHub

Update the GitHub issue body with the implementation summary.

## Success Message

```
Issue #<number> pre-PR complete!

WNext:
- Notes: {N} reviewed
- Cleanup: {X} completed, {Y} deferred

GitHub: Issue updated with implementation summary

Next step: /wk-pr
```

## Error Recovery

| Situation | Action |
|-----------|--------|
| WNext unreachable | Fall back to GitHub-only mode |
| Test failures | Fix before PR |
| Complex tech debt | Create follow-up issue, defer |
