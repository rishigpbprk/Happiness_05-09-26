-- Run this ONCE in Supabase SQL Editor for an existing project.
-- It stores the student's display name alongside each appreciation.

alter table public.messages
add column if not exists student_name text;
