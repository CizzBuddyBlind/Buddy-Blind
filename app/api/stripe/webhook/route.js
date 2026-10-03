import { snapshotFromSubscription, nextEntitlement } from "@/lib/entitlement";
import { claimStripeEvent, logBilling, readEntitlement, readEntitlementByCustomer, saveEntitlement, seenStripeEvent } from "@/lib/billingStore";
import { loadSubscription, stripeId, stripeRequest } from "@/lib/stripeBilling";
import { verifyStripeSignature } from "@/lib/stripeSign";

export const runtime = "nodejs";

async function emailFor(secret, subscription, session) {
  const meta = subscription?.metadata?.email || session?.metadata?.email || session?.customer_email || session?.customer_details?.email || "";
  if (meta) return String(meta).toLowerCase();
  const customerId = stripeId(subscription?.customer || session?.customer);
  const known = await readEntitlementByCustomer(customerId);
  if (known.record?.email) return known.record.email;
  if (!customerId || !secret) return "";
  const customer = await stripeRequest(secret, `/v1/customers/${encodeURIComponent(customerId)}`);
  return String(customer.data?.email || "").toLowerCase();
}

async function applySubscription(secret, event, subscription, hintedEmail) {
  const email = await emailFor(secret, subscription, { customer_email: hintedEmail, metadata: { email: hintedEmail } });
  const existing = email ? (await readEntitlement(email)).record : (await readEntitlementByCustomer(stripeId(subscription.customer))).record;
  const snapshot = snapshotFromSubscription(subscription, email || existing?.email || "");
  const decided = nextEntitlement(existing, snapshot, event);
  logBilling(decided.skip ? `skipped ${decided.skip}` : "applied subscription", {
    event: event.type,
    eventId: event.id,
    status: snapshot.status,
    plan: snapshot.plan,
    email: snapshot.email,
  });
  if (decided.skip || !decided.row?.email) return decided;
  const saved = await saveEntitlement(decided.row);
  if (!saved.ok) logBilling("save failed", { reason: saved.reason, eventId: event.id });
  return decided;
}

export async function POST(request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
  const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
  const raw = await request.text();
  if (!verifyStripeSignature(raw, request.headers.get("stripe-signature"), secret)) {
    logBilling("rejected webhook signature");
    return Response.json({ ok: false }, { status: 400 });
  }
  const event = JSON.parse(raw);
  const prior = await seenStripeEvent(event.id);
  if (!prior.ok) return Response.json({ ok: false }, { status: 500 });
  if (prior.seen) {
    logBilling("duplicate event", { eventId: event.id });
    return Response.json({ ok: true, duplicate: true });
  }
  try {
    let handled = false;
    if (event.type === "checkout.session.completed" || event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
      const object = event.data?.object || {};
      const subscriptionId = stripeId(object.subscription);
      if (!subscriptionId) {
        await claimStripeEvent(event.id);
        return Response.json({ ok: true, ignored: true });
      }
      const loaded = await loadSubscription(stripeSecret, subscriptionId);
      if (!loaded.ok) {
        logBilling("subscription read failed", { eventId: event.id, reason: loaded.reason });
        return Response.json({ ok: false }, { status: 500 });
      }
      await applySubscription(stripeSecret, event, loaded.subscription, object.customer_email || object.customer_details?.email || "");
      handled = true;
    } else if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      await applySubscription(stripeSecret, event, event.data?.object || {}, "");
      handled = true;
    }
    await claimStripeEvent(event.id);
    if (!handled) logBilling("ignored event", { event: event.type, eventId: event.id });
    return Response.json({ ok: true, ignored: !handled });
  } catch (error) {
    logBilling("webhook failed", { eventId: event.id, reason: error instanceof Error ? error.message : "failed" });
    return Response.json({ ok: false }, { status: 500 });
  }
}
