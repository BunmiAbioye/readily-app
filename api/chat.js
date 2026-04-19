export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.VITE_ANTHROPIC_KEY || process.env.ANTHROPIC_KEY;

  if (!apiKey) {
    console.error("[Readily] ANTHROPIC_KEY not set in environment");
    return res.status(500).json({ error: { type: "config_error", message: "API key not configured" } });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    // Forward the status and response
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("[Readily] Proxy error:", error);
    return res.status(500).json({ error: { type: "proxy_error", message: error.message } });
  }
}
