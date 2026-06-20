export const config = { runtime: 'edge' };

export default async function handler(req, ctx) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anthropicKey = process.env.ANTHROPIC_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const appUrl = 'https://readily.ablepam.ca';

  if (!supabaseUrl || !supabaseKey || !anthropicKey || !resendKey) {
    return new Response(JSON.stringify({ error: 'Missing env vars' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  const headers = {
    'Content-Type': 'application/json',
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
  };

  // Use waitUntil to process after response is sent
  const processAll = async () => {
    try {
      const familiesRes = await fetch(
        `${supabaseUrl}/rest/v1/families?select=id,email,name&digest_enabled=eq.true`,
        { headers }
      );
      const families = await familiesRes.json();
      console.log('[Readily] Processing', families.length, 'families');

      for (const family of families) {
        try {
          const childRes = await fetch(
            `${supabaseUrl}/rest/v1/children?family_id=eq.${family.id}&limit=1`,
            { headers }
          );
          const children = await childRes.json();
          if (!children?.length) continue;
          const child = children[0];

          const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
          const sessionsRes = await fetch(
            `${supabaseUrl}/rest/v1/sessions?child_id=eq.${child.id}&date=gte.${since}&order=date.desc`,
            { headers }
          );
          const sessions = await sessionsRes.json();

          const lines = sessions.map((s, i) =>
            `Session ${i+1}: Response: ${s.response}. Win: "${s.win||'—'}" Challenge: "${s.challenge||'—'}" For family: "${s.for_family||'—'}"`
          ).join('\n');

          const prompt = `Write a warm weekly digest for parents of ${child.name}, age ${child.age||'unknown'}, ${child.diagnosis||'special needs'}.\n\nSESSIONS:\n${lines||'No sessions this week.'}\n\nRespond ONLY with JSON (no markdown):\n{"headline":"warm specific headline","narrative":"2-3 warm sentences","bigWin":"best moment 1 sentence","pattern":"cross-provider pattern 1-2 sentences","forHome":["up to 2 home tips"],"lookAhead":"1 optimistic sentence"}`;

          const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': anthropicKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-6',
              max_tokens: 500,
              messages: [{ role: 'user', content: prompt }],
            }),
          });

          const aiData = await aiRes.json();
          if (!aiRes.ok) { console.error('[Readily] AI error:', JSON.stringify(aiData)); continue; }

          const raw = aiData.content?.[0]?.text || '';
          if (!raw) { console.error('[Readily] Empty AI response'); continue; }

          let digest;
          try { digest = JSON.parse(raw.trim()); }
          catch { console.error('[Readily] JSON parse error:', raw.slice(0,100)); continue; }

          if (!digest.headline) { console.error('[Readily] Missing headline'); continue; }

          const week = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f5f2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:560px;margin:40px auto;padding:0 20px 40px;">
  <div style="text-align:center;padding:24px 0 16px;">
    <div style="display:inline-block;width:30px;height:30px;background:#0f766e;border-radius:7px;line-height:30px;text-align:center;font-size:15px;">⚡</div>
    <span style="font-size:16px;font-weight:800;color:#0f0e0c;letter-spacing:-0.02em;vertical-align:middle;margin-left:8px;">Readily</span>
  </div>
  <div style="background:#fff;border-radius:16px;padding:32px 28px;border:1px solid #e8e4de;">
    <div style="font-size:10px;font-weight:700;color:#0d9488;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">WEEKLY DIGEST · ${week}</div>
    <h1 style="margin:0 0 14px;font-size:22px;font-weight:800;color:#0f0e0c;line-height:1.3;">${digest.headline}</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#6b6760;line-height:1.7;">${digest.narrative}</p>
    ${digest.bigWin ? `<div style="background:#f0fdf4;border-left:3px solid #059669;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:14px;"><div style="font-size:10px;font-weight:700;color:#059669;letter-spacing:0.08em;margin-bottom:4px;">🏆 BIG WIN</div><div style="font-size:14px;color:#14532d;line-height:1.6;">${digest.bigWin}</div></div>` : ''}
    ${digest.pattern ? `<div style="background:#f0f9ff;border-left:3px solid #0284c7;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:14px;"><div style="font-size:10px;font-weight:700;color:#0284c7;letter-spacing:0.08em;margin-bottom:4px;">🔍 PATTERN</div><div style="font-size:14px;color:#0c4a6e;line-height:1.6;">${digest.pattern}</div></div>` : ''}
    ${digest.forHome?.length ? `<div style="background:#faf5ff;border-left:3px solid #7c3aed;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:14px;"><div style="font-size:10px;font-weight:700;color:#7c3aed;letter-spacing:0.08em;margin-bottom:8px;">🏠 TRY AT HOME</div>${digest.forHome.map(tip=>`<div style="font-size:13px;color:#4c1d95;line-height:1.6;margin-bottom:4px;">• ${tip}</div>`).join('')}</div>` : ''}
    ${digest.lookAhead ? `<div style="background:#f7f5f2;border-radius:8px;padding:12px 16px;margin-bottom:20px;"><div style="font-size:10px;font-weight:700;color:#6b6760;letter-spacing:0.08em;margin-bottom:4px;">🌅 LOOKING AHEAD</div><div style="font-size:13px;color:#2d2b27;line-height:1.6;">${digest.lookAhead}</div></div>` : ''}
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <a href="${appUrl}" style="display:inline-block;padding:12px 28px;background:#0d9488;border-radius:10px;color:#fff;font-size:14px;font-weight:700;text-decoration:none;">Open Readily →</a>
    </td></tr></table>
  </div>
  <div style="text-align:center;padding:16px 0 0;">
    <p style="margin:0;font-size:11px;color:#a8a49e;line-height:1.6;">Readily by AblePam Inc. · <a href="${appUrl}" style="color:#0d9488;text-decoration:none;">readily.ablepam.ca</a></p>
  </div>
</div></body></html>`;

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'Readily <contact@ablepam.ca>',
              to: [family.email],
              subject: `${child.name}'s Weekly Digest — ${week}`,
              html,
            }),
          });

          console.log('[Readily] Digest sent to', family.email);
        } catch(e) {
          console.error(`[Readily] Error for family ${family.id}:`, e.message);
        }
      }
      console.log('[Readily] Digest cron complete');
    } catch(e) {
      console.error('[Readily] Cron error:', e.message);
    }
  };

  // Use waitUntil if available (Vercel edge), otherwise just run
  if (ctx?.waitUntil) {
    ctx.waitUntil(processAll());
  } else {
    processAll();
  }

  return new Response(JSON.stringify({ status: 'processing' }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
}
