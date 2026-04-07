# Claude Code Configuration for KanForge

This file provides Claude Code with project context and instructions.

## Tenet

We are not building toys, always function as professional engineers, design properly, NEVER just think about completing the task.

## Project Context

KanForge is a one-click LoRA training platform for ZImage Turbo. Upload images, auto-caption, train on cloud GPU, generate, download your LoRA.

**Tech Stack:**
- TypeScript: Next.js 15 (App Router) + Tailwind + shadcn/ui
- Python: Modal (GPU/CPU serverless endpoints)
- Supabase: Auth, PostgreSQL, Storage, Edge Functions, Realtime
- Stripe: Subscriptions and usage-based billing

**Architecture:** Flat and simple. No Clean Architecture, no layered patterns. This is a lean MVP product.

## Build & Dev Commands

**Package manager:** Always use `pnpm`, never npm or npx. Use `pnpm dlx` for one-off remote packages.

**Frontend (Next.js):**
- `pnpm dev` -- Start dev server
- `pnpm build` -- Production build
- `pnpm lint` -- ESLint
- `pnpm test` -- Vitest

**Supabase:**
- `supabase start` -- Start local Supabase stack
- `supabase stop` -- Stop local stack
- `supabase db push` -- Apply migrations
- `supabase db reset` -- Reset and re-apply all migrations
- `supabase gen types typescript --local > apps/web/lib/database.types.ts` -- Regenerate types

**Modal (Python):**
- `modal serve packages/modal/<file>.py` -- Dev mode (hot reload)
- `modal deploy packages/modal/<file>.py` -- Deploy to Modal cloud
- `ruff check packages/modal/` -- Lint Python
- `ruff format --check packages/modal/` -- Format check

**Testing:**
- `pnpm test` -- Vitest (frontend)
- `pytest packages/modal/tests/` -- pytest (Python)

## Story & Task Management

**Stories = GitHub Issues** on KexinLu/KanForge

- Use `gh` CLI for all issue/PR operations
- GitHub is the source of truth for all work tracking

## WNext Working Memory

When WNext MCP is available, register an actor at the start of each session before any other WNext calls. All WNext operations require an `actorId`.

```
mcp__wnext__register_actor:
  name: "claude-kanforge-<issue_number>"
  type: "ai"
  externalRef: "claude-kanforge-<issue_number>"
```

This is idempotent. Pass the returned `actorId` to all subsequent WNext calls. If WNext is unavailable, skip and use GitHub directly.

## Skills (Slash Commands)

**Always use skills for common workflows.** They ensure consistency and handle edge cases.

### Mainframe Skills

Skills used by the mainframe orchestrator (runs from `main/`).

| Skill | What it does |
|-------|--------------|
| `/mf-issue-prepare` | Full setup: worktree + discovery + task planning |
| `/mf-worktree-setup` | Create worktree with .worktree.json |
| `/mf-quick-work` | Fast-track small tasks: WNext-only, worktree, review, direct merge |
| `/mf-post-pr` | Post-merge: tear down worktree, delete branch, close WNext |
| `/mf-review` | Review worktree diff via sub-agent |

### Worker Skills

Skills used by workers (run from worktree directories).

| Skill | What it does |
|-------|--------------|
| `/wk-discover` | Find patterns, conventions before coding |
| `/wk-report` | Record findings to WNext: problems, solutions, files changed |
| `/wk-pre-pr` | Pre-PR: summary, GitHub sync, verify tests pass |
| `/wk-pr` | Create PR linked to GitHub Issue |

**Skill Location:** `.claude/skills/mainframe/` and `.claude/skills/worker/`

### Operating Modes

| Mode | Purpose | Location |
|------|---------|----------|
| **Mainframe** | Main-branch orchestration: track workstreams, resolve conflicts, WNext sync | `.claude/modes/mainframe.md` |
| **Worker** | Worktree implementation: session startup, dev env, debugging, mainframe communication | `.claude/modes/worker.md` |

## Development Guidelines

### TODO Comments

- **Never write a TODO without a GitHub Issue number.** Format: `// TODO(#123): description`
- **Always get developer approval** before adding a TODO. Do not silently insert TODOs.
- If the work is small enough to do now, do it instead of leaving a TODO.

### Testing

- Vitest for frontend (React components, hooks, utilities)
- pytest for Python (Modal endpoints, utilities)
- Target reasonable coverage -- focus on business logic, not boilerplate

### Error Handling

- Use standard Next.js error boundaries for frontend
- Use Supabase error codes for database operations
- Modal endpoints: return structured error responses with status codes

### Database

- **Always use `TIMESTAMPTZ`**, never plain `TIMESTAMP`
- Migrations go in `supabase/migrations/` with sequential naming
- After schema changes, regenerate types: `supabase gen types typescript --local > apps/web/lib/database.types.ts`
- **Always fix pre-existing errors** encountered during work -- lint errors, type errors, broken imports. Do not leave broken code behind.

## Worktree Protocol

Development uses git worktrees for task isolation. **Use skills for setup and cleanup.**

### Directory Structure

```
KanForge/                # Workspace root
├── main/                # Main branch - sync only, no direct development
└── worktrees/           # Flat structure
    ├── 42-upload-flow/
    ├── 43-training-ui/
    └── 44-billing/
```

**Branch naming:** `{issue_number}-{slug}`. No prefixes. Branch name and worktree directory name MUST match.

### Manual Commands (if needed)

```bash
# Create worktree
git worktree add ../worktrees/42-upload-flow -b 42-upload-flow

# Remove worktree
git worktree remove ../worktrees/42-upload-flow
```

## Project Structure

```
KanForge/
├── apps/web/             # Next.js app (App Router)
├── packages/modal/       # Modal Python endpoints
├── supabase/
│   ├── migrations/       # SQL schema migrations
│   └── functions/        # Supabase Edge Functions (Deno)
├── workstreams.json      # Active workstream tracking
├── CLAUDE.md             # This file
└── README.md             # Product overview
```

## Conflict Resolution

If docs and conventions contradict:
1. **STOP** - Do not proceed
2. Alert: "CONFLICT DETECTED: [source1] says X, but [source2] says Y"
3. Wait for developer clarification
