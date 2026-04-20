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
  green:  "#059669",
  greenL: "#d1fae5",
  nav:    "#0c1a2e",
}

export default function PublicPassport({ token }) {
  const [child, setChild] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('passport_shares')
          .select('child_id, children(*)')
          .eq('token', token)
          .eq('active', true)
          .maybeSingle()

        if (error) { console.error('[Readily] Passport error:', error); setError('This passport link is invalid or has been revoked.'); return; }
        if (!data) { setError('This passport link is invalid or has been revoked.'); return; }
        setChild(data.children)
      } catch (e) {
        console.error(e)
        setError('Something went wrong loading this passport.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:T.bg, flexDirection:'column', gap:12 }}>
      <div style={{ width:40, height:40, borderRadius:'50%', background:`linear-gradient(135deg,${T.teal},${T.indigo})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, animation:'spin 1s linear infinite' }}>⚡</div>
      <div style={{ fontSize:13, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>Loading passport…</div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} body{background:${T.bg};} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:T.bg, padding:24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} body{background:${T.bg};}`}</style>
      <div style={{ background:T.white, borderRadius:16, padding:'36px 28px', maxWidth:440, width:'100%', textAlign:'center', border:`1px solid ${T.border}` }}>
        <div style={{ fontSize:44, marginBottom:14 }}>🔒</div>
        <h2 style={{ margin:'0 0 10px', fontSize:20, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>Passport unavailable</h2>
        <p style={{ margin:'0 0 20px', fontSize:14, color:T.ink3, fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>{error}</p>
        <a href="https://readily.ablepam.ca" style={{ fontSize:13, color:T.teal, fontFamily:"'DM Sans',sans-serif", fontWeight:600, textDecoration:'none' }}>← Back to Readily</a>
      </div>
    </div>
  )

  const sections = [
    {
      label: '✓ What Works', color: T.green, bg: T.greenL,
      items: [
        { title: 'Motivators & Interests', value: child.motivators?.join(', ') || '—' },
        { title: 'Calming Strategies', value: child.calming?.join(', ') || '—' },
        { title: 'Communication Style', value: child.communication?.join(', ') || '—' },
      ]
    },
    {
      label: '⚠ Watch For', color: '#dc2626', bg: '#fff1f2',
      items: [
        { title: 'Triggers', value: child.triggers?.join(', ') || '—' },
        { title: 'Sensory Profile', value: child.sensory?.join(', ') || '—' },
      ]
    },
  ]

  return (
    <div style={{ minHeight:'100vh', background:T.bg, fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} body{background:${T.bg}; -webkit-font-smoothing:antialiased;}`}</style>

      {/* Nav */}
      <div style={{ background:T.nav, padding:'0 20px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:T.tealD, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>⚡</div>
          <span style={{ fontSize:15, fontWeight:800, color:'#fff', letterSpacing:'-0.02em' }}>Readily</span>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginLeft:4 }}>Care Passport</span>
        </div>
        <a href="https://readily.ablepam.ca" style={{ fontSize:12, color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>Sign up free →</a>
      </div>

      <div style={{ maxWidth:600, margin:'0 auto', padding:'28px 20px 60px' }}>

        {/* Hero */}
        <div style={{ background:`linear-gradient(135deg,${T.tealD},${T.indigo})`, borderRadius:18, padding:'24px 26px', marginBottom:16, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', right:-20, top:-20, width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,0.07)' }} />
          <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.6)', letterSpacing:'0.12em', marginBottom:8 }}>CARE PASSPORT</div>
          <div style={{ fontSize:28, fontWeight:900, color:'#fff', marginBottom:4, letterSpacing:'-0.02em' }}>{child.name}</div>
          <div style={{ fontSize:14, color:'rgba(255,255,255,0.75)' }}>
            {[child.age && `Age ${child.age}`, child.diagnosis, child.school].filter(Boolean).join(' · ') || '—'}
          </div>
          <div style={{ marginTop:14, padding:'8px 12px', background:'rgba(255,255,255,0.1)', borderRadius:8, fontSize:12, color:'rgba(255,255,255,0.75)', lineHeight:1.55 }}>
            🔒 Read-only profile shared by {child.name}'s family. Confidential — for the direct care of this child only.
          </div>
        </div>

        {/* Sections */}
        {sections.map((section, si) => (
          <div key={si} style={{ background:T.white, borderRadius:14, overflow:'hidden', marginBottom:12, border:`1px solid ${T.border}` }}>
            <div style={{ padding:'12px 20px', background:section.bg, borderBottom:`1px solid ${T.border}` }}>
              <div style={{ fontSize:11, fontWeight:800, color:section.color, letterSpacing:'0.1em', textTransform:'uppercase' }}>{section.label}</div>
            </div>
            <div style={{ padding:'16px 20px' }}>
              {section.items.map((item, ii) => (
                <div key={ii} style={{ marginBottom:ii < section.items.length-1 ? 14 : 0, paddingBottom:ii < section.items.length-1 ? 14 : 0, borderBottom:ii < section.items.length-1 ? `1px solid ${T.border}` : 'none' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:T.ink3, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:5 }}>{item.title}</div>
                  <div style={{ fontSize:14, color:T.ink2, lineHeight:1.6 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Notes */}
        {child.notes && (
          <div style={{ background:T.white, borderRadius:14, overflow:'hidden', marginBottom:12, border:`1px solid ${T.border}` }}>
            <div style={{ padding:'12px 20px', background:'#faf9f7', borderBottom:`1px solid ${T.border}` }}>
              <div style={{ fontSize:11, fontWeight:800, color:T.ink3, letterSpacing:'0.1em', textTransform:'uppercase' }}>📝 ADDITIONAL NOTES</div>
            </div>
            <div style={{ padding:'16px 20px' }}>
              <div style={{ fontSize:14, color:T.ink2, lineHeight:1.7 }}>{child.notes}</div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop:24, padding:'16px 20px', background:T.white, borderRadius:14, border:`1px solid ${T.border}`, textAlign:'center' }}>
          <div style={{ fontSize:12, color:T.ink4, lineHeight:1.7 }}>
            Shared via <strong style={{ color:T.teal }}>Readily</strong> by AblePam Inc.<br />
            This link was shared directly by {child.name}'s family.
          </div>
          <a href="https://readily.ablepam.ca" style={{ display:'inline-block', marginTop:10, fontSize:12, color:T.teal, textDecoration:'none', fontWeight:600 }}>
            Create your own Readily account →
          </a>
        </div>

      </div>
    </div>
  )
}
