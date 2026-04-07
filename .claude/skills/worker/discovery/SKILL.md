---
name: wk-discover
description: Explore codebase to find patterns and conventions before implementation. Write findings to WNext working memory.
version: 1.0.0
allowed-tools: Read, Grep, Glob, mcp__wnext__register_actor, mcp__wnext__list_projects, mcp__wnext__enqueue_queue_item, mcp__wnext__complete_queue_item, mcp__wnext__create_note, mcp__wnext__read_note, mcp__wnext__list_notes, mcp__wnext__list_queue_items, mcp__wnext__list_tasks
---

# Discovery

Tactical codebase exploration before implementing a feature or fix.

## Purpose

Discover implementation details needed to write code -- exact file paths, function signatures, import paths, wiring points. Build on the mainframe's strategic discovery rather than re-doing it.

## Two Modes

### Mode A: Mainframe Brief Exists (typical)

A `"Brief: GH#..."` note exists on the WNext task with confirmed design decisions and key references.

**Worker skips:** Convention review, architecture placement, similar implementation search -- all covered by the brief.
**Worker focuses on:** Tactical details -- exact function signatures, type definitions, import paths, implementation steps.

### Mode B: No Mainframe Brief (standalone)

Worker was started without mainframe preparation. Run the full discovery process.

## Actor & Project Setup

```
Read .worktree.json -> extract wnextTaskId, projectId, actorId

mcp__wnext__register_actor:
  name: "claude-kanforge-<issue_number>"
  type: "ai"
  externalRef: "claude-kanforge-<issue_number>"
```

## Phase 0: Read Existing Context (ALWAYS DO THIS FIRST)

```
mcp__wnext__list_notes:
  projectId: <projectId>
  taskId: <wnextTaskId>
```

Read all notes -- prioritize `"Brief:"` and `"Decision:"` prefixes.

Also check the per-issue feedback queue:
```
mcp__wnext__list_queue_items:
  queueName: "mesh:issue:<issue_number>"
  actorId: <actorId>
```

**If brief exists -> Mode A.** Read it, read all referenced docs, skip to Phase 3.
**If no brief -> Mode B.** Run all phases.

## Phase 1: Strategic Discovery (Mode B only)

Find existing patterns in the codebase:

- **Supabase schema** -- `supabase/migrations/` for table structures, RLS policies
- **Next.js patterns** -- `apps/web/app/` for routing, server actions, component structure
- **Modal endpoints** -- `packages/modal/` for Python function patterns
- **Edge functions** -- `supabase/functions/` for webhook handlers

## Phase 2: Tactical Discovery (Both modes)

### 2a. Reference Implementation Deep-Dive

For each reference found in the brief (or Phase 1):
- Read the full file
- Note exact structure (imports, types, function signatures)
- Identify the pattern to replicate

### 2b. Type and Interface Inventory

Find exact type definitions, import paths, fields.

### 2c. Wiring Points

- Route files needing new entries
- Index files needing new exports
- Supabase types needing regeneration

### 2d. Gap Analysis

Compare what exists vs what's needed.

## Phase 3: Write Implementation Brief

Write a single, comprehensive note that passes the self-sufficiency test: "Can an agent implement this with ONLY the WNext notes + the GitHub issue?"

```
mcp__wnext__create_note:
  projectId: <projectId>
  actorId: <actorId>
  taskId: <wnextTaskId>
  title: "Brief: GH#<number> -- <issue title>"
  content: |
    ## Objective
    [What needs to be built]

    ## Design Decisions
    [Key decisions from mainframe brief or Phase 1]

    ## Files to Create
    - `exact/path/to/NewFile.tsx` -- [what it does]

    ## Files to Modify
    - `exact/path/to/index.ts` -- add exports

    ## Reference Implementations
    ### [Pattern name]
    File: `exact/path/to/reference.tsx`
    Pattern: [describe the structure]

    ## Available Dependencies
    - `useXyz(options)` from `@/hooks/` -- [signature + return type]

    ## Implementation Steps
    1. [Concrete step with file path]
    2. [Concrete step with file path]

    ## Wiring
    - Regenerate types: `supabase gen types typescript --local`
    - Add route in `apps/web/app/...`
```

**Key rules for the brief:**
- Use **exact file paths** -- no placeholders
- Show **import paths** for dependencies
- Include **function signatures** -- not just names
- List **types with key fields** -- not just type names

## Phase 4: Note Cleanup Items

Enqueue actionable cleanup items found during discovery:

```
mcp__wnext__enqueue_queue_item:
  taskId: <wnextTaskId>
  queueName: "mesh:cleanup"
  actorId: <actorId>
  actionType: "Update <doc/file> after implementation"
```

## Success Criteria

- Mainframe brief read and understood (if exists)
- Tactical details extracted (signatures, types, wiring points)
- Implementation Brief written -- passes self-sufficiency test
- Cleanup items enqueued
- No duplicated work from mainframe discovery

## WNext Graceful Degradation

If WNext is unreachable, fall back to updating the GitHub Issue body directly with discovery notes.
