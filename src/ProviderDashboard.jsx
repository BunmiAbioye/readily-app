import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const T = {
  bg:      "#0e1117",
  card:    "#1e2535",
  border:  "#2a3348",
  border2: "#3a4a6a",
  ink:     "#eef2ff",
  ink2:    "#a8bdd0",
  ink3:    "#6b8299",
  teal:    "#0d9488",
  blue:    "#38bdf8",
  blueD:   "#0284c7",
  green:   "#4ade80",
  amber:   "#fbbf24",
  rose:    "#fb7185",
  nav:     "#0c1a2e",
};

const RESP_STYLE = {
  Exceptional: { bg:"rgba(74,222,128,0.12)",  color:"#4ade80" },
  Good:        { bg:"rgba(56,189,248,0.12)",  color:"#38bdf8" },
  Mixed:       { bg:"rgba(251,191,36,0.12)",  color:"#fbbf24" },
  Difficult:   { bg:"rgba(251,113,133,0.12)", color:"#fb7185" },
};

const FOCUS_AREAS_BY_LOGGER = {
  provider: ["Articulation","Language comprehension","Expressive language","Pragmatics / social language","AAC / communication device","Receptive vocabulary","Following directions","Transitions","Fluency","Social skills","Self-regulation","Fine motor","Gross motor","Feeding / eating"],
  parent:   ["Morning routine","Mealtime","Getting dressed","Community outing","Homework / learning","Sibling interaction","Screen time / wind-down","Bedtime routine","Playing independently","Social play","Emotional regulation","Transition at home","Communication at home","Sensory activity"],
};

const RESP_OPTS = [
  {label:"Exceptional",icon:"🌟",color:"#4ade80"},
  {label:"Good",       icon:"👍",color:"#38bdf8"},
  {label:"Mixed",      icon:"↕", color:"#fbbf24"},
  {label:"Difficult",  icon:"⚡",color:"#fb7185"},
];

// ─── CHILD SELECTOR ────────────────────────────────────────────────────────
function ChildSelector({ children, onSelect }) {
  const [search, setSearch] = useState("");
  const filtered = children.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.diagnosis||"").toLowerCase().includes(search.toLowerCase()) ||
    (c.school||"").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth:560, margin:"0 auto" }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:10, fontWeight:700, color:T.blue, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.1em", marginBottom:6 }}>PROVIDER DASHBOARD</div>
        <h2 style={{ margin:"0 0 4px", fontSize:22, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>Your care team</h2>
        <p style={{ margin:0, fontSize:13, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>Select a child to view their passport or log a session.</p>
      </div>

      <div style={{ position:"relative", marginBottom:14 }}>
        <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14, color:T.ink3 }}>🔍</span>
        <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, diagnosis, or school…"
          style={{ width:"100%", padding:"11px 12px 11px 36px", background:T.card, border:`1.5px solid ${T.border}`, borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontSize:14, color:T.ink, outline:"none", boxSizing:"border-box" }}
          onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border} />
      </div>

      {filtered.length===0 && <div style={{ textAlign:"center", padding:"28px", color:T.ink3, fontFamily:"'DM Sans',sans-serif", fontSize:14 }}>No children match "{search}"</div>}

      {filtered.map((child,i)=>(
        <button key={child.id} onClick={()=>onSelect(child)}
          style={{ width:"100%", display:"flex", alignItems:"center", gap:14, padding:"16px 18px", background:T.card, border:`1.5px solid ${T.border}`, borderRadius:14, marginBottom:10, cursor:"pointer", textAlign:"left", transition:"all 0.2s" }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor=T.blue; e.currentTarget.style.background="#1a2540"; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.border; e.currentTarget.style.background=T.card; }}>
          <div style={{ width:44, height:44, borderRadius:"50%", background:`hsl(${i*60+180},45%,20%)`, border:`2px solid hsl(${i*60+180},45%,40%)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, color:`hsl(${i*60+180},55%,70%)`, flexShrink:0, fontFamily:"'DM Sans',sans-serif" }}>{child.name[0]}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:700, color:T.ink, fontFamily:"'DM Sans',sans-serif", marginBottom:2 }}>{child.name}</div>
            <div style={{ fontSize:12, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>{[child.age&&`Age ${child.age}`,child.diagnosis,child.school].filter(Boolean).join(" · ")||"—"}</div>
          </div>
          <span style={{ fontSize:10, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>{child.inviteRole}</span>
          <span style={{ color:T.ink3, fontSize:14 }}>→</span>
        </button>
      ))}
    </div>
  );
}

// ─── PASSPORT VIEW ─────────────────────────────────────────────────────────
function PassportView({ child }) {
  const sections = [
    { label:"✓ What Works", color:"#4ade80", items:[
      {title:"Motivators", value:child.motivators?.join(", ")||"—"},
      {title:"Calming Strategies", value:child.calming?.join(", ")||"—"},
      {title:"Communication", value:child.communication?.join(", ")||"—"},
    ]},
    { label:"⚠ Watch For", color:"#fb7185", items:[
      {title:"Triggers", value:child.triggers?.join(", ")||"—"},
      {title:"Sensory Profile", value:child.sensory?.join(", ")||"—"},
    ]},
  ];

  return (
    <div>
      <div style={{ background:"linear-gradient(135deg,#0f766e,#4338ca)", borderRadius:14, padding:"18px 20px", marginBottom:14, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:-15, top:-15, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
        <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.6)", letterSpacing:"0.12em", marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>CARE PASSPORT</div>
        <div style={{ fontSize:22, fontWeight:800, color:"#fff", marginBottom:2, fontFamily:"'DM Sans',sans-serif" }}>{child.name}</div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", fontFamily:"'DM Sans',sans-serif" }}>{[child.age&&`Age ${child.age}`,child.diagnosis,child.school].filter(Boolean).join(" · ")||"—"}</div>
      </div>
      {sections.map((s,si)=>(
        <div key={si} style={{ background:T.card, borderRadius:12, overflow:"hidden", marginBottom:10, border:`1px solid ${T.border}` }}>
          <div style={{ padding:"10px 16px", borderBottom:`1px solid ${T.border}`, background:"rgba(255,255,255,0.02)" }}>
            <div style={{ fontSize:10, fontWeight:800, color:s.color, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>{s.label}</div>
          </div>
          <div style={{ padding:"14px 16px" }}>
            {s.items.map((item,ii)=>(
              <div key={ii} style={{ marginBottom:ii<s.items.length-1?12:0, paddingBottom:ii<s.items.length-1?12:0, borderBottom:ii<s.items.length-1?`1px solid ${T.border}`:"none" }}>
                <div style={{ fontSize:10, fontWeight:700, color:T.ink3, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:4, fontFamily:"'DM Sans',sans-serif" }}>{item.title}</div>
                <div style={{ fontSize:13, color:T.ink2, lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {child.notes&&(
        <div style={{ background:T.card, borderRadius:12, padding:"14px 16px", border:`1px solid ${T.border}` }}>
          <div style={{ fontSize:10, fontWeight:700, color:T.ink3, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>📝 NOTES</div>
          <div style={{ fontSize:13, color:T.ink2, lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>{child.notes}</div>
        </div>
      )}
    </div>
  );
}

// ─── SESSION LOG FORM ──────────────────────────────────────────────────────
function SessionLogForm({ child, session: authSession, onLogged }) {
  const [loggerType, setLoggerType] = useState("provider");
  const [focus, setFocus]           = useState([]);
  const [response, setResponse]     = useState("");
  const [win, setWin]               = useState("");
  const [challenge, setChallenge]   = useState("");
  const [forFamily, setForFamily]   = useState("");
  const [saving, setSaving]         = useState(false);
  const [done, setDone]             = useState(false);

  const focusAreas = FOCUS_AREAS_BY_LOGGER[loggerType];
  const toggleFocus = f => setFocus(p=>p.includes(f)?p.filter(x=>x!==f):[...p,f]);
  const canSubmit = focus.length>0 && response && (win||challenge);
  const ta = { width:"100%", padding:"10px 12px", background:T.card, border:`1.5px solid ${T.border}`, borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:T.ink, minHeight:68, resize:"vertical", boxSizing:"border-box" };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    const sessionDate = new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
    const { error } = await supabase.from("sessions").insert({
      child_id: child.id, provider_id: authSession.user.id,
      date: new Date().toISOString().slice(0,10),
      response, focus_areas:focus, win, challenge, for_family:forFamily,
    });
    if (!error) {
      // Send email notification to parent
      try {
        // Get family info via RPC to bypass RLS
        const { data: familyInfo, error: famErr } = await supabase
          .rpc('get_family_for_child', { p_child_id: child.id });
        console.log("[Readily] Family info:", familyInfo, famErr);

        const familyEmail = familyInfo?.[0]?.email;
        const familyName = familyInfo?.[0]?.name;

        if (familyEmail) {
          const providerName = authSession.user.user_metadata?.full_name || authSession.user.email?.split("@")[0] || "Your provider";
          await fetch("/api/notify-parent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              parentEmail: familyEmail,
              parentName: familyName || "Parent",
              childName: child.name,
              providerName,
              providerRole: child.inviteRole || "Provider",
              sessionDate,
              response,
              win,
              forFamily,
              appUrl: "https://readily.ablepam.ca",
            }),
          });
        }
      } catch(e) { console.error("[Readily] Parent notification error:", e); }

      setDone(true);
      setTimeout(()=>{ setDone(false); setFocus([]); setResponse(""); setWin(""); setChallenge(""); setForFamily(""); onLogged&&onLogged(); }, 1500);
    } else {
      console.error("[Readily] Session log error:", error);
    }
    setSaving(false);
  };

  if (done) return (
    <div style={{ textAlign:"center", padding:"40px 20px" }}>
      <div style={{ fontSize:48, marginBottom:14 }}>✅</div>
      <h3 style={{ margin:"0 0 8px", fontSize:20, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>Session logged</h3>
      <p style={{ margin:0, fontSize:13, color:T.ink3, fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>{child.name}'s family will see this in their weekly digest.</p>
    </div>
  );

  return (
    <div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, background:"#111827", borderRadius:10, padding:4, border:`1px solid ${T.border}`, width:"fit-content", marginBottom:16 }}>
        {[["provider","🩺 Provider / Therapist"],["parent","🏠 Parent / Caregiver"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>{ setLoggerType(id); setFocus([]); }} style={{ padding:"7px 14px", borderRadius:7, border:"none", background:loggerType===id?"#1e3a5f":"transparent", color:loggerType===id?T.ink:T.ink3, fontFamily:"'DM Sans',sans-serif", fontWeight:loggerType===id?700:500, fontSize:13, cursor:"pointer" }}>{lbl}</button>
        ))}
      </div>

      {loggerType==="provider"&&(
        <div style={{ background:"rgba(56,189,248,0.08)", border:"1px solid rgba(56,189,248,0.2)", borderRadius:10, padding:"10px 14px", marginBottom:14, display:"flex", gap:10 }}>
          <span style={{ fontSize:13, flexShrink:0 }}>💡</span>
          <div style={{ fontSize:12, color:T.ink2, fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>
            {child.name} responds well to <strong style={{ color:T.ink }}>{child.calming?.[0]||"consistent routines"}</strong>. Motivators: <strong style={{ color:T.ink }}>{child.motivators?.slice(0,2).join(", ")||"—"}</strong>.
          </div>
        </div>
      )}

      <div style={{ marginBottom:14 }}>
        <label style={{ fontSize:10, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em", display:"block", marginBottom:8 }}>{loggerType==="parent"?"WHAT ACTIVITY OR SITUATION? *":"WHAT DID YOU WORK ON? *"}</label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {focusAreas.map(f=>(
            <button key={f} onClick={()=>toggleFocus(f)} style={{ padding:"6px 12px", borderRadius:20, border:focus.includes(f)?`1.5px solid ${T.blue}`:`1.5px solid ${T.border}`, background:focus.includes(f)?"rgba(56,189,248,0.15)":"transparent", color:focus.includes(f)?T.blue:T.ink3, fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:focus.includes(f)?700:400, cursor:"pointer" }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom:14 }}>
        <label style={{ fontSize:10, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em", display:"block", marginBottom:8 }}>{loggerType==="parent"?`HOW DID ${child.name.toUpperCase()} DO AT HOME? *`:`HOW DID ${child.name.toUpperCase()} RESPOND? *`}</label>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:7 }}>
          {RESP_OPTS.map(opt=>(
            <button key={opt.label} onClick={()=>setResponse(opt.label)} style={{ padding:"11px 6px", borderRadius:10, border:response===opt.label?`2px solid ${opt.color}`:`1.5px solid ${T.border}`, background:response===opt.label?opt.color+"18":T.card, color:response===opt.label?opt.color:T.ink3, fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:response===opt.label?700:400, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
              <span style={{ fontSize:18 }}>{opt.icon}</span>{opt.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom:12 }}><label style={{ fontSize:10, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em", display:"block", marginBottom:6 }}>{loggerType==="parent"?"ONE WIN AT HOME":"ONE WIN"}</label><textarea style={ta} value={win} onChange={e=>setWin(e.target.value)} placeholder={loggerType==="parent"?`e.g. ${child.name} asked for help instead of melting down`:`e.g. ${child.name} used 'I want' unprompted twice`} /></div>
      <div style={{ marginBottom:12 }}><label style={{ fontSize:10, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em", display:"block", marginBottom:6 }}>{loggerType==="parent"?"WHAT WAS HARD?":"ONE THING TO KEEP WORKING ON"}</label><textarea style={ta} value={challenge} onChange={e=>setChallenge(e.target.value)} placeholder={loggerType==="parent"?"e.g. Getting shoes on — lots of resistance":"e.g. Initiating conversation without a prompt"} /></div>
      <div style={{ marginBottom:18 }}><label style={{ fontSize:10, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em", display:"block", marginBottom:6 }}>{loggerType==="parent"?"ANYTHING FOR THE CARE TEAM? (optional)":"NOTE FOR THE FAMILY (optional)"}</label><textarea style={ta} value={forFamily} onChange={e=>setForFamily(e.target.value)} placeholder={loggerType==="parent"?"e.g. She had a great morning":"e.g. Try asking 'what do you want?' before meals"} /></div>

      <button onClick={handleSubmit} disabled={!canSubmit||saving} style={{ width:"100%", padding:14, background:canSubmit&&!saving?`linear-gradient(135deg,${T.blue},${T.blueD})`:"#1e2535", border:canSubmit&&!saving?"none":`1.5px solid ${T.border}`, borderRadius:12, color:canSubmit&&!saving?T.ink:"#5a6a8a", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:15, cursor:canSubmit&&!saving?"pointer":"not-allowed" }}>
        {saving?"Saving…":canSubmit?"✓ Submit session log":"Complete required fields to submit"}
      </button>
    </div>
  );
}

// ─── SESSION HISTORY ───────────────────────────────────────────────────────
function SessionHistory({ sessions }) {
  const [openCard, setOpenCard] = useState(null);
  if (sessions.length===0) return <div style={{ textAlign:"center", padding:"28px", color:T.ink3, fontFamily:"'DM Sans',sans-serif", fontSize:14 }}>No sessions logged yet.</div>;
  return (
    <div>
      {sessions.map((s,i)=>{
        const rs=RESP_STYLE[s.response]||RESP_STYLE.Good;
        return (
          <div key={s.id||i} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, overflow:"hidden", marginBottom:8 }}>
            <div onClick={()=>setOpenCard(openCard===i?null:i)} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", cursor:"pointer" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:13, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>{new Date(s.date).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})}</div>
                <div style={{ fontSize:11, color:T.ink3, fontFamily:"'DM Sans',sans-serif", marginTop:2 }}>{s.focus_areas?.slice(0,2).join(", ")||"—"}</div>
              </div>
              <span style={{ padding:"3px 10px", borderRadius:20, background:rs.bg, color:rs.color, fontSize:11, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>{s.response}</span>
              <span style={{ color:T.ink3, fontSize:10, transform:openCard===i?"rotate(180deg)":"rotate(0)", transition:"transform 0.2s", display:"inline-block" }}>▼</span>
            </div>
            {openCard===i&&(
              <div style={{ padding:"0 16px 14px", borderTop:`1px solid ${T.border}` }}>
                <div style={{ paddingTop:12 }}>
                  {s.win&&<><div style={{ fontSize:11, fontWeight:700, color:"#4ade80", fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>WIN</div><p style={{ margin:"0 0 10px", fontSize:13, color:T.ink2, fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>{s.win}</p></>}
                  {s.challenge&&<><div style={{ fontSize:11, fontWeight:700, color:T.amber, fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>WORKING ON</div><p style={{ margin:"0 0 10px", fontSize:13, color:T.ink2, fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>{s.challenge}</p></>}
                  {s.for_family&&<div style={{ background:"rgba(56,189,248,0.08)", borderRadius:8, padding:"8px 12px", border:"1px solid rgba(56,189,248,0.2)" }}><div style={{ fontSize:10, fontWeight:700, color:T.blue, fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>FOR FAMILY</div><p style={{ margin:0, fontSize:12, color:T.ink2, fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>{s.for_family}</p></div>}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── CHILD DETAIL VIEW ─────────────────────────────────────────────────────
function ChildDetailView({ child, session: authSession, onBack }) {
  const [tab, setTab]         = useState("log");
  const [sessions, setSessions] = useState([]);
  const [refresh, setRefresh]   = useState(false);

  useEffect(()=>{
    supabase.from("sessions").select("*")
      .eq("child_id", child.id)
      .eq("provider_id", authSession.user.id)
      .order("date", { ascending:false })
      .limit(50)
      .then(({ data }) => { if (data) setSessions(data); });
  }, [child.id, refresh]);

  return (
    <div style={{ maxWidth:560, margin:"0 auto" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <button onClick={onBack} style={{ background:"rgba(255,255,255,0.06)", border:"none", borderRadius:8, width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:T.ink2, fontSize:16, flexShrink:0 }}>←</button>
        <div>
          <div style={{ fontSize:16, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>{child.name}</div>
          <div style={{ fontSize:11, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>{[child.age&&`Age ${child.age}`,child.diagnosis].filter(Boolean).join(" · ")||"—"}</div>
        </div>
      </div>

      <div style={{ display:"flex", gap:4, background:"#111827", borderRadius:10, padding:4, border:`1px solid ${T.border}`, marginBottom:20 }}>
        {[["log","✏️ Log Session"],["history","📋 My Sessions"],["passport","🪪 Passport"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:"8px 6px", borderRadius:7, border:"none", background:tab===id?"#1e3a5f":"transparent", color:tab===id?T.ink:T.ink3, fontFamily:"'DM Sans',sans-serif", fontWeight:tab===id?700:500, fontSize:12, cursor:"pointer", transition:"all 0.15s" }}>{lbl}</button>
        ))}
      </div>

      {tab==="log"      && <SessionLogForm child={child} session={authSession} onLogged={()=>{ setRefresh(v=>!v); setTab("history"); }} />}
      {tab==="history"  && <SessionHistory sessions={sessions} />}
      {tab==="passport" && <PassportView child={child} />}
    </div>
  );
}

// ─── MAIN EXPORT ───────────────────────────────────────────────────────────
export default function ProviderDashboard({ session }) {
  const [children, setChildren]  = useState([]);
  const [selected, setSelected]  = useState(null);
  const [loading, setLoading]    = useState(true);
  const providerName = session?.user?.user_metadata?.full_name || session?.user?.email?.split("@")[0] || "Provider";

  useEffect(()=>{
    const load = async () => {
      try {
        // Step 1: get accepted invitations for this provider
        const { data: invites, error: invErr } = await supabase
          .from("invitations")
          .select("child_id, role, access_level")
          .eq("provider_id", session.user.id)
          .eq("accepted", true);

        console.log("[Readily] Provider invites:", invites, invErr);
        if (!invites?.length) { setLoading(false); return; }

        // Step 2: fetch each child individually (bypasses join RLS issue)
        const childIds = invites.map(i => i.child_id);
        const { data: childData } = await supabase
          .from("children")
          .select("*")
          .in("id", childIds);

        if (childData) {
          setChildren(childData.map(c => {
            const inv = invites.find(i => i.child_id === c.id);
            return { ...c, inviteRole: inv?.role, accessLevel: inv?.access_level };
          }));
        }
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [session?.user?.id]);

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:T.bg, flexDirection:"column", gap:12 }}>
      <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#0d9488,#38bdf8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, animation:"spin 1s linear infinite" }}>⚡</div>
      <div style={{ fontSize:13, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>Loading your care team…</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${T.bg}; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
        input:focus, textarea:focus { outline: none; border-color: ${T.blue} !important; box-shadow: 0 0 0 3px rgba(56,189,248,0.15) !important; }
        @media(max-width:640px){ input, textarea { font-size: 16px !important; } }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #3a4a6a; border-radius: 2px; }
      `}</style>
      <div style={{ minHeight:"100vh", background:T.bg }}>
        <div style={{ background:T.nav, height:52, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", borderBottom:"1px solid rgba(255,255,255,0.06)", position:"sticky", top:0, zIndex:100 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:7, background:"#0f766e", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⚡</div>
            <span style={{ fontSize:15, fontWeight:800, color:"#fff", letterSpacing:"-0.02em" }}>Readily</span>
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginLeft:4 }}>Provider</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.45)" }}>{providerName}</span>
            <button onClick={async()=>{ await supabase.auth.signOut(); window.location.reload(); }} style={{ padding:"5px 12px", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, color:"rgba(255,255,255,0.45)", fontFamily:"'DM Sans',sans-serif", fontSize:11, cursor:"pointer" }}>Sign out</button>
          </div>
        </div>

        <div style={{ padding:"28px 20px 60px", animation:"fadeIn 0.25s ease both" }}>
          {children.length===0 ? (
            <div style={{ maxWidth:440, margin:"60px auto", textAlign:"center" }}>
              <div style={{ fontSize:44, marginBottom:16 }}>🔍</div>
              <h2 style={{ margin:"0 0 10px", fontSize:20, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>No children yet</h2>
              <p style={{ margin:0, fontSize:14, color:T.ink3, fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>You haven't been added to any care teams yet. Ask a family to invite you through their Readily profile.</p>
            </div>
          ) : selected ? (
            <ChildDetailView child={selected} session={session} onBack={()=>setSelected(null)} />
          ) : (
            <ChildSelector children={children} onSelect={setSelected} />
          )}
        </div>
      </div>
    </>
  );
}
