import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

// ─── TOKENS ────────────────────────────────────────────────────────────────
const C = {
  bg:      "#f7f5f2",
  white:   "#ffffff",
  ink:     "#0f0e0c",
  ink2:    "#2d2b27",
  ink3:    "#6b6760",
  ink4:    "#a8a49e",
  teal:    "#0d9488",
  tealD:   "#0f766e",
  tealL:   "#ccfbf1",
  indigo:  "#4338ca",
  indigoL: "#e0e7ff",
  gold:    "#d97706",
  goldL:   "#fef3c7",
  rose:    "#be123c",
  nav:     "#0c1a2e",
  navL:    "rgba(255,255,255,0.06)",
};

// ─── SCROLL REVEAL ─────────────────────────────────────────────────────────
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function Reveal({ children, delay = 0, y = 20 }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : `translateY(${y}px)`, transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

// ─── WAITLIST FORM ─────────────────────────────────────────────────────────
function WaitlistForm({ dark = false, size = "default" }) {
  const [email, setEmail]     = useState("");
  const [role, setRole]       = useState("parent");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email."); return; }
    setLoading(true); setError("");
    try {
      const { error: sbError } = await supabase.from("waitlist").upsert({ email: email.trim().toLowerCase(), role, signed_up_at: new Date().toISOString() }, { onConflict: "email" });
      if (sbError) throw sbError;
      setDone(true);
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Try again.");
    } finally { setLoading(false); }
  };

  const borderColor  = dark ? "rgba(255,255,255,0.15)" : "#d6d0c8";
  const inputBg      = dark ? "rgba(255,255,255,0.07)" : C.white;
  const inputColor   = dark ? C.white : C.ink;
  const labelColor   = dark ? "rgba(255,255,255,0.5)" : C.ink3;
  const isLarge      = size === "large";

  if (done) return (
    <div style={{ padding: "20px 24px", background: dark ? "rgba(13,148,136,0.15)" : C.tealL, borderRadius: 14, border: `1px solid ${dark ? C.teal+"55" : C.teal+"44"}`, textAlign: "center" }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: dark ? "#fff" : C.tealD, fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>You're on the list!</div>
      <div style={{ fontSize: 13, color: dark ? "rgba(255,255,255,0.55)" : C.ink3, fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>We'll reach out personally to set up your child's profile. Check your inbox.</div>
    </div>
  );

  return (
    <div>
      {/* Role selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {[["parent","👨‍👩‍👧 Parent / Caregiver"],["provider","🩺 Therapist / Teacher"]].map(([val, lbl]) => (
          <button key={val} onClick={() => setRole(val)} style={{ padding: "6px 14px", borderRadius: 20, border: role === val ? `2px solid ${C.teal}` : `1.5px solid ${borderColor}`, background: role === val ? C.teal + "18" : "transparent", color: role === val ? (dark ? "#5eead4" : C.tealD) : labelColor, fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: role === val ? 700 : 400, cursor: "pointer", transition: "all 0.15s" }}>{lbl}</button>
        ))}
      </div>
      {/* Email input */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="your@email.com"
          style={{ flex: 1, minWidth: 200, padding: isLarge ? "14px 18px" : "12px 16px", background: inputBg, border: `1.5px solid ${error ? C.rose : borderColor}`, borderRadius: 10, fontFamily: "'Outfit', sans-serif", fontSize: isLarge ? 16 : 14, color: inputColor, outline: "none", transition: "border-color 0.2s" }}
          onFocus={e => e.target.style.borderColor = C.teal}
          onBlur={e => e.target.style.borderColor = error ? C.rose : borderColor}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ padding: isLarge ? "14px 28px" : "12px 22px", background: loading ? C.ink3 : `linear-gradient(135deg,${C.teal},${C.tealD})`, border: "none", borderRadius: 10, color: "#fff", fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: isLarge ? 16 : 14, cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap", boxShadow: loading ? "none" : `0 4px 16px ${C.teal}44`, transition: "all 0.2s" }}>
          {loading ? "Joining…" : "Join waitlist →"}
        </button>
      </div>
      {error && <div style={{ fontSize: 12, color: C.rose, fontFamily: "'Outfit', sans-serif", marginTop: 6 }}>{error}</div>}
      <div style={{ fontSize: 11, color: labelColor, fontFamily: "'Outfit', sans-serif", marginTop: 8 }}>No spam. No credit card. Just early access.</div>
    </div>
  );
}

// ─── PROBLEM STATEMENT CARD ────────────────────────────────────────────────
function PainCard({ emoji, text, delay }) {
  return (
    <Reveal delay={delay}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "16px 18px", background: C.white, borderRadius: 12, border: `1px solid #e8e4de`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{emoji}</span>
        <p style={{ margin: 0, fontSize: 14, color: C.ink2, fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>{text}</p>
      </div>
    </Reveal>
  );
}

// ─── FEATURE ROW ──────────────────────────────────────────────────────────
function FeatureRow({ number, label, title, body, visual, flip, delay }) {
  return (
    <Reveal delay={delay}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 40, alignItems: "center", direction: flip ? "rtl" : "ltr" }}>
        <div style={{ direction: "ltr" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", background: C.teal + "12", borderRadius: 20, marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: C.teal, fontFamily: "'Outfit', sans-serif", letterSpacing: "0.08em" }}>0{number}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.teal, fontFamily: "'Outfit', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
          </div>
          <h3 style={{ margin: "0 0 12px", fontSize: "clamp(20px,2.5vw,26px)", fontWeight: 800, color: C.ink, fontFamily: "'Outfit', sans-serif", lineHeight: 1.2 }}>{title}</h3>
          <p style={{ margin: 0, fontSize: 15, color: C.ink3, fontFamily: "'Outfit', sans-serif", lineHeight: 1.75 }}>{body}</p>
        </div>
        <div style={{ direction: "ltr" }}>{visual}</div>
      </div>
    </Reveal>
  );
}

// ─── MOCK UI COMPONENTS ────────────────────────────────────────────────────
function PassportMock() {
  return (
    <div style={{ background: "#0c1a2e", borderRadius: 18, padding: 20, boxShadow: "0 12px 40px rgba(12,26,46,0.25)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg,${C.teal},${C.indigo})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'Outfit',sans-serif" }}>M</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "'Outfit',sans-serif" }}>Maya, 7</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontFamily: "'Outfit',sans-serif" }}>ASD Level 2 · Sunridge Elementary</div>
        </div>
        <div style={{ marginLeft: "auto", padding: "3px 10px", background: C.teal+"22", borderRadius: 20, fontSize: 10, fontWeight: 700, color: "#5eead4", fontFamily: "'Outfit',sans-serif" }}>PASSPORT</div>
      </div>
      {[
        { label: "✓ WHAT WORKS", color: "#4ade80", tags: ["Dinosaurs 🦕", "Deep pressure", "Visual schedule"] },
        { label: "⚠ WATCH FOR", color: "#fb923c", tags: ["Loud sounds", "Unexpected changes"] },
        { label: "💬 COMMUNICATION", color: "#60a5fa", tags: ["Verbal", "Picture cards"] },
      ].map((s, i) => (
        <div key={i} style={{ marginBottom: i < 2 ? 10 : 0 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: s.color, fontFamily: "'Outfit',sans-serif", letterSpacing: "0.1em", marginBottom: 6 }}>{s.label}</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {s.tags.map(t => <span key={t} style={{ padding: "3px 9px", borderRadius: 20, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "'Outfit',sans-serif" }}>{t}</span>)}
          </div>
        </div>
      ))}
    </div>
  );
}

function DigestMock() {
  return (
    <div style={{ background: C.white, borderRadius: 18, padding: 20, border: "1px solid #e8e4de", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        <div style={{ width: 18, height: 18, borderRadius: "50%", background: `linear-gradient(135deg,${C.gold},#fbbf24)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>✨</div>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.gold, fontFamily: "'Outfit',sans-serif", letterSpacing: "0.1em" }}>WEEKLY AI DIGEST · APR 7–11</span>
      </div>
      <h4 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 800, color: C.ink, fontFamily: "'Outfit',sans-serif", lineHeight: 1.3 }}>Maya had her best week yet — two providers noticed the same thing.</h4>
      <p style={{ margin: "0 0 14px", fontSize: 12, color: C.ink3, fontFamily: "'Outfit',sans-serif", lineHeight: 1.6 }}>Both her speech therapist and ABA provider noted Maya is initiating more unprompted. The visual schedule is clearly working.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#16a34a", fontFamily: "'Outfit',sans-serif", marginBottom: 4 }}>🏆 BIG WIN</div>
          <div style={{ fontSize: 11, color: "#14532d", fontFamily: "'Outfit',sans-serif", lineHeight: 1.5 }}>Used 'I want' unprompted twice — a first.</div>
        </div>
        <div style={{ background: "#f0fdfa", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.teal, fontFamily: "'Outfit',sans-serif", marginBottom: 4 }}>🔍 PATTERN</div>
          <div style={{ fontSize: 11, color: "#134e4a", fontFamily: "'Outfit',sans-serif", lineHeight: 1.5 }}>Morning sessions go better when routine starts on time.</div>
        </div>
      </div>
      <div style={{ background: C.goldL, borderRadius: 8, padding: "8px 12px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: C.gold, fontFamily: "'Outfit',sans-serif", marginBottom: 3 }}>🏠 TRY AT HOME</div>
        <div style={{ fontSize: 11, color: "#78350f", fontFamily: "'Outfit',sans-serif" }}>Ask "what do you want?" before meals — she's ready for this.</div>
      </div>
    </div>
  );
}

function CostMock() {
  return (
    <div style={{ background: C.white, borderRadius: 18, padding: 20, border: "1px solid #e8e4de", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.ink3, fontFamily: "'Outfit',sans-serif", letterSpacing: "0.08em", marginBottom: 14 }}>2026 THERAPY COSTS</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[{ l: "Gross Total", v: "$28,400", c: C.ink }, { l: "Insurance Covers", v: "$17,040", c: "#16a34a" }, { l: "Your Out-of-Pocket", v: "$11,360", c: C.rose }, { l: "Per Month", v: "$947", c: C.gold }].map((s, i) => (
          <div key={i} style={{ background: i===2?"#fff1f2":i===1?"#f0fdf4":i===3?C.goldL:"#f7f5f2", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 9, color: C.ink3, fontFamily: "'Outfit',sans-serif", marginBottom: 3 }}>{s.l}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.c, fontFamily: "'Outfit',sans-serif" }}>{s.v}</div>
          </div>
        ))}
      </div>
      {[{ name: "Speech Therapy", oop: "$2,808", pct: 20, color: "#2563eb" }, { name: "ABA Therapy", oop: "$6,864", pct: 50, color: "#7c3aed" }, { name: "OT", oop: "$1,688", pct: 100, color: "#059669" }].map((t, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < 2 ? 8 : 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 12, color: C.ink2, fontFamily: "'Outfit',sans-serif" }}>{t.name}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, fontFamily: "'Outfit',sans-serif" }}>{t.oop} OOP</div>
        </div>
      ))}
    </div>
  );
}

// ─── TESTIMONIAL ──────────────────────────────────────────────────────────
function Quote({ text, name, role, color, delay }) {
  return (
    <Reveal delay={delay}>
      <div style={{ background: C.white, borderRadius: 16, padding: "24px", border: "1px solid #e8e4de", height: "100%" }}>
        <div style={{ fontSize: 32, color: C.teal, fontFamily: "'Outfit',sans-serif", lineHeight: 1, marginBottom: 10, opacity: 0.4 }}>"</div>
        <p style={{ margin: "0 0 20px", fontSize: 14, color: C.ink2, fontFamily: "'Outfit',sans-serif", lineHeight: 1.75, fontStyle: "italic" }}>{text}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", fontFamily: "'Outfit',sans-serif", flexShrink: 0 }}>{name[0]}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, fontFamily: "'Outfit',sans-serif" }}>{name}</div>
            <div style={{ fontSize: 11, color: C.ink4, fontFamily: "'Outfit',sans-serif" }}>{role}</div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────
export default function ReadilyLanding({ onLogin, onSignUp }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${C.bg}; font-family: 'Outfit', sans-serif; -webkit-font-smoothing: antialiased; }
        input, button, select, textarea { font-family: 'Outfit', sans-serif; }
        input:focus { outline: none; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .float { animation: float 4s ease-in-out infinite; }
        a { text-decoration: none; color: inherit; }
        @media(max-width:640px) {
          input, select, textarea { font-size: 16px !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.bg }}>

        {/* ── NAV ──────────────────────────────────────────────────────────── */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(247,245,242,0.95)" : "transparent", backdropFilter: scrolled ? "blur(12px)" : "none", borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "none", transition: "all 0.3s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: C.tealD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>⚡</div>
            <span style={{ fontSize: 18, fontWeight: 800, color: C.ink, letterSpacing: "-0.02em" }}>Readily</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => scrollTo("waitlist")} style={{ display: "none", padding: "8px 18px", background: C.teal, border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }} className="nav-cta">Join waitlist</button>
            <button onClick={onSignUp} style={{ padding: "8px 18px", background: C.teal, border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Sign up free</button>
            <button onClick={onLogin} style={{ padding: "8px 18px", background: "transparent", border: `1.5px solid ${C.ink}22`, borderRadius: 8, color: C.ink2, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Log in →</button>
          </div>
        </nav>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section style={{ padding: "120px 24px 80px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 60, alignItems: "center" }}>

            {/* Left copy */}
            <div style={{ animation: "fadeUp 0.7s ease both" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 12px", background: C.teal+"14", border: `1px solid ${C.teal}30`, borderRadius: 20, marginBottom: 22 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.teal, display: "inline-block", animation: "pulse 2s ease infinite" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: C.teal, letterSpacing: "0.05em" }}>Now accepting beta families</span>
              </div>

              <h1 style={{ fontSize: "clamp(32px,5vw,54px)", fontWeight: 900, color: C.ink, lineHeight: 1.1, marginBottom: 20, letterSpacing: "-0.03em" }}>
                Stop re-explaining<br />
                your child to<br />
                <span style={{ color: C.teal, position: "relative" }}>
                  every provider.
                  <svg style={{ position: "absolute", bottom: -4, left: 0, width: "100%", height: 6, overflow: "visible" }} viewBox="0 0 200 6" preserveAspectRatio="none">
                    <path d="M0,5 Q50,0 100,4 Q150,8 200,3" stroke={C.teal} strokeWidth="2.5" fill="none" opacity="0.5" />
                  </svg>
                </span>
              </h1>

              <p style={{ fontSize: "clamp(15px,2vw,18px)", color: C.ink3, lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
                Readily connects your child's therapists, teachers, and caregivers — so they always have what they need, and you never have to be the relay again.
              </p>

              <WaitlistForm size="large" />

              <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 28, flexWrap: "wrap" }}>
                {[["⚡","Free during beta"],["🔒","Your data, your control"],["⏱","12 min to set up"]].map(([icon, text]) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13 }}>{icon}</span>
                    <span style={{ fontSize: 12, color: C.ink3, fontWeight: 500 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating mock */}
            <div style={{ animation: "fadeUp 0.7s ease 150ms both", position: "relative" }}>
              <div className="float" style={{ animationDelay: "0s" }}>
                <DigestMock />
              </div>
              <div style={{ position: "absolute", bottom: -20, right: -10, width: 160, animation: "float 4s ease-in-out infinite", animationDelay: "0.5s" }}>
                <div style={{ background: C.nav, borderRadius: 12, padding: "10px 14px", boxShadow: "0 8px 24px rgba(12,26,46,0.3)" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#5eead4", fontFamily: "'Outfit',sans-serif", marginBottom:5 }}>FROM SARAH (SPEECH)</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontFamily: "'Outfit',sans-serif", lineHeight: 1.4 }}>Maya used 'I want' unprompted — a big first 🌟</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── COMBINED PROBLEM + SOLUTION ──────────────────────────────────── */}
        <section style={{ background: C.white, padding: "100px 24px", borderTop: "1px solid #e8e4de" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>

            {/* Headline statement */}
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 64 }}>
                <h2 style={{ fontSize: "clamp(22px,3.2vw,36px)", fontWeight: 900, color: C.ink, lineHeight: 1.35, letterSpacing: "-0.02em", maxWidth: 720, margin: "0 auto 16px" }}>
                  Families of children with special needs carry the heavy burden of coordinating care across multiple providers, with critical information often fragmented or lost.
                </h2>
                <p style={{ fontSize: "clamp(16px,2vw,20px)", color: C.teal, fontWeight: 700, lineHeight: 1.5, maxWidth: 620, margin: "0 auto" }}>
                  Readily brings clarity by keeping everything organized, connected, and secure in one place.
                </p>
              </div>
            </Reveal>

            {/* Pain + solution pairs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                {
                  emoji: "😮‍💨",
                  pain: "You re-explain your child's triggers, motivators, and history at every new intake, school meeting, and provider handoff.",
                  solutionName: "Readily's Care Passport",
                  solution: "captures everything once. Share it with any new provider, teacher, or caregiver — they arrive informed, every time.",
                  color: C.teal,
                  visual: <PassportMock />,
                },
                {
                  emoji: "📱",
                  pain: "You're the human relay between 3–7 providers who never talk to each other — texting updates, forwarding notes, making calls.",
                  solutionName: "Readily's Provider Log",
                  solution: "lets each provider share session notes directly with you — the parent. You see everything. Providers only see what you choose to share with them.",
                  color: C.indigo,
                  visual: <DigestMock />,
                },
                {
                  emoji: "💸",
                  pain: "You have no idea what you're actually spending on therapy until the end of the year — across deductibles, copays, and out-of-network.",
                  solutionName: "Readily's Cost Planner",
                  solution: "maps every therapy into one annual view. Know your numbers before you're blindsided.",
                  color: C.gold,
                  visual: <CostMock />,
                },
                {
                  emoji: "📋",
                  pain: "Session notes live in binders, email threads, or in providers' systems — never in one place where you can see the full picture.",
                  solutionName: "Readily's Weekly Digest",
                  solution: "pulls every session note into one readable summary for you, every week. One place, one picture.",
                  color: "#7c3aed",
                  visual: <DigestMock />,
                },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 80}>
                  <div style={{ borderRadius: 16, border: "1px solid #e8e4de", overflow: "hidden", background: C.white }}>
                    {/* Pain row */}
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "20px 24px", background: "#faf9f7", borderBottom: `1px solid #e8e4de` }}>
                      <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{item.emoji}</span>
                      <p style={{ margin: 0, fontSize: 15, color: C.ink2, fontFamily: "'Outfit',sans-serif", lineHeight: 1.6 }}>{item.pain}</p>
                    </div>
                    {/* Solution row */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 0, alignItems: "center" }}>
                      <div style={{ padding: "20px 24px", borderRight: "1px solid #e8e4de" }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", background: item.color+"18", border: `1.5px solid ${item.color}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                            <span style={{ fontSize: 11, color: item.color, fontWeight: 800 }}>✓</span>
                          </div>
                          <p style={{ margin: 0, fontSize: 14, color: C.ink2, fontFamily: "'Outfit',sans-serif", lineHeight: 1.65 }}>
                            <strong style={{ color: item.color, fontWeight: 800 }}>{item.solutionName}</strong>{" "}{item.solution}
                          </p>
                        </div>
                      </div>
                      <div style={{ padding: "16px 20px" }}>
                        <div style={{ transform: "scale(0.85)", transformOrigin: "top left", maxHeight: 200, overflow: "hidden", borderRadius: 10 }}>
                          {item.visual}
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS ────────────────────────────────────────────────────────── */}
        <section style={{ background: C.nav, padding: "80px 24px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 48 }}>
                <h2 style={{ fontSize: "clamp(22px,3vw,34px)", fontWeight: 900, color: "#fff", lineHeight: 1.3, letterSpacing: "-0.02em" }}>
                  The coordination burden is real.<br />
                  <span style={{ color: "#5eead4" }}>So is the relief when it's gone.</span>
                </h2>
              </div>
            </Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 32 }}>
              {[
                ["3–7", "providers the average ASD family coordinates between"],
                ["12 min", "to build a complete child profile that follows them everywhere"],
                ["0", "phone calls needed to share your child's history with a new provider"],
                ["1 place", "to see every session note, goal, and therapy cost"],
              ].map(([val, label], i) => (
                <Reveal key={i} delay={i * 80}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "clamp(32px,4vw,46px)", fontWeight: 900, color: "#5eead4", fontFamily: "'Outfit',sans-serif", lineHeight: 1, marginBottom: 8 }}>{val}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'Outfit',sans-serif", lineHeight: 1.5 }}>{label}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
        <section style={{ padding: "100px 24px", background: C.bg }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 52 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.teal, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>EARLY FEEDBACK</div>
                <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 900, color: C.ink, lineHeight: 1.2, letterSpacing: "-0.02em" }}>Parents and providers get it immediately.</h2>
              </div>
            </Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
              <Quote delay={0} color={C.teal} name="Priya M." role="Mom of a 6-year-old, ASD Level 2"
                text="I used to spend Sunday nights emailing four different providers to piece together how my son's week went. Now it just arrives. I cried the first time I saw the digest." />
              <Quote delay={100} color={C.indigo} name="David K." role="Dad and part-time caregiver"
                text="The child profile alone was worth it. I sent the link to his new school's resource teacher and she said she'd never had a parent share something so complete." />
              <Quote delay={200} color={C.gold} name="Sarah T." role="Speech Therapist, 8 years"
                text="I log sessions in under 2 minutes and the family sees my notes the same day. It's changed how connected I feel to the kids I work with — and to their families." />
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section style={{ padding: "100px 24px", background: C.white, borderTop: "1px solid #e8e4de" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 56 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.teal, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>HOW IT WORKS</div>
                <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 900, color: C.ink, lineHeight: 1.2, letterSpacing: "-0.02em" }}>Up and running in under 15 minutes.</h2>
              </div>
            </Reveal>
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {[
                ["🪪", "Build your child's profile", "Take less than 12 minutes to capture who your child is — what helps them, what's hard, how they communicate. You'll never have to explain it again."],
                ["🩺", "Invite your care team", "Add your providers by email. They get a simple link — no app download, no new login. They log sessions in 2 minutes."],
                ["📬", "Get your weekly digest", "Every Friday, Readily synthesizes the week across all providers into one warm, readable summary with patterns and home tips."],
                ["💰", "Track your costs", "Add your therapies once. See your full annual out-of-pocket picture updated in real time."],
              ].map(([icon, title, body], i) => (
                <Reveal key={i} delay={i * 80}>
                  <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                    <div style={{ width: 46, height: 46, borderRadius: 12, background: C.teal + "14", border: `1px solid ${C.teal}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
                    <div style={{ paddingTop: 2 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, marginBottom: 5 }}>{title}</div>
                      <div style={{ fontSize: 14, color: C.ink3, lineHeight: 1.65 }}>{body}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
        <section id="waitlist" style={{ padding: "100px 24px", background: `linear-gradient(160deg,${C.nav} 0%,#0f2942 60%,#163d5c 100%)`, position: "relative", overflow: "hidden" }}>
          {/* decorative circles */}
          <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle,${C.teal}18 0%,transparent 65%)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-15%", left: "-5%", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle,${C.indigo}18 0%,transparent 65%)`, pointerEvents: "none" }} />

          <div style={{ maxWidth: 580, margin: "0 auto", textAlign: "center", position: "relative" }}>
            <Reveal>
              <div style={{ fontSize: 44, marginBottom: 16 }}>⚡</div>
              <h2 style={{ fontSize: "clamp(28px,4.5vw,48px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 16, letterSpacing: "-0.03em" }}>
                Your child deserves a team<br />
                <span style={{ color: "#5eead4" }}>that actually works together.</span>
              </h2>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 40 }}>
                We're onboarding our first 50 beta families now — personally, one at a time. Join the waitlist and we'll set up your child's profile with you.
              </p>
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "28px 24px", backdropFilter: "blur(8px)" }}>
                <WaitlistForm dark size="large" />
              </div>
              <div style={{ marginTop: 24, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                Already have an account?{" "}
                <button onClick={onLogin} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontWeight: 600, fontSize: 12, cursor: "pointer", padding: 0 }}>Log in →</button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer style={{ background: C.nav, padding: "32px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: C.tealD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⚡</div>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Readily</span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 Readily · Built for families who deserve better.</div>
            <div style={{ display: "flex", gap: 20 }}>
              {["Privacy", "Terms", "Contact"].map(l => (
                <a key={l} href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", transition: "color 0.15s" }} onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.7)"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.3)"}>{l}</a>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
