import { useState, useEffect } from "react";

const C = {
  bg:      "#f7f5f2",
  white:   "#ffffff",
  ink:     "#0f0e0c",
  ink2:    "#2d2b27",
  ink3:    "#6b6760",
  ink4:    "#a8a49e",
  border:  "#e8e4de",
  teal:    "#0d9488",
  tealD:   "#0f766e",
  tealL:   "#f0fdfa",
  nav:     "#0c1a2e",
};

const LAST_UPDATED = "April 19, 2026";
const COMPANY = "AblePam Inc.";
const PRODUCT = "Readily";
const EMAIL = "contact@ablepam.ca";
const ADDRESS = "Waterloo, Ontario, Canada";
const SITE = "readily.ablepam.ca";

// ─── SECTION COMPONENT ────────────────────────────────────────
function Section({ number, title, children }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: C.teal, fontFamily: "'Outfit',sans-serif", letterSpacing: "0.08em", flexShrink: 0 }}>{number}</span>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.ink, fontFamily: "'Outfit',sans-serif", lineHeight: 1.3 }}>{title}</h2>
      </div>
      <div style={{ paddingLeft: 28 }}>
        {children}
      </div>
    </div>
  );
}

function P({ children }) {
  return <p style={{ margin: "0 0 12px", fontSize: 14, color: C.ink3, fontFamily: "'Outfit',sans-serif", lineHeight: 1.75 }}>{children}</p>;
}

function UL({ items }) {
  return (
    <ul style={{ margin: "0 0 12px", paddingLeft: 18 }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: 14, color: C.ink3, fontFamily: "'Outfit',sans-serif", lineHeight: 1.75, marginBottom: 4 }}>{item}</li>
      ))}
    </ul>
  );
}

function Highlight({ children }) {
  return (
    <div style={{ background: C.tealL, border: `1px solid ${C.teal}30`, borderLeft: `3px solid ${C.teal}`, borderRadius: "0 8px 8px 0", padding: "12px 16px", marginBottom: 16 }}>
      <p style={{ margin: 0, fontSize: 13, color: C.tealD, fontFamily: "'Outfit',sans-serif", lineHeight: 1.65, fontWeight: 500 }}>{children}</p>
    </div>
  );
}

// ─── PRIVACY POLICY ───────────────────────────────────────────
function PrivacyPolicy() {
  return (
    <div>
      <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: `1px solid ${C.border}` }}>
        <h1 style={{ margin: "0 0 8px", fontSize: "clamp(24px,3vw,32px)", fontWeight: 900, color: C.ink, fontFamily: "'Outfit',sans-serif", letterSpacing: "-0.02em" }}>Privacy Policy</h1>
        <p style={{ margin: 0, fontSize: 13, color: C.ink4, fontFamily: "'Outfit',sans-serif" }}>Last updated: {LAST_UPDATED} · Effective immediately upon account creation</p>
      </div>

      <Highlight>
        {PRODUCT} is a care coordination platform operated by {COMPANY}. We handle Personal Health Information (PHI) about children with special needs. We take that responsibility seriously. This policy explains exactly what we collect, why, and how we protect it — in plain language.
      </Highlight>

      <Section number="01" title="Who We Are">
        <P>{PRODUCT} is operated by {COMPANY}, a corporation incorporated in Ontario, Canada, with its principal place of business in {ADDRESS}.</P>
        <P>{COMPANY} is the data controller for all personal information collected through the {PRODUCT} platform. For privacy inquiries, contact us at <strong>{EMAIL}</strong>.</P>
        <P>This Privacy Policy governs the collection, use, storage, and disclosure of personal information and Personal Health Information (PHI) collected through {PRODUCT}, accessible at {SITE}.</P>
      </Section>

      <Section number="02" title="Applicable Privacy Laws">
        <P>We comply with the following privacy legislation:</P>
        <UL items={[
          "Personal Health Information Protection Act, 2004 (PHIPA) — Ontario, Canada",
          "Personal Information Protection and Electronic Documents Act (PIPEDA) — Federal Canada",
          "We are designed to be compatible with GDPR principles for users in the European Union",
          "We acknowledge U.S. HIPAA considerations for future users in the United States",
        ]} />
        <P>If you are located outside Ontario, additional or different privacy protections may apply. Contact us at {EMAIL} with any jurisdiction-specific questions.</P>
      </Section>

      <Section number="03" title="What Information We Collect">
        <P><strong style={{ color: C.ink }}>Account information:</strong> When you create an account, we collect your name, email address, and password (encrypted). For families, we also collect the family name.</P>
        <P><strong style={{ color: C.ink }}>Child profile information (PHI):</strong> Information you voluntarily enter about your child, including name, age, diagnosis, school, motivators, calming strategies, communication style, sensory profile, triggers, and any notes you choose to add. This constitutes Personal Health Information under PHIPA.</P>
        <P><strong style={{ color: C.ink }}>Session notes (PHI):</strong> Notes logged by providers or parents about therapy sessions and home activities, including session responses, wins, challenges, and family notes.</P>
        <P><strong style={{ color: C.ink }}>Care team information:</strong> Email addresses of providers you invite to your child's care team, and their access levels.</P>
        <P><strong style={{ color: C.ink }}>Financial information:</strong> Therapy cost information you enter into the Cost Planner. We do not collect or process payment card information — this is self-reported data only.</P>
        <P><strong style={{ color: C.ink }}>Goals and documents:</strong> Family goals and document metadata you upload or create within the platform.</P>
        <P><strong style={{ color: C.ink }}>Usage data:</strong> Basic technical data including browser type, device type, and pages visited, collected to improve platform performance. We do not sell or share this data.</P>
      </Section>

      <Section number="04" title="How We Use Your Information">
        <P>We use your information only for the following purposes:</P>
        <UL items={[
          "To provide the Readily care coordination platform and its features",
          "To generate AI-powered weekly digests and progress summaries using your child's session data",
          "To enable the AI chat assistant to answer questions about your child's care file",
          "To facilitate secure communication between you and your invited care team",
          "To send account-related emails (confirmation, password reset)",
          "To improve the platform based on aggregated, anonymized usage patterns",
        ]} />
        <P>We do not use your personal information or PHI for advertising, profiling, or sale to third parties under any circumstances.</P>
      </Section>

      <Section number="05" title="AI Features and Your Data">
        <Highlight>
          Readily uses AI to generate weekly digests, progress reports, and power the chat assistant. When you use these features, relevant information from your child's profile and session notes is sent to Anthropic (the AI provider) to generate the response. Anthropic processes this data under their API terms and does not use API data to train their models.
        </Highlight>
        <P>AI-generated content is provided for informational and organizational purposes only. It does not constitute medical advice, clinical assessment, or therapeutic recommendation. Always consult qualified healthcare professionals for clinical decisions.</P>
        <P>You can choose not to use AI features — the Care Passport, Cost Planner, and session logging features work independently without AI.</P>
      </Section>

      <Section number="06" title="Data Storage and Location">
        <P>All personal information and PHI collected through {PRODUCT} is stored on servers located in <strong style={{ color: C.ink }}>Canada (Montreal, Quebec — AWS ca-central-1 region)</strong>, operated by Supabase Inc. under their data processing agreements.</P>
        <P>AI processing uses Anthropic's API infrastructure. When AI features are used, relevant data is transmitted to Anthropic's servers, which may be located in the United States. This transmission occurs only when you actively use an AI feature (digest, progress report, or chat).</P>
        <P>We have taken reasonable steps to ensure that data processors we use provide equivalent privacy protections to those required under PHIPA and PIPEDA.</P>
      </Section>

      <Section number="07" title="Who Can See Your Child's Information">
        <P>Access to your child's information is strictly controlled:</P>
        <UL items={[
          "Only you (the family account holder) can see your child's full profile, all session notes, goals, and costs",
          "Providers you explicitly invite can only see what their access level permits — you set this when you invite them",
          "Providers cannot see each other's session notes, identities, or any information about other providers on your child's team",
          "AblePam Inc. staff may access data only when required to provide technical support, and only with your knowledge",
          "We will never share your child's PHI with any third party without your explicit consent, except as required by law",
        ]} />
      </Section>

      <Section number="08" title="Provider Responsibilities">
        <P>Providers (therapists, teachers, and other care team members) who access {PRODUCT} through a family's invitation are acting as agents of the family for the purposes of that child's care. Providers are responsible for:</P>
        <UL items={[
          "Complying with applicable privacy legislation in their own jurisdiction and profession",
          "Using the information accessible on Readily only for the care of the specific child they have been invited to support",
          "Not downloading, copying, or sharing any PHI accessed through the platform beyond what is required for direct care",
          "Notifying the family if they become aware of any unauthorized access to the child's information",
        ]} />
      </Section>

      <Section number="09" title="Data Retention">
        <P>We retain your personal information and PHI for as long as your account is active. If you delete your account, we will delete all associated data within 30 days, except where retention is required by law.</P>
        <P>You can request deletion of your account and all associated data at any time by emailing {EMAIL} with the subject line "Account Deletion Request".</P>
      </Section>

      <Section number="10" title="Your Rights">
        <P>Under PHIPA and PIPEDA, you have the right to:</P>
        <UL items={[
          "Access the personal information and PHI we hold about you and your child",
          "Correct any inaccurate information",
          "Request deletion of your account and all associated data",
          "Withdraw consent to the collection or use of your information (note: this may prevent us from providing the service)",
          "File a complaint with the Information and Privacy Commissioner of Ontario (IPC) if you believe your privacy rights have been violated",
        ]} />
        <P>To exercise any of these rights, contact us at {EMAIL}. We will respond within 30 days.</P>
      </Section>

      <Section number="11" title="Data Breaches">
        <P>In the event of a privacy breach that creates a real risk of significant harm, {COMPANY} will:</P>
        <UL items={[
          "Notify affected individuals as soon as reasonably possible",
          "Notify the Information and Privacy Commissioner of Ontario as required by PHIPA",
          "Take immediate steps to contain the breach and prevent recurrence",
          "Maintain a record of all breaches as required by law",
        ]} />
        <P>To report a suspected privacy breach, contact us immediately at {EMAIL}.</P>
      </Section>

      <Section number="12" title="Cookies and Tracking">
        <P>{PRODUCT} uses only essential cookies required for authentication and session management. We do not use advertising cookies, third-party tracking, or analytics that identify individual users. We do not display advertisements.</P>
      </Section>

      <Section number="13" title="Children's Privacy">
        <P>{PRODUCT} is designed for use by parents and caregivers on behalf of their children. We do not knowingly collect information directly from children. All account creation and data entry is performed by adults. The PHI entered about children is done so by their parent or legal guardian, who consents on the child's behalf.</P>
      </Section>

      <Section number="14" title="Changes to This Policy">
        <P>We may update this Privacy Policy from time to time. We will notify you of material changes by email to the address on your account at least 14 days before the changes take effect. Continued use of {PRODUCT} after the effective date constitutes acceptance of the updated policy.</P>
      </Section>

      <Section number="15" title="Contact Us">
        <P>For any privacy questions, concerns, or requests:</P>
        <div style={{ background: C.bg, borderRadius: 10, padding: "16px 20px", border: `1px solid ${C.border}` }}>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: C.ink, fontFamily: "'Outfit',sans-serif" }}>{COMPANY}</p>
          <p style={{ margin: "0 0 4px", fontSize: 13, color: C.ink3, fontFamily: "'Outfit',sans-serif" }}>{ADDRESS}</p>
          <p style={{ margin: "0 0 4px", fontSize: 13, color: C.ink3, fontFamily: "'Outfit',sans-serif" }}>{EMAIL}</p>
          <p style={{ margin: 0, fontSize: 13, color: C.ink3, fontFamily: "'Outfit',sans-serif" }}>{SITE}</p>
        </div>
        <P style={{ marginTop: 12 }}>If you are not satisfied with our response, you may contact the <strong style={{ color: C.ink }}>Information and Privacy Commissioner of Ontario</strong> at www.ipc.on.ca.</P>
      </Section>
    </div>
  );
}

// ─── TERMS OF SERVICE ─────────────────────────────────────────
function TermsOfService() {
  return (
    <div>
      <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: `1px solid ${C.border}` }}>
        <h1 style={{ margin: "0 0 8px", fontSize: "clamp(24px,3vw,32px)", fontWeight: 900, color: C.ink, fontFamily: "'Outfit',sans-serif", letterSpacing: "-0.02em" }}>Terms of Service</h1>
        <p style={{ margin: 0, fontSize: 13, color: C.ink4, fontFamily: "'Outfit',sans-serif" }}>Last updated: {LAST_UPDATED} · By creating an account, you agree to these terms</p>
      </div>

      <Highlight>
        Please read these terms carefully. {PRODUCT} is a care coordination tool — not a medical platform. It does not provide clinical advice, diagnosis, or treatment. These terms govern your use of the platform and establish the responsibilities of both AblePam Inc. and you as a user.
      </Highlight>

      <Section number="01" title="Acceptance of Terms">
        <P>By creating an account on {PRODUCT} ({SITE}), you agree to be bound by these Terms of Service and our Privacy Policy. These terms form a legal agreement between you and {COMPANY}.</P>
        <P>If you are creating an account on behalf of a family, you confirm that you are the parent or legal guardian of the child whose information will be entered, and that you have the authority to consent to these terms on behalf of your family.</P>
        <P>If you do not agree to these terms, do not create an account or use the platform.</P>
      </Section>

      <Section number="02" title="What Readily Is — and Is Not">
        <P>{PRODUCT} is a <strong style={{ color: C.ink }}>care coordination and information management platform</strong>. It is designed to help families organize information about their child's care, share that information with their care team, and gain a clearer picture of their child's progress and costs.</P>
        <P>{PRODUCT} is <strong style={{ color: C.ink }}>not</strong>:</P>
        <UL items={[
          "A medical device, electronic health record (EHR), or clinical system",
          "A substitute for professional medical, therapeutic, psychological, or educational advice",
          "A platform for clinical documentation that satisfies regulatory requirements for healthcare providers",
          "A crisis service — if you or your child are in crisis, contact emergency services or a qualified mental health professional",
        ]} />
        <P>AI-generated content on {PRODUCT} (weekly digests, progress reports, chat responses) is for informational and organizational purposes only and does not constitute clinical advice. Always consult qualified professionals for clinical decisions.</P>
      </Section>

      <Section number="03" title="Account Registration">
        <P>You must provide accurate, complete information when creating your account. You are responsible for maintaining the confidentiality of your password and for all activity that occurs under your account.</P>
        <P>You must notify us immediately at {EMAIL} if you suspect unauthorized access to your account.</P>
        <P>You may not create an account on behalf of another person without their knowledge, or create accounts for the purpose of harassment, data harvesting, or any other unauthorized purpose.</P>
        <P>You must be at least 18 years of age to create an account.</P>
      </Section>

      <Section number="04" title="Family Accounts">
        <P>Family accounts are intended for parents and legal guardians of children with special needs. By creating a family account, you confirm that:</P>
        <UL items={[
          "You are the parent or legal guardian of the child whose information you are entering",
          "You have the legal authority to share that child's personal health information with the care team members you invite",
          "The information you enter is accurate to the best of your knowledge",
          "You will promptly update any information that becomes inaccurate",
        ]} />
      </Section>

      <Section number="05" title="Provider Access">
        <P>Providers (therapists, teachers, and other care team members) may be invited by families to access a child's profile. By accepting an invitation and using {PRODUCT}, providers agree that:</P>
        <UL items={[
          "They will use the platform only for the direct care of the child they have been invited to support",
          "They will not access, copy, or share any information beyond what is required for that child's care",
          "They remain responsible for their own compliance with applicable professional and privacy regulations",
          "Readily does not satisfy their own regulatory documentation requirements — it is a supplementary coordination tool only",
          "They will cease using the platform immediately if the family withdraws their invitation",
        ]} />
      </Section>

      <Section number="06" title="Acceptable Use">
        <P>You agree not to use {PRODUCT} to:</P>
        <UL items={[
          "Enter false, misleading, or fabricated information about any child or provider",
          "Harass, intimidate, or harm any other user",
          "Attempt to access any account or data that does not belong to you",
          "Reverse engineer, copy, or replicate any part of the platform",
          "Use the platform for any commercial purpose other than direct care coordination",
          "Upload malicious code, viruses, or any content designed to disrupt the platform",
          "Violate any applicable law or regulation",
        ]} />
        <P>{COMPANY} reserves the right to suspend or terminate accounts that violate these terms without notice.</P>
      </Section>

      <Section number="07" title="Intellectual Property">
        <P>The {PRODUCT} platform, including its design, code, AI features, and branding, is owned by {COMPANY} and protected by applicable intellectual property laws.</P>
        <P>You retain ownership of all information you enter into the platform. By entering information, you grant {COMPANY} a limited license to store and process that information solely for the purpose of providing the service to you.</P>
        <P>You may not reproduce, distribute, or create derivative works based on the {PRODUCT} platform without our written permission.</P>
      </Section>

      <Section number="08" title="Limitation of Liability">
        <Highlight>
          To the maximum extent permitted by applicable law, AblePam Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of Readily, including but not limited to damages arising from reliance on AI-generated content, data loss, or unauthorized access to your account.
        </Highlight>
        <P>Our total liability to you for any claim arising from your use of {PRODUCT} shall not exceed the amount you paid to {COMPANY} in the 12 months preceding the claim. During the free beta period, our total liability shall not exceed CAD $100.</P>
        <P>Nothing in these terms limits our liability for death or personal injury caused by our negligence, fraud, or any liability that cannot be excluded by law.</P>
      </Section>

      <Section number="09" title="Disclaimers">
        <P>{PRODUCT} is provided "as is" and "as available." We make no warranties, express or implied, regarding the platform's fitness for any particular purpose, uninterrupted availability, or freedom from errors.</P>
        <P>We do not warrant the accuracy, completeness, or usefulness of any AI-generated content. AI features are provided as organizational aids only.</P>
        <P>We are not responsible for the conduct of providers who access the platform through family invitations. Families are responsible for determining which providers they invite and what access levels they grant.</P>
      </Section>

      <Section number="10" title="Service Availability and Changes">
        <P>{COMPANY} reserves the right to modify, suspend, or discontinue {PRODUCT} at any time with reasonable notice. We will provide at least 30 days notice before discontinuing the service entirely, during which time you will be able to export your data.</P>
        <P>We may update these Terms of Service from time to time. Material changes will be communicated by email at least 14 days before taking effect. Continued use of the platform after the effective date constitutes acceptance.</P>
      </Section>

      <Section number="11" title="Beta Period">
        <P>{PRODUCT} is currently in beta. During this period:</P>
        <UL items={[
          "The service is provided free of charge",
          "Features may change, be added, or be removed without notice",
          "We appreciate your feedback and may contact you to understand your experience",
          "We will provide reasonable notice before introducing paid plans, and existing beta users will be offered a transition period",
        ]} />
      </Section>

      <Section number="12" title="Governing Law">
        <P>These Terms of Service are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein, without regard to conflict of law principles.</P>
        <P>Any disputes arising from these terms or your use of {PRODUCT} shall be resolved in the courts of Ontario, Canada, unless otherwise required by applicable consumer protection law in your jurisdiction.</P>
      </Section>

      <Section number="13" title="Contact">
        <P>For questions about these Terms of Service:</P>
        <div style={{ background: C.bg, borderRadius: 10, padding: "16px 20px", border: `1px solid ${C.border}` }}>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: C.ink, fontFamily: "'Outfit',sans-serif" }}>{COMPANY}</p>
          <p style={{ margin: "0 0 4px", fontSize: 13, color: C.ink3, fontFamily: "'Outfit',sans-serif" }}>{ADDRESS}</p>
          <p style={{ margin: 0, fontSize: 13, color: C.ink3, fontFamily: "'Outfit',sans-serif" }}>{EMAIL}</p>
        </div>
      </Section>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function LegalPage({ onBack }) {
  const [tab, setTab] = useState("privacy");

  // Read tab from URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#terms") setTab("terms");
    else if (hash === "#privacy") setTab("privacy");
  }, []);

  // Update hash when tab changes
  const switchTab = (t) => {
    setTab(t);
    window.history.replaceState(null, "", `#${t}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; font-family: 'Outfit', sans-serif; -webkit-font-smoothing: antialiased; }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.bg }}>

        {/* Nav */}
        <nav style={{ background: C.nav, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#0f766e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Readily</span>
          </div>
          <button
            onClick={onBack || (() => window.history.back())}
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 14px", color: "rgba(255,255,255,0.7)", fontFamily: "'Outfit',sans-serif", fontSize: 13, cursor: "pointer" }}>
            ← Back
          </button>
        </nav>

        {/* Tab switcher */}
        <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 24px", position: "sticky", top: 56, zIndex: 99 }}>
          <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", gap: 0 }}>
            {[["privacy", "Privacy Policy"], ["terms", "Terms of Service"]].map(([id, label]) => (
              <button
                key={id}
                onClick={() => switchTab(id)}
                style={{ padding: "14px 20px", background: "none", border: "none", borderBottom: tab === id ? `2px solid ${C.teal}` : "2px solid transparent", color: tab === id ? C.teal : C.ink3, fontFamily: "'Outfit',sans-serif", fontWeight: tab === id ? 700 : 500, fontSize: 14, cursor: "pointer", transition: "all 0.15s", marginBottom: -1 }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 80px" }}>
          {tab === "privacy" ? <PrivacyPolicy /> : <TermsOfService />}
        </div>

        {/* Footer */}
        <div style={{ background: C.nav, padding: "24px", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'Outfit',sans-serif" }}>
            © 2026 {COMPANY} · {ADDRESS} · {EMAIL}
          </p>
        </div>

      </div>
    </>
  );
}
