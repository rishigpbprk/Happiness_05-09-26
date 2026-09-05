-- Add the two new ISE Lab Instructors to the existing production database.
insert into public.faculty (name, email, department, designation, photo_path, personal_message)
values
('Mrs. Pruthvi Sharath', 'pruthvis.ise@skit.org.in', 'Information Science & Engineering', 'Lab Instructor', '/assets/faculty/pruthvi-sharath.jpeg', 'Thank you for the patience, care, and encouragement you bring to every learning moment.'),
('Ms. Jahnavi M Gowda', 'jahnavim.ise@skit.org.in', 'Information Science & Engineering', 'Lab Instructor', '/assets/faculty/jahnavi-m-gowda.jpeg', 'Thank you for making every practical session a little clearer, warmer, and more memorable.')
on conflict (email) do update set
  name = excluded.name,
  department = excluded.department,
  designation = excluded.designation,
  photo_path = excluded.photo_path,
  personal_message = excluded.personal_message;
