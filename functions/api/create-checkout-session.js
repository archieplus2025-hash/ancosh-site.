// Cloudflare Pages Function: POST /api/create-checkout-session
// Creates a Stripe Checkout Session for a donation and returns {url}. Set these in
// Cloudflare Pages > Settings > Environment variables (use "Secret" for the key):
//   STRIPE_SECRET_KEY  the Council's Stripe secret key (sk_test_... first, sk_live_... at launch)
//   SITE_URL           optional, e.g. https://example.org (defaults to the page's own address)
// The site only ever sends amounts and names here. Card and bank details are entered on Stripe's page.

const ORG = "Afghanistan National Council of Sunni Hazaras";
const METHODS = { card: "card", us_bank_account: "us_bank_account" };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_SECRET_KEY) return json({ error: "Stripe is not configured." }, 500);

  let p;
  try { p = await request.json(); } catch { return json({ error: "Bad request." }, 400); }

  const amount = Number(p.amount);
  if (!(amount >= 1 && amount <= 10000)) return json({ error: "Invalid amount." }, 400);
  const monthly = p.frequency === "monthly";
  const method = METHODS[p.method] || "card";
  const email = typeof p.email === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email) ? p.email : "";
  const campaign = String(p.campaign || "general").slice(0, 60);
  const total = p.coverFees ? Math.round(amount * 103) : Math.round(amount * 100); // cents

  const origin = env.SITE_URL || request.headers.get("Origin") || new URL(request.url).origin;
  const form = new URLSearchParams();
  form.set("mode", monthly ? "subscription" : "payment");
  form.set("submit_type", "donate");
  form.set("success_url", origin + "/donate.html?status=success");
  form.set("cancel_url", origin + "/donate.html?status=cancel");
  form.set("line_items[0][quantity]", "1");
  form.set("line_items[0][price_data][currency]", "usd");
  form.set("line_items[0][price_data][unit_amount]", String(total));
  form.set("line_items[0][price_data][product_data][name]", `${monthly ? "Monthly gift" : "Gift"} to ${ORG}`);
  if (monthly) form.set("line_items[0][price_data][recurring][interval]", "month");
  form.set("allowed_payment_method_types[0]", method);
  if (email) form.set("customer_email", email);
  form.set("metadata[campaign]", campaign);
  form.set("metadata[donor_name]", String(p.name || "").slice(0, 100));
  form.set("metadata[covers_fees]", p.coverFees ? "yes" : "no");

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: "Bearer " + env.STRIPE_SECRET_KEY, "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const data = await res.json();
  if (!res.ok || !data.url) return json({ error: "Could not start checkout." }, 502);
  return json({ url: data.url });
}
