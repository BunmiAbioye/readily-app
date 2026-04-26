import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const T = {
  bg:     "#f7f5f2",
  white:  "#ffffff",
  ink:    "#0f0e0c",
  ink2:   "#2d2b27",
  ink3:   "#6b6760",
  ink4:   "#a8a49e",
  border: "#e8e4de",
  teal:   "#0d9488",
  tealD:  "#0f766e",
  indigo: "#4338ca",
  nav:    "#0c1a2e",
  rose:   "#e11d48",
}

export default function InviteAccept({ token, onAuth }) {
  const [invite, setInvite]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [mode, setMode]         = useState('login') // 'login' | 'signup'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [authError, setAuthError]   = useState('')
  const [accepted, setAccepted]     = useState(false)

  // Load invitation details
  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('invitations')
          .select('*, children(name, diagnosis)')
          .eq('invite_token', token)
          .maybeSingle()

        if (error || !data) { setError('This invitation link is invalid or has expired.'); return; }
        if (data.accepted) { setError('This invitation has already been accepted. Please log in to access Readily.'); return; }
        setInvite(data)
        setEmail(data.provider_email) // Pre-fill email
      } catch(e) {
        setError('Something went wrong loading this invitation.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const acceptInvitation = async (userId, userEmail) => {
    // Update invitation with provider_id and mark accepted
    await supabase.from('invitations').update({
      provider_id: userId,
      accepted: true,
      accepted_at: new Date().toISOString(),
    }).eq('invite_token', token)

    // Ensure provider record exists
    await supabase.from('providers').upsert({
      id: userId,
      email: userEmail,
      name: name || userEmail.split('@')[0],
      role: invite?.role || 'Provider',
    })
  }

  const handleSubmit = async () => {
    setAuthError('')
    if (!email.trim() || !password.trim()) { setAuthError('Please fill in all fields.'); return }
    if (mode === 'signup' && !name.trim()) { setAuthError('Please enter your name.'); return }
    if (password.length < 6) { setAuthError('Password must be at least 6 characters.'); return }

    setSubmitting(true)
    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
        await acceptInvitation(data.user.id, data.user.email)
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { data: { full_name: name.trim() } }
        })
        if (error) throw error
        if (data.user) await acceptInvitation(data.user.id, data.user.email)
      }
      setAccepted(true)
      // Redirect to app after 2 seconds — main.jsx will detect provider and route correctly
      setTimeout(() => { window.location.href = '/'; }, 2000)
    } catch(e) {
      if (e.message?.includes('Invalid login')) setAuthError('Incorrect email or password.')
      else if (e.message?.includes('already registered')) setAuthError('An account with this email exists. Try logging in.')
      else setAuthError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inp = {
    width:'100%', padding:'12px 14px', borderRadius:10,
    border:`1.5px solid ${T.border}`, fontFamily:"'DM Sans',sans-serif",
    fontSize:14, color:T.ink, background:T.white, boxSizing:'border-box',
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:T.nav }}>
      <div style={{ fontSize:32, animation:'spin 1s linear infinite' }}>⚡</div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:T.nav, padding:24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <div style={{ background:T.white, borderRadius:16, padding:'36px 28px', maxWidth:440, width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:44, marginBottom:14 }}>🔒</div>
        <h2 style={{ margin:'0 0 10px', fontSize:20, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>Invitation unavailable</h2>
        <p style={{ margin:'0 0 20px', fontSize:14, color:T.ink3, fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>{error}</p>
        <a href="https://readily.ablepam.ca?auth=login" style={{ fontSize:13, color:T.teal, fontFamily:"'DM Sans',sans-serif", fontWeight:600, textDecoration:'none' }}>Log in to Readily →</a>
      </div>
    </div>
  )

  if (accepted) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:T.nav, padding:24 }}>
      <div style={{ background:T.white, borderRadius:16, padding:'40px 32px', maxWidth:440, width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:52, marginBottom:16 }}>✅</div>
        <h2 style={{ margin:'0 0 10px', fontSize:22, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>You're in!</h2>
        <p style={{ margin:0, fontSize:14, color:T.ink3, fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>
          You've joined {invite?.children?.name}'s care team. Redirecting you to Readily…
        </p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(160deg,${T.nav},#1e3a5f)`, display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} input:focus{outline:none;border-color:${T.teal}!important;box-shadow:0 0 0 3px ${T.teal}20!important;} @media(max-width:640px){input{font-size:16px!important;}}`}</style>

      <div style={{ width:'100%', maxWidth:440 }}>

        {/* Invite context banner */}
        <div style={{ background:'rgba(13,148,136,0.15)', border:'1px solid rgba(13,148,136,0.35)', borderRadius:12, padding:'14px 18px', marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#5eead4', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6 }}>CARE TEAM INVITATION</div>
          <div style={{ fontSize:15, fontWeight:700, color:'#fff' }}>
            You've been invited to {invite?.children?.name}'s care team
          </div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)', marginTop:3 }}>
            as {invite?.provider_email}
          </div>
        </div>

        {/* Auth card */}
        <div style={{ background:T.white, borderRadius:20, padding:'32px 28px', boxShadow:'0 8px 40px rgba(0,0,0,0.25)' }}>

          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
            <div style={{ width:30, height:30, borderRadius:7, background:T.tealD, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>⚡</div>
            <span style={{ fontSize:17, fontWeight:800, color:T.ink, letterSpacing:'-0.02em' }}>Readily</span>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:4, background:'#f6f8fb', borderRadius:10, padding:4, border:`1px solid ${T.border}`, marginBottom:22 }}>
            {[['login','I have an account'],['signup','Create account']].map(([m,lbl])=>(
              <button key={m} onClick={()=>{ setMode(m); setAuthError(''); }} style={{ flex:1, padding:'8px', borderRadius:7, border:'none', background:mode===m?T.white:'transparent', color:mode===m?T.ink:T.ink3, fontFamily:"'DM Sans',sans-serif", fontWeight:mode===m?700:500, fontSize:13, cursor:'pointer', boxShadow:mode===m?'0 1px 4px rgba(0,0,0,0.08)':'none', transition:'all 0.15s' }}>{lbl}</button>
            ))}
          </div>

          <h2 style={{ margin:'0 0 4px', fontSize:20, fontWeight:800, color:T.ink }}>
            {mode==='login' ? 'Log in to accept' : 'Create your account'}
          </h2>
          <p style={{ margin:'0 0 20px', fontSize:13, color:T.ink3 }}>
            {mode==='login' ? 'Use your existing Readily account.' : 'Free — no credit card needed.'}
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {mode==='signup' && (
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:T.ink3, letterSpacing:'0.05em', textTransform:'uppercase', display:'block', marginBottom:5 }}>YOUR NAME</label>
                <input style={inp} type="text" placeholder="First and last name" value={name} onChange={e=>setName(e.target.value)} />
              </div>
            )}
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:T.ink3, letterSpacing:'0.05em', textTransform:'uppercase', display:'block', marginBottom:5 }}>EMAIL</label>
              <input style={{ ...inp, background:'#f6f8fb' }} type="email" value={email} readOnly />
              <div style={{ fontSize:11, color:T.ink4, marginTop:4 }}>This must match the email you were invited with</div>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:T.ink3, letterSpacing:'0.05em', textTransform:'uppercase', display:'block', marginBottom:5 }}>PASSWORD</label>
              <input style={inp} type="password" placeholder="Your password" value={password} onChange={e=>{ setPassword(e.target.value); setAuthError(''); }} onKeyDown={e=>e.key==='Enter'&&handleSubmit()} />
            </div>
          </div>

          {authError && (
            <div style={{ marginTop:12, padding:'10px 12px', background:'#fff1f2', border:'1px solid #fecdd3', borderRadius:8, fontSize:13, color:T.rose, lineHeight:1.4 }}>
              {authError}
            </div>
          )}

          <button onClick={handleSubmit} disabled={submitting} style={{ width:'100%', marginTop:20, padding:13, background:submitting?T.ink3:`linear-gradient(135deg,${T.teal},${T.tealD})`, border:'none', borderRadius:10, color:'#fff', fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:15, cursor:submitting?'not-allowed':'pointer', boxShadow:submitting?'none':`0 4px 14px ${T.teal}44`, transition:'all 0.2s' }}>
            {submitting ? '…' : mode==='login' ? 'Log in & join care team →' : 'Create account & join care team →'}
          </button>

          <div style={{ marginTop:16, textAlign:'center', fontSize:13, color:T.ink3 }}>
            {mode==='login'
              ? <><span>New to Readily? </span><button onClick={()=>setMode('signup')} style={{ background:'none', border:'none', color:T.teal, fontWeight:700, fontSize:13, cursor:'pointer', padding:0, fontFamily:"'DM Sans',sans-serif" }}>Create account →</button></>
              : <><span>Already have an account? </span><button onClick={()=>setMode('login')} style={{ background:'none', border:'none', color:T.teal, fontWeight:700, fontSize:13, cursor:'pointer', padding:0, fontFamily:"'DM Sans',sans-serif" }}>Log in →</button></>
            }
          </div>

          <div style={{ marginTop:14, padding:'10px 12px', background:'#f6f8fb', borderRadius:8, border:'1px solid #e2e8f2' }}>
            <div style={{ fontSize:11, color:'#64748b', fontFamily:"'DM Sans',sans-serif", lineHeight:1.55 }}>
              By accepting, I confirm I will use {invite?.children?.name}'s information <strong>only for their direct care</strong>, will not share it with third parties, and understand my obligations under applicable privacy legislation (PHIPA). View our{' '}
              <a href="https://readily.ablepam.ca?auth=legal" style={{ color:T.teal, textDecoration:'none', fontWeight:600 }}>Privacy Policy</a>.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
