-- SKIT ISE Teachers' Day database
-- Run this in Supabase Dashboard -> SQL Editor.

create table if not exists public.faculty (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  department text not null default 'Information Science & Engineering',
  designation text not null,
  photo_path text,
  personal_message text not null default 'Thank you for believing in us.',
  created_at timestamptz not null default now()
);

create table if not exists public.likes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, faculty_id)
);

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  message text not null check (char_length(message) between 1 and 500),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.faculty enable row level security;
alter table public.likes enable row level security;
alter table public.messages enable row level security;

create policy "Authenticated users can read faculty"
on public.faculty for select
to authenticated using (true);

create policy "Authenticated users can read likes"
on public.likes for select
to authenticated using (true);

create policy "Authenticated users can like"
on public.likes for insert
to authenticated with check (auth.uid() = user_id);

create policy "Users can remove their own like"
on public.likes for delete
to authenticated using (auth.uid() = user_id);

create policy "Authenticated users can read approved messages"
on public.messages for select
to authenticated using (approved = true or auth.uid() = user_id);

create policy "Authenticated users can submit messages"
on public.messages for insert
to authenticated with check (auth.uid() = user_id);

insert into public.faculty (name, email, department, designation, personal_message)
values
('Mrs. Ragini Krishna', 'raginikrishnaise@skit.org.in', 'Information Science & Engineering', 'Head of the Department', 'Thank you for guiding us, challenging us, and believing in us.'),
('Mrs. Pradheepa J', 'pradheepaise@skit.org.in', 'Information Science & Engineering', 'Assistant Professor', 'Thank you for every lesson, every correction, and every encouragement.'),
('Mrs. Yuvashri C', 'yuvashricise@skit.org.in', 'Information Science & Engineering', 'Assistant Professor', 'Thank you for making learning feel possible, meaningful, and memorable.'),
('Mr. Sachin S Doddamani', 'sachindoddamaniise@skit.org.in', 'Information Science & Engineering', 'Assistant Professor', 'Thank you for sharing your knowledge and helping us grow with confidence.'),
('Mr. Kiran P Kumar', 'pamidikiran.ise@skit.org.in', 'Information Science & Engineering', 'Assistant Professor', 'Thank you for being a mentor whose lessons stay with us beyond the classroom.')
on conflict (email) do update set name = excluded.name, designation = excluded.designation, department = excluded.department, personal_message = excluded.personal_message;


-- Each faculty member can read all messages addressed to their own profile,
-- including messages awaiting public moderation. Students still see only approved messages.
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


-- Store the student's display name with each appreciation message.
alter table public.messages
add column if not exists student_name text;
