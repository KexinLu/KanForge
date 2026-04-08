# Claude Code Configuration for KanForge

This file provides Claude Code with project context and instructions.

## Tenet

We are not building toys, always function as professional engineers, design properly, NEVER just think about completing the task.

## Project Context

KanForge is a one-click LoRA training platform for ZImage Turbo. Upload images, auto-caption, train on cloud GPU, generate, download your LoRA.

**Tech Stack:**
- TypeScript: Next.js 16 (App Router) + Mantine v9
- Python: Modal (GPU/CPU serverless endpoints)
- Supabase: Auth, PostgreSQL, Storage, Edge Functions, Realtime
- Stripe: Subscriptions and usage-based billing
- Tooling: mise (node, pnpm, python, uv, ruff)

**Architecture:** Flat and simple. Lean MVP — ship fast, iterate fast.

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

## Git Workflow

Simple branch-and-merge. No worktrees for now.

- **Branch naming:** `{issue_number}-{slug}` (e.g. `12-upload-flow`)
- Work on feature branches, merge to `main` via PR
- Use `gh` CLI for all issue/PR operations
- GitHub Issues on KexinLu/KanForge is the source of truth for work tracking

## WNext Working Memory

**Project ID:** `46cfadad-f065-447a-bd74-6dc8b1e02747` (KanForge)

Always use this `projectId` for all WNext calls in this repo. Do NOT use the MeshStudio project.

When WNext MCP is available, register an actor at the start of each session before any other WNext calls. All WNext operations require an `actorId`.

```
mcp__wnext__register_actor:
  name: "claude-kanforge-<issue_number>"
  type: "ai"
  externalRef: "claude-kanforge-<issue_number>"
```

This is idempotent. Pass the returned `actorId` to all subsequent WNext calls. If WNext is unavailable, skip and use GitHub directly.

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

## Project Structure

```
KanForge/
├── apps/web/             # Next.js app (App Router) + Mantine
├── packages/modal/       # Modal Python endpoints
├── supabase/
│   ├── migrations/       # SQL schema migrations
│   └── functions/        # Supabase Edge Functions (Deno)
├── mise.toml             # Tool versions (node, python, pnpm, etc.)
├── CLAUDE.md             # This file
└── README.md             # Product overview
```

## Conflict Resolution

If docs and conventions contradict:
1. **STOP** - Do not proceed
2. Alert: "CONFLICT DETECTED: [source1] says X, but [source2] says Y"
3. Wait for developer clarification
