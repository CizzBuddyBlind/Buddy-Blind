import { effectiveAccess } from "@/lib/entitlement";
import { logBilling, readEntitlement, saveEntitlement } from "@/lib/billingStore";
import { priceFor, annualDiscount } from "@/lib/market";
import { cancelAtPeriodEnd, loadSubscription, resumeSubscription, schedulePrice, stripeId } from "@/lib/stripeBilling";
import { loadSharedContent } from "@/lib/supabase";

async function yearlyPriceId(secret, monthlyPriceId) {
  const price = await fetch(`https://api.stripe.com/v1/prices/${encodeURIComponent(monthlyPriceId)}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });
  const data = await price.json();
  if (!price.ok || !data.unit_amount) return { ok: false, reason: data.error?.message || "The Premium price is not set in Stripe." };
  let discount = 10;
  try {
    const loaded = await loadSharedContent();
    discount = annualDiscount(loaded?.content?.billing?.annualDiscount);
  } catch { /* default */ }
  const amount = Math.round(data.unit_amount * 12 * (100 - discount) / 100);
  const product = stripeId(data.product);
  const listed = await fetch(`https://api.stripe.com/v1/prices?product=${encodeURIComponent(product)}&active=true&limit=100`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });
  const list = await listed.json();
  const found = (list.data || []).find((item) => item.currency === data.currency && item.unit_amount === amount && item.recurring?.interval === "year");
  if (found?.id) return { ok: true, id: found.id };
  const params = new URLSearchParams({
    product,
    currency: data.currency,
    unit_amount: String(amount),
    "recurring[interval]": "year",
    nickname: `Premium yearly ${discount}% off`,
  });
  const created = await fetch("https://api.stripe.com/v1/prices", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const made = await created.json();
  if (!created.ok || !made.id) return { ok: false, reason: made.error?.message || "Could not open the yearly payment." };
  return { ok: true, id: made.id };
}

function intervalOf(subscription) {
  return subscription?.items?.data?.[0]?.price?.recurring?.interval || (subscription?.metadata?.cycle === "year" ? "year" : "month");
}

export async function GET(request) {
  const email = new URL(request.url).searchParams.get("email")?.trim().toLowerCase() || "";
  const role = new URL(request.url).searchParams.get("role") || "";
  if (!email) return Response.json({ ok: false, reason: "Missing email." });
  const loaded = await readEntitlement(email);
  if (!loaded.ok && loaded.reason !== "missing-env") return Response.json({ ok: false, reason: loaded.reason });
  const access = effectiveAccess(loaded.record, role);
  return Response.json({ ok: true, entitlement: loaded.record || null, access });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const secret = process.env.STRIPE_SECRET_KEY || "";
  const email = String(body.email || "").trim().toLowerCase();
  if (!secret) return Response.json({ ok: false, reason: "Billing is not ready yet." });
  if (!email) return Response.json({ ok: false, reason: "Missing email." });
  const loaded = await loadSubscription(secret, body.subscriptionId || "");
  const subscription = loaded.subscription;
  if (!loaded.ok) return Response.json({ ok: false, reason: loaded.reason });

  if (body.action === "cancel") {
    const cancelled = await cancelAtPeriodEnd(secret, subscription);
    if (!cancelled.ok) return Response.json(cancelled);
    const record = (await readEntitlement(email)).record || {};
    const next = {
      ...record,
      source: record.source === "internal" ? "internal" : "stripe",
      email,
      customerId: stripeId(subscription.customer),
      subscriptionId: subscription.id,
      cancelAtPeriodEnd: true,
      periodEnd: cancelled.periodEnd || record.periodEnd || 0,
      status: subscription.status,
      plan: record.plan || (subscription.metadata?.kind === "lite" ? "lite" : "premium"),
    };
    if (next.source !== "internal") await saveEntitlement(next);
    logBilling("cancel at period end", { email, periodEnd: next.periodEnd });
    return Response.json({ ok: true, entitlement: next, access: effectiveAccess(next, body.role) });
  }

  if (body.action === "resume") {
    const resumed = await resumeSubscription(secret, subscription);
    if (!resumed.ok) return Response.json(resumed);
    const record = (await readEntitlement(email)).record || {};
    const next = { ...record, email, cancelAtPeriodEnd: false, status: resumed.subscription?.status || record.status, source: "stripe" };
    if (record.source !== "internal") await saveEntitlement(next);
    logBilling("resume subscription", { email });
    return Response.json({ ok: true, entitlement: next, access: effectiveAccess(next, body.role), resumed: true });
  }

  if (body.action === "schedule-cycle") {
    const cycle = body.cycle === "year" ? "year" : "month";
    const current = intervalOf(subscription);
    if (subscription.cancel_at_period_end || subscription.cancel_at) {
      const resumed = await resumeSubscription(secret, subscription);
      if (!resumed.ok) return Response.json(resumed);
    }
    if (current === cycle) {
      return Response.json({
        ok: true,
        unchanged: true,
        resumed: Boolean(subscription.cancel_at_period_end || subscription.cancel_at),
        access: effectiveAccess((await readEntitlement(email)).record, body.role),
      });
    }
    const monthlyId = priceFor(body.market || "HK", "premium");
    const nextPrice = cycle === "year" ? await yearlyPriceId(secret, monthlyId) : { ok: true, id: monthlyId };
    if (!nextPrice.ok) return Response.json(nextPrice);
    const scheduled = await schedulePrice(secret, subscription, nextPrice.id);
    if (!scheduled.ok) return Response.json(scheduled);
    logBilling("scheduled cycle", { email, cycle, periodEnd: scheduled.periodEnd });
    return Response.json({ ok: true, scheduled: true, cycle, periodEnd: scheduled.periodEnd });
  }

  return Response.json({ ok: false, reason: "Unknown billing action." });
}
