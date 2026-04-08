-- Training runs: one per LoRA training job
create table public.training_runs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  type text not null default 'style',
  status text not null default 'draft',
  current_stage text,
  trigger_word text not null,
  config jsonb not null default '{}',
  stages jsonb not null default '{}',
  thumbnail_url text,
  output_url text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Training images: one row per image in a training run
create table public.training_images (
  id uuid primary key default gen_random_uuid(),
  training_run_id uuid not null references public.training_runs(id) on delete cascade,
  original_filename text not null,
  storage_path text not null,
  width int,
  height int,
  content_hash text,
  caption text,
  rejected boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index training_runs_profile_id_idx on public.training_runs(profile_id);
create index training_images_run_id_idx on public.training_images(training_run_id);
create index training_images_content_hash_idx on public.training_images(content_hash);

-- Enable RLS
alter table public.training_runs enable row level security;
alter table public.training_images enable row level security;

-- RLS: users can CRUD their own training runs
create policy "Users can read own training runs"
  on public.training_runs for select
  using (auth.uid() = profile_id);

create policy "Users can create training runs"
  on public.training_runs for insert
  with check (auth.uid() = profile_id);

create policy "Users can update own training runs"
  on public.training_runs for update
  using (auth.uid() = profile_id);

create policy "Users can delete own training runs"
  on public.training_runs for delete
  using (auth.uid() = profile_id);

-- RLS: users can CRUD images on their own training runs
create policy "Users can read own training images"
  on public.training_images for select
  using (exists (
    select 1 from public.training_runs
    where id = training_run_id and profile_id = auth.uid()
  ));

create policy "Users can create training images"
  on public.training_images for insert
  with check (exists (
    select 1 from public.training_runs
    where id = training_run_id and profile_id = auth.uid()
  ));

create policy "Users can update own training images"
  on public.training_images for update
  using (exists (
    select 1 from public.training_runs
    where id = training_run_id and profile_id = auth.uid()
  ));

create policy "Users can delete own training images"
  on public.training_images for delete
  using (exists (
    select 1 from public.training_runs
    where id = training_run_id and profile_id = auth.uid()
  ));

-- Reuse set_updated_at trigger from profiles migration
create trigger training_runs_updated_at
  before update on public.training_runs
  for each row execute function public.set_updated_at();

create trigger training_images_updated_at
  before update on public.training_images
  for each row execute function public.set_updated_at();
