import { useState } from 'react'
import { supabase } from './supabase'

const T = {
  teal:   "#0d9488",
  tealD:  "#0f766e",
  ink:    "#0f172a",
  ink2:   "#334155",
  ink3:   "#64748b",
  ink4:   "#94a3b8",
  border: "#e2e8f2",
  bg:     "#f6f8fb",
  white:  "#ffffff",
  rose:   "#e11d48",
}

export default function Auth({ initialMode = 'login', onBack, onAuth, onLegal }) {
  const [mode, setMode]         = useState(initialMode)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)
  const [consent, setConsent]   = useState(false)
  const [consent2, setConsent2] = useState(false)

  const inp = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: `1.5px solid ${T.border}`, fontFamily: "'DM Sans',sans-serif",
    fontSize: 14, color: T.ink, background: T.white, boxSizing: 'border-box',
  }

  const handleSubmit = async () => {
    setError('')
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields.'); return }
    if (mode === 'signup' && !name.trim()) { setError('Please enter your name.'); return }
    if (mode === 'signup' && !consent) { setError('Please confirm you are the parent or legal guardian to continue.'); return }
    if (mode === 'signup' && !consent2) { setError('Please agree to the Privacy Policy and Terms of Service to continue.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
        onAuth && onAuth()
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { data: { full_name: name.trim() } }
        })
        if (error) throw error
        if (data.user) {
          await supabase.from('families').upsert({ id: data.user.id, email: email.trim(), name: name.trim() })
        }
        if (data.session) { onAuth && onAuth() }
        else { setDone(true) }
      }
    } catch (e) {
      if (e.message?.includes('Invalid login')) setError('Incorrect email or password.')
      else if (e.message?.includes('already registered')) setError('Account exists. Try logging in.')
      else setError(e.message || 'Something went wrong. Try again.')
    } finally { setLoading(false) }
  }

  const switchMode = (m) => { setMode(m); setError(''); setEmail(''); setPassword(''); setName(''); setConsent(false); setConsent2(false) }

  if (done) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0c1a2e,#1e3a5f)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: T.white, borderRadius: 20, padding: '40px 36px', maxWidth: 440, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
        <h2 style={{ margin: '0 0 10px', fontSize: 24, fontWeight: 800, color: T.ink, fontFamily: "'DM Sans',sans-serif" }}>Check your inbox</h2>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: T.ink3, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6 }}>
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
        </p>
        <button onClick={() => { setDone(false); switchMode('login') }} style={{ width: '100%', padding: 12, background: 'transparent', border: `1.5px solid ${T.border}`, borderRadius: 10, color: T.ink2, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          Back to log in
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0c1a2e,#1e3a5f)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        input:focus { outline:none; border-color:${T.teal}!important; box-shadow:0 0 0 3px ${T.teal}20!important; }
        @media(max-width:640px){ input { font-size:16px!important; } }
      `}</style>

      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Back link */}
        {onBack && (
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>
            ← Back to Readily
          </button>
        )}

        <div style={{ background: T.white, borderRadius: 20, padding: '36px 32px', boxShadow: '0 8px 40px rgba(0,0,0,0.25)' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: T.tealD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
            <span style={{ fontSize: 18, fontWeight: 800, color: T.ink, letterSpacing: '-0.02em' }}>Readily</span>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, background: T.bg, borderRadius: 10, padding: 4, border: `1px solid ${T.border}`, marginBottom: 24 }}>
            {[['login','Log in'],['signup','Sign up']].map(([m, lbl]) => (
              <button key={m} onClick={() => switchMode(m)} style={{ flex: 1, padding: '8px', borderRadius: 7, border: 'none', background: mode === m ? T.white : 'transparent', color: mode === m ? T.ink : T.ink3, fontFamily: "'DM Sans',sans-serif", fontWeight: mode === m ? 700 : 500, fontSize: 14, cursor: 'pointer', boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>{lbl}</button>
            ))}
          </div>

          <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: T.ink }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p style={{ margin: '0 0 24px', fontSize: 13, color: T.ink3 }}>
            {mode === 'login' ? 'Log in to your family account.' : 'Free during beta. No credit card needed.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.ink3, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>YOUR NAME</label>
                <input style={inp} type="text" placeholder="First and last name" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: T.ink3, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>EMAIL</label>
              <input style={inp} type="email" placeholder="your@email.com" value={email} onChange={e => { setEmail(e.target.value); setError('') }} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.ink3, letterSpacing: '0.05em', textTransform: 'uppercase' }}>PASSWORD</label>
                {mode === 'login' && (
                  <button onClick={async () => {
                    if (!email.trim()) { setError('Enter your email first.'); return }
                    await supabase.auth.resetPasswordForEmail(email.trim())
                    alert(`Password reset sent to ${email}`)
                  }} style={{ background: 'none', border: 'none', color: T.teal, fontSize: 11, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, padding: 0 }}>
                    Forgot password?
                  </button>
                )}
              </div>
              <input style={inp} type="password" placeholder="Your password" value={password} onChange={e => { setPassword(e.target.value); setError('') }} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
          </div>

          {error && (
            <div style={{ marginTop: 12, padding: '10px 12px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, fontSize: 13, color: T.rose, lineHeight: 1.4 }}>
              {error}
            </div>
          )}

          {mode === 'signup' && (
            <div style={{ display:'flex', flexDirection:'column', gap:10, padding:'14px', background:'#f6f8fb', borderRadius:10, border:'1px solid #e2e8f2' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#64748b', fontFamily:"'DM Sans',sans-serif", letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:2 }}>Required consents</div>

              {/* Consent 1 — Guardian confirmation */}
              <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                <input
                  type="checkbox"
                  id="consent1"
                  checked={consent}
                  onChange={e => { setConsent(e.target.checked); setError('') }}
                  style={{ marginTop:2, flexShrink:0, accentColor:'#0d9488', width:15, height:15, cursor:'pointer' }}
                />
                <label htmlFor="consent1" style={{ fontSize:12, color:'#334155', fontFamily:"'DM Sans',sans-serif", lineHeight:1.55, cursor:'pointer' }}>
                  I am the <strong>parent or legal guardian</strong> of the child whose health information I will enter into Readily, and I have the authority to consent on their behalf.
                </label>
              </div>

              {/* Consent 2 — PHI collection and use */}
              <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                <input
                  type="checkbox"
                  id="consent2"
                  checked={consent2}
                  onChange={e => { setConsent2(e.target.checked); setError('') }}
                  style={{ marginTop:2, flexShrink:0, accentColor:'#0d9488', width:15, height:15, cursor:'pointer' }}
                />
                <label htmlFor="consent2" style={{ fontSize:12, color:'#334155', fontFamily:"'DM Sans',sans-serif", lineHeight:1.55, cursor:'pointer' }}>
                  I understand that the information I enter will be used to coordinate my child's care, shared only with providers I invite, and processed by AI only when I activate digest or chat features. I can delete my data at any time. I have read and agree to the{' '}
                  <button type="button" onClick={() => onLegal && onLegal()} style={{ background:'none', border:'none', color:'#0d9488', fontWeight:700, fontSize:12, cursor:'pointer', padding:0, fontFamily:"'DM Sans',sans-serif" }}>Privacy Policy</button>
                  {' '}and{' '}
                  <button type="button" onClick={() => onLegal && onLegal()} style={{ background:'none', border:'none', color:'#0d9488', fontWeight:700, fontSize:12, cursor:'pointer', padding:0, fontFamily:"'DM Sans',sans-serif" }}>Terms of Service</button>.
                </label>
              </div>
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', marginTop: 20, padding: 13, background: loading ? T.ink3 : `linear-gradient(135deg,${T.teal},${T.tealD})`, border: 'none', borderRadius: 10, color: '#fff', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : `0 4px 14px ${T.teal}44`, transition: 'all 0.2s' }}>
            {loading ? '…' : mode === 'login' ? 'Log in →' : 'Create account →'}
          </button>

          <div style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: T.ink3 }}>
            {mode === 'login'
              ? <><span>Don't have an account? </span><button onClick={() => switchMode('signup')} style={{ background: 'none', border: 'none', color: T.teal, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, fontFamily: "'DM Sans',sans-serif" }}>Sign up free →</button></>
              : <><span>Already have an account? </span><button onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', color: T.teal, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, fontFamily: "'DM Sans',sans-serif" }}>Log in →</button></>
            }
          </div>

          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 11, color: T.ink4 }}>
            Your data is private and secure. Families control all access.
          </div>
        </div>
      </div>
    </div>
  )
}
