import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../lib/supabase/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';

  if (!code) return NextResponse.redirect(`${origin}/?auth_error=missing_code`);

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) return NextResponse.redirect(`${origin}/?auth_error=oauth_failed`);

  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email?.toLowerCase() || '';

  // Student Google login accepts any Google account.
  // Faculty accounts remain on the dedicated email/password path.
  if (!user?.email) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/?auth_error=email_required`);
  }

  const { data: faculty } = await supabase
    .from('faculty')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (faculty) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/?auth_error=faculty_use_login`);
  }

  return NextResponse.redirect(`${origin}${next.startsWith('/') ? next : '/'}`);
}
