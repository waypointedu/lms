-- Seed data for the Waypoint Learning Pathway (Year One)
with course as (
  insert into public.courses (slug, title, title_es, description, language, published, duration_weeks, pathway)
  values (
    'year-one-biblical-formation',
    'Year One / Certificate in Biblical Formation',
    'Año Uno / Certificado en Formación Bíblica',
    'A tuition-free pathway through Scripture, doctrine, culture, and mission with weekly checkpoints and a final capstone conversation.',
    'en',
    true,
    32,
    'biblical-formation'
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    title_es = excluded.title_es,
    duration_weeks = excluded.duration_weeks,
    pathway = excluded.pathway,
    published = excluded.published
  returning id
)
select * from course;

with course as (
  select id from public.courses where slug = 'year-one-biblical-formation'
),
modules as (
  insert into public.modules (course_id, title, position, summary)
  select id, mod.title, mod.position, mod.summary
  from course,
  (values
    ('Story of Scripture', 1, 'Walk the biblical narrative and practice reading together.'),
    ('Doctrine & Discipleship', 2, 'Anchor core beliefs and weekly rhythms of prayer, Sabbath, and community.'),
    ('Culture & Mission', 3, 'Discern culture with wisdom and design mission experiments.'),
    ('Capstone Readiness', 4, 'Prepare for the capstone conversation and portfolio.')
  ) as mod(title, position, summary)
  on conflict do nothing
  returning id, title, position, course_id
),
existing_modules as (
  select id, title, position, course_id from public.modules where course_id = (select id from course)
    and title in ('Story of Scripture','Doctrine & Discipleship','Culture & Mission','Capstone Readiness')
),
all_modules as (
  select * from modules
  union
  select * from existing_modules
),
scripture as (select id from all_modules where title = 'Story of Scripture' limit 1),
doctrine as (select id from all_modules where title = 'Doctrine & Discipleship' limit 1),
culture as (select id from all_modules where title = 'Culture & Mission' limit 1),
capstone as (select id from all_modules where title = 'Capstone Readiness' limit 1)
insert into public.lessons (module_id, slug, title, position, content_path, estimated_minutes, published)
select scripture.id, 'scripture-story', 'Living into the biblical story', 1, 'lessons/year-one-biblical-formation/scripture-story.mdx', 25, true from scripture
union all
select scripture.id, 'gospels-community', 'Reading the Gospels in community', 2, 'lessons/year-one-biblical-formation/gospels-community.mdx', 22, true from scripture
union all
select doctrine.id, 'doctrine-basics', 'Core doctrines for Year One', 1, 'lessons/year-one-biblical-formation/doctrine-basics.mdx', 28, true from doctrine
union all
select doctrine.id, 'formation-rhythms', 'Prayer, Sabbath, and community rhythms', 2, 'lessons/year-one-biblical-formation/formation-rhythms.mdx', 24, true from doctrine
union all
select culture.id, 'culture-listening', 'Listening to culture with wisdom', 1, 'lessons/year-one-biblical-formation/culture-listening.mdx', 26, true from culture
union all
select culture.id, 'mission-practice', 'Everyday mission experiments', 2, 'lessons/year-one-biblical-formation/mission-practice.mdx', 30, true from culture
union all
select capstone.id, 'capstone-prep', 'Preparing for your capstone conversation', 1, 'lessons/year-one-biblical-formation/capstone-prep.mdx', 18, true from capstone
union all
select capstone.id, 'capstone-testimony', 'Sharing your story and testimony', 2, 'lessons/year-one-biblical-formation/capstone-testimony.mdx', 18, true from capstone
on conflict (module_id, slug) do nothing;

-- Weekly checkpoint plan
with course as (select id from public.courses where slug = 'year-one-biblical-formation')
insert into public.checkpoints (course_id, title, week_number, due_on, requirements, status)
select course.id, 'Week 1: Story of Scripture', 1, current_date + interval '7 days', '["Read Genesis 1-3 together","Submit a reflection on creation and vocation"]'::jsonb, 'published' from course
union all
select course.id, 'Week 4: Practicing Sabbath', 4, current_date + interval '28 days', '["Keep one Sabbath day and record your experience","Share a prayer rhythm plan with your peer group"]'::jsonb, 'published' from course
union all
select course.id, 'Week 8: Culture listening lab', 8, current_date + interval '56 days', '["Interview a neighbor about hope and meaning","Post a 2-minute voice note with insights"]'::jsonb, 'published' from course
union all
select course.id, 'Capstone readiness', 12, current_date + interval '84 days', '["Schedule a capstone slot","Upload your testimony outline","Tag your assigned faculty reviewer"]'::jsonb, 'published' from course
on conflict (course_id, week_number) do update set
  title = excluded.title,
  due_on = excluded.due_on,
  requirements = excluded.requirements,
  status = excluded.status;

insert into public.live_sessions (course_id, title, starts_at, join_url, description)
select id, 'Weekly cohort circle', now() + interval '3 days', 'https://example.com/cohort-circle', '60-minute guided discussion on the current checkpoint.'
from public.courses where slug = 'year-one-biblical-formation'
on conflict (course_id, title) do nothing;

insert into public.live_sessions (course_id, title, starts_at, join_url, description)
select id, 'Faculty office hours', now() + interval '5 days', 'https://example.com/office-hours', 'Drop-in questions about Scripture readings, checkpoints, and capstone prep.'
from public.courses where slug = 'year-one-biblical-formation'
on conflict (course_id, title) do nothing;
