create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  content_item_id uuid not null references public.content_items (id) on delete cascade,
  user_id uuid not null,
  submission_url text,
  status text not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_item_id, user_id)
);

alter table public.submissions enable row level security;

create policy "Students can view their submissions"
  on public.submissions
  for select
  using (auth.uid() = user_id);

create policy "Instructors can view submissions for their courses"
  on public.submissions
  for select
  using (
    exists (
      select 1 from public.course_instructors
      where course_instructors.course_id = submissions.course_id
        and course_instructors.user_id = auth.uid()
    )
  );

create policy "Students can submit assignments"
  on public.submissions
  for insert
  with check (auth.uid() = user_id);

create policy "Students can update their submissions"
  on public.submissions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
