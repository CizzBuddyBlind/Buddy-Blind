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

/** Save one current line. The same code again stays. It does not remove it. */
export function postSignal(record, session, code) {
  const seat = viewerSeat(record, session);
  if (seat === "none") return { error: "Join this meetup first." };
  if (seat === "host") {
    if (!HOST_LINES.some((item) => item.code === code)) return { error: "Pick a line first." };
    if (record?.hostSignal?.code === code) return { ok: true, record };
    return { ok: true, record: { ...record, hostSignal: { code, at: Date.now() } } };
  }
  if (!JOINER_LINES.some((item) => item.code === code)) return { error: "Pick a line first." };
  const userId = String(session?.userId || "").trim();
  if (!userId) return { error: "Join this meetup first." };
  const existing = (record?.signals || []).find((item) => item.userId === userId);
  if (existing?.code === code) return { ok: true, record };
  return { ok: true, record: { ...record, signals: upsertSignal(record?.signals, { userId, code, at: Date.now() }) } };
}

/** Remove only the viewer's current line. */
export function clearSignal(record, session) {
  const seat = viewerSeat(record, session);
  if (seat === "none") return { error: "Join this meetup first." };
  if (seat === "host") {
    if (!record?.hostSignal) return { ok: true, record };
    return { ok: true, record: { ...record, hostSignal: null } };
  }
  const userId = String(session?.userId || "").trim();
  if (!userId) return { error: "Join this meetup first." };
  return {
    ok: true,
    record: { ...record, signals: (record?.signals || []).filter((item) => item.userId !== userId) },
  };
}

function personIsHost(record, person) {
  if (person?.role === "host") return true;
  if (record?.hostUserId && person?.userId && person.userId === record.hostUserId) return true;
  const hostHandle = String(record?.hostHandle || record?.hostName || "").trim().toLowerCase();
  const handle = String(person?.handle || "").trim().toLowerCase();
  return !!(hostHandle && handle && !person?.userId && hostHandle === handle);
}

/** Lines already chosen, plus the public booked status. No private booking fields. */
export function signalRows(record, people) {
  const list = (Array.isArray(people) && people.length ? people : record?.participants || [])
    .filter((person) => person?.handle || person?.userId);
  const rows = [];
  list.forEach((person) => {
    if (personIsHost(record, person)) {
      const text = lineText(HOST_LINES, record?.hostSignal?.code);
      if (text) rows.push({ person, text, key: `host-${person.userId || person.handle}` });
      return;
    }
    const signal = (record?.signals || []).find((item) => item?.userId && item.userId === person.userId);
    const text = lineText(JOINER_LINES, signal?.code);
    if (text) rows.push({ person, text, key: `guest-${person.userId || person.handle}` });
  });
  if (record?.source !== "partner" && record?.booking?.booked) {
    rows.push({ system: true, text: TABLE_BOOKED_LINE, key: "booked" });
  }
  const hostText = lineText(HOST_LINES, record?.hostSignal?.code);
  const hostShown = rows.some((row) => String(row.key || "").startsWith("host-"));
  if (hostText && !hostShown) {
    const person = {
      userId: record?.hostUserId || "",
      handle: record?.hostHandle || record?.hostName || "",
    };
    if (person.userId || person.handle) {
      rows.unshift({ person, text: hostText, key: `host-${person.userId || person.handle}` });
    }
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
