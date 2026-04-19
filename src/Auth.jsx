import { useState } from "react";
import { supabase } from "./supabase";

const FOREST  = "#0d2b1e";
const SAGE    = "#3a7d54";
const MINT    = "#6dbf8c";
const CREAM   = "#fdf6ec";
const WARM    = "#f5ede0";
const WARM2   = "#eddcc8";
const GOLD    = "#c8891e";
const INK     = "#1a120a";
const INK2    = "#3d2e1e";
const INK3    = "#7a6550";
const INK4    = "#b09a82";
const WHITE   = "#ffffff";
const ROSE    = "#e11d48";

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("parent");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const inp = {
    width: "100%", padding: "12px 14px", borderRadius: 10,
    border: `1.5px solid ${WARM2}`, fontFamily: "'DM Sans', sans-serif",
    fontSize: 14, color: INK, background: WHITE, boxSizing: "border-box",
    outline: "none",
  };

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name, role } }
        });

        if (signUpError) throw signUpError;

        if (data?.user) {
          if (role === "parent") {
            await supabase.from("families").insert({ id: data.user.id, email, name });
          } else {
            await supabase.from("providers").insert({ id: data.user.id, email, name, role: "Provider" });
          }
          setMessage("Account created! Check your email to confirm, then log in.");
          setMode("login");
        }
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;

        if (data?.user) {
          const { data: family } = await supabase.from("families").select("*").eq("id", data.user.id).maybeSingle();
	const { data: provider } = await supabase.from("providers").select("*").eq("id", data.user.id).maybeSingle();
          onAuth({ user: data.user, role: family ? "parent" : "provider", profile: family || provider });
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800;1,600&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${CREAM}; }
        input:focus { border-color: ${SAGE} !important; box-shadow: 0 0 0 3px ${SAGE}18 !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${FOREST} 0%, ${SAGE} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ position: "fixed", top: "10%", right: "5%", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${MINT}18 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "fixed", bottom: "10%", left: "5%", width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${GOLD}12 0%, transparent 70%)`, pointerEvents: "none" }} />

        <div style={{ width: "100%", maxWidth: 420, animation: "fadeUp 0.4s ease both" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${MINT}, ${SAGE})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 12px" }}>⚡</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: WHITE, fontFamily: "'Fraunces', serif", letterSpacing: "-0.02em" }}>Readily</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>{mode === "login" ? "Welcome back" : "Create your account"}</div>
          </div>

          <div style={{ background: WHITE, borderRadius: 20, padding: "28px 26px", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", background: WARM, borderRadius: 10, padding: 4, marginBottom: 22 }}>
              {[["login", "Log in"], ["signup", "Sign up"]].map(([id, lbl]) => (
                <button key={id} onClick={() => { setMode(id); setError(null); setMessage(null); }} style={{ flex: 1, padding: "8px", borderRadius: 7, border: "none", background: mode === id ? WHITE : "transparent", color: mode === id ? INK : INK3, fontFamily: "'DM Sans', sans-serif", fontWeight: mode === id ? 700 : 500, fontSize: 14, cursor: "pointer", transition: "all 0.15s" }}>{lbl}</button>
              ))}
            </div>

            {mode === "signup" && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: INK3, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>I am a</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[["parent", "👨‍👩‍👧 Parent / Caregiver"], ["provider", "🩺 Therapist / Teacher"]].map(([id, lbl]) => (
                    <button key={id} onClick={() => setRole(id)} style={{ flex: 1, padding: "10px 8px", borderRadius: 10, border: role === id ? `2px solid ${SAGE}` : `1.5px solid ${WARM2}`, background: role === id ? SAGE + "12" : WHITE, color: role === id ? SAGE : INK3, fontFamily: "'DM Sans', sans-serif", fontWeight: role === id ? 700 : 400, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}>{lbl}</button>
                  ))}
                </div>
              </div>
            )}

            {mode === "signup" && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: INK3, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Full name</label>
                <input style={inp} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: INK3, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Email</label>
              <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" onKeyDown={e => e.key === "Enter" && handleAuth()} />
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: INK3, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Password</label>
              <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === "signup" ? "Min 6 characters" : "Your password"} onKeyDown={e => e.key === "Enter" && handleAuth()} />
            </div>

            {error && <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: ROSE, fontFamily: "'DM Sans', sans-serif" }}>{error}</div>}
            {message && <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: SAGE, fontFamily: "'DM Sans', sans-serif" }}>{message}</div>}

            <button onClick={handleAuth} disabled={loading || !email || !password || (mode === "signup" && !name)} style={{ width: "100%", padding: "13px", background: loading || !email || !password ? WARM : `linear-gradient(135deg, ${SAGE}, ${FOREST})`, border: "none", borderRadius: 10, color: loading || !email || !password ? INK4 : WHITE, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, cursor: loading || !email || !password ? "not-allowed" : "pointer", boxShadow: email && password ? "0 4px 14px rgba(58,125,84,0.35)" : "none", transition: "all 0.2s" }}>
              {loading ? "Please wait…" : mode === "login" ? "Log in →" : "Create account →"}
            </button>

            {mode === "login" && (
              <div style={{ textAlign: "center", marginTop: 14 }}>
                <button onClick={async () => {
                  if (!email) { setError("Enter your email above first."); return; }
                  await supabase.auth.resetPasswordForEmail(email);
                  setMessage("Password reset email sent — check your inbox.");
                }} style={{ background: "none", border: "none", color: INK4, fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>
            Your data is private and secure. Families control all access.
          </div>
        </div>
      </div>
    </>
  );
}
