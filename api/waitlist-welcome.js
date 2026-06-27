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
    const { email, role } = await req.json();
    const isProvider = role === 'provider';
    const signupUrl = 'https://readily.ablepam.ca?auth=signup';

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f5f2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px 40px;">

    <div style="text-align:center;padding:24px 0 16px;">
      <div style="display:inline-block;width:32px;height:32px;background:#0f766e;border-radius:8px;line-height:32px;text-align:center;font-size:16px;">⚡</div>
      <span style="font-size:17px;font-weight:800;color:#0f0e0c;letter-spacing:-0.02em;vertical-align:middle;margin-left:8px;">Readily</span>
    </div>

    <div style="background:#ffffff;border-radius:16px;padding:36px 32px;border:1px solid #e8e4de;">

      <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#0f0e0c;line-height:1.3;">
        Welcome to Readily ⚡
      </h1>

      <p style="margin:0 0 20px;font-size:15px;color:#6b6760;line-height:1.7;">
        ${isProvider
          ? 'Thanks for your interest in Readily. You\'re now on our list — and you can get started right away.'
          : 'Thanks for signing up. The good news: you don\'t have to wait. Readily is ready for you right now.'}
      </p>

      <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;padding:16px 18px;margin-bottom:24px;">
        <p style="margin:0;font-size:14px;color:#134e4a;line-height:1.65;">
          ${isProvider
            ? '🩺 Once a family invites you, you\'ll get a separate invitation email with a direct link to join their child\'s care team.'
            : '🪪 Build your child\'s Care Passport, invite their providers, and get your first AI weekly digest — all in under 15 minutes.'}
        </p>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <tr>
          <td align="center">
            <a href="${signupUrl}" style="display:inline-block;padding:14px 32px;background:#0d9488;border-radius:10px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;font-family:Arial,sans-serif;">
              Create your account &rarr;
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:12px;color:#a8a49e;text-align:center;line-height:1.6;">
        Free during beta. No credit card needed.<br>
        Already have an account? <a href="https://readily.ablepam.ca?auth=login" style="color:#0d9488;">Log in here</a>
      </p>

    </div>

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
        from: 'Readily <contact@ablepam.ca>',
        to: [email],
        subject: isProvider
          ? 'You\'re on the Readily list — here\'s what\'s next'
          : 'You\'re on the list — and you can start right now',
        html,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error('[Readily] Welcome email error:', result);
      return new Response(JSON.stringify({ error: result }), {
        status: response.status, headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Readily] Welcome email error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
