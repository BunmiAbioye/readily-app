import { useState, useEffect, useRef } from "react";

// ── Design tokens ──────────────────────────────────────────────────────────
const FOREST  = "#0d2b1e";
const FOREST2 = "#163324";
const MOSS    = "#1e4d30";
const SAGE    = "#3a7d54";
const MINT    = "#6dbf8c";
const CREAM   = "#fdf6ec";
const WARM    = "#f5ede0";
const WARM2   = "#eddcc8";
const GOLD    = "#c8891e";
const GOLD_L  = "#f5c76a";
const INK     = "#1a120a";
const INK2    = "#3d2e1e";
const INK3    = "#7a6550";
const INK4    = "#b09a82";
const WHITE   = "#ffffff";
const ROSE    = "#c0392b";

// ── Scroll reveal hook ─────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0, y = 24 }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : `translateY(${y}px)`, transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

// ── Waitlist form ──────────────────────────────────────────────────────────
function WaitlistForm({ dark = false }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("parent");
  const [submitted, setSubmitted] = useState(false);

  const bg        = dark ? "rgba(255,255,255,0.08)" : WHITE;
  const border    = dark ? "rgba(255,255,255,0.15)" : WARM2;
  const textCol   = dark ? WHITE : INK;
  const placeholderNote = dark ? "rgba(255,255,255,0.4)" : INK4;

  if (submitted) return (
    <div style={{ padding: "20px 24px", background: dark ? "rgba(109,191,140,0.15)" : "#f0fdf4", borderRadius: 14, border: `1px solid ${dark ? MINT+"44" : "#86efac"}`, textAlign: "center" }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>🌱</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: dark ? MINT : SAGE, fontFamily: "'Fraunces', serif", marginBottom: 4 }}>You're on the list!</div>
      <div style={{ fontSize: 13, color: dark ? "rgba(255,255,255,0.6)" : INK3, fontFamily: "'Lato', sans-serif" }}>We'll be in touch soon. Thank you for being part of this.</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        {[["parent", "I'm a parent"], ["provider", "I'm a provider"], ["both", "I'm both"]].map(([val, lbl]) => (
          <button key={val} onClick={() => setRole(val)} style={{ padding: "7px 14px", borderRadius: 20, border: role === val ? `2px solid ${dark ? MINT : SAGE}` : `1.5px solid ${border}`, background: role === val ? (dark ? MINT + "22" : SAGE + "12") : "transparent", color: role === val ? (dark ? MINT : SAGE) : (dark ? "rgba(255,255,255,0.5)" : INK3), fontFamily: "'Lato', sans-serif", fontSize: 13, fontWeight: role === val ? 700 : 400, cursor: "pointer", transition: "all 0.15s" }}>{lbl}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          onKeyDown={e => e.key === "Enter" && email && setSubmitted(true)}
          style={{ flex: 1, padding: "12px 16px", background: bg, border: `1.5px solid ${border}`, borderRadius: 10, fontFamily: "'Lato', sans-serif", fontSize: 14, color: textCol, outline: "none" }}
        />
        <button onClick={() => email && setSubmitted(true)} style={{ padding: "12px 20px", background: `linear-gradient(135deg, ${GOLD}, ${SAGE})`, border: "none", borderRadius: 10, color: WHITE, fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(200,137,30,0.35)" }}>
          Join waitlist →
        </button>
      </div>
      <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,0.35)" : INK4, fontFamily: "'Lato', sans-serif", marginTop: 8 }}>No spam. No pressure. Just early access when we're ready.</div>
    </div>
  );
}

// ── Feature card ───────────────────────────────────────────────────────────
function FeatureCard({ icon, title, body, accent, delay }) {
  return (
    <Reveal delay={delay}>
      <div style={{ background: WHITE, borderRadius: 18, padding: "28px 26px", border: `1px solid ${WARM2}`, boxShadow: "0 2px 12px rgba(26,18,10,0.06)", height: "100%", transition: "transform 0.2s, box-shadow 0.2s" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 8px 32px rgba(26,18,10,0.1)`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(26,18,10,0.06)"; }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: accent + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>{icon}</div>
        <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 700, color: INK, fontFamily: "'Fraunces', serif", lineHeight: 1.3 }}>{title}</h3>
        <p style={{ margin: 0, fontSize: 14, color: INK3, fontFamily: "'Lato', sans-serif", lineHeight: 1.7 }}>{body}</p>
      </div>
    </Reveal>
  );
}

// ── Testimonial ────────────────────────────────────────────────────────────
function Testimonial({ quote, name, role, avatar, delay }) {
  return (
    <Reveal delay={delay}>
      <div style={{ background: WARM, borderRadius: 18, padding: "26px 24px", border: `1px solid ${WARM2}` }}>
        <div style={{ fontSize: 32, color: GOLD, fontFamily: "'Fraunces', serif", lineHeight: 1, marginBottom: 12, opacity: 0.6 }}>"</div>
        <p style={{ margin: "0 0 20px", fontSize: 15, color: INK2, fontFamily: "'Lato', sans-serif", lineHeight: 1.75, fontStyle: "italic" }}>{quote}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: avatar, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{name[0]}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: INK, fontFamily: "'Lato', sans-serif" }}>{name}</div>
            <div style={{ fontSize: 12, color: INK4, fontFamily: "'Lato', sans-serif" }}>{role}</div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

// ── How it works step ──────────────────────────────────────────────────────
function Step({ number, title, body, delay }) {
  return (
    <Reveal delay={delay}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${SAGE}, ${FOREST})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: WHITE, fontFamily: "'Fraunces', serif", flexShrink: 0 }}>{number}</div>
        <div style={{ paddingTop: 4 }}>
          <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700, color: INK, fontFamily: "'Fraunces', serif" }}>{title}</h3>
          <p style={{ margin: 0, fontSize: 14, color: INK3, fontFamily: "'Lato', sans-serif", lineHeight: 1.7 }}>{body}</p>
        </div>
      </div>
    </Reveal>
  );
}

// ── Stat ───────────────────────────────────────────────────────────────────
function Stat({ value, label, delay }) {
  return (
    <Reveal delay={delay}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 42, fontWeight: 800, color: MINT, fontFamily: "'Fraunces', serif", lineHeight: 1, marginBottom: 6 }}>{value}</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", fontFamily: "'Lato', sans-serif", lineHeight: 1.5, maxWidth: 160, margin: "0 auto" }}>{label}</div>
      </div>
    </Reveal>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function ReadilyLandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,400;1,9..144,600&family=Lato:wght@300;400;700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${CREAM}; color: ${INK}; }
        ::selection { background: ${MINT}; color: ${FOREST}; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: ${CREAM}; } ::-webkit-scrollbar-thumb { background: ${WARM2}; border-radius: 3px; }
        input:focus { outline: none; border-color: ${SAGE} !important; box-shadow: 0 0 0 3px ${SAGE}18 !important; }
        @keyframes heroFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(0.96)} }
        @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
      `}</style>

      <div style={{ fontFamily: "'Lato', sans-serif", overflowX: "hidden" }}>

        {/* ── NAV ── */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(253,246,236,0.92)" : "transparent", backdropFilter: scrolled ? "blur(12px)" : "none", borderBottom: scrolled ? `1px solid ${WARM2}` : "none", transition: "all 0.3s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${SAGE},${FOREST})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
            <span style={{ fontSize: 16, fontWeight: 800, color: INK, fontFamily: "'Fraunces', serif", letterSpacing: "-0.02em" }}>Readily</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              {["Features", "How it works", "For providers"].map(l => (
                <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} style={{ fontSize: 13, fontWeight: 700, color: INK3, textDecoration: "none", letterSpacing: "0.01em", transition: "color 0.15s" }}
                  onMouseEnter={e => e.target.style.color = SAGE}
                  onMouseLeave={e => e.target.style.color = INK3}>{l}</a>
              ))}
            </div>
            <a href="#waitlist" style={{ padding: "9px 18px", background: `linear-gradient(135deg,${SAGE},${FOREST})`, borderRadius: 8, color: WHITE, fontSize: 13, fontWeight: 700, textDecoration: "none", boxShadow: "0 2px 10px rgba(58,125,84,0.3)", transition: "transform 0.15s, box-shadow 0.15s" }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = "0 4px 16px rgba(58,125,84,0.4)"; }}
              onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "0 2px 10px rgba(58,125,84,0.3)"; }}>
              Get early access
            </a>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${FOREST} 0%, ${FOREST2} 50%, ${MOSS} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 32px 80px", position: "relative", overflow: "hidden" }}>

          {/* Background orbs */}
          <div style={{ position: "absolute", top: "15%", right: "8%", width: 380, height: 380, borderRadius: "50%", background: `radial-gradient(circle, ${MINT}18 0%, transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "10%", left: "5%", width: 260, height: 260, borderRadius: "50%", background: `radial-gradient(circle, ${GOLD}12 0%, transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "40%", left: "20%", width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${SAGE}14 0%, transparent 70%)`, pointerEvents: "none" }} />

          {/* Noise texture */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "200px", opacity: 0.4, pointerEvents: "none" }} />

          <div style={{ maxWidth: 900, width: "100%", textAlign: "center", position: "relative" }}>

            {/* Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", background: "rgba(109,191,140,0.12)", border: "1px solid rgba(109,191,140,0.25)", borderRadius: 30, marginBottom: 28, animation: "pulse 3s ease infinite" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: MINT, display: "inline-block" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: MINT, fontFamily: "'Lato', sans-serif", letterSpacing: "0.08em" }}>NOW ACCEPTING EARLY FAMILIES</span>
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: "clamp(38px, 7vw, 72px)", fontWeight: 800, color: WHITE, fontFamily: "'Fraunces', serif", lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: 24 }}>
              Your child's whole care team,<br />
              <span style={{ color: GOLD_L, fontStyle: "italic" }}>finally on the same page.</span>
            </h1>

            {/* Subheadline */}
            <p style={{ fontSize: "clamp(16px, 2.2vw, 20px)", color: "rgba(255,255,255,0.65)", fontFamily: "'Lato', sans-serif", lineHeight: 1.7, maxWidth: 620, margin: "0 auto 40px", fontWeight: 300 }}>
              Readily connects parents of children with ASD to their therapists, teachers, and care team — so nothing gets lost, nothing gets repeated, and families can breathe again.
            </p>

            {/* CTA */}
            <div style={{ maxWidth: 500, margin: "0 auto 48px" }}>
              <WaitlistForm dark />
            </div>

            {/* Social proof */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
              {["👩‍👧 Built with real ASD families", "🔒 Your data, your control", "✨ AI that actually helps"].map((t, i) => (
                <div key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontFamily: "'Lato', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>{t}</div>
              ))}
            </div>
          </div>
        </section>

        {/* ── THE PROBLEM ── */}
        <section style={{ background: CREAM, padding: "96px 32px" }}>
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 56 }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: SAGE, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'Lato', sans-serif", marginBottom: 12 }}>THE REALITY</div>
                <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: INK, fontFamily: "'Fraunces', serif", lineHeight: 1.15, marginBottom: 16 }}>Caring for a child with ASD<br />is a second full-time job.</h2>
                <p style={{ fontSize: 17, color: INK3, fontFamily: "'Lato', sans-serif", lineHeight: 1.75, maxWidth: 560, margin: "0 auto" }}>Most families juggle 3–7 providers who never talk to each other. The parent becomes the relay — repeating history at every appointment, chasing notes, translating between a speech therapist and a special ed teacher who've never met.</p>
              </div>
            </Reveal>

            {/* Pain points */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              {[
                { stat: "4.2 hrs", label: "Average hours per week parents spend on care coordination", icon: "⏱" },
                { stat: "6+",      label: "Providers the average ASD child sees — who rarely communicate", icon: "👥" },
                { stat: "73%",     label: "Of families say burnout is their #1 challenge — not the diagnosis", icon: "💔" },
                { stat: "0",       label: "Unified tools designed specifically for this problem. Until now.", icon: "🌱" },
              ].map((s, i) => (
                <Reveal key={i} delay={i * 80}>
                  <div style={{ background: WHITE, borderRadius: 16, padding: "22px 20px", border: `1px solid ${WARM2}`, textAlign: "center" }}>
                    <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: SAGE, fontFamily: "'Fraunces', serif", marginBottom: 6 }}>{s.stat}</div>
                    <div style={{ fontSize: 13, color: INK3, fontFamily: "'Lato', sans-serif", lineHeight: 1.5 }}>{s.label}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" style={{ background: WARM, padding: "96px 32px" }}>
          <div style={{ maxWidth: 1040, margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 56 }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: SAGE, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'Lato', sans-serif", marginBottom: 12 }}>WHAT CAREPASSPORT DOES</div>
                <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: INK, fontFamily: "'Fraunces', serif", lineHeight: 1.15 }}>One place that knows your child.<br />So everyone who cares for them can do their job better.</h2>
              </div>
            </Reveal>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              <FeatureCard delay={0}   icon="🪪" accent={SAGE}  title="Child Profile" body="Build a living profile of your child — what works, what doesn't, sensory needs, communication style. Share it instantly with any new provider. No more repeating yourself." />
              <FeatureCard delay={80}  icon="📬" accent={GOLD}  title="Weekly Digest" body="Every Friday, an AI-generated summary of your child's week arrives in your inbox — synthesised from all provider sessions. You didn't have to do a thing." />
              <FeatureCard delay={160} icon="📁" accent="#7c3aed" title="Docs & Goals Hub" body="Upload IEPs and ABA plans. Write your family goals in plain language. Get an AI progress report that cross-references all of it against what's actually happening." />
              <FeatureCard delay={0}   icon="💰" accent={ROSE}  title="Cost Planner" body="Therapy-by-therapy financial planning. See exactly what your insurance covers, what you're paying out of pocket, and what the year ahead will cost." />
              <FeatureCard delay={80}  icon="🩺" accent="#0891b2" title="Provider Portal" body="Therapists and teachers log sessions in under 2 minutes. Their notes flow directly to the family digest — no emails, no calls, no coordination overhead." />
              <FeatureCard delay={160} icon="💬" accent={MINT}  title="Ask Anything" body="A chat assistant that knows your child's entire file. Ask about progress, get home strategies, or find out what a therapist said last Tuesday — instantly." />
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" style={{ background: CREAM, padding: "96px 32px" }}>
          <div style={{ maxWidth: 820, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            <div>
              <Reveal>
                <div style={{ fontSize: 11, fontWeight: 900, color: SAGE, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'Lato', sans-serif", marginBottom: 12 }}>HOW IT WORKS</div>
                <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, color: INK, fontFamily: "'Fraunces', serif", lineHeight: 1.2, marginBottom: 40 }}>Set it up once.<br />It runs quietly after that.</h2>
              </Reveal>
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <Step number="1" delay={0}   title="Build your child's Passport" body="A guided 12-minute setup. Your child's profile, care team, and preferences — all in one place. You own it." />
                <Step number="2" delay={100} title="Invite your care team" body="Send a link to your therapists and teachers. They log sessions in under 2 minutes — no new accounts, no friction." />
                <Step number="3" delay={200} title="Let it run" body="Weekly digests arrive automatically. Progress reports generate on demand. The AI answers questions anytime. You just live your life." />
              </div>
            </div>

            {/* Visual card stack */}
            <Reveal delay={200}>
              <div style={{ position: "relative", height: 380 }}>
                {/* Cards stacked */}
                <div style={{ position: "absolute", top: 40, left: 20, right: 0, background: WHITE, borderRadius: 18, padding: "20px 22px", border: `1px solid ${WARM2}`, boxShadow: "0 2px 16px rgba(26,18,10,0.08)", transform: "rotate(-3deg)" }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: SAGE, letterSpacing: "0.1em", fontFamily: "'Lato', sans-serif", marginBottom: 8 }}>WEEKLY DIGEST · APR 11</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: INK, fontFamily: "'Fraunces', serif", marginBottom: 6 }}>A breakthrough week for Maya 🌟</div>
                  <div style={{ fontSize: 12, color: INK3, fontFamily: "'Lato', sans-serif", lineHeight: 1.6 }}>3 providers logged this week. Speech therapy showed remarkable progress with unprompted 3-word phrases...</div>
                </div>
                <div style={{ position: "absolute", top: 20, left: 0, right: 20, background: WHITE, borderRadius: 18, padding: "20px 22px", border: `1px solid ${WARM2}`, boxShadow: "0 4px 24px rgba(26,18,10,0.1)", transform: "rotate(1.5deg)" }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#7c3aed", letterSpacing: "0.1em", fontFamily: "'Lato', sans-serif", marginBottom: 8 }}>AI PROGRESS REPORT</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: INK, fontFamily: "'Fraunces', serif", marginBottom: 12 }}>IEP Goal #2: Making Progress ↗</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {[["On Track", "#16a34a", "#dcfce7"], ["Making Progress", "#0891b2", "#ccfbf1"], ["Needs Attention", "#d97706", "#fef3c7"]].map(([lbl, c, bg]) => (
                      <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", background: bg, borderRadius: 6 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: c, fontFamily: "'Lato', sans-serif" }}>{lbl}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Floating chat bubble */}
                <div style={{ position: "absolute", bottom: 0, right: 0, background: `linear-gradient(135deg,${SAGE},${FOREST})`, borderRadius: "16px 16px 4px 16px", padding: "12px 16px", maxWidth: 200, boxShadow: "0 4px 20px rgba(58,125,84,0.3)", animation: "heroFloat 4s ease infinite" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", fontFamily: "'Lato', sans-serif", marginBottom: 4 }}>💬 Ask anything</div>
                  <div style={{ fontSize: 13, color: WHITE, fontFamily: "'Lato', sans-serif", lineHeight: 1.5, fontStyle: "italic" }}>"What did her ABA therapist say about transitions this week?"</div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── STATS ── */}
        <section style={{ background: `linear-gradient(135deg, ${FOREST} 0%, ${MOSS} 100%)`, padding: "80px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E\")", pointerEvents: "none" }} />
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 52 }}>
                <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, color: WHITE, fontFamily: "'Fraunces', serif", lineHeight: 1.2 }}>What families get back<br /><span style={{ color: GOLD_L, fontStyle: "italic" }}>when the coordination is handled.</span></h2>
              </div>
            </Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32 }}>
              <Stat delay={0}   value="4+ hrs" label="saved per week on coordination tasks" />
              <Stat delay={100} value="~12 min" label="to build a complete child profile" />
              <Stat delay={200} value="2 min"   label="for a provider to log a full session" />
              <Stat delay={300} value="0"       label="additional tasks added to the parent's day" />
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section style={{ background: CREAM, padding: "96px 32px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 52 }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: SAGE, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'Lato', sans-serif", marginBottom: 12 }}>FROM FAMILIES LIKE YOURS</div>
                <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, color: INK, fontFamily: "'Fraunces', serif", lineHeight: 1.2 }}>Real words from real parents.</h2>
              </div>
            </Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              <Testimonial delay={0} avatar="#d1fae5" name="Priya M." role="Mom of a 6-year-old with ASD Level 2" quote="I used to spend my Sunday nights emailing four different providers to piece together how my son's week went. Now it just arrives. I cried the first time I saw the digest." />
              <Testimonial delay={100} avatar="#e0e7ff" name="David K." role="Dad and part-time caregiver" quote="The child profile alone was worth it. I sent the link to his new school's resource teacher and she said she'd never had a parent share something so complete." />
              <Testimonial delay={200} avatar="#fef3c7" name="Sarah T." role="Speech Therapist, 8 years" quote="I log sessions in under 2 minutes now. The family sees my notes the same day. It's changed how connected I feel to the kids I work with — and to their families." />
            </div>
          </div>
        </section>

        {/* ── FOR PROVIDERS ── */}
        <section id="for-providers" style={{ background: WARM, padding: "96px 32px" }}>
          <div style={{ maxWidth: 820, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
            <Reveal>
              <div>
                <div style={{ fontSize: 11, fontWeight: 900, color: SAGE, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'Lato', sans-serif", marginBottom: 12 }}>FOR PROVIDERS</div>
                <h2 style={{ fontSize: "clamp(24px, 3.2vw, 36px)", fontWeight: 800, color: INK, fontFamily: "'Fraunces', serif", lineHeight: 1.2, marginBottom: 16 }}>Your work finally reaches the people who need it most.</h2>
                <p style={{ fontSize: 15, color: INK3, fontFamily: "'Lato', sans-serif", lineHeight: 1.75, marginBottom: 28 }}>Therapists and teachers spend hours on communication overhead. Readily makes it effortless — log a session in 2 minutes, and your insights go directly to the family digest and the whole care team.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {["No new app to learn — link-based access", "Session log takes under 2 minutes", "See the child's full Passport before every session", "Your notes reach the family automatically", "Permissions controlled by the family"].map((t, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: SAGE + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 10, color: SAGE }}>✓</span>
                      </div>
                      <span style={{ fontSize: 14, color: INK2, fontFamily: "'Lato', sans-serif" }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div style={{ background: "#0c1a2e", borderRadius: 20, padding: "24px", boxShadow: "0 8px 32px rgba(12,26,46,0.2)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#38bdf8", fontFamily: "'Lato', sans-serif", letterSpacing: "0.12em", marginBottom: 12 }}>PROVIDER SESSION LOG</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  {["Expressive language", "Pragmatics", "Transitions"].map(t => <span key={t} style={{ padding: "4px 10px", borderRadius: 20, background: "rgba(56,189,248,0.15)", color: "#38bdf8", fontSize: 11, fontWeight: 600, fontFamily: "'Lato', sans-serif" }}>{t}</span>)}
                </div>
                <div style={{ background: "#1e2535", borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#4ade80", fontFamily: "'Lato', sans-serif", marginBottom: 5 }}>WIN TODAY</div>
                  <div style={{ fontSize: 13, color: "#a8bdd0", fontFamily: "'Lato', sans-serif", lineHeight: 1.5 }}>Maya used 'I want' unprompted twice during play — a big first.</div>
                </div>
                <div style={{ background: "#1e2535", borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#38bdf8", fontFamily: "'Lato', sans-serif", marginBottom: 5 }}>NOTE FOR FAMILY</div>
                  <div style={{ fontSize: 13, color: "#a8bdd0", fontFamily: "'Lato', sans-serif", lineHeight: 1.5 }}>Try asking 'what do you want?' before meals — she's ready.</div>
                </div>
                <div style={{ background: `linear-gradient(135deg, #0ea5e9, #0284c7)`, borderRadius: 10, padding: "10px", textAlign: "center", fontSize: 13, fontWeight: 700, color: WHITE, fontFamily: "'Lato', sans-serif" }}>✓ Session logged · Family notified</div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── WAITLIST CTA ── */}
        <section id="waitlist" style={{ background: `linear-gradient(160deg, ${FOREST} 0%, ${MOSS} 60%, ${SAGE} 100%)`, padding: "100px 32px", position: "relative", overflow: "hidden", textAlign: "center" }}>
          <div style={{ position: "absolute", top: "20%", right: "10%", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${MINT}14 0%, transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "15%", left: "8%", width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${GOLD}10 0%, transparent 70%)`, pointerEvents: "none" }} />

          <div style={{ maxWidth: 580, margin: "0 auto", position: "relative" }}>
            <Reveal>
              <div style={{ fontSize: 44, marginBottom: 16 }}>🌱</div>
              <h2 style={{ fontSize: "clamp(28px, 4.5vw, 48px)", fontWeight: 800, color: WHITE, fontFamily: "'Fraunces', serif", lineHeight: 1.1, marginBottom: 16 }}>
                Your child deserves a team<br /><span style={{ color: GOLD_L, fontStyle: "italic" }}>that actually works together.</span>
              </h2>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", fontFamily: "'Lato', sans-serif", lineHeight: 1.7, marginBottom: 36 }}>
                We're onboarding our first families now. Join the waitlist and we'll reach out personally to set up your child's Passport.
              </p>
              <WaitlistForm dark />
            </Reveal>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background: FOREST, padding: "40px 32px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg,${SAGE},${FOREST2})`, border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
              <span style={{ fontSize: 14, fontWeight: 800, color: WHITE, fontFamily: "'Fraunces', serif" }}>Readily</span>
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              {["Privacy", "Terms", "Contact"].map(l => <a key={l} href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none", fontFamily: "'Lato', sans-serif", transition: "color 0.15s" }} onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.7)"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.35)"}>{l}</a>)}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'Lato', sans-serif" }}>© 2026 Readily. Made with care.</div>
          </div>
        </footer>

      </div>
    </>
  );
}
