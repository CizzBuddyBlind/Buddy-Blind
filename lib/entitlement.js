import { MARKETS } from "./market";

const OPEN = new Set(["trialing", "active", "past_due"]);
const TERMINAL = new Set(["canceled", "unpaid", "incomplete_expired"]);

export function isInternalRole(role) {
  return role === "founder" || role === "admin" || role === "staff";
}

export function planFromPrice(priceId, interval) {
  for (const market of Object.values(MARKETS)) {
    if (priceId && priceId === market.prices.lite) return { plan: "lite", cycle: "month" };
    if (priceId && priceId === market.prices.premium) return { plan: "premium", cycle: interval === "year" ? "year" : "month" };
  }
  if (interval === "year") return { plan: "premium", cycle: "year" };
  return { plan: "premium", cycle: "month" };
}

export function snapshotFromSubscription(sub, email = "") {
  const item = sub?.items?.data?.[0];
  const price = item?.price;
  const priceId = typeof price === "string" ? price : price?.id || "";
  const interval = price?.recurring?.interval || (sub?.metadata?.cycle === "year" ? "year" : "month");
  const mapped = planFromPrice(priceId, interval);
  const metaKind = sub?.metadata?.kind === "lite" || sub?.metadata?.kind === "premium" ? sub.metadata.kind : "";
  const status = sub?.status || "";
  const terminal = TERMINAL.has(status);
  const plan = terminal ? "free" : metaKind || mapped.plan;
  return {
    source: "stripe",
    email: String(email || sub?.metadata?.email || "").toLowerCase(),
    customerId: typeof sub?.customer === "string" ? sub.customer : sub?.customer?.id || "",
    subscriptionId: sub?.id || "",
    plan: plan === "lite" || plan === "premium" ? plan : "free",
    cycle: terminal ? "" : interval === "year" ? "year" : "month",
    status,
    periodEnd: Number(sub?.current_period_end || 0) * 1000,
    cancelAtPeriodEnd: Boolean(sub?.cancel_at_period_end),
    priceId,
  };
}

export function nextEntitlement(existing, snapshot, event) {
  if (existing?.source === "internal") return { row: existing, skip: "internal" };
  const created = Number(event?.created || 0);
  const id = event?.id || "";
  if (id && Array.isArray(existing?.recentEventIds) && existing.recentEventIds.includes(id)) {
    return { row: existing, skip: "duplicate" };
  }
  if (existing?.lastEventCreated && created && created < existing.lastEventCreated) {
    return { row: existing, skip: "stale" };
  }
  const recent = [...(existing?.recentEventIds || []), id].filter(Boolean).slice(-40);
  return {
    skip: "",
    row: {
      ...snapshot,
      source: "stripe",
      email: snapshot.email || existing?.email || "",
      customerId: snapshot.customerId || existing?.customerId || "",
      lastEventCreated: created || existing?.lastEventCreated || 0,
      lastEventId: id || existing?.lastEventId || "",
      recentEventIds: recent,
      updatedAt: new Date().toISOString(),
    },
  };
}

export function effectiveAccess(entitlement, role) {
  if (isInternalRole(role)) {
    return { plan: "premium", source: "internal", status: "internal", cancelAtPeriodEnd: false, periodEnd: 0, cycle: entitlement?.cycle || "" };
  }
  if (!entitlement || entitlement.source === "internal") {
    return { plan: "free", source: "none", status: "", cancelAtPeriodEnd: false, periodEnd: 0, cycle: "" };
  }
  const status = entitlement.status || "";
  if (!OPEN.has(status) || entitlement.plan === "free") {
    return { plan: "free", source: "stripe", status, cancelAtPeriodEnd: false, periodEnd: entitlement.periodEnd || 0, cycle: "" };
  }
  return {
    plan: entitlement.plan,
    source: "stripe",
    status,
    cycle: entitlement.cycle || "month",
    periodEnd: entitlement.periodEnd || 0,
    cancelAtPeriodEnd: Boolean(entitlement.cancelAtPeriodEnd),
    customerId: entitlement.customerId || "",
    subscriptionId: entitlement.subscriptionId || "",
    priceId: entitlement.priceId || "",
  };
}
