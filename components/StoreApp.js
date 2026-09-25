"use client";

import { useEffect, useMemo, useState } from "react";
import { Photo } from "./Bits";
import { PayDialog } from "./Flows";
import { useBB } from "./Providers";
import { badgePaint, eventPhotos, eventPoster, iso, soonestTable } from "@/lib/bible";

const TABS = [
  { id: "venues", label: "Venues" },
  { id: "quick", label: "Quick" },
  { id: "how", label: "How" },
  { id: "private", label: "Private" },
  { id: "profile", label: "Profile" },
];

function initials(session) {
  const name = String(session?.handle || session?.username || "").trim();
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  if (parts.length === 1 && parts[0][0]) return parts[0][0].toUpperCase();
  return "";
}

function Icon({ tab }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", "aria-hidden": true };
  if (tab === "venues") return <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="4" y="9" width="16" height="11" rx="1.5" /><path d="M3 9.5 12 4l9 5.5" /></svg>;
  if (tab === "quick") return <svg {...common} fill="currentColor"><path d="M15 3.2A8.2 8.2 0 1 0 20.8 14 6.6 6.6 0 0 1 15 3.2z" /></svg>;
  if (tab === "how") return <span className="font-serif text-[1.35rem] leading-none">?</span>;
  if (tab === "private") return <svg {...common} fill="currentColor"><rect x="6" y="4" width="3.2" height="16" rx="0.7" /><rect x="14.8" y="4" width="3.2" height="16" rx="0.7" /></svg>;
  return <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="9" r="3.2" /><path d="M6.5 19.2a5.5 5.5 0 0 1 11 0" /></svg>;
}

export function StoreApp() {
  const bb = useBB();
  const [tab, setTab] = useState("venues");
  const [venueId, setVenueId] = useState("");
  const [eventId, setEventId] = useState("");
  const [menu, setMenu] = useState(false);
  const [notes, setNotes] = useState(false);
  const [auth, setAuth] = useState(false);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const light = Boolean(eventId) || (!venueId && (tab === "quick" || tab === "private"));
  const mark = initials(bb.session);
  const paint = bb.session ? badgePaint(bb.session.points, bb.content?.pointThresholds, "dark") : null;
  const unread = (bb.social?.notes || []).filter((n) => !n.read).length;
  const trialOn = !!(bb.trial?.at && !bb.trial.cancelled && Date.now() - bb.trial.at < 90 * 86400000);
  const premium = bb.plan === "premium" || trialOn;

  useEffect(() => {
    if (bb.session?.role === "admin" || bb.session?.role === "founder") {
      bb.logout();
      bb.notify("Admin login stays on the website.");
    }
  }, [bb.session?.role]);

  function closeSheets() {
    setMenu(false);
    setNotes(false);
    setAuth(false);
  }

  function openVenue(next) {
    setEventId("");
    setVenueId(next);
  }

  return (
    <div className={`bb-store ${light ? "bg-paper text-char" : "bg-ink text-fg"}`} onClick={closeSheets}>
      <header className="flex shrink-0 items-center justify-between gap-3 px-[4vw] py-[1.2vh]">
        <button type="button" className="font-serif text-[clamp(1.15rem,4.8vw,1.45rem)]" onClick={(e) => { e.stopPropagation(); setTab("venues"); setVenueId(""); setEventId(""); }}>
          Buddy Blind
        </button>
        <div className="flex items-center gap-[2.5vw]">
          <button type="button" className="relative grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-semibold text-black" onClick={(e) => { e.stopPropagation(); setNotes((v) => !v); setMenu(false); }}>
            {unread || 0}
          </button>
          <button
            type="button"
            className={`grid h-10 w-10 place-items-center rounded-full text-sm font-semibold ${paint ? paint.className : "bg-white text-black"}`}
            style={paint?.style}
            onClick={(e) => { e.stopPropagation(); setMenu((v) => !v); setNotes(false); }}
          >
            {mark || "·"}
          </button>
        </div>
      </header>

      {menu && (
        <div className="absolute right-[4vw] z-30 mt-0 w-[min(16rem,72vw)] overflow-hidden rounded-2xl border border-black/10 bg-white text-left text-char shadow-2xl" style={{ top: "calc(env(safe-area-inset-top) + 3.4rem)" }} onClick={(e) => e.stopPropagation()}>
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
        <div className="absolute left-[4vw] right-[4vw] z-30 max-h-[50dvh] overflow-y-auto rounded-2xl border border-black/10 bg-white p-3 text-char shadow-2xl" style={{ top: "calc(env(safe-area-inset-top) + 3.4rem)" }} onClick={(e) => e.stopPropagation()}>
          {(bb.social?.notes || []).length === 0 && <p className="px-2 py-3 text-sm text-neutral-500">No notes yet.</p>}
          {(bb.social?.notes || []).slice(0, 12).map((note) => (
            <button key={note.id} type="button" className="block w-full rounded-xl px-2 py-2 text-left" onClick={() => { bb.markNotesRead?.(); setNotes(false); }}>
              <p className="text-sm">{note.title}</p>
              <p className="text-xs text-neutral-500">{note.body}</p>
            </button>
          ))}
        </div>
      )}

      <div className="bb-store-scroll px-[4vw] pb-[2vh]">
        {venueId ? (
          <VenueDetail id={venueId} onBack={() => setVenueId("")} />
        ) : eventId ? (
          <PrivateDetail id={eventId} onBack={() => setEventId("")} premium={premium} />
        ) : tab === "venues" ? (
          <Venues onOpen={openVenue} />
        ) : tab === "quick" ? (
          <Quick onOpen={openVenue} />
        ) : tab === "how" ? (
          <How />
        ) : tab === "private" ? (
          <Private onOpen={setEventId} premium={premium} />
        ) : (
          <Profile onOpenVenue={openVenue} onOpenEvent={setEventId} />
        )}
      </div>

      <nav className={`grid shrink-0 grid-cols-5 border-t px-1 pt-2 ${light ? "border-black/10 bg-paper text-char" : "border-white/10 bg-ink text-white"}`} style={{ paddingBottom: "max(0.55rem, env(safe-area-inset-bottom))" }}>
        {TABS.map((item) => {
          const on = tab === item.id && !venueId && !eventId;
          return (
            <button key={item.id} type="button" onClick={() => { setTab(item.id); setVenueId(""); setEventId(""); }} className={`flex flex-col items-center gap-1 text-[clamp(0.58rem,2.5vw,0.68rem)] uppercase tracking-[0.08em] ${on ? "text-ember" : "opacity-45"}`}>
              <span className={item.id === "how" && on ? "grid h-11 w-11 -translate-y-2 place-items-center rounded-full bg-ember text-black" : item.id === "how" ? "grid h-11 w-11 -translate-y-2 place-items-center rounded-full bg-white text-black" : ""}>
                <Icon tab={item.id} />
              </span>
              {item.id !== "how" && item.label}
            </button>
          );
        })}
      </nav>

      {auth && (
        <form
          className="absolute inset-x-[6vw] z-40 rounded-3xl bg-white p-5 text-char shadow-2xl"
          style={{ top: "22dvh" }}
          onClick={(e) => e.stopPropagation()}
          onSubmit={(e) => {
            e.preventDefault();
            const fail = bb.login(id, password);
            if (fail) setError(fail);
            else { setAuth(false); setError(""); setPassword(""); }
          }}
        >
          <p className="font-serif text-2xl">Log in</p>
          <input value={id} onChange={(e) => setId(e.target.value)} placeholder="Email or username" className="mt-4 w-full rounded-xl border border-black/10 px-3 py-3 text-base" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="mt-2 w-full rounded-xl border border-black/10 px-3 py-3 text-base" />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button type="submit" className="mt-4 w-full rounded-full bg-black py-3 text-sm font-semibold text-white">Log in</button>
          <a href="/register" className="mt-3 block text-center text-sm">Create an account</a>
        </form>
      )}
    </div>
  );
}

function Venues({ onOpen }) {
  const bb = useBB();
  const [q, setQ] = useState("");
  const venues = bb.content.venues.filter((v) => !v.hidden && `${v.name} ${v.locationLabel} ${v.cuisine || ""}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <section>
      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-white/50">Venues</p>
      <h1 className="mt-2 font-serif text-[clamp(1.8rem,8vw,2.5rem)] leading-tight">A neighbourhood. A time. Seats left.</h1>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a place" className="mt-4 w-full rounded-full border border-white/15 bg-white px-4 py-3 text-base text-char" />
      <div className="mt-4 space-y-3">
        {venues.map((venue) => {
          const next = soonestTable(venue)[0];
          return (
            <button key={venue.id} type="button" onClick={() => onOpen(venue.id)} className="block w-full overflow-hidden rounded-3xl bg-card text-left">
              <div className="relative aspect-[16/9] w-full">
                <Photo src={venue.imageUrl} alt="" />
              </div>
              <div className="p-4">
                <p className="font-serif text-[clamp(1.2rem,5vw,1.5rem)]">{venue.name}</p>
                <p className="mt-1 text-sm text-white/55">{venue.locationLabel}</p>
                {next && <p className="mt-2 text-sm text-white/80">{next.table.dateISO} · {next.table.time} · {next.hold.places} left</p>}
              </div>
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
  if (!venue) return <button type="button" onClick={onBack}>Go back</button>;
  const rows = soonestTable(venue);
  return (
    <section>
      <button type="button" onClick={onBack} className="text-xs uppercase tracking-[0.14em] text-white/50">Back</button>
      <div className="relative mt-3 aspect-[4/3] w-full overflow-hidden rounded-3xl">
        <Photo src={venue.gallery?.[0] || venue.imageUrl} alt={venue.name} />
      </div>
      <h1 className="mt-4 font-serif text-[clamp(1.8rem,8vw,2.6rem)] leading-tight">{venue.name}</h1>
      <p className="mt-2 text-sm text-white/60">{venue.cuisine || venue.typeLabel} · {venue.locationLabel}</p>
      <p className="mt-3 text-sm leading-relaxed text-white/75">{venue.about}</p>
      <div className="mt-5 space-y-2">
        {rows.length === 0 && <p className="text-sm text-white/50">No seat open yet.</p>}
        {rows.slice(0, 6).map(({ table, hold }) => (
          <div key={table.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 px-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm">{table.dateISO} · {table.time}</p>
              <p className="text-xs text-white/50">{hold.places} left</p>
            </div>
            <button type="button" className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black" onClick={() => bb.setFlow({ type: "join", venueId: venue.id, tableId: table.id })}>Join</button>
          </div>
        ))}
      </div>
      <button type="button" className="mt-4 w-full rounded-full border border-white/20 py-3 text-sm" onClick={() => bb.setFlow({ type: "invite", venueId: venue.id })}>Invite</button>
    </section>
  );
}

function Quick({ onOpen }) {
  const bb = useBB();
  const today = iso(0);
  const rows = useMemo(() => (bb.content.events || []).filter((e) => e.kind === "quick" && !e.hidden), [bb.content.events]);
  return (
    <section>
      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-black/45">Quick</p>
      <h1 className="mt-2 font-serif text-[clamp(1.8rem,8vw,2.5rem)] leading-tight">Nearby, today.</h1>
      <p className="mt-2 text-sm text-black/60">Coffee, lunch, or a drink. Today only.</p>
      <button type="button" className="mt-4 w-full rounded-full bg-black py-3 text-sm font-semibold text-white" onClick={() => {
        const venue = bb.content.venues.find((v) => !v.hidden);
        if (!bb.session) { bb.notify("Log in first."); return; }
        if (venue) bb.setFlow({ type: "quick-invite", venueId: venue.id });
      }}>I’m free now</button>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <button key={row.id} type="button" onClick={() => row.venueId && onOpen(row.venueId)} className="block w-full rounded-3xl bg-white p-4 text-left shadow-sm">
            <p className="font-serif text-[clamp(1.15rem,5vw,1.4rem)]">{row.name}</p>
            <p className="mt-1 text-sm text-black/55">{row.timeLabel || today}</p>
            <p className="text-sm text-black/55">{row.detail || row.typeLabel}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function How() {
  const steps = [
    ["01", "See the place", "The photo is the filter. Like the room, you’ll like the night."],
    ["02", "See enough", "Neighbourhood, time, seats left. No faces."],
    ["03", "Take a seat", "HK$5 only when you confirm. That’s for trust, not the meal."],
    ["04", "Show up", "No names before. No photos before."],
    ["05", "After", "Stars aren’t about looks. A short line is your reputation."],
    ["06", "A buddy", "One tap. If they say yes too, you’re buddies."],
    ["07", "Host", "Premium. A private night, up to 20."],
  ];
  return (
    <section>
      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-white/50">How it works</p>
      <h1 className="mt-2 font-serif text-[clamp(1.8rem,8vw,2.5rem)] leading-tight">See venue, see vibe<br /><span className="italic text-ember">Take a seat.</span></h1>
      <ol className="mt-5 overflow-hidden rounded-3xl border border-white/10">
        {steps.map(([n, title, body]) => (
          <li key={n} className="grid grid-cols-[2.2rem_1fr] gap-2 border-t border-white/10 px-4 py-4 first:border-t-0">
            <span className="text-xs text-white/40">{n}</span>
            <div>
              <p className="font-serif text-[clamp(1.15rem,4.5vw,1.35rem)]">{title}</p>
              <p className="mt-1 text-sm text-white/55">{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Private({ onOpen, premium }) {
  const bb = useBB();
  const nights = (bb.content.events || []).filter((e) => e.kind === "private" && !e.hidden && !String(e.id).startsWith("priv-test"));
  return (
    <section>
      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-black/45">Private</p>
      <h1 className="mt-2 font-serif text-[clamp(1.8rem,8vw,2.5rem)] leading-tight">Host creates the reason. <span className="italic">You find your kind.</span></h1>
      <button
        type="button"
        className="mt-4 w-full rounded-full bg-black py-3 text-sm font-semibold text-white"
        onClick={() => {
          if (!bb.session) { bb.notify("Log in first."); return; }
          if (!premium) { window.location.href = "/subscribe"; return; }
          bb.setFlow({ type: "private-create" });
        }}
      >Host</button>
      <div className="mt-4 space-y-3">
        {nights.map((night) => (
          <button key={night.id} type="button" onClick={() => onOpen(night.id)} className="block w-full overflow-hidden rounded-3xl bg-white text-left shadow-sm">
            <div className="relative aspect-[16/9] w-full bg-neutral-200">
              <Photo src={eventPhotos(night)[0] || ""} fallback={eventPoster(night)} alt="" />
            </div>
            <div className="p-4">
              <p className="font-serif text-[clamp(1.15rem,5vw,1.45rem)]">{night.name}</p>
              <p className="mt-1 text-sm text-black/55">{night.hostName} · {night.dateISO} · {night.timeLabel}</p>
              <p className="text-sm text-black/55">{night.spots} places</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function PrivateDetail({ id, onBack, premium }) {
  const bb = useBB();
  const [busy, setBusy] = useState(false);
  const [pay, setPay] = useState(false);
  const event = (bb.content.events || []).find((e) => e.id === id);
  if (!event) return <button type="button" onClick={onBack}>Go back</button>;
  return (
    <section>
      <button type="button" onClick={onBack} className="text-xs uppercase tracking-[0.14em] text-black/45">Back</button>
      <div className="relative mt-3 aspect-[4/3] w-full overflow-hidden rounded-3xl bg-neutral-200">
        <Photo src={eventPhotos(event)[0] || ""} fallback={eventPoster(event)} alt="" />
      </div>
      <h1 className="mt-4 font-serif text-[clamp(1.8rem,8vw,2.5rem)] leading-tight">{event.name}</h1>
      <p className="mt-2 text-sm">{event.location} · {event.dateISO} · {event.timeLabel}</p>
      <p className="mt-3 text-sm leading-relaxed text-black/70">{event.description || event.forWhom}</p>
      <p className="mt-4 text-sm">Host · {event.hostName}</p>
      <button type="button" className="mt-5 w-full rounded-full bg-black py-3 text-sm font-semibold text-white" onClick={() => { if (!bb.session) { bb.notify("Log in first."); return; } setPay(true); }}>Join</button>
      {premium && <button type="button" className="mt-2 w-full rounded-full border border-black/15 py-3 text-sm" onClick={() => bb.setFlow({ type: "private-create", venueId: event.venueId || "" })}>Host</button>}
      <PayDialog
        open={pay}
        title={event.name}
        lines={[event.location, `${event.dateISO} · ${event.timeLabel}`]}
        busy={busy}
        onClose={() => setPay(false)}
        onConfirm={async () => {
          setBusy(true);
          const res = await bb.joinPrivate(event.id);
          setBusy(false);
          setPay(false);
          if (res?.needLogin) bb.notify("Log in first.");
          else if (res?.error) bb.notify(res.error === "FULL" ? "Full." : res.error);
          else bb.notify("You’re in.");
        }}
      />
    </section>
  );
}

function Profile({ onOpenVenue, onOpenEvent }) {
  const bb = useBB();
  const today = iso(0);
  const paint = bb.session ? badgePaint(bb.session.points, bb.content?.pointThresholds, "light") : null;
  const seats = [];
  (bb.session?.bookings || []).forEach((booking) => {
    if (booking.dateISO && booking.dateISO < today) return;
    seats.push(booking);
  });
  if (!bb.session) {
    return (
      <section>
        <h1 className="font-serif text-[clamp(1.8rem,8vw,2.5rem)]">Your seat.</h1>
        <p className="mt-2 text-sm text-white/60">Log in to see today, upcoming, points, and buddies.</p>
        <a href="/register" className="mt-5 block rounded-full bg-white py-3 text-center text-sm font-semibold text-black">Join Buddy</a>
      </section>
    );
  }
  return (
    <section>
      <div className="flex items-center gap-4">
        <div className={`grid h-[18vw] max-h-20 min-h-14 w-[18vw] min-w-14 max-w-20 place-items-center rounded-full text-lg font-semibold ${paint?.className || ""}`} style={paint?.style}>{initials(bb.session)}</div>
        <div className="min-w-0">
          <p className="truncate font-serif text-[clamp(1.4rem,6vw,1.8rem)] font-semibold">{bb.session.handle}</p>
          <p className="text-sm text-white/55">{bb.session.points || 0} points</p>
        </div>
      </div>
      <h2 className="mb-2 mt-8 text-[0.68rem] uppercase tracking-[0.14em] text-white/45">Today and upcoming</h2>
      {seats.length === 0 && <p className="text-sm text-white/50">None yet.</p>}
      <div className="space-y-2">
        {seats.map((seat) => (
          <button key={`${seat.id}-${seat.dateISO}`} type="button" className="block w-full rounded-2xl border border-white/10 px-3 py-3 text-left" onClick={() => (seat.kind === "private" ? onOpenEvent(seat.id) : seat.venueId && onOpenVenue(seat.venueId))}>
            <p className="text-sm">{seat.name}</p>
            <p className="text-xs text-white/50">{seat.dateISO} · {seat.time}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
