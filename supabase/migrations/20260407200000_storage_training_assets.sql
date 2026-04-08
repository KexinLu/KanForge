-- Storage RLS policies for training-assets bucket
-- Path convention: {training_run_id}/{image_id}.{ext}
-- Users can only access files under their own training runs.

create policy "Users can upload training images"
  on storage.objects for insert
  with check (
    bucket_id = 'training-assets'
    and auth.uid() is not null
    and exists (
      select 1 from public.training_runs
      where id = (storage.foldername(objects.name))[1]::uuid
        and profile_id = auth.uid()
    )
  );

create policy "Users can view own training images"
  on storage.objects for select
  using (
    bucket_id = 'training-assets'
    and exists (
      select 1 from public.training_runs
      where id = (storage.foldername(objects.name))[1]::uuid
        and profile_id = auth.uid()
    )
  );

create policy "Users can delete own training images"
  on storage.objects for delete
  using (
    bucket_id = 'training-assets'
    and exists (
      select 1 from public.training_runs
      where id = (storage.foldername(objects.name))[1]::uuid
        and profile_id = auth.uid()
    )
  );
