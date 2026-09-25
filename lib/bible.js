/** Product rules from the Features Bible. Safe to run on the already-published site JSON. */

import { SEED } from "./defaults";

export const ADMIN_FEE = 5;
export const TRIAL_DAYS = 90;
export const OTP_DEMO = "248163";

export const AGE_RANGES = ["18–23", "25–30", "30–40", "40–50", "50+"];
export const TIMES = ["12:00 PM", "1:00 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM"];

function shiftISO(dateISO, days) {
  const [y, m, d] = String(dateISO || "").split("-").map(Number);
  if (!y || !m || !d) return "";
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function privateLockDate(dateISO) {
  return shiftISO(dateISO, -3);
}

/** True while the host may still edit. Locked from 3 days before the night, that day included. */
export function privateEditOpen(dateISO, now = new Date()) {
  const lock = privateLockDate(dateISO);
  if (!lock) return false;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return today < lock;
}
export const CUISINES = ["Japanese", "Chinese", "Italian", "Korean", "Western", "Seafood", "Tea", "Wine", "Café", "Bar", "Supper club"];

const DEMO_CONTACTS = {
  "kissa-tanaka": { phone: "+852 5551 2201", email: "bookings@kissatanaka.example", contactMethod: "whatsapp" },
  yardbird: { phone: "+852 5551 2202", email: "bookings@yardbird.example", contactMethod: "sms" },
  "la-cabane": { phone: "+852 5551 2203", email: "bookings@lacabane.example", contactMethod: "email" },
  lockcha: { phone: "+852 5551 2204", email: "bookings@lockcha.example", contactMethod: "whatsapp" },
  "private-kitchen-02": { phone: "+852 5551 2205", email: "bookings@pk02.example", contactMethod: "email" },
  "sai-kung-oyster": { phone: "+852 5551 2206", email: "bookings@oyster.example", contactMethod: "sms" },
};

export function iso(offset = 0, now = new Date()) {
  const base = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const d = new Date(`${base}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function weekday(isoDate) {
  return new Date(`${isoDate}T12:00:00`).getDay();
}

export function prettyDate(isoDate, lang = "en") {
  const d = new Date(`${isoDate}T12:00:00`);
  if (lang === "en") return d.toLocaleDateString("en-HK", { day: "numeric", month: "short", weekday: "short" });
  const weeks = ["日", "一", "二", "三", "四", "五", "六"];
  return `${d.getMonth() + 1}月${d.getDate()}日 週${weeks[d.getDay()]}`;
}

export function nextDays(count = 7, now = new Date()) {
  return Array.from({ length: count }, (_, i) => iso(i, now));
}

export function guessCuisine(typeLabel = "") {
  const s = String(typeLabel).toLowerCase();
  if (s.includes("japan") || s.includes("yakitori") || s.includes("kissa")) return "Japanese";
  if (s.includes("tea")) return "Tea";
  if (s.includes("wine")) return "Wine";
  if (s.includes("sea") || s.includes("oyster")) return "Seafood";
  if (s.includes("cafe") || s.includes("coffee")) return "Café";
  if (s.includes("bar")) return "Bar";
  if (s.includes("supper") || s.includes("kitchen")) return "Supper club";
  if (s.includes("chinese") || s.includes("dim sum")) return "Chinese";
  return "Western";
}

export function priceTierFromLabel(priceLabel = "") {
  const n = Number(String(priceLabel).replace(/[^\d]/g, "")) || 0;
  if (n >= 600) return "$$$$";
  if (n >= 400) return "$$$";
  if (n >= 250) return "$$";
  if (n > 0) return "$";
  return "$$";
}

export function areaFromText(text = "") {
  const s = String(text).toLowerCase();
  if (s.includes("cwb") || s.includes("causeway")) return "cwb";
  if (s.includes("tst") || s.includes("tsim") || s.includes("sai kung")) return "tst";
  if (s.includes("central") || s.includes("admiralty") || s.includes("sheung") || s.includes("soho")) return "central";
  return "";
}

export function tierFromPoints(points) {
  const n = Number(points) || 0;
  if (n >= 500) return "gold";
  if (n >= 300) return "silver";
  if (n >= 1) return "bronze";
  return "plain";
}

export function discountPercent(points, thresholds) {
  const n = Number(points) || 0;
  const safe = thresholds && typeof thresholds === "object" ? thresholds : {};
  const bronze = Number(safe.bronze) || 100;
  const silver = Number(safe.silver) || 300;
  const gold = Number(safe.gold) || 500;
  if (n >= gold) return 20;
  if (n >= silver) return 10;
  if (n >= bronze) return 5;
  return 0;
}

export function badgePaint(points, thresholds, plain = "dark") {
  const tier = tierFromPoints(points, thresholds);
  const paints = {
    gold: {
      backgroundColor: "#E6B325",
      backgroundImage: "linear-gradient(145deg, #fff6d4 0%, #f0d56a 20%, #c49212 48%, #fff1c2 60%, #e6c15a 100%)",
      color: "#1a1408",
    },
    silver: {
      backgroundColor: "#C5CED6",
      backgroundImage: "linear-gradient(145deg, #f7f8fa 0%, #d5dbe3 20%, #8d9aab 48%, #f3f5f7 60%, #b4bec8 100%)",
      color: "#1c2128",
    },
    bronze: {
      backgroundColor: "#D4782A",
      backgroundImage: "linear-gradient(145deg, #f6d7b0 0%, #e0a15c 20%, #8f4e1c 48%, #f0c48a 60%, #c4783a 100%)",
      color: "#1a1208",
    },
    light: { backgroundColor: "#f5f5f5", color: "#0a0a0a" },
    dark: { backgroundColor: "#262626", color: "#f6e7c1" },
  };
  const style = paints[tier] || paints[plain] || paints.dark;
  const className = tier === "plain" ? `bb-metal-plain-${plain}` : `bb-metal-${tier}`;
  return { tier, className, style };
}

export function adminFee(points = 0, thresholds) {
  const base = ADMIN_FEE;
  const percent = discountPercent(points, thresholds);
  const off = Math.round(base * percent) / 100;
  const total = Math.round((base - off) * 100) / 100;
  return { base, off, total, percent };
}

/** Proposed restaurant hold. Places shown to guests always match this hold. */
export function bookingHold(table, now = new Date()) {
  if (!table || typeof table !== "object") {
    return { days: 0, joined: 0, original: 0, held: 0, places: 0, closed: true, status: "walk-in", reason: "That table is gone." };
  }
  const today = iso(0, now);
  const days = Math.round((new Date(`${table.dateISO}T12:00:00Z`) - new Date(`${today}T12:00:00Z`)) / 86400000);
  const joined = Math.max(1, Number(table.joined) || 1);
  const original = Math.max(joined, Number(table.capacity) || 6);
  const started = now.getTime() >= tableStart(table).getTime();
  if (started && joined <= 1) {
    return {
      days, joined, original, held: 0, places: 0, closed: true, status: "walk-in",
      reason: "It's started with only the host. Walk-in now.",
    };
  }
  if (days <= 2 && joined <= 2) {
    const held = Math.min(original, 2);
    const places = Math.max(0, held - joined);
    return {
      days, joined, original, held, places, closed: places <= 0, status: "reserved",
      reason: places > 0 ? "Inside 2 days. Two seats can still be filled." : "Those two seats are filled.",
    };
  }
  let held = original;
  let reason = "More than 4 days out. The original booking stands.";
  if (days <= 4 && joined < 4) {
    held = Math.min(original, 4);
    reason = "Inside 4 days with fewer than 4 people. Hold drops to 4 seats.";
  } else if (days <= 4) {
    held = original;
    reason = "Inside 4 days with 4 or more people. Original size kept.";
  }
  const places = Math.max(0, held - joined);
  return {
    days, joined, original, held, places, closed: places <= 0, status: "reserved", reason,
  };
}

function demoContact(id) {
  return DEMO_CONTACTS[id] || { phone: "+852 5550 0199", email: "bookings@buddyblind.example", contactMethod: "email" };
}

function makeAuto(venue) {
  const oneSeat = (venue.spots || 0) !== 2;
  const capacity = oneSeat ? 4 : 6;
  const places = oneSeat ? 1 : 2;
  const joined = capacity - places;
  return {
    id: `${venue.id}-auto-oct26`,
    auto: true,
    slot: "night",
    dateISO: "2026-10-26",
    time: "7:00 PM",
    startAt: "2026-10-26T19:00:00+08:00",
    tableType: venue.id === "yardbird" ? "blind-date" : "meet-friends",
    capacity,
    joined,
    hostHandle: "CJ",
    hostTier: "gold",
    gender: "",
    orientation: venue.id === "la-cabane" ? "Gay" : venue.id === "lockcha" ? "Lesbian" : "",
    ageRange: "30–40",
    branchId: "main",
    area: venue.area || "central",
    address: venue.address || venue.locationLabel || "",
    inviteText: "CJ invites you to join a dinner and meet new friends.",
  };
}

const EXTRA_PHOTOS = {
  "kissa-tanaka": [
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=80",
  ],
  yardbird: [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
  ],
  "la-cabane": [
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80",
  ],
  lockcha: [
    "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=1200&q=80",
  ],
  "private-kitchen-02": [
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=1200&q=80",
  ],
  "sai-kung-oyster": [
    "https://images.unsplash.com/photo-1606756790138-261d2b21cd75?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  ],
};

function shortAddress(value) {
  return !/road|street|drive|hong kong/i.test(String(value || ""));
}

const STREET = {
  "kissa-tanaka": {
    main: "G/F, 18 Leighton Road, Causeway Bay, Hong Kong",
    central: "2/F, 42 Peel Street, Central, Hong Kong",
  },
  yardbird: { main: "G/F, 33-35 Bridges Street, Central, Hong Kong" },
  "la-cabane": { main: "Shop B, 12 Hau Fook Street, Tsim Sha Tsui, Hong Kong" },
  lockcha: { main: "G/F, Hong Kong Park, Cotton Tree Drive, Admiralty, Hong Kong" },
  "private-kitchen-02": { main: "3/F, 88 Hollywood Road, Sheung Wan, Hong Kong" },
  "sai-kung-oyster": { main: "1/F, 21 Hoi Pong Street, Sai Kung, Hong Kong" },
};

function ensurePeople(table) {
  if (!table) return;
  if (!Array.isArray(table.participants)) table.participants = [];
  if (!Array.isArray(table.pings)) table.pings = [];
  if (table.hostHandle && !table.participants.some((p) => p.handle === table.hostHandle)) {
    table.participants.unshift({ handle: table.hostHandle, role: "host", tier: table.hostTier || "bronze" });
  }
  if (table.joinersSeeded) return;
  const guests = [
    { handle: "Alex", tier: "bronze" },
    { handle: "Mina", tier: "silver" },
    { handle: "Bo", tier: "bronze" },
    { handle: "Sam", tier: "gold" },
  ];
  const wanted = Math.max(0, Math.min(4, (Number(table.joined) || 1) - 1));
  guests.slice(0, wanted).forEach((guest) => {
    if (!table.participants.some((p) => p.handle === guest.handle)) {
      table.participants.push({ handle: guest.handle, role: "guest", tier: guest.tier });
    }
  });
  table.joinersSeeded = true;
}

function applyDemoClock() {}

export function tableStart(table) {
  if (!table) return new Date();
  if (table.startAt) {
    const parsed = new Date(table.startAt);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  const match = String(table.time || table.timeLabel || "7:00 PM").match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  let hours = 19;
  let mins = 0;
  if (match) {
    hours = Number(match[1]) % 12;
    if (match[3].toUpperCase() === "PM") hours += 12;
    mins = Number(match[2]);
  }
  const day = table.dateISO || iso(0);
  return new Date(`${day}T${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:00+08:00`);
}

export function pingWindow(table, now = new Date()) {
  const start = tableStart(table).getTime();
  const diff = start - now.getTime();
  if (diff <= 2 * 60 * 60 * 1000 && diff > 0) return "see-you";
  if (diff <= 0 && -diff <= 30 * 60 * 1000) return "arrive";
  return null;
}

function ensureTables(venue, today) {
  const existing = Array.isArray(venue.tables) ? venue.tables : [];
  const manual = existing.filter((t) => t && !t.auto);
  const demo = existing.find((t) => t?.auto && t.dateISO === "2026-10-26" && t.time === "7:00 PM") || makeAuto(venue);
  venue.tables = [demo, ...manual].filter((t) => t && (!t.dateISO || t.dateISO >= today || t.auto));
}

export function normalizeContent(raw) {
  const content = raw && typeof raw === "object" ? raw : { copy: {}, venues: [], events: [] };
  if (!content.copy) content.copy = {};
  if (!content.copy.venues) content.copy.venues = {};
  if (!content.copy.quick) content.copy.quick = {};
  if (!content.copy.private) content.copy.private = {};
  if (typeof content.copy.private.sub === "string" && /photos coloured/i.test(content.copy.private.sub)) {
    content.copy.private.sub = "Host creates the reason. You find your kind.";
  }
  if (!content.copy.private.kickerRight || /tap|orange/i.test(content.copy.private.kickerRight)) {
    content.copy.private.kickerRight = "INTEREST → CONNECT";
  }
  if (content.copy.locales?.en?.["private.sub"] && /photos coloured/i.test(content.copy.locales.en["private.sub"])) {
    content.copy.locales.en["private.sub"] = "Host creates the reason. You find your kind.";
  }
  const venuesCopy = content.copy.venues;
  if (!venuesCopy.kickerLeft || /curated nightly/i.test(venuesCopy.kickerLeft)) venuesCopy.kickerLeft = "VENUES · RESTAURANTS";
  if (!venuesCopy.kickerRight || /6 open|6pm drop/i.test(venuesCopy.kickerRight)) venuesCopy.kickerRight = "A NEIGHBOURHOOD. A TIME. SEATS LEFT.";
  if (!venuesCopy.title || /don't know who/i.test(venuesCopy.title)) venuesCopy.title = "Pick the place.";
  if (!venuesCopy.accent || /that's the point/i.test(venuesCopy.accent)) venuesCopy.accent = "Leave the rest blind.";
  if (!venuesCopy.footer || /curated nightly|6pm/i.test(venuesCopy.footer)) venuesCopy.footer = "THE PLACES · COLOURED PHOTOS · THE TABLE STAYS BLIND";
  const enCopy = content.copy.locales?.en;
  if (enCopy) {
    if (/curated nightly/i.test(enCopy["hero.left"] || "")) enCopy["hero.left"] = "VENUES · RESTAURANTS";
    if (/6 open|6pm drop/i.test(enCopy["hero.right"] || "")) enCopy["hero.right"] = "A NEIGHBOURHOOD. A TIME. SEATS LEFT.";
    if (/don't know who/i.test(enCopy["hero.title"] || "")) enCopy["hero.title"] = "Pick the place.";
    if (/that's the point/i.test(enCopy["hero.accent"] || "")) enCopy["hero.accent"] = "Leave the rest blind.";
  }
  if (!content.events.some((event) => event?.kind === "quick")) {
    const quick = (SEED.events || []).filter((event) => event.kind === "quick");
    content.events = [...quick, ...content.events];
  }
  if (!content.copy.how) content.copy.how = { steps: [] };
  if (!Array.isArray(content.venues)) content.venues = [];
  if (!Array.isArray(content.events)) content.events = [];
  if (!Array.isArray(content.bookingLog)) content.bookingLog = [];
  const saved = content.pointThresholds || {};
  const legacy = !saved.bronze && Number(saved.silver) === 100;
  if (!saved.bronze || legacy || Number(saved.silver) < 300) {
    content.pointThresholds = { bronze: 100, silver: 300, gold: 500 };
  }
  const today = iso(0);

  content.venues.forEach((venue) => {
    if (!venue || !venue.id) return;
    if (!venue.cuisine) venue.cuisine = guessCuisine(venue.typeLabel);
    if (!venue.neighbourhood) venue.neighbourhood = String(venue.locationLabel || "").split("·")[0].trim();
    if (venue.phone == null || venue.email == null || venue.contactMethod == null) {
      const demo = demoContact(venue.id);
      if (venue.phone == null) venue.phone = demo.phone;
      if (venue.email == null) venue.email = demo.email;
      if (venue.contactMethod == null) venue.contactMethod = demo.contactMethod;
    }
    if (!venue.hours) venue.hours = "12:00 – 22:30";
    if (!venue.priceTier) venue.priceTier = priceTierFromLabel(venue.priceLabel);
    if (!venue.website) venue.website = "";
    if (venue.petFriendly == null) venue.petFriendly = venue.id === "lockcha" || venue.id === "sai-kung-oyster";
    if (!venue.goodFor) venue.goodFor = "Dinner · small groups · blind tables";
    if ((venue.galleryVersion || 0) < 2) {
      const extras = EXTRA_PHOTOS[venue.id] || [];
      venue.gallery = [...new Set([venue.imageUrl, ...(venue.gallery || []), ...extras].filter(Boolean))].slice(0, 6);
      venue.galleryVersion = 2;
    }
    if (!Array.isArray(venue.branches) || venue.branches.length === 0) {
      venue.branches = [{
        id: "main",
        label: String(venue.area || "HK").toUpperCase(),
        address: venue.address || venue.locationLabel || "Hong Kong",
        area: venue.area || "central",
      }];
    }
    if (venue.id === "kissa-tanaka" && venue.branches.length === 1 && !venue.multiSeeded) {
      venue.branches.push({ id: "central", label: "CENTRAL", address: "Central · Peel Street", area: "central" });
      venue.multiSeeded = true;
    }
    const streets = STREET[venue.id];
    if (streets) {
      venue.branches.forEach((branch) => {
        const next = streets[branch.id] || (branch.id === "main" ? streets.main : "");
        if (next && shortAddress(branch.address)) branch.address = next;
      });
      if (streets.main && shortAddress(venue.address)) venue.address = streets.main;
    }
    ensureTables(venue, today);
    if (venue.id === "kissa-tanaka") {
      let feature = venue.tables.find((table) => table?.id === "kissa-home-feature");
      if (!feature) {
        feature = { id: "kissa-home-feature" };
        venue.tables = [feature, ...venue.tables];
      }
      const joined = Math.max(48, Number(feature.joined) || 0);
      Object.assign(feature, {
        dateISO: today,
        time: "7:30 PM",
        startAt: `${today}T19:30:00+08:00`,
        tableType: "meet-friends",
        slot: "night",
        capacity: joined + 3,
        joined,
        hostHandle: "CJ",
        hostTier: "gold",
        gender: "",
        orientation: "",
        ageRange: "",
        branchId: "main",
        area: "central",
        address: "Soho, Hong Kong",
        inviteText: "CJ invites you to join a dinner and meet new friends — no pitches, just presence.",
        homeCard: {
          when: "SOHO · TONIGHT 7:30PM",
          spots: "3 SPOTS LEFT",
          host: "HOST: COMEDIAN · GOLD",
          letter: "C",
          chip: "$$ · CREATIVE MINDS",
          meta: "SOHO · KISSATEN · HOST CREATES ATTRACTION AND DOWNLOAD REASONS",
          invite: "CJ INVITES YOU TO JOIN A DINNER AND MEET NEW FRIENDS — NO PITCHES, JUST PRESENCE.",
          about: "A 6-seat counter, vinyl crackle, no menus. You order by mood. Tonight is for people who collect stories, not contacts. No pitches, just presence.",
          foot: "Terms and conditions apply",
        },
      });
    }
    applyDemoClock(venue);
    (venue.tables || []).forEach(ensurePeople);
  });

  let featured = false;
  content.events.forEach((event, index) => {
    if (!event) return;
    if (event.kind === "quick") {
      if (!event.area) event.area = areaFromText(`${event.timeLabel || ""} ${event.name || ""}`);
      const hosts = [
        { hostName: "CJ", hostTier: "gold" },
        { hostName: "Alex", hostTier: "bronze" },
        { hostName: "Mina", hostTier: "silver" },
        { hostName: "Bo", hostTier: "bronze" },
        { hostName: "Sam", hostTier: "gold" },
      ];
      if (!event.hostName) Object.assign(event, hosts[index % hosts.length]);
    }
    if (event.kind === "private") {
      if (!event.dateISO) event.dateISO = iso(7 + (index % 10));
      if (!event.timeLabel) event.timeLabel = "7:00 PM";
      if (!event.location) event.location = "Hong Kong";
      if (!event.hostName) {
        event.hostName = String(event.hostLabel || "Host").replace(/^Blind with\s+/i, "");
      }
      if (!event.description) event.description = event.typeLabel || "";
      if (!event.forWhom) event.forWhom = event.typeLabel || "People who share this interest";
      if (!event.capacity) event.capacity = 20;
      if (event.joined == null) event.joined = Math.max(1, (event.capacity || 20) - (event.spots || 1));
      if (!event.ageRange) event.ageRange = "";
      if (event.videoUrl == null) event.videoUrl = "";
      if (event.showHostPhoto == null) event.showHostPhoto = false;
      if (!Array.isArray(event.participants)) event.participants = [];
      if (!Array.isArray(event.pings)) event.pings = [];
      if (event.hostName && !event.participants.some((p) => p.handle === event.hostName)) {
        event.participants.unshift({ handle: event.hostName, role: "host" });
      }
      if (event.featured) featured = true;
    }
  });
  if (!featured) {
    const first = content.events.find((e) => e.kind === "private");
    if (first) first.featured = true;
  }
  const how = content.copy?.how;
  if (how?.steps?.length) {
    const blob = `${how.kicker || ""} ${how.sub || ""} ${how.steps.map((step) => step.body || "").join(" ")}`;
    if (/kissaten|administration fee|5% off|non-refundable|FEATURES BIBLE/i.test(blob)) {
      how.kicker = "HOW IT WORKS";
      how.title = "How it";
      how.accent = "works.";
      how.sub = "A place. A time. Someone new.";
      how.steps = [
        { n: "01", title: "See a place", body: "A photo, a time, seats left. No faces." },
        { n: "02", title: "Want to go", body: "Enough to want the night. Not who you'll meet." },
        { n: "03", title: "Join or invite", body: "Take a seat, or open the table. The fee shows when you confirm." },
        { n: "04", title: "Show up", body: "Same time. Same table. Still blind." },
        { n: "05", title: "Sit down", body: "Eat. Talk. Find out who." },
        { n: "06", title: "Leave a line", body: "Optional. Short. “On time.” “Knows wine.”" },
        { n: "07", title: "Points stay quiet", body: "They change your badge. Not the price." },
      ];
    }
  }
  return content;
}

export function tablePrefs(table) {
  return [table.tableType === "blind-date" ? "Blind date" : table.tableType === "meet-friends" ? "Meet friends" : "", table.gender, table.orientation, table.ageRange]
    .filter(Boolean)
    .join(" · ");
}

const QUERY_GROUPS = [
  ["chinese", "中餐", "中菜", "中式", "中国菜", "中國菜", "粵", "粤", "茶餐廳", "茶餐厅"],
  ["japanese", "日本", "日式", "日料", "壽司", "寿司"],
  ["korean", "韓國", "韩国", "韓式", "韩式"],
  ["italian", "意大利", "意式"],
  ["seafood", "海鮮", "海鲜", "蠔", "蚝", "魚", "鱼"],
  ["wine", "酒", "紅酒", "红酒", "葡萄酒"],
  ["tea", "茶", "喝茶"],
  ["café", "cafe", "咖啡", "coffee"],
  ["bar", "酒吧"],
  ["tonight", "今晚", "今夜", "今日晚上"],
  ["today", "今天", "今日"],
  ["upcoming", "即將", "即将", "之後", "之后"],
  ["gay", "男同", "同志"],
  ["lesbian", "女同"],
  ["dating", "約會", "约会", "相親", "相亲", "blind date", "盲約", "盲约"],
  ["central", "中環", "中环", "上環", "上环"],
  ["cwb", "銅鑼灣", "铜锣湾", "causeway"],
  ["tst", "尖沙咀", "尖沙嘴"],
  ["western", "西餐", "西式"],
  ["supper", "supper club", "私房", "私房菜"],
  ["friends", "朋友", "meet friends", "交友"],
  ["mahjong", "麻雀", "麻將", "麻将"],
  ["networking", "交流", "商聚", "networking"],
  ["hiking", "行山", "徒步"],
];

const SEARCH_NOISE = new Set(["a", "the", "for", "and", "or", "of", "food", "cuisine", "event", "events", "restaurant", "table", "的", "了"]);

function tokenHits(blob, token) {
  if (blob.includes(token)) return true;
  return QUERY_GROUPS.some((group) => {
    const words = group.map((word) => word.toLowerCase());
    const asked = words.some((word) => token === word || (token.length >= 2 && (token.includes(word) || word.includes(token))));
    if (!asked) return false;
    return words.some((word) => blob.includes(word));
  });
}

export function queryHits(text, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return true;
  const blob = String(text || "").toLowerCase();
  const tokens = q.split(/\s+/).filter((token) => token && !SEARCH_NOISE.has(token));
  if (!tokens.length) return true;
  return tokens.every((token) => tokenHits(blob, token));
}

export function soonestTable(venue, now = new Date()) {
  const today = iso(0, now);
  const rows = (venue.tables || [])
    .map((table) => ({ table, hold: bookingHold(table, now) }))
    .filter((row) => row.table.dateISO >= today && row.hold.status !== "walk-in" && row.hold.places > 0)
    .sort((a, b) => (a.table.dateISO + a.table.time).localeCompare(b.table.dateISO + b.table.time));
  return rows;
}

export function logEntry({ venue, table, hold, action, host, method }) {
  return {
    id: `log-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    at: new Date().toISOString(),
    action,
    venue: venue.name,
    phone: venue.phone || "",
    email: venue.email || "",
    method: method || venue.contactMethod || "email",
    dateISO: table.dateISO,
    time: table.time,
    host: host || table.hostHandle || "",
    participants: hold.joined,
    held: hold.held,
    original: hold.original,
    status: "pending",
    reason: hold.reason,
    channelNote: "Not sent yet.",
  };
}
