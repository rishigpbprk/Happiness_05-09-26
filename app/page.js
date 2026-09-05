'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabase/browser';

const photoByEmail = {
  'raginikrishnaise@skit.org.in': '/assets/faculty/ragini-krishna.png',
  'pradheepaise@skit.org.in': '/assets/faculty/pradheepa-j.png',
  'yuvashricise@skit.org.in': '/assets/faculty/yuvashri-c.png',
  'sachindoddamaniise@skit.org.in': '/assets/faculty/sachin-s-doddamani.png',
  'pamidikiran.ise@skit.org.in': '/assets/faculty/kiran-p-kumar.png',
  'pruthvis.ise@skit.org.in': '/assets/faculty/pruthvi-sharath.jpeg',
  'jahnavim.ise@skit.org.in': '/assets/faculty/jahnavi-m-gowda.jpeg',
};

const fallbackFaculty = [
  { name: 'Mrs. Ragini Krishna', email: 'raginikrishnaise@skit.org.in', designation: 'Head of the Department', department: 'Information Science & Engineering', likes: 0, photo_path: photoByEmail['raginikrishnaise@skit.org.in'] },
  { name: 'Mrs. Pradheepa J', email: 'pradheepaise@skit.org.in', designation: 'Assistant Professor', department: 'Information Science & Engineering', likes: 0, photo_path: photoByEmail['pradheepaise@skit.org.in'] },
  { name: 'Mrs. Yuvashri C', email: 'yuvashricise@skit.org.in', designation: 'Assistant Professor', department: 'Information Science & Engineering', likes: 0, photo_path: photoByEmail['yuvashricise@skit.org.in'] },
  { name: 'Mr. Sachin S Doddamani', email: 'sachindoddamaniise@skit.org.in', designation: 'Assistant Professor', department: 'Information Science & Engineering', likes: 0, photo_path: photoByEmail['sachindoddamaniise@skit.org.in'] },
  { name: 'Mr. Kiran P Kumar', email: 'pamidikiran.ise@skit.org.in', designation: 'Assistant Professor', department: 'Information Science & Engineering', likes: 0, photo_path: photoByEmail['pamidikiran.ise@skit.org.in'] },
  { name: 'Mrs. Pruthvi Sharath', email: 'pruthvis.ise@skit.org.in', designation: 'Lab Instructor', department: 'Information Science & Engineering', likes: 0, photo_path: photoByEmail['pruthvis.ise@skit.org.in'] },
  { name: 'Ms. Jahnavi M Gowda', email: 'jahnavim.ise@skit.org.in', designation: 'Lab Instructor', department: 'Information Science & Engineering', likes: 0, photo_path: photoByEmail['jahnavim.ise@skit.org.in'] },
];

function withLocalPhoto(f) {
  return { ...f, photo_path: f.photo_path || photoByEmail[(f.email || '').toLowerCase()] || null };
}

function initials(name) {
  return name.split(' ').filter(Boolean).slice(-2).map((x) => x[0]).join('').toUpperCase();
}


const ROYLY_TEACHERS_DAY_TRIBUTE = `
As my final year comes to an end, I find myself looking back at the people who made this journey truly special. 🎓❤️

College gave us an education, but you gave us a family. 🏡

You were never just our teachers. 👩‍🏫👨‍🏫 You guided us when we were confused 🧭, encouraged us when we were tired 💪, corrected us when we went wrong 🌱, and celebrated our little victories with us. 🎉

And then there were all those moments that were never part of any syllabus — the laughter 😂, random conversations 💬, jokes 😄, teasing 🤭, scoldings 😅, and countless memories that made ISE feel like home. ❤️

As we prepare to leave these college gates and begin a new chapter 🌍✨, we may forget some exams, assignments and deadlines... but we'll never forget the people who made these years worth remembering. 🥹❤️

Thank you for believing in us, pushing us forward, putting up with us 😄, and helping us become better versions of ourselves. 🌟

Maybe that's what a great teacher does: They don't just teach us what to learn — they become a part of who we become. ❤️

So, from the bottom of my heart: Thank you for being our teachers, our mentors, our supporters, our companions — and most importantly, our family at college. 🤍🏡

Happy Teachers’ Day to the wonderful people who became much more than teachers! 🎉❤️

With a heart full of gratitude, happiness, joy and beautiful memories... 😊🥹✨

With Love,
Royly 💛🌿

Final Year • Information Science & Engineering 🎓💻
Sri Krishna Institute of Technology 🏫
`
export default function Home() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [screen, setScreen] = useState('landing');
  const [loginMode, setLoginMode] = useState(null);
  const [selected, setSelected] = useState(null);
  const [faculty, setFaculty] = useState(fallbackFaculty);
  const [likes, setLikes] = useState({});
  const [myLikes, setMyLikes] = useState(new Set());
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [facultyProfile, setFacultyProfile] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [messageText, setMessageText] = useState('');
  const [facultyEmail, setFacultyEmail] = useState('');
  const [facultyPassword, setFacultyPassword] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [surpriseOpen, setSurpriseOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get('auth_error');
    if (authError === 'skit_only') setError('This celebration is exclusively for verified @skit.org.in accounts.');
    if (authError === 'oauth_failed') setError('Google sign-in could not be completed. Please try again.');
    if (authError) window.history.replaceState({}, '', window.location.pathname);

    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) await establishUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await establishUser(session.user);
      } else {
        setUser(null);
        setRole(null);
        setFacultyProfile(null);
        setSelected(null);
        setScreen('landing');
        setSurpriseOpen(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!user || !role) return;
    loadCelebration();
  }, [user, role]);

  async function establishUser(authUser) {
    setUser(authUser);
    const email = authUser?.email?.toLowerCase() || '';

    const { data: matchedFaculty } = await supabase
      .from('faculty')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (matchedFaculty) {
      const profileWithPhoto = withLocalPhoto(matchedFaculty);
      setRole('faculty');
      setFacultyProfile(profileWithPhoto);
      setSelected(profileWithPhoto);
      setScreen('profile');
      setSurpriseOpen(true);
    } else {
      setRole('student');
      setFacultyProfile(null);
      setScreen('gallery');
    }
  }

  async function loadCelebration() {
    setLoading(true);
    const [{ data: facultyData, error: facultyError }, { data: likeData, error: likeError }, { data: messageData }] = await Promise.all([
      supabase.from('faculty').select('*').order('created_at'),
      supabase.from('likes').select('user_id, faculty_id'),
      supabase.from('messages').select('id, faculty_id, message, student_name, created_at, approved').eq('approved', true).order('created_at', { ascending: false }).limit(100),
    ]);

    if (!facultyError && facultyData?.length) setFaculty(facultyData.map(withLocalPhoto));
    if (facultyError || likeError) setError('The celebration database is not configured yet. Run the supplied Supabase SQL setup first.');

    const counts = {};
    const mine = new Set();
    (likeData || []).forEach((like) => {
      counts[like.faculty_id] = (counts[like.faculty_id] || 0) + 1;
      if (like.user_id === user.id) mine.add(like.faculty_id);
    });
    setLikes(counts);
    setMyLikes(mine);
    setMessages(messageData || []);
    setLoading(false);
  }

  async function signInStudent() {
    setError('');
    setNotice('');
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    });
    if (signInError) setError(signInError.message);
  }

  async function signInFaculty(e) {
    e.preventDefault();
    setError('');
    setNotice('');

    const email = facultyEmail.trim().toLowerCase();
    if (!email || !facultyPassword) {
      setError('Please enter your faculty email and password.');
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: facultyPassword,
    });

    if (signInError) {
      setError('Faculty login failed. Please check your faculty email and password.');
      return;
    }

    const { data: matchedFaculty } = await supabase
      .from('faculty')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (!matchedFaculty) {
      await supabase.auth.signOut();
      setError('This account is not registered as an ISE faculty account.');
      return;
    }

    setFacultyPassword('');
    await establishUser(data.user);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSelected(null);
    setFacultyProfile(null);
    setRole(null);
    setLoginMode(null);
    setFacultyEmail('');
    setFacultyPassword('');
    setNotice('');
    setSurpriseOpen(false);
  }

  async function toggleLike(f) {
    if (!user) return setScreen('login');
    const isLiked = myLikes.has(f.id);
    setNotice('');

    if (isLiked) {
      const { error: removeError } = await supabase.from('likes').delete().eq('faculty_id', f.id).eq('user_id', user.id);
      if (removeError) return setNotice('Could not remove appreciation. Please try again.');
      setMyLikes((old) => { const next = new Set(old); next.delete(f.id); return next; });
      setLikes((old) => ({ ...old, [f.id]: Math.max(0, (old[f.id] || 0) - 1) }));
    } else {
      const { error: addError } = await supabase.from('likes').insert({ faculty_id: f.id, user_id: user.id });
      if (addError && addError.code !== '23505') return setNotice('Could not add appreciation. Please try again.');
      setMyLikes((old) => new Set(old).add(f.id));
      setLikes((old) => ({ ...old, [f.id]: (old[f.id] || 0) + 1 }));
    }
  }

  async function sendMessage() {
    if (!selected || !messageText.trim() || !user) return;
    setSending(true);
    const { error: sendError } = await supabase.from('messages').insert({
      user_id: user.id,
      faculty_id: selected.id,
      message: messageText.trim(),
      approved: true,
      student_name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'A student',
    });
    setSending(false);
    if (sendError) {
      setNotice('Your message could not be sent. Please try again.');
      return;
    }
    setMessageText('');
    setNotice('Your appreciation is live on the Teachers’ Day wall. ❤️');
  }

  const facultyMessages = selected ? messages.filter((m) => m.faculty_id === selected.id) : [];

  return <main className="site">
    <div className="grain" />
    <header className="topbar">
      <div className="brand"><img src="/assets/skit-logo.png" alt="SKIT" /><div><b>SKIT</b><span>Information Science & Engineering</span></div></div>
      <div className="header-right"><img className="jubilee" src="/assets/silver-jubilee.png" alt="SKIT Silver Jubilee" />{user && <button className="ghost small" onClick={signOut}>Sign out</button>}</div>
    </header>

    {error && <div className="global-error">{error}<button onClick={() => setError('')}>×</button></div>}

     <section className="teachers-day-masthead">
       <div className="td-spark td-spark-a">✦</div>
       <div className="td-spark td-spark-b">✧</div>
       <div className="td-kicker">TO THE GUIDES • TO THE MENTORS • TO OUR FAMILY</div>
       <h2><span>HAPPY</span><em>TEACHERS DAY......!!!</em></h2>
       <p>Thank you for being a part of our journey. ❤️</p>
     </section>

    {screen === 'landing' && <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow">SKIT • ISE • TEACHERS’ DAY</div>
        <h1>For the people<br/><em>behind our journey.</em></h1>
        <p>Every lesson becomes a memory. Every mentor leaves a mark. This little corner of SKIT ISE is dedicated to the people who make the journey meaningful.</p>
        <button className="primary" onClick={() => setScreen(user ? (role === 'faculty' ? 'profile' : 'gallery') : 'login')}>Enter the celebration <span>↗</span></button>
        <div className="micro">Students can use any Google account • Faculty use their dedicated login</div>
      </div>
      <div className="hero-art">
        <div className="orbit orbit1"/><div className="orbit orbit2"/>
        <div className="seal"><img src="/assets/silver-jubilee.png" alt="25 years"/></div>
        <div className="quote">“A great teacher doesn’t just teach. They make us believe we can.”</div>
      </div>
    </section>}

    {screen === 'login' && <section className="center-screen">
      <div className="login-card login-card-wide">
        <img className="login-logo" src="/assets/skit-logo.png" alt="SKIT logo" />
        <div className="eyebrow">WELCOME, SKIT FAMILY</div>
        <h2>Choose your<br/><em>way in.</em></h2>
        <p>We’ve created separate sign-in experiences for students and ISE faculty.</p>

        {!loginMode && <div className="login-choices">
          <button className="login-choice" onClick={() => setLoginMode('student')}>
            <span className="choice-icon">G</span>
            <span><b>I'm a Student</b><small>Continue with your Google account</small></span>
            <strong>→</strong>
          </button>
          <button className="login-choice faculty-choice" onClick={() => setLoginMode('faculty')}>
            <span className="choice-icon">✦</span>
            <span><b>I'm a Faculty Member</b><small>Use your faculty email and password</small></span>
            <strong>→</strong>
          </button>
        </div>}

        {loginMode === 'student' && <div className="login-panel">
          <div className="panel-label">STUDENT ACCESS</div>
          <h3>Sign in with Google</h3>
          <p>Only verified <b>@skit.org.in</b> accounts are allowed.</p>
          <button className="google" onClick={signInStudent}><span className="g">G</span> Continue with Google</button>
          <button className="back" onClick={() => setLoginMode(null)}>← Choose another login</button>
        </div>}

        {loginMode === 'faculty' && <form className="login-panel" onSubmit={signInFaculty}>
          <div className="panel-label">FACULTY ACCESS</div>
          <h3>Your special surprise awaits.</h3>
          <p>Sign in using the faculty email and password provided to you.</p>
          <label className="field-label">Faculty email</label>
          <input className="auth-input" type="email" value={facultyEmail} onChange={(e) => setFacultyEmail(e.target.value)} placeholder="name@skit.org.in" autoComplete="username" />
          <label className="field-label">Password</label>
          <input className="auth-input" type="password" value={facultyPassword} onChange={(e) => setFacultyPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" />
          <button className="primary" type="submit">Open my surprise <span>↗</span></button>
          <button className="back" type="button" onClick={() => setLoginMode(null)}>← Choose another login</button>
        </form>}

        <div className="secure">🔒 Secure SKIT Teachers’ Day access</div>
        <button className="back" onClick={() => { setLoginMode(null); setScreen('landing'); }}>← Back</button>
      </div>
    </section>}

    {screen === 'gallery' && <section className="gallery-section">
      <div className="section-head"><div><div className="eyebrow">THE PEOPLE WHO GUIDE US</div><h2>Our <em>mentors.</em></h2><p className="signed-in">Signed in as <b>{user?.email}</b> • {role === 'faculty' ? 'Faculty access' : 'Student access'}</p></div>{role === 'student' && <button className="ghost" onClick={() => setScreen('landing')}>Home</button>}</div>
      {loading && <div className="notice">Loading the SKIT appreciation wall…</div>}
      {notice && <div className="notice">{notice}</div>}
      <div className="cards">{faculty.map((f, i) => <article className="faculty-card" key={f.id || f.email} onClick={() => { setSelected(f); setScreen('profile'); }}>
        <div className={`photo-placeholder ${f.email === 'raginikrishnaise@skit.org.in' ? 'faculty-photo-ragini' : f.email === 'pradheepaise@skit.org.in' ? 'faculty-photo-pradheepa' : f.email === 'yuvashricise@skit.org.in' ? 'faculty-photo-yuvashri' : f.email === 'sachindoddamaniise@skit.org.in' ? 'faculty-photo-sachin' : f.email === 'pamidikiran.ise@skit.org.in' ? 'faculty-photo-kiran' : f.email === 'pruthvis.ise@skit.org.in' ? 'faculty-photo-pruthvi' : 'faculty-photo-jahnavi'}`}>{f.photo_path ? <><img src={f.photo_path} alt={f.name} /><span className="photo-wash" /><span className="view-profile">View tribute ↗</span></> : <><div className="initials">{initials(f.name)}</div><span>PHOTO COMING SOON</span></>}</div>
        <div className="card-body"><div className="num">0{i + 1}</div><h3>{f.name}</h3><p>{f.designation}</p><div className="card-bottom"><span>ISE</span><button onClick={(e) => { e.stopPropagation(); toggleLike(f); }} className={myLikes.has(f.id) ? 'heart liked' : 'heart'}>♥ {likes[f.id] || 0}</button></div></div>
      </article>)}</div>
      <div className="wall"><div className="eyebrow">ISE APPRECIATION WALL</div><h3>Seven mentors.<br/><em>Countless little impacts.</em></h3><p>Open a profile to celebrate a mentor and leave a message from the SKIT family.</p></div>
    </section>}

    {screen === 'profile' && selected && <section className="profile-section">
      {role === 'student' && <button className="back-link" onClick={() => setScreen('gallery')}>← Back to mentors</button>}
      {role === 'faculty' && surpriseOpen && <div className="surprise-overlay">
        <div className="surprise-glow" />
        <div className="surprise-card">
          <div className="surprise-mark">✦</div>
          <div className="eyebrow">SKIT ISE • TEACHERS’ DAY 2026</div>
          <h2>A little something<br/><em>from your students.</em></h2>
          <p>Take a moment. This page was made especially for you.</p>
          <button className="primary surprise-button" onClick={() => setSurpriseOpen(false)}>Open your surprise <span>↗</span></button>
          <small>05 · 09 · 2026</small>
        </div>
      </div>}
      <div className="profile-grid">
        <div className={`big-photo ${selected.email === 'raginikrishnaise@skit.org.in' ? 'faculty-photo-ragini' : selected.email === 'pradheepaise@skit.org.in' ? 'faculty-photo-pradheepa' : selected.email === 'yuvashricise@skit.org.in' ? 'faculty-photo-yuvashri' : selected.email === 'sachindoddamaniise@skit.org.in' ? 'faculty-photo-sachin' : selected.email === 'pamidikiran.ise@skit.org.in' ? 'faculty-photo-kiran' : selected.email === 'pruthvis.ise@skit.org.in' ? 'faculty-photo-pruthvi' : 'faculty-photo-jahnavi'}`}>{selected.photo_path ? <><img src={selected.photo_path} alt={selected.name} /><span className="photo-wash" /><div className="portrait-label"><span>SKIT · ISE</span><strong>Teachers’ Day 2026</strong></div><div className="portrait-index">05.09.26</div></> : <><div className="initials">{initials(selected.name)}</div><span>YOUR PHOTO WILL APPEAR HERE</span></>}</div>
        <div className="profile-copy"><div className="eyebrow">{role === 'faculty' ? 'WELCOME, THIS ONE IS FOR YOU' : 'A SPECIAL MESSAGE FOR YOU'}</div><h2>Thank you for<br/><em>believing in us.</em></h2><div className="profile-meta"><h3>{selected.name}</h3><p>{selected.designation} • {selected.department}</p></div><blockquote>“{selected.personal_message || 'The best teachers leave footprints in our hearts long after the classroom is empty.'}”</blockquote>{role === 'student' ? <div className="appreciate"><button className={myLikes.has(selected.id) ? 'primary liked-btn' : 'primary'} onClick={() => toggleLike(selected)}>♥ {myLikes.has(selected.id) ? 'Appreciated' : 'Appreciate'} <span>{likes[selected.id] || 0}</span></button><span>from the SKIT family</span></div> : <div className="faculty-appreciation"><div className="faculty-heart">♥</div><div><strong>{likes[selected.id] || 0}</strong><span>students appreciated you</span></div></div>}</div>
      </div>
      {role === 'student' && <div className="message-box"><div><div className="eyebrow">LEAVE A NOTE</div><h3>Say something from the heart.</h3><p>Your message will appear instantly on the appreciation wall. ❤️</p></div><textarea value={messageText} onChange={(e) => setMessageText(e.target.value.slice(0, 500))} placeholder="Write a short appreciation message…"/><button className="primary" disabled={sending || !messageText.trim()} onClick={sendMessage}>{sending ? 'Sending…' : 'Send appreciation ♥'}</button></div>}
      <div className={role === 'faculty' ? 'messages-wall faculty-messages-wall' : 'messages-wall'}><div className="eyebrow">{role === 'faculty' ? 'MESSAGES FROM YOUR STUDENTS' : 'APPRECIATION NOTES'}</div>{facultyMessages.length ? facultyMessages.map((m) => <div className="message-card" key={m.id}><span>“</span><p>{m.message}</p><small>{m.student_name ? `From ${m.student_name} • Student` : 'From a student • Student'}</small></div>) : <p className="empty-messages">{role === 'faculty' ? 'Your students’ messages will appear here once they begin leaving their notes.' : `Be the first to leave a note for ${selected.name.split(' ')[1] || 'your mentor'}.`}</p>}</div>
    </section>}

          

        <section className="family-signature">
      <div className="family-signature__quote">“We came to college looking for a future. 🎓 Somewhere along the way, we found a family. ❤️🏡”</div>
      <div className="family-signature__by">— With Love, Royly 💛🌿✨</div>
    </section>

<footer><span>© SKIT • Information Science & Engineering</span><span>Teachers’ Day • 05.09.2026</span></footer>
  

</main>;
}
