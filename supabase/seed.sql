-- Seed data for Waypoint LMS
insert into public.courses (slug, title, description, language, published)
values (
  'waypoint-foundations',
  'Waypoint Foundations',
  'GitHub-centered LMS starter: Waypoint design system, Supabase auth/storage, and MDX content flows.',
  'en',
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  published = excluded.published;

with course as (
  select id from public.courses where slug = 'waypoint-foundations'
),
modules as (
  insert into public.modules (course_id, title, position)
  select id, mod.title, mod.position
  from course,
  (values
    ('Design system & content', 1),
    ('Supabase & delivery', 2)
  ) as mod(title, position)
  on conflict do nothing
  returning id, position, course_id
),
existing_modules as (
  select id, position, course_id from public.modules where course_id = (select id from course)
    and title in ('Design system & content', 'Supabase & delivery')
),
all_modules as (
  select * from modules
  union
  select * from existing_modules
),
first_module as (
  select id from all_modules order by position asc limit 1
),
second_module as (
  select id from all_modules order by position desc limit 1
)
insert into public.lessons (module_id, slug, title, position, content_path, estimated_minutes, published)
select fm.id, 'design-system', 'Waypoint design system', 1, 'lessons/waypoint-foundations/design-system.mdx', 20, true from first_module fm
union all
select fm.id, 'content-repo', 'MDX content + GitHub previews', 2, 'lessons/waypoint-foundations/content-repo.mdx', 18, true from first_module fm
union all
select sm.id, 'supabase-auth', 'Supabase auth, storage, and RLS', 3, 'lessons/waypoint-foundations/supabase-auth.mdx', 25, true from second_module sm
on conflict (module_id, slug) do nothing;

insert into public.live_sessions (course_id, title, starts_at, join_url, description)
select id, 'Weekly Instructor Standup', now() + interval '3 days', 'https://example.com/standup', 'Roadmap, blockers, and issue triage'
from public.courses where slug = 'waypoint-foundations'
on conflict (course_id, title) do nothing;

insert into public.live_sessions (course_id, title, starts_at, join_url, description)
select id, 'Learner Office Hours', now() + interval '5 days', 'https://example.com/office-hours', 'Code reviews and Supabase troubleshooting'
from public.courses where slug = 'waypoint-foundations'
on conflict (course_id, title) do nothing;
