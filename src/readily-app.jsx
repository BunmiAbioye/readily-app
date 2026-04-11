import { useState, useRef, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════
const T = {
  bg:       "#f6f8fb",
  white:    "#ffffff",
  surface:  "#f0f4fa",
  border:   "#e2e8f2",
  border2:  "#c8d4e8",
  ink:      "#0f172a",
  ink2:     "#334155",
  ink3:     "#64748b",
  ink4:     "#94a3b8",
  teal:     "#0d9488",
  tealL:    "#ccfbf1",
  tealD:    "#0f766e",
  indigo:   "#4f46e5",
  indigoL:  "#e0e7ff",
  violet:   "#7c3aed",
  gold:     "#d97706",
  goldL:    "#fef3c7",
  green:    "#059669",
  greenL:   "#d1fae5",
  rose:     "#e11d48",
  roseL:    "#ffe4e6",
  amber:    "#b45309",
  amberL:   "#fef3c7",
  slate:    "#475569",
  nav:      "#0c1a2e",
  navHover: "#162640",
  navActive:"#1e3a5f",
};

// ═══════════════════════════════════════════════════════════════════════════
// SHARED DATA
// ═══════════════════════════════════════════════════════════════════════════
const CHILD = { name: "Maya", age: 7, diagnosis: "ASD Level 2", school: "Sunridge Elementary" };

const SESSIONS = [
  { provider: "Sarah Chen", role: "Speech Therapist", date: "Mon, Apr 7", response: "Good", focusAreas: ["Expressive language", "Pragmatics"], win: "Produced 3-word phrases consistently with dinosaur picture prompts.", challenge: "Initiating conversation without prompting — still waits to be asked.", forFamily: "Try asking 'what do you want?' before meals — she's ready to practice this." },
  { provider: "James Thornton", role: "ABA Therapist", date: "Wed, Apr 9", response: "Exceptional", focusAreas: ["Transitions", "Following directions"], win: "Completed 4 consecutive transitions with the visual schedule — zero meltdowns.", challenge: "Multi-step instructions (3+ steps) still need physical prompts.", forFamily: "Keep the visual schedule visible at home — it's working really well." },
  { provider: "Ms. Rivera", role: "Special Ed Teacher", date: "Thu, Apr 10", response: "Mixed", focusAreas: ["Social language", "Group participation"], win: "Raised hand twice during circle time, unprompted.", challenge: "Group transitions after recess are still difficult — needs extra time.", forFamily: "She mentioned a boy named Leo today — ask her about him, she lit up." },
];

const THERAPIES = [
  { id: 1, type: "Speech Therapy",      provider: "Sarah Chen",     frequency: 2, freqUnit: "week", costPerSession: 180, coverage: "partial_80", startDate: "2026-01-01", endDate: "2026-12-31" },
  { id: 2, type: "ABA Therapy",         provider: "James Thornton", frequency: 3, freqUnit: "week", costPerSession: 220, coverage: "partial_50", startDate: "2026-01-01", endDate: "2026-12-31" },
  { id: 3, type: "Occupational Therapy",provider: "Dr. Lin",         frequency: 1, freqUnit: "week", costPerSession: 160, coverage: "none",       startDate: "2026-03-01", endDate: "2026-12-31" },
];

const DOCS = [
  { id: 1, name: "Maya_IEP_2025-2026.pdf", type: "iep", size: "2.4 MB", date: "Sep 2025", goals: ["Improve expressive vocabulary to 200+ words", "Initiate peer interaction 3x/day", "Follow 2-step directions independently", "Reduce transition meltdowns to <1/week"] },
  { id: 2, name: "ABA_Treatment_Plan_Q1_2026.pdf", type: "aba", size: "1.8 MB", date: "Jan 2026", goals: ["Functional communication using full sentences", "Independent task completion (3+ steps)", "Decrease self-stimulatory behaviors during instruction"] },
];

const FAMILY_GOALS = [
  { id: 1, text: "Maya asks for what she needs without being prompted", category: "Communication" },
  { id: 2, text: "Maya gets through a school morning without a meltdown", category: "Daily Living" },
  { id: 3, text: "Maya makes at least one friend she talks about at home", category: "Social" },
];

const COVERAGE_OPTIONS = [
  { id: "full", label: "Fully Covered", pct: 100, color: T.green },
  { id: "partial_80", label: "80% Covered", pct: 80, color: "#0891b2" },
  { id: "partial_50", label: "50% Covered", pct: 50, color: T.gold },
  { id: "none", label: "No Coverage", pct: 0, color: T.rose },
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════
const fmt$ = n => "$" + Math.round(n).toLocaleString();
const monthsBetween = (s, e) => { if (!s||!e) return 0; const a=new Date(s),b=new Date(e); return Math.max(0,(b.getFullYear()-a.getFullYear())*12+(b.getMonth()-a.getMonth())); };
const sessPerMo = (freq,unit) => unit==="week"?freq*4.33:unit==="month"?freq:freq/12;
const calcT = t => { const mo=monthsBetween(t.startDate,t.endDate); const spm=sessPerMo(Number(t.frequency)||0,t.freqUnit); const tot=Math.round(spm*mo); const gross=tot*(Number(t.costPerSession)||0); const cov=COVERAGE_OPTIONS.find(c=>c.id===t.coverage)||COVERAGE_OPTIONS[3]; return { months:mo, totalSessions:tot, grossTotal:gross, covered:gross*(cov.pct/100), outOfPocket:gross*(1-cov.pct/100), sessPerMonth:spm }; };

const RESP_STYLE = {
  Exceptional: { bg: T.greenL, color: T.green, dot: "#16a34a" },
  Good:        { bg: T.tealL,  color: T.teal,  dot: T.teal },
  Mixed:       { bg: T.amberL, color: T.amber, dot: T.gold },
  Difficult:   { bg: T.roseL,  color: T.rose,  dot: T.rose },
};

const DOC_TYPES = [
  { id:"iep",   label:"IEP",               color:T.indigo, icon:"📋" },
  { id:"aba",   label:"ABA Plan",          color:T.violet, icon:"🧩" },
  { id:"eval",  label:"Evaluation Report", color:"#0891b2",icon:"📊" },
  { id:"other", label:"Other",             color:T.ink3,   icon:"📄" },
];

// ═══════════════════════════════════════════════════════════════════════════
// NAV CONFIG
// ═══════════════════════════════════════════════════════════════════════════
const NAV = [
  { id:"dashboard", label:"Home",        icon:"⊞", shortLabel:"Home" },
  { id:"passport",  label:"Profile",    icon:"🪪", shortLabel:"Profile" },
  { id:"digest",    label:"Weekly Digest",icon:"📬",shortLabel:"Digest" },
  { id:"documents", label:"Docs & Goals",icon:"📁", shortLabel:"Docs" },
  { id:"costs",     label:"Cost Planner",icon:"💰", shortLabel:"Costs" },
  { id:"provider",  label:"Provider View",icon:"🩺",shortLabel:"Provider" },
];

// ═══════════════════════════════════════════════════════════════════════════
// PASSPORT BUILDER
// ═══════════════════════════════════════════════════════════════════════════
const PASSPORT_STEPS = ["Child","What Works","Watch For","Care Team","Profile"];
const TAG_OPTS = {
  motivators: ["Dinosaurs","Trains","Music","Drawing","Animals","Lego","Minecraft","Swimming","Cooking","Books","Puzzles","Dancing"],
  calming:    ["Deep pressure","Quiet space","Headphones","Fidget tools","Predictable routine","Verbal warnings","Visual schedule","Weighted blanket","Outdoor time"],
  comm:       ["Verbal","AAC device","PECS","Sign language","Picture cards","Written notes","Gestures"],
  triggers:   ["Loud sounds","Unexpected changes","Crowds","Bright lights","Certain textures","Being touched","Waiting","Transitions","New people","Strong smells"],
  sensory:    ["Seeks deep pressure","Avoids loud noise","Sensitive to light","Texture sensitive (food)","Texture sensitive (clothing)","Seeks movement","Avoids movement"],
};

function TagPicker({ opts, selected, onChange, color }) {
  const toggle = t => onChange(selected.includes(t) ? selected.filter(x=>x!==t) : [...selected,t]);
  return <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginTop:"8px" }}>
    {opts.map(t=><button key={t} onClick={()=>toggle(t)} style={{ padding:"5px 12px", borderRadius:"20px", border:selected.includes(t)?`2px solid ${color}`:`1.5px solid ${T.border}`, background:selected.includes(t)?color+"18":T.white, color:selected.includes(t)?color:T.ink3, fontFamily:"'DM Sans',sans-serif", fontSize:"12px", fontWeight:selected.includes(t)?"700":"400", cursor:"pointer", transition:"all 0.15s" }}>{t}</button>)}
  </div>;
}

function PassportBuilder() {
  const [step, setStep] = useState(0);
  const [d, setD] = useState({ name:CHILD.name, age:CHILD.age+"", school:CHILD.school, diagnosis:CHILD.diagnosis, motivators:["Dinosaurs","Drawing","Music"], calming:["Verbal warnings","Deep pressure"], comm:["Verbal","Picture cards"], triggers:["Loud sounds","Unexpected changes","Transitions"], sensory:["Seeks deep pressure","Avoids loud noise"], notes:"Needs 5-minute warnings before transitions.", team:[] });
  const upd = (k,v) => setD(x=>({...x,[k]:v}));
  const inp = { width:"100%", padding:"10px 12px", borderRadius:"8px", border:`1.5px solid ${T.border}`, fontFamily:"'DM Sans',sans-serif", fontSize:"14px", color:T.ink, background:T.white, boxSizing:"border-box" };

  const pages = [
    <div key="child">
      <p style={{ margin:"0 0 16px", fontSize:"14px", color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>Start with the basics. Everything here can be edited later.</p>
      {[["Child's name","name","text"],["Age","age","number"],["School or program","school","text"],["Diagnosis","diagnosis","text"]].map(([lbl,key,type])=>(
        <div key={key} style={{ marginBottom:"12px" }}>
          <label style={{ fontSize:"11px", fontWeight:"700", color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.05em", textTransform:"uppercase", display:"block", marginBottom:"5px" }}>{lbl}</label>
          <input style={inp} type={type} value={d[key]} onChange={e=>upd(key,e.target.value)} />
        </div>
      ))}
    </div>,
    <div key="works">
      <p style={{ margin:"0 0 16px", fontSize:"14px", color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>What helps {d.name||"your child"} thrive?</p>
      <label style={{ fontSize:"11px", fontWeight:"700", color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.05em", textTransform:"uppercase", display:"block" }}>Motivators & interests</label>
      <TagPicker opts={TAG_OPTS.motivators} selected={d.motivators} onChange={v=>upd("motivators",v)} color={T.green} />
      <div style={{ height:14 }} />
      <label style={{ fontSize:"11px", fontWeight:"700", color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.05em", textTransform:"uppercase", display:"block" }}>Calming strategies</label>
      <TagPicker opts={TAG_OPTS.calming} selected={d.calming} onChange={v=>upd("calming",v)} color={T.teal} />
      <div style={{ height:14 }} />
      <label style={{ fontSize:"11px", fontWeight:"700", color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.05em", textTransform:"uppercase", display:"block" }}>Communication style</label>
      <TagPicker opts={TAG_OPTS.comm} selected={d.comm} onChange={v=>upd("comm",v)} color={T.violet} />
    </div>,
    <div key="watch">
      <p style={{ margin:"0 0 16px", fontSize:"14px", color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>Help others avoid what's hard for {d.name||"your child"}.</p>
      <label style={{ fontSize:"11px", fontWeight:"700", color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.05em", textTransform:"uppercase", display:"block" }}>Triggers</label>
      <TagPicker opts={TAG_OPTS.triggers} selected={d.triggers} onChange={v=>upd("triggers",v)} color="#dc2626" />
      <div style={{ height:14 }} />
      <label style={{ fontSize:"11px", fontWeight:"700", color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.05em", textTransform:"uppercase", display:"block" }}>Sensory profile</label>
      <TagPicker opts={TAG_OPTS.sensory} selected={d.sensory} onChange={v=>upd("sensory",v)} color={T.amber} />
      <div style={{ height:14 }} />
      <label style={{ fontSize:"11px", fontWeight:"700", color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.05em", textTransform:"uppercase", display:"block", marginBottom:5 }}>Anything else to know</label>
      <textarea style={{ ...inp, minHeight:72, resize:"vertical" }} value={d.notes} onChange={e=>upd("notes",e.target.value)} />
    </div>,
    <div key="team">
      <p style={{ margin:"0 0 16px", fontSize:"14px", color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>Who supports {d.name||"your child"}? They'll be invited to log session notes.</p>
      {SESSIONS.map((s,i)=>(
        <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:T.surface, borderRadius:10, border:`1px solid ${T.border}`, marginBottom:8 }}>
          <div style={{ width:34, height:34, borderRadius:"50%", background:`hsl(${i*80+20},55%,85%)`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, color:`hsl(${i*80+20},55%,30%)`, fontFamily:"'DM Sans',sans-serif", flexShrink:0 }}>{s.provider[0]}</div>
          <div><div style={{ fontSize:13, fontWeight:600, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>{s.provider}</div><div style={{ fontSize:11, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>{s.role}</div></div>
        </div>
      ))}
    </div>,
    <div key="passport">
      <p style={{ margin:"0 0 16px", fontSize:"14px", color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>{d.name}'s passport is ready to share with anyone on the care team.</p>
      {[
        { label:"Child", color:T.teal, content:<><div style={{ fontSize:18, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>{d.name}</div><div style={{ fontSize:12, color:T.ink3, fontFamily:"'DM Sans',sans-serif", marginTop:3 }}>{[d.age&&`Age ${d.age}`,d.school,d.diagnosis].filter(Boolean).join(" · ")}</div></> },
        { label:"✓ What Works", color:T.green, content:<div style={{ fontSize:12, color:T.ink2, fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}><b style={{ color:T.green }}>Motivators: </b>{d.motivators.join(", ")}<br/><b style={{ color:T.green }}>Calming: </b>{d.calming.join(", ")}<br/><b style={{ color:T.green }}>Communication: </b>{d.comm.join(", ")}</div> },
        { label:"⚠ Watch For", color:"#dc2626", content:<div style={{ fontSize:12, color:T.ink2, fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}><b style={{ color:"#dc2626" }}>Triggers: </b>{d.triggers.join(", ")}<br/><b style={{ color:"#dc2626" }}>Sensory: </b>{d.sensory.join(", ")}</div> },
      ].map((s,i)=>(
        <div key={i} style={{ background:s.color+"12", border:`1px solid ${s.color}33`, borderRadius:12, padding:"14px 16px", marginBottom:10 }}>
          <div style={{ fontSize:10, fontWeight:700, color:s.color, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>{s.label}</div>
          {s.content}
        </div>
      ))}
      <div style={{ background:T.tealD, borderRadius:12, padding:"14px 16px", textAlign:"center" }}>
        <div style={{ fontSize:13, fontWeight:700, color:"#fff", fontFamily:"'DM Sans',sans-serif", marginBottom:6 }}>🔗 Share link ready</div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", fontFamily:"monospace" }}>readily.app/{d.name.toLowerCase()}-{Math.random().toString(36).slice(2,6)}</div>
      </div>
    </div>
  ];

  return (
    <div style={{ maxWidth:560, margin:"0 auto" }}>
      <div style={{ marginBottom:20 }}>
        <div style={{ display:"flex", gap:6, marginBottom:16 }}>
          {PASSPORT_STEPS.map((s,i)=><div key={s} style={{ height:4, flex:1, borderRadius:2, background:i<=step?T.teal:T.border, transition:"background 0.3s" }} />)}
        </div>
        <div style={{ fontSize:11, fontWeight:700, color:T.teal, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:4 }}>Step {step+1} of {PASSPORT_STEPS.length} · {PASSPORT_STEPS[step]}</div>
        <h2 style={{ margin:0, fontSize:22, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>{PASSPORT_STEPS[step]}</h2>
      </div>
      <div style={{ background:T.white, borderRadius:16, padding:24, border:`1px solid ${T.border}`, boxShadow:"0 2px 12px rgba(0,0,0,0.05)", marginBottom:16 }}>
        {pages[step]}
      </div>
      <div style={{ display:"flex", gap:10 }}>
        {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{ padding:"11px 20px", background:T.white, border:`1.5px solid ${T.border}`, borderRadius:10, color:T.ink2, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:14, cursor:"pointer" }}>← Back</button>}
        {step<PASSPORT_STEPS.length-1
          ? <button onClick={()=>setStep(s=>s+1)} style={{ flex:1, padding:"11px 20px", background:`linear-gradient(135deg,${T.teal},${T.tealD})`, border:"none", borderRadius:10, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:"0 4px 12px rgba(13,148,136,0.3)" }}>Continue →</button>
          : <button style={{ flex:1, padding:"11px 20px", background:`linear-gradient(135deg,${T.indigo},${T.violet})`, border:"none", borderRadius:10, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14, cursor:"pointer" }}>📤 Share Passport</button>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WEEKLY DIGEST
// ═══════════════════════════════════════════════════════════════════════════
function buildDigestPrompt() {
  const lines = SESSIONS.map((s,i)=>`Session ${i+1}: ${s.role} (${s.date}) — Response: ${s.response}. Win: "${s.win}" Challenge: "${s.challenge}" For family: "${s.forFamily}"`).join("\n");
  return `Write a warm weekly digest for parents of Maya, age 7, ASD Level 2.\n\nSESSIONS:\n${lines}\n\nRespond ONLY with JSON (no markdown):\n{"headline":"warm specific week headline","narrative":"2-3 sentences synthesizing the week warmly","bigWin":"single best moment 1 sentence","pattern":"cross-provider pattern 1-2 sentences","forHome":["up to 3 home tips under 15 words each"],"lookAhead":"1 optimistic sentence"}`;
}

function WeeklyDigestScreen() {
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openCard, setOpenCard] = useState(null);
  const ran = useRef(false);

  const generate = async () => {
    setLoading(true); setDigest(null);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{role:"user",content:buildDigestPrompt()}] }) });
      const data = await r.json();
      const text = data.content?.map(b=>b.text||"").join("") || "";
      setDigest(JSON.parse(text.replace(/```json|```/g,"").trim()));
    } catch(e) { setDigest(null); } finally { setLoading(false); }
  };

  useEffect(() => { if (!ran.current) { ran.current=true; generate(); } }, []);

  const overall = (() => {
    const map={Exceptional:4,Good:3,Mixed:2,Difficult:1};
    const avg=SESSIONS.reduce((s,x)=>s+(map[x.response]||2),0)/SESSIONS.length;
    if(avg>=3.5) return {label:"Exceptional week",color:T.green,bg:T.greenL,emoji:"🌟"};
    if(avg>=2.5) return {label:"Good week",color:T.teal,bg:T.tealL,emoji:"👍"};
    return {label:"Mixed week",color:T.amber,bg:T.amberL,emoji:"↕️"};
  })();

  // weekly cost
  const weekOop = 180*0.2*2 + 220*0.5*3;

  return (
    <div style={{ maxWidth:620, margin:"0 auto" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:T.gold, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.1em", marginBottom:4 }}>WEEK OF APR 7–11, 2026</div>
          <h2 style={{ margin:0, fontSize:26, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>{CHILD.name}'s Week</h2>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ padding:"8px 14px", background:overall.bg, borderRadius:10, display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:16 }}>{overall.emoji}</span>
            <span style={{ fontWeight:700, fontSize:13, color:overall.color, fontFamily:"'DM Sans',sans-serif" }}>{overall.label}</span>
          </div>
          <button onClick={generate} disabled={loading} style={{ padding:"8px 14px", background:T.ink, border:"none", borderRadius:8, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:12, cursor:loading?"not-allowed":"pointer" }}>{loading?"…":"↻"}</button>
        </div>
      </div>

      {/* AI digest card */}
      {loading && (
        <div style={{ background:T.white, borderRadius:16, padding:24, border:`1px solid ${T.border}`, marginBottom:16 }}>
          {[90,75,85,60].map((w,i)=><div key={i} style={{ height:i===0?20:12, width:`${w}%`, background:T.gold+"22", borderRadius:6, marginBottom:10, animation:"shimmer 1.2s ease infinite", animationDelay:`${i*100}ms` }} />)}
        </div>
      )}

      {digest && (
        <div style={{ background:`linear-gradient(145deg,#fffbf5,${T.goldL}88)`, borderRadius:16, padding:24, border:`1px solid ${T.border}`, boxShadow:`0 4px 20px ${T.gold}14`, marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:14 }}>
            <div style={{ width:20, height:20, borderRadius:"50%", background:`linear-gradient(135deg,${T.gold},${T.goldL})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10 }}>✨</div>
            <span style={{ fontSize:10, fontWeight:700, color:T.gold, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.1em" }}>AI WEEKLY SUMMARY</span>
          </div>
          <h3 style={{ margin:"0 0 12px", fontSize:19, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif", lineHeight:1.3 }}>{digest.headline}</h3>
          <p style={{ margin:"0 0 18px", fontSize:14, color:T.ink2, fontFamily:"'DM Sans',sans-serif", lineHeight:1.7 }}>{digest.narrative}</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
            <div style={{ background:T.greenL, borderRadius:10, padding:"12px 14px", border:`1px solid #86efac` }}>
              <div style={{ fontSize:10, fontWeight:700, color:T.green, fontFamily:"'DM Sans',sans-serif", marginBottom:5 }}>🏆 BIG WIN</div>
              <p style={{ margin:0, fontSize:12, color:"#14532d", fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>{digest.bigWin}</p>
            </div>
            <div style={{ background:T.tealL, borderRadius:10, padding:"12px 14px", border:`1px solid #99f6e4` }}>
              <div style={{ fontSize:10, fontWeight:700, color:T.teal, fontFamily:"'DM Sans',sans-serif", marginBottom:5 }}>🔍 PATTERN</div>
              <p style={{ margin:0, fontSize:12, color:"#134e4a", fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>{digest.pattern}</p>
            </div>
          </div>
          {digest.forHome?.length>0&&(
            <div style={{ background:"rgba(217,119,6,0.08)", borderRadius:10, padding:"12px 14px", marginBottom:12 }}>
              <div style={{ fontSize:10, fontWeight:700, color:T.amber, fontFamily:"'DM Sans',sans-serif", marginBottom:8 }}>🏠 TRY AT HOME</div>
              {digest.forHome.map((tip,i)=>(
                <div key={i} style={{ display:"flex", gap:8, marginBottom:i<digest.forHome.length-1?6:0 }}>
                  <span style={{ width:18, height:18, borderRadius:"50%", background:T.gold, color:"#fff", fontSize:10, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontFamily:"'DM Sans',sans-serif" }}>{i+1}</span>
                  <span style={{ fontSize:12, color:T.ink2, fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>{tip}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display:"flex", gap:8, alignItems:"flex-start", padding:"10px 12px", background:T.white, borderRadius:8, border:`1px solid ${T.border}` }}>
            <span style={{ fontSize:14, flexShrink:0 }}>🌅</span>
            <span style={{ fontSize:12, color:T.ink2, fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>{digest.lookAhead}</span>
          </div>
        </div>
      )}

      {/* Session cards */}
      {SESSIONS.map((s,i)=>{
        const rs=RESP_STYLE[s.response]||RESP_STYLE.Good;
        return (
          <div key={i} style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:12, overflow:"hidden", marginBottom:8 }}>
            <div onClick={()=>setOpenCard(openCard===i?null:i)} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", cursor:"pointer" }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:`hsl(${i*80+20},60%,88%)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:`hsl(${i*80+20},55%,30%)`, flexShrink:0 }}>{s.provider[0]}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:13, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>{s.provider}</div>
                <div style={{ fontSize:11, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>{s.role} · {s.date}</div>
              </div>
              <span style={{ padding:"3px 10px", borderRadius:20, background:rs.bg, color:rs.color, fontSize:11, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>{s.response}</span>
              <span style={{ color:T.ink3, fontSize:10, transform:openCard===i?"rotate(180deg)":"rotate(0)", transition:"transform 0.2s", display:"inline-block" }}>▼</span>
            </div>
            {openCard===i&&(
              <div style={{ padding:"0 16px 14px", borderTop:`1px solid ${T.border}` }}>
                <div style={{ paddingTop:12 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:T.green, fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>WIN</div>
                  <p style={{ margin:"0 0 10px", fontSize:13, color:T.ink2, fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>{s.win}</p>
                  <div style={{ fontSize:11, fontWeight:700, color:T.amber, fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>WORKING ON</div>
                  <p style={{ margin:"0 0 10px", fontSize:13, color:T.ink2, fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>{s.challenge}</p>
                  {s.forFamily&&<div style={{ background:T.tealL, borderRadius:8, padding:"8px 12px", border:`1px solid ${T.teal}33` }}><div style={{ fontSize:10, fontWeight:700, color:T.teal, fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>FOR HOME</div><p style={{ margin:0, fontSize:12, color:T.teal, fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>{s.forFamily}</p></div>}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Cost snapshot */}
      <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:12, padding:"16px 18px", marginTop:4 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ fontSize:11, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em" }}>💰 THIS WEEK'S COST</div>
          <span style={{ fontSize:11, color:T.gold, fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>Full planner →</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <div style={{ flex:1, background:T.surface, borderRadius:8, padding:"10px 12px" }}>
            <div style={{ fontSize:10, color:T.ink3, fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>WEEK BILLED</div>
            <div style={{ fontSize:18, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>{fmt$(180*2+220*3)}</div>
          </div>
          <div style={{ flex:1, background:"#fff7ed", borderRadius:8, padding:"10px 12px", border:`1px solid #fed7aa` }}>
            <div style={{ fontSize:10, color:"#92400e", fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>OUT OF POCKET</div>
            <div style={{ fontSize:18, fontWeight:800, color:"#c2410c", fontFamily:"'DM Sans',sans-serif" }}>{fmt$(weekOop)}</div>
          </div>
        </div>
        <div style={{ marginTop:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <span style={{ fontSize:11, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>YTD out-of-pocket</span>
            <span style={{ fontSize:11, fontWeight:700, color:T.ink2, fontFamily:"'DM Sans',sans-serif" }}>$4,820 of $18,500</span>
          </div>
          <div style={{ height:7, background:T.border, borderRadius:4, overflow:"hidden" }}>
            <div style={{ height:"100%", width:"26%", background:`linear-gradient(90deg,${T.gold},${T.goldL})`, borderRadius:4 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENTS & GOALS
// ═══════════════════════════════════════════════════════════════════════════
function buildReportPrompt(docs, goals) {
  const allGoals = docs.flatMap(d=>d.goals||[]);
  const famGoals = goals.map(g=>g.text);
  const sessions = SESSIONS.map(s=>`${s.role}: Win="${s.win}" Challenge="${s.challenge}"`).join("\n");
  return `Generate progress report for Maya, age 7, ASD Level 2.\n\nOFFICIAL GOALS:\n${allGoals.map((g,i)=>`${i+1}. ${g}`).join("\n")}\n\nFAMILY GOALS:\n${famGoals.map((g,i)=>`${i+1}. ${g}`).join("\n")}\n\nRECENT SESSIONS:\n${sessions}\n\nRespond ONLY with JSON:\n{"reportTitle":"warm specific title","overallSummary":"2-3 warm sentences","goalProgress":[{"goal":"goal text","source":"IEP or ABA Plan or Family Goal","status":"On Track or Making Progress or Needs Attention or Not Yet Started","evidence":"1-2 sentences","tip":"one concrete suggestion"}],"focusAreas":["up to 3 short focus areas"],"strengths":["up to 3 strengths 1 sentence each"],"suggestedChanges":["1-3 changes to consider"],"encouragement":"warm closing sentence"}`;
}

function DocsGoalsScreen() {
  const [tab, setTab] = useState("docs");
  const [docs, setDocs] = useState(DOCS);
  const [goals, setGoals] = useState(FAMILY_GOALS);
  const [newGoal, setNewGoal] = useState(""); const [newCat, setNewCat] = useState("Communication");
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const fileRef = useRef();

  const removeDoc = id => setDocs(d=>d.filter(x=>x.id!==id));
  const removeGoal = id => setGoals(g=>g.filter(x=>x.id!==id));
  const addGoal = () => { if(!newGoal.trim()) return; setGoals(g=>[...g,{id:Date.now(),text:newGoal.trim(),category:newCat}]); setNewGoal(""); setShowForm(false); };

  const generateReport = async () => {
    setGenerating(true); setReport(null);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{role:"user",content:buildReportPrompt(docs,goals)}] }) });
      const data = await r.json();
      const text = data.content?.map(b=>b.text||"").join("") || "";
      setReport(JSON.parse(text.replace(/```json|```/g,"").trim()));
    } catch(e) { setReport(null); } finally { setGenerating(false); }
  };

  const SC = { "On Track":{color:T.green,bg:T.greenL,icon:"✓"}, "Making Progress":{color:"#0891b2",bg:T.tealL,icon:"↗"}, "Needs Attention":{color:T.amber,bg:T.amberL,icon:"!"}, "Not Yet Started":{color:T.ink3,bg:T.surface,icon:"○"} };
  const DT_COLORS = { iep:T.indigo, aba:T.violet, eval:"#0891b2", other:T.ink3 };
  const DT_ICONS = { iep:"📋", aba:"🧩", eval:"📊", other:"📄" };

  return (
    <div style={{ maxWidth:620, margin:"0 auto" }}>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ margin:"0 0 4px", fontSize:24, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>Documents & Goals</h2>
        <p style={{ margin:0, fontSize:13, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>Upload IEPs and plans. Add family goals. Generate AI progress reports anchored to what matters.</p>
      </div>

      {/* Generate CTA */}
      <div style={{ background:`linear-gradient(135deg,${T.indigo}22,${T.violet}15)`, border:`1px solid ${T.indigo}44`, borderRadius:14, padding:"18px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:14, color:T.ink, fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>Generate Progress Report</div>
          <div style={{ fontSize:12, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>AI cross-references documents, family goals, and recent sessions to show how Maya is progressing.</div>
        </div>
        <button onClick={generateReport} disabled={generating} style={{ padding:"10px 18px", background:generating?T.surface:`linear-gradient(135deg,${T.indigo},${T.violet})`, border:"none", borderRadius:10, color:generating?T.ink3:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:13, cursor:generating?"not-allowed":"pointer", boxShadow:generating?"none":"0 4px 12px rgba(79,70,229,0.35)" }}>
          {generating?"✨ Generating…":"✨ Generate Now"}
        </button>
      </div>

      {/* Report output */}
      {report&&(
        <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden", marginBottom:20 }}>
          <div style={{ background:`linear-gradient(135deg,${T.indigo}cc,${T.violet}cc)`, padding:"20px 22px" }}>
            <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.7)", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.1em", marginBottom:6 }}>AI PROGRESS REPORT</div>
            <h3 style={{ margin:"0 0 8px", fontSize:18, fontWeight:800, color:"#fff", fontFamily:"'DM Sans',sans-serif" }}>{report.reportTitle}</h3>
            <p style={{ margin:0, fontSize:13, color:"rgba(255,255,255,0.85)", fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>{report.overallSummary}</p>
          </div>
          <div style={{ padding:"18px 20px" }}>
            {report.goalProgress?.slice(0,4).map((g,i)=>{
              const s=SC[g.status]||SC["Making Progress"];
              return <div key={i} style={{ background:T.surface, borderRadius:10, padding:"12px 14px", marginBottom:8 }}>
                <div style={{ display:"flex", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                  <span style={{ padding:"2px 9px", borderRadius:20, background:s.bg, color:s.color, fontSize:11, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>{s.icon} {g.status}</span>
                  <span style={{ padding:"2px 9px", borderRadius:4, background:T.indigoL, color:T.indigo, fontSize:11, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>{g.source}</span>
                </div>
                <div style={{ fontSize:13, fontWeight:600, color:T.ink, fontFamily:"'DM Sans',sans-serif", marginBottom:4 }}>{g.goal}</div>
                <div style={{ fontSize:12, color:T.ink2, fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>{g.evidence}</div>
                {g.tip&&<div style={{ marginTop:6, padding:"6px 10px", background:T.indigoL, borderRadius:6, fontSize:11, color:T.indigo, fontFamily:"'DM Sans',sans-serif" }}>💡 {g.tip}</div>}
              </div>;
            })}
            {report.encouragement&&<div style={{ padding:"12px 14px", background:`linear-gradient(135deg,${T.indigoL},${T.tealL})`, borderRadius:10, border:`1px solid ${T.indigo}22`, fontSize:13, color:T.ink, fontFamily:"'DM Sans',sans-serif", lineHeight:1.6, fontStyle:"italic" }}>🌱 {report.encouragement}</div>}
            <div style={{ display:"flex", gap:8, marginTop:14 }}>
              <button style={{ flex:1, padding:"10px", background:`linear-gradient(135deg,${T.indigo},${T.violet})`, border:"none", borderRadius:8, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>📧 Send to email</button>
              <button style={{ padding:"10px 16px", background:T.white, border:`1px solid ${T.border}`, borderRadius:8, color:T.ink2, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, cursor:"pointer" }}>⬇ PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:16, background:T.surface, borderRadius:10, padding:4, border:`1px solid ${T.border}`, width:"fit-content" }}>
        {[["docs","📁 Documents"],["goals","🎯 Family Goals"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ padding:"7px 16px", borderRadius:7, border:"none", background:tab===id?T.white:"transparent", color:tab===id?T.ink:T.ink3, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, cursor:"pointer", boxShadow:tab===id?"0 1px 4px rgba(0,0,0,0.08)":"none" }}>{lbl}</button>
        ))}
      </div>

      {tab==="docs"&&(
        <div>
          <div style={{ background:T.white, border:`2px dashed ${T.border2}`, borderRadius:12, padding:16, marginBottom:12, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
            <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:600, color:T.ink, fontFamily:"'DM Sans',sans-serif", marginBottom:2 }}>Upload a document</div><div style={{ fontSize:11, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>PDF, image or Word · Goals extracted automatically</div></div>
            <input ref={fileRef} type="file" style={{ display:"none" }} />
            <button onClick={()=>fileRef.current?.click()} style={{ padding:"8px 16px", background:T.indigo, border:"none", borderRadius:8, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>⬆ Upload</button>
          </div>
          {docs.map((d,i)=>(
            <div key={d.id} style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:12, padding:"14px 16px", display:"flex", gap:12, marginBottom:8 }}>
              <div style={{ width:36, height:36, borderRadius:8, background:(DT_COLORS[d.type]||T.ink3)+"20", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{DT_ICONS[d.type]||"📄"}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:13, color:T.ink, fontFamily:"'DM Sans',sans-serif", marginBottom:2 }}>{d.name}</div>
                <div style={{ fontSize:11, color:T.ink3, fontFamily:"'DM Sans',sans-serif", marginBottom:6 }}>{d.size} · {d.date}</div>
                {d.goals?.slice(0,2).map((g,j)=><div key={j} style={{ fontSize:11, color:T.ink2, fontFamily:"'DM Sans',sans-serif", marginBottom:2, display:"flex", gap:5 }}><span style={{ color:DT_COLORS[d.type], fontSize:10 }}>▸</span>{g}</div>)}
                {d.goals?.length>2&&<div style={{ fontSize:10, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>+{d.goals.length-2} more</div>}
              </div>
              <button onClick={()=>removeDoc(d.id)} style={{ background:"none", border:"none", color:T.ink4, cursor:"pointer", fontSize:16 }}>×</button>
            </div>
          ))}
        </div>
      )}

      {tab==="goals"&&(
        <div>
          {goals.map((g,i)=>(
            <div key={g.id} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"12px 14px", background:T.white, borderRadius:10, border:`1px solid ${T.border}`, marginBottom:8 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:[T.indigo,T.violet,T.green,T.teal,T.amber][i%5], flexShrink:0, marginTop:5 }} />
              <div style={{ flex:1 }}><div style={{ fontSize:13, color:T.ink, fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>{g.text}</div><div style={{ fontSize:10, color:T.ink3, fontFamily:"'DM Sans',sans-serif", marginTop:2 }}>{g.category}</div></div>
              <button onClick={()=>removeGoal(g.id)} style={{ background:"none", border:"none", color:T.ink4, cursor:"pointer", fontSize:16 }}>×</button>
            </div>
          ))}
          {showForm?(
            <div style={{ background:T.white, border:`1px solid ${T.border2}`, borderRadius:12, padding:14, marginTop:8 }}>
              <textarea value={newGoal} onChange={e=>setNewGoal(e.target.value)} placeholder="e.g. Maya can order her own food at a restaurant" style={{ width:"100%", padding:"9px 11px", background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:8, color:T.ink, fontFamily:"'DM Sans',sans-serif", fontSize:13, minHeight:64, resize:"vertical", marginBottom:8, boxSizing:"border-box" }} />
              <div style={{ display:"flex", gap:8 }}>
                <select value={newCat} onChange={e=>setNewCat(e.target.value)} style={{ padding:"7px 10px", background:T.surface, border:`1px solid ${T.border}`, borderRadius:7, fontFamily:"'DM Sans',sans-serif", fontSize:12, color:T.ink }}>
                  {["Communication","Daily Living","Social","Academic","Emotional","Motor","Other"].map(c=><option key={c}>{c}</option>)}
                </select>
                <div style={{ flex:1 }} />
                <button onClick={()=>setShowForm(false)} style={{ padding:"7px 14px", background:"none", border:`1px solid ${T.border}`, borderRadius:7, color:T.ink3, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:12, cursor:"pointer" }}>Cancel</button>
                <button onClick={addGoal} style={{ padding:"7px 16px", background:T.green, border:"none", borderRadius:7, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:12, cursor:"pointer" }}>Add</button>
              </div>
            </div>
          ):(
            <button onClick={()=>setShowForm(true)} style={{ width:"100%", marginTop:8, padding:12, background:"transparent", border:`2px dashed ${T.border2}`, borderRadius:10, color:T.ink3, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <span style={{ fontSize:16 }}>+</span> Add a family goal
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COST ESTIMATOR (inline)
// ═══════════════════════════════════════════════════════════════════════════
const THERAPY_COLORS_LIST = ["#2563eb","#7c3aed","#059669","#d97706","#e11d48","#0891b2"];

function CostEstimatorScreen() {
  const [therapies, setTherapies] = useState(THERAPIES.map(t=>({...t})));
  const [expanded, setExpanded] = useState(1);
  const [view, setView] = useState("list");

  const update = (id,key,val) => setTherapies(ts=>ts.map(t=>t.id===id?{...t,[key]:val}:t));
  const remove = id => setTherapies(ts=>ts.filter(t=>t.id!==id));
  const add = () => { const id=Date.now(); setTherapies(ts=>[...ts,{id,type:"Speech Therapy",provider:"",frequency:1,freqUnit:"week",costPerSession:150,coverage:"none",startDate:new Date().toISOString().slice(0,10),endDate:new Date(Date.now()+365*86400000).toISOString().slice(0,10)}]); setExpanded(id); };

  const calcs = useMemo(()=>therapies.map(t=>({...t,...calcT(t)})),[therapies]);
  const totals = useMemo(()=>({ gross:calcs.reduce((s,c)=>s+c.grossTotal,0), covered:calcs.reduce((s,c)=>s+c.covered,0), oop:calcs.reduce((s,c)=>s+c.outOfPocket,0), sessions:calcs.reduce((s,c)=>s+c.totalSessions,0) }),[calcs]);

  const chartData = useMemo(()=>{
    const map={};
    therapies.forEach(t=>{
      const mo=monthsBetween(t.startDate,t.endDate); if(!mo||!t.startDate) return;
      const start=new Date(t.startDate);
      const spm=sessPerMo(Number(t.frequency)||0,t.freqUnit);
      const cov=COVERAGE_OPTIONS.find(c=>c.id===t.coverage)||COVERAGE_OPTIONS[3];
      const oopPerSess=(Number(t.costPerSession)||0)*(1-cov.pct/100);
      for(let m=0;m<mo;m++){ const d=new Date(start.getFullYear(),start.getMonth()+m,1); const key=d.toLocaleDateString("en-US",{month:"short",year:"2-digit"}); if(!map[key]) map[key]={month:key,total:0}; map[key].total+=spm*oopPerSess; }
    });
    return Object.values(map).slice(0,12);
  },[therapies]);

  const inp = (t,key,type="text") => <input type={type} value={t[key]} onChange={e=>update(t.id,key,e.target.value)} style={{ width:"100%", padding:"8px 10px", background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:T.ink, boxSizing:"border-box" }} />;

  return (
    <div style={{ maxWidth:700, margin:"0 auto" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <div>
          <h2 style={{ margin:"0 0 4px", fontSize:24, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>Treatment Cost Planner</h2>
          <p style={{ margin:0, fontSize:13, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>Understand your full financial picture, therapy by therapy.</p>
        </div>
        <div style={{ display:"flex", gap:4, background:T.surface, borderRadius:8, padding:3, border:`1px solid ${T.border}` }}>
          {[["list","≡ List"],["chart","▦ Chart"]].map(([id,lbl])=><button key={id} onClick={()=>setView(id)} style={{ padding:"5px 14px", borderRadius:6, border:"none", background:view===id?T.white:"transparent", color:view===id?T.ink:T.ink3, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:12, cursor:"pointer" }}>{lbl}</button>)}
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:18 }}>
        {[
          {label:"Gross Total",value:fmt$(totals.gross),color:T.ink,bg:T.white},
          {label:"Insurance Covers",value:fmt$(totals.covered),color:T.green,bg:T.greenL},
          {label:"Your Out-of-Pocket",value:fmt$(totals.oop),color:T.rose,bg:T.roseL},
          {label:"Monthly Average",value:fmt$(totals.oop/Math.max(1,Math.max(...calcs.map(c=>c.months)))),color:T.amber,bg:T.amberL},
        ].map((s,i)=>(
          <div key={i} style={{ background:s.bg, border:`1.5px solid ${T.border}`, borderRadius:12, padding:"14px 16px" }}>
            <div style={{ fontSize:10, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:5 }}>{s.label}</div>
            <div style={{ fontSize:22, fontWeight:800, color:s.color, fontFamily:"'DM Sans',sans-serif" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Coverage bar */}
      {totals.gross>0&&(
        <div style={{ background:T.white, border:`1.5px solid ${T.border}`, borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em", marginBottom:10 }}>COVERAGE BREAKDOWN</div>
          <div style={{ height:12, borderRadius:6, overflow:"hidden", display:"flex", marginBottom:10 }}>
            <div style={{ width:`${(totals.covered/totals.gross)*100}%`, background:`linear-gradient(90deg,${T.green},#10b981)`, transition:"width 0.4s ease" }} />
            <div style={{ flex:1, background:T.roseL }} />
          </div>
          <div style={{ display:"flex", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}><div style={{ width:10, height:10, borderRadius:2, background:T.green }} /><span style={{ fontSize:12, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>Insurance: {fmt$(totals.covered)}</span></div>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}><div style={{ width:10, height:10, borderRadius:2, background:T.rose }} /><span style={{ fontSize:12, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>Out of Pocket: {fmt$(totals.oop)}</span></div>
          </div>
        </div>
      )}

      {/* Chart */}
      {view==="chart"&&chartData.length>0&&(
        <div style={{ background:T.white, border:`1.5px solid ${T.border}`, borderRadius:12, padding:"16px 16px 8px", marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em", marginBottom:12 }}>MONTHLY OUT-OF-POCKET ESTIMATE</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={24}>
              <XAxis dataKey="month" tick={{ fontSize:10, fontFamily:"'DM Sans',sans-serif", fill:T.ink3 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fontFamily:"'DM Sans',sans-serif", fill:T.ink3 }} axisLine={false} tickLine={false} tickFormatter={v=>"$"+Math.round(v/100)*100} width={55} />
              <Tooltip formatter={v=>[fmt$(v),"Out of Pocket"]} contentStyle={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:12 }} cursor={{ fill:T.surface }} />
              <Bar dataKey="total" radius={[4,4,0,0]}>{chartData.map((_,i)=><Cell key={i} fill={i%2===0?"#2563eb":"#60a5fa"} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Therapy rows */}
      {view==="list"&&(
        <>
          {therapies.map((t,i)=>{
            const c=calcT(t); const col=THERAPY_COLORS_LIST[i%THERAPY_COLORS_LIST.length]; const cov=COVERAGE_OPTIONS.find(x=>x.id===t.coverage)||COVERAGE_OPTIONS[3];
            return (
              <div key={t.id} style={{ background:T.white, border:`1.5px solid ${expanded===t.id?col+"66":T.border}`, borderRadius:12, overflow:"hidden", marginBottom:8, boxShadow:expanded===t.id?`0 4px 16px ${col}14`:"0 1px 4px rgba(0,0,0,0.04)" }}>
                <div onClick={()=>setExpanded(expanded===t.id?null:t.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"13px 16px", cursor:"pointer" }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:col, flexShrink:0 }} />
                  <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:13, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>{t.type}</div><div style={{ fontSize:11, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>{t.provider||"—"} · {t.frequency}×/{t.freqUnit} · {fmt$(t.costPerSession)}/session</div></div>
                  <div style={{ textAlign:"right" }}><div style={{ fontSize:15, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>{fmt$(c.outOfPocket)}</div><div style={{ fontSize:10, color:T.ink4, fontFamily:"'DM Sans',sans-serif" }}>out of pocket</div></div>
                  <span style={{ color:T.ink3, fontSize:10, transform:expanded===t.id?"rotate(180deg)":"rotate(0)", transition:"transform 0.2s", display:"inline-block" }}>▼</span>
                </div>
                {expanded===t.id&&(
                  <div style={{ padding:"0 16px 16px", borderTop:`1px solid ${T.border}` }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:14 }}>
                      <div><label style={{ fontSize:10, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em", display:"block", marginBottom:5 }}>FREQUENCY</label><div style={{ display:"flex", gap:5 }}><input type="number" value={t.frequency} min="1" onChange={e=>update(t.id,"frequency",e.target.value)} style={{ width:60, padding:"8px 8px", background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:T.ink }} /><select value={t.freqUnit} onChange={e=>update(t.id,"freqUnit",e.target.value)} style={{ flex:1, padding:"8px 8px", background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:12, color:T.ink }}><option value="week">per week</option><option value="month">per month</option><option value="year">per year</option></select></div></div>
                      <div><label style={{ fontSize:10, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em", display:"block", marginBottom:5 }}>COST/SESSION</label><div style={{ position:"relative" }}><span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:T.ink3, fontSize:13 }}>$</span><input type="number" value={t.costPerSession} min="0" onChange={e=>update(t.id,"costPerSession",e.target.value)} style={{ width:"100%", padding:"8px 10px 8px 22px", background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:T.ink, boxSizing:"border-box" }} /></div></div>
                      <div><label style={{ fontSize:10, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em", display:"block", marginBottom:5 }}>START</label>{inp(t,"startDate","date")}</div>
                      <div><label style={{ fontSize:10, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em", display:"block", marginBottom:5 }}>END</label>{inp(t,"endDate","date")}</div>
                      <div style={{ gridColumn:"1/-1" }}>
                        <label style={{ fontSize:10, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em", display:"block", marginBottom:7 }}>INSURANCE COVERAGE</label>
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                          {COVERAGE_OPTIONS.map(opt=><button key={opt.id} onClick={()=>update(t.id,"coverage",opt.id)} style={{ padding:"5px 12px", borderRadius:20, border:t.coverage===opt.id?`2px solid ${opt.color}`:`1.5px solid ${T.border}`, background:t.coverage===opt.id?opt.color+"15":T.white, color:t.coverage===opt.id?opt.color:T.ink3, fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, cursor:"pointer" }}>{opt.label}</button>)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginTop:12 }}>
                      {[{l:"Sessions",v:c.totalSessions},{l:"Gross",v:fmt$(c.grossTotal)},{l:"Out of Pocket",v:fmt$(c.outOfPocket),hi:true}].map((s,j)=>(
                        <div key={j} style={{ background:s.hi?T.roseL:T.surface, borderRadius:8, padding:"8px 10px", border:`1px solid ${s.hi?T.rose+"44":T.border}` }}>
                          <div style={{ fontSize:9, color:s.hi?T.rose:T.ink3, fontFamily:"'DM Sans',sans-serif", marginBottom:2 }}>{s.l}</div>
                          <div style={{ fontSize:14, fontWeight:800, color:s.hi?T.rose:T.ink, fontFamily:"'DM Sans',sans-serif" }}>{s.v}</div>
                        </div>
                      ))}
                    </div>
                    <button onClick={()=>remove(t.id)} style={{ marginTop:10, padding:"5px 12px", background:"none", border:`1px solid ${T.border}`, borderRadius:7, color:T.ink4, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:11, cursor:"pointer" }}>Remove</button>
                  </div>
                )}
              </div>
            );
          })}
          <button onClick={add} style={{ width:"100%", padding:12, background:T.white, border:`2px dashed ${T.border2}`, borderRadius:10, color:T.indigo, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>+ Add therapy</button>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER VIEW
// ═══════════════════════════════════════════════════════════════════════════
const FOCUS_AREAS = ["Articulation","Language comprehension","Expressive language","Pragmatics / social language","AAC / communication device","Receptive vocabulary","Following directions","Transitions","Fluency"];
const RESP_OPTS = [{label:"Exceptional",icon:"🌟",color:T.green},{label:"Good",icon:"👍",color:T.teal},{label:"Mixed",icon:"↕",color:T.amber},{label:"Difficult",icon:"⚡",color:T.rose}];

function ProviderView() {
  const [focus, setFocus] = useState([]);
  const [response, setResponse] = useState("");
  const [win, setWin] = useState(""); const [challenge, setChallenge] = useState(""); const [forFamily, setForFamily] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const toggleFocus = f => setFocus(p=>p.includes(f)?p.filter(x=>x!==f):[...p,f]);
  const canSubmit = focus.length>0&&response&&(win||challenge);

  const ta = { width:"100%", padding:"10px 12px", background:"#1e2535", border:`1.5px solid #2a3348`, borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#e8f0f8", minHeight:68, resize:"vertical", boxSizing:"border-box" };

  if(submitted) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, textAlign:"center", maxWidth:500, margin:"0 auto" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
      <h3 style={{ margin:"0 0 8px", fontSize:22, fontWeight:800, color:"#e8f0f8", fontFamily:"'DM Sans',sans-serif" }}>Session logged</h3>
      <p style={{ margin:"0 0 20px", fontSize:14, color:"#8b9cc8", fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>Maya's family will see this in their weekly digest. The care team has been updated.</p>
      <button onClick={()=>{setSubmitted(false);setFocus([]);setResponse("");setWin("");setChallenge("");setForFamily("");}} style={{ padding:"11px 24px", background:`linear-gradient(135deg,#38bdf8,#0ea5e9)`, border:"none", borderRadius:10, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14, cursor:"pointer" }}>Log another session</button>
    </div>
  );

  return (
    <div style={{ maxWidth:600, margin:"0 auto" }}>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:10, fontWeight:700, color:"#38bdf8", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.1em", marginBottom:4 }}>SESSION LOG · PROVIDER VIEW</div>
        <h2 style={{ margin:"0 0 2px", fontSize:24, fontWeight:800, color:"#eef2ff", fontFamily:"'DM Sans',sans-serif" }}>Session with {CHILD.name}</h2>
        <div style={{ fontSize:12, color:"#6b8299", fontFamily:"'DM Sans',sans-serif" }}>Sarah Chen · Speech Therapist · {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
      </div>

      {/* Passport tip */}
      <div style={{ background:"rgba(56,189,248,0.08)", border:"1px solid rgba(56,189,248,0.25)", borderRadius:10, padding:"11px 14px", marginBottom:18, display:"flex", gap:10 }}>
        <span style={{ fontSize:14, flexShrink:0 }}>💡</span>
        <div style={{ fontSize:12, color:"#a8bdd0", fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>From Maya's passport: responds well to <strong style={{ color:"#eef2ff" }}>verbal warnings</strong> before transitions. Today's motivators: <strong style={{ color:"#eef2ff" }}>Dinosaurs, Drawing</strong>.</div>
      </div>

      {/* Focus areas */}
      <div style={{ marginBottom:18 }}>
        <label style={{ fontSize:10, fontWeight:700, color:"#6b8299", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em", display:"block", marginBottom:8 }}>WHAT DID YOU WORK ON? *</label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {FOCUS_AREAS.map(f=><button key={f} onClick={()=>toggleFocus(f)} style={{ padding:"6px 12px", borderRadius:20, border:focus.includes(f)?"1.5px solid #38bdf8":"1.5px solid #2a3348", background:focus.includes(f)?"rgba(56,189,248,0.15)":"transparent", color:focus.includes(f)?"#38bdf8":"#6b8299", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:focus.includes(f)?700:400, cursor:"pointer", transition:"all 0.15s" }}>{f}</button>)}
        </div>
      </div>

      {/* Response */}
      <div style={{ marginBottom:18 }}>
        <label style={{ fontSize:10, fontWeight:700, color:"#6b8299", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em", display:"block", marginBottom:8 }}>HOW DID MAYA RESPOND? *</label>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:7 }}>
          {RESP_OPTS.map(opt=><button key={opt.label} onClick={()=>setResponse(opt.label)} style={{ padding:"11px 6px", borderRadius:10, border:response===opt.label?`2px solid ${opt.color}`:"1.5px solid #2a3348", background:response===opt.label?opt.color+"18":"#1e2535", color:response===opt.label?opt.color:"#6b8299", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:response===opt.label?700:400, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}><span style={{ fontSize:18 }}>{opt.icon}</span>{opt.label}</button>)}
        </div>
      </div>

      <div style={{ marginBottom:14 }}><label style={{ fontSize:10, fontWeight:700, color:"#6b8299", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em", display:"block", marginBottom:6 }}>ONE WIN</label><textarea style={ta} value={win} onChange={e=>setWin(e.target.value)} placeholder="e.g. Maya used 'I want' unprompted twice during play" /></div>
      <div style={{ marginBottom:14 }}><label style={{ fontSize:10, fontWeight:700, color:"#6b8299", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em", display:"block", marginBottom:6 }}>ONE THING TO KEEP WORKING ON</label><textarea style={ta} value={challenge} onChange={e=>setChallenge(e.target.value)} placeholder="e.g. Initiating conversation without a prompt" /></div>
      <div style={{ marginBottom:22 }}><label style={{ fontSize:10, fontWeight:700, color:"#6b8299", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em", display:"block", marginBottom:6 }}>NOTE FOR THE FAMILY (optional)</label><textarea style={ta} value={forFamily} onChange={e=>setForFamily(e.target.value)} placeholder="e.g. Try asking 'what do you want?' before meals this week" /></div>

      <button onClick={()=>setSubmitted(true)} disabled={!canSubmit} style={{ width:"100%", padding:14, background:canSubmit?`linear-gradient(135deg,#0ea5e9,#0284c7)`:"#1e2535", border:canSubmit?"none":"1.5px solid #2a3348", borderRadius:12, color:canSubmit?"#fff":"#5a6a8a", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:15, cursor:canSubmit?"pointer":"not-allowed", boxShadow:canSubmit?"0 4px 14px rgba(14,165,233,0.35)":"none" }}>
        {canSubmit?"✓ Submit session log":"Complete required fields to submit"}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
function Dashboard({ setPage }) {
  const calcs = THERAPIES.map(t=>calcT(t));
  const weekOop = 180*0.2*2 + 220*0.5*3;
  const overall = { label:"Good week", color:T.teal, bg:T.tealL, emoji:"👍" };

  return (
    <div style={{ maxWidth:680, margin:"0 auto" }}>
      {/* Welcome */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:11, fontWeight:700, color:T.teal, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em", marginBottom:4 }}>GOOD MORNING</div>
        <h2 style={{ margin:"0 0 4px", fontSize:26, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>Welcome back 👋</h2>
        <p style={{ margin:0, fontSize:14, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>Here's {CHILD.name}'s snapshot for the week of Apr 7–11, 2026.</p>
      </div>

      {/* Child card */}
      <div style={{ background:`linear-gradient(135deg,${T.tealD},${T.indigo})`, borderRadius:16, padding:"20px 22px", marginBottom:16, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:-20, top:-20, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
        <div style={{ position:"absolute", right:40, bottom:-30, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.65)", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.1em", marginBottom:6 }}>CARE PASSPORT</div>
        <div style={{ fontSize:22, fontWeight:800, color:"#fff", fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>{CHILD.name}</div>
        <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)", fontFamily:"'DM Sans',sans-serif", marginBottom:16 }}>Age {CHILD.age} · {CHILD.diagnosis} · {CHILD.school}</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {SESSIONS.map((s,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", background:"rgba(255,255,255,0.15)", borderRadius:20 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:RESP_STYLE[s.response]?.dot||"#fff" }} />
              <span style={{ fontSize:11, fontWeight:600, color:"#fff", fontFamily:"'DM Sans',sans-serif" }}>{s.role.replace(" Therapist","").replace(" Teacher","")}</span>
            </div>
          ))}
          <div style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", background:"rgba(255,255,255,0.15)", borderRadius:20 }}>
            <span style={{ fontSize:11, fontWeight:600, color:"#fff", fontFamily:"'DM Sans',sans-serif" }}>{overall.emoji} {overall.label}</span>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
        {[
          { label:"Sessions This Week", value:SESSIONS.length, emoji:"📅", color:T.indigo },
          { label:"Week's Out-of-Pocket", value:fmt$(weekOop), emoji:"💰", color:T.rose },
          { label:"Goals Tracked", value:DOCS.flatMap(d=>d.goals||[]).length+FAMILY_GOALS.length, emoji:"🎯", color:T.green },
        ].map((s,i)=>(
          <div key={i} style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:12, padding:"14px 16px" }}>
            <div style={{ fontSize:18, marginBottom:5 }}>{s.emoji}</div>
            <div style={{ fontSize:20, fontWeight:800, color:s.color, fontFamily:"'DM Sans',sans-serif" }}>{s.value}</div>
            <div style={{ fontSize:11, color:T.ink3, fontFamily:"'DM Sans',sans-serif", marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick nav cards */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {[
          { id:"digest", emoji:"📬", title:"Weekly Digest", desc:"See Maya's AI-generated week summary", color:T.gold },
          { id:"passport", emoji:"🪪", title:"Child Profile", desc:"View or update Maya's profile", color:T.teal },
          { id:"documents", emoji:"📁", title:"Docs & Goals", desc:"Upload IEPs and generate progress reports", color:T.indigo },
          { id:"costs", emoji:"💰", title:"Cost Planner", desc:"Track therapy spend and coverage", color:T.rose },
        ].map(s=>(
          <button key={s.id} onClick={()=>setPage(s.id)} style={{ background:T.white, border:`1.5px solid ${T.border}`, borderRadius:14, padding:"16px 18px", textAlign:"left", cursor:"pointer", transition:"all 0.2s", display:"block" }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=s.color; e.currentTarget.style.boxShadow=`0 4px 16px ${s.color}20`; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.border; e.currentTarget.style.boxShadow="none"; }}>
            <div style={{ fontSize:24, marginBottom:8 }}>{s.emoji}</div>
            <div style={{ fontSize:14, fontWeight:700, color:T.ink, fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>{s.title}</div>
            <div style={{ fontSize:12, color:T.ink3, fontFamily:"'DM Sans',sans-serif", lineHeight:1.4 }}>{s.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CHAT — PERMISSION-AWARE CONTEXT BUILDER
// ═══════════════════════════════════════════════════════════════════════════

// Role definitions — easy to extend when auth is added
const CHAT_ROLES = {
  parent: {
    label: "Parent",
    canChat: true,
    seeCosts: true,
    seeAllNotes: true,
    seeFinancials: true,
  },
  trusted_provider: {
    label: "Trusted Provider",
    canChat: true,
    seeCosts: false,
    seeAllNotes: true,
    seeFinancials: false,
  },
  basic_provider: {
    label: "Provider",
    canChat: false,
    seeCosts: false,
    seeAllNotes: false,
    seeFinancials: false,
  },
};

// Builds the system prompt based on the user's role — strips data they shouldn't see
function buildChatContext(role = "parent") {
  const perms = CHAT_ROLES[role] || CHAT_ROLES.parent;

  const sessionContext = SESSIONS.map(s =>
    `- ${s.role} (${s.date}): Response=${s.response}. Win: "${s.win}" Challenge: "${s.challenge}"${perms.seeAllNotes ? ` Family note: "${s.forFamily}"` : ""}`
  ).join("\n");

  const goalContext = [
    ...DOCS.flatMap(d => d.goals || []).map(g => `[Official] ${g}`),
    ...FAMILY_GOALS.map(g => `[Family] ${g.text} (${g.category})`),
  ].join("\n");

  const costContext = perms.seeCosts
    ? `THERAPY COSTS:\n${THERAPIES.map(t => {
        const c = calcT(t);
        const cov = COVERAGE_OPTIONS.find(x => x.id === t.coverage);
        return `- ${t.type}: ${t.frequency}x/${t.freqUnit} @ $${t.costPerSession}/session. Coverage: ${cov?.label}. Est. OOP: $${Math.round(c.outOfPocket)}`;
      }).join("\n")}`
    : "";

  const docContext = DOCS.map(d => `- ${d.name} (${d.type.toUpperCase()}, ${d.date})`).join("\n");

  return `You are a compassionate, knowledgeable AI assistant embedded in Readily — a care coordination platform for families of children with special needs.

You are speaking with a ${perms.label} of ${CHILD.name}.

CHILD PROFILE:
Name: ${CHILD.name}, Age: ${CHILD.age}, Diagnosis: ${CHILD.diagnosis}, School: ${CHILD.school}

RECENT SESSIONS (this week):
${sessionContext}

GOALS BEING TRACKED:
${goalContext}

UPLOADED DOCUMENTS:
${docContext}

${costContext}

PASSPORT HIGHLIGHTS:
Motivators: Dinosaurs, Drawing, Music
Calming strategies: Deep pressure, Verbal warnings, Quiet space
Communication: Verbal + Picture cards
Triggers: Loud sounds, Unexpected changes, Transitions
Sensory: Seeks deep pressure, Avoids loud noise

YOUR ROLE:
- Answer questions warmly and specifically — never generically
- Always ground answers in ${CHILD.name}'s actual data above
- If something isn't in the data, say so honestly rather than guessing
- For clinical decisions, always recommend consulting the appropriate provider
- Keep answers concise — 2-4 sentences unless more detail is genuinely needed
- You are NOT a therapist. You synthesize and surface information. You do not diagnose.
${!perms.seeCosts ? "- Do NOT discuss costs, billing, or financial information." : ""}
${!perms.seeAllNotes ? "- Only share information visible in the child's public Passport. Do not share session-specific provider notes." : ""}`;
}

const SUGGESTED_QUESTIONS = [
  "What's been the biggest win for Maya this week?",
  "What should I try at home when she has a meltdown?",
  "Is Maya on track with her IEP goals?",
  "What patterns do her providers keep noticing?",
  "How much have we spent on therapy this year?",
  "What does her speech therapist say about communication?",
];

function ChatPanel({ onClose, role = "parent" }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I know everything in Maya's file — her sessions this week, IEP goals, family goals, and passport. What would you like to know?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const systemPrompt = useMemo(() => buildChatContext(role), [role]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
    setShowSuggestions(false);
    const next = [...messages, { role: "user", content: q }];
    setMessages(next);
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: next.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || "").join("") || "Sorry, I couldn't get a response.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const perms = CHAT_ROLES[role] || CHAT_ROLES.parent;

  return (
    <div style={{
      position: "fixed", bottom: 88, right: 24, zIndex: 100,
      width: 380, maxWidth: "calc(100vw - 48px)",
      background: T.white, borderRadius: 20,
      boxShadow: "0 8px 40px rgba(15,23,42,0.18), 0 2px 8px rgba(15,23,42,0.08)",
      border: `1px solid ${T.border}`,
      display: "flex", flexDirection: "column",
      maxHeight: "min(560px, calc(100vh - 120px))",
      animation: "chatSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1) both",
    }}>
      {/* Header */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${T.teal},${T.indigo})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🌱</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, fontFamily: "'DM Sans',sans-serif" }}>Ask about Maya</div>
          <div style={{ fontSize: 11, color: T.ink3, fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, display: "inline-block" }} />
            Knows her full file · {perms.label} access
          </div>
        </div>
        <button onClick={onClose} style={{ background: T.surface, border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", color: T.ink3, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "assistant" && (
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg,${T.teal},${T.indigo})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0, marginRight: 7, marginTop: 2 }}>🌱</div>
            )}
            <div style={{
              maxWidth: "80%", padding: "10px 13px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
              background: m.role === "user" ? `linear-gradient(135deg,${T.teal},${T.tealD})` : T.surface,
              color: m.role === "user" ? "#fff" : T.ink,
              fontSize: 13, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6,
              animation: "fadeIn 0.2s ease both",
            }}>{m.content}</div>
          </div>
        ))}

        {/* Suggested questions */}
        {showSuggestions && messages.length === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.ink4, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.06em", paddingLeft: 33 }}>SUGGESTED QUESTIONS</div>
            {SUGGESTED_QUESTIONS
              .filter((_, i) => !(!CHAT_ROLES[role]?.seeCosts && i === 4)) // hide cost question for non-parent
              .slice(0, 4)
              .map((q, i) => (
                <button key={i} onClick={() => send(q)} style={{
                  marginLeft: 33, padding: "7px 12px", background: T.white, border: `1px solid ${T.border}`,
                  borderRadius: 20, textAlign: "left", cursor: "pointer", color: T.ink2,
                  fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 500,
                  transition: "all 0.15s", animation: `fadeIn 0.3s ease both`, animationDelay: `${i * 60}ms`,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.teal; e.currentTarget.style.color = T.teal; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.ink2; }}>
                  {q}
                </button>
              ))}
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg,${T.teal},${T.indigo})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0, marginTop: 2 }}>🌱</div>
            <div style={{ background: T.surface, borderRadius: "4px 16px 16px 16px", padding: "12px 16px", display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: T.teal, animation: "bounce 1.2s ease infinite", animationDelay: `${i * 0.2}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "10px 12px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask anything about Maya…"
          rows={1}
          style={{
            flex: 1, padding: "9px 12px", background: T.surface, border: `1.5px solid ${T.border}`,
            borderRadius: 12, fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: T.ink,
            resize: "none", outline: "none", lineHeight: 1.5, maxHeight: 80, overflowY: "auto",
          }}
          onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px"; }}
        />
        <button onClick={() => send()} disabled={!input.trim() || loading} style={{
          width: 38, height: 38, borderRadius: 10, border: "none", flexShrink: 0,
          background: input.trim() && !loading ? `linear-gradient(135deg,${T.teal},${T.tealD})` : T.surface,
          color: input.trim() && !loading ? "#fff" : T.ink4,
          cursor: input.trim() && !loading ? "pointer" : "not-allowed",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          transition: "all 0.2s", boxShadow: input.trim() && !loading ? `0 2px 8px ${T.teal}40` : "none",
        }}>↑</button>
      </div>

      {/* Permission note */}
      {role !== "parent" && (
        <div style={{ padding: "6px 14px 10px", textAlign: "center" }}>
          <span style={{ fontSize: 10, color: T.ink4, fontFamily: "'DM Sans',sans-serif" }}>
            {!perms.seeCosts ? "Financial data not included in your access level." : ""}
          </span>
        </div>
      )}
    </div>
  );
}

function ChatButton({ role = "parent" }) {
  const [open, setOpen] = useState(false);
  const perms = CHAT_ROLES[role] || CHAT_ROLES.parent;
  if (!perms.canChat) return null; // permission gate — non-chat roles see nothing

  return (
    <>
      {open && <ChatPanel onClose={() => setOpen(false)} role={role} />}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 101,
          width: 56, height: 56, borderRadius: "50%", border: "none",
          background: open ? T.ink : `linear-gradient(135deg,${T.teal},${T.indigo})`,
          color: "#fff", cursor: "pointer", fontSize: open ? 20 : 22,
          boxShadow: "0 4px 20px rgba(13,148,136,0.4), 0 2px 6px rgba(0,0,0,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          transform: open ? "rotate(0deg) scale(1)" : "scale(1)",
        }}
        title="Ask about Maya"
      >
        {open ? "×" : "💬"}
      </button>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SHELL
// ═══════════════════════════════════════════════════════════════════════════
export default function ReadilyApp() {
  const [page, setPage] = useState("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isProvider = page === "provider";

  const SCREENS = {
    dashboard: <Dashboard setPage={setPage} />,
    passport:  <PassportBuilder />,
    digest:    <WeeklyDigestScreen />,
    documents: <DocsGoalsScreen />,
    costs:     <CostEstimatorScreen />,
    provider:  <ProviderView />,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes shimmer { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes chatSlideUp { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: ${T.border2}; border-radius:2px; }
        input:focus,textarea:focus,select:focus { outline:none; border-color:${T.teal}!important; box-shadow:0 0 0 3px ${T.teal}18!important; }
        select option { background:${T.white}; color:${T.ink}; }
        button { transition: all 0.15s; }
      `}</style>

      <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:isProvider?"#0c1a2e":T.bg, fontFamily:"'DM Sans',sans-serif" }}>

        {/* ── Sidebar nav ── */}
        <div style={{ width:220, minWidth:220, background:T.nav, display:"flex", flexDirection:"column", borderRight:`1px solid rgba(255,255,255,0.06)`, flexShrink:0, overflowY:"auto" }}>

          {/* Logo */}
          <div style={{ padding:"18px 18px 14px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:T.tealD, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>⚡</div>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:"#fff", letterSpacing:"-0.02em" }}>Readily</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", fontFamily:"'DM Mono',monospace" }}>Maya's Family</div>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav style={{ flex:1, padding:"10px 8px" }}>
            <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.3)", fontFamily:"'DM Mono',monospace", letterSpacing:"0.12em", padding:"8px 10px 4px" }}>PARENT</div>
            {NAV.filter(n=>n.id!=="provider").map(n=>(
              <button key={n.id} onClick={()=>setPage(n.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:8, border:"none", background:page===n.id?"rgba(13,148,136,0.2)":"transparent", color:page===n.id?"#fff":"rgba(255,255,255,0.5)", fontFamily:"'DM Sans',sans-serif", fontWeight:page===n.id?700:500, fontSize:13, cursor:"pointer", marginBottom:2, textAlign:"left", transition:"all 0.15s" }}
                onMouseEnter={e=>{ if(page!==n.id) e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.color="rgba(255,255,255,0.85)"; }}
                onMouseLeave={e=>{ if(page!==n.id) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="rgba(255,255,255,0.5)"; } }}>
                <span style={{ fontSize:16, width:20, textAlign:"center", flexShrink:0 }}>{n.icon}</span>
                <span>{n.label}</span>
                {page===n.id&&<div style={{ marginLeft:"auto", width:4, height:4, borderRadius:"50%", background:T.teal }} />}
              </button>
            ))}

            <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.3)", fontFamily:"'DM Mono',monospace", letterSpacing:"0.12em", padding:"16px 10px 4px" }}>CARE TEAM</div>
            <button onClick={()=>setPage("provider")} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:8, border:"none", background:page==="provider"?"rgba(56,189,248,0.2)":"transparent", color:page==="provider"?"#38bdf8":"rgba(255,255,255,0.5)", fontFamily:"'DM Sans',sans-serif", fontWeight:page==="provider"?700:500, fontSize:13, cursor:"pointer", textAlign:"left" }}
              onMouseEnter={e=>{ if(page!=="provider") { e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.color="rgba(255,255,255,0.85)"; } }}
              onMouseLeave={e=>{ if(page!=="provider") { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="rgba(255,255,255,0.5)"; } }}>
              <span style={{ fontSize:16, width:20, textAlign:"center", flexShrink:0 }}>🩺</span>
              <span>Provider View</span>
              {page==="provider"&&<div style={{ marginLeft:"auto", width:4, height:4, borderRadius:"50%", background:"#38bdf8" }} />}
            </button>
          </nav>

          {/* Child summary at bottom */}
          <div style={{ padding:"12px 14px", borderTop:"1px solid rgba(255,255,255,0.06)", margin:"0 8px 8px" }}>
            <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:10, padding:"10px 12px" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.35)", fontFamily:"'DM Mono',monospace", letterSpacing:"0.08em", marginBottom:5 }}>CHILD</div>
              <div style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{CHILD.name}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", marginTop:1 }}>{CHILD.diagnosis}</div>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:8 }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:T.teal }} />
                <span style={{ fontSize:10, color:"rgba(255,255,255,0.45)", fontFamily:"'DM Mono',monospace" }}>{SESSIONS.length} sessions this week</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
          {/* Top bar */}
          <div style={{ height:52, borderBottom:`1px solid ${isProvider?"rgba(255,255,255,0.06)":T.border}`, display:"flex", alignItems:"center", padding:"0 24px", background:isProvider?"#0f1923":T.white, flexShrink:0 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:700, color:isProvider?"#eef2ff":T.ink, fontFamily:"'DM Sans',sans-serif" }}>{NAV.find(n=>n.id===page)?.label||"Dashboard"}</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:`linear-gradient(135deg,${T.teal},${T.indigo})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff", fontFamily:"'DM Sans',sans-serif" }}>M</div>
              <span style={{ fontSize:13, fontWeight:600, color:isProvider?"#8b9cc8":T.ink2, fontFamily:"'DM Sans',sans-serif" }}>Maya's Family</span>
            </div>
          </div>

          {/* Page content */}
          <div key={page} style={{ flex:1, overflowY:"auto", padding:"28px 24px 48px", background:isProvider?"#0e1117":T.bg, animation:"fadeIn 0.25s ease both" }}>
            {SCREENS[page]}
          </div>
        </div>
      </div>

      {/* ── Floating chat button — parent only, hidden on provider view ── */}
      {!isProvider && <ChatButton role="parent" />}
    </>
  );
}
