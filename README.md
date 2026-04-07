# KanForge

One-click LoRA training for ZImage Turbo. Upload images, auto-caption, train on cloud GPU, generate, download your LoRA.

## What is KanForge?

KanForge makes LoRA training accessible to everyone. No command line, no config files, no GPU setup. Just upload your images and get a trained LoRA back.

1. **Upload** -- Drag-and-drop your training images
2. **Caption** -- AI auto-captions each image (edit if you want)
3. **Train** -- One click launches training on cloud GPU via Modal
4. **Generate** -- Test your LoRA with ZImage Turbo inference
5. **Download** -- Get your `.safetensors` file

## Architecture

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|   Next.js App    +---->+    Supabase      +---->+     Modal        |
|   (App Router)   |     |  (Auth/DB/Store) |     |  (GPU/CPU)      |
|                  |     |                  |     |                  |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         |  React UI              |  PostgreSQL            |  Training
         |  Server Components     |  Auth (email/OAuth)    |  Inference
         |  Server Actions        |  Storage (images)      |  Captioning
         |  Stripe Checkout       |  Edge Functions        |  Alpha extraction
         |                        |  Realtime (status)     |
         +------------------------+------------------------+
                                  |
                           +------+------+
                           |             |
                           |   Stripe    |
                           |  (Billing)  |
                           |             |
                           +-------------+
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 15 (App Router) | UI, server components, server actions |
| Auth | Supabase Auth | Email/password, OAuth (Google, GitHub) |
| Database | Supabase PostgreSQL | Users, projects, training jobs, LoRAs |
| Storage | Supabase Storage | Training images, generated images, LoRA files |
| Realtime | Supabase Realtime | Training progress, job status updates |
| Edge Functions | Supabase Edge Functions | Webhooks, async triggers |
| GPU Compute | Modal | LoRA training, inference, captioning |
| Billing | Stripe | Subscriptions, usage-based billing |
| Package Manager | pnpm | Fast, disk-efficient |

## Project Structure

```
KanForge/
├── .claude/                  # AI agent configuration
│   ├── settings.json         # Tool permissions
│   ├── modes/                # Mainframe & worker behavior profiles
│   └── skills/               # Reusable workflow skills
├── apps/
│   └── web/                  # Next.js app (App Router)
│       ├── app/              # Routes, layouts, server actions
│       ├── components/       # React components
│       ├── lib/              # Utilities, Supabase client, Stripe
│       └── public/           # Static assets
├── packages/
│   └── modal/                # Modal Python endpoints
│       ├── train.py          # LoRA training endpoint
│       ├── inference.py      # ZImage Turbo inference
│       ├── caption.py        # Auto-captioning (BLIP/CogVLM)
│       └── utils/            # Shared GPU utilities
├── supabase/
│   ├── migrations/           # SQL schema migrations
│   ├── functions/            # Edge functions (Deno)
│   └── config.toml           # Supabase project config
├── workstreams.json          # Active workstream tracking
├── CLAUDE.md                 # AI agent instructions
├── README.md                 # This file
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Python 3.11+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Modal CLI](https://modal.com/docs/guide)
- Stripe CLI (for webhook testing)

### Local Development

```bash
# Clone the repo
git clone https://github.com/KexinLu/KanForge.git
cd KanForge

# Install frontend dependencies
pnpm install

# Start Supabase locally
supabase start

# Run migrations
supabase db push

# Start the Next.js dev server
pnpm dev

# In a separate terminal, deploy Modal endpoints (dev mode)
cd packages/modal
modal serve train.py
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start>
SUPABASE_SERVICE_ROLE_KEY=<from supabase start>

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Modal
MODAL_TOKEN_ID=<from modal setup>
MODAL_TOKEN_SECRET=<from modal setup>
```

## Development Workflow

This project uses git worktrees for parallel task isolation. See `CLAUDE.md` for the full orchestration system.

```bash
# Create a worktree for an issue
git worktree add ../worktrees/42-feature-name -b 42-feature-name

# Work in the worktree
cd ../worktrees/42-feature-name

# When done, create PR from the worktree
gh pr create --title "feat: feature name" --body "Closes #42"
```

## License

Proprietary. All rights reserved.
