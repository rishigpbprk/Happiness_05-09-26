-- Run this ONCE in Supabase SQL Editor.
-- This makes existing student appreciation messages visible immediately.
-- New messages are already inserted with approved = true by the updated app.

update public.messages
set approved = true
where approved = false;
