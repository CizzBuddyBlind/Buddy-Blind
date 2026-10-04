import { SEED_ACCOUNTS } from "./defaults";

export const TEST_PEOPLE = [
  { id: "bb-test-aria", handle: "Aria", points: 120, neighborhood: "TST", occupation: "Bronze test", ageRange: "25-30", gender: "Woman", orientation: "Bi", test: true },
  { id: "bb-test-soren", handle: "Soren", points: 340, neighborhood: "Central", occupation: "Silver test", ageRange: "30-40", gender: "Man", orientation: "Gay", test: true },
  { id: "bb-test-goldie", handle: "Goldie", points: 560, neighborhood: "CWB", occupation: "Gold test", ageRange: "30-40", gender: "Woman", orientation: "Lesbian", test: true },
  { id: "bb-test-nico", handle: "Nico", points: 0, neighborhood: "Soho", occupation: "No badge test", ageRange: "18-24", gender: "Non-binary", orientation: "Any", test: true },
];

const DEMO_PEOPLE = [
  { id: "demo-mina", handle: "Mina", points: 340, neighborhood: "Central", occupation: "Wine", ageRange: "30-40" },
  { id: "demo-bo", handle: "Bo", points: 120, neighborhood: "TST", occupation: "Design", ageRange: "25-30" },
  { id: "demo-sam", handle: "Sam", points: 560, neighborhood: "CWB", occupation: "Host", ageRange: "30-40" },
];

function norm(value) {
  return String(value || "").trim().toLowerCase();
}

function withoutSecret(account) {
  if (!account) return {};
  const { password, ...safe } = account;
  return safe;
}

function readJson(key) {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(key) || "{}") || {};
  } catch {
    return {};
  }
}

export function directory({ session, users } = {}) {
  const profiles = readJson("bb_profile_v1");
  const points = readJson("bb_points_v1");
  const accounts = [];
  const seen = new Set();
  const push = (base) => {
    if (!base?.email && !base?.userId) return;
    const userId = base.userId || `acct_${norm(base.email).replace(/[^a-z0-9]+/g, "_")}`;
    if (seen.has(userId)) return;
    seen.add(userId);
    const profile = profiles[userId] || profiles[base.email] || {};
    const listed = (users || []).find((user) => user?.userId === userId || (base.email && user?.email === base.email));
    const live = (session?.userId && session.userId === userId) || (base.email && session?.email === base.email) ? session : null;
    const handle = live?.handle || profile.handle || listed?.handle || base.handle || "";
    const previous = new Set([
      ...(base.previousHandles || []),
      ...(profile.previousHandles || []),
      ...(listed?.previousHandles || []),
      ...(live?.previousHandles || []),
    ].map(norm).filter(Boolean));
    if (base.handle && norm(base.handle) !== norm(handle)) previous.add(norm(base.handle));
    const pointValue = live
      ? Number(live.points) || 0
      : Math.max(Number(points[userId]) || 0, Number(points[base.email]) || 0, Number(listed?.points) || 0, Number(base.points) || 0);
    accounts.push({
      ...withoutSecret(base),
      ...withoutSecret(listed),
      ...profile,
      ...(live ? withoutSecret(live) : {}),
      userId,
      id: userId,
      email: base.email || live?.email || listed?.email || "",
      handle,
      previousHandles: [...previous],
      points: pointValue,
    });
  };
  SEED_ACCOUNTS.forEach(push);
  (users || []).forEach(push);
  if (session) push(session);
  return accounts;
}

export function personRecord(ref, ctx = {}) {
  const key = norm(ref);
  const shown = String(ref || "").trim();
  if (!key || key === "?" || key === "host") return null;
  const accounts = directory(ctx);
  const byId = accounts.find((item) => norm(item.userId) === key);
  if (byId) return byId;
  const current = accounts.filter((item) => norm(item.handle) === key);
  if (current.length === 1) return current[0];
  const former = accounts.filter((item) => (item.previousHandles || []).includes(key));
  if (former.length === 1) return former[0];
  const known = [...TEST_PEOPLE, ...DEMO_PEOPLE].find((item) => norm(item.handle) === key || norm(item.id) === key);
  if (known) return { ...known, userId: known.id, id: known.id, points: Number(known.points) || 0, handle: known.handle };
  return { userId: "", id: key, handle: shown, points: 0 };
}

export function sameIdentity(ref, person, ctx = {}) {
  if (ref == null || !person) return false;
  const token = typeof ref === "string" ? ref : (ref.userId || ref.handle || ref.name || ref.hostUserId || ref.hostHandle || ref.hostName || "");
  if (!token) return false;
  const record = personRecord(token, { session: ctx.session || person, users: ctx.users || [] });
  if (record?.userId && person.userId) return record.userId === person.userId;
  return norm(token) === norm(person.handle);
}

export function stampContent(content, ctx = {}) {
  if (!content) return content;
  const idFor = (ref) => personRecord(ref, ctx)?.userId || "";
  (content.venues || []).forEach((venue) => {
    (venue.tables || []).forEach((table) => {
      if (!table) return;
      if (!table.hostUserId) {
        const id = idFor(table.hostHandle);
        if (id) table.hostUserId = id;
      }
      (table.participants || []).forEach((person) => {
        if (person && !person.userId) {
          const id = idFor(person.handle);
          if (id) person.userId = id;
        }
      });
    });
  });
  (content.events || []).forEach((event) => {
    if (!event) return;
    if (!event.hostUserId) {
      const id = idFor(event.hostName || event.hostProfile?.handle);
      if (id) event.hostUserId = id;
    }
    (event.participants || []).forEach((person) => {
      if (person && !person.userId) {
        const id = idFor(person.handle);
        if (id) person.userId = id;
      }
    });
  });
  (content.peerReviews || []).forEach((review) => {
    if (!review.fromUserId) {
      const id = idFor(review.from);
      if (id) review.fromUserId = id;
    }
    if (!review.toUserId) {
      const id = idFor(review.to);
      if (id) review.toUserId = id;
    }
  });
  return content;
}

function sameSeat(value, handle) {
  if (!value || !handle) return false;
  const left = personRecord(value);
  const right = personRecord(handle);
  if (left?.userId && right?.userId) return left.userId === right.userId;
  return norm(value) === norm(handle);
}

function finished(dateISO) {
  return !!dateISO && dateISO < new Date().toISOString().slice(0, 10);
}

export function seatsForHandle(content, handle) {
  const seats = [];
  (content?.venues || []).forEach((venue) => {
    (venue.tables || []).forEach((table) => {
      if (!finished(table.dateISO)) return;
      const host = sameSeat(table.hostUserId || table.hostHandle, handle);
      const joined = (table.participants || []).some((person) => sameSeat(person.userId || person.handle, handle));
      if (!host && !joined) return;
      seats.push({
        name: venue.name,
        date: table.dateISO,
        time: table.time,
        place: table.address || venue.locationLabel || "",
        image: venue.imageUrl || "",
        fallback: "",
        href: `/venues/${venue.id}`,
        venueId: venue.id,
        created: host,
        kind: table.kind === "quick" ? "quick" : "table",
      });
    });
  });
  (content?.events || []).forEach((event) => {
    if (!finished(event.dateISO)) return;
    const host = sameSeat(event.hostUserId || event.hostName, handle);
    const joined = (event.participants || []).some((person) => sameSeat(person.userId || person.handle, handle));
    if (!host && !joined) return;
    const venue = (content.venues || []).find((item) => item.id === event.venueId);
    seats.push({
      name: event.name,
      date: event.dateISO,
      time: event.timeLabel,
      place: event.location || "",
      image: event.gallery?.[0] || event.imageUrl || venue?.imageUrl || "",
      fallback: "",
      href: event.kind === "private" ? `/private/${event.id}` : (event.venueId ? `/venues/${event.venueId}` : ""),
      venueId: event.venueId || "",
      eventId: event.id,
      created: host,
      kind: event.kind,
    });
  });
  return seats;
}

export function statsForHandle(content, handle) {
  const stats = { joined: 0, invited: 0, quick: 0, privJoin: 0, privHost: 0 };
  seatsForHandle(content, handle).forEach((seat) => {
    if (seat.kind === "private") {
      if (seat.created) stats.privHost += 1;
      else stats.privJoin += 1;
    } else if (seat.kind === "quick") stats.quick += 1;
    else if (seat.created) stats.invited += 1;
    else stats.joined += 1;
  });
  return stats;
}

function addPerson(list, handle, role) {
  if (!Array.isArray(list)) return;
  if (list.some((person) => String(person?.handle || "").toLowerCase() === handle.toLowerCase())) return;
  list.push({ handle, role });
}

export function castForFounder(content, session) {
  if (!content || session?.role !== "founder") return content;
  const next = JSON.parse(JSON.stringify(content));
  const venue = (next.venues || []).find((item) => (item.tables || []).some((table) => table && !table.hidden));
  const table = venue?.tables?.find((item) => item && !item.hidden);
  if (table) {
    if (!Array.isArray(table.participants)) table.participants = [];
    addPerson(table.participants, "Aria", "guest");
    addPerson(table.participants, "Soren", "guest");
  }
  const night = (next.events || []).find((event) => event?.kind === "private" && !event.hidden);
  if (night) {
    if (!Array.isArray(night.participants)) night.participants = [];
    addPerson(night.participants, "Nico", "guest");
    addPerson(night.participants, "Aria", "guest");
  }
  const quicks = (next.events || []).filter((event) => event?.kind === "quick" && !event.hidden);
  const hostSeat = quicks.find((event) => !sameIdentity(event.hostUserId || event.hostName, session, { session }));
  if (hostSeat) {
    hostSeat.hostName = "Goldie";
    if (!Array.isArray(hostSeat.participants)) hostSeat.participants = [];
    addPerson(hostSeat.participants, "Goldie", "host");
    addPerson(hostSeat.participants, "Soren", "guest");
  }
  return next;
}
