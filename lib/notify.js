export function channelNote(result) {
  if (!result) return "Not sent.";
  const bits = [`email ${result.email || "skipped"}`];
  if (result.sms && result.sms !== "skipped") bits.push(`sms ${result.sms}`);
  if (result.whatsapp && result.whatsapp !== "skipped") bits.push(`whatsapp ${result.whatsapp}`);
  if (result.hint) bits.push(result.hint);
  return bits.join(" · ");
}

export async function notifyRestaurant(payload) {
  try {
    const res = await fetch("/api/notify-venue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {}),
    });
    return await res.json();
  } catch (err) {
    return { ok: false, email: "failed", hint: err instanceof Error ? err.message : "Network error" };
  }
}
