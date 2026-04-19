import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { supabase } from './supabase'
import Auth from './Auth.jsx'
import ReadilyApp from './readily-app.jsx'

const DEMO_EMAIL = 'bunmioluwa@gmail.com'

function Welcome({ onStartSetup, userName }) {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d2b1e,#3a7d54)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '40px 36px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
        <h2 style={{ margin: '0 0 10px', fontSize: 26, fontWeight: 800, color: '#0f172a', fontFamily: "'DM Sans',sans-serif" }}>
          Welcome to Readily{userName ? `, ${userName.split(' ')[0]}` : ''}!
        </h2>
        <p style={{ margin: '0 0 28px', fontSize: 15, color: '#64748b', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6 }}>
          Let's set up your child's profile. It takes about 12 minutes and gives every therapist, teacher, and caregiver exactly what they need — so you never have to explain your child twice.
        </p>
        <button
          onClick={onStartSetup}
          style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#0d9488,#0f766e)', border: 'none', borderRadius: 12, color: '#fff', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 4px 14px rgba(13,148,136,0.35)' }}>
          Build my child's profile →
        </button>
        <button
          onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }}
          style={{ marginTop: 12, background: 'none', border: 'none', color: '#94a3b8', fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: 'pointer' }}>
          Sign out
        </button>
      </div>
    </div>
  )
}

function Root() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasChild, setHasChild] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) checkChild(session)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) checkChild(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const checkChild = async (session) => {
    try {
      // Demo account always sees Maya
      if (session.user.email === DEMO_EMAIL) {
        setHasChild(true)
        setLoading(false)
        return
      }

      // Check if this family has a child in the database
      const { data } = await supabase
        .from('children')
        .select('id')
        .eq('family_id', session.user.id)
        .limit(1)

      setHasChild(data && data.length > 0)

      // Get user name for welcome screen
      const { data: family } = await supabase
        .from('families')
        .select('name')
        .eq('id', session.user.id)
        .maybeSingle()

      if (family?.name) setUserName(family.name)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d2b1e' }}>
      <div style={{ fontSize: 32, animation: 'spin 1s linear infinite' }}>⚡</div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )

  if (!session) return <Auth onAuth={() => {}} />

  // Demo account → always show full app with Maya data
  if (session.user.email === DEMO_EMAIL) {
    return <ReadilyApp session={session} isNewUser={!hasChild} />
  }

  // New family → show welcome + setup flow
  if (!hasChild && !showSetup) {
    return <Welcome onStartSetup={() => setShowSetup(true)} userName={userName} />
  }

  // Has child or in setup → show app
return <ReadilyApp session={session} isNewUser={!hasChild} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)