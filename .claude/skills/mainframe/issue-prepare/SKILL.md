---
name: mf-issue-prepare
description: Prepare a GitHub Issue for implementation by creating worktree, running discovery, and planning tasks
version: 1.0.0
allowed-tools: Bash, Read, Grep, Glob, mcp__wnext__register_actor, mcp__wnext__list_projects, mcp__wnext__create_project, mcp__wnext__create_task, mcp__wnext__list_tasks, mcp__wnext__list_queue_items, mcp__wnext__create_note, mcp__wnext__read_note, mcp__wnext__list_notes
---

# Issue Prepare

Prepare a GitHub Issue for implementation with isolated worktree, WNext working memory, and discovery.

## Terminology

- **Issue** = Work item to implement (GitHub Issue)
- **Worktree** = Isolated git working directory
- **WNext Task** = Durable working memory root record for this issue
- **Actor** = WNext session identity (registered per skill invocation)
- **Project** = WNext project scope ("kanforge")

## When to Use

- Start work on a specific Issue
- Prepare an Issue for implementation
- Set up development environment for an Issue

## Prerequisites

- GitHub CLI (`gh`) authenticated
- WNext MCP connected (graceful degradation if unavailable)
- On `main` branch with latest changes

## MUST Do (Required)

1. **Read the Issue** -- Get full context from GitHub
2. **Create Worktree** -- Isolated development environment
3. **Register Actor** -- Start WNext session
4. **Find/Create Project** -- Get projectId for "kanforge"
5. **Initialize WNext Task** -- Create or resume WNext task for this issue
6. **Run Discovery** -- Explore codebase for patterns
7. **Design Review with Developer** -- Present findings, confirm approach (MANDATORY)
8. **Update Issue** -- Add implementation tasks as checkboxes

## CAN SKIP (Optional)

- Discovery for trivial/documentation-only issues

## Execution Steps

### 1. Read the Issue

```bash
gh issue view <number> --repo KexinLu/KanForge --json title,body,labels
```

Extract: Title, description, existing tasks/checkboxes, labels.

### 2. Verify Prerequisites

```bash
git branch --show-current  # Should be: main
git pull origin main
```

### 3. Create Worktree

Branch name and worktree directory MUST match. Format: `{issue_number}-{slug}`.

```bash
git worktree add ../worktrees/{issue_number}-{slug} -b {issue_number}-{slug} main
git -C ../worktrees/{issue_number}-{slug} push -u origin {issue_number}-{slug}
```

### 4. Register Actor & Find Project

```
mcp__wnext__register_actor:
  name: "claude-kanforge-<issue_number>"
  type: "ai"
  externalRef: "claude-kanforge-<issue_number>"
-> Save returned actorId
```

```
mcp__wnext__list_projects -> Find "kanforge" -> use its projectId

If not found:
mcp__wnext__create_project:
  name: "kanforge"
  actorId: <actorId>
```

### 5. Initialize WNext Working Memory

Check if a WNext task already exists (resume path):

```
mcp__wnext__list_tasks:
  projectId: <projectId>
  filters: { externalRef: "gh#<issue_number>" }
```

**If task exists:** Read notes, recover context, report to user.

**If no task found:**

```
mcp__wnext__create_task:
  projectId: <projectId>
  actorId: <actorId>
  title: "GH#<issue_number> - <issue_title>"
  externalRef: "gh#<issue_number>"
  metadata:
    github_issue: <issue_number>
    github_repo: "KexinLu/KanForge"
```

### 6. Write .worktree.json

```json
{
  "issue_number": 42,
  "branch": "42-upload-flow",
  "wnextTaskId": "<wnext-task-id>",
  "projectId": "<project-id>",
  "actorId": "<actor-id>"
}
```

### 7. Run Discovery

Explore the codebase for relevant patterns. For KanForge, focus on:

- **Supabase schema** -- Existing tables, RLS policies, types
- **Next.js patterns** -- Existing page/component structure, server actions
- **Modal endpoints** -- Existing Python functions, shared utilities
- **Edge functions** -- Existing Supabase edge functions

Write a design brief to WNext:

```
mcp__wnext__create_note:
  projectId: <projectId>
  actorId: <actorId>
  taskId: <wnextTaskId>
  title: "Brief: GH#<number> -- <issue title>"
  noteType: markdown
  content: |
    # GH#<number> -- Design Brief

    ## Confirmed Decisions
    [Filled in after design review]

    ## Key Discovery Findings
    - [Existing patterns to follow]
    - [Infrastructure to reuse]
    - [Gaps -- what needs building]

    ## Key References
    - [File paths the worker MUST read]

    ## Constraints
    - [Cross-workstream warnings]
    - [Build/test requirements]
```

### 8. Design Review with Developer (MANDATORY)

Present findings and ask questions **one at a time**:

1. **Conflicts & blockers** -- Things that could invalidate the plan
2. **Placement** -- Where new files/components go
3. **Design decisions** -- Error handling, testing approach
4. **Precedent** -- Anything that sets a pattern for future work

After all decisions, update the design brief with confirmed decisions.

### 9. Update Issue with Tasks and AC

```bash
gh issue edit <number> --repo KexinLu/KanForge --body "<updated body>"
```

Add:
- Implementation tasks as checkboxes
- Acceptance criteria (specific, verifiable)
- Scope (in/out)
- Constraints

## WNext Graceful Degradation

If WNext is unreachable:
1. Log warning: "WNext unavailable -- working memory will use GitHub only"
2. Skip WNext steps
3. Continue with remaining steps normally

## Success Message

```
Issue #<number> prepared for implementation!

Worktree: ../worktrees/<number>-<slug>/
Branch: <number>-<slug>
WNext Task: <wnextTaskId>

Discovery Summary:
- Found {N} relevant patterns
- Key decisions documented

Next Steps:
1. Open a worker session in the worktree
2. Start implementation
```

## Error Recovery

| Error | Recovery |
|-------|----------|
| Issue not found | Verify issue number exists |
| Branch exists | Ask user: reuse or new name |
| Worktree exists | Remove old: `git worktree remove ...` |
| Not on main | `git checkout main` first |
| WNext unreachable | Continue without working memory (GitHub-only) |
