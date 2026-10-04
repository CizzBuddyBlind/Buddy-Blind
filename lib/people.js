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

function liveFor(email, { session, users } = {}) {
  if (session?.email && session.email === email) return session;
  return (users || []).find((user) => user?.email === email) || null;
}

export function personRecord(handle, ctx = {}) {
  const key = norm(handle);
  const shown = String(handle || "").trim();
  if (!key || key === "?" || key === "host") return null;
  const { session, users } = ctx;

  const seed = SEED_ACCOUNTS.find((item) => norm(item.handle) === key || norm(item.email) === key);
  if (seed) {
    const live = liveFor(seed.email, ctx);
    const points = Math.max(Number(live?.points) || 0, Number(seed.points) || 0);
    return { ...withoutSecret(seed), ...withoutSecret(live), id: seed.email, points, handle: live?.handle || seed.handle };
  }

  const live = [session, ...(users || [])].filter((person) => person && (norm(person.handle) === key || norm(person.email) === key || norm(person.id) === key));
  if (live.length) {
    const person = live.find((item) => item.email) || live[0];
    const owned = person.email ? SEED_ACCOUNTS.find((item) => item.email === person.email) : null;
    const points = Math.max(Number(person.points) || 0, Number(owned?.points) || 0);
    return { ...withoutSecret(owned), ...withoutSecret(person), id: person.email || person.id || key, points, handle: person.handle || shown };
  }

  const known = [...TEST_PEOPLE, ...DEMO_PEOPLE].find((item) => norm(item.handle) === key || norm(item.id) === key);
  if (known) return { ...known, id: known.id, points: Number(known.points) || 0, handle: known.handle };
  return { id: key, handle: shown, points: 0 };
}

export function samePerson(handle, person, ctx = {}) {
  if (!person) return false;
  const record = personRecord(handle, { session: ctx.session || person, users: ctx.users || [] });
  if (!record) return false;
  return record.id === (person.email || person.id);
}

function sameHandle(value, handle) {
  return String(value || "").trim().toLowerCase() === String(handle || "").trim().toLowerCase();
}

function finished(dateISO) {
  return !!dateISO && dateISO < new Date().toISOString().slice(0, 10);
}

export function seatsForHandle(content, handle) {
  const seats = [];
  (content?.venues || []).forEach((venue) => {
    (venue.tables || []).forEach((table) => {
      if (!finished(table.dateISO)) return;
      const host = sameHandle(table.hostHandle, handle);
      const joined = (table.participants || []).some((person) => sameHandle(person.handle, handle));
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
    const host = sameHandle(event.hostName, handle);
    const joined = (event.participants || []).some((person) => sameHandle(person.handle, handle));
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
  const hostSeat = quicks.find((event) => event.hostName !== session.handle) || quicks[0];
  if (hostSeat && hostSeat.hostName !== session.handle) {
    hostSeat.hostName = "Goldie";
    if (!Array.isArray(hostSeat.participants)) hostSeat.participants = [];
    addPerson(hostSeat.participants, "Goldie", "host");
    addPerson(hostSeat.participants, "Soren", "guest");
  }
  return next;
}
