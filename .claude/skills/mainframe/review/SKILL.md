---
name: mf-review
description: Review a worktree diff against WNext report and issue AC. Delegates to sub-agent to avoid permission friction.
version: 1.0.0
allowed-tools: Read, Glob, Grep, Bash, Agent, mcp__wnext__register_actor, mcp__wnext__list_projects, mcp__wnext__list_tasks, mcp__wnext__list_notes, mcp__wnext__read_note, mcp__wnext__list_pending_queue_items, mcp__wnext__lease_queue_items, mcp__wnext__complete_queue_item, mcp__wnext__enqueue_queue_item
---

# Review (`mf-review`)

Review a worktree's code changes against the worker's report and issue acceptance criteria.

## Purpose

The mainframe delegates code review to a sub-agent that runs in the worktree context. This avoids permission friction -- the sub-agent uses `git -C` and Read/Grep/Glob tools instead of `cd && ...` compounds.

## When to Use

- After a worker submits a report to `mesh:review` queue
- When the developer asks to review a specific worktree/issue
- Before approving a PR

## Input

The user provides one of:
- An issue number (e.g., `#42`)
- A worktree path (e.g., `../worktrees/42-upload-flow`)
- A queue item from `mesh:review`

## Execution Steps

### 1. Resolve Worktree Path and Issue Context

```bash
ls ../worktrees/ | grep "^<issue_number>"
```

Read `.worktree.json` from the worktree to get WNext IDs.

### 2. Gather Review Inputs

**a) The diff:**
```bash
git -C ../worktrees/<dir> diff --stat main..HEAD
git -C ../worktrees/<dir> log --oneline main..HEAD
```

**b) The worker report** -- read from WNext notes if available.

**c) The acceptance criteria** -- read from GitHub issue:
```bash
gh issue view <issue_number> --repo KexinLu/KanForge --json body -q .body
```

### 3. Spawn Review Sub-Agent

Launch a sub-agent with the worktree path, diff summary, report, and AC.

**Sub-agent review checklist:**

- **Correctness** -- Changes match what the worker report claims, no unintended side effects
- **Code Quality** -- No leftover debug logging, no dead code, no TODOs without issue numbers
- **Tests** -- New code has test coverage, existing tests updated if behavior changed
- **AC Verification** -- Each AC item verified against the diff

**Sub-agent output format:**

```
## Review: #<number> -- <title>

### Summary
<1-2 sentence overall assessment: approve / changes-requested>

### AC Verification
- [x] AC item 1 -- verified in <file>
- [ ] AC item 2 -- NOT MET: <reason>

### Findings
- **action-required**: <description> (file:line)
- **create-issue**: <description> (why it can't be fixed here)

### Files Reviewed
<list of files actually read and verified>
```

### 4. Process Sub-Agent Results

**If approved (no action-required items):**
1. Report findings to developer
2. Update GitHub issue AC checkboxes
3. Send approval via `mesh:issue:<N>` queue
4. Complete the `mesh:review` queue item

**If changes requested:**
1. Present findings to developer **one at a time**
2. For each finding, developer confirms triage category
3. Send feedback via `mesh:issue:<N>` queue
4. Create GitHub issues for any `create-issue` items
5. Complete the `mesh:review` queue item

### 5. Triage Rules

- **`action-required`**: Fixable now, even if pre-existing and trivial. Worker fixes before approval.
- **`create-issue`**: High threshold. Requires meaningful effort or different scope.
- **No suggestions, no FYIs.** If unsure, ask the developer.

## Error Recovery

| Situation | Action |
|-----------|--------|
| Worktree not found | Ask user for correct path |
| No commits ahead of main | Nothing to review -- report to user |
| WNext report not found | Review diff without report context |
| Sub-agent hits permission issues | Check that it's using `git -C` not `cd &&` |
