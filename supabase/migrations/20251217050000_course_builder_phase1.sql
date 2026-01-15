-- Add course builder metadata for phase 1
alter table public.courses add column if not exists topic text;

create table if not exists public.course_prerequisites (
  course_id uuid references public.courses(id) on delete cascade,
  prerequisite_course_id uuid references public.courses(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (course_id, prerequisite_course_id)
);

create table if not exists public.course_pathways (
  course_id uuid references public.courses(id) on delete cascade,
  pathway text not null,
  created_at timestamptz default now(),
  primary key (course_id, pathway)
);
