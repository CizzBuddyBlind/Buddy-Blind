export async function stripeRequest(secret, path, { method = "GET", params } = {}) {
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

export function stripeId(value) {
  if (!value) return "";
  return typeof value === "string" ? value : value.id || "";
}

export async function loadSubscription(secret, subscriptionId) {
  if (!subscriptionId) return { ok: false, reason: "No subscription." };
  const loaded = await stripeRequest(secret, `/v1/subscriptions/${encodeURIComponent(subscriptionId)}?expand[]=items.data.price`);
  if (!loaded.ok) return { ok: false, reason: loaded.data?.error?.message || "Could not read the subscription." };
  return { ok: true, subscription: loaded.data };
}

function phasePrice(phase) {
  const price = phase?.items?.[0]?.price;
  return stripeId(price);
}

export async function schedulePrice(secret, subscription, nextPriceId) {
  let schedule = null;
  const existingId = stripeId(subscription.schedule);
  if (existingId) {
    const loaded = await stripeRequest(secret, `/v1/subscription_schedules/${existingId}`);
    if (!loaded.ok) return { ok: false, reason: loaded.data?.error?.message || "Could not read the billing schedule." };
    schedule = loaded.data;
  } else {
    const created = await stripeRequest(secret, "/v1/subscription_schedules", {
      method: "POST",
      params: new URLSearchParams({ from_subscription: subscription.id }),
    });
    if (!created.ok) return { ok: false, reason: created.data?.error?.message || "Could not schedule the billing change." };
    schedule = created.data;
  }
  const current = schedule.phases?.[0] || {};
  const currentPrice = phasePrice(current) || stripeId(subscription.items?.data?.[0]?.price);
  const start = current.start_date || subscription.current_period_start;
  const end = subscription.current_period_end;
  const params = new URLSearchParams({
    end_behavior: "release",
    proration_behavior: "none",
    "phases[0][start_date]": String(start),
    "phases[0][end_date]": String(end),
    "phases[0][proration_behavior]": "none",
    "phases[0][items][0][price]": currentPrice,
    "phases[0][items][0][quantity]": "1",
    "phases[1][proration_behavior]": "none",
    "phases[1][items][0][price]": nextPriceId,
    "phases[1][items][0][quantity]": "1",
  });
  const updated = await stripeRequest(secret, `/v1/subscription_schedules/${schedule.id}`, { method: "POST", params });
  if (!updated.ok) return { ok: false, reason: updated.data?.error?.message || "Could not schedule the billing change." };
  return { ok: true, periodEnd: end * 1000, scheduled: true };
}

export async function cancelAtPeriodEnd(secret, subscription) {
  const scheduleId = stripeId(subscription.schedule);
  if (scheduleId) {
    const loaded = await stripeRequest(secret, `/v1/subscription_schedules/${scheduleId}`);
    if (!loaded.ok) return { ok: false, reason: loaded.data?.error?.message || "Could not read the billing schedule." };
    const current = loaded.data.phases?.[0] || {};
    const currentPrice = phasePrice(current) || stripeId(subscription.items?.data?.[0]?.price);
    const params = new URLSearchParams({
      end_behavior: "cancel",
      proration_behavior: "none",
      "phases[0][start_date]": String(current.start_date || subscription.current_period_start),
      "phases[0][end_date]": String(subscription.current_period_end),
      "phases[0][proration_behavior]": "none",
      "phases[0][items][0][price]": currentPrice,
      "phases[0][items][0][quantity]": "1",
    });
    const updated = await stripeRequest(secret, `/v1/subscription_schedules/${scheduleId}`, { method: "POST", params });
    if (!updated.ok) return { ok: false, reason: updated.data?.error?.message || "Could not stop the next renewal." };
  }
  const cancelled = await stripeRequest(secret, `/v1/subscriptions/${subscription.id}`, {
    method: "POST",
    params: new URLSearchParams({ cancel_at_period_end: "true" }),
  });
  if (!cancelled.ok && !scheduleId) {
    return { ok: false, reason: cancelled.data?.error?.message || "Could not stop the next renewal." };
  }
  return { ok: true, periodEnd: subscription.current_period_end * 1000, cancelAtPeriodEnd: true, subscription: cancelled.ok ? cancelled.data : subscription };
}

export async function resumeSubscription(secret, subscription) {
  const scheduleId = stripeId(subscription.schedule);
  if (scheduleId) {
    const loaded = await stripeRequest(secret, `/v1/subscription_schedules/${scheduleId}`);
    if (loaded.ok && loaded.data.end_behavior === "cancel") {
      const current = loaded.data.phases?.[0] || {};
      const currentPrice = phasePrice(current) || stripeId(subscription.items?.data?.[0]?.price);
      const params = new URLSearchParams({
        end_behavior: "release",
        "phases[0][start_date]": String(current.start_date || subscription.current_period_start),
        "phases[0][items][0][price]": currentPrice,
        "phases[0][items][0][quantity]": "1",
      });
      const released = await stripeRequest(secret, `/v1/subscription_schedules/${scheduleId}`, { method: "POST", params });
      if (!released.ok) return { ok: false, reason: released.data?.error?.message || "Could not continue this subscription." };
    }
  }
  const resumed = await stripeRequest(secret, `/v1/subscriptions/${subscription.id}`, {
    method: "POST",
    params: new URLSearchParams({ cancel_at_period_end: "false" }),
  });
  if (!resumed.ok) return { ok: false, reason: resumed.data?.error?.message || "Could not continue this subscription." };
  return { ok: true, subscription: resumed.data, resumed: true };
}
