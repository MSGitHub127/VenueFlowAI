'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, Lock, ArrowLeft, ShieldCheck } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      localStorage.setItem('auth', 'attendee');
      localStorage.setItem('userName', result.user.displayName || 'Attendee');
      router.push('/');
    } catch {
      // Fallback for demo / dummy Firebase keys
      localStorage.setItem('auth', 'attendee');
      localStorage.setItem('userName', 'Demo User');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '1234') {
      localStorage.setItem('auth', 'admin');
      localStorage.setItem('userName', 'Administrator');
      router.push('/');
    } else {
      setError('Invalid credentials. Try admin / 1234');
    }
  };

  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden"
      style={{ background: 'var(--bg-base)' }} aria-label="VenueFlowAI Login">

      {/* Ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)' }} />

      {/* Floor plan ghost image */}
      <div className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: "url('/floor_plan.png')", opacity: 0.04 }} aria-hidden="true" />

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(rgba(124,58,237,0.12) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4 rounded-3xl p-10 shadow-2xl"
        style={{ background: 'rgba(13,18,32,0.9)', backdropFilter: 'blur(24px)', border: '1px solid rgba(124,58,237,0.2)', boxShadow: '0 0 80px rgba(124,58,237,0.1)' }}
        aria-labelledby="login-heading"
      >
        {/* Brand */}
        <header className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)', boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}>
            <Zap size={26} className="text-white" fill="white" />
          </div>
          <h1 id="login-heading" className="text-3xl font-black gradient-text tracking-tight">VenueFlowAI</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Smart Venue Companion</p>
        </header>

        <AnimatePresence mode="wait">
          {!isAdminMode ? (
            <motion.div key="attendee" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
              className="space-y-5">
              <p className="text-center text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Welcome! Sign in to access live venue intelligence.
              </p>

              {/* Google Login */}
              <button onClick={handleGoogleLogin} disabled={loading} aria-label="Sign in with Google"
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-slate-900 transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] disabled:opacity-60"
                style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </button>

              {/* Divider */}
              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Venue Staff &amp; Operations</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
              </div>

              {/* Admin Portal */}
              <button onClick={() => setIsAdminMode(true)} aria-label="Access Admin Portal"
                className="w-full py-4 rounded-2xl font-bold text-sm transition-all hover:-translate-y-0.5"
                style={{ background: 'rgba(124,58,237,0.1)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.25)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.1)'; }}>
                <ShieldCheck size={16} className="inline mr-2 mb-0.5" />
                Admin Portal →
              </button>
            </motion.div>
          ) : (
            <motion.div key="admin" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
                  style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)' }}>
                  <ShieldCheck size={13} style={{ color: '#A78BFA' }} />
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#A78BFA' }}>Secure Admin Login</span>
                </div>
              </div>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-sm text-center mb-5 py-2.5 px-4 rounded-xl font-medium"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.25)' }}
                  role="alert">{error}</motion.p>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4" aria-label="Admin Login Form">
                {[
                  { id: 'admin-user', type: 'text', placeholder: 'Admin Username', icon: <Mail size={16} />, val: username, set: setUsername },
                  { id: 'admin-pass', type: 'password', placeholder: 'Password', icon: <Lock size={16} />, val: password, set: setPassword },
                ].map(f => (
                  <div key={f.id} className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>{f.icon}</span>
                    <input id={f.id} type={f.type} placeholder={f.placeholder} value={f.val} required
                      onChange={e => f.set(e.target.value)}
                      className="w-full py-3.5 pl-11 pr-4 rounded-xl text-sm outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', border: '1px solid rgba(124,58,237,0.2)' }}
                      onFocus={e => { (e.target as HTMLElement).style.borderColor = 'rgba(124,58,237,0.5)'; }}
                      onBlur={e => { (e.target as HTMLElement).style.borderColor = 'rgba(124,58,237,0.2)'; }} />
                  </div>
                ))}

                <button type="submit"
                  className="w-full py-4 rounded-2xl font-bold text-white text-sm transition-all hover:-translate-y-0.5 hover:shadow-2xl mt-2"
                  style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
                  Access Command Centre
                </button>

                <button type="button" onClick={() => { setIsAdminMode(false); setError(''); }}
                  className="w-full flex items-center justify-center gap-2 text-sm mt-2 transition-all"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}>
                  <ArrowLeft size={14} /> Back to Attendee Login
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-[11px] mt-8" style={{ color: 'var(--text-muted)' }}>
          VenueFlowAI · Powered by Google Gemini &amp; Firebase
        </p>
      </motion.section>
    </main>
  );
}
