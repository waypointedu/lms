create table if not exists public.discussion_threads (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  week_id uuid references public.weeks (id) on delete set null,
  content_item_id uuid not null references public.content_items (id) on delete cascade,
  title text not null,
  created_by uuid not null,
  created_at timestamptz not null default now()
);

create table if not exists public.discussion_posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.discussion_threads (id) on delete cascade,
  parent_post_id uuid references public.discussion_posts (id) on delete cascade,
  body text not null,
  created_by uuid not null,
  created_at timestamptz not null default now()
);

alter table public.discussion_threads enable row level security;
alter table public.discussion_posts enable row level security;

create policy "Enrolled users can view discussion threads"
  on public.discussion_threads
  for select
  using (
    exists (
      select 1 from public.course_enrollments
      where course_enrollments.course_id = discussion_threads.course_id
        and course_enrollments.user_id = auth.uid()
        and course_enrollments.status = 'enrolled'
    )
    or exists (
      select 1 from public.course_instructors
      where course_instructors.course_id = discussion_threads.course_id
        and course_instructors.user_id = auth.uid()
    )
  );

create policy "Enrolled users can create discussion threads"
  on public.discussion_threads
  for insert
  with check (
    auth.uid() = created_by
    and (
      exists (
        select 1 from public.course_enrollments
        where course_enrollments.course_id = discussion_threads.course_id
          and course_enrollments.user_id = auth.uid()
          and course_enrollments.status = 'enrolled'
      )
      or exists (
        select 1 from public.course_instructors
        where course_instructors.course_id = discussion_threads.course_id
          and course_instructors.user_id = auth.uid()
      )
    )
  );

create policy "Enrolled users can view discussion posts"
  on public.discussion_posts
  for select
  using (
    exists (
      select 1
      from public.discussion_threads
      join public.course_enrollments
        on course_enrollments.course_id = discussion_threads.course_id
      where discussion_threads.id = discussion_posts.thread_id
        and course_enrollments.user_id = auth.uid()
        and course_enrollments.status = 'enrolled'
    )
    or exists (
      select 1
      from public.discussion_threads
      join public.course_instructors
        on course_instructors.course_id = discussion_threads.course_id
      where discussion_threads.id = discussion_posts.thread_id
        and course_instructors.user_id = auth.uid()
    )
  );

create policy "Enrolled users can create discussion posts"
  on public.discussion_posts
  for insert
  with check (
    auth.uid() = created_by
    and (
      exists (
        select 1
        from public.discussion_threads
        join public.course_enrollments
          on course_enrollments.course_id = discussion_threads.course_id
        where discussion_threads.id = discussion_posts.thread_id
          and course_enrollments.user_id = auth.uid()
          and course_enrollments.status = 'enrolled'
      )
      or exists (
        select 1
        from public.discussion_threads
        join public.course_instructors
          on course_instructors.course_id = discussion_threads.course_id
        where discussion_threads.id = discussion_posts.thread_id
          and course_instructors.user_id = auth.uid()
      )
    )
  );

with target_course as (
  select id from public.courses where code = 'PHIL-1401' limit 1
),
discussion_item as (
  select content_items.id as item_id, content_items.course_id, content_items.week_id
  from public.content_items
  join target_course on target_course.id = content_items.course_id
  where content_items.type = 'discussion'
  limit 1
),
inserted_thread as (
  insert into public.discussion_threads (course_id, week_id, content_item_id, title, created_by)
  select course_id, week_id, item_id, 'Week 1 discussion', gen_random_uuid()
  from discussion_item
  returning id
)
insert into public.discussion_posts (thread_id, body, created_by)
select id, 'What stood out to you from the opening reading?', gen_random_uuid()
from inserted_thread;
