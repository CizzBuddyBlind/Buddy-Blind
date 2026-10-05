import { bookingHold, iso, tableStart } from "./bible";

/** Early-launch same-day cap. A venue may set sameDayMax later. Not restaurant-specific. */
export function cappedCapacity(requested, dateISO, venue, now = new Date()) {
  const asked = Math.min(6, Math.max(2, Number(requested) || 2));
  if (dateISO !== iso(0, now)) return asked;
  const configured = Number(venue?.sameDayMax);
  const max = configured > 0 ? Math.min(6, configured) : 2;
  return Math.min(asked, max);
}

export function headsUpText({ participants, time }) {
  const count = Math.max(1, Number(participants) || 2);
  const when = time || "the booked time";
  return `Buddy Blind heads-up: ${count} guests may arrive today at approximately ${when}. No table needs to be held — please treat them as walk-in customers subject to availability.`;
}

function instantChannels(method) {
  if (method === "sms" || method === "whatsapp") return [method];
  return ["email"];
}

function bothChannels(method) {
  if (method === "sms" || method === "whatsapp") return ["email", method];
  return ["email"];
}

function toldHeld(keys) {
  let held = null;
  keys.forEach((key) => {
    if (String(key).startsWith("walk-in:")) held = 0;
    const match = String(key).match(/^(?:opened|reduce|increase):(\d+):/);
    if (match) held = Number(match[1]);
  });
  return held;
}

/** Notices still owed for this table. The same key is never returned twice. */
export function planVenueNotices(table, venue, now = new Date()) {
  if (!table || table.auto) return [];
  const hold = bookingHold(table, now);
  if (hold.mode === "closed") return [];
  if (tableStart(table).getTime() <= now.getTime()) return [];
  const keys = Array.isArray(table.venueNotices) ? [...table.venueNotices] : [];
  const sent = new Set(keys);
  const method = venue?.contactMethod === "sms" || venue?.contactMethod === "whatsapp" ? venue.contactMethod : "email";
  const notices = [];
  const add = (action, channels, held = hold.held, status = hold.status) => {
    const key = `${action}:${held}:${status}`;
    if (sent.has(key)) return;
    if (action === "final" && keys.some((item) => String(item).startsWith("final:"))) return;
    if (action === "heads-up" && keys.some((item) => String(item).startsWith("heads-up:"))) return;
    if (action === "walk-in" && keys.some((item) => String(item).startsWith("walk-in:"))) return;
    if (action === "opened" && keys.some((item) => String(item).startsWith("opened:"))) return;
    sent.add(key);
    keys.push(key);
    notices.push({ action, channels, key, held, status, hold });
  };

  if (hold.mode === "heads-up") {
    add("heads-up", instantChannels(method));
    return notices;
  }
  if (hold.mode === "released" && !keys.some((item) => String(item).startsWith("opened:"))) {
    add("walk-in", bothChannels(method));
    return notices;
  }

  let told = toldHeld(keys);
  if (!keys.some((item) => String(item).startsWith("opened:"))) {
    add("opened", ["email"]);
    told = hold.held;
  }
  if (hold.status === "reserved" && told != null && hold.held !== told) {
    add(hold.held < told ? "reduce" : "increase", instantChannels(method));
  }
  if (hold.mode === "released") add("walk-in", bothChannels(method));

  const createdSameDay = table.openedAt && iso(0, new Date(table.openedAt)) === table.dateISO;
  const hoursLeft = (tableStart(table).getTime() - now.getTime()) / 3600000;
  const finalWindow = hold.status === "reserved" && hoursLeft > 0 && ((!createdSameDay && hold.days <= 1) || (createdSameDay && hoursLeft <= 2));
  if (finalWindow) add("final", bothChannels(method));
  return notices;
}

export function noticeBody(venue, table, notice, userEmail) {
  return {
    venueName: venue?.name || "",
    email: venue?.email || "",
    phone: venue?.phone || "",
    method: venue?.contactMethod || "email",
    channels: notice.channels,
    action: notice.action,
    dateISO: table.dateISO,
    time: table.time,
    host: table.hostHandle || "",
    participants: notice.hold.joined,
    held: notice.hold.held,
    status: notice.hold.status,
    reason: notice.hold.reason,
    userEmail: userEmail || "",
  };
}
