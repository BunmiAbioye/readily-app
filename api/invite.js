export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json' },
    });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return new Response(JSON.stringify({ error: 'Email service not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { providerEmail, providerRole, childName, familyName, inviteToken } = await req.json();

    const acceptUrl = `https://readily.ablepam.ca/invite/${inviteToken}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f7f5f2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px 40px;">

    <!-- Header -->
    <div style="text-align:center;padding:28px 0 20px;">
      <div style="display:inline-flex;align-items:center;gap:8px;">
        <div style="width:32px;height:32px;background:#0f766e;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-size:16px;">⚡</div>
        <span style="font-size:18px;font-weight:800;color:#0f0e0c;letter-spacing:-0.02em;">Readily</span>
      </div>
    </div>

    <!-- Card -->
    <div style="background:#ffffff;border-radius:16px;padding:36px 32px;border:1px solid #e8e4de;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

      <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0f0e0c;line-height:1.3;">
        You've been invited to ${childName}'s care team
      </h1>

      <p style="margin:0 0 20px;font-size:15px;color:#6b6760;line-height:1.65;">
        <strong style="color:#0f0e0c;">${familyName}</strong> has added you as <strong style="color:#0f0e0c;">${childName}'s ${providerRole}</strong> on Readily — a care coordination platform for families of children with special needs.
      </p>

      <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;padding:16px 18px;margin-bottom:24px;">
        <p style="margin:0;font-size:14px;color:#134e4a;line-height:1.65;">
          Once you accept, you'll be able to log session notes that go directly to ${childName}'s family weekly digest — helping them see their child's full picture in one place.
        </p>
      </div>

      <div style="margin-bottom:24px;">
        <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#6b6760;letter-spacing:0.05em;text-transform:uppercase;">What you'll be able to do:</p>
        ${[
          '📋 View ' + childName + "'s Care Passport before every session",
          '✏️ Log session notes in under 2 minutes',
          '📬 Have your notes reach the family automatically',
          '🔒 Access only ' + childName + "'s information — nothing else",
        ].map(item => `<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px;font-size:14px;color:#2d2b27;line-height:1.5;">${item}</div>`).join('')}
      </div>

      <!-- CTA -->
      <a href="${acceptUrl}" style="display:block;text-align:center;padding:14px 24px;background:linear-gradient(135deg,#0d9488,#0f766e);border-radius:10px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;margin-bottom:16px;">
        Accept invitation →
      </a>

      <p style="margin:0;font-size:12px;color:#a8a49e;text-align:center;line-height:1.6;">
        You'll be asked to create a free account or log in.<br>
        This invitation was sent to <strong>${providerEmail}</strong>.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:20px 0 0;">
      <p style="margin:0;font-size:11px;color:#a8a49e;line-height:1.6;">
        Readily by AblePam Inc. · Waterloo, Ontario, Canada<br>
        <a href="https://readily.ablepam.ca" style="color:#0d9488;text-decoration:none;">readily.ablepam.ca</a>
        · <a href="mailto:contact@ablepam.ca" style="color:#a8a49e;text-decoration:none;">contact@ablepam.ca</a>
      </p>
    </div>

  </div>
</body>
</html>`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Readily <hello@ablepam.ca>',
        to: [providerEmail],
        subject: `You've been invited to ${childName}'s care team on Readily`,
        html,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[Readily] Resend error:', result);
      return new Response(JSON.stringify({ error: result }), {
        status: response.status, headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Readily] Invite email error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
