"use client";

import { useEffect, useMemo, useState } from "react";
import { Photo } from "./Bits";
import { HostBadge, PayDialog } from "./Flows";
import { useBB, peopleYouCanRate } from "./Providers";
import { badgePaint, bookingHold, discountPercent, eventPhotos, eventPoster, iso, soonestTable, tableStart } from "@/lib/bible";

const HOW = [
  ["01", "See the place", "The photo is the filter. A restaurant, or a private night. Like the room, you’ll like the night."],
  ["02", "See enough", "Neighbourhood, time, seats left. Soho tonight or Central tomorrow. No faces. Enough to want it."],
  ["03", "Take a seat", "Join, or open the table. HK$5 only when you confirm. That’s for trust, not the meal."],
  ["04", "Show up", "No names before. No photos before. The restaurant is the scene. You bring the vibe."],
  ["05", "After the meal", "Stars aren’t about looks. A short line is your reputation. Your voice matters."],
  ["06", "Add a buddy", "Hey, you’re my vibe. One tap. If they say yes too, you’re buddies."],
  ["07", "Host the reason", "Premium. A private night, up to 20. Wine, social, a hike. You make the reason."],
  ["08", "Points change the circle", "Not the price. Join adds 1. Invite adds 2. Host adds 5. Enjoy the discount."],
];

function initials(session) {
  const name = String(session?.handle || session?.username || "").trim();
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  if (parts.length === 1 && parts[0][0]) return parts[0][0].toUpperCase();
  return "";
}

function upcoming(content) {
  const today = iso(0);
  const rows = [];
  (content.venues || []).forEach((venue) => {
    if (!venue || venue.hidden) return;
    (venue.tables || []).forEach((table) => {
      if (!table?.dateISO || table.dateISO < today) return;
      const hold = bookingHold(table);
      if (hold.status === "walk-in" || hold.closed) return;
      rows.push({ kind: "table", id: table.id, venue, table, joined: hold.joined, when: tableStart(table).getTime(), name: venue.name, image: venue.imageUrl, host: table.hostHandle, tier: table.hostTier });
    });
  });
  (content.events || []).forEach((event) => {
    if (!event || event.hidden || event.kind === "quick") return;
    if (event.dateISO && event.dateISO < today) return;
    if (Number(event.spots) <= 0) return;
    rows.push({
      kind: "private",
      id: event.id,
      event,
      joined: Math.max(1, Number(event.joined) || (event.participants || []).length || 1),
      when: event.dateISO ? new Date(`${event.dateISO}T12:00:00+08:00`).getTime() : Number.MAX_SAFE_INTEGER,
      name: event.name,
      image: eventPhotos(event)[0] || event.imageUrl,
      host: event.hostName,
      tier: event.hostTier,
    });
  });
  rows.sort((a, b) => b.joined - a.joined || a.when - b.when);
  return rows;
}

function Joiners({ people, host }) {
  const list = (people || []).filter((person) => person?.handle && person.handle !== host && person.role !== "host");
  if (!list.length) return null;
  return (
    <span className="inline-flex items-center">
      {list.slice(0, 3).map((person) => (
        <span key={person.handle} className="-ml-1 first:ml-0">
          <HostBadge handle={person.handle} tier={person.tier || "bronze"} size="joiner" />
        </span>
      ))}
      {list.length > 3 && <span className="ml-1 text-[10px]">+</span>}
    </span>
  );
}

function Icon({ tab }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", "aria-hidden": true };
  if (tab === "venues") return <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="6" y="6" width="12" height="12" rx="2.5" /></svg>;
  if (tab === "quick") return <svg {...common} fill="currentColor"><path d="M15.2 3.1A8.4 8.4 0 1 0 21 14.2 6.8 6.8 0 0 1 15.2 3.1z" /></svg>;
  if (tab === "private") return <svg {...common} fill="currentColor"><rect x="7" y="4.5" width="3" height="15" rx="0.8" /><rect x="14" y="4.5" width="3" height="15" rx="0.8" /></svg>;
  return <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="6" y="4" width="12" height="16" rx="2" /><path d="M9 9h6M9 12h6M9 15h4" /></svg>;
}

export function StoreApp() {
  const bb = useBB();
  const [tab, setTab] = useState("home");
  const [venueId, setVenueId] = useState("");
  const [eventId, setEventId] = useState("");
  const [menu, setMenu] = useState(false);
  const [notes, setNotes] = useState(false);
  const [auth, setAuth] = useState(false);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const light = tab === "quick" || tab === "private";
  const mark = initials(bb.session);
  const paint = bb.session ? badgePaint(bb.session.points, bb.content?.pointThresholds, "dark") : null;
  const unread = (bb.social?.notes || []).filter((n) => !n.read).length;

  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get("tab");
    if (next) setTab(next);
  }, []);

  useEffect(() => {
    if (bb.session?.role === "admin" || bb.session?.role === "founder") {
      bb.logout();
      bb.notify("Admin login stays on the website.");
    }
  }, [bb.session?.role]);

  function go(next) {
    setTab(next);
    setVenueId("");
    setEventId("");
    setMenu(false);
    setNotes(false);
  }

  const navOn = tab !== "home" && !venueId && !eventId ? tab : tab;

  return (
    <div className={`bb-store ${light && !venueId && !eventId ? "bg-paper text-char" : "bg-ink text-fg"}`}>
      <header className="z-20 flex shrink-0 items-center justify-between bg-[#f4f1ea] px-[4.5vw] py-3 text-char">
        <button type="button" onClick={() => go("home")}>
          <span className="bb-word text-[0.95rem] tracking-[0.16em]">BUDDY BLIND</span>
        </button>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="Language"
            onClick={() => {
              const order = ["en", "zh-HK", "zh"];
              const index = order.indexOf(bb.lang);
              bb.setLang(order[(index + 1) % order.length] || "en");
            }}
            className="grid h-9 min-w-9 place-items-center rounded-full border border-black/20 px-2 text-xs font-semibold"
          >
            {bb.lang === "zh-HK" ? "繁" : bb.lang === "zh" ? "简" : "EN"}
          </button>
          <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-black text-sm font-semibold text-white" onClick={() => { setNotes((v) => !v); setMenu(false); }}>
            {unread || 0}
          </button>
          <button
            type="button"
            className={`grid h-9 w-9 place-items-center rounded-full border border-black/15 text-sm font-semibold ${paint ? paint.className : "bg-white text-black"}`}
            style={paint?.style}
            onClick={() => { setMenu((v) => !v); setNotes(false); }}
          >
            {mark || ""}
          </button>
        </div>
      </header>

      {menu && (
        <div className="absolute right-[4vw] z-40 w-[min(16rem,74vw)] overflow-hidden rounded-2xl border border-black/10 bg-white text-char shadow-2xl" style={{ top: "calc(env(safe-area-inset-top) + 3.6rem)" }}>
          {bb.session && <p className="border-b border-black/10 px-4 py-3 text-sm">{bb.session.handle}</p>}
          {bb.session ? (
            <button type="button" className="block w-full px-4 py-3 text-left text-sm" onClick={() => { bb.logout(); setMenu(false); }}>Log out</button>
          ) : (
            <button type="button" className="block w-full px-4 py-3 text-left text-sm" onClick={() => { setMenu(false); setAuth(true); }}>Log in</button>
          )}
          <a href="/subscribe" className="block px-4 py-3 text-sm">Upgrade plan</a>
          <a href="/about" className="block px-4 py-3 text-sm">About us</a>
        </div>
      )}
      {notes && (
        <div className="absolute left-[4vw] right-[4vw] z-40 max-h-[46dvh] overflow-y-auto rounded-2xl border border-black/10 bg-white p-3 text-char shadow-2xl" style={{ top: "calc(env(safe-area-inset-top) + 3.6rem)" }}>
          {(bb.social?.notes || []).length === 0 && <p className="px-2 py-3 text-sm text-neutral-500">No notes yet.</p>}
          {(bb.social?.notes || []).slice(0, 12).map((note) => (
            <button key={note.id} type="button" className="block w-full rounded-xl px-2 py-2 text-left" onClick={() => { bb.markNotesRead?.(); setNotes(false); }}>
              <p className="text-sm">{note.title}</p>
              <p className="text-xs text-neutral-500">{note.body}</p>
            </button>
          ))}
        </div>
      )}

      <div className="bb-store-scroll">
        {venueId ? <VenueDetail id={venueId} onBack={() => setVenueId("")} /> : null}
        {!venueId && eventId ? <PrivateDetail id={eventId} onBack={() => setEventId("")} /> : null}
        {!venueId && !eventId && tab === "home" && <Home onVenues={() => go("venues")} onOpenVenue={setVenueId} onOpenEvent={setEventId} />}
        {!venueId && !eventId && tab === "venues" && <Venues onOpen={setVenueId} />}
        {!venueId && !eventId && tab === "quick" && <Quick onOpen={setVenueId} />}
        {!venueId && !eventId && tab === "how" && <How />}
        {!venueId && !eventId && tab === "private" && <Private onOpen={setEventId} />}
        {!venueId && !eventId && tab === "profile" && <Profile onLogin={() => setAuth(true)} onOpenVenue={setVenueId} onOpenEvent={setEventId} />}
      </div>

      <nav
        className={`grid shrink-0 grid-cols-5 items-end border-t px-1 pt-1 ${light && !venueId && !eventId ? "border-black/10 bg-[#f4f1ea] text-char" : "border-white/10 bg-[#0c0c0c] text-white"}`}
        style={{ paddingBottom: "max(0.45rem, env(safe-area-inset-bottom))" }}
      >
        {[
          ["venues", "Venues"],
          ["quick", "Quick"],
          ["how", ""],
          ["private", "Private"],
          ["profile", "Profile"],
        ].map(([idName, label]) => {
          const on = navOn === idName;
          if (idName === "how") {
            return (
              <button key={idName} type="button" onClick={() => go("how")} className="flex items-center justify-center">
                <span className={`grid h-14 w-14 -translate-y-3 place-items-center rounded-full font-serif text-3xl shadow-lg ${on ? "bg-ember text-[#1a1408]" : light && !venueId && !eventId ? "bg-black text-white" : "bg-white text-black"}`}>?</span>
              </button>
            );
          }
          return (
            <button key={idName} type="button" onClick={() => go(idName)} className={`flex flex-col items-center gap-1 pb-1 text-[0.58rem] uppercase tracking-[0.12em] ${on ? "text-ember" : "text-current opacity-40"}`}>
              <Icon tab={idName} />
              {label}
            </button>
          );
        })}
      </nav>

      {auth && (
        <form
          className="absolute inset-x-[6vw] z-40 rounded-3xl bg-white p-5 text-char shadow-2xl"
          style={{ top: "22dvh" }}
          onSubmit={(e) => {
            e.preventDefault();
            const fail = bb.login(id, password);
            if (fail) setError(fail);
            else { setAuth(false); setError(""); setPassword(""); go("profile"); }
          }}
        >
          <h2 className="font-serif text-2xl">Log in</h2>
          <input value={id} onChange={(e) => setId(e.target.value)} placeholder="Email or username" className="mt-4 w-full rounded-xl border border-black/10 px-3 py-3 text-base" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="mt-2 w-full rounded-xl border border-black/10 px-3 py-3 text-base" />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button type="submit" className="mt-4 w-full rounded-full bg-black py-3 text-sm font-semibold text-white">Log in</button>
          <a
            href="/register?from=app"
            className="mt-3 block text-center text-sm"
            onClick={() => { try { sessionStorage.setItem("bb_next", "/m?tab=profile"); } catch { /* ignore */ } }}
          >Create an account</a>
        </form>
      )}
    </div>
  );
}

function Home({ onVenues, onOpenVenue, onOpenEvent }) {
  const bb = useBB();
  const rows = useMemo(() => upcoming(bb.content), [bb.content]);
  const featured = rows[0];
  const today = iso(0);
  const scenes = rows.filter((row) => (row.kind === "table" ? row.table.dateISO : row.event.dateISO) === today).length;
  const hosts = new Set(rows.map((row) => row.host).filter(Boolean)).size;
  const [pay, setPay] = useState(false);
  const [busy, setBusy] = useState(false);

  function join() {
    if (!featured) return;
    if (!bb.session) { bb.notify("Log in first."); return; }
    if (featured.kind === "private") setPay(true);
    else bb.setFlow({ type: "join", venueId: featured.venue.id, tableId: featured.table.id });
  }

  return (
    <section className="px-[4.5vw] pb-6 pt-5">
      <p className="text-center text-[0.68rem] uppercase tracking-[0.14em] text-white/55">
        Hong Kong · Tonight · {rows.length} blind boxes / {hosts} hosts / {scenes} scenes
      </p>
      <h1 className="mt-8 text-center font-serif text-[clamp(2.1rem,9vw,2.8rem)] leading-[1.05] text-white">
        You don't know
        <br />
        <span className="italic">who you'll meet.</span>
        <br />
        <span className="italic text-ember">That's the point.</span>
      </h1>
      <p className="mx-auto mt-6 max-w-sm text-center text-sm leading-relaxed text-white/65">
        Restaurants provide the scene. Private events create the reason.
        <br />
        You bring curiosity.
      </p>
      {featured && (
        <article className="mt-8 overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#141414]">
          <button type="button" className="relative block w-full" onClick={() => (featured.kind === "private" ? onOpenEvent(featured.id) : onOpenVenue(featured.venue.id))}>
            <div className="relative aspect-[16/10] w-full">
              <Photo src={featured.image} fallback={featured.kind === "private" ? eventPoster(featured.event) : ""} alt="" />
            </div>
            <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
              {featured.kind === "table" ? `${featured.table.time || ""}` : featured.event.timeLabel}
            </span>
            <span className="absolute right-3 top-3">
              <HostBadge handle={featured.host || "C"} tier={featured.tier || "bronze"} size="feature" />
            </span>
          </button>
          <div className="px-4 py-4">
            <h2 className="font-serif text-[clamp(1.6rem,7vw,2rem)] leading-none">{featured.name}</h2>
            <div className="mt-3 flex items-center gap-2">
              <HostBadge handle={featured.host || "C"} tier={featured.tier || "bronze"} />
              <Joiners people={featured.kind === "table" ? featured.table.participants : featured.event.participants} host={featured.host} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              {featured.kind === "private" ? (featured.event.description || featured.event.forWhom) : featured.venue.about}
            </p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={join} className="flex-1 rounded-full bg-white px-3 py-3 text-[13px] font-semibold text-black">Love it. Let's do this.</button>
              <button type="button" onClick={onVenues} className="rounded-full border border-white/25 px-4 py-3 text-[13px] font-semibold">Explore more</button>
            </div>
          </div>
        </article>
      )}
      {featured?.kind === "private" && (
        <PayDialog
          open={pay}
          title={featured.name}
          lines={[featured.event.location, `${featured.event.dateISO} · ${featured.event.timeLabel}`]}
          busy={busy}
          onClose={() => setPay(false)}
          onConfirm={async () => {
            setBusy(true);
            const res = await bb.joinPrivate(featured.id);
            setBusy(false);
            setPay(false);
            if (res?.error) bb.notify(res.error === "FULL" ? "Full." : res.error);
            else bb.notify("You’re in.");
          }}
        />
      )}
    </section>
  );
}

function Venues({ onOpen }) {
  const bb = useBB();
  const [filter, setFilter] = useState("all");
  const today = iso(0);
  const venues = bb.content.venues.filter((venue) => {
    if (venue.hidden) return false;
    const rows = soonestTable(venue);
    const tonight = venue.tonight || rows.some((row) => row.table.dateISO === today);
    if (filter === "tonight") return tonight;
    if (filter !== "all" && venue.area !== filter) return false;
    return true;
  });
  return (
    <section className="px-[4.5vw] pb-6 pt-4">
      <div className="flex justify-between gap-3 text-[0.62rem] uppercase tracking-[0.14em] text-white/45">
        <span>Venues · Restaurants</span>
        <span className="text-right">A neighbourhood. A time. Seats left.</span>
      </div>
      <h1 className="mt-6 text-center font-serif text-[clamp(1.8rem,8vw,2.4rem)] leading-tight">
        Pick the place.
        <br />
        <span className="italic text-ember">Leave the rest blind.</span>
      </h1>
      <p className="mx-auto mt-4 max-w-sm text-center text-sm leading-relaxed text-white/60">
        No faces, just places.
        <br />
        Enough to WANT, enough uncertainty to be WORTH having.
      </p>
      <div className="mt-6 flex gap-4 overflow-x-auto border-b border-white/10 pb-2 text-[0.72rem] uppercase tracking-[0.14em]">
        {[
          ["all", "All"],
          ["tst", "TST"],
          ["cwb", "CWB"],
          ["central", "Central"],
          ["tonight", "Tonight"],
        ].map(([idName, label]) => (
          <button key={idName} type="button" onClick={() => setFilter(idName)} className={`shrink-0 pb-1 ${filter === idName ? "border-b border-white text-white" : "text-white/40"}`}>{label}</button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {venues.map((venue) => {
          const next = soonestTable(venue)[0];
          return (
            <button key={venue.id} type="button" onClick={() => onOpen(venue.id)} className="text-left">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-black">
                <Photo src={venue.imageUrl} alt="" />
                <span className="absolute left-2 top-2 rounded-full bg-black/65 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-white">{venue.spots || next?.hold.places || 0} spots</span>
                <span className="absolute bottom-2 left-2 rounded-full bg-white px-2.5 py-1 text-[9px] font-semibold uppercase text-black">{next?.table.time || venue.timeLabel}</span>
              </div>
              <h2 className="mt-2 font-serif text-[clamp(1rem,4.2vw,1.2rem)] leading-tight">{venue.name}</h2>
              <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-white/55">{venue.typeLabel}</p>
              <p className="text-[11px] text-white/50">{venue.locationLabel}</p>
              {next && (
                <span className="mt-2 flex items-center gap-1.5">
                  <HostBadge handle={next.table.hostHandle || "C"} tier={next.table.hostTier || "bronze"} />
                  <Joiners people={next.table.participants} host={next.table.hostHandle} />
                </span>
              )}
              <p className="text-[11px] text-white/45">{venue.priceLabel}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function VenueDetail({ id, onBack }) {
  const bb = useBB();
  const venue = bb.content.venues.find((v) => v.id === id);
  if (!venue) return <button type="button" className="px-5 py-4 text-sm" onClick={onBack}>Back</button>;
  const rows = soonestTable(venue);
  return (
    <section className="px-[4.5vw] pb-8 pt-4">
      <button type="button" onClick={onBack} className="text-xs uppercase tracking-[0.14em] text-white/45">Back</button>
      <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-3xl">
        <Photo src={venue.gallery?.[0] || venue.imageUrl} alt="" />
      </div>
      <h1 className="mt-4 font-serif text-[clamp(1.8rem,8vw,2.4rem)]">{venue.name}</h1>
      <p className="mt-2 text-sm text-white/60">{venue.typeLabel} · {venue.locationLabel}</p>
      <p className="mt-3 text-sm leading-relaxed text-white/75">{venue.about}</p>
      <div className="mt-4 space-y-2">
        {rows.slice(0, 5).map(({ table, hold }) => (
          <div key={table.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 px-3 py-3">
            <p className="text-sm">{table.dateISO} · {table.time} · {hold.places} left</p>
            <button type="button" className="rounded-full border border-ember px-3 py-1.5 text-xs font-semibold text-ember" onClick={() => bb.setFlow({ type: "join", venueId: venue.id, tableId: table.id })}>Join</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function Quick({ onOpen }) {
  const bb = useBB();
  const [chip, setChip] = useState("nearby");
  const [pay, setPay] = useState(null);
  const [busy, setBusy] = useState(false);
  const rows = (bb.content.events || []).filter((event) => {
    if (event.kind !== "quick" || event.hidden) return false;
    const blob = `${event.typeLabel || ""} ${event.timeLabel || ""} ${event.detail || ""}`.toLowerCase();
    if (chip === "lunch") return /lunch/.test(blob);
    if (chip === "drinks") return /drink|wine|bar/.test(blob);
    if (chip === "coffee") return /coffee|tea/.test(blob);
    return true;
  });
  return (
    <section className="px-[4.5vw] pb-4 pt-2">
      <h1 className="mt-4 text-center font-serif text-[clamp(2rem,8.5vw,2.7rem)] leading-[1.05]">
        I'm free now.
        <br />
        <span className="italic text-ember">Who wants to join?</span>
      </h1>
      <p className="mx-auto mt-4 max-w-xs text-center text-sm leading-relaxed text-black/55">A seat nearby. A time. No bio, no swipe. If you're free, sit down.</p>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {[
          ["nearby", "Nearby"],
          ["today", "Today"],
          ["lunch", "Lunch"],
          ["drinks", "Drinks"],
          ["coffee", "Coffee"],
        ].map(([idName, label]) => (
          <button key={idName} type="button" onClick={() => setChip(idName)} className={`shrink-0 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] ${chip === idName ? "bg-black text-white" : "bg-white text-black"}`}>{label}</button>
        ))}
      </div>
      <div className="mt-2 divide-y divide-black/10">
        {rows.map((row) => (
          <div key={row.id} className="flex w-full items-center gap-3 py-3 text-left">
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-neutral-200">
              <Photo src={row.imageUrl} alt="" />
            </span>
            <span className="min-w-0 flex-1" onClick={() => row.venueId && onOpen(row.venueId)}>
              <span className="block text-[10px] uppercase tracking-[0.12em] text-black/45">{row.timeLabel}</span>
              <span className="mt-0.5 flex items-center gap-2">
                <span className="truncate font-serif text-lg">{row.name}</span>
                <HostBadge handle={row.hostName || "CJ"} tier={row.hostTier || "gold"} />
              </span>
              <span className="block text-xs text-black/45">{row.detail}</span>
            </span>
            <button
              type="button"
              className="shrink-0 rounded-full border border-ember px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ember"
              onClick={() => setPay(row)}
            >Join</button>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-2xl bg-white px-4 py-4 text-sm leading-relaxed text-black/70">No one around yet? Create one. If nobody joins, fine — you were already planning to eat alone.</p>
      <PayDialog
        open={!!pay}
        title={pay?.name || ""}
        lines={[pay?.timeLabel, pay?.detail]}
        busy={busy}
        onClose={() => setPay(null)}
        onConfirm={async () => {
          setBusy(true);
          const res = await bb.act("event", pay.id, "join");
          setBusy(false);
          setPay(null);
          if (res?.needLogin) bb.notify("Log in first.");
          else if (res?.error) bb.notify(res.error);
          else bb.notify("You’re in.");
        }}
      />
    </section>
  );
}

function How() {
  return (
    <section className="px-[6vw] pb-8 pt-6">
      <p className="text-center text-[0.68rem] uppercase tracking-[0.16em] text-white/45">How it works</p>
      <h1 className="mt-5 text-center font-serif text-[clamp(2.2rem,9vw,2.8rem)] leading-none">
        See venue, see vibe
        <br />
        <span className="italic text-ember">Take a seat.</span>
      </h1>
      <p className="mx-auto mt-4 max-w-xs text-center text-sm leading-relaxed text-white/55">No bios. No swiping. Just a place, a time, and curiosity.</p>
      <ol className="relative mt-8 space-y-0">
        {HOW.map(([n, title, body], index) => (
          <li key={n} className="grid grid-cols-[1.6rem_1fr] gap-3">
            <div className="relative flex justify-center">
              {index < HOW.length - 1 && <span className="absolute bottom-0 top-4 w-px bg-white/15" />}
              <span className="relative z-10 mt-1 grid h-3.5 w-3.5 place-items-center rounded-full border border-white/30 bg-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-ember" />
              </span>
            </div>
            <div className={`pb-6 ${index ? "border-t border-white/10 pt-5" : ""}`}>
              <h2 className="font-serif text-[1.35rem] leading-tight text-white"><span className="mr-2 text-sm not-italic text-ember">{n}</span>{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{body}</p>
              {n === "08" && (
                <div className="mt-4 flex flex-wrap gap-4">
                  {[
                    ["B", "Bronze", "100 points", "5%", "bb-metal-bronze"],
                    ["S", "Silver", "300 points", "10%", "bb-metal-silver"],
                    ["G", "Gold", "500 points", "20%", "bb-metal-gold"],
                  ].map(([letter, name, points, note, circle]) => (
                    <div key={letter} className="flex items-center gap-2">
                      <span className={`grid h-11 w-11 place-items-center rounded-full font-serif text-lg font-semibold ring-1 ring-black/15 ${circle}`}>{letter}</span>
                      <span>
                        <span className="block text-sm text-white">{name}</span>
                        <span className="block text-xs text-white/45">{points} · {note}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Private({ onOpen }) {
  const bb = useBB();
  const [chip, setChip] = useState("");
  const nights = (bb.content.events || []).filter((event) => {
    if (event.kind !== "private" || event.hidden) return false;
    if (!chip) return true;
    return `${event.typeLabel || ""} ${event.name || ""} ${event.forWhom || ""}`.toLowerCase().includes(chip);
  });
  return (
    <section className="px-[4.5vw] pb-6 pt-3">
      <div className="flex justify-between gap-3 text-[0.62rem] uppercase tracking-[0.14em] text-black/40">
        <span className="text-ember">Private · Host led</span>
        <span>Interest → Connect</span>
      </div>
      <h1 className="mt-5 text-center font-serif text-[clamp(2rem,8.5vw,2.6rem)] leading-[1.05]">
        Find your interest.
        <br />
        <span className="italic text-ember">Meet your people.</span>
      </h1>
      <p className="mx-auto mt-3 max-w-xs text-center text-sm leading-relaxed text-black/50">Host creates the reason. You find your kind.</p>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {[
          ["comed", "Comedian"],
          ["chef", "Chef"],
          ["tattoo", "Tattoo artist"],
          ["wine", "Wine"],
          ["hik", "Hiking"],
        ].map(([idName, label]) => (
          <button key={idName} type="button" onClick={() => setChip((cur) => (cur === idName ? "" : idName))} className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${chip === idName ? "bg-black text-white" : "bg-white text-black/70"}`}>{label}</button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {nights.map((night) => (
          <button key={night.id} type="button" onClick={() => onOpen(night.id)} className="overflow-hidden rounded-2xl bg-white text-left shadow-sm">
            <div className="relative aspect-[4/5] bg-neutral-200">
              <Photo src={eventPhotos(night)[0] || ""} fallback={eventPoster(night)} alt="" />
            </div>
            <div className="px-3 py-3">
              <h2 className="font-serif text-[clamp(1rem,4vw,1.15rem)] leading-tight">{night.name}</h2>
              <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-black/45">{night.typeLabel}</p>
              <p className="mt-1 text-xs text-black/55">{night.upcomingLabel || `${night.spots} places`}</p>
              <span className="mt-2 flex items-center gap-1.5">
                <HostBadge handle={night.hostName || "Host"} tier={night.hostTier || "bronze"} />
                <Joiners people={night.participants} host={night.hostName} />
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function PrivateDetail({ id, onBack }) {
  const bb = useBB();
  const [busy, setBusy] = useState(false);
  const [pay, setPay] = useState(false);
  const event = (bb.content.events || []).find((item) => item.id === id);
  if (!event) return <button type="button" className="px-5 py-4" onClick={onBack}>Back</button>;
  const trialOn = !!(bb.trial?.at && !bb.trial.cancelled && Date.now() - bb.trial.at < 90 * 86400000);
  const premium = bb.plan === "premium" || trialOn;
  return (
    <section className="bg-paper px-[4.5vw] pb-8 pt-4 text-char">
      <button type="button" onClick={onBack} className="text-xs uppercase tracking-[0.14em] text-black/45">Back</button>
      <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-3xl bg-neutral-200">
        <Photo src={eventPhotos(event)[0] || ""} fallback={eventPoster(event)} alt="" />
      </div>
      <h1 className="mt-4 font-serif text-[clamp(1.8rem,8vw,2.4rem)]">{event.name}</h1>
      <p className="mt-2 text-sm">{event.location} · {event.dateISO} · {event.timeLabel}</p>
      <p className="mt-3 text-sm leading-relaxed text-black/70">{event.description || event.forWhom}</p>
      <p className="mt-4 flex items-center gap-2 text-sm"><HostBadge handle={event.hostName || "Host"} tier={event.hostTier || "bronze"} /> {event.hostName}</p>
      <button type="button" className="mt-5 w-full rounded-full bg-black py-3 text-sm font-semibold text-white" onClick={() => { if (!bb.session) { bb.notify("Log in first."); return; } setPay(true); }}>Join</button>
      {premium && <button type="button" className="mt-2 w-full rounded-full border border-black/15 py-3 text-sm" onClick={() => bb.setFlow({ type: "private-create", venueId: event.venueId || "" })}>Host</button>}
      <PayDialog open={pay} title={event.name} lines={[event.location, `${event.dateISO} · ${event.timeLabel}`]} busy={busy} onClose={() => setPay(false)} onConfirm={async () => {
        setBusy(true);
        const res = await bb.joinPrivate(event.id);
        setBusy(false);
        setPay(false);
        if (res?.error) bb.notify(res.error === "FULL" ? "Full." : res.error);
        else bb.notify("You’re in.");
      }} />
    </section>
  );
}

function Profile({ onOpenVenue, onOpenEvent, onLogin }) {
  const bb = useBB();
  const [panel, setPanel] = useState("info");
  if (!bb.session) {
    return (
      <section className="px-[6vw] py-16 text-center">
        <h1 className="font-serif text-3xl">Your seat.</h1>
        <p className="mt-2 text-sm text-white/55">Log in to see today, upcoming, and your buddies.</p>
        <button type="button" onClick={onLogin} className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-black">Log in</button>
      </section>
    );
  }
  const session = bb.session;
  const paint = badgePaint(session.points, bb.content?.pointThresholds, "light");
  const buddies = (bb.social?.buddies || []).filter((b) => b.status === "accepted");
  const who = [session.gender, session.ageRange, session.orientation].filter(Boolean).join(" · ");
  const where = [session.neighborhood && `Lives in ${session.neighborhood}`, session.occupation && `Works in ${session.occupation}`].filter(Boolean).join(" · ");
  const showWho = session.showIdentity !== false && who;
  const showWhere = session.showPlace !== false && where;
  const off = discountPercent(session.points, bb.content?.pointThresholds);
  const reviews = (bb.content.peerReviews || []).filter((review) => review.to === session.handle);
  const today = iso(0);
  const seats = (session.bookings || []).filter((seat) => !seat.dateISO || seat.dateISO >= today);

  return (
    <section className="px-[5vw] pb-8 pt-6 text-center">
      <div className={`mx-auto grid h-24 w-24 place-items-center rounded-full font-serif text-3xl ${paint.className}`} style={paint.style}>{initials(session)}</div>
      <h1 className="mt-4 font-serif text-[clamp(1.6rem,7vw,2rem)]">{session.handle}</h1>
      {showWho && <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-white/55">{showWho}</p>}
      {showWhere && <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">{showWhere}</p>}
      <p className="mt-1 text-sm text-white/70">{session.points || 0} points{off ? ` · ${off}% off` : ""}</p>
      <div className="mx-auto mt-6 flex max-w-sm rounded-full bg-[#1c1c1c] p-1">
        {[
          ["info", "Info"],
          ["buddies", "Buddies"],
          ["review", "Review"],
        ].map(([idName, label]) => (
          <button key={idName} type="button" onClick={() => setPanel(idName)} className={`flex-1 rounded-full py-2 text-xs uppercase tracking-[0.12em] ${panel === idName ? "bg-white text-black" : "text-white/55"}`}>{label}</button>
        ))}
      </div>
      {panel === "info" && <Info session={session} content={bb.content} />}
      {panel === "buddies" && (
        <div className="mt-6 grid grid-cols-5 gap-3">
          {buddies.map((buddy) => (
            <span key={buddy.id} className="grid aspect-square place-items-center rounded-full border border-white/15 bg-[#161616] font-serif text-lg">{buddy.name.slice(0, 1).toUpperCase()}</span>
          ))}
          {!buddies.length && <p className="col-span-5 text-sm text-white/45">No buddies yet.</p>}
        </div>
      )}
      {panel === "review" && (
        <div className="mt-5 space-y-3 text-left">
          {reviews.slice(0, 3).map((review) => (
            <p key={review.id || review.at} className="rounded-2xl bg-[#161616] px-4 py-3 text-sm text-white/75">{review.body || review.note}</p>
          ))}
          {!reviews.length && <p className="text-center text-sm text-white/45">No reviews yet.</p>}
          {peopleYouCanRate(bb.content, session.handle).length > 0 && <p className="text-center text-xs text-white/40">Rate someone after you have shared a table.</p>}
        </div>
      )}
      <div className="mt-8 text-left">
        <p className="text-[0.68rem] uppercase tracking-[0.14em] text-white/45">Today and upcoming</p>
        {!seats.length && <p className="mt-3 text-sm text-white/45">None yet.</p>}
        <div className="mt-3 flex gap-3 overflow-x-auto">
          {seats.map((seat) => (
            <button key={`${seat.id}-${seat.dateISO}`} type="button" onClick={() => (seat.kind === "private" ? onOpenEvent(seat.id) : seat.venueId && onOpenVenue(seat.venueId))} className="w-[42%] shrink-0 overflow-hidden rounded-2xl border border-white/10 text-left">
              <div className="aspect-square bg-black/40" />
              <div className="p-2">
                <p className="truncate text-sm">{seat.name}</p>
                <p className="text-[11px] text-white/45">{seat.dateISO} · {seat.time}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Info({ session, content }) {
  const handle = session.handle;
  const books = session.bookings || [];
  let joined = 0;
  let invited = 0;
  let quick = 0;
  let privJoin = 0;
  let privHost = 0;
  books.forEach((booking) => {
    if (booking.kind === "private" && (booking.mode === "create" || booking.mode === "host")) privHost += 1;
    else if (booking.kind === "private") privJoin += 1;
    else if (booking.kind === "quick") quick += 1;
    else if (booking.mode === "invite" || booking.mode === "create") invited += 1;
    else joined += 1;
  });
  (content.events || []).forEach((event) => {
    if (books.some((booking) => booking.id === event.id)) return;
    const onIt = event.hostName === handle || (event.participants || []).some((p) => p.handle === handle);
    if (!onIt) return;
    if (event.kind === "private" && event.hostName === handle) privHost += 1;
    else if (event.kind === "private") privJoin += 1;
    else if (event.kind === "quick") quick += 1;
  });
  const rows = [["Joined", joined], ["Invited", invited], ["Quick meet", quick], ["Private joined", privJoin], ["Private hosted", privHost]];
  return (
    <div className="mx-auto mt-5 max-w-sm rounded-3xl bg-[#1c1c1c] px-5 py-4 text-left text-sm">
      {rows.map(([label, n]) => <p key={label} className="mt-2 flex justify-between text-white/70 first:mt-0"><span>{label}</span><span>{n}</span></p>)}
    </div>
  );
}
