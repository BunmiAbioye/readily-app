import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { supabase } from './supabase'
import Auth from './Auth.jsx'
import ReadilyApp from './readily-app.jsx'
import ReadilyLanding from './readily-landing.jsx'
import LegalPage from './LegalPage.jsx'
import InviteAccept from './InviteAccept.jsx'
import ProviderDashboard from './ProviderDashboard.jsx'
import PublicPassport from './PublicPassport.jsx'

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
  const [isProvider, setIsProvider] = useState(false)
  const [isProvider, setIsProvider] = useState(false)
  const [authMode, setAuthMode] = useState(null) // 'login' | 'signup' | null
  const [showLegal, setShowLegal] = useState(false)

  // On mount — read URL param for auth mode
  useEffect(() => {
    const param = getParam('auth')
    if (param === 'login' || param === 'signup') setAuthMode(param)
    if (param === 'legal') setShowLegal(true)
  }, [])

  // Listen for browser back/forward
  useEffect(() => {
    const fn = () => {
      const param = getParam('auth')
      setAuthMode(param === 'login' || param === 'signup' ? param : null)
      setShowLegal(param === 'legal')
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

      // Check if provider first (accepted invitations)
      const { data: providerData } = await supabase
        .from('invitations')
        .select('id')
        .eq('provider_id', session.user.id)
        .eq('accepted', true)
        .limit(1)

      if (providerData && providerData.length > 0) {
        setIsProvider(true)
        setLoading(false)
        return
      }

      // Check if family has a child
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
    setShowLegal(false)
  }

  const goToLegal = () => {
    setParam('auth', 'legal')
    setShowLegal(true)
  }

  // ── Public passport route — no auth needed ──
  const passportMatch = window.location.pathname.match(/^\/passport\/([a-z0-9]+)$/i);
  if (passportMatch) {
    return <PublicPassport token={passportMatch[1]} />;
  }

  // ── Provider invite route — no auth needed ──
  const inviteMatch = window.location.pathname.match(/^\/invite\/([a-zA-Z0-9_-]+)$/);
  if (inviteMatch) {
    return <InviteAccept token={inviteMatch[1]} onAuth={() => { window.location.href = '/'; }} />;
  }

  // ── Loading spinner ──
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0c1a2e', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 32, animation: 'spin 1s linear infinite' }}>⚡</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // ── Logged in → route based on user type ──
  if (session) {
    if (isProvider) return <ProviderDashboard session={session} />
    return <ReadilyApp session={session} isNewUser={!hasChild} />
  }

  // ── Auth screen ──
  if (authMode === 'login' || authMode === 'signup') {
    return (
      <Auth
        initialMode={authMode}
        onBack={goToLanding}
        onAuth={() => {}}
        onLegal={goToLegal}
      />
    )
  }

  // ── Legal page ──
  if (showLegal) {
    return <LegalPage onBack={goToLanding} />
  }

  // ── Landing page (default) ──
  return (
    <ReadilyLanding
      onLogin={() => goToAuth('login')}
      onSignUp={() => goToAuth('signup')}
      onLegal={goToLegal}
    />
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
