import { useState, useRef, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { supabase } from "./supabase";

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSIVE HOOK
// ═══════════════════════════════════════════════════════════════════════════
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 640 : false);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

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
};

// ═══════════════════════════════════════════════════════════════════════════
// DEMO DATA — only used for the demo account
// ═══════════════════════════════════════════════════════════════════════════
const DEMO_EMAIL = "ablepamhc@gmail.com";

const DEMO_CHILD = { name: "Maya", age: 7, diagnosis: "ASD Level 2", school: "Sunridge Elementary", motivators:["Dinosaurs","Drawing","Music"], calming:["Verbal warnings","Deep pressure"], communication:["Verbal","Picture cards"], triggers:["Loud sounds","Unexpected changes","Transitions"], sensory:["Seeks deep pressure","Avoids loud noise"] };

const DEMO_SESSIONS = [
  { provider: "Sarah Chen", role: "Speech Therapist", date: "Mon, Apr 7", response: "Good", focusAreas: ["Expressive language", "Pragmatics"], win: "Produced 3-word phrases consistently with dinosaur picture prompts.", challenge: "Initiating conversation without prompting — still waits to be asked.", forFamily: "Try asking 'what do you want?' before meals — she's ready to practice this." },
  { provider: "James Thornton", role: "ABA Therapist", date: "Wed, Apr 9", response: "Exceptional", focusAreas: ["Transitions", "Following directions"], win: "Completed 4 consecutive transitions with the visual schedule — zero meltdowns.", challenge: "Multi-step instructions (3+ steps) still need physical prompts.", forFamily: "Keep the visual schedule visible at home — it's working really well." },
  { provider: "Ms. Rivera", role: "Special Ed Teacher", date: "Thu, Apr 10", response: "Mixed", focusAreas: ["Social language", "Group participation"], win: "Raised hand twice during circle time, unprompted.", challenge: "Group transitions after recess are still difficult — needs extra time.", forFamily: "She mentioned a boy named Leo today — ask her about him, she lit up." },
];

const DEMO_THERAPIES = [
  { id: 1, type: "Speech Therapy", provider: "Sarah Chen", frequency: 2, freqUnit: "week", costPerSession: 180, coverage: "partial_80", startDate: "2026-01-01", endDate: "2026-12-31" },
  { id: 2, type: "ABA Therapy", provider: "James Thornton", frequency: 3, freqUnit: "week", costPerSession: 220, coverage: "partial_50", startDate: "2026-01-01", endDate: "2026-12-31" },
  { id: 3, type: "Occupational Therapy", provider: "Dr. Lin", frequency: 1, freqUnit: "week", costPerSession: 160, coverage: "none", startDate: "2026-03-01", endDate: "2026-12-31" },
];

const DEMO_DOCS = [
  { id: 1, name: "Maya_IEP_2025-2026.pdf", type: "iep", size: "2.4 MB", date: "Sep 2025", goals: ["Improve expressive vocabulary to 200+ words", "Initiate peer interaction 3x/day", "Follow 2-step directions independently", "Reduce transition meltdowns to <1/week"] },
  { id: 2, name: "ABA_Treatment_Plan_Q1_2026.pdf", type: "aba", size: "1.8 MB", date: "Jan 2026", goals: ["Functional communication using full sentences", "Independent task completion (3+ steps)", "Decrease self-stimulatory behaviors during instruction"] },
];

const DEMO_GOALS = [
  { id: 1, text: "Maya asks for what she needs without being prompted", category: "Communication" },
  { id: 2, text: "Maya gets through a school morning without a meltdown", category: "Daily Living" },
  { id: 3, text: "Maya makes at least one friend she talks about at home", category: "Social" },
];

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
const COVERAGE_OPTIONS = [
  { id: "full",       label: "Fully Covered", pct: 100, color: "#059669" },
  { id: "partial_80", label: "80% Covered",   pct: 80,  color: "#0891b2" },
  { id: "partial_50", label: "50% Covered",   pct: 50,  color: "#d97706" },
  { id: "none",       label: "No Coverage",   pct: 0,   color: "#e11d48" },
];

const DOC_TYPES = [
  { id:"iep",   label:"IEP",               color:"#4f46e5", icon:"📋" },
  { id:"aba",   label:"ABA Plan",          color:"#7c3aed", icon:"🧩" },
  { id:"eval",  label:"Evaluation Report", color:"#0891b2", icon:"📊" },
  { id:"other", label:"Other",             color:"#64748b", icon:"📄" },
];

const NAV = [
  { id:"dashboard", label:"Home",          icon:"⊞" },
  { id:"passport",  label:"Profile",       icon:"🪪" },
  { id:"digest",    label:"Weekly Digest", icon:"📬" },
  { id:"documents", label:"Docs & Goals",  icon:"📁" },
  { id:"costs",     label:"Cost Planner",  icon:"💰" },
  { id:"provider",  label:"Provider View", icon:"🩺" },
];

const RESP_STYLE = {
  Exceptional: { bg: "#d1fae5", color: "#059669", dot: "#16a34a" },
  Good:        { bg: "#ccfbf1", color: "#0d9488", dot: "#0d9488" },
  Mixed:       { bg: "#fef3c7", color: "#b45309", dot: "#d97706" },
  Difficult:   { bg: "#ffe4e6", color: "#e11d48", dot: "#e11d48" },
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════
const fmt$ = n => "$" + Math.round(n).toLocaleString();
const monthsBetween = (s, e) => { if (!s||!e) return 0; const a=new Date(s),b=new Date(e); return Math.max(0,(b.getFullYear()-a.getFullYear())*12+(b.getMonth()-a.getMonth())); };
const sessPerMo = (freq,unit) => unit==="week"?freq*4.33:unit==="month"?freq:freq/12;
const calcT = t => {
  const mo=monthsBetween(t.startDate,t.endDate);
  const spm=sessPerMo(Number(t.frequency)||0,t.freqUnit);
  const tot=Math.round(spm*mo);
  const gross=tot*(Number(t.costPerSession)||0);
  const cov=COVERAGE_OPTIONS.find(c=>c.id===t.coverage)||COVERAGE_OPTIONS[3];
  return { months:mo, totalSessions:tot, grossTotal:gross, covered:gross*(cov.pct/100), outOfPocket:gross*(1-cov.pct/100), sessPerMonth:spm };
};

// Route all AI calls through /api/chat (Vercel serverless proxy)
// This avoids CORS issues with direct browser-to-Anthropic calls
const AI_ENDPOINT = "/api/chat";
const apiHeaders = () => ({ "Content-Type": "application/json" });

// ═══════════════════════════════════════════════════════════════════════════
// PHI CONSENT MODAL — shown once before first profile save
// ═══════════════════════════════════════════════════════════════════════════
function PHIConsentModal({ childName, onConfirm, onCancel }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:24, backdropFilter:"blur(4px)" }}>
      <div style={{ background:T.white, borderRadius:20, padding:"32px 28px", maxWidth:480, width:"100%", boxShadow:"0 16px 48px rgba(0,0,0,0.2)" }}>
        <div style={{ width:44, height:44, borderRadius:12, background:T.teal+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:16 }}>🔒</div>
        <h2 style={{ margin:"0 0 10px", fontSize:20, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>Before we save {childName ? `${childName}'s` : "your child's"} profile</h2>
        <p style={{ margin:"0 0 20px", fontSize:13, color:T.ink3, fontFamily:"'DM Sans',sans-serif", lineHeight:1.65 }}>
          You're about to save Personal Health Information (PHI) about your child. Please confirm you understand how it's protected:
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
          {[
            ["🇨🇦", "Stored securely in Canada (Montreal) — never shared outside Canada without your consent"],
            ["👤", "Only providers you personally invite will be able to see this information"],
            ["🤖", "AI features will only process this data when you actively use the digest or chat"],
            ["🗑️", "You can delete all your data at any time by emailing contact@ablepam.ca"],
            ["⚕️", "This is a coordination tool — it does not replace professional medical advice"],
          ].map(([icon, text], i) => (
            <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"10px 12px", background:T.surface, borderRadius:8 }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{icon}</span>
              <span style={{ fontSize:12, color:T.ink2, fontFamily:"'DM Sans',sans-serif", lineHeight:1.55 }}>{text}</span>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, padding:"11px", background:T.white, border:`1.5px solid ${T.border}`, borderRadius:10, color:T.ink3, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:14, cursor:"pointer" }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ flex:2, padding:"11px", background:`linear-gradient(135deg,${T.teal},${T.tealD})`, border:"none", borderRadius:10, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:`0 4px 12px ${T.teal}44` }}>
            I understand — save profile →
          </button>
        </div>
        <p style={{ margin:"14px 0 0", fontSize:11, color:T.ink4, fontFamily:"'DM Sans',sans-serif", textAlign:"center", lineHeight:1.5 }}>
          By confirming, you consent to the collection and use of this PHI as described in our Privacy Policy and Terms of Service.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PASSPORT BUILDER
// ═══════════════════════════════════════════════════════════════════════════
const PASSPORT_STEPS = ["Child", "What Works", "Watch For", "Care Team", "Profile"];
const TAG_OPTS = {
  motivators: ["Dinosaurs","Trains","Music","Drawing","Animals","Lego","Minecraft","Swimming","Cooking","Books","Puzzles","Dancing"],
  calming:    ["Deep pressure","Quiet space","Headphones","Fidget tools","Predictable routine","Verbal warnings","Visual schedule","Weighted blanket","Outdoor time"],
  comm:       ["Verbal","AAC device","PECS","Sign language","Picture cards","Written notes","Gestures"],
  triggers:   ["Loud sounds","Unexpected changes","Crowds","Bright lights","Certain textures","Being touched","Waiting","Transitions","New people","Strong smells"],
  sensory:    ["Seeks deep pressure","Avoids loud noise","Sensitive to light","Texture sensitive (food)","Texture sensitive (clothing)","Seeks movement","Avoids movement"],
};

function TagPicker({ opts, selected, onChange, color }) {
  const toggle = t => onChange(selected.includes(t) ? selected.filter(x=>x!==t) : [...selected,t]);
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginTop:"8px" }}>
      {opts.map(t => (
        <button key={t} onClick={()=>toggle(t)} style={{ padding:"5px 12px", borderRadius:"20px", border:selected.includes(t)?`2px solid ${color}`:`1.5px solid ${T.border}`, background:selected.includes(t)?color+"18":T.white, color:selected.includes(t)?color:T.ink3, fontFamily:"'DM Sans',sans-serif", fontSize:"12px", fontWeight:selected.includes(t)?"700":"400", cursor:"pointer", transition:"all 0.15s" }}>{t}</button>
      ))}
    </div>
  );
}

function PassportBuilder({ session, child, onSaved }) {
  const isDemo = session?.user?.email === DEMO_EMAIL;
  const getInitialData = () => {
    if (child) return { name:child.name||"", age:child.age?child.age+"":"", school:child.school||"", diagnosis:child.diagnosis||"", motivators:child.motivators||[], calming:child.calming||[], comm:child.communication||[], triggers:child.triggers||[], sensory:child.sensory||[], notes:child.notes||"" };
    return { name:"", age:"", school:"", diagnosis:"", motivators:[], calming:[], comm:[], triggers:[], sensory:[], notes:"" };
  };

  const [step, setStep] = useState(child?.id ? 4 : 0); // Go straight to profile view if editing
  const [d, setD] = useState(getInitialData);
  const [saving, setSaving] = useState(false);
  const [showPHIConsent, setShowPHIConsent] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [team, setTeam] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Speech Therapist");
  const [inviteAccess, setInviteAccess] = useState("session_log");
  const [inviting, setInviting] = useState(false);
  const upd = (k,v) => { setD(x=>({...x,[k]:v})); setSaved(false); };

  // Load existing share token on mount (for existing profiles)
  useEffect(() => {
    if (!child?.id || isDemo) return;

    // Load existing share token
    supabase.from("passport_shares").select("token").eq("child_id", child.id).eq("active", true).maybeSingle()
      .then(({ data }) => { if (data?.token) setShareUrl(`${window.location.origin}/passport/${data.token}`); });

    // Load existing invitations
    supabase.from("invitations").select("provider_email, access_level, can_chat, accepted, role").eq("child_id", child.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setTeam(data.map(inv => ({
            email: inv.provider_email,
            role: inv.role || "Provider",
            access: inv.access_level || "session_log",
            accepted: inv.accepted,
          })));
        }
      });
  }, [child?.id]);

  const generateShareLink = async () => {
    if (!child?.id || isDemo) return;
    setShareLoading(true);
    try {
      const token = Math.random().toString(36).substring(2,10) + Math.random().toString(36).substring(2,10);
      console.log("[Readily] Generating share token:", token, "for child:", child.id);
      await supabase.from("passport_shares").update({ active: false }).eq("child_id", child.id);
      const { error } = await supabase.from("passport_shares").insert({ child_id: child.id, token, active: true });
      console.log("[Readily] Share insert error:", error);
      if (!error) setShareUrl(`${window.location.origin}/passport/${token}`);
    } catch(e) { console.error("[Readily] generateShareLink error:", e); }
    finally { setShareLoading(false); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const revokeLink = async () => {
    if (!child?.id) return;
    setRevoking(true);
    await supabase.from("passport_shares").update({ active: false }).eq("child_id", child.id);
    setShareUrl(null);
    setRevoking(false);
  };

  const PROVIDER_ROLES = ["Speech Therapist","ABA Therapist","Occupational Therapist","Special Ed Teacher","Psychologist","Pediatrician","Parent / Caregiver","Grandparent / Family","Respite Worker","Other"];
  const ACCESS_LEVELS = [
    { id:"view_only",    label:"View only",     desc:"Can read the care passport" },
    { id:"session_log",  label:"Log sessions",  desc:"Can log sessions + view passport" },
    { id:"full_access",  label:"Full access",   desc:"Can log, chat with AI, and view all data" },
  ];

  const addToTeam = () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) return;
    if (team.find(t=>t.email===inviteEmail.trim())) return;
    setTeam(prev=>[...prev, { email:inviteEmail.trim(), role:inviteRole, access:inviteAccess }]);
    setInviteEmail("");
  };

  const removeFromTeam = async (email) => {
    setTeam(prev=>prev.filter(t=>t.email!==email));
    if (child?.id) {
      await supabase.from("invitations").delete().eq("child_id", child.id).eq("provider_email", email);
    }
  };
  const inp = { width:"100%", padding:"10px 12px", borderRadius:"8px", border:`1.5px solid ${T.border}`, fontFamily:"'DM Sans',sans-serif", fontSize:"14px", color:T.ink, background:T.white, boxSizing:"border-box" };

  const handleSave = async () => {
    if (!d.name.trim()) { alert("Please enter your child's name."); return; }
    if (isDemo) { alert("This is a demo account — changes won't be saved."); return; }
    // Show PHI consent modal before first-time profile save
    if (!child?.id) { setShowPHIConsent(true); return; }
    await doSave();
  };

  const doSave = async () => {
    setSaving(true);
    console.log("[Readily] doSave called, child.id:", child?.id, "session.user.id:", session?.user?.id);
    const payload = { family_id:session.user.id, name:d.name, age:parseInt(d.age)||null, school:d.school, diagnosis:d.diagnosis, motivators:d.motivators, calming:d.calming, communication:d.comm, triggers:d.triggers, sensory:d.sensory, notes:d.notes };
    let childId = child?.id;
    if (child?.id) {
      const { error } = await supabase.from("children").update(payload).eq("id", child.id);
      console.log("[Readily] update result error:", error);
    } else {
      const { data: saved } = await supabase.from("children").insert(payload).select().single();
      if (saved) childId = saved.id;
    }
    if (childId && team.length > 0) {
      const familyName = session?.user?.email?.split('@')[0] || "A family";

      for (const t of team) {
        // Generate a fresh token for every save — ensures email always goes out
        const token = Math.random().toString(36).substring(2,10) + Math.random().toString(36).substring(2,10);

        // Upsert invitation
        const { data: inv, error: invError } = await supabase
          .from("invitations")
          .upsert({
            child_id: childId,
            provider_email: t.email,
            role: t.role,
            access_level: t.access,
            can_chat: t.access === "full_access",
            accepted: false,
            invite_token: token,
            invited_at: new Date().toISOString(),
          }, { onConflict: "child_id,provider_email" })
          .select()
          .single();

        console.log("[Readily] Invitation upsert:", inv, "error:", invError);

        // Send invite email
        if (!invError) {
          try {
            const emailRes = await fetch("/api/invite", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                providerEmail: t.email,
                providerRole: t.role || "Provider",
                childName: d.name,
                familyName,
                inviteToken: token,
              }),
            });
            const emailData = await emailRes.json();
            console.log("[Readily] Email result:", emailData);
          } catch(e) { console.error("[Readily] Failed to send invite email:", e); }
        }
      }
    }
    setSaving(false);
    setSaved(true);
    // For new profiles navigate away after 1.5s, for edits just show confirmation
    if (!child?.id) {
      setTimeout(() => { onSaved && onSaved(); }, 1500);
    }
  };

  const pages = [
    <div key="child">
      <p style={{ margin:"0 0 16px", fontSize:"14px", color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>Start with the basics. Everything here can be edited later.</p>
      {[["Child's name *","name","text"],["Age","age","number"],["School or program","school","text"],["Diagnosis","diagnosis","text"]].map(([lbl,key,type])=>(
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
      <p style={{ margin:"0 0 12px", fontSize:"14px", color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>Add your care team. Each person gets an email invite with access to {d.name||"your child"}'s profile.</p>

      {/* Add invite row */}
      <div style={{ background:T.white, border:`1.5px solid ${T.border}`, borderRadius:12, padding:"14px", marginBottom:12 }}>
        <label style={{ fontSize:11, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.05em", textTransform:"uppercase", display:"block", marginBottom:8 }}>INVITE A PROVIDER</label>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <input
            type="email"
            placeholder="provider@email.com"
            value={inviteEmail}
            onChange={e=>setInviteEmail(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&addToTeam()}
            style={{ width:"100%", padding:"9px 11px", borderRadius:8, border:`1.5px solid ${T.border}`, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:T.ink, background:T.surface, boxSizing:"border-box" }}
          />
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            <select value={inviteRole} onChange={e=>setInviteRole(e.target.value)} style={{ flex:1, minWidth:140, padding:"8px 10px", background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:12, color:T.ink }}>
              {PROVIDER_ROLES.map(r=><option key={r}>{r}</option>)}
            </select>
            <select value={inviteAccess} onChange={e=>setInviteAccess(e.target.value)} style={{ flex:1, minWidth:140, padding:"8px 10px", background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:12, color:T.ink }}>
              {ACCESS_LEVELS.map(a=><option key={a.id} value={a.id}>{a.label} — {a.desc}</option>)}
            </select>
          </div>
          <button onClick={addToTeam} disabled={!inviteEmail.includes("@")} style={{ padding:"9px", background:inviteEmail.includes("@")?T.teal:T.surface, border:"none", borderRadius:8, color:inviteEmail.includes("@")?"#fff":T.ink4, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:13, cursor:inviteEmail.includes("@")?"pointer":"not-allowed" }}>
            + Add to team
          </button>
        </div>
      </div>

      {/* Team list */}
      {team.length===0 && (
        <div style={{ textAlign:"center", padding:"18px", color:T.ink4, fontFamily:"'DM Sans',sans-serif", fontSize:13, background:T.surface, borderRadius:10 }}>
          No providers added yet — you can also skip this and add them later.
        </div>
      )}
      {team.map((t,i)=>(
        <div key={t.email} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:T.white, border:`1px solid ${t.accepted?T.green+"44":T.border}`, borderRadius:10, marginBottom:6 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:`hsl(${i*60+180},55%,88%)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:`hsl(${i*60+180},55%,30%)`, flexShrink:0 }}>{t.email[0].toUpperCase()}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:600, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>{t.email}</div>
            <div style={{ fontSize:11, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>{t.role} · {ACCESS_LEVELS.find(a=>a.id===t.access)?.label}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:10, fontWeight:700, color:t.accepted?T.green:T.amber, fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>
              {t.accepted ? "✓ Accepted" : "⏳ Pending"}
            </span>
            <button onClick={()=>removeFromTeam(t.email)} style={{ background:"none", border:"none", color:T.ink4, cursor:"pointer", fontSize:16 }}>×</button>
          </div>
        </div>
      ))}
    </div>,
    <div key="review">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:8 }}>
        <p style={{ margin:0, fontSize:"14px", color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>{d.name||"Your child"}'s profile summary.</p>
        {child?.id && (
          <button onClick={()=>setStep(0)} style={{ padding:"6px 14px", background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:8, color:T.ink2, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            ✏️ Edit Profile
          </button>
        )}
      </div>
      {[
        { label:"Child", color:T.teal, content:<><div style={{ fontSize:18, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>{d.name||"—"}</div><div style={{ fontSize:12, color:T.ink3, fontFamily:"'DM Sans',sans-serif", marginTop:3 }}>{[d.age&&`Age ${d.age}`,d.school,d.diagnosis].filter(Boolean).join(" · ")||"—"}</div></> },
        { label:"✓ What Works", color:T.green, content:<div style={{ fontSize:12, color:T.ink2, fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}><b style={{ color:T.green }}>Motivators: </b>{d.motivators.join(", ")||"—"}<br/><b style={{ color:T.green }}>Calming: </b>{d.calming.join(", ")||"—"}<br/><b style={{ color:T.green }}>Communication: </b>{d.comm.join(", ")||"—"}</div> },
        { label:"⚠ Watch For", color:"#dc2626", content:<div style={{ fontSize:12, color:T.ink2, fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}><b style={{ color:"#dc2626" }}>Triggers: </b>{d.triggers.join(", ")||"—"}<br/><b style={{ color:"#dc2626" }}>Sensory: </b>{d.sensory.join(", ")||"—"}</div> },
      ].map((s,i)=>(
        <div key={i} style={{ background:s.color+"12", border:`1px solid ${s.color}33`, borderRadius:12, padding:"14px 16px", marginBottom:10 }}>
          <div style={{ fontSize:10, fontWeight:700, color:s.color, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>{s.label}</div>
          {s.content}
        </div>
      ))}
      {/* Share passport section — only shown when profile exists */}
      {child?.id && !isDemo && (
        <div style={{ marginTop:16, padding:"16px", background:T.teal+"10", borderRadius:12, border:`1px solid ${T.teal}33` }}>
          <div style={{ fontSize:11, fontWeight:700, color:T.teal, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>🔗 Shareable Passport Link</div>
          <p style={{ margin:"0 0 10px", fontSize:12, color:T.ink3, fontFamily:"'DM Sans',sans-serif", lineHeight:1.55 }}>
            Share this link with any provider, teacher, or caregiver. They can view {d.name||"your child"}'s profile without needing an account.
          </p>
          {shareUrl ? (
            <div>
              <div style={{ display:"flex", gap:6, marginBottom:8 }}>
                <div style={{ flex:1, padding:"8px 12px", background:T.white, border:`1px solid ${T.border}`, borderRadius:8, fontSize:12, color:T.ink2, fontFamily:"'DM Mono',monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{shareUrl}</div>
                <button onClick={copyLink} style={{ padding:"8px 14px", background:copied?T.green:T.teal, border:"none", borderRadius:8, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:12, cursor:"pointer", flexShrink:0, transition:"all 0.2s" }}>
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
              </div>
              <button onClick={revokeLink} disabled={revoking} style={{ background:"none", border:"none", color:T.rose, fontFamily:"'DM Sans',sans-serif", fontSize:11, cursor:"pointer", fontWeight:600, padding:0 }}>
                {revoking ? "Revoking…" : "× Revoke this link"}
              </button>
            </div>
          ) : (
            <button onClick={generateShareLink} disabled={shareLoading} style={{ width:"100%", padding:"10px", background:shareLoading?T.surface:`linear-gradient(135deg,${T.teal},${T.tealD})`, border:"none", borderRadius:8, color:shareLoading?T.ink3:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:13, cursor:shareLoading?"not-allowed":"pointer" }}>
              {shareLoading ? "Generating…" : "🔗 Generate Share Link"}
            </button>
          )}
        </div>
      )}
    </div>
  ];

  return (
    <div style={{ maxWidth:560, margin:"0 auto", width:"100%" }}>
      {showPHIConsent && <PHIConsentModal childName={d.name} onConfirm={async()=>{ setShowPHIConsent(false); await doSave(); }} onCancel={()=>setShowPHIConsent(false)} />}
      <div style={{ marginBottom:20 }}>
        {child?.id ? (
          /* Tab navigation for existing profiles */
          <div style={{ display:"flex", gap:3, background:T.surface, borderRadius:10, padding:3, border:`1px solid ${T.border}`, overflowX:"auto" }}>
            {PASSPORT_STEPS.map((s,i)=>(
              <button key={s} onClick={()=>setStep(i)} style={{ flex:1, minWidth:60, padding:"7px 8px", borderRadius:7, border:"none", background:step===i?T.white:"transparent", color:step===i?T.ink:T.ink3, fontFamily:"'DM Sans',sans-serif", fontWeight:step===i?700:500, fontSize:12, cursor:"pointer", whiteSpace:"nowrap", boxShadow:step===i?"0 1px 4px rgba(0,0,0,0.08)":"none", transition:"all 0.15s" }}>{s}</button>
            ))}
          </div>
        ) : (
          /* Progress bar for new profiles */
          <div>
            <div style={{ display:"flex", gap:6, marginBottom:12 }}>
              {PASSPORT_STEPS.map((s,i)=><div key={s} style={{ height:4, flex:1, borderRadius:2, background:i<=step?T.teal:T.border, transition:"background 0.3s" }} />)}
            </div>
            <div style={{ fontSize:11, fontWeight:700, color:T.teal, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:4 }}>Step {step+1} of {PASSPORT_STEPS.length} · {PASSPORT_STEPS[step]}</div>
          </div>
        )}
        <h2 style={{ margin:"10px 0 0", fontSize:20, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>{PASSPORT_STEPS[step]}</h2>
      </div>
      <div style={{ background:T.white, borderRadius:16, padding:24, border:`1px solid ${T.border}`, boxShadow:"0 2px 12px rgba(0,0,0,0.05)", marginBottom:16 }}>
        {pages[step]}
      </div>
      <div style={{ display:"flex", gap:10 }}>
        {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{ padding:"11px 20px", background:T.white, border:`1.5px solid ${T.border}`, borderRadius:10, color:T.ink2, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:14, cursor:"pointer" }}>← Back</button>}
        {step<PASSPORT_STEPS.length-1
          ? <button onClick={()=>setStep(s=>s+1)} style={{ flex:1, padding:"11px 20px", background:`linear-gradient(135deg,${T.teal},${T.tealD})`, border:"none", borderRadius:10, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14, cursor:"pointer" }}>Continue →</button>
          : <button onClick={handleSave} disabled={saving||saved} style={{ flex:1, padding:"11px 20px", background:saved?T.green:saving?T.surface:`linear-gradient(135deg,${T.indigo},${T.violet})`, border:"none", borderRadius:10, color:saving?T.ink3:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14, cursor:saving||saved?"not-allowed":"pointer", transition:"all 0.3s" }}>
              {saved ? "✓ Saved!" : saving ? "Saving…" : isDemo ? "📤 Share Profile (Demo)" : child?.id ? "💾 Save Changes" : "💾 Save Profile"}
            </button>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WEEKLY DIGEST
// ═══════════════════════════════════════════════════════════════════════════
function WeeklyDigestScreen({ child, sessions }) {
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openCard, setOpenCard] = useState(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);


  const generate = async () => {
    if (!sessions.length && !child) return;
    setLoading(true); setDigest(null);
    const name = child?.name || "this child";
    const lines = sessions.map((s,i)=>`Session ${i+1}: ${s.role} (${s.date}) — Response: ${s.response}. Win: "${s.win}" Challenge: "${s.challenge}" For family: "${s.forFamily}"`).join("\n");
    const prompt = `Write a warm weekly digest for parents of ${name}, age ${child?.age||"unknown"}, ${child?.diagnosis||"special needs"}.\n\nSESSIONS:\n${lines||"No sessions this week."}\n\nRespond ONLY with JSON (no markdown):\n{"headline":"warm specific headline","narrative":"2-3 warm sentences","bigWin":"best moment 1 sentence","pattern":"cross-provider pattern 1-2 sentences","forHome":["up to 3 home tips under 15 words each"],"lookAhead":"1 optimistic sentence"}`;
    try {
      const r = await fetch(AI_ENDPOINT, { method:"POST", headers:apiHeaders(), body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{role:"user",content:prompt}] }) });
      const data = await r.json();
      const text = data.content?.map(b=>b.text||"").join("") || "";
      setDigest(JSON.parse(text.replace(/```json|```/g,"").trim()));
    } catch(e) { console.error("[Readily] Digest error:", e); } finally { setLoading(false); }
  };

  const sendEmail = async () => {
    if (!digest || emailSending) return;
    setEmailSending(true);
    try {
      const childName = child?.name || "your child";
      const emailBody = [
        `Weekly Digest for ${childName}`,
        `Week of ${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}`,
        ``,
        `${digest.headline}`,
        ``,
        digest.narrative,
        ``,
        `🏆 Big Win`,
        digest.bigWin,
        ``,
        `🔍 Pattern`,
        digest.pattern,
        ...(digest.forHome?.length ? [``, `🏠 Try at Home`, ...digest.forHome.map((t,i) => `${i+1}. ${t}`)] : []),
        ``,
        `🌅 Looking Ahead`,
        digest.lookAhead,
        ``,
        `---`,
        `This digest was generated by Readily — your care coordination platform.`,
        `Log in to see full session notes: https://readily.ablepam.ca`,
      ].join("\n");

      // Use mailto as fallback — opens email client with pre-filled content
      const subject = encodeURIComponent(`Readily Weekly Digest — ${childName} — ${new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})}`);
      const body = encodeURIComponent(emailBody);
      // location.href is more reliable than window.open for mailto across browsers
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 4000);
    } catch(e) {
      console.error(e);
    } finally {
      setEmailSending(false);
    }
  };

  // Digest generates on demand only — not auto on mount to avoid errors on page load

  const overall = (() => {
    if (!sessions.length) return {label:"No sessions yet",color:T.ink3,bg:T.surface,emoji:"📅"};
    const map={Exceptional:4,Good:3,Mixed:2,Difficult:1};
    const avg=sessions.reduce((s,x)=>s+(map[x.response]||2),0)/sessions.length;
    if(avg>=3.5) return {label:"Exceptional week",color:T.green,bg:T.greenL,emoji:"🌟"};
    if(avg>=2.5) return {label:"Good week",color:T.teal,bg:T.tealL,emoji:"👍"};
    return {label:"Mixed week",color:T.amber,bg:T.amberL,emoji:"↕️"};
  })();

  return (
    <div style={{ maxWidth:620, margin:"0 auto" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:T.gold, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.1em", marginBottom:4 }}>WEEK OF {new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}).toUpperCase()}</div>
          <h2 style={{ margin:0, fontSize:26, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>{child?.name||"Your child"}'s Week</h2>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <div style={{ padding:"8px 14px", background:overall.bg, borderRadius:10, display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:16 }}>{overall.emoji}</span>
            <span style={{ fontWeight:700, fontSize:13, color:overall.color, fontFamily:"'DM Sans',sans-serif" }}>{overall.label}</span>
          </div>
          <button onClick={generate} disabled={loading} style={{ padding:"8px 14px", background:T.ink, border:"none", borderRadius:8, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:12, cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:13 }}>↻</span>
            <span>{loading ? "Generating…" : digest ? "Regenerate" : "Generate Digest"}</span>
          </button>
          {digest && (
            <button onClick={sendEmail} disabled={emailSending||emailSent} style={{ padding:"8px 14px", background:emailSent?T.green:T.white, border:`1.5px solid ${emailSent?T.green:T.border}`, borderRadius:8, color:emailSent?"#fff":T.ink2, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:12, cursor:emailSending||emailSent?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.2s" }}>
              <span style={{ fontSize:13 }}>{emailSent?"✓":"📧"}</span>
              <span>{emailSent ? "Opened in email" : emailSending ? "Preparing…" : "Email this digest"}</span>
            </button>
          )}
        </div>
      </div>

      {sessions.length === 0 && !loading && (
        <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:14, padding:"28px", textAlign:"center", marginBottom:16 }}>
          <div style={{ fontSize:32, marginBottom:10 }}>📅</div>
          <div style={{ fontSize:15, fontWeight:600, color:T.ink, fontFamily:"'DM Sans',sans-serif", marginBottom:6 }}>No sessions logged yet</div>
          <div style={{ fontSize:13, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>Once your providers log sessions, they'll appear here in the weekly digest.</div>
        </div>
      )}

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
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10, marginBottom:14 }}>
            <div style={{ background:T.greenL, borderRadius:10, padding:"12px 14px", border:"1px solid #86efac" }}>
              <div style={{ fontSize:10, fontWeight:700, color:T.green, fontFamily:"'DM Sans',sans-serif", marginBottom:5 }}>🏆 BIG WIN</div>
              <p style={{ margin:0, fontSize:12, color:"#14532d", fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>{digest.bigWin}</p>
            </div>
            <div style={{ background:T.tealL, borderRadius:10, padding:"12px 14px", border:"1px solid #99f6e4" }}>
              <div style={{ fontSize:10, fontWeight:700, color:T.teal, fontFamily:"'DM Sans',sans-serif", marginBottom:5 }}>🔍 PATTERN</div>
              <p style={{ margin:0, fontSize:12, color:"#134e4a", fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>{digest.pattern}</p>
            </div>
          </div>
          {digest.forHome?.length>0&&(
            <div style={{ background:"rgba(217,119,6,0.08)", borderRadius:10, padding:"12px 14px", marginBottom:12 }}>
              <div style={{ fontSize:10, fontWeight:700, color:T.amber, fontFamily:"'DM Sans',sans-serif", marginBottom:8 }}>🏠 TRY AT HOME</div>
              {digest.forHome.map((tip,i)=>(
                <div key={i} style={{ display:"flex", gap:8, marginBottom:i<digest.forHome.length-1?6:0 }}>
                  <span style={{ width:18, height:18, borderRadius:"50%", background:T.gold, color:"#fff", fontSize:10, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i+1}</span>
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

      {sessions.map((s,i)=>{
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
                  {s.win&&<><div style={{ fontSize:11, fontWeight:700, color:T.green, fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>WIN</div><p style={{ margin:"0 0 10px", fontSize:13, color:T.ink2, fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>{s.win}</p></>}
                  {s.challenge&&<><div style={{ fontSize:11, fontWeight:700, color:T.amber, fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>WORKING ON</div><p style={{ margin:"0 0 10px", fontSize:13, color:T.ink2, fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>{s.challenge}</p></>}
                  {s.forFamily&&<div style={{ background:T.tealL, borderRadius:8, padding:"8px 12px", border:`1px solid ${T.teal}33` }}><div style={{ fontSize:10, fontWeight:700, color:T.teal, fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>FOR HOME</div><p style={{ margin:0, fontSize:12, color:T.teal, fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>{s.forFamily}</p></div>}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCS & GOALS
// ═══════════════════════════════════════════════════════════════════════════
function DocsGoalsScreen({ child, goals, docs, onGoalsChange }) {
  const [tab, setTab] = useState("docs");
  const [newGoal, setNewGoal] = useState("");
  const [newCat, setNewCat] = useState("Communication");
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const fileRef = useRef();

  const addGoal = async () => {
    if (!newGoal.trim()) return;
    const newG = { text:newGoal.trim(), category:newCat };
    if (child?.id) {
      const { data } = await supabase.from("family_goals").insert({ child_id:child.id, ...newG }).select().single();
      if (data) onGoalsChange && onGoalsChange([...goals, data]);
    } else {
      onGoalsChange && onGoalsChange([...goals, { id:Date.now(), ...newG }]);
    }
    setNewGoal(""); setShowForm(false);
  };

  const removeGoal = async (id) => {
    if (child?.id) await supabase.from("family_goals").delete().eq("id", id);
    onGoalsChange && onGoalsChange(goals.filter(g=>g.id!==id));
  };

  const generateReport = async () => {
    setGenerating(true); setReport(null);
    const allGoals = [...docs.flatMap(d=>d.goals||[]).map(g=>`[Official] ${g}`), ...goals.map(g=>`[Family] ${g.text}`)].join("\n");
    const prompt = `Generate a progress report for ${child?.name||"this child"}, age ${child?.age||"unknown"}, ${child?.diagnosis||"special needs"}.\n\nGOALS:\n${allGoals||"No goals set yet."}\n\nRespond ONLY with JSON:\n{"reportTitle":"warm title","overallSummary":"2-3 warm sentences","goalProgress":[{"goal":"goal","source":"source","status":"On Track or Making Progress or Needs Attention or Not Yet Started","evidence":"evidence","tip":"tip"}],"focusAreas":["focus areas"],"strengths":["strengths"],"suggestedChanges":["changes"],"encouragement":"closing"}`;
    try {
      const r = await fetch(AI_ENDPOINT, { method:"POST", headers:apiHeaders(), body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{role:"user",content:prompt}] }) });
      const data = await r.json();
      const text = data.content?.map(b=>b.text||"").join("") || "";
      setReport(JSON.parse(text.replace(/```json|```/g,"").trim()));
    } catch(e) { console.error(e); } finally { setGenerating(false); }
  };

  const SC = { "On Track":{color:T.green,bg:T.greenL,icon:"✓"}, "Making Progress":{color:"#0891b2",bg:T.tealL,icon:"↗"}, "Needs Attention":{color:T.amber,bg:T.amberL,icon:"!"}, "Not Yet Started":{color:T.ink3,bg:T.surface,icon:"○"} };

  return (
    <div style={{ maxWidth:620, margin:"0 auto" }}>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ margin:"0 0 4px", fontSize:24, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>Documents & Goals</h2>
        <p style={{ margin:0, fontSize:13, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>Upload IEPs and plans. Add family goals. Generate AI progress reports.</p>
      </div>

      <div style={{ background:`linear-gradient(135deg,${T.indigo}22,${T.violet}15)`, border:`1px solid ${T.indigo}44`, borderRadius:14, padding:"18px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:14, color:T.ink, fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>Generate Progress Report</div>
          <div style={{ fontSize:12, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>AI cross-references documents and goals to show how {child?.name||"your child"} is progressing.</div>
        </div>
        <button onClick={generateReport} disabled={generating} style={{ padding:"10px 18px", background:generating?T.surface:`linear-gradient(135deg,${T.indigo},${T.violet})`, border:"none", borderRadius:10, color:generating?T.ink3:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:13, cursor:generating?"not-allowed":"pointer" }}>
          {generating?"✨ Generating…":"✨ Generate Now"}
        </button>
      </div>

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
            {report.encouragement&&<div style={{ padding:"12px 14px", background:`linear-gradient(135deg,${T.indigoL},${T.tealL})`, borderRadius:10, fontSize:13, color:T.ink, fontFamily:"'DM Sans',sans-serif", lineHeight:1.6, fontStyle:"italic" }}>🌱 {report.encouragement}</div>}
          </div>
        </div>
      )}

      <div style={{ display:"flex", gap:4, marginBottom:16, background:T.surface, borderRadius:10, padding:4, border:`1px solid ${T.border}`, width:"fit-content" }}>
        {[["docs","📁 Documents"],["goals","🎯 Family Goals"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ padding:"7px 16px", borderRadius:7, border:"none", background:tab===id?T.white:"transparent", color:tab===id?T.ink:T.ink3, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, cursor:"pointer" }}>{lbl}</button>
        ))}
      </div>

      {tab==="docs"&&(
        <div>
          <div style={{ background:T.white, border:`2px dashed ${T.border2}`, borderRadius:12, padding:16, marginBottom:12, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
            <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:600, color:T.ink, fontFamily:"'DM Sans',sans-serif", marginBottom:2 }}>Upload a document</div><div style={{ fontSize:11, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>PDF, image or Word doc</div></div>
            <input ref={fileRef} type="file" style={{ display:"none" }} />
            <button onClick={()=>fileRef.current?.click()} style={{ padding:"8px 16px", background:T.indigo, border:"none", borderRadius:8, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>⬆ Upload</button>
          </div>
          {docs.length===0&&<div style={{ textAlign:"center", padding:"28px", color:T.ink3, fontFamily:"'DM Sans',sans-serif", fontSize:14 }}>No documents yet — upload an IEP or ABA plan to get started.</div>}
          {docs.map((d,i)=>(
            <div key={d.id||i} style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:12, padding:"14px 16px", display:"flex", gap:12, marginBottom:8 }}>
              <div style={{ width:36, height:36, borderRadius:8, background:(DOC_TYPES.find(t=>t.id===d.type)?.color||T.ink3)+"20", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{DOC_TYPES.find(t=>t.id===d.type)?.icon||"📄"}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:13, color:T.ink, fontFamily:"'DM Sans',sans-serif", marginBottom:2 }}>{d.name}</div>
                <div style={{ fontSize:11, color:T.ink3, fontFamily:"'DM Sans',sans-serif", marginBottom:6 }}>{d.size} · {d.date}</div>
                {d.goals?.slice(0,2).map((g,j)=><div key={j} style={{ fontSize:11, color:T.ink2, fontFamily:"'DM Sans',sans-serif", marginBottom:2, display:"flex", gap:5 }}><span style={{ color:DOC_TYPES.find(t=>t.id===d.type)?.color||T.ink3, fontSize:10 }}>▸</span>{g}</div>)}
                {d.goals?.length>2&&<div style={{ fontSize:10, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>+{d.goals.length-2} more</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==="goals"&&(
        <div>
          {goals.length===0&&<div style={{ textAlign:"center", padding:"20px", color:T.ink3, fontFamily:"'DM Sans',sans-serif", fontSize:14, marginBottom:12 }}>No family goals yet. Add one below.</div>}
          {goals.map((g,i)=>(
            <div key={g.id||i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"12px 14px", background:T.white, borderRadius:10, border:`1px solid ${T.border}`, marginBottom:8 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:[T.indigo,T.violet,T.green,T.teal,T.amber][i%5], flexShrink:0, marginTop:5 }} />
              <div style={{ flex:1 }}><div style={{ fontSize:13, color:T.ink, fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>{g.text}</div><div style={{ fontSize:10, color:T.ink3, fontFamily:"'DM Sans',sans-serif", marginTop:2 }}>{g.category}</div></div>
              <button onClick={()=>removeGoal(g.id)} style={{ background:"none", border:"none", color:T.ink4, cursor:"pointer", fontSize:16 }}>×</button>
            </div>
          ))}
          {showForm?(
            <div style={{ background:T.white, border:`1px solid ${T.border2}`, borderRadius:12, padding:14, marginTop:8 }}>
              <textarea value={newGoal} onChange={e=>setNewGoal(e.target.value)} placeholder={`e.g. ${child?.name||"My child"} can order their own food at a restaurant`} style={{ width:"100%", padding:"9px 11px", background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:8, color:T.ink, fontFamily:"'DM Sans',sans-serif", fontSize:13, minHeight:64, resize:"vertical", marginBottom:8, boxSizing:"border-box" }} />
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
// COST ESTIMATOR
// ═══════════════════════════════════════════════════════════════════════════
const THERAPY_COLORS_LIST = ["#2563eb","#7c3aed","#059669","#d97706","#e11d48","#0891b2"];

function CostEstimatorScreen({ child, therapies: initialTherapies, onTherapiesChange }) {
  const [therapies, setTherapies] = useState(initialTherapies||[]);
  const [expanded, setExpanded] = useState(null);
  const [view, setView] = useState("list");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newType, setNewType] = useState("Speech Therapy");
  const [newProvider, setNewProvider] = useState("");

  const THERAPY_TYPES = [
    "Speech Therapy","ABA Therapy","Occupational Therapy",
    "Physical Therapy","Applied Behaviour Analysis","Special Education",
    "Feeding Therapy","Music Therapy","Art Therapy",
    "Behavioural Therapy","Social Skills Training","Other"
  ];

  useEffect(()=>{ setTherapies(initialTherapies||[]); },[initialTherapies]);

  const updateLocal = (id, key, val) => {
    setTherapies(ts => ts.map(t => t.id === id ? {...t, [key]: val} : t));
  };

  // Save a single field to Supabase after user finishes editing
  const saveField = async (id, key, val) => {
    if (!child?.id) return;
    // Map frontend key names to database column names
    const colMap = {
      type: "type", provider: "provider_name", frequency: "frequency",
      freqUnit: "freq_unit", costPerSession: "cost_per_session",
      coverage: "coverage", startDate: "start_date", endDate: "end_date",
    };
    const col = colMap[key];
    if (!col) return;
    await supabase.from("therapies").update({ [col]: val }).eq("id", id);
  };

  const updateAndSave = (id, key, val) => {
    updateLocal(id, key, val);
    saveField(id, key, val);
  };
  const remove = async (id) => {
    if (child?.id) await supabase.from("therapies").delete().eq("id",id);
    const updated=therapies.filter(t=>t.id!==id); setTherapies(updated); onTherapiesChange&&onTherapiesChange(updated);
  };
  const add = async () => {
    const newT={type:newType,provider:newProvider,frequency:1,freqUnit:"week",costPerSession:150,coverage:"none",startDate:new Date().toISOString().slice(0,10),endDate:new Date(Date.now()+365*86400000).toISOString().slice(0,10)};
    if (child?.id) {
      const { data } = await supabase.from("therapies").insert({ child_id:child.id, type:newT.type, provider_name:newT.provider, frequency:newT.frequency, freq_unit:newT.freqUnit, cost_per_session:newT.costPerSession, coverage:newT.coverage, start_date:newT.startDate, end_date:newT.endDate }).select().single();
      if (data) { const updated=[...therapies,{...newT,id:data.id}]; setTherapies(updated); setExpanded(data.id); }
    } else {
      const id=Date.now(); const updated=[...therapies,{...newT,id}]; setTherapies(updated); setExpanded(id);
    }
    setShowAddForm(false); setNewType("Speech Therapy"); setNewProvider("");
  };

  const calcs=useMemo(()=>therapies.map(t=>({...t,...calcT(t)})),[therapies]);
  const totals=useMemo(()=>({gross:calcs.reduce((s,c)=>s+c.grossTotal,0),covered:calcs.reduce((s,c)=>s+c.covered,0),oop:calcs.reduce((s,c)=>s+c.outOfPocket,0),sessions:calcs.reduce((s,c)=>s+c.totalSessions,0)}),[calcs]);
  const chartData=useMemo(()=>{
    const map={};
    therapies.forEach(t=>{
      const mo=monthsBetween(t.startDate,t.endDate); if(!mo||!t.startDate) return;
      const start=new Date(t.startDate); const spm=sessPerMo(Number(t.frequency)||0,t.freqUnit);
      const cov=COVERAGE_OPTIONS.find(c=>c.id===t.coverage)||COVERAGE_OPTIONS[3];
      const oopPerSess=(Number(t.costPerSession)||0)*(1-cov.pct/100);
      for(let m=0;m<mo;m++){const d=new Date(start.getFullYear(),start.getMonth()+m,1);const key=d.toLocaleDateString("en-US",{month:"short",year:"2-digit"});if(!map[key])map[key]={month:key,total:0};map[key].total+=spm*oopPerSess;}
    });
    return Object.values(map).slice(0,12);
  },[therapies]);

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

      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8, marginBottom:18 }}>
        {[{label:"Gross Total",value:fmt$(totals.gross),color:T.ink,bg:T.white},{label:"Insurance Covers",value:fmt$(totals.covered),color:T.green,bg:T.greenL},{label:"Your Out-of-Pocket",value:fmt$(totals.oop),color:T.rose,bg:T.roseL},{label:"Monthly Average",value:fmt$(totals.oop/Math.max(1,Math.max(...calcs.map(c=>c.months||1)))),color:T.amber,bg:T.amberL}].map((s,i)=>(
          <div key={i} style={{ background:s.bg, border:`1.5px solid ${T.border}`, borderRadius:12, padding:"14px 16px" }}>
            <div style={{ fontSize:10, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:5 }}>{s.label}</div>
            <div style={{ fontSize:22, fontWeight:800, color:s.color, fontFamily:"'DM Sans',sans-serif" }}>{s.value}</div>
          </div>
        ))}
      </div>

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

      {view==="list"&&(
        <>
          {therapies.length===0&&<div style={{ textAlign:"center", padding:"28px", color:T.ink3, fontFamily:"'DM Sans',sans-serif", fontSize:14, background:T.white, borderRadius:12, border:`1px solid ${T.border}`, marginBottom:10 }}>No therapies added yet. Click below to add one.</div>}
          {therapies.map((t,i)=>{
            const c=calcT(t); const col=THERAPY_COLORS_LIST[i%THERAPY_COLORS_LIST.length];
            return (
              <div key={t.id} style={{ background:T.white, border:`1.5px solid ${expanded===t.id?col+"66":T.border}`, borderRadius:12, overflow:"hidden", marginBottom:8 }}>
                <div onClick={()=>setExpanded(expanded===t.id?null:t.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"13px 16px", cursor:"pointer" }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:col, flexShrink:0 }} />
                  <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:13, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>{t.type}</div><div style={{ fontSize:11, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>{t.provider||"—"} · {t.frequency}×/{t.freqUnit} · {fmt$(t.costPerSession)}/session</div></div>
                  <div style={{ textAlign:"right" }}><div style={{ fontSize:15, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>{fmt$(c.outOfPocket)}</div><div style={{ fontSize:10, color:T.ink4, fontFamily:"'DM Sans',sans-serif" }}>out of pocket</div></div>
                  <button onClick={e=>{ e.stopPropagation(); if(window.confirm(`Delete ${t.type}?`)) remove(t.id); }} style={{ background:"none", border:"none", color:T.ink4, cursor:"pointer", fontSize:16, padding:"2px 4px", flexShrink:0 }} title="Delete">🗑</button>
                  <span style={{ color:T.ink3, fontSize:10, transform:expanded===t.id?"rotate(180deg)":"rotate(0)", transition:"transform 0.2s", display:"inline-block" }}>▼</span>
                </div>
                {expanded===t.id&&(
                  <div style={{ padding:"0 16px 16px", borderTop:`1px solid ${T.border}` }}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:10, marginTop:14 }}>
                      <div><label style={{ fontSize:10, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em", display:"block", marginBottom:5 }}>FREQUENCY</label><div style={{ display:"flex", gap:5 }}><input type="number" value={t.frequency} min="1" onChange={e=>updateLocal(t.id,"frequency",e.target.value)} onBlur={e=>saveField(t.id,"frequency",e.target.value)} style={{ width:60, padding:"8px 8px", background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:T.ink }} /><select value={t.freqUnit} onChange={e=>updateAndSave(t.id,"freqUnit",e.target.value)} style={{ flex:1, padding:"8px 8px", background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:12, color:T.ink }}><option value="week">per week</option><option value="month">per month</option><option value="year">per year</option></select></div></div>
                      <div><label style={{ fontSize:10, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em", display:"block", marginBottom:5 }}>COST/SESSION</label><div style={{ position:"relative" }}><span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:T.ink3, fontSize:13 }}>$</span><input type="number" value={t.costPerSession} min="0" onChange={e=>updateLocal(t.id,"costPerSession",e.target.value)} onBlur={e=>saveField(t.id,"costPerSession",e.target.value)} style={{ width:"100%", padding:"8px 10px 8px 22px", background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:T.ink, boxSizing:"border-box" }} /></div></div>
                      <div><label style={{ fontSize:10, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em", display:"block", marginBottom:5 }}>START</label><input type="date" value={t.startDate||""} onChange={e=>updateLocal(t.id,"startDate",e.target.value)} onBlur={e=>saveField(t.id,"startDate",e.target.value)} style={{ width:"100%", padding:"8px 10px", background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:T.ink, boxSizing:"border-box" }} /></div>
                      <div><label style={{ fontSize:10, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em", display:"block", marginBottom:5 }}>END</label><input type="date" value={t.endDate||""} onChange={e=>updateLocal(t.id,"endDate",e.target.value)} onBlur={e=>saveField(t.id,"endDate",e.target.value)} style={{ width:"100%", padding:"8px 10px", background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:T.ink, boxSizing:"border-box" }} /></div>
                      <div style={{ gridColumn:"1/-1" }}>
                        <label style={{ fontSize:10, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em", display:"block", marginBottom:7 }}>INSURANCE COVERAGE</label>
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                          {COVERAGE_OPTIONS.map(opt=><button key={opt.id} onClick={()=>updateAndSave(t.id,"coverage",opt.id)} style={{ padding:"5px 12px", borderRadius:20, border:t.coverage===opt.id?`2px solid ${opt.color}`:`1.5px solid ${T.border}`, background:t.coverage===opt.id?opt.color+"15":T.white, color:t.coverage===opt.id?opt.color:T.ink3, fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, cursor:"pointer" }}>{opt.label}</button>)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginTop:12 }}>
                      {[{l:"Sessions",v:c.totalSessions},{l:"Gross",v:fmt$(c.grossTotal)},{l:"Out of Pocket",v:fmt$(c.outOfPocket),hi:true}].map((s,j)=>(
                        <div key={j} style={{ background:s.hi?T.roseL:T.surface, borderRadius:8, padding:"8px 10px", border:`1px solid ${s.hi?T.rose+"44":T.border}` }}>
                          <div style={{ fontSize:9, color:s.hi?T.rose:T.ink3, fontFamily:"'DM Sans',sans-serif", marginBottom:2 }}>{s.l}</div>
                          <div style={{ fontSize:14, fontWeight:800, color:s.hi?T.rose:T.ink, fontFamily:"'DM Sans',sans-serif" }}>{s.v}</div>
                        </div>
                      ))}
                    </div>
                    <button onClick={()=>{ if(window.confirm(`Remove ${t.type}? This cannot be undone.`)) remove(t.id); }} style={{ marginTop:10, padding:"7px 14px", background:"#fff1f2", border:`1px solid ${T.rose}44`, borderRadius:7, color:T.rose, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:12, cursor:"pointer" }}>🗑 Delete therapy</button>
                  </div>
                )}
              </div>
            );
          })}
          {showAddForm ? (
            <div style={{ background:T.white, border:`1.5px solid ${T.indigo}44`, borderRadius:12, padding:"16px" }}>
              <div style={{ fontSize:11, fontWeight:700, color:T.indigo, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:12 }}>Add Therapy</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:10, marginBottom:12 }}>
                <div>
                  <label style={{ fontSize:10, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em", display:"block", marginBottom:5 }}>THERAPY TYPE</label>
                  <select value={newType} onChange={e=>setNewType(e.target.value)} style={{ width:"100%", padding:"9px 10px", background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:T.ink, boxSizing:"border-box" }}>
                    {THERAPY_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:10, fontWeight:700, color:T.ink3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em", display:"block", marginBottom:5 }}>PROVIDER NAME (optional)</label>
                  <input type="text" value={newProvider} onChange={e=>setNewProvider(e.target.value)} placeholder="e.g. Dr. Sarah Chen" style={{ width:"100%", padding:"9px 10px", background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:T.ink, boxSizing:"border-box" }} />
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>{ setShowAddForm(false); setNewType("Speech Therapy"); setNewProvider(""); }} style={{ padding:"9px 16px", background:T.white, border:`1.5px solid ${T.border}`, borderRadius:8, color:T.ink3, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, cursor:"pointer" }}>Cancel</button>
                <button onClick={add} style={{ flex:1, padding:"9px", background:`linear-gradient(135deg,${T.indigo},#6366f1)`, border:"none", borderRadius:8, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>Add {newType} →</button>
              </div>
            </div>
          ) : (
            <button onClick={()=>setShowAddForm(true)} style={{ width:"100%", padding:12, background:T.white, border:`2px dashed ${T.border2}`, borderRadius:10, color:T.indigo, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>+ Add therapy</button>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER VIEW
// ═══════════════════════════════════════════════════════════════════════════
const FOCUS_AREAS_BY_LOGGER = {
  provider: ["Articulation","Language comprehension","Expressive language","Pragmatics / social language","AAC / communication device","Receptive vocabulary","Following directions","Transitions","Fluency","Social skills","Self-regulation","Fine motor","Gross motor","Feeding / eating"],
  parent:   ["Morning routine","Mealtime","Getting dressed","Community outing","Homework / learning","Sibling interaction","Screen time / wind-down","Bedtime routine","Playing independently","Social play","Emotional regulation","Transition at home","Communication at home","Sensory activity"],
};
const RESP_OPTS = [{label:"Exceptional",icon:"🌟",color:T.green},{label:"Good",icon:"👍",color:T.teal},{label:"Mixed",icon:"↕",color:T.amber},{label:"Difficult",icon:"⚡",color:T.rose}];

function ProviderView({ child, session: authSession }) {
  const [loggerType, setLoggerType] = useState("provider"); // "provider" or "parent"
  const [focus, setFocus] = useState([]);
  const [response, setResponse] = useState("");
  const [win, setWin] = useState(""); const [challenge, setChallenge] = useState(""); const [forFamily, setForFamily] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const focusAreas = FOCUS_AREAS_BY_LOGGER[loggerType];
  const toggleFocus = f => setFocus(p=>p.includes(f)?p.filter(x=>x!==f):[...p,f]);
  const canSubmit = focus.length>0&&response&&(win||challenge);
  const ta = { width:"100%", padding:"10px 12px", background:"#1e2535", border:"1.5px solid #2a3348", borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#e8f0f8", minHeight:68, resize:"vertical", boxSizing:"border-box" };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    if (child?.id && authSession?.user?.id) {
      await supabase.from("sessions").insert({ child_id:child.id, provider_id:authSession.user.id, date:new Date().toISOString().slice(0,10), response, focus_areas:focus, win, challenge, for_family:forFamily });
    }
    setSaving(false); setSubmitted(true);
  };

  if(submitted) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, textAlign:"center", maxWidth:500, margin:"0 auto" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>{loggerType==="parent"?"🏠":"✅"}</div>
      <h3 style={{ margin:"0 0 8px", fontSize:22, fontWeight:800, color:"#e8f0f8", fontFamily:"'DM Sans',sans-serif" }}>{loggerType==="parent"?"Home activity logged":"Session logged"}</h3>
      <p style={{ margin:"0 0 20px", fontSize:14, color:"#8b9cc8", fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>This will appear in {child?.name||"your child"}'s weekly digest alongside provider sessions.</p>
      <button onClick={()=>{setSubmitted(false);setFocus([]);setResponse("");setWin("");setChallenge("");setForFamily("");}} style={{ padding:"11px 24px", background:"linear-gradient(135deg,#38bdf8,#0ea5e9)", border:"none", borderRadius:10, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14, cursor:"pointer" }}>Log another</button>
    </div>
  );

  return (
    <div style={{ maxWidth:600, margin:"0 auto" }}>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:10, fontWeight:700, color:"#38bdf8", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.1em", marginBottom:4 }}>ACTIVITY LOG</div>
        <h2 style={{ margin:"0 0 10px", fontSize:24, fontWeight:800, color:"#eef2ff", fontFamily:"'DM Sans',sans-serif" }}>Log activity with {child?.name||"—"}</h2>
        {/* Logger type toggle */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, background:"#111827", borderRadius:10, padding:4, border:"1px solid #2a3348", width:"fit-content" }}>
          {[["provider","🩺 Provider / Therapist"],["parent","🏠 Parent / Caregiver"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>{setLoggerType(id);setFocus([]);}} style={{ padding:"7px 16px", borderRadius:7, border:"none", background:loggerType===id?"#1e3a5f":"transparent", color:loggerType===id?"#eef2ff":"#6b8299", fontFamily:"'DM Sans',sans-serif", fontWeight:loggerType===id?700:500, fontSize:13, cursor:"pointer" }}>{lbl}</button>
          ))}
        </div>
        <div style={{ fontSize:11, color:"#6b8299", fontFamily:"'DM Sans',sans-serif", marginTop:8 }}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
      </div>
      {child&&loggerType==="provider"&&(
        <div style={{ background:"rgba(56,189,248,0.08)", border:"1px solid rgba(56,189,248,0.25)", borderRadius:10, padding:"11px 14px", marginBottom:18, display:"flex", gap:10 }}>
          <span style={{ fontSize:14, flexShrink:0 }}>💡</span>
          <div style={{ fontSize:12, color:"#a8bdd0", fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>From {child.name}'s passport: motivators include <strong style={{ color:"#eef2ff" }}>{child.motivators?.slice(0,2).join(", ")||"—"}</strong>. Calming strategies: <strong style={{ color:"#eef2ff" }}>{child.calming?.[0]||"—"}</strong>.</div>
        </div>
      )}
      {child&&loggerType==="parent"&&(
        <div style={{ background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.25)", borderRadius:10, padding:"11px 14px", marginBottom:18, display:"flex", gap:10 }}>
          <span style={{ fontSize:14, flexShrink:0 }}>🏠</span>
          <div style={{ fontSize:12, color:"#a8bdd0", fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>Home activities give providers important context. What you log here will appear in {child.name}'s weekly digest alongside therapy sessions.</div>
        </div>
      )}
      <div style={{ marginBottom:18 }}>
        <label style={{ fontSize:10, fontWeight:700, color:"#6b8299", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em", display:"block", marginBottom:8 }}>{loggerType==="parent"?"WHAT ACTIVITY OR SITUATION? *":"WHAT DID YOU WORK ON? *"}</label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {focusAreas.map(f=><button key={f} onClick={()=>toggleFocus(f)} style={{ padding:"6px 12px", borderRadius:20, border:focus.includes(f)?"1.5px solid #38bdf8":"1.5px solid #2a3348", background:focus.includes(f)?"rgba(56,189,248,0.15)":"transparent", color:focus.includes(f)?"#38bdf8":"#6b8299", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:focus.includes(f)?700:400, cursor:"pointer" }}>{f}</button>)}
        </div>
      </div>
      <div style={{ marginBottom:18 }}>
        <label style={{ fontSize:10, fontWeight:700, color:"#6b8299", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em", display:"block", marginBottom:8 }}>{loggerType==="parent"?`HOW DID ${child?.name?.toUpperCase()||"THEY"} DO AT HOME? *`:`HOW DID ${child?.name?.toUpperCase()||"THE CHILD"} RESPOND? *`}</label>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:7 }}>
          {RESP_OPTS.map(opt=><button key={opt.label} onClick={()=>setResponse(opt.label)} style={{ padding:"11px 6px", borderRadius:10, border:response===opt.label?`2px solid ${opt.color}`:"1.5px solid #2a3348", background:response===opt.label?opt.color+"18":"#1e2535", color:response===opt.label?opt.color:"#6b8299", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:response===opt.label?700:400, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}><span style={{ fontSize:18 }}>{opt.icon}</span>{opt.label}</button>)}
        </div>
      </div>
      <div style={{ marginBottom:14 }}><label style={{ fontSize:10, fontWeight:700, color:"#6b8299", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em", display:"block", marginBottom:6 }}>{loggerType==="parent"?"ONE WIN AT HOME":"ONE WIN"}</label><textarea style={ta} value={win} onChange={e=>setWin(e.target.value)} placeholder={loggerType==="parent"?`e.g. ${child?.name||"They"} asked for help instead of melting down`:`e.g. ${child?.name||"They"} used 'I want' unprompted twice during play`} /></div>
      <div style={{ marginBottom:14 }}><label style={{ fontSize:10, fontWeight:700, color:"#6b8299", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em", display:"block", marginBottom:6 }}>{loggerType==="parent"?"WHAT WAS HARD?":"ONE THING TO KEEP WORKING ON"}</label><textarea style={ta} value={challenge} onChange={e=>setChallenge(e.target.value)} placeholder={loggerType==="parent"?"e.g. Getting shoes on before school — lots of resistance today":"e.g. Initiating conversation without a prompt"} /></div>
      <div style={{ marginBottom:22 }}><label style={{ fontSize:10, fontWeight:700, color:"#6b8299", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em", display:"block", marginBottom:6 }}>{loggerType==="parent"?"ANYTHING FOR THE CARE TEAM TO KNOW? (optional)":"NOTE FOR THE FAMILY (optional)"}</label><textarea style={ta} value={forFamily} onChange={e=>setForFamily(e.target.value)} placeholder={loggerType==="parent"?"e.g. She had a great morning — shoes went on with no fuss for the first time":"e.g. Try asking 'what do you want?' before meals this week"} /></div>
      <button onClick={handleSubmit} disabled={!canSubmit||saving} style={{ width:"100%", padding:14, background:canSubmit&&!saving?"linear-gradient(135deg,#0ea5e9,#0284c7)":"#1e2535", border:canSubmit&&!saving?"none":"1.5px solid #2a3348", borderRadius:12, color:canSubmit&&!saving?"#fff":"#5a6a8a", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:15, cursor:canSubmit&&!saving?"pointer":"not-allowed" }}>
        {saving?"Saving…":canSubmit?"✓ Submit session log":"Complete required fields to submit"}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
function Dashboard({ setPage, child, sessions, goals, therapies }) {
  const isMobile = useIsMobile();
  const overall = (() => {
    if (!sessions.length) return {label:"No sessions yet",color:T.ink3,bg:T.surface,emoji:"📅"};
    const map={Exceptional:4,Good:3,Mixed:2,Difficult:1};
    const avg=sessions.reduce((s,x)=>s+(map[x.response]||2),0)/sessions.length;
    if(avg>=3.5) return {label:"Exceptional week",color:T.green,bg:T.greenL,emoji:"🌟"};
    if(avg>=2.5) return {label:"Good week",color:T.teal,bg:T.tealL,emoji:"👍"};
    return {label:"Mixed week",color:T.amber,bg:T.amberL,emoji:"↕️"};
  })();
  const weekOop = therapies.reduce((sum,t)=>{ const cov=COVERAGE_OPTIONS.find(c=>c.id===t.coverage)||COVERAGE_OPTIONS[3]; return sum+(t.costPerSession*(1-cov.pct/100)*(sessPerMo(t.frequency,t.freqUnit)/4.33)); },0);
  const childName = child?.name || "your child";
  const initial = childName[0]?.toUpperCase() || "?";

  return (
    <div style={{ maxWidth:680, margin:"0 auto" }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:11, fontWeight:700, color:T.teal, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em", marginBottom:4 }}>GOOD MORNING</div>
        <h2 style={{ margin:"0 0 4px", fontSize:isMobile?22:26, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>Welcome back 👋</h2>
        <p style={{ margin:0, fontSize:14, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>Here's {childName}'s snapshot for the week.</p>
      </div>

      <div style={{ background:`linear-gradient(135deg,${T.tealD},${T.indigo})`, borderRadius:16, padding:"20px 22px", marginBottom:16, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:-20, top:-20, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
        <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.65)", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.1em", marginBottom:6 }}>CHILD PROFILE</div>
        <div style={{ fontSize:22, fontWeight:800, color:"#fff", fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>{childName}</div>
        <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)", fontFamily:"'DM Sans',sans-serif", marginBottom:16 }}>
          {[child?.age&&`Age ${child.age}`,child?.diagnosis,child?.school].filter(Boolean).join(" · ")||"Complete your profile to get started"}
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {sessions.slice(0,3).map((s,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", background:"rgba(255,255,255,0.15)", borderRadius:20 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:RESP_STYLE[s.response]?.dot||"#fff" }} />
              <span style={{ fontSize:11, fontWeight:600, color:"#fff", fontFamily:"'DM Sans',sans-serif" }}>{s.role.replace(" Therapist","").replace(" Teacher","")}</span>
            </div>
          ))}
          {sessions.length>0&&<div style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", background:"rgba(255,255,255,0.15)", borderRadius:20 }}><span style={{ fontSize:11, fontWeight:600, color:"#fff", fontFamily:"'DM Sans',sans-serif" }}>{overall.emoji} {overall.label}</span></div>}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:isMobile?6:8, marginBottom:16 }}>
        {[
          {label:"Sessions This Week",value:sessions.length,emoji:"📅",color:T.indigo},
          {label:"Week's Out-of-Pocket",value:fmt$(weekOop),emoji:"💰",color:T.rose},
          {label:"Goals Tracked",value:goals.length,emoji:"🎯",color:T.green},
        ].map((s,i)=>(
          <div key={i} style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:12, padding:isMobile?"10px 10px":"14px 16px" }}>
            <div style={{ fontSize:isMobile?14:18, marginBottom:4 }}>{s.emoji}</div>
            <div style={{ fontSize:isMobile?16:20, fontWeight:800, color:s.color, fontFamily:"'DM Sans',sans-serif" }}>{s.value}</div>
            <div style={{ fontSize:isMobile?9:11, color:T.ink3, fontFamily:"'DM Sans',sans-serif", marginTop:2, lineHeight:1.3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10 }}>
        {[
          {id:"digest",    emoji:"📬",title:"Weekly Digest",  desc:`See ${childName}'s AI-generated week summary`,color:T.gold},
          {id:"passport",  emoji:"🪪", title:"Child Profile",  desc:`View or update ${childName}'s profile`,       color:T.teal},
          {id:"documents", emoji:"📁", title:"Docs & Goals",   desc:"Upload IEPs and generate progress reports",   color:T.indigo},
          {id:"costs",     emoji:"💰", title:"Cost Planner",   desc:"Track therapy spend and coverage",            color:T.rose},
        ].map(s=>(
          <button key={s.id} onClick={()=>setPage(s.id)} style={{ background:T.white, border:`1.5px solid ${T.border}`, borderRadius:14, padding:isMobile?"12px 14px":"16px 18px", textAlign:"left", cursor:"pointer", display:"block", transition:"all 0.2s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=s.color;e.currentTarget.style.boxShadow=`0 4px 16px ${s.color}20`;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.boxShadow="none";}}>
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
// CHAT
// ═══════════════════════════════════════════════════════════════════════════
const CHAT_ROLES = {
  parent:           { label:"Parent",           canChat:true,  seeCosts:true  },
  trusted_provider: { label:"Trusted Provider", canChat:true,  seeCosts:false },
  basic_provider:   { label:"Provider",         canChat:false, seeCosts:false },
};

function ChatPanel({ onClose, role="parent", child, sessions, goals, therapies }) {
  const childName = child?.name || "your child";
  const [messages, setMessages] = useState([{ role:"assistant", content:`Hi! I know everything in ${childName}'s file. What would you like to know?` }]);
  const [input, setInput] = useState(""); const [loading, setLoading] = useState(false); const [showSugg, setShowSugg] = useState(true);
  const bottomRef = useRef(null); const inputRef = useRef(null);
  const perms = CHAT_ROLES[role]||CHAT_ROLES.parent;

  const systemPrompt = useMemo(()=>{
    const sessionCtx = sessions.map(s=>`- ${s.role} (${s.date}): ${s.response}. Win: "${s.win}" Challenge: "${s.challenge}" For family: "${s.forFamily}"`).join("\n");
    const goalCtx = goals.map(g=>`[Family Goal] ${g.text} (${g.category})`).join("\n");
    const costCtx = perms.seeCosts ? `THERAPIES:\n${therapies.map(t=>{const c=calcT(t);const cov=COVERAGE_OPTIONS.find(x=>x.id===t.coverage);return `- ${t.type}: ${t.frequency}x/${t.freqUnit} @ $${t.costPerSession}/session. Coverage: ${cov?.label}. OOP: $${Math.round(c.outOfPocket)}`;}).join("\n")}` : "";
    return `You are a compassionate AI assistant in Readily — a care coordination platform for families of children with special needs.\nSpeaking with a ${perms.label} of ${childName}.\nCHILD: ${childName}, Age ${child?.age||"unknown"}, ${child?.diagnosis||"special needs"}, ${child?.school||""}\nMOTIVATORS: ${child?.motivators?.join(", ")||"—"}\nCALMING: ${child?.calming?.join(", ")||"—"}\nTRIGGERS: ${child?.triggers?.join(", ")||"—"}\nSESSIONS:\n${sessionCtx||"No sessions logged yet."}\nGOALS:\n${goalCtx||"No goals set yet."}\n${costCtx}\nAnswer warmly and specifically using only the data above. Keep answers to 2-4 sentences. You are not a therapist.${!perms.seeCosts?" Do NOT discuss costs or financial information.":""}`;
  },[role,child,sessions,goals,therapies]);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages,loading]);
  useEffect(()=>{ inputRef.current?.focus(); },[]);

  const send = async (text) => {
    const q=(text||input).trim(); if(!q||loading) return;
    setInput(""); setShowSugg(false);
    const next=[...messages,{role:"user",content:q}]; setMessages(next); setLoading(true);
    try {
      const res=await fetch(AI_ENDPOINT,{method:"POST",headers:apiHeaders(),body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:systemPrompt,messages:next.map(m=>({role:m.role,content:m.content}))})});
      const data=await res.json();
      if (data.error) { console.error("[Readily] API error:", data.error); throw new Error(data.error.message || "API error"); }
      setMessages(prev=>[...prev,{role:"assistant",content:data.content?.map(b=>b.text||"").join("")||"Sorry, I couldn't get a response."}]);
    } catch(e) { console.error("[Readily] Chat error:", e); setMessages(prev=>[...prev,{role:"assistant",content:"Something went wrong. Please try again."}]); }
    finally { setLoading(false); }
  };

  const suggestions = [`What's been the biggest win for ${childName} recently?`, "What should I try at home when they have a meltdown?", "What patterns do providers keep noticing?", ...(perms.seeCosts?["How much have we spent on therapy?"]:[])];

  return (
    <div style={{ position:"fixed", bottom:"env(safe-area-inset-bottom,0px)", right:0, left:0, zIndex:100, margin:"0 auto", width:"100%", maxWidth:440, background:T.white, borderRadius:"20px 20px 0 0", boxShadow:"0 -4px 40px rgba(15,23,42,0.18)", border:`1px solid ${T.border}`, display:"flex", flexDirection:"column", maxHeight:"min(560px,80vh)", animation:"chatSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1) both" }}>
      <div style={{ padding:"14px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
        <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg,${T.teal},${T.indigo})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>⚡</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:700, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>Ask about {childName}</div>
          <div style={{ fontSize:11, color:T.ink3, fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:5 }}><span style={{ width:6, height:6, borderRadius:"50%", background:T.green, display:"inline-block" }} />Knows their full file · {perms.label} access</div>
        </div>
        <button onClick={onClose} style={{ background:T.surface, border:"none", borderRadius:8, width:28, height:28, cursor:"pointer", color:T.ink3, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
        {messages.map((m,i)=>(
          <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
            {m.role==="assistant"&&<div style={{ width:26, height:26, borderRadius:"50%", background:`linear-gradient(135deg,${T.teal},${T.indigo})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0, marginRight:7, marginTop:2 }}>⚡</div>}
            <div style={{ maxWidth:"80%", padding:"10px 13px", borderRadius:m.role==="user"?"16px 16px 4px 16px":"4px 16px 16px 16px", background:m.role==="user"?`linear-gradient(135deg,${T.teal},${T.tealD})`:T.surface, color:m.role==="user"?"#fff":T.ink, fontSize:13, fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>{m.content}</div>
          </div>
        ))}
        {showSugg&&messages.length===1&&(
          <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:4 }}>
            <div style={{ fontSize:10, fontWeight:700, color:T.ink4, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em", paddingLeft:33 }}>SUGGESTED QUESTIONS</div>
            {suggestions.slice(0,4).map((q,i)=>(
              <button key={i} onClick={()=>send(q)} style={{ marginLeft:33, padding:"7px 12px", background:T.white, border:`1px solid ${T.border}`, borderRadius:20, textAlign:"left", cursor:"pointer", color:T.ink2, fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500 }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=T.teal;e.currentTarget.style.color=T.teal;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.ink2;}}>{q}</button>
            ))}
          </div>
        )}
        {loading&&<div style={{ display:"flex", alignItems:"flex-start", gap:7 }}><div style={{ width:26, height:26, borderRadius:"50%", background:`linear-gradient(135deg,${T.teal},${T.indigo})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0, marginTop:2 }}>⚡</div><div style={{ background:T.surface, borderRadius:"4px 16px 16px 16px", padding:"12px 16px", display:"flex", gap:5, alignItems:"center" }}>{[0,1,2].map(i=><div key={i} style={{ width:7, height:7, borderRadius:"50%", background:T.teal, animation:"bounce 1.2s ease infinite", animationDelay:`${i*0.2}s` }} />)}</div></div>}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding:"10px 12px", borderTop:`1px solid ${T.border}`, display:"flex", gap:8, alignItems:"flex-end", flexShrink:0 }}>
        <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder={`Ask anything about ${childName}…`} rows={1} style={{ flex:1, padding:"9px 12px", background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:12, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:T.ink, resize:"none", outline:"none", lineHeight:1.5, maxHeight:80, overflowY:"auto" }} onInput={e=>{e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,80)+"px";}} />
        <button onClick={()=>send()} disabled={!input.trim()||loading} style={{ width:38, height:38, borderRadius:10, border:"none", flexShrink:0, background:input.trim()&&!loading?`linear-gradient(135deg,${T.teal},${T.tealD})`:T.surface, color:input.trim()&&!loading?"#fff":T.ink4, cursor:input.trim()&&!loading?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>↑</button>
      </div>
    </div>
  );
}

function ChatButton({ role="parent", child, sessions, goals, therapies, isMobile=false }) {
  const [open, setOpen] = useState(false);
  if (!CHAT_ROLES[role]?.canChat) return null;
  const btnBottom = isMobile ? 68 : 24;
  return (
    <>
      {open&&<ChatPanel onClose={()=>setOpen(false)} role={role} child={child} sessions={sessions} goals={goals} therapies={therapies} />}
      <button onClick={()=>setOpen(v=>!v)} style={{ position:"fixed", bottom:btnBottom, right:24, zIndex:201, width:50, height:50, borderRadius:"50%", border:"none", background:open?T.ink:`linear-gradient(135deg,${T.teal},${T.indigo})`, color:"#fff", cursor:"pointer", fontSize:open?18:20, boxShadow:"0 4px 20px rgba(13,148,136,0.4)", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}>
        {open?"×":"💬"}
      </button>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARED PASSPORT VIEW — public, no login required
// ═══════════════════════════════════════════════════════════════════════════
function SharedPassportView({ token }) {
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("passport_shares")
          .select("child_id, children(*)")
          .eq("token", token)
          .eq("active", true)
          .maybeSingle();
        if (error || !data) { setError("This passport link is invalid or has been revoked."); return; }
        setChild(data.children);
      } catch(e) { setError("Something went wrong loading this passport."); }
      finally { setLoading(false); }
    };
    load();
  }, [token]);

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:T.bg, flexDirection:"column", gap:12 }}>
      <div style={{ fontSize:32, animation:"spin 1s linear infinite" }}>⚡</div>
      <div style={{ fontSize:13, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>Loading passport…</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:T.bg, padding:24 }}>
      <div style={{ background:T.white, borderRadius:16, padding:"32px 28px", maxWidth:440, width:"100%", textAlign:"center", border:`1px solid ${T.border}` }}>
        <div style={{ fontSize:40, marginBottom:14 }}>🔒</div>
        <h2 style={{ margin:"0 0 10px", fontSize:20, fontWeight:800, color:T.ink, fontFamily:"'DM Sans',sans-serif" }}>Passport unavailable</h2>
        <p style={{ margin:"0 0 20px", fontSize:14, color:T.ink3, fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>{error}</p>
        <a href="https://readily.ablepam.ca" style={{ fontSize:13, color:T.teal, fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>← Back to Readily</a>
      </div>
    </div>
  );

  const sections = [
    { label:"✓ What Works", color:T.green, items:[
      { title:"Motivators & Interests", value:child.motivators?.join(", ")||"—" },
      { title:"Calming Strategies", value:child.calming?.join(", ")||"—" },
      { title:"Communication Style", value:child.communication?.join(", ")||"—" },
    ]},
    { label:"⚠ Watch For", color:"#dc2626", items:[
      { title:"Triggers", value:child.triggers?.join(", ")||"—" },
      { title:"Sensory Profile", value:child.sensory?.join(", ")||"—" },
    ]},
  ];

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0;}`}</style>
      {/* Header */}
      <div style={{ background:T.nav, padding:"14px 24px", display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:28, height:28, borderRadius:7, background:T.tealD, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⚡</div>
        <span style={{ fontSize:15, fontWeight:800, color:"#fff", letterSpacing:"-0.02em" }}>Readily</span>
        <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginLeft:4, fontFamily:"'DM Sans',sans-serif" }}>Care Passport</span>
      </div>

      <div style={{ maxWidth:600, margin:"0 auto", padding:"32px 20px 60px" }}>
        {/* Hero card */}
        <div style={{ background:`linear-gradient(135deg,${T.tealD},${T.indigo})`, borderRadius:18, padding:"24px 26px", marginBottom:20, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", right:-20, top:-20, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
          <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.6)", letterSpacing:"0.12em", marginBottom:8 }}>CARE PASSPORT</div>
          <div style={{ fontSize:28, fontWeight:900, color:"#fff", marginBottom:4, letterSpacing:"-0.02em" }}>{child.name}</div>
          <div style={{ fontSize:14, color:"rgba(255,255,255,0.7)" }}>
            {[child.age&&`Age ${child.age}`, child.diagnosis, child.school].filter(Boolean).join(" · ")||"—"}
          </div>
          <div style={{ marginTop:14, padding:"8px 12px", background:"rgba(255,255,255,0.1)", borderRadius:8, fontSize:12, color:"rgba(255,255,255,0.7)", lineHeight:1.5 }}>
            🔒 This is a read-only view shared by {child.name}'s family. Information is confidential and for care purposes only.
          </div>
        </div>

        {/* Profile sections */}
        {sections.map((section, si) => (
          <div key={si} style={{ background:T.white, borderRadius:14, padding:"18px 20px", marginBottom:12, border:`1px solid ${T.border}` }}>
            <div style={{ fontSize:10, fontWeight:800, color:section.color, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:14 }}>{section.label}</div>
            {section.items.map((item, ii) => (
              <div key={ii} style={{ marginBottom: ii < section.items.length-1 ? 12 : 0 }}>
                <div style={{ fontSize:11, fontWeight:700, color:T.ink3, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:4 }}>{item.title}</div>
                <div style={{ fontSize:13, color:T.ink2, lineHeight:1.6 }}>{item.value}</div>
              </div>
            ))}
          </div>
        ))}

        {/* Notes */}
        {child.notes && (
          <div style={{ background:T.white, borderRadius:14, padding:"18px 20px", marginBottom:12, border:`1px solid ${T.border}` }}>
            <div style={{ fontSize:10, fontWeight:800, color:T.ink3, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>📝 ADDITIONAL NOTES</div>
            <div style={{ fontSize:13, color:T.ink2, lineHeight:1.7 }}>{child.notes}</div>
          </div>
        )}

        {/* Footer note */}
        <div style={{ textAlign:"center", marginTop:24 }}>
          <div style={{ fontSize:11, color:T.ink4, lineHeight:1.6 }}>
            Shared via <strong style={{ color:T.teal }}>Readily</strong> by AblePam Inc. · This link was shared directly by the family.<br/>
            Information is confidential. Please use only for the direct care of this child.
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SHELL
// ═══════════════════════════════════════════════════════════════════════════
export default function ReadilyApp({ session }) {
  const isMobile = useIsMobile();

  // Check if this is a shared passport URL — /passport/TOKEN
  const passportToken = useMemo(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/passport\/([a-zA-Z0-9_-]+)$/);
    return match ? match[1] : null;
  }, []);

  const [page, setPage] = useState("dashboard");
  const isProvider = page === "provider";
  const isDemo = session?.user?.email === DEMO_EMAIL;

  const [child, setChild] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [docs, setDocs] = useState([]);
  const [therapies, setTherapies] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [displayName, setDisplayName] = useState("My Family");

  useEffect(() => {
    if (isDemo) {
      setChild(DEMO_CHILD);
      setSessions(DEMO_SESSIONS);
      setGoals(DEMO_GOALS);
      setDocs(DEMO_DOCS);
      setTherapies(DEMO_THERAPIES);
      setDisplayName("Maya's Family");
      setDataLoading(false);
      return;
    }

    const loadData = async () => {
      setDataLoading(true);
      try {
        const { data: family } = await supabase.from("families").select("name").eq("id", session.user.id).maybeSingle();
        if (family?.name) setDisplayName(family.name + "'s Family");

        const { data: children } = await supabase.from("children").select("*").eq("family_id", session.user.id).limit(1);
        if (children?.length > 0) {
          const c = children[0];
          setChild(c);

          // Load sessions - only if child exists
          const { data: sessionData, error: sessErr } = await supabase
            .from("sessions")
            .select("*")
            .eq("child_id", c.id)
            .order("date", { ascending:false })
            .limit(20);
          if (sessErr) console.error("[Readily] Sessions load error:", sessErr.message);

          // Load invitations for provider name/role lookup
          const { data: invites } = await supabase
            .from("invitations")
            .select("provider_id, provider_email, role")
            .eq("child_id", c.id);
          const inviteMap = {};
          if (invites) invites.forEach(inv => { if (inv.provider_id) inviteMap[inv.provider_id] = inv; });

          // Load providers table for names
          const { data: providerList } = await supabase
            .from("providers")
            .select("id, name, role");
          const providerMap = {};
          if (providerList) providerList.forEach(p => { providerMap[p.id] = p; });

          if (sessionData) {
            setSessions(sessionData.map(s => {
              const prov = providerMap[s.provider_id];
              const inv = inviteMap[s.provider_id];
              const providerName = prov?.name || inv?.provider_email?.split("@")[0] || "Provider";
              const providerRole = prov?.role || inv?.role || "Provider";
              return {
                provider: providerName,
                role: providerRole,
                date: new Date(s.date).toLocaleDateString("en-US", {weekday:"short",month:"short",day:"numeric"}),
                response: s.response || "Good",
                focusAreas: s.focus_areas || [],
                win: s.win || "",
                challenge: s.challenge || "",
                forFamily: s.for_family || "",
              };
            }));
          }

          const { data: goalData } = await supabase.from("family_goals").select("*").eq("child_id", c.id);
          if (goalData) setGoals(goalData);

          const { data: therapyData } = await supabase.from("therapies").select("*").eq("child_id", c.id);
          if (therapyData) setTherapies(therapyData.map(t => ({ id:t.id, type:t.type||"Therapy", provider:t.provider_name||"", frequency:t.frequency||1, freqUnit:t.freq_unit||"week", costPerSession:t.cost_per_session||0, coverage:t.coverage||"none", startDate:t.start_date||"", endDate:t.end_date||"" })));
        }
      } catch(e) { console.error("Data load error:", e); }
      finally { setDataLoading(false); }
    };

    loadData();
  }, [session?.user?.id, isDemo]);

  const handleSaved = async () => {
    const { data: children } = await supabase.from("children").select("*").eq("family_id", session.user.id).limit(1);
    if (children?.length > 0) {
      setChild(children[0]);
      setDisplayName(children[0].name + "'s Family");
    }
    setPage("dashboard");
  };

  // Public shared passport view — no auth needed
  if (passportToken) return <SharedPassportView token={passportToken} />;

  if (dataLoading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:T.bg, flexDirection:"column", gap:12 }}>
      <div style={{ width:40, height:40, borderRadius:"50%", background:`linear-gradient(135deg,${T.teal},${T.indigo})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, animation:"spin 1s linear infinite" }}>⚡</div>
      <div style={{ fontSize:13, color:T.ink3, fontFamily:"'DM Sans',sans-serif" }}>Loading your data…</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const SCREENS = {
    dashboard: <Dashboard setPage={setPage} child={child} sessions={sessions} goals={goals} therapies={therapies} />,
    passport:  <PassportBuilder session={session} child={child} onSaved={handleSaved} />,
    digest:    <WeeklyDigestScreen child={child} sessions={sessions} />,
    documents: <DocsGoalsScreen child={child} goals={goals} docs={docs} onGoalsChange={setGoals} />,
    costs:     <CostEstimatorScreen child={child} therapies={therapies} onTherapiesChange={setTherapies} />,
    provider:  <ProviderView child={child} session={session} />,
  };

  const initial = displayName[0]?.toUpperCase() || "?";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;700&display=swap');
        *{box-sizing:border-box;} body{margin:0;}
        @keyframes shimmer{0%,100%{opacity:0.4}50%{opacity:0.9}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes chatSlideUp{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:${T.border2};border-radius:2px;}
        input:focus,textarea:focus,select:focus{outline:none;border-color:${T.teal}!important;box-shadow:0 0 0 3px ${T.teal}18!important;}
        select option{background:${T.white};color:${T.ink};} button{transition:all 0.15s;}
        @media(max-width:640px){
          input,textarea,select{font-size:16px!important;}
        }
      `}</style>

      <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:isProvider?"#0c1a2e":T.bg, fontFamily:"'DM Sans',sans-serif" }}>

        {/* Sidebar — hidden on mobile, shown on desktop */}
        {!isMobile && <div style={{ width:220, minWidth:220, background:T.nav, display:"flex", flexDirection:"column", borderRight:"1px solid rgba(255,255,255,0.06)", flexShrink:0, overflowY:"auto" }}>
          <div style={{ padding:"18px 18px 14px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:T.tealD, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>⚡</div>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:"#fff", letterSpacing:"-0.02em" }}>Readily</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", fontFamily:"'DM Mono',monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:130 }}>{displayName}</div>
              </div>
            </div>
          </div>

          <nav style={{ flex:1, padding:"10px 8px" }}>
            <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.3)", fontFamily:"'DM Mono',monospace", letterSpacing:"0.12em", padding:"8px 10px 4px" }}>PARENT</div>
            {NAV.filter(n=>n.id!=="provider").map(n=>(
              <button key={n.id} onClick={()=>setPage(n.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:8, border:"none", background:page===n.id?"rgba(13,148,136,0.2)":"transparent", color:page===n.id?"#fff":"rgba(255,255,255,0.5)", fontFamily:"'DM Sans',sans-serif", fontWeight:page===n.id?700:500, fontSize:13, cursor:"pointer", marginBottom:2, textAlign:"left" }}
                onMouseEnter={e=>{if(page!==n.id){e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.color="rgba(255,255,255,0.85)";}}}
                onMouseLeave={e=>{if(page!==n.id){e.currentTarget.style.background="transparent";e.currentTarget.style.color="rgba(255,255,255,0.5)";}}} >
                <span style={{ fontSize:16, width:20, textAlign:"center", flexShrink:0 }}>{n.icon}</span>
                <span>{n.label}</span>
                {page===n.id&&<div style={{ marginLeft:"auto", width:4, height:4, borderRadius:"50%", background:T.teal }} />}
              </button>
            ))}
            <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.3)", fontFamily:"'DM Mono',monospace", letterSpacing:"0.12em", padding:"16px 10px 4px" }}>CARE TEAM</div>
            <button onClick={()=>setPage("provider")} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:8, border:"none", background:page==="provider"?"rgba(56,189,248,0.2)":"transparent", color:page==="provider"?"#38bdf8":"rgba(255,255,255,0.5)", fontFamily:"'DM Sans',sans-serif", fontWeight:page==="provider"?700:500, fontSize:13, cursor:"pointer", textAlign:"left" }}
              onMouseEnter={e=>{if(page!=="provider"){e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.color="rgba(255,255,255,0.85)";}}}
              onMouseLeave={e=>{if(page!=="provider"){e.currentTarget.style.background="transparent";e.currentTarget.style.color="rgba(255,255,255,0.5)";}}} >
              <span style={{ fontSize:16, width:20, textAlign:"center", flexShrink:0 }}>🩺</span>
              <span>Provider View</span>
              {page==="provider"&&<div style={{ marginLeft:"auto", width:4, height:4, borderRadius:"50%", background:"#38bdf8" }} />}
            </button>
          </nav>

          <div style={{ padding:"12px 14px", borderTop:"1px solid rgba(255,255,255,0.06)", margin:"0 8px 8px" }}>
            <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:10, padding:"10px 12px" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.35)", fontFamily:"'DM Mono',monospace", letterSpacing:"0.08em", marginBottom:5 }}>CHILD</div>
              <div style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{child?.name||"Not set up yet"}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", marginTop:1 }}>{child?.diagnosis||"—"}</div>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:8 }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:T.teal }} />
                <span style={{ fontSize:10, color:"rgba(255,255,255,0.45)", fontFamily:"'DM Mono',monospace" }}>{sessions.length} sessions this week</span>
              </div>
              {!isDemo&&(
                <button onClick={async()=>{await supabase.auth.signOut();window.location.reload();}} style={{ marginTop:10, width:"100%", padding:"5px 8px", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, color:"rgba(255,255,255,0.4)", fontFamily:"'DM Sans',sans-serif", fontSize:11, cursor:"pointer" }}>Sign out</button>
              )}
            </div>
          </div>
        </div>}

        {/* Main content */}
        <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
          <div style={{ height:52, borderBottom:`1px solid ${isProvider?"rgba(255,255,255,0.06)":T.border}`, display:"flex", alignItems:"center", padding:isMobile?"0 16px":"0 24px", background:isProvider?"#0f1923":T.white, flexShrink:0 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:700, color:isProvider?"#eef2ff":T.ink, fontFamily:"'DM Sans',sans-serif" }}>{NAV.find(n=>n.id===page)?.label||"Dashboard"}</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:`linear-gradient(135deg,${T.teal},${T.indigo})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff" }}>{initial}</div>
              {!isMobile && <span style={{ fontSize:13, fontWeight:600, color:isProvider?"#8b9cc8":T.ink2, fontFamily:"'DM Sans',sans-serif" }}>{displayName}</span>}
              {isMobile && !isDemo && (
                <button onClick={async()=>{ await supabase.auth.signOut(); window.location.reload(); }} style={{ padding:"5px 10px", background:"transparent", border:`1px solid ${isProvider?"rgba(255,255,255,0.15)":T.border}`, borderRadius:6, color:isProvider?"rgba(255,255,255,0.5)":T.ink3, fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, cursor:"pointer" }}>Sign out</button>
              )}
            </div>
          </div>
          <div key={page} style={{ flex:1, overflowY:"auto", padding:isMobile?"16px 14px 80px":"28px 24px 48px", background:isProvider?"#0e1117":T.bg, animation:"fadeIn 0.25s ease both" }}>
            {SCREENS[page]}
          </div>
        </div>
      </div>

      {!isProvider&&<ChatButton role="parent" child={child} sessions={sessions} goals={goals} therapies={therapies} isMobile={isMobile} />}

      {/* Mobile bottom nav */}
      {isMobile && !isProvider && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:200, background:T.nav, borderTop:"1px solid rgba(255,255,255,0.08)", display:"flex", height:60, paddingBottom:"env(safe-area-inset-bottom)" }}>
          {[
            {id:"dashboard", icon:"⊞", label:"Home"},
            {id:"passport",  icon:"🪪", label:"Profile"},
            {id:"digest",    icon:"📬", label:"Digest"},
            {id:"documents", icon:"📁", label:"Docs"},
            {id:"costs",     icon:"💰", label:"Costs"},
          ].map(n=>(
            <button key={n.id} onClick={()=>setPage(n.id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2, background:"none", border:"none", cursor:"pointer", color:page===n.id?"#0d9488":"rgba(255,255,255,0.4)", padding:"6px 0" }}>
              <span style={{ fontSize:18, lineHeight:1 }}>{n.icon}</span>
              <span style={{ fontSize:9, fontWeight:page===n.id?700:500, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.02em" }}>{n.label}</span>
            </button>
          ))}
        </div>
      )}
      {isMobile && isProvider && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:200, background:"#0c1a2e", borderTop:"1px solid rgba(255,255,255,0.08)", display:"flex", height:60 }}>
          <button onClick={()=>setPage("dashboard")} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2, background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.5)", padding:"6px 0" }}>
            <span style={{ fontSize:18 }}>⊞</span>
            <span style={{ fontSize:9, fontFamily:"'DM Sans',sans-serif" }}>Back</span>
          </button>
        </div>
      )}
    </>
  );
}
