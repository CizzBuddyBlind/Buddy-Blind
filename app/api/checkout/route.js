const PRICES = {
  lite: process.env.STRIPE_LITE_PRICE_ID || "price_1UISXEPmyR3fIMKF3EMKbkND",
  premium: process.env.STRIPE_PREMIUM_PRICE_ID || "price_1UISXdPmyR3fIMKFkyKCHbsB",
  fee: process.env.STRIPE_ADMIN_FEE_PRICE_ID || "price_1UISZsPmyR3fIMKFcpj7cNdy",
};

function baseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || "https://buddy-blind.vercel.app";
}

export async function GET(request) {
  const id = new URL(request.url).searchParams.get("session_id");
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret || !id) {
    return Response.json({ ok: false, reason: "Checkout could not be confirmed." });
  }
  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) {
    return Response.json({ ok: false, reason: data.error?.message || "Stripe did not confirm this checkout." });
  }
  const kind = data.metadata?.kind === "lite" || data.metadata?.kind === "premium" ? data.metadata.kind : "";
  const done = data.status === "complete";
  return Response.json({ ok: done && !!kind, kind, status: data.status });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const kind = body.kind === "lite" || body.kind === "premium" ? body.kind : "fee";
  const secret = process.env.STRIPE_SECRET_KEY;
  const price = PRICES[kind];
  const base = baseUrl();
  if (!secret || !price) {
    return Response.json({
      ok: false,
      reason: "Card checkout is not ready yet.",
    });
  }
  const params = new URLSearchParams({
    mode: kind === "fee" ? "payment" : "subscription",
    "line_items[0][price]": price,
    "line_items[0][quantity]": "1",
    success_url: kind === "fee" ? `${base}/profile?paid=1` : `${base}/subscribe?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/subscribe?pay=cancel`,
    "metadata[kind]": kind,
  });
  if (kind !== "fee") params.set("subscription_data[metadata][kind]", kind);
  if (kind === "premium") params.set("subscription_data[trial_period_days]", "90");
  if (typeof body.email === "string" && body.email.includes("@")) params.set("customer_email", body.email);
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const data = await res.json();
  if (!res.ok || !data.url) {
    return Response.json({
      ok: false,
      reason: data.error?.message || "Stripe did not open a checkout.",
    });
  }
  return Response.json({ ok: true, url: data.url });
}
