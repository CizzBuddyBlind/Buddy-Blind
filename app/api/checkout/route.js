export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const premium = body.kind === "premium";
  const secret = process.env.STRIPE_SECRET_KEY;
  const price = premium ? process.env.STRIPE_PREMIUM_PRICE_ID : process.env.STRIPE_ADMIN_FEE_PRICE_ID;
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://buddy-blind.vercel.app";
  if (!secret || !price) {
    return Response.json({
      ok: false,
      demo: true,
      reason: "Stripe is not configured on the server, so the booking is recorded without a card charge.",
    });
  }
  const params = new URLSearchParams({
    mode: premium ? "subscription" : "payment",
    "line_items[0][price]": price,
    "line_items[0][quantity]": "1",
    success_url: `${base}/profile?paid=1`,
    cancel_url: `${base}/subscribe?pay=cancel`,
  });
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
      demo: true,
      reason: data.error?.message || "Stripe did not open a checkout.",
    });
  }
  return Response.json({ ok: true, url: data.url });
}
