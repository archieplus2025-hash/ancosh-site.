// Tiny GitHub login helper for the /admin editor. Deploy as a Cloudflare Worker (free).
// Secrets to set on the Worker: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET.
// GitHub OAuth app callback URL: https://<your-worker-address>/callback
const SCOPE = "repo"; // use "public_repo" if the site repository is public

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/auth") {
      const q = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        scope: SCOPE,
        redirect_uri: url.origin + "/callback",
        state: crypto.randomUUID(),
      });
      return Response.redirect("https://github.com/login/oauth/authorize?" + q, 302);
    }
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      const r = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code }),
      });
      const d = await r.json();
      const ok = !!d.access_token;
      const msg = ok
        ? "authorization:github:success:" + JSON.stringify({ token: d.access_token, provider: "github" })
        : "authorization:github:error:" + JSON.stringify(d);
      const page = `<!doctype html><script>
(function(){var m=${JSON.stringify(msg)};
window.addEventListener("message",function(e){window.opener.postMessage(m,e.origin);window.close();},false);
window.opener.postMessage("authorizing:github","*");})();
</script>`;
      return new Response(page, { headers: { "Content-Type": "text/html" } });
    }
    return new Response("Login helper", { status: 200 });
  },
};
