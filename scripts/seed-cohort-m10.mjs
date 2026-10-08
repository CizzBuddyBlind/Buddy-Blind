import { createClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "fs";

const COHORT = "bb-manual-10";
const DOC = "__bb_published__";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
if (!url || !key) {
  console.error("Missing Supabase env.");
  process.exit(1);
}

const PEOPLE = {
  alex: { userId: "bb-m10-alex", handle: "Alex Chan", tier: "plain", gender: "Man", orientation: "Straight", ageRange: "25–30", neighborhood: "Sheung Wan", occupation: "Architect" },
  ben: { userId: "bb-m10-ben", handle: "Ben", tier: "bronze", gender: "Man", orientation: "Gay", ageRange: "30–40", neighborhood: "Central", occupation: "Editor" },
  cathy: { userId: "bb-m10-cathy", handle: "Cathy", tier: "silver", gender: "Woman", orientation: "Lesbian", ageRange: "25–30", neighborhood: "Causeway Bay", occupation: "Florist" },
  david: { userId: "bb-m10-david", handle: "David", tier: "gold", gender: "Man", orientation: "Straight", ageRange: "40–50", neighborhood: "Sai Kung", occupation: "Chef" },
  emily: { userId: "bb-m10-emily", handle: "Emily", tier: "plain", gender: "Woman", orientation: "Straight", ageRange: "18–23", neighborhood: "Tsim Sha Tsui", occupation: "Student" },
  frank: { userId: "bb-m10-frank", handle: "Frank", tier: "bronze", gender: "Man", orientation: "Bi", ageRange: "30–40", neighborhood: "Admiralty", occupation: "Lawyer" },
  grace: { userId: "bb-m10-grace", handle: "Grace", tier: "silver", gender: "Woman", orientation: "Bi", ageRange: "30–40", neighborhood: "Kennedy Town", occupation: "Designer" },
  henry: { userId: "bb-m10-henry", handle: "Henry", tier: "bronze", gender: "Man", orientation: "Gay", ageRange: "50+", neighborhood: "Mid-Levels", occupation: "Teacher" },
  ivy: { userId: "bb-m10-ivy", handle: "Ivy", tier: "plain", gender: "Woman", orientation: "Straight", ageRange: "25–30", neighborhood: "Wan Chai", occupation: "Photographer" },
  jack: { userId: "bb-m10-jack", handle: "Jack", tier: "gold", gender: "Non-binary", orientation: "Bi", ageRange: "18–23", neighborhood: "Sham Shui Po", occupation: "Musician" },
};

function hkDay(offset) {
  const now = new Date(Date.now() + offset * 86400000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Hong_Kong", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

function person(id, role) {
  const who = PEOPLE[id];
  return { userId: who.userId, handle: who.handle, role, tier: who.tier };
}

function table({ id, host, guests, capacity, dateISO, time, quick, post, gender, orientation, ageRange, venue }) {
  const people = [person(host, "host"), ...guests.map((guest) => person(guest, "guest"))];
  return {
    id,
    auto: false,
    quick: !!quick,
    dateISO,
    time,
    startAt: startAt(dateISO, time),
    openedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    tableType: "meet-friends",
    capacity,
    joined: people.length,
    hostUserId: PEOPLE[host].userId,
    hostHandle: PEOPLE[host].handle,
    hostTier: PEOPLE[host].tier,
    gender: gender || "",
    orientation: orientation || "",
    ageRange: ageRange || "",
    branchId: venue.branches?.[0]?.id || "main",
    area: venue.area || "",
    address: venue.branches?.[0]?.address || venue.address || venue.locationLabel || "Hong Kong",
    inviteText: `${PEOPLE[host].handle} invites you to join a dinner and meet new friends.`,
    participants: people,
    pings: [],
    joinersSeeded: true,
    cohort: COHORT,
    ...(quick ? { post } : {}),
  };
}

function startAt(dateISO, time) {
  const match = String(time).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  let hours = 19;
  let mins = 0;
  if (match) {
    hours = Number(match[1]) % 12;
    if (match[3].toUpperCase() === "PM") hours += 12;
    mins = Number(match[2]);
  }
  return `${dateISO}T${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:00+08:00`;
}

function own({ id, host, guests, capacity, dateISO, time, name, address, area, post, gender, orientation, ageRange }) {
  const people = [person(host, "host"), ...guests.map((guest) => person(guest, "guest"))];
  return {
    id,
    kind: "quick",
    source: "own",
    cohort: COHORT,
    name,
    post,
    typeLabel: "NOW",
    time,
    timeLabel: `${dateISO} · ${time}`,
    dateISO,
    address,
    area,
    detail: address,
    spots: Math.max(0, capacity - people.length),
    capacity,
    originalCapacity: capacity,
    tableType: "meet-friends",
    gender: gender || "",
    orientation: orientation || "",
    ageRange: ageRange || "",
    hidden: false,
    joinClosed: people.length >= capacity,
    hostUserId: PEOPLE[host].userId,
    hostHandle: PEOPLE[host].handle,
    hostName: PEOPLE[host].handle,
    hostTier: PEOPLE[host].tier,
    participants: people,
    pings: [],
  };
}

function night({ id, host, guests, capacity, dateISO, time, name, location, description, aboutHost, forWhom, gender, orientation, ageRange, imageUrl }) {
  const people = [person(host, "host"), ...guests.map((guest) => person(guest, "guest"))];
  const who = PEOPLE[host];
  return {
    id,
    kind: "private",
    cohort: COHORT,
    name,
    typeLabel: forWhom,
    hostLabel: `Blind with ${who.handle}`,
    hostUserId: who.userId,
    hostName: who.handle,
    hostTier: who.tier,
    upcomingLabel: `${Math.max(0, capacity - people.length)} places`,
    spots: Math.max(0, capacity - people.length),
    joined: people.length,
    capacity,
    hidden: false,
    featured: false,
    dateISO,
    timeLabel: time,
    location,
    description,
    aboutHost,
    hostProfile: {
      handle: who.handle,
      ageRange: who.ageRange,
      gender: who.gender,
      orientation: who.orientation,
      neighborhood: who.neighborhood,
      occupation: who.occupation,
    },
    forWhom,
    orientation: orientation || "",
    gender: gender || "",
    ageRange: ageRange || "",
    videoUrl: "",
    showHostPhoto: false,
    imageUrl,
    gallery: [imageUrl],
    participants: people,
    pings: [],
  };
}

const supabase = createClient(url, key);
const { data, error } = await supabase.from("venues").select("id,invite_text,created_at").eq("name", DOC).order("created_at", { ascending: false }).limit(1);
if (error || !data?.[0]?.invite_text) {
  console.error(error || "No published document.");
  process.exit(1);
}
const row = data[0];
const original = row.invite_text;
const content = JSON.parse(original);
mkdirSync("/tmp/bb-backups", { recursive: true });
const backupPath = `/tmp/bb-backups/bb-published-before-m10-${Date.now()}.json`;
writeFileSync(backupPath, JSON.stringify({ id: row.id, created_at: row.created_at, invite_text: original }));

const existingIds = new Set();
for (const venue of content.venues || []) {
  for (const item of venue.tables || []) if (item?.id) existingIds.add(item.id);
}
for (const event of content.events || []) if (event?.id) existingIds.add(event.id);
if ([...existingIds].some((id) => String(id).startsWith("bbm-"))) {
  console.error("Cohort rows already exist. Not writing again.");
  process.exit(2);
}

const day = (n) => hkDay(n);
const venueBy = Object.fromEntries((content.venues || []).map((venue) => [venue.id, venue]));
const need = ["yardbird", "lockcha", "sai-kung-oyster", "private-kitchen-02", "kissa-tanaka", "la-cabane"];
for (const id of need) {
  if (!venueBy[id]) {
    console.error(`Missing venue ${id}`);
    process.exit(1);
  }
}

const photos = {
  dimsum: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80",
  oyster: "https://images.unsplash.com/photo-1606756790138-261d2b21cd75?auto=format&fit=crop&w=1200&q=80",
  law: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
  film: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80",
};

const tables = [
  table({ id: "bbm-inv-yardbird-open", host: "ben", guests: ["cathy"], capacity: 4, dateISO: day(5), time: "7:30 PM", venue: venueBy.yardbird, gender: "", orientation: "Gay", ageRange: "30–40" }),
  table({ id: "bbm-inv-lockcha-open", host: "emily", guests: [], capacity: 4, dateISO: day(6), time: "12:00 PM", venue: venueBy.lockcha, gender: "", orientation: "", ageRange: "18–23" }),
  table({ id: "bbm-inv-oyster-full", host: "david", guests: ["alex", "ivy", "jack"], capacity: 4, dateISO: day(4), time: "12:00 PM", venue: venueBy["sai-kung-oyster"], gender: "", orientation: "Straight", ageRange: "" }),
  table({ id: "bbm-inv-kitchen-open", host: "frank", guests: ["grace", "henry"], capacity: 6, dateISO: day(6), time: "8:00 PM", venue: venueBy["private-kitchen-02"], gender: "", orientation: "", ageRange: "30–40" }),
  table({ id: "bbm-pq-kissa-open", host: "cathy", guests: [], capacity: 2, dateISO: day(5), time: "1:00 PM", quick: true, post: "Counter seat. Coffee. Nowhere to be after.", venue: venueBy["kissa-tanaka"], gender: "Women", orientation: "Lesbian", ageRange: "25–30" }),
  table({ id: "bbm-pq-cabane-full", host: "alex", guests: ["ben"], capacity: 2, dateISO: day(6), time: "6:30 PM", quick: true, post: "One bottle, two seats. Already both of us.", venue: venueBy["la-cabane"], gender: "", orientation: "Straight", ageRange: "" }),
  table({ id: "bbm-pq-yardbird-open", host: "ivy", guests: [], capacity: 2, dateISO: day(4), time: "8:00 PM", quick: true, post: "After work. Yakitori. One seat left.", venue: venueBy.yardbird, gender: "", orientation: "", ageRange: "25–30" }),
];

const events = [
  own({ id: "bbm-own-kam-open", host: "jack", guests: [], capacity: 4, dateISO: day(5), time: "7:00 PM", name: "Kam's Roast Goose", address: "G/F, 226 Queen's Road East, Wan Chai, Hong Kong", area: "Wan Chai", post: "Roast goose, four seats, come hungry.", gender: "", orientation: "", ageRange: "18–23" }),
  own({ id: "bbm-own-lanfong-joined", host: "grace", guests: ["emily"], capacity: 3, dateISO: day(3), time: "8:30 PM", name: "Lan Fong Yuen", address: "G/F, 2 Gage Street, Central, Hong Kong", area: "Central", post: "Milk tea and a booth. One seat still open.", gender: "", orientation: "LGBTQ+", ageRange: "" }),
  own({ id: "bbm-own-adc-full", host: "henry", guests: ["frank"], capacity: 2, dateISO: day(2), time: "8:00 PM", name: "Australia Dairy Company", address: "G/F, 47-49 Parkes Street, Jordan, Hong Kong", area: "Jordan", post: "Scrambled eggs, two seats. We are both in.", gender: "Men", orientation: "Gay", ageRange: "30–40" }),
  own({ id: "bbm-own-sheko-open", host: "emily", guests: [], capacity: 2, dateISO: day(6), time: "1:00 PM", name: "Cape Cafe", address: "Shek O Road, Shek O, Hong Kong", area: "Shek O", post: "Sea wall, lunch, one seat beside me.", orientation: "Straight", ageRange: "18–23" }),
  night({ id: "bbm-priv-dimsum", host: "cathy", guests: ["alex", "ben"], capacity: 8, dateISO: day(5), time: "11:00 AM", name: "Sunday dim sum", location: "Lin Heung Kui, Sheung Wan", description: "A loud hall and a quiet table. No speeches.", aboutHost: "I arrange flowers during the week and dim sum on Sunday.", forWhom: "Anyone who likes a noisy hall", imageUrl: photos.dimsum }),
  night({ id: "bbm-priv-oyster-full", host: "david", guests: ["ivy", "jack", "grace"], capacity: 4, dateISO: day(4), time: "1:00 PM", name: "Four at the pier", location: "A borrowed table, Sai Kung waterfront", description: "Four seats. The bucket of ice is the whole plan.", aboutHost: "I cook for a living. This one is just oysters and shade.", forWhom: "People who like the water", gender: "", orientation: "", ageRange: "", imageUrl: photos.oyster }),
  night({ id: "bbm-priv-lawyers", host: "frank", guests: [], capacity: 10, dateISO: day(6), time: "7:30 PM", name: "Case notes and noodles", location: "A room above Hollywood Road", description: "Lawyers, pupils, and anyone who reads judgments for fun. No pitching.", aboutHost: "I read cases on the tram and would rather talk about them over noodles.", forWhom: "Law and the people around it", imageUrl: photos.law }),
  night({ id: "bbm-priv-film", host: "grace", guests: ["henry"], capacity: 6, dateISO: day(3), time: "6:00 PM", name: "Stills and supper", location: "A screening room in North Point", description: "One film, six seats, supper after. Come for the picture, not a profile.", aboutHost: "I design by day and sit in the dark when I can.", forWhom: "People who stay for the credits", imageUrl: photos.film }),
];

for (const item of tables) {
  const venue = (content.venues || []).find((entry) => (entry.tables || []).some((row) => row?.id === item.id) || entry.id === (
    item.id.includes("yardbird") ? "yardbird"
      : item.id.includes("lockcha") ? "lockcha"
        : item.id.includes("oyster") ? "sai-kung-oyster"
          : item.id.includes("kitchen") ? "private-kitchen-02"
            : item.id.includes("kissa") ? "kissa-tanaka"
              : "la-cabane"
  ));
  const targetId = item.id.includes("yardbird") ? "yardbird"
    : item.id.includes("lockcha") ? "lockcha"
      : item.id.includes("oyster") ? "sai-kung-oyster"
        : item.id.includes("kitchen") ? "private-kitchen-02"
          : item.id.includes("kissa") ? "kissa-tanaka"
            : "la-cabane";
  const target = content.venues.find((entry) => entry.id === targetId);
  target.tables = [...(target.tables || []), item];
}
content.events = [...(content.events || []), ...events];

const candidate = JSON.stringify(content);
writeFileSync("/tmp/bb-backups/cohort-m10-candidate.json", candidate);
writeFileSync("/tmp/bb-backups/cohort-m10-backup-path.txt", backupPath);

if (process.argv.includes("--write")) {
  const again = await supabase.from("venues").select("invite_text").eq("id", row.id).limit(1);
  if (again.error || again.data?.[0]?.invite_text !== original) {
    console.error("The live document changed after the backup. Not writing.");
    process.exit(3);
  }
  const { error: updateError } = await supabase.from("venues").update({ invite_text: candidate, location: "site-document", places_left: 0 }).eq("id", row.id);
  if (updateError) {
    console.error(updateError);
    process.exit(1);
  }
  const check = await supabase.from("venues").select("invite_text").eq("id", row.id).limit(1);
  const saved = JSON.parse(check.data[0].invite_text);
  const savedIds = new Set();
  for (const venue of saved.venues || []) for (const item of venue.tables || []) if (item?.id) savedIds.add(item.id);
  for (const event of saved.events || []) if (event?.id) savedIds.add(event.id);
  const missingOld = [...existingIds].filter((id) => !savedIds.has(id));
  const missingNew = [...tables.map((item) => item.id), ...events.map((item) => item.id)].filter((id) => !savedIds.has(id));
  if (missingOld.length || missingNew.length) {
    console.error(JSON.stringify({ missingOld, missingNew }));
    process.exit(4);
  }
  console.log(JSON.stringify({ ok: true, docId: row.id, backupPath, addedTables: tables.length, addedEvents: events.length, eventCount: saved.events.length }, null, 2));
} else {
  console.log(JSON.stringify({ ready: true, docId: row.id, backupPath, bytes: candidate.length, tables: tables.map((item) => item.id), events: events.map((item) => item.id) }, null, 2));
}
