export const config = { runtime: 'edge' };

// Called on signup and when child profile is created
// action: 'signup' | 'child_created'
export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json' },
    });
  }

  const brevoKey = process.env.BREVO_API_KEY;
  if (!brevoKey) {
    return new Response(JSON.stringify({ error: 'Brevo not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { email, firstName, action } = await req.json();
    if (!email) return new Response(JSON.stringify({ error: 'Email required' }), { status: 400 });

    if (action === 'signup') {
      // Create or update contact in Brevo with has_child = false
      const res = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'api-key': brevoKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          attributes: {
            FIRSTNAME: firstName || '',
            HAS_CHILD: false,
            SIGNUP_DATE: new Date().toISOString().slice(0, 10),
          },
          listIds: [5],
          updateEnabled: true,
        }),
      });
      let data = {};
      try { data = await res.json(); } catch(_) {}
      console.log('[Readily] Brevo signup contact:', res.status, JSON.stringify(data));
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'child_created') {
      // Update contact - set HAS_CHILD = true
      const res = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: {
          'api-key': brevoKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attributes: {
            HAS_CHILD: true,
            CHILD_CREATED_AT: new Date().toISOString().slice(0, 10),
          },
        }),
      });
      let data = {};
      try { data = res.status === 204 ? {} : await res.json(); } catch(_) {}
      console.log('[Readily] Brevo child_created:', res.status, JSON.stringify(data));
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });

  } catch (e) {
    console.error('[Readily] Brevo error:', e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
