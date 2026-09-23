/** Product rules from the Features Bible. Safe to run on the already-published site JSON. */

export const ADMIN_FEE = 5;
export const TRIAL_DAYS = 90;
export const OTP_DEMO = "248163";

export const AGE_RANGES = ["18–23", "25–30", "30–40", "40–50", "50+"];
export const TIMES = ["12:00 PM", "1:00 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM"];
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

export function tierFromPoints(points, thresholds = {}) {
  const silver = Number(thresholds.silver) || 100;
  const gold = Number(thresholds.gold) || 500;
  if (points >= gold) return "gold";
  if (points >= silver) return "silver";
  return "bronze";
}

export function adminFee(points) {
  const base = ADMIN_FEE;
  let off = 0;
  if (points >= 500) off = 0.2;
  else if (points >= 300) off = 0.1;
  else if (points >= 100) off = 0.05;
  const total = Math.round(base * (1 - off) * 100) / 100;
  return { base, off, total };
}

/** Proposed restaurant hold. Places shown to guests always match this hold. */
export function bookingHold(table, now = new Date()) {
  const today = iso(0, now);
  const days = Math.round((new Date(`${table.dateISO}T12:00:00Z`) - new Date(`${today}T12:00:00Z`)) / 86400000);
  const joined = Math.max(1, Number(table.joined) || 1);
  const original = Math.max(joined, Number(table.capacity) || 6);
  if (days <= 0 && joined <= 1) {
    return {
      days, joined, original, held: 0, places: 0, closed: true, status: "walk-in",
      reason: "Event day and only the inviter is in. The restaurant is told not to hold the table. Walk-in.",
    };
  }
  if (days <= 2 && joined <= 2) {
    const held = Math.min(original, 2);
    return {
      days, joined, original, held, places: 0, closed: true, status: "reserved",
      reason: "Two days out with only 1–2 people. Hold drops to 2 seats and further joins close.",
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

function makeAuto(venue, slot) {
  const tonightish = !!(venue.tonight || /tonight|today|now/i.test(venue.timeLabel || ""));
  if (slot === "today" && !tonightish) return null;
  const oneSeat = (venue.spots || 0) !== 2;
  const capacity = oneSeat ? 4 : 6;
  const places = oneSeat ? 1 : 2;
  const joined = capacity - places;
  return {
    id: `${venue.id}-auto-${slot}`,
    auto: true,
    slot,
    dateISO: slot === "today" ? iso(0) : iso(5),
    time: slot === "today" ? "7:00 PM" : "7:30 PM",
    tableType: venue.id === "yardbird" || slot === "soon" ? "blind-date" : "meet-friends",
    capacity,
    joined,
    hostHandle: "CJ",
    hostTier: "gold",
    gender: slot === "today" ? "Women" : "",
    orientation: venue.id === "la-cabane" ? "Gay" : venue.id === "lockcha" ? "Lesbian" : "",
    ageRange: "30–40",
    branchId: "main",
    area: venue.area || "central",
    address: venue.address || venue.locationLabel || "",
    inviteText: "CJ invites you to join a dinner and meet new friends.",
  };
}

function ensureTables(venue, today) {
  const existing = Array.isArray(venue.tables) ? venue.tables : [];
  const manual = existing.filter((t) => t && !t.auto);
  const keep = (slot) => {
    const found = existing.find((t) => t?.auto && t.slot === slot && t.dateISO >= today);
    return found || makeAuto(venue, slot);
  };
  venue.tables = [keep("today"), keep("soon"), ...manual].filter(Boolean);
}

export function normalizeContent(raw) {
  const content = raw && typeof raw === "object" ? raw : { copy: {}, venues: [], events: [] };
  if (!content.copy) content.copy = {};
  if (!content.copy.venues) content.copy.venues = {};
  if (!content.copy.quick) content.copy.quick = {};
  if (!content.copy.private) content.copy.private = {};
  if (!content.copy.how) content.copy.how = { steps: [] };
  if (!Array.isArray(content.venues)) content.venues = [];
  if (!Array.isArray(content.events)) content.events = [];
  if (!Array.isArray(content.bookingLog)) content.bookingLog = [];
  if (!content.pointThresholds) content.pointThresholds = { silver: 100, gold: 500 };
  const today = iso(0);

  content.venues.forEach((venue) => {
    if (!venue || !venue.id) return;
    if (!venue.cuisine) venue.cuisine = guessCuisine(venue.typeLabel);
    if (venue.address == null) venue.address = venue.locationLabel || "";
    if (venue.phone == null || venue.email == null || venue.contactMethod == null) {
      const demo = demoContact(venue.id);
      if (venue.phone == null) venue.phone = demo.phone;
      if (venue.email == null) venue.email = demo.email;
      if (venue.contactMethod == null) venue.contactMethod = demo.contactMethod;
    }
    if (!venue.hours) venue.hours = "12:00 – 22:30";
    if (!venue.priceTier) venue.priceTier = priceTierFromLabel(venue.priceLabel);
    if (!venue.website) venue.website = "";
    if (!Array.isArray(venue.gallery) || venue.gallery.length === 0) {
      venue.gallery = [venue.imageUrl].filter(Boolean);
    }
    if (!Array.isArray(venue.branches) || venue.branches.length === 0) {
      venue.branches = [{
        id: "main",
        label: String(venue.area || "HK").toUpperCase(),
        address: venue.address || venue.locationLabel || "Hong Kong",
        area: venue.area || "central",
      }];
    }
    ensureTables(venue, today);
  });

  let featured = false;
  content.events.forEach((event, index) => {
    if (!event) return;
    if (event.kind === "quick") {
      if (!event.area) event.area = areaFromText(`${event.timeLabel || ""} ${event.name || ""}`);
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
      if (event.featured) featured = true;
    }
  });
  if (!featured) {
    const first = content.events.find((e) => e.kind === "private");
    if (first) first.featured = true;
  }
  return content;
}

export function tablePrefs(table) {
  return [table.tableType === "blind-date" ? "Blind date" : table.tableType === "meet-friends" ? "Meet friends" : "", table.gender, table.orientation, table.ageRange]
    .filter(Boolean)
    .join(" · ");
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
    channelNote: "Queued for the restaurant. Email, SMS, and WhatsApp are not connected, so this stays in the booking log.",
  };
}
