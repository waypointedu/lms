create policy "Instructors can create weeks"
  on public.weeks
  for insert
  with check (
    exists (
      select 1 from public.course_instructors
      where course_instructors.course_id = weeks.course_id
        and course_instructors.user_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role_global = 'admin'
    )
  );

create policy "Instructors can update weeks"
  on public.weeks
  for update
  using (
    exists (
      select 1 from public.course_instructors
      where course_instructors.course_id = weeks.course_id
        and course_instructors.user_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role_global = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.course_instructors
      where course_instructors.course_id = weeks.course_id
        and course_instructors.user_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role_global = 'admin'
    )
  );

create policy "Instructors can delete weeks"
  on public.weeks
  for delete
  using (
    exists (
      select 1 from public.course_instructors
      where course_instructors.course_id = weeks.course_id
        and course_instructors.user_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role_global = 'admin'
    )
  );

create policy "Instructors can create content items"
  on public.content_items
  for insert
  with check (
    exists (
      select 1 from public.course_instructors
      where course_instructors.course_id = content_items.course_id
        and course_instructors.user_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role_global = 'admin'
    )
  );

create policy "Instructors can update content items"
  on public.content_items
  for update
  using (
    exists (
      select 1 from public.course_instructors
      where course_instructors.course_id = content_items.course_id
        and course_instructors.user_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role_global = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.course_instructors
      where course_instructors.course_id = content_items.course_id
        and course_instructors.user_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role_global = 'admin'
    )
  );

create policy "Instructors can delete content items"
  on public.content_items
  for delete
  using (
    exists (
      select 1 from public.course_instructors
      where course_instructors.course_id = content_items.course_id
        and course_instructors.user_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role_global = 'admin'
    )
  );
