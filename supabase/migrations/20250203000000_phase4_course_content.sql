create table if not exists public.weeks (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  week_number int not null,
  title text,
  created_at timestamptz not null default now(),
  unique (course_id, week_number)
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  week_id uuid references public.weeks (id) on delete set null,
  type text not null,
  title text not null,
  body text,
  link_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.media_blocks (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items (id) on delete cascade,
  type text not null,
  embed_url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.weeks enable row level security;
alter table public.content_items enable row level security;
alter table public.media_blocks enable row level security;

create policy "Enrolled users can view weeks"
  on public.weeks
  for select
  using (
    exists (
      select 1 from public.course_enrollments
      where course_enrollments.course_id = weeks.course_id
        and course_enrollments.user_id = auth.uid()
        and course_enrollments.status = 'enrolled'
    )
    or exists (
      select 1 from public.course_instructors
      where course_instructors.course_id = weeks.course_id
        and course_instructors.user_id = auth.uid()
    )
  );

create policy "Enrolled users can view content items"
  on public.content_items
  for select
  using (
    exists (
      select 1 from public.course_enrollments
      where course_enrollments.course_id = content_items.course_id
        and course_enrollments.user_id = auth.uid()
        and course_enrollments.status = 'enrolled'
    )
    or exists (
      select 1 from public.course_instructors
      where course_instructors.course_id = content_items.course_id
        and course_instructors.user_id = auth.uid()
    )
  );

create policy "Enrolled users can view media blocks"
  on public.media_blocks
  for select
  using (
    exists (
      select 1
      from public.content_items
      join public.course_enrollments
        on course_enrollments.course_id = content_items.course_id
      where content_items.id = media_blocks.content_item_id
        and course_enrollments.user_id = auth.uid()
        and course_enrollments.status = 'enrolled'
    )
    or exists (
      select 1
      from public.content_items
      join public.course_instructors
        on course_instructors.course_id = content_items.course_id
      where content_items.id = media_blocks.content_item_id
        and course_instructors.user_id = auth.uid()
    )
  );

with target_course as (
  select id from public.courses where code = 'PHIL-1401' limit 1
),
inserted_weeks as (
  insert into public.weeks (course_id, week_number, title)
  select id, 1, 'Week 1' from target_course
  union all
  select id, 2, 'Week 2' from target_course
  returning id, course_id, week_number
),
week_one as (
  select id, course_id from inserted_weeks where week_number = 1
),
week_two as (
  select id, course_id from inserted_weeks where week_number = 2
),
inserted_items as (
  insert into public.content_items (course_id, week_id, type, title, body, sort_order)
  select course_id, id, 'overview', 'Overview', 'Welcome to Week 1. Here is the roadmap for the week.', 1 from week_one
  union all
  select course_id, id, 'lesson', 'Lesson', 'This lesson explores the basics of philosophical inquiry.', 2 from week_one
  union all
  select course_id, id, 'discussion', 'Discussion', 'Share your thoughts on the opening reading.', 3 from week_one
  union all
  select course_id, id, 'quiz', 'Quiz', 'Complete the week 1 quiz using the provided link.', 4 from week_one
  union all
  select course_id, id, 'assignment', 'Assignment', 'Submit a short reflection via the provided link.', 5 from week_one
  union all
  select course_id, id, 'overview', 'Overview', 'Week 2 overview and objectives.', 1 from week_two
  union all
  select course_id, id, 'lesson', 'Lesson', 'Week 2 lesson content goes here.', 2 from week_two
  returning id, course_id
)
insert into public.media_blocks (content_item_id, type, embed_url, caption, sort_order)
select id, 'image', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee', 'Sample image block', 1
from inserted_items
limit 1;
