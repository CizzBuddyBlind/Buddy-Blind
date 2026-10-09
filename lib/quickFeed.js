import { bookingHold } from "./bible";
import { canOfferJoin } from "./joinOffer";

export function joinOwnQuick(item, session) {
  if (!item || item.kind !== "quick" || item.source !== "own") return { error: "That seat is gone." };
  const people = Array.isArray(item.participants) ? item.participants.filter((person) => person?.handle || person?.userId) : [];
  if (session?.userId && people.some((person) => person.userId === session.userId)) return { error: "You're already in." };
  const cap = Number(item.capacity) || 0;
  const open = cap > 0 ? cap - people.length : Number(item.spots) || 0;
  const offer = canOfferJoin({ record: item, session, places: open, closed: open <= 0 });
  if (!offer.canJoin) return { error: offer.reason === "full" ? "No spots left." : "You're already in." };
  item.participants = [...people, { userId: session?.userId || "", handle: session?.handle || "", role: "guest" }];
  item.spots = Math.max(0, (cap || people.length + open) - item.participants.length);
  return { ok: true };
}

/** Two-hour walk-in only. Restaurant booking is not decided here and must not change the seat count. */
export function ownQuickDecision(item, input) {
  if (!item) return { error: "That meetup is gone." };
  if (input?.choice === "booked") return { error: "Use Table booked on the meetup." };
  if (input?.choice !== "walk") return { error: "Choose one." };
  if (item.booking?.booked) return { error: "This table is already booked." };
  item.booked = false;
  item.walkIn = true;
  item.bookingName = "";
  item.meetingNote = String(input?.meetingNote || "").trim();
  return { ok: true };
}

export function quickJoinState(row, session) {
  const people = Array.isArray(row?.participants) && row.participants.some((person) => person?.handle || person?.userId)
    ? row.participants.filter((person) => person?.handle || person?.userId)
    : (row?.hostHandle || row?.hostName)
      ? [{ userId: row.hostUserId || "", handle: row.hostHandle || row.hostName, role: "host" }]
      : [];
  const cap = Number(row?.capacity) || 0;
  const openSeats = cap > 0 ? Math.max(0, cap - people.length) : Math.max(0, Number(row?.spots) || 0);
  const closed = !!row?.joinClosed || openSeats === 0;
  const offer = canOfferJoin({ record: row, session, places: openSeats, closed, dateISO: row?.dateISO });
  return { people, cap, openSeats, closed, joined: offer.seat !== "none", canJoin: offer.canJoin };
}

export function partnerQuickView(venue, table) {
  const people = Array.isArray(table?.participants) ? table.participants.filter((person) => person?.handle || person?.userId) : [];
  const capacity = Number(table?.capacity) || 2;
  const hold = bookingHold(table);
  const count = Math.max(people.length, Number(table?.joined) || 0);
  return {
    id: table.id,
    kind: "quick",
    source: "partner",
    venueId: venue.id,
    tableId: table.id,
    name: venue.name,
    post: table.post || "",
    time: table.time || "",
    timeLabel: table.time || "",
    dateISO: table.dateISO || "",
    area: table.area || venue.area || "",
    detail: table.address || venue.locationLabel || "",
    capacity,
    spots: hold.closed ? 0 : Math.max(0, capacity - count),
    joinClosed: !!hold.closed,
    tableType: table.tableType || "meet-friends",
    gender: table.gender || "",
    orientation: table.orientation || "",
    ageRange: table.ageRange || "",
    hostUserId: table.hostUserId || "",
    hostHandle: table.hostHandle || "",
    hostName: table.hostHandle || "",
    participants: people,
    address: table.address || "",
    openedAt: table.openedAt || "",
    likes: Array.isArray(table.likes) ? table.likes : [],
    signals: Array.isArray(table.signals) ? table.signals : [],
    hostSignal: table.hostSignal || null,
  };
}

export function quickRows(content) {
  const partner = [];
  for (const venue of content?.venues || []) {
    if (!venue || venue.hidden) continue;
    for (const table of venue.tables || []) {
      if (!table || table.auto || !table.quick) continue;
      partner.push(partnerQuickView(venue, table));
    }
  }
  partner.sort((a, b) => String(b.openedAt).localeCompare(String(a.openedAt)));
  const events = (content?.events || []).filter((event) => event?.kind === "quick");
  return [...partner, ...events];
}

export function resolveQuick(row, content) {
  if (!row) return row;
  if (row.source === "partner" && row.venueId && row.tableId) {
    const venue = (content?.venues || []).find((item) => item?.id === row.venueId);
    const table = (venue?.tables || []).find((item) => item?.id === row.tableId);
    if (venue && table?.quick) return partnerQuickView(venue, table);
  }
  return (content?.events || []).find((item) => item?.id === row.id) || row;
}
