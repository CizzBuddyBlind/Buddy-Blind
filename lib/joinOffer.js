import { iso } from "./bible";

function norm(value) {
  return String(value || "").trim().toLowerCase();
}

/** Same person. User ids win. A handle matches only when an id is missing. */
export function sameViewer(session, userId, handle) {
  if (!session) return false;
  const sid = String(session.userId || "").trim();
  const uid = String(userId || "").trim();
  if (sid && uid) return sid === uid;
  const left = norm(session.handle);
  const right = norm(handle);
  return !!(left && right && left === right);
}

/** host, member, or none. The creator is a host even if their participant row has no user id. */
export function viewerSeat(record, session) {
  if (!record || !session) return "none";
  if (sameViewer(session, record.hostUserId, record.hostHandle || record.hostName)) return "host";
  const people = Array.isArray(record.participants) ? record.participants : [];
  if (people.some((person) => person?.role === "host" && sameViewer(session, person.userId, person.handle))) return "host";
  if (people.some((person) => sameViewer(session, person.userId, person.handle))) return "member";
  return "none";
}

/**
 * Whether this viewer may be offered an actionable JOIN.
 * `places` and `closed` come from that event type's own capacity rule.
 */
export function canOfferJoin({ record, session, places, closed, dateISO } = {}) {
  const seat = viewerSeat(record, session);
  const day = dateISO ?? record?.dateISO ?? "";
  const expired = !!day && day < iso(0);
  if (expired) return { canJoin: false, reason: "expired", seat };
  if (seat === "host" || seat === "member") return { canJoin: false, reason: seat, seat };
  const left = Number(places) || 0;
  if (closed || left <= 0) return { canJoin: false, reason: "full", seat };
  return { canJoin: true, reason: "open", seat };
}
