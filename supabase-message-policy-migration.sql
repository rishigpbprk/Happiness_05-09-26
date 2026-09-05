-- Run this ONCE in Supabase SQL Editor if you already ran the original schema.
-- It lets each faculty member see messages addressed to them, including
-- messages awaiting moderation. Students still see only approved messages.

create policy "Faculty can read their own messages"
on public.messages for select
to authenticated
using (
  exists (
    select 1
    from public.faculty f
    where f.id = messages.faculty_id
      and lower(f.email) = lower(auth.jwt() ->> 'email')
  )
);
