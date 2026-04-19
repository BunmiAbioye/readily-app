import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { supabase } from './supabase'
import Auth from './Auth.jsx'
import ReadilyApp from './readily-app.jsx'
import ReadilyLanding from './readily-landing.jsx'

const DEMO_EMAIL = 'ablepamhc@gmail.com'

// ─── HELPERS ───────────────────────────────────────────────────────────────
const getParam = (key) => new URLSearchParams(window.location.search).get(key)
const setParam = (key, val) => {
  const url = new URL(window.location)
  if (val) url.searchParams.set(key, val)
  else url.searchParams.delete(key)
  window.history.pushState({}, '', url)
}
const clearParams = () => window.history.pushState({}, '', window.location.pathname)

// ─── ROOT ──────────────────────────────────────────────────────────────────
function Root() {
  const [session, setSession]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [hasChild, setHasChild] = useState(false)
  const [authMode, setAuthMode] = useState(null) // 'login' | 'signup' | null

  // On mount — read URL param for auth mode
  useEffect(() => {
    const param = getParam('auth')
    if (param === 'login' || param === 'signup') setAuthMode(param)
  }, [])

  // Listen for browser back/forward
  useEffect(() => {
    const fn = () => {
      const param = getParam('auth')
      setAuthMode(param === 'login' || param === 'signup' ? param : null)
    }
    window.addEventListener('popstate', fn)
    return () => window.removeEventListener('popstate', fn)
  }, [])

  // Supabase session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) checkChild(session)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        clearParams()
        setAuthMode(null)
        checkChild(session)
      } else {
        setLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const checkChild = async (session) => {
    try {
      if (session.user.email === DEMO_EMAIL) {
        setHasChild(true)
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('children')
        .select('id')
        .eq('family_id', session.user.id)
        .limit(1)
      setHasChild(data && data.length > 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const goToAuth = (mode) => {
    setParam('auth', mode)
    setAuthMode(mode)
  }

  const goToLanding = () => {
    clearParams()
    setAuthMode(null)
  }

  // ── Loading spinner ──
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0c1a2e', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 32, animation: 'spin 1s linear infinite' }}>⚡</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // ── Logged in → show app ──
  if (session) {
    return <ReadilyApp session={session} isNewUser={!hasChild} />
  }

  // ── Auth screen ──
  if (authMode === 'login' || authMode === 'signup') {
    return (
      <Auth
        initialMode={authMode}
        onBack={goToLanding}
        onAuth={() => {}}
      />
    )
  }

  // ── Landing page (default) ──
  return (
    <ReadilyLanding
      onLogin={() => goToAuth('login')}
      onSignUp={() => goToAuth('signup')}
    />
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
