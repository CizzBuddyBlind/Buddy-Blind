"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useBB } from "@/components/Providers";
import { fileToCover } from "@/components/Bits";
import { CUISINES } from "@/lib/bible";
import { DICT, EXTRA } from "@/lib/i18n";
import { say } from "@/lib/say";
import { MARKETS, annualDiscount, yearlyQuote } from "@/lib/market";

const EMPTY = {
  name: "",
  cuisine: "Western",
  neighbourhood: "",
  address: "",
  phone: "",
  email: "",
  contactMethod: "whatsapp",
  about: "",
  photos: [],
};

function ContactPick({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {[
        ["sms", "SMS"],
        ["whatsapp", "WhatsApp"],
      ].map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`rounded-full px-4 py-2 text-sm ${value === id ? "bg-white font-semibold text-black" : "border border-white/20 text-white/70"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function restaurantFields(form) {
  return {
    name: form.name.trim(),
    cuisine: form.cuisine.trim() || "Western",
    typeLabel: form.cuisine.trim() || "Restaurant",
    neighbourhood: form.neighbourhood.trim(),
    locationLabel: form.neighbourhood.trim(),
    address: form.address.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    contactMethod: form.contactMethod === "sms" ? "sms" : "whatsapp",
    about: form.about.trim(),
  };
}

const SECTIONS = [
  "ALL PAGES",
  "HOME",
  "VENUES",
  "QUICK MEET",
  "PRIVATE",
  "ME TIME",
  "PROFILE",
  "PLAN",
  "ABOUT US",
  "HOW",
  "REGISTER",
  "BUTTONS",
  "POPUP WINDOWS",
];

function addLine(rows, seen, page, english) {
  const text = String(english || "").replace(/\r/g, "").trim();
  if (!text || !/[A-Za-z0-9\u3400-\u9fff]/.test(text)) return;
  if (/HK\$|NZ\$|AU\$/.test(text)) return;
  const id = `${page}\u0000${text}`;
  if (seen.has(id) || seen.has(text)) return;
  seen.add(id);
  seen.add(text);
  rows.push({ page, english: text });
}

function fromKey(rows, seen, page, key) {
  addLine(rows, seen, page, DICT.en?.[key] || EXTRA.en?.[key] || "");
}

function siteLines(content) {
  const rows = [];
  const seen = new Set();
  const venues = content?.copy?.venues || {};
  const quick = content?.copy?.quick || {};
  const night = content?.copy?.private || {};
  [
    "Venues",
    "Quick",
    "Private",
    "Me Time",
    "Plan",
    "Profile",
    "About us",
    "Login",
    "Log out",
    "left",
  ].forEach((line) => addLine(rows, seen, "ALL PAGES", line));
  [
    "You don't know",
    "who you'll meet.",
    "That's the point.",
    "Restaurants provide the scene. Private events create the reason. You bring curiosity.",
    "Total events",
    "Scenes tonight",
    "Avg after-talk rating",
    "Featured tonight · One blind box open",
    "Tonight",
    "blind boxes",
    "hosts",
    "scenes",
    "No table open yet.",
    "See the venues",
  ].forEach((line) => addLine(rows, seen, "HOME", line));
  ["kickerLeft", "kickerRight", "title", "accent"].forEach((key) => addLine(rows, seen, "VENUES", venues[key]));
  addLine(rows, seen, "VENUES", String(venues.sub || "").trim() || "No faces, just places.\nEnough to WANT, enough uncertainty to be WORTH having.");
  ["Search tonight, 中菜, Central, gay, wine…"].forEach((line) => addLine(rows, seen, "VENUES", line));
  ["spots", "venue.pet", "empty.filter", "filter.more", "filter.nearby", "filter.cuisine", "filter.any", "filter.central", "filter.cwb", "filter.tst", "venue.events", "venue.good"].forEach((key) => fromKey(rows, seen, "VENUES", key));
  ["title", "accent", "note"].forEach((key) => addLine(rows, seen, "QUICK MEET", quick[key]));
  [
    "Quick meet",
    "A seat nearby. A time. No bio, no swipe. If you're free, sit down.",
    "Nearby, today",
    "Coffee, lunch, or a drink",
    "Join a seat, or open one",
    "Where are you?",
    "Nearby",
    "Share your location? We only use it to show places near you.",
    "Nothing there. Try another area.",
  ].forEach((line) => addLine(rows, seen, "QUICK MEET", line));
  ["kickerLeft", "kickerRight", "title", "accent", "sub"].forEach((key) => addLine(rows, seen, "PRIVATE", night[key]));
  ["priv.campaign", "priv.search", "priv.full", "priv.premium"].forEach((key) => fromKey(rows, seen, "PRIVATE", key));
  [
    "Today, and",
    "what’s next.",
    "Log in to see the seats you joined.",
    "Seats you joined",
    "Today",
    "Upcoming",
    "None yet.",
    "Loading…",
  ].forEach((line) => addLine(rows, seen, "ME TIME", line));
  [
    "Log in to see your seat.",
    "Info",
    "Buddies",
    "Review",
    "Joined",
    "Invited",
    "Private joined",
    "Private hosted",
    "No buddies yet.",
    "No comments yet.",
    "No one to rate yet. It opens an hour after you sit down together.",
    "points",
    "Lives in",
    "Work",
    "Show gender, age, and orientation",
    "Show where I live and work",
  ].forEach((line) => addLine(rows, seen, "PROFILE", line));
  [
    "Subscription",
    "【真】O傾",
    "由O開始",
    "Your reason.",
    "New people.",
    "Host the vibe you care about — or join one. Guests stay blind.",
    "Wine, work, a hike. Or whatever you care about.",
    "Free",
    "Try once",
    "Lite",
    "Per month",
    "Premium",
    "Per month · 90 days trial",
    "1 blind box / month",
    "Venues only",
    "No private creation",
    "5 blind boxes / month",
    "Join private events",
    "Create quick meet",
    "Unlimited blind boxes",
    "Create private up to 20",
    "Industry / wine / 50+ social / hike",
    "Host badge gold",
  ].forEach((line) => addLine(rows, seen, "PLAN", line));
  [
    "The restaurant is the setting.",
    "The people are the experience.",
    "The conversation is the point.",
    "Buddy Blind is built on one simple idea: meet people without knowing exactly who you’re going to meet.",
    "You choose the time, the place, and how many seats. You know enough to decide you want to go — but you don’t get to pre-select who sits with you. That uncertainty isn’t a bug. It’s the product. We call it the Blind Box.",
    "Show up. Talk. Discover who they are through a real meal — not a profile, not a swipe, and not endless scrolling beforehand.",
    "Buddy Blind is not a dating app. It’s a way to get more real interaction back into everyday life: dinner, lunch near work, a drink after — planned in the app, lived at the table.",
  ].forEach((line) => addLine(rows, seen, "ABOUT US", line));
  [
    "How it works",
    "See venue, see vibe",
    "Take a seat.",
    "See the place",
    "The photo is the filter. A restaurant, or a private night. Like the room, you’ll like the night.",
    "See enough",
    "Neighbourhood, time, seats left. Soho tonight or Central tomorrow. No faces. Enough to want it.",
    "Take a seat",
    "Show up",
    "No names before. No photos before. The restaurant is the scene. You bring the vibe.",
    "After the meal",
    "Stars aren’t about looks. A short line is your reputation. Your voice matters.",
    "Add a buddy",
    "Hey, you’re my vibe. One tap. If they say yes too, you’re buddies.",
    "Host the reason",
    "Premium. A private night, up to 20. Wine, social, a hike. You make the reason.",
    "Points change the circle",
    "Not the price. Join adds 1. Invite adds 2. Host adds 5. Enjoy the discount.",
    "Bronze",
    "Silver",
    "Gold",
    "100 points",
    "300 points",
    "500 points",
  ].forEach((line) => addLine(rows, seen, "HOW", line));
  ["Email", "Username", "Gender", "Age range", "Orientation", "Password", "Code"].forEach((line) => addLine(rows, seen, "REGISTER", line));
  ["reg.name", "reg.sent", "reg.otp", "reg.bad", "reg.card", "reg.optional", "reg.login"].forEach((key) => fromKey(rows, seen, "REGISTER", key));
  [
    "INVITE",
    "JOIN",
    "Host",
    "Share",
    "Go back",
    "Continue",
    "Close",
    "Confirm",
    "Confirm & Pay",
    "Confirm seat",
    "Save",
    "Edit details",
    "I'm free now",
    "Not now",
    "Want a Quick Meet?",
    "Love it. Let's do this.",
    "Explore more",
    "Go Premium",
    "Upgrade to Lite",
    "Upgrade plan",
    "I'll invite",
    "Create a private event",
    "Create account",
    "Send code",
    "Log in",
  ].forEach((line) => addLine(rows, seen, "BUTTONS", line));
  ["btn.invite", "btn.join", "btn.host", "btn.share", "btn.back", "btn.next", "btn.close", "btn.confirm"].forEach((key) => fromKey(rows, seen, "BUTTONS", key));
  ["pay.admin", "pay.total", "pay.why", "pay.check", "pay.freeCheck", "pay.confirm", "pay.confirmFree", "pay.free", "pay.card", "empty.inviteTitle", "empty.inviteBody", "empty.inviteCta", "leave.title", "leave.body", "step.location", "step.date", "step.time", "step.type", "step.people", "step.prefs", "step.summary", "step.pay", "adult.note", "trial.kicker", "trial.body", "trial.note", "trial.start", "trial.card", "ping.seeYou", "ping.areYou", "ping.needJoin", "ping.wait"].forEach((key) => fromKey(rows, seen, "POPUP WINDOWS", key));
  ["MONTHLY", "YEARLY — SAVE {n}%", "SAVE {n}% WITH AN ANNUAL PAYMENT", "/month", "/year"].forEach((line) => addLine(rows, seen, "POPUP WINDOWS", line));
  return rows;
}

function savedLine(bag, row) {
  const collapsed = row.english.replace(/\s+/g, " ").trim();
  const pick = (source) => {
    if (!source || typeof source !== "object") return null;
    if (typeof source[row.english] === "string") return source[row.english];
    if (typeof source[collapsed] === "string") return source[collapsed];
    const nested = Object.entries(source).find(([key, value]) => typeof value === "string" && key.replace(/\s+/g, " ").trim() === collapsed);
    return nested ? nested[1] : null;
  };
  const own = pick(bag?.[row.page]);
  if (own != null) return own;
  if (!bag || typeof bag !== "object") return null;
  for (const value of Object.values(bag)) {
    const hit = pick(value);
    if (hit != null) return hit;
  }
  return null;
}

function PremiumBilling({ bb }) {
  const saved = annualDiscount(bb.content?.billing?.annualDiscount);
  const [value, setValue] = useState(String(saved));
  const [busy, setBusy] = useState(false);
  const discount = annualDiscount(value);
  async function save() {
    setBusy(true);
    const next = bb.update((draft) => {
      draft.billing = { ...(draft.billing || {}), annualDiscount: discount };
    });
    await bb.publish(next);
    setBusy(false);
  }
  return (
    <section data-keep className="max-w-xl">
      <h1 className="font-serif text-5xl">Premium</h1>
      <p className="mt-2 text-sm text-mute">One Premium plan. This only changes the yearly payment. Monthly stays the same. Lite is not affected.</p>
      <label className="mt-6 block text-sm">
        Annual discount %
        <input value={value} onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, "").slice(0, 2))} inputMode="numeric" className="mt-2 block w-28 rounded-xl border border-white/15 bg-card px-4 py-3 text-sm text-fg" />
      </label>
      <div className="mt-4 grid gap-2 text-sm text-white/70">
        {["HK", "NZ", "AU"].map((id) => {
          const quote = yearlyQuote(MARKETS[id].premium, discount);
          return <p key={id}>{id}: {quote.monthly}/month or {quote.yearly}/year. Save {quote.saved}.</p>;
        })}
      </div>
      <p className="mt-3 text-xs text-white/40">The yearly charge is one payment for 12 months, not a cheaper monthly charge. {"{n}"} in the popup wording is this percentage.</p>
      <button type="button" onClick={save} disabled={busy} className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black disabled:opacity-50">{busy ? "Saving…" : "Save"}</button>
    </section>
  );
}

function WordingEditor({ bb }) {
  const [lang, setLang] = useState("zh-HK");
  const [page, setPage] = useState("ALL PAGES");
  const [query, setQuery] = useState("");
  const [edits, setEdits] = useState({});
  const [busy, setBusy] = useState(false);
  const bag = bb.content?.wording?.[lang] || {};
  const live = useMemo(() => siteLines(bb.content), [bb.content]);
  const pages = useMemo(() => SECTIONS.filter((name) => live.some((row) => row.page === name)), [live]);
  const lines = useMemo(() => {
    const q = query.trim().toLowerCase();
    return live
      .filter((row) => row.page === page)
      .filter((row) => !q || row.english.toLowerCase().includes(q) || String(savedLine(bag, row) || "").toLowerCase().includes(q));
  }, [query, lang, page, bag, live]);

  function shown(row) {
    const id = `${row.page}\u0000${row.english}`;
    if (Object.prototype.hasOwnProperty.call(edits, id)) return edits[id];
    const saved = savedLine(bag, row);
    if (saved != null) return saved;
    if (lang === "en") return row.english;
    return "";
  }

  async function save() {
    setBusy(true);
    const next = bb.update((draft) => {
      if (!draft.wording) draft.wording = { en: {}, zh: {}, "zh-HK": {} };
      if (!draft.wording.en) draft.wording.en = {};
      if (!draft.wording[lang] || typeof draft.wording[lang] !== "object") draft.wording[lang] = {};
      Object.entries(edits).forEach(([id, value]) => {
        const cut = id.indexOf("\u0000");
        const editPage = id.slice(0, cut);
        const english = id.slice(cut + 1);
        const clean = String(value ?? "");
        const names = {
          "ALL PAGES": ["ALL PAGES", "Shared"],
          HOME: ["HOME", "Home"],
          VENUES: ["VENUES", "Venues"],
          "QUICK MEET": ["QUICK MEET", "Quick"],
          PRIVATE: ["PRIVATE", "Private"],
          "ME TIME": ["ME TIME", "Me Time"],
          PROFILE: ["PROFILE", "Profile"],
          PLAN: ["PLAN", "Plan"],
          "ABOUT US": ["ABOUT US", "About"],
          HOW: ["HOW", "How"],
          REGISTER: ["REGISTER", "Account"],
          BUTTONS: ["BUTTONS"],
          "POPUP WINDOWS": ["POPUP WINDOWS"],
        }[editPage] || [editPage];
        names.forEach((name) => {
          if (!draft.wording[lang][name] || typeof draft.wording[lang][name] !== "object") draft.wording[lang][name] = {};
          draft.wording[lang][name][english] = clean;
        });
      });
    });
    const saved = await bb.publish(next);
    setBusy(false);
    if (saved?.ok) {
      try {
        const cache = JSON.parse(localStorage.getItem("bb_tr") || "{}");
        Object.keys(edits).forEach((id) => {
          const english = id.slice(id.indexOf("\u0000") + 1).trim();
          delete cache[`zh\n${english}`];
          delete cache[`zh-HK\n${english}`];
        });
        localStorage.setItem("bb_tr", JSON.stringify(cache));
      } catch { /* the saved line still wins */ }
      setEdits({});
    }
  }

  return (
    <section data-keep>
      <h1 className="font-serif text-5xl">Wording</h1>
      <p className="mt-2 max-w-xl text-sm text-mute">One page at a time. English, Traditional, and Simplified stay separate. Leave a box empty and save it. That line stays blank.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          ["en", "EN English"],
          ["zh-HK", "繁 Traditional"],
          ["zh", "简 Simplified"],
        ].map(([id, label]) => (
          <button key={id} type="button" onClick={() => { setLang(id); setEdits({}); }} className={`rounded-full px-4 py-2 text-sm ${lang === id ? "bg-ember font-semibold text-[#1a1408]" : "border border-white/20 text-white/70"}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {pages.map((name) => (
          <button key={name} type="button" onClick={() => setPage(name)} className={`rounded-full px-3 py-1.5 text-xs ${page === name ? "bg-white font-semibold text-black" : "border border-white/15 text-white/70"}`}>
            {name}
          </button>
        ))}
      </div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this page" className="mt-4 w-full max-w-xl rounded-xl border border-white/15 bg-card px-4 py-3 text-sm text-fg" />
      <div className="mt-4 grid max-w-3xl gap-3">
        {lines.map((row) => (
          <label key={`${row.page}\u0000${row.english}`} className="grid gap-1">
            <span className="whitespace-pre-line text-xs text-white/45">{row.english}</span>
            <textarea value={shown(row)} onChange={(e) => setEdits((prev) => ({ ...prev, [`${row.page}\u0000${row.english}`]: e.target.value }))} rows={row.english.includes("\n") ? 4 : 2} className="rounded-xl border border-white/15 bg-card px-4 py-2 text-sm text-fg" />
          </label>
        ))}
      </div>
      <button type="button" onClick={save} disabled={busy || !Object.keys(edits).length} className="mt-4 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black disabled:opacity-50">
        {busy ? "Saving…" : "Save and update"}
      </button>
    </section>
  );
}

export default function AdminPage() {
  const bb = useBB();
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("restaurants");
  const venues = bb.content?.venues || [];

  if (!bb.ready) {
    return (
      <main className="bb-frame py-20">
        <p className="text-sm text-mute">…</p>
      </main>
    );
  }
  if (bb.session?.role !== "admin" && bb.session?.role !== "founder") {
    return (
      <main data-keep className="bb-frame py-20">
        <h1 className="font-serif text-4xl">{say(bb.lang, "Restaurants")}</h1>
        <p className="mt-3 text-sm text-mute">{say(bb.lang, "Log in with an admin account to add or edit a restaurant.")}</p>
      </main>
    );
  }

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function add(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setBusy(true);
    const id = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `venue-${Date.now().toString(36)}`;
    const fields = restaurantFields(form);
    bb.update((draft) => {
      draft.venues = draft.venues.filter((venue) => venue.id !== id);
      draft.venues.unshift({
        id,
        ...fields,
        priceTier: "$$",
        priceLabel: "",
        hours: "",
        timeLabel: "",
        spots: 4,
        area: "central",
        tonight: false,
        locked: false,
        hidden: false,
        imageUrl: form.photos[0] || "",
        gallery: form.photos,
        imageAlt: fields.name,
      });
    });
    await bb.publish();
    setForm(EMPTY);
    setBusy(false);
  }

  async function remove(id) {
    bb.update((draft) => {
      draft.venues = draft.venues.filter((venue) => venue.id !== id);
    });
    await bb.publish();
  }

  return (
    <main data-keep className="bb-frame pb-28 pt-10 md:pb-16">
      <p className="text-[0.72rem] uppercase tracking-[0.2em] text-ember">Admin</p>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={() => setMode("restaurants")} className={`rounded-full px-4 py-2 text-sm ${mode === "restaurants" ? "bg-white font-semibold text-black" : "border border-white/20 text-white/70"}`}>Restaurants</button>
        <button type="button" onClick={() => setMode("wording")} className={`rounded-full px-4 py-2 text-sm ${mode === "wording" ? "bg-white font-semibold text-black" : "border border-white/20 text-white/70"}`}>All pages</button>
        <button type="button" onClick={() => setMode("premium")} className={`rounded-full px-4 py-2 text-sm ${mode === "premium" ? "bg-white font-semibold text-black" : "border border-white/20 text-white/70"}`}>Premium</button>
      </div>
      {mode === "premium" ? <div className="mt-8"><PremiumBilling bb={bb} /></div> : mode === "wording" ? <div className="mt-8"><WordingEditor bb={bb} /></div> : (
      <>
      <h1 className="mt-8 font-serif text-5xl">{say(bb.lang, "Restaurants")}</h1>
      <form onSubmit={add} className="mt-8 grid max-w-xl gap-3">
        <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={say(bb.lang, "Restaurant name")} className="rounded-xl border border-white/15 bg-card px-4 py-3 text-sm text-fg" required />
        <select value={form.cuisine} onChange={(e) => set("cuisine", e.target.value)} className="rounded-xl border border-white/15 bg-card px-4 py-3 text-sm text-fg">
          {CUISINES.map((item) => <option key={item} value={item}>{say(bb.lang, item)}</option>)}
        </select>
        <input value={form.neighbourhood} onChange={(e) => set("neighbourhood", e.target.value)} placeholder={say(bb.lang, "Neighbourhood")} className="rounded-xl border border-white/15 bg-card px-4 py-3 text-sm text-fg" />
        <input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder={say(bb.lang, "Full address")} className="rounded-xl border border-white/15 bg-card px-4 py-3 text-sm text-fg" />
        <input value={form.email} onChange={(e) => set("email", e.target.value)} type="email" placeholder={say(bb.lang, "Email")} className="rounded-xl border border-white/15 bg-card px-4 py-3 text-sm text-fg" />
        <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder={say(bb.lang, "Phone")} className="rounded-xl border border-white/15 bg-card px-4 py-3 text-sm text-fg" />
        <ContactPick value={form.contactMethod} onChange={(contactMethod) => set("contactMethod", contactMethod)} />
        <textarea value={form.about} onChange={(e) => set("about", e.target.value)} placeholder={say(bb.lang, "Description")} rows={4} className="rounded-xl border border-white/15 bg-card px-4 py-3 text-sm text-fg" />
        <label className="text-sm text-mute">
          {say(bb.lang, "Photos")}
          <input type="file" accept="image/*" multiple className="mt-2 block text-sm" onChange={async (e) => {
            const files = [...(e.target.files || [])];
            const photos = [];
            for (const file of files) photos.push(await fileToCover(file));
            setForm((prev) => ({ ...prev, photos: [...prev.photos, ...photos].slice(0, 8) }));
          }} />
        </label>
        {form.photos.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {form.photos.map((src, index) => <img key={`${index}-${String(src).length}`} src={src} alt="" className="h-16 w-20 rounded-lg object-cover" />)}
          </div>
        )}
        <button type="submit" disabled={busy} className="rounded-full bg-white py-3 text-sm font-semibold text-black disabled:opacity-60">
          {say(bb.lang, busy ? "Saving…" : "Add restaurant")}
        </button>
      </form>
      <ul className="mt-10 max-w-xl divide-y divide-white/10">
        {venues.map((venue) => (
          <li key={venue.id} className="flex items-center gap-4 py-3">
            <Link href={`/admin/${venue.id}`} className="min-w-0 flex-1">
              <p data-keep>{venue.name}</p>
              <p className="truncate text-xs text-mute">{venue.neighbourhood || venue.locationLabel}{venue.address ? ` · ${venue.address}` : ""}</p>
            </Link>
            <button type="button" onClick={() => remove(venue.id)} className="text-xs uppercase tracking-[0.14em] text-ember">{say(bb.lang, "Delete")}</button>
          </li>
        ))}
      </ul>
      </>
      )}
    </main>
  );
}
