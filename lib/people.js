import { SEED_ACCOUNTS } from "./defaults";

export const TEST_PEOPLE = [
  { id: "bb-test-aria", userId: "bb-test-aria", handle: "Aria", points: 120, neighborhood: "TST", occupation: "Bronze test", ageRange: "25-30", gender: "Woman", orientation: "Bi", test: true },
  { id: "bb-test-soren", userId: "bb-test-soren", handle: "Soren", points: 340, neighborhood: "Central", occupation: "Silver test", ageRange: "30-40", gender: "Man", orientation: "Gay", test: true },
  { id: "bb-test-goldie", userId: "bb-test-goldie", handle: "Goldie", points: 560, neighborhood: "CWB", occupation: "Gold test", ageRange: "30-40", gender: "Woman", orientation: "Lesbian", test: true },
  { id: "bb-test-nico", userId: "bb-test-nico", handle: "Nico", points: 0, neighborhood: "Soho", occupation: "No badge test", ageRange: "18-24", gender: "Non-binary", orientation: "Any", test: true },
];

const FIXTURES = [
  ...TEST_PEOPLE,
  { userId: "demo-mina", handle: "Mina", points: 340, neighborhood: "Central", occupation: "Wine", ageRange: "30-40" },
  { userId: "demo-bo", handle: "Bo", points: 120, neighborhood: "TST", occupation: "Design", ageRange: "25-30" },
  { userId: "demo-sam", handle: "Sam", points: 560, neighborhood: "CWB", occupation: "Host", ageRange: "30-40" },
  { userId: "demo-kenji", handle: "Kenji", points: 80, neighborhood: "CWB", occupation: "Comedy", ageRange: "30-40" },
  { userId: "demo-sora", handle: "Sora", points: 40, neighborhood: "Sheung Wan", occupation: "Film", ageRange: "25-30" },
  { userId: "demo-auntie", handle: "Auntie", points: 200, neighborhood: "Central", occupation: "Mahjong", ageRange: "50+" },
  { userId: "demo-matt", handle: "Matt", points: 90, neighborhood: "Central", occupation: "Kitchen", ageRange: "30-40" },
];

function norm(value) {
  return String(value || "").trim().toLowerCase();
}

function withoutSecret(account) {
  if (!account) return {};
  const { password, phone, previousHandles, ...safe } = account;
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

function accountId(ref) {
  if (!ref) return "";
  if (typeof ref === "object") return String(ref.userId || ref.accountId || "").trim();
  return String(ref).trim();
}

export function fixtureAccountId(label) {
  const key = norm(label);
  if (!key) return "";
  const ids = [
    ...SEED_ACCOUNTS.filter((item) => norm(item.handle) === key).map((item) => item.userId),
    ...FIXTURES.filter((item) => norm(item.handle) === key).map((item) => item.userId),
  ];
  const unique = [...new Set(ids)];
  return unique.length === 1 ? unique[0] : "";
}

export function directory({ session, users } = {}) {
  const profiles = readJson("bb_profile_v1");
  const points = readJson("bb_points_v1");
  const accounts = [];
  const seen = new Set();
  const push = (base) => {
    if (!base?.userId && !base?.email) return;
    const userId = base.userId || `acct_${norm(base.email).replace(/[^a-z0-9]+/g, "_")}`;
    if (seen.has(userId)) return;
    seen.add(userId);
    const profile = profiles[userId] || {};
    const listed = (users || []).find((user) => user?.userId === userId);
    const live = session?.userId && session.userId === userId ? session : null;
    const pointValue = live
      ? Number(live.points) || 0
      : Math.max(Number(points[userId]) || 0, Number(listed?.points) || 0, Number(base.points) || 0);
    accounts.push({
      ...withoutSecret(base),
      ...withoutSecret(listed),
      ...withoutSecret(profile),
      ...(live ? withoutSecret(live) : {}),
      userId,
      id: userId,
      email: base.email || live?.email || listed?.email || "",
      handle: live?.handle || profile.handle || listed?.handle || base.handle || "",
      points: pointValue,
    });
  };
  SEED_ACCOUNTS.forEach(push);
  FIXTURES.forEach(push);
  (users || []).forEach(push);
  if (session?.userId) push(session);
  return accounts;
}

export function personRecord(ref, ctx = {}) {
  const id = accountId(ref);
  if (!id) return null;
  const found = directory(ctx).find((item) => item.userId === id);
  return found || null;
}

export function presentedPerson(person, ctx = {}) {
  const id = accountId(person);
  const record = id ? personRecord(id, ctx) : null;
  if (record?.userId) return record;
  return { userId: "", handle: String(person?.handle || person?.name || "").trim(), points: 0 };
}

export function sameIdentity(ref, person) {
  const left = accountId(ref);
  const right = accountId(person);
  return !!(left && right && left === right);
}

function attachAccount(row, label) {
  if (!row || row.userId) return;
  const id = fixtureAccountId(label);
  if (id) row.userId = id;
}

export function stampContent(content) {
  if (!content) return content;
  (content.venues || []).forEach((venue) => {
    (venue.tables || []).forEach((table) => {
      if (!table) return;
      attachAccount(table, table.hostHandle);
      if (!table.hostUserId && table.userId) table.hostUserId = table.userId;
      if (table.hostUserId) delete table.userId;
      (table.participants || []).forEach((person) => attachAccount(person, person?.handle));
    });
  });
  (content.events || []).forEach((event) => {
    if (!event) return;
    if (!event.hostUserId) {
      const id = fixtureAccountId(event.hostName || event.hostProfile?.handle);
      if (id) event.hostUserId = id;
    }
    (event.participants || []).forEach((person) => attachAccount(person, person?.handle));
  });
  (content.peerReviews || []).forEach((review) => {
    if (!review.fromUserId) {
      const id = fixtureAccountId(review.from);
      if (id) review.fromUserId = id;
    }
    if (!review.toUserId) {
      const id = fixtureAccountId(review.to);
      if (id) review.toUserId = id;
    }
  });
  (content.reviews || []).forEach((review) => attachAccount(review, review?.handle));
  return content;
}

function finished(dateISO) {
  return !!dateISO && dateISO < new Date().toISOString().slice(0, 10);
}

export function seatsForHandle(content, accountIdValue) {
  const id = String(accountIdValue || "");
  const seats = [];
  if (!id) return seats;
  const isAccount = (value) => value === id;
  (content?.venues || []).forEach((venue) => {
    (venue.tables || []).forEach((table) => {
      if (!finished(table.dateISO)) return;
      const host = isAccount(table.hostUserId);
      const joined = (table.participants || []).some((person) => isAccount(person.userId));
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
    const host = isAccount(event.hostUserId);
    const joined = (event.participants || []).some((person) => isAccount(person.userId));
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

export function statsForHandle(content, accountIdValue) {
  const stats = { joined: 0, invited: 0, quick: 0, privJoin: 0, privHost: 0 };
  seatsForHandle(content, accountIdValue).forEach((seat) => {
    if (seat.kind === "private") {
      if (seat.created) stats.privHost += 1;
      else stats.privJoin += 1;
    } else if (seat.kind === "quick") stats.quick += 1;
    else if (seat.created) stats.invited += 1;
    else stats.joined += 1;
  });
  return stats;
}

function addPerson(list, userId, handle, role) {
  if (!Array.isArray(list) || !userId) return;
  if (list.some((person) => person?.userId === userId)) return;
  list.push({ userId, handle, role });
}

export function castForFounder(content, session) {
  if (!content || session?.role !== "founder") return content;
  const next = JSON.parse(JSON.stringify(content));
  const venue = (next.venues || []).find((item) => (item.tables || []).some((table) => table && !table.hidden));
  const table = venue?.tables?.find((item) => item && !item.hidden);
  if (table) {
    if (!Array.isArray(table.participants)) table.participants = [];
    addPerson(table.participants, "bb-test-aria", "Aria", "guest");
    addPerson(table.participants, "bb-test-soren", "Soren", "guest");
  }
  const night = (next.events || []).find((event) => event?.kind === "private" && !event.hidden);
  if (night) {
    if (!Array.isArray(night.participants)) night.participants = [];
    addPerson(night.participants, "bb-test-nico", "Nico", "guest");
    addPerson(night.participants, "bb-test-aria", "Aria", "guest");
  }
  const quicks = (next.events || []).filter((event) => event?.kind === "quick" && !event.hidden);
  const hostSeat = quicks.find((event) => event.hostUserId !== session?.userId);
  if (hostSeat) {
    hostSeat.hostUserId = "bb-test-goldie";
    hostSeat.hostName = "Goldie";
    if (!Array.isArray(hostSeat.participants)) hostSeat.participants = [];
    addPerson(hostSeat.participants, "bb-test-goldie", "Goldie", "host");
    addPerson(hostSeat.participants, "bb-test-soren", "Soren", "guest");
  }
  return next;
}

export function phoneDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

export function planPhoneChange({ accounts = [], profiles = {}, session, nextPhone }) {
  if (!session?.userId) return { error: "Log in first." };
  const phone = String(nextPhone || "").trim();
  const digits = phoneDigits(phone);
  if (digits.length < 8 || digits.length > 15) return { error: "Use a full number." };
  if (digits === phoneDigits(session.phone)) return { error: "That's already your number." };
  const taken = accounts.some((account) => {
    if (!account || account.userId === session.userId) return false;
    const saved = profiles[account.userId] || profiles[account.email] || {};
    return phoneDigits(saved.phone || account.phone) === digits;
  }) || Object.entries(profiles).some(([key, profile]) => {
    if (!profile || key === session.userId || key === session.email) return false;
    if (profile.userId && profile.userId === session.userId) return false;
    return phoneDigits(profile.phone) === digits;
  });
  if (taken) return { error: "That number is already on another account." };
  const extra = { ...(profiles[session.userId] || {}), phone, verified: true, userId: session.userId };
  const nextProfiles = { ...profiles, [session.userId]: extra };
  if (session.email) nextProfiles[session.email] = { ...extra };
  const nextAccounts = accounts.map((account) => (
    account?.userId === session.userId || (session.email && account?.email === session.email)
      ? { ...account, phone, verified: true, userId: account.userId || session.userId }
      : account
  ));
  return {
    ok: true,
    session: { ...session, phone, verified: true, userId: session.userId },
    profiles: nextProfiles,
    accounts: nextAccounts,
  };
}
