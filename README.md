# SKIT ISE Teachers' Day — Prototype

A cinematic Teachers' Day experience for Sri Krishna Institute of Technology, Information Science & Engineering.

## Included now
- Premium responsive landing page
- SKIT college + Silver Jubilee branding
- Faculty gallery with the 7 supplied faculty records
- Faculty profile/reveal screen
- Interactive like buttons (prototype/local state)
- Appreciation message UI
- Google Workspace login screen (currently demo mode)
- Placeholder photo areas for later faculty uploads

## Run locally
Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Next production steps
1. Connect Google OAuth and enforce verified `@skit.org.in` accounts server-side.
2. Connect Supabase Auth/DB/Storage.
3. Add faculty photos.
4. Add unique like constraints and message moderation.
5. Deploy to Vercel.

Do not put Google client secrets or Supabase service-role keys in client-side code.


## Dual login setup

This version uses two authentication paths:

- Students: Google OAuth, restricted by the application to verified `@skit.org.in` accounts.
- Faculty: Supabase email/password accounts. Faculty emails must match a row in `public.faculty`.

### Creating the seven faculty accounts

In Supabase Dashboard:

1. Open **Authentication -> Users**.
2. Choose **Add user** / **Create user**.
3. Create one account for each faculty email already present in `public.faculty`.
4. Set a temporary password for each account.
5. Enable/confirm the user's email when the dashboard offers that option.
6. Give each faculty member their own temporary credentials and ask them not to share them.

Faculty emails:

- `raginikrishnaise@skit.org.in`
- `pradheepaise@skit.org.in`
- `yuvashricise@skit.org.in`
- `sachindoddamaniise@skit.org.in`
- `pamidikiran.ise@skit.org.in`
- `pruthvis.ise@skit.org.in`
- `jahnavim.ise@skit.org.in`

Do not store faculty passwords in the `faculty` table or source code. Supabase Auth handles password storage.

The faculty login rejects any password-authenticated account whose email is not present in the faculty table. Google OAuth is also rejected for faculty emails so the two entry paths remain distinct.


## Teachers’ Day Tribute
The site includes the final-year student tribute from Royly, with the warm family-oriented Teachers’ Day message and closing quote.


The Royly Teachers’ Day tribute uses the shorter final-year version designed to be heartfelt without feeling lengthy.


## Message visibility fix
Run `supabase-message-live-migration.sql` once in Supabase SQL Editor. The app now marks new student appreciation messages as approved immediately, so they appear on the faculty and student appreciation walls without a moderation delay.


## Student names + Google login
Run `supabase-student-name-migration.sql` once in Supabase SQL Editor if the database already exists. New messages store the student's Google display name and show it on the appreciation wall. Student Google login now accepts any Google account; faculty emails are still routed to the faculty email/password login.

## Added two Lab Instructors

Run `supabase-add-two-faculty.sql` once in Supabase SQL Editor to add:
- Mrs. Pruthvi Sharath — `pruthvis.ise@skit.org.in` — Lab Instructor
- Ms. Jahnavi M Gowda — `jahnavim.ise@skit.org.in` — Lab Instructor

Their portraits are included in `public/assets/faculty/`. Create their Supabase Auth email/password accounts separately; passwords are never stored in source code or the faculty table.
