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
    const { parentEmail, parentName, childName, providerName, providerRole, sessionDate, response, win, forFamily, appUrl } = await req.json();

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f5f2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px 40px;">

    <div style="text-align:center;padding:24px 0 16px;">
      <div style="display:inline-flex;align-items:center;gap:8px;">
        <div style="width:30px;height:30px;background:#0f766e;border-radius:7px;display:inline-block;line-height:30px;text-align:center;font-size:15px;">⚡</div>
        <span style="font-size:17px;font-weight:800;color:#0f0e0c;letter-spacing:-0.02em;">Readily</span>
      </div>
    </div>

    <div style="background:#ffffff;border-radius:16px;padding:32px 28px;border:1px solid #e8e4de;">

      <div style="display:inline-block;padding:4px 12px;background:#f0fdfa;border-radius:20px;margin-bottom:16px;">
        <span style="font-size:11px;font-weight:700;color:#0d9488;letter-spacing:0.06em;">NEW SESSION NOTE</span>
      </div>

      <h1 style="margin:0 0 8px;font-size:20px;font-weight:800;color:#0f0e0c;line-height:1.3;">
        ${providerName} logged a session with ${childName}
      </h1>
      <p style="margin:0 0 20px;font-size:13px;color:#6b6760;">
        ${providerRole} · ${sessionDate}
      </p>

      <div style="background:#f7f5f2;border-radius:10px;padding:16px 18px;margin-bottom:16px;">
        <div style="font-size:10px;font-weight:700;color:#6b6760;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">HOW ${childName.toUpperCase()} RESPONDED</div>
        <div style="font-size:15px;font-weight:700;color:#0f0e0c;">${response}</div>
      </div>

      ${win ? `
      <div style="background:#f0fdf4;border-radius:10px;padding:16px 18px;margin-bottom:16px;border-left:3px solid #059669;">
        <div style="font-size:10px;font-weight:700;color:#059669;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">🏆 WIN</div>
        <div style="font-size:14px;color:#14532d;line-height:1.6;">${win}</div>
      </div>` : ''}

      ${forFamily ? `
      <div style="background:#f0fdfa;border-radius:10px;padding:16px 18px;margin-bottom:20px;border-left:3px solid #0d9488;">
        <div style="font-size:10px;font-weight:700;color:#0d9488;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">🏠 FOR YOU TO TRY AT HOME</div>
        <div style="font-size:14px;color:#134e4a;line-height:1.6;">${forFamily}</div>
      </div>` : ''}

      <a href="${appUrl}" style="display:block;text-align:center;padding:13px 24px;background:linear-gradient(135deg,#0d9488,#0f766e);border-radius:10px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;margin-bottom:14px;">
        View full session in Readily →
      </a>

      <p style="margin:0;font-size:12px;color:#a8a49e;text-align:center;">
        You're receiving this because ${providerName} logged a session for ${childName} on Readily.
      </p>
    </div>

    <div style="text-align:center;padding:16px 0 0;">
      <p style="margin:0;font-size:11px;color:#a8a49e;">
        Readily by AblePam Inc. · <a href="https://readily.ablepam.ca" style="color:#0d9488;text-decoration:none;">readily.ablepam.ca</a>
      </p>
    </div>

  </div>
</body>
</html>`;

    const response_api = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Readily <contact@ablepam.ca>',
        to: [parentEmail],
        subject: `${providerName} just logged a session with ${childName}`,
        html,
      }),
    });

    const result = await response_api.json();
    if (!response_api.ok) {
      console.error('[Readily] Notify parent error:', result);
      return new Response(JSON.stringify({ error: result }), {
        status: response_api.status, headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Readily] Notify parent error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
