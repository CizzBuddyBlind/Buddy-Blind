import { priceFor, annualDiscount } from "@/lib/market";
import { loadSharedContent } from "@/lib/supabase";

function marketCode(request, body) {
  const asked = String(body?.market || "").toUpperCase();
  if (asked === "HK" || asked === "NZ" || asked === "AU") return asked;
  const geo = String(request?.headers?.get?.("x-vercel-ip-country") || "").toUpperCase();
  if (geo === "NZ" || geo === "AU") return geo;
  return "HK";
}

function baseUrl(request) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  if (host && !host.includes("localhost")) {
    const proto = request.headers.get("x-forwarded-proto") || "https";
    return `${proto}://${host.split(",")[0].trim()}`;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || "https://buddyblind.com";
}

async function stripe(secret, path, { method = "GET", params } = {}) {
  const res = await fetch(`https://api.stripe.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secret}`,
      ...(params ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: params ? params.toString() : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

function idOf(value) {
  if (!value) return "";
  return typeof value === "string" ? value : value.id || "";
}

async function findCustomer(secret, { email, customerId }) {
  if (customerId) {
    const { ok, data } = await stripe(secret, `/v1/customers/${encodeURIComponent(customerId)}`);
    if (ok && !data.deleted) return data;
  }
  if (!email || !email.includes("@")) return null;
  const found = await stripe(secret, `/v1/customers?email=${encodeURIComponent(email)}&limit=1`);
  return found.data?.data?.[0] || null;
}

async function savedDiscount() {
  try {
    const loaded = await loadSharedContent();
    return annualDiscount(loaded?.content?.billing?.annualDiscount);
  } catch {
    return 10;
  }
}

async function yearlyPriceId(secret, monthlyPriceId) {
  const price = await stripe(secret, `/v1/prices/${encodeURIComponent(monthlyPriceId)}`);
  if (!price.ok || !price.data?.unit_amount) {
    return { ok: false, reason: price.data?.error?.message || "The Premium price is not set in Stripe." };
  }
  const discount = await savedDiscount();
  const amount = Math.round(price.data.unit_amount * 12 * (100 - discount) / 100);
  const product = idOf(price.data.product);
  const currency = price.data.currency || "hkd";
  const listed = await stripe(secret, `/v1/prices?product=${encodeURIComponent(product)}&active=true&limit=100`);
  const found = (listed.data?.data || []).find((item) => item.currency === currency && item.unit_amount === amount && item.recurring?.interval === "year");
  if (found?.id) return { ok: true, id: found.id };
  const params = new URLSearchParams({
    product,
    currency,
    unit_amount: String(amount),
    "recurring[interval]": "year",
    nickname: `Premium yearly ${discount}% off`,
  });
  const created = await stripe(secret, "/v1/prices", { method: "POST", params });
  if (!created.ok || !created.data?.id) {
    return { ok: false, reason: created.data?.error?.message || "Could not open the yearly payment." };
  }
  return { ok: true, id: created.data.id };
}

function cycleOf(body, kind) {
  return kind === "premium" && body?.cycle === "year" ? "year" : "month";
}

async function savedCard(secret, customer) {
  const onFile = idOf(customer.invoice_settings?.default_payment_method);
  if (onFile) return onFile;
  const listed = await stripe(secret, `/v1/customers/${customer.id}/payment_methods?type=card&limit=1`);
  return idOf(listed.data?.data?.[0]);
}

async function chargeSavedCard(secret, body, request) {
  const customer = await findCustomer(secret, body);
  if (!customer) return Response.json({ ok: false, reason: "No card yet. Start Premium and save one." });
  const method = await savedCard(secret, customer);
  if (!method) return Response.json({ ok: false, reason: "No card yet. Start Premium and save one." });
  const priceId = priceFor(marketCode(request, body), "fee");
  const price = await stripe(secret, `/v1/prices/${encodeURIComponent(priceId)}`);
  if (!price.ok || !price.data?.unit_amount) {
    return Response.json({ ok: false, reason: price.data?.error?.message || "The admin fee is not set in Stripe." });
  }
  const params = new URLSearchParams({
    amount: String(price.data.unit_amount),
    currency: price.data.currency || "hkd",
    customer: customer.id,
    payment_method: method,
    off_session: "true",
    confirm: "true",
    description: "Buddy Blind admin fee",
    "metadata[kind]": "fee",
  });
  const charged = await stripe(secret, "/v1/payment_intents", { method: "POST", params });
  if (!charged.ok) {
    return Response.json({ ok: false, reason: charged.data.error?.message || "The card was not charged." });
  }
  if (charged.data.status !== "succeeded") {
    return Response.json({ ok: false, reason: "The bank did not take the admin fee. Check the card on Premium." });
  }
  return Response.json({ ok: true, id: charged.data.id });
}

async function liveSub(secret, { email, subscriptionId }) {
  if (subscriptionId) {
    const { ok, data } = await stripe(secret, `/v1/subscriptions/${encodeURIComponent(subscriptionId)}`);
    if (ok && !["canceled", "incomplete_expired"].includes(data.status)) return data;
  }
  if (!email || !email.includes("@")) return null;
  const found = await stripe(secret, `/v1/customers?email=${encodeURIComponent(email)}&limit=1`);
  const customer = found.data?.data?.[0];
  if (!customer) return null;
  const subs = await stripe(secret, `/v1/subscriptions?customer=${customer.id}&status=all&limit=10`);
  return (subs.data?.data || []).find((item) => ["active", "trialing", "past_due"].includes(item.status)) || null;
}

async function switchPlan(secret, body, request) {
  const kind = body.kind === "lite" || body.kind === "premium" || body.kind === "free" ? body.kind : "";
  if (!kind) return Response.json({ ok: false, reason: "Pick a plan." });
  const sub = await liveSub(secret, body);
  if (!sub) return Response.json({ ok: true, needsCheckout: kind !== "free", kind });
  if (kind === "free") {
    const cancelled = await stripe(secret, `/v1/subscriptions/${sub.id}`, { method: "DELETE" });
    if (!cancelled.ok) {
      return Response.json({ ok: false, reason: cancelled.data.error?.message || "Could not stop the plan." });
    }
    return Response.json({ ok: true, kind: "free", subscriptionId: "", customerId: idOf(sub.customer) });
  }
  const item = sub.items?.data?.[0];
  if (!item) return Response.json({ ok: false, reason: "No subscription to change." });
  let priceId = priceFor(marketCode(request, body), kind);
  if (cycleOf(body, kind) === "year") {
    const yearly = await yearlyPriceId(secret, priceId);
    if (!yearly.ok) return Response.json({ ok: false, reason: yearly.reason });
    priceId = yearly.id;
  }
  const params = new URLSearchParams({
    "items[0][id]": item.id,
    "items[0][price]": priceId,
    proration_behavior: "create_prorations",
    "metadata[kind]": kind,
    "metadata[cycle]": cycleOf(body, kind),
  });
  const updated = await stripe(secret, `/v1/subscriptions/${sub.id}`, { method: "POST", params });
  if (!updated.ok) {
    return Response.json({ ok: false, reason: updated.data.error?.message || "Could not change the plan." });
  }
  return Response.json({
    ok: true,
    kind,
    subscriptionId: updated.data.id,
    customerId: idOf(updated.data.customer),
  });
}

export async function GET(request) {
  const id = new URL(request.url).searchParams.get("session_id");
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret || !id) {
    return Response.json({ ok: false, reason: "Checkout could not be confirmed." });
  }
  const { ok, data } = await stripe(secret, `/v1/checkout/sessions/${encodeURIComponent(id)}`);
  if (!ok) {
    return Response.json({ ok: false, reason: data.error?.message || "Stripe did not confirm this checkout." });
  }
  const kind = data.metadata?.kind || "";
  const done = data.status === "complete" || data.payment_status === "paid";
  if (kind === "fee") {
    return Response.json({ ok: done, kind: "fee", status: data.status });
  }
  const plan = kind === "lite" || kind === "premium" ? kind : "";
  return Response.json({
    ok: done && !!plan,
    kind: plan,
    status: data.status,
    subscriptionId: idOf(data.subscription),
    customerId: idOf(data.customer),
  });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return Response.json({ ok: false, reason: "Card checkout is not ready yet." });
  if (body.action === "charge-fee") return chargeSavedCard(secret, body, request);
  if (body.action === "switch") return switchPlan(secret, body, request);

  const kind = body.kind === "lite" || body.kind === "premium" || body.kind === "fee" ? body.kind : "fee";
  const cycle = cycleOf(body, kind);
  let price = priceFor(marketCode(request, body), kind);
  if (cycle === "year") {
    const yearly = await yearlyPriceId(secret, price);
    if (!yearly.ok) return Response.json({ ok: false, reason: yearly.reason });
    price = yearly.id;
  }
  const base = baseUrl(request);
  if (!price) return Response.json({ ok: false, reason: "Card checkout is not ready yet." });

  const embedded = true;
  const next = typeof body.next === "string" && body.next.startsWith("/") && !body.next.startsWith("//") ? body.next : "/subscribe";
  const params = new URLSearchParams({
    mode: kind === "fee" ? "payment" : "subscription",
    ui_mode: "embedded_page",
    redirect_on_completion: "if_required",
    return_url: `${base}${kind === "fee" ? "/" : next}?session_id={CHECKOUT_SESSION_ID}`,
    "line_items[0][price]": price,
    "line_items[0][quantity]": "1",
    "metadata[kind]": kind,
    "metadata[cycle]": cycle,
  });
  if (kind !== "fee") {
    params.set("subscription_data[metadata][kind]", kind);
    params.set("subscription_data[metadata][cycle]", cycle);
    if (kind === "premium") params.set("subscription_data[trial_period_days]", "90");
  }
  if (typeof body.email === "string" && body.email.includes("@")) params.set("customer_email", body.email);

  const { ok, data } = await stripe(secret, "/v1/checkout/sessions", { method: "POST", params });
  if (!ok) {
    return Response.json({ ok: false, reason: data.error?.message || "Stripe did not open a checkout." });
  }
  if (embedded) {
    if (!data.client_secret) {
      return Response.json({ ok: false, reason: "Stripe did not open a checkout." });
    }
    return Response.json({
      ok: true,
      clientSecret: data.client_secret,
      sessionId: data.id,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
    });
  }
  if (!data.url) return Response.json({ ok: false, reason: "Stripe did not open a checkout." });
  return Response.json({ ok: true, url: data.url });
}
