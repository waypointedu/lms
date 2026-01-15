-- Phase 3 & 4 migration: templates, course instances, and gradebook enhancements

-- Add an is_template column to courses if it doesn't already exist
alter table public.courses
  add column if not exists is_template boolean not null default false;

-- Create course_instances table for scheduled offerings
create table if not exists public.course_instances (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses(id) on delete cascade,
  slug text unique not null,
  title text not null,
  term text,
  start_date date,
  end_date date,
  created_at timestamp with time zone default now()
);

-- Add course_instance_id column to enrollments to link enrollments to a specific instance
alter table public.enrollments
  add column if not exists course_instance_id uuid references public.course_instances(id);

-- Add grade column to enrollments for numeric grades
alter table public.enrollments
  add column if not exists grade numeric;

-- Enable Row Level Security on course_instances
alter table public.course_instances enable row level security;

-- Drop existing policies if they exist, then create new RLS policies
drop policy if exists "course_instances_select_enrolled" on public.course_instances;
drop policy if exists "course_instances_admin_write" on public.course_instances;

-- Allow enrolled students to read their course instances and admins/instructors to read all
create policy "course_instances_select_enrolled" on public.course_instances
  for select using (
    exists (
      select 1 from public.enrollments e
      where e.course_instance_id = course_instances.id
        and e.user_id = auth.uid()
    )
    or (
      exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role in ('admin','instructor')
      )
    )
  );

-- Allow admin and instructor roles to insert, update, and delete course instances
create policy "course_instances_admin_write" on public.course_instances
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin','instructor')
    )
  );
