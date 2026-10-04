import { SEED_ACCOUNTS } from "./defaults";

export const TEST_PEOPLE = [
  { id: "bb-test-aria", handle: "Aria", points: 120, neighborhood: "TST", occupation: "Bronze test", ageRange: "25-30", gender: "Woman", orientation: "Bi", test: true },
  { id: "bb-test-soren", handle: "Soren", points: 340, neighborhood: "Central", occupation: "Silver test", ageRange: "30-40", gender: "Man", orientation: "Gay", test: true },
  { id: "bb-test-goldie", handle: "Goldie", points: 560, neighborhood: "CWB", occupation: "Gold test", ageRange: "30-40", gender: "Woman", orientation: "Lesbian", test: true },
  { id: "bb-test-nico", handle: "Nico", points: 0, neighborhood: "Soho", occupation: "No badge test", ageRange: "18-24", gender: "Non-binary", orientation: "Any", test: true },
];

function sameName(person, key) {
  return [person?.handle, person?.username, person?.name].some((value) => String(value || "").trim().toLowerCase() === key);
}

export function personRecord(handle, { session, users } = {}) {
  const key = String(handle || "").trim().toLowerCase();
  if (!key || key === "?" || key === "host") return null;
  if (session && sameName(session, key)) {
    return { ...session, id: session.id || session.email || session.handle, points: Number(session.points) || 0 };
  }
  const user = (users || []).find((item) => sameName(item, key));
  if (user) return { ...user, points: Number(user.points) || 0 };
  const seed = SEED_ACCOUNTS.find((item) => sameName(item, key));
  if (seed) return { ...seed, id: seed.email, points: Number(seed.points) || 0 };
  const test = TEST_PEOPLE.find((item) => sameName(item, key));
  if (test) return { ...test, points: Number(test.points) || 0 };
  return { id: key, handle: String(handle).trim(), points: 0 };
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
