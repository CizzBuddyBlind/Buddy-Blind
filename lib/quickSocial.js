import { viewerSeat } from "./joinOffer";

export const JOINER_LINES = [
  { code: "keen", text: "Keen! See you there 👋" },
  { code: "forward", text: "Looking forward to it!" },
  { code: "nearby", text: "Nice! I work nearby." },
  { code: "late", text: "Joined! I might be 10–15 mins late." },
];

export const HOST_LINES = [
  { code: "see-you", text: "Great! See you there 👋" },
  { code: "no-worries", text: "No worries, take your time." },
  { code: "cant-wait", text: "Can't wait to meet you guys!" },
];

export const TABLE_BOOKED_LINE = "✓ Table booked! See you guys later 👋";

function lineText(list, code) {
  return list.find((item) => item.code === code)?.text || "";
}

export function toggleLike(likes, userId) {
  const id = String(userId || "").trim();
  const list = (Array.isArray(likes) ? likes : []).map((item) => String(item || "").trim()).filter(Boolean);
  if (!id) return list;
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export function applyLike(record, userId) {
  return { ...record, likes: toggleLike(record?.likes, userId) };
}

function upsertSignal(signals, entry) {
  const list = (Array.isArray(signals) ? signals : []).filter((item) => item?.userId);
  return [...list.filter((item) => item.userId !== entry.userId), entry];
}

/** One current line. The same code again clears it. Joining is unchanged. */
export function applySignal(record, session, code) {
  const seat = viewerSeat(record, session);
  if (seat === "none") return { error: "Join this meetup first." };
  if (seat === "host") {
    if (!HOST_LINES.some((item) => item.code === code)) return { error: "Pick a line first." };
    const hostSignal = record?.hostSignal?.code === code ? null : { code, at: Date.now() };
    return { ok: true, record: { ...record, hostSignal } };
  }
  if (!JOINER_LINES.some((item) => item.code === code)) return { error: "Pick a line first." };
  const userId = String(session?.userId || "").trim();
  if (!userId) return { error: "Join this meetup first." };
  const existing = (record?.signals || []).find((item) => item.userId === userId);
  const signals = existing?.code === code
    ? (record.signals || []).filter((item) => item.userId !== userId)
    : upsertSignal(record?.signals, { userId, code, at: Date.now() });
  return { ok: true, record: { ...record, signals } };
}

function commentId() {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch { /* use the fallback below */ }
  return `cmt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Append one preset comment. The same code again is another comment. */
export function postSignal(record, session, code, now = Date.now()) {
  const seat = viewerSeat(record, session);
  if (seat === "none") return { error: "Join this meetup first." };
  const role = seat === "host" ? "host" : "member";
  if (!(role === "host" ? HOST_LINES : JOINER_LINES).some((item) => item.code === code)) return { error: "Pick a line first." };
  const userId = String(session?.userId || "").trim();
  if (!userId) return { error: "Join this meetup first." };
  const signals = [...(Array.isArray(record?.signals) ? record.signals : []), { id: commentId(), userId, code, at: now, role }];
  return { ok: true, record: { ...record, signals } };
}

/** Remove one comment the viewer authored. Leaving the event does not transfer ownership. */
export function clearSignal(record, session, commentId) {
  const userId = String(session?.userId || "").trim();
  if (!userId) return { error: "Join this meetup first." };
  const id = String(commentId || "");
  if (id === "legacy-host") {
    if (userId !== String(record?.hostUserId || "")) return { error: "You can only remove your own comment." };
    if (!record?.hostSignal) return { ok: true, record };
    return { ok: true, record: { ...record, hostSignal: null } };
  }
  if (id.startsWith("legacy-")) {
    const owner = id.slice("legacy-".length);
    if (owner !== userId) return { error: "You can only remove your own comment." };
    let removed = false;
    const signals = (Array.isArray(record?.signals) ? record.signals : []).filter((item) => {
      if (removed || item?.id || item?.userId !== userId) return true;
      removed = true;
      return false;
    });
    if (!removed) return { error: "That comment is no longer there." };
    return { ok: true, record: { ...record, signals } };
  }
  const found = (Array.isArray(record?.signals) ? record.signals : []).find((item) => item?.id === id);
  if (!found) return { error: "That comment is no longer there." };
  if (found.userId !== userId) return { error: "You can only remove your own comment." };
  return { ok: true, record: { ...record, signals: record.signals.filter((item) => item?.id !== id) } };
}

function personFor(record, people, userId) {
  const list = (Array.isArray(people) && people.length ? people : record?.participants) || [];
  const found = list.find((person) => person?.userId && person.userId === userId);
  if (found) return found;
  if (userId && record?.hostUserId && userId === record.hostUserId) {
    return { userId, handle: record.hostHandle || record.hostName || "", role: "host" };
  }
  return { userId: userId || "", handle: "" };
}

/** Every persisted preset, oldest first. A person who has left still remains in the history. */
function threadComments(record, people) {
  const rows = [];
  for (const item of Array.isArray(record?.signals) ? record.signals : []) {
    const userId = String(item?.userId || "").trim();
    if (!userId) continue;
    const role = item.role === "host" ? "host" : "member";
    const text = lineText(role === "host" ? HOST_LINES : JOINER_LINES, item.code);
    if (!text) continue;
    rows.push({
      id: item.id || `legacy-${userId}`,
      userId,
      text,
      at: Number(item.at) || 0,
      person: personFor(record, people, userId),
    });
  }
  const host = record?.hostSignal;
  if (host && typeof host === "object" && !Array.isArray(host)) {
    const text = lineText(HOST_LINES, host.code);
    const userId = String(record?.hostUserId || "").trim();
    if (text) {
      rows.push({
        id: "legacy-host",
        userId,
        text,
        at: Number(host.at) || 0,
        person: personFor(record, people, userId),
      });
    }
  }
  rows.sort((a, b) => (a.at - b.at) || String(a.id).localeCompare(String(b.id)));
  return rows;
}

/** Lines already chosen, plus the public booked status. No private booking fields. */
export function signalRows(record, people) {
  const rows = threadComments(record, people).map((item) => ({
    person: item.person,
    text: item.text,
    key: item.id,
    id: item.id,
    userId: item.userId,
  }));
  if (record?.source !== "partner" && record?.booking?.booked) {
    rows.push({ system: true, text: TABLE_BOOKED_LINE, key: "booked" });
  }
  return rows;
}

/** Current visible presets only. The booked line, a meeting note, and a stale code do not count. */
export function commentCount(record, people) {
  return signalRows(record, people).filter((row) => !row.system).length;
}

/** The social record itself. A normal table is never a Partner Quick table, and the reverse. */
export function locateSocial(content, row) {
  if (!content || !row) return null;
  if (row.source === "partner") {
    const venue = (content.venues || []).find((item) => item?.id === row.venueId);
    return (venue?.tables || []).find((item) => item?.id === row.tableId && item.quick && !item.auto) || null;
  }
  if (row.source === "own") {
    return (content.events || []).find((event) => event?.id === row.id && event.kind === "quick" && event.source === "own") || null;
  }
  if (row.source === "table") {
    const venue = (content.venues || []).find((item) => item?.id === row.venueId);
    return (venue?.tables || []).find((item) => item?.id === row.tableId && !item.quick && !item.auto) || null;
  }
  if (row.source === "private") {
    return (content.events || []).find((event) => event?.id === row.id && event.kind === "private") || null;
  }
  return null;
}

/** Who is coming now. Never the meetup maximum. */
export function suggestedTableSize(record) {
  const people = Array.isArray(record?.participants)
    ? record.participants.filter((person) => person?.userId || person?.handle)
    : [];
  if (people.length) return people.length;
  const joined = Number(record?.joined);
  if (Number.isFinite(joined) && joined >= 1) return Math.round(joined);
  return 1;
}

export function placeBooking(record, input, now = Date.now()) {
  const venueName = String(input?.venueName || "").trim();
  const address = String(input?.address || "").trim();
  const time = String(input?.time || "").trim();
  const bookingName = String(input?.bookingName || "").trim();
  const tableSize = Number(input?.tableSize);
  if (!venueName) return { error: "Add the restaurant name." };
  if (!time) return { error: "Add the time." };
  if (!Number.isInteger(tableSize) || tableSize < 1 || tableSize > 20) return { error: "Add the table size." };
  if (!bookingName) return { error: "Add the name the restaurant has." };
  return {
    ok: true,
    booking: {
      booked: true,
      venueName,
      address,
      time,
      tableSize,
      bookingName,
      at: now,
    },
  };
}

export function bookingNote(event) {
  const booking = event?.booking;
  if (!booking?.booked || !event?.id) return null;
  const time = booking.time || event.time || "";
  const stamp = Number(booking.at) || 0;
  return {
    id: `qb-${event.id}`,
    title: "Your table is booked 🎉",
    body: `Tonight · ${time}\nTap to view booking details`,
    at: new Date(stamp).toISOString(),
    read: false,
    quickBooking: {
      eventId: event.id,
      at: stamp,
      venueName: booking.venueName,
      address: booking.address || "",
      time,
      tableSize: booking.tableSize,
      bookingName: booking.bookingName,
    },
  };
}

/** Joined people only. A like is not a seat. */
export function noteForViewer(event, session) {
  if (!event || event.kind !== "quick" || event.source !== "own" || !event.booking?.booked) return null;
  if (viewerSeat(event, session) === "none") return null;
  return bookingNote(event);
}

export function syncBookingNotes(notes, events, session) {
  const next = Array.isArray(notes) ? [...notes] : [];
  let changed = false;
  (events || []).forEach((event) => {
    const note = noteForViewer(event, session);
    if (!note) return;
    const index = next.findIndex((item) => item.id === note.id);
    if (index < 0) {
      next.unshift(note);
      changed = true;
      return;
    }
    if (next[index]?.quickBooking?.at !== note.quickBooking.at) {
      next[index] = { ...note, read: false };
      changed = true;
    }
  });
  return { notes: next, changed };
}
