import { supabase, supabaseReady } from "./supabase";

function billName(email) {
  return `__bb_sub__${String(email || "").trim().toLowerCase()}`;
}

function customerName(customerId) {
  return `__bb_cus__${customerId}`;
}

function eventName(eventId) {
  return `__bb_evt__${eventId}`;
}

async function readNamed(name) {
  if (!supabaseReady) return { ok: false, reason: "missing-env" };
  const { data, error } = await supabase.from("venues").select("id,invite_text").eq("name", name).limit(1);
  if (error) return { ok: false, reason: error.message };
  const row = data?.[0];
  if (!row?.invite_text) return { ok: true, record: null, id: row?.id || "" };
  try {
    return { ok: true, record: JSON.parse(row.invite_text), id: row.id };
  } catch {
    return { ok: true, record: null, id: row.id };
  }
}

async function writeNamed(name, record, location) {
  if (!supabaseReady) return { ok: false, reason: "missing-env" };
  const invite_text = JSON.stringify(record);
  const found = await supabase.from("venues").select("id").eq("name", name).limit(1);
  if (found.error) return { ok: false, reason: found.error.message };
  const id = found.data?.[0]?.id;
  if (id) {
    const updated = await supabase.from("venues").update({ invite_text, location, places_left: 0 }).eq("id", id);
    if (updated.error) return { ok: false, reason: updated.error.message };
    return { ok: true, id };
  }
  const inserted = await supabase.from("venues").insert({ name, invite_text, location, places_left: 0 });
  if (inserted.error) return { ok: false, reason: inserted.error.message };
  return { ok: true };
}

export async function readEntitlement(email) {
  const loaded = await readNamed(billName(email));
  if (!loaded.ok) return loaded;
  return { ok: true, record: loaded.record };
}

export async function readEntitlementByCustomer(customerId) {
  if (!customerId) return { ok: true, record: null };
  const pointer = await readNamed(customerName(customerId));
  if (!pointer.ok) return pointer;
  const email = pointer.record?.email || "";
  if (!email) return { ok: true, record: null };
  return readEntitlement(email);
}

export async function saveEntitlement(record) {
  const email = String(record?.email || "").trim().toLowerCase();
  if (!email) return { ok: false, reason: "Entitlement is missing an email." };
  const saved = await writeNamed(billName(email), { ...record, email }, record.customerId || "stripe");
  if (!saved.ok) return saved;
  if (record.customerId) await writeNamed(customerName(record.customerId), { email }, "pointer");
  return saved;
}

export async function seenStripeEvent(eventId) {
  if (!eventId) return { ok: true, seen: false };
  const existing = await readNamed(eventName(eventId));
  if (!existing.ok) return existing;
  return { ok: true, seen: Boolean(existing.record?.id) };
}

export async function claimStripeEvent(eventId) {
  if (!eventId) return { ok: true, fresh: true };
  const name = eventName(eventId);
  const existing = await readNamed(name);
  if (!existing.ok) return existing;
  if (existing.record?.id) return { ok: true, fresh: false };
  const saved = await writeNamed(name, { id: eventId, at: new Date().toISOString() }, "stripe-event");
  if (!saved.ok) return saved;
  return { ok: true, fresh: true };
}

export function logBilling(message, extra = {}) {
  console.log(JSON.stringify({ scope: "billing", message, ...extra }));
}
