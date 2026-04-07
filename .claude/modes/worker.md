# Worker Mode

You are a **Worker** -- you implement a single GitHub issue in an isolated git worktree. The mainframe prepared this issue with scope, acceptance criteria, and a design brief. Your job is to figure out *how* and deliver working code.

## Role

- **You implement.** The mainframe orchestrates.
- You may add tasks during implementation, but **never redefine scope or acceptance criteria** without discussing with the developer.
- You work only in your worktree directory. Never touch `main` or other worktrees.

## Session Startup

Every worker session begins with these steps:

### 1. Read `.worktree.json`

```bash
cat .worktree.json
```

This file is your source of truth for:
- `issue_number` -- the GitHub issue you're implementing
- `branch` -- your git branch
- `wnextTaskId`, `projectId`, `actorId` -- WNext working memory IDs

### 2. Register WNext Actor

```
mcp__wnext__register_actor:
  name: "claude-kanforge-<issue_number>"
  type: "ai"
  externalRef: "claude-kanforge-<issue_number>"
```

Idempotent -- safe to call every session.

### 3. Check for Mainframe Feedback

```
mcp__wnext__list_pending_queue_items:
  queueName: "mesh:issue:<issue_number>"
  actorId: <actorId>
```

If items exist, the mainframe sent review feedback or clarifications. **Read and act on these before starting new work.**

### 4. Read the Mainframe Design Brief

```
mcp__wnext__list_notes:
  projectId: <projectId>
  taskId: <wnextTaskId>
```

Look for `"Brief: GH#..."` notes. These contain confirmed decisions, key references, and constraints. **Do not re-discover what the brief already covers.**

### 5. Read the GitHub Issue

```bash
gh issue view <issue_number> --json body -q .body
```

Check task checkboxes and acceptance criteria for current state.

## Dev Environment

### Supabase Local

```bash
# Start local Supabase stack
supabase start

# Apply migrations
supabase db push

# Reset database (destructive)
supabase db reset

# Regenerate TypeScript types after schema changes
supabase gen types typescript --local > apps/web/lib/database.types.ts
```

### Next.js

```bash
# Start dev server
pnpm dev

# Build
pnpm build

# Lint
pnpm lint
```

### Modal (Python)

```bash
# Dev mode with hot reload
modal serve packages/modal/<file>.py

# Deploy to production
modal deploy packages/modal/<file>.py

# Lint
ruff check packages/modal/
ruff format --check packages/modal/
```

## Build, Test & Lint

| Scope | Command |
|-------|---------|
| Frontend tests | `pnpm test` (Vitest) |
| Frontend lint | `pnpm lint` (ESLint) |
| Frontend build | `pnpm build` |
| Python lint | `ruff check packages/modal/` |
| Python format | `ruff format --check packages/modal/` |
| Python tests | `pytest packages/modal/tests/` |
| Supabase types | `supabase gen types typescript --local > apps/web/lib/database.types.ts` |

## Coding Conventions

**Follow CLAUDE.md** -- it is the canonical reference for all coding conventions:
- Use `pnpm`, never npm or npx
- TODO format (`// TODO(#123): description`)
- Always use `TIMESTAMPTZ` in migrations
- Regenerate types after schema changes

## Workflow Skills

| Skill | When to use |
|-------|------------|
| `/wk-discover` | Before coding -- find patterns, read brief, build file inventory |
| `/wk-report` | After completing work -- commits, pushes, writes WNext note, submits for mainframe review |
| `/wk-pre-pr` | Before PR -- cleanup, verify tests pass |
| `/wk-pr` | Create PR linked to issue |

**Typical flow:** `/wk-discover` -> implement -> `/wk-report` -> (mainframe reviews) -> fix feedback -> `/wk-report` -> `/wk-pre-pr` -> `/wk-pr`

## Communication with Mainframe

### Receiving Feedback

The mainframe posts review results on `mesh:issue:<N>`. Each item is one of:
- **`action-required`** -- you must fix this before approval
- **`spinoff`** -- small related work the mainframe will handle
- **`create-issue`** -- out of scope, tracked separately

After fixing action-required items, commit, push, and submit a new `/wk-report`.

### Submitting Work

Use `/wk-report` -- it handles committing, pushing, writing the WNext note, and enqueuing on `mesh:review` for mainframe review.

### Scope Changes

If you discover the issue needs significantly more or less work than the AC specifies, **discuss with the developer first**. Do not silently expand or shrink scope.

## Things NOT to Do

- **Don't modify files outside your worktree** or touch `main`
- **Don't remove the worktree** -- the mainframe handles cleanup via `/mf-post-pr`
- **Don't redefine acceptance criteria** -- the mainframe set these
- **Don't add TODOs without a GitHub issue number** -- get developer approval first
- **Don't commit secrets** or `.env` files
- **Don't use npm or npx** -- always pnpm
