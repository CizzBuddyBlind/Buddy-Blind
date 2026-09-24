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

export function adminFee() {
  return { base: ADMIN_FEE, off: 0, total: ADMIN_FEE };
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

function ensurePeople(table) {
  if (!table) return;
  if (!Array.isArray(table.participants)) table.participants = [];
  if (!Array.isArray(table.pings)) table.pings = [];
  if (table.hostHandle && !table.participants.some((p) => p.handle === table.hostHandle)) {
    table.participants.unshift({ handle: table.hostHandle, role: "host" });
  }
}

function applyDemoClock(venue) {
  const offset = venue.id === "yardbird" ? -10 : venue.id === "kissa-tanaka" ? 90 : venue.id === "lockcha" ? 20 : null;
  if (offset == null) return;
  (venue.tables || []).forEach((table) => {
    if (!table?.auto || table.slot !== "today") return;
    const start = new Date(Date.now() + offset * 60000);
    table.startAt = start.toISOString();
    table.time = new Intl.DateTimeFormat("en-HK", {
      timeZone: "Asia/Hong_Kong",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(start);
  });
}

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
    ensureTables(venue, today);
    applyDemoClock(venue);
    (venue.tables || []).forEach(ensurePeople);
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
  const joinStep = content.copy.how?.steps?.find((step) => step.n === "03");
  if (joinStep && /free/i.test(joinStep.body || "")) {
    joinStep.body = "INVITE and JOIN both open the HK$5 administration fee before the seat is confirmed. The fee is fixed and non-refundable.";
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
