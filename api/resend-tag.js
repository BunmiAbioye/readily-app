export const config = { runtime: 'edge' };

// Called when a new user signs up OR when a child profile is created
// action: 'signup' | 'child_created'
export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json' },
    });
  }

  const resendKey = process.env.RESEND_API_KEY;

  if (!resendKey) {
    return new Response(JSON.stringify({ error: 'Resend not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { email, firstName, action } = await req.json();
    if (!email) return new Response(JSON.stringify({ error: 'Email required' }), { status: 400 });

    if (action === 'signup') {
      // Add new contact to Resend audience with has_child: false
      const res = await fetch('https://api.resend.com/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          first_name: firstName || '',
          unsubscribed: false,
          properties: {
            has_child: 'false',
            signup_date: new Date().toISOString().slice(0, 10),
          },
        }),
      });
      const data = await res.json();
      console.log('[Readily] Resend signup contact:', res.status, JSON.stringify(data));
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (action === 'child_created') {
      // Update existing contact — set has_child: true
      const res = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            has_child: 'true',
            child_created_at: new Date().toISOString(),
          },
        }),
      });
      const data = await res.json();
      console.log('[Readily] Resend child_created tag:', res.status, JSON.stringify(data));
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });

  } catch (e) {
    console.error('[Readily] Resend tag error:', e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
