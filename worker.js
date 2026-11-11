export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Shrtfly / LiteShort Style API Endpoint
    // Format: /api?api=YOUR_KEY&url=YOUR_LONG_URL
    if (url.pathname === "/api") {
      const apiKey = url.searchParams.get("api");
      const targetUrl = url.searchParams.get("url");

      if (!apiKey) {
        return new Response(JSON.stringify({
          status: "error",
          message: "Invalid or missing API token"
        }), { status: 401, headers: { "Content-Type": "application/json" } });
      }

      if (!targetUrl) {
        return new Response(JSON.stringify({
          status: "error",
          message: "Missing target URL parameter"
        }), { status: 400, headers: { "Content-Type": "application/json" } });
      }

      // Generate 6-character random slug
      const slug = Math.random().toString(36).substring(2, 8);

      // Save to KV: slug -> original target URL & uploader API key
      await env.LINKS_KV.put(slug, JSON.stringify({
        url: targetUrl,
        uploader: apiKey,
        time: Date.now()
      }), { expirationTtl: 86400 * 30 }); // 30 days active

      // Return exact Shrtfly/LiteShort style JSON response
      return new Response(JSON.stringify({
        status: "success",
        shortenedUrl: `https://primegate.pages.dev/step1.html?code=${slug}&u=${apiKey}`
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // Default fallback
    return new Response("PrimeGate Core API Active", { status: 200 });
  }
};
