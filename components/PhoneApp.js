"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useBB } from "./Providers";
import { iso, prettyDate, queryHits, soonestTable, tableStart } from "@/lib/bible";

function hourOf(time) {
  const match = String(time || "").toUpperCase().match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/);
  if (!match) return null;
  let hour = Number(match[1]);
  if (match[3] === "PM" && hour < 12) hour += 12;
  if (match[3] === "AM" && hour === 12) hour = 0;
  return hour;
}

function mealOf(time) {
  const hour = hourOf(time);
  if (hour == null) return "";
  if (hour < 15) return "lunch";
  if (hour < 18) return "happy";
  if (hour < 21) return "dinner";
  return "late";
}

function isBar(venue) {
  return /bar|wine|pub/i.test(`${venue.typeLabel || ""} ${venue.cuisine || ""} ${venue.name || ""}`);
}

function Photo({ src, alt, className }) {
  if (!src) return <div className={`bg-neutral-200 ${className || ""}`} />;
  return <img src={src} alt={alt || ""} className={`object-cover ${className || ""}`} />;
}

function Search({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm outline-none"
    />
  );
}

function Chips({ options, value, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {options.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${value === item.id ? "bg-black text-white" : "bg-white text-neutral-600 ring-1 ring-black/10"}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function HomeTab() {
  const bb = useBB();
  const [query, setQuery] = useState("");
  const [where, setWhere] = useState(true);
  const [mode, setMode] = useState("events");
  const [date, setDate] = useState(iso(0));
  const [meal, setMeal] = useState("");
  const venues = bb.content.venues.filter((venue) => bb.editing || !venue.hidden);
  const privates = bb.content.events.filter((event) => event.kind === "private" && (bb.editing || !event.hidden));
  const cards = useMemo(() => {
    if (mode === "private") {
      return privates.filter((event) => queryHits(`${event.name} ${event.location} ${event.description} ${event.timeLabel}`, query));
    }
    return venues.filter((venue) => {
      const rows = soonestTable(venue).filter((row) => {
        if (date && row.table.dateISO !== date) return false;
        if (meal && mealOf(row.table.time) !== meal) return false;
        return true;
      });
      if ((date || meal) && !rows.length) return false;
      return queryHits(`${venue.name} ${venue.cuisine} ${venue.area} ${venue.locationLabel} ${venue.about}`, query);
    });
  }, [mode, privates, venues, query, date, meal]);

  return (
    <div className="space-y-3">
      <Search value={query} onChange={setQuery} placeholder="Search city" />
      {where && (
        <button type="button" onClick={() => setWhere(false)} className="rounded-full bg-white px-3 py-1 text-xs ring-1 ring-black/10">
          Hong Kong ×
        </button>
      )}
      <div className="flex gap-2 text-sm">
        {[["events", "Events"], ["private", "Private events"]].map(([id, label]) => (
          <button key={id} type="button" onClick={() => setMode(id)} className={`flex-1 rounded-full py-2.5 ${mode === id ? "bg-black text-white" : "border border-black/15 bg-white"}`}>{label}</button>
        ))}
      </div>
      {mode === "events" && (
        <>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm" />
          <Chips
            value={meal}
            onChange={(id) => setMeal(meal === id ? "" : id)}
            options={[
              { id: "lunch", label: "Lunch" },
              { id: "happy", label: "Happy hour" },
              { id: "dinner", label: "Dinner" },
              { id: "late", label: "Late" },
            ]}
          />
        </>
      )}
      <div className="space-y-3">
        {mode === "private" && cards.map((event) => (
          <article key={event.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <Photo src={event.imageUrl} alt="" className="h-36 w-full" />
            <div className="space-y-2 p-3">
              <h2 className="font-semibold">{event.name}</h2>
              <p className="text-xs text-neutral-500">{prettyDate(event.dateISO)} · {event.timeLabel} · {event.location}</p>
              <p className="line-clamp-2 text-sm text-neutral-600">{event.description}</p>
              <Link href={`/private/${event.id}`} className="block rounded-full bg-black py-2 text-center text-sm text-white">Join</Link>
            </div>
          </article>
        ))}
        {mode === "events" && cards.map((venue) => (
          <article key={venue.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <Link href={`/venues/${venue.id}`}>
              <Photo src={venue.imageUrl} alt="" className="h-40 w-full" />
            </Link>
            <div className="space-y-2 p-3">
              <Link href={`/venues/${venue.id}`} className="block font-semibold">{venue.name}</Link>
              <p className="text-xs text-neutral-500">{venue.cuisine} · {venue.locationLabel || venue.area}</p>
              <p className="line-clamp-2 text-sm text-neutral-600">{venue.about}</p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" className="rounded-full border border-black/20 py-2 text-sm" onClick={() => bb.setFlow({ type: "invite", venueId: venue.id })}>Invite</button>
                <button type="button" className="rounded-full border border-black/20 py-2 text-sm" onClick={() => bb.setFlow({ type: "join", venueId: venue.id })}>Join</button>
              </div>
            </div>
          </article>
        ))}
        {!cards.length && <p className="py-8 text-center text-sm text-neutral-500">Nothing for that time. Try another day.</p>}
      </div>
    </div>
  );
}

function VenuesTab() {
  const bb = useBB();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const rows = bb.content.venues.filter((venue) => {
    if (!bb.editing && venue.hidden) return false;
    if (kind === "bar" && !isBar(venue)) return false;
    if (kind === "restaurant" && isBar(venue)) return false;
    return queryHits(`${venue.name} ${venue.cuisine} ${venue.typeLabel} ${venue.locationLabel} ${venue.about}`, query);
  });
  return (
    <div className="space-y-3">
      <Search value={query} onChange={setQuery} placeholder="Search venues" />
      <Chips value={kind} onChange={setKind} options={[{ id: "all", label: "All" }, { id: "restaurant", label: "Restaurants" }, { id: "bar", label: "Bars" }]} />
      <div className="space-y-2">
        {rows.map((venue) => (
          <Link key={venue.id} href={`/venues/${venue.id}`} className="flex gap-3 rounded-2xl bg-white p-2 shadow-sm">
            <Photo src={venue.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-xl" />
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{venue.name}</span>
              <span className="block text-xs text-neutral-500">{venue.typeLabel || venue.cuisine} · {venue.locationLabel || venue.area} · {venue.priceTier || venue.priceLabel}</span>
              <span className="line-clamp-2 block text-xs text-neutral-600">{venue.about}</span>
            </span>
            <span className="self-center pr-1 text-neutral-400">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function EventsTab() {
  const bb = useBB();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const today = iso(0);
  const week = iso(7);
  const tables = [];
  bb.content.venues.forEach((venue) => {
    if (!bb.editing && venue.hidden) return;
    soonestTable(venue).forEach((row) => {
      tables.push({ venue, table: row.table, places: row.hold.places });
    });
  });
  const privates = bb.content.events.filter((event) => event.kind === "private" && (bb.editing || !event.hidden));
  const rows = filter === "private"
    ? privates.filter((event) => queryHits(`${event.name} ${event.description} ${event.location}`, query))
    : tables.filter(({ venue, table }) => {
      if (filter === "today" && table.dateISO !== today) return false;
      if (filter === "week" && (table.dateISO < today || table.dateISO > week)) return false;
      return queryHits(`${venue.name} ${venue.cuisine} ${table.time} ${venue.area}`, query);
    });

  return (
    <div className="space-y-3">
      <Search value={query} onChange={setQuery} placeholder="Search events" />
      <Chips
        value={filter}
        onChange={setFilter}
        options={[
          { id: "all", label: "All" },
          { id: "today", label: "Today" },
          { id: "week", label: "This week" },
          { id: "private", label: "Private" },
        ]}
      />
      <div className="space-y-3">
        {filter === "private" && rows.map((event) => (
          <article key={event.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <Photo src={event.imageUrl} alt="" className="h-32 w-full" />
            <div className="space-y-1 p-3">
              <h2 className="font-semibold">{event.name}</h2>
              <p className="text-xs text-neutral-500">{prettyDate(event.dateISO)} · {event.timeLabel}</p>
              <Link href={`/private/${event.id}`} className="mt-2 block rounded-full bg-black py-2 text-center text-sm text-white">Join</Link>
            </div>
          </article>
        ))}
        {filter !== "private" && rows.map(({ venue, table, places }) => (
          <article key={table.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <Photo src={venue.imageUrl} alt="" className="h-32 w-full" />
            <div className="space-y-1 p-3">
              <h2 className="font-semibold">{venue.name}</h2>
              <p className="text-xs text-neutral-500">{venue.cuisine}</p>
              <p className="text-xs text-neutral-500">{prettyDate(table.dateISO)} · {table.time}</p>
              <p className="text-xs text-neutral-500">{places} seats left</p>
              <button type="button" className="mt-2 w-full rounded-full bg-black py-2 text-sm text-white" onClick={() => bb.setFlow({ type: "join", venueId: venue.id, tableId: table.id })}>Join</button>
            </div>
          </article>
        ))}
        {!rows.length && <p className="py-8 text-center text-sm text-neutral-500">No tables in this list.</p>}
      </div>
    </div>
  );
}

function mySeats(bb) {
  const today = iso(0);
  const seats = [];
  const seen = new Set();
  const add = (seat) => {
    if (!seat.date || seat.date < today) return;
    const key = `${seat.venueId || ""}-${seat.tableId || seat.eventId || seat.name}`;
    if (seen.has(key)) return;
    seen.add(key);
    seats.push(seat);
  };
  (bb.session?.bookings || []).forEach((booking) => {
    if (booking.kind === "private") {
      const event = (bb.content.events || []).find((item) => item.id === booking.id);
      add({
        name: event?.name || booking.name,
        date: event?.dateISO || booking.dateISO,
        time: event?.timeLabel || booking.time,
        place: event?.location || booking.location || "",
        joined: event?.joined || (event?.participants || []).length || 1,
        people: (event?.participants || []).map((p) => p.handle).filter(Boolean),
        venueId: "",
        eventId: booking.id,
      });
      return;
    }
    const venue = (bb.content.venues || []).find((item) => item.id === booking.venueId);
    const table = venue?.tables?.find((item) => item.id === booking.id);
    add({
      name: venue?.name || booking.name,
      date: table?.dateISO || booking.dateISO,
      time: table?.time || booking.time,
      place: table?.address || booking.location || venue?.locationLabel || "",
      joined: table?.joined || (table?.participants || []).length || 1,
      people: (table?.participants || []).map((p) => p.handle).filter(Boolean),
      venueId: booking.venueId || venue?.id || "",
      tableId: booking.id,
    });
  });
  const handle = bb.session?.handle;
  if (handle) {
    (bb.content.venues || []).forEach((venue) => {
      (venue.tables || []).forEach((table) => {
        const onIt = table.hostHandle === handle || (table.participants || []).some((p) => p.handle === handle);
        if (!onIt) return;
        add({
          name: venue.name,
          date: table.dateISO,
          time: table.time,
          place: table.address || venue.locationLabel || "",
          joined: table.joined || (table.participants || []).length || 1,
          people: (table.participants || []).map((p) => p.handle).filter(Boolean),
          venueId: venue.id,
          tableId: table.id,
        });
      });
    });
  }
  return seats.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
}

function phaseOf(date, time) {
  if (date !== iso(0)) return "wait";
  const start = tableStart({ dateISO: date, time }).getTime();
  return Date.now() >= start ? "live" : "soon";
}

function NotifyBox({ phase, onSend }) {
  const options = phase === "live"
    ? [
        ["here", "I'm here"],
        ["miss", "Can't make it tonight"],
      ]
    : [
        ["coming", "I'm coming"],
        ["cant", "Can't make today"],
      ];
  const [choice, setChoice] = useState(options[0][0]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const picked = options.some(([id]) => id === choice) ? choice : options[0][0];
  if (phase === "wait") {
    return <p className="text-sm text-neutral-500">Notify opens on the day.</p>;
  }
  return (
    <div className="space-y-2">
      {options.map(([id, label]) => (
        <button key={id} type="button" onClick={() => setChoice(id)} className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${picked === id ? "bg-black text-white" : "bg-neutral-100"}`}>
          {label}
        </button>
      ))}
      <button
        type="button"
        disabled={busy}
        className="w-full rounded-full bg-black py-2 text-sm text-white disabled:opacity-40"
        onClick={async () => {
          setBusy(true);
          setNote("");
          const res = await onSend(picked);
          setBusy(false);
          setNote(res?.error || "Sent. Only the others on this table get it.");
        }}
      >
        Notify
      </button>
      {note && <p className="text-xs text-neutral-500">{note}</p>}
    </div>
  );
}

function ChatTab() {
  const bb = useBB();
  const [open, setOpen] = useState(null);
  const [choice, setChoice] = useState("see-ya");
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");
  const notes = (bb.social?.notes || []).filter((item) => item.ping || item.title === "Sent" || item.title === "You're booked" || item.title === "Table opened" || item.title === "2-hour reminder" || item.title === "Private event").filter((item) => queryHits(`${item.title} ${item.body}`, query));
  const current = notes.find((item) => item.id === open);
  if (current) {
    const canReply = current.ping && !current.ping.replyOnly && !current.replied;
    const options = current.ping?.kind === "here" || current.ping?.kind === "miss"
      ? [
          ["on-way", "On my way"],
          ["miss-reply", "Next time"],
        ]
      : [
          ["see-ya", "See ya"],
          ["next-time", "All good, next time"],
        ];
    const picked = options.some(([id]) => id === choice) ? choice : options[0][0];
    return (
      <div className="space-y-3">
        <button type="button" className="text-sm text-neutral-500" onClick={() => { setOpen(null); setNote(""); }}>Back</button>
        <h2 className="font-semibold">{current.title}</h2>
        <p className="text-sm">{current.body}</p>
        {canReply && (
          <div className="space-y-2">
            {options.map(([id, label]) => (
              <button key={id} type="button" onClick={() => setChoice(id)} className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${picked === id ? "bg-black text-white" : "bg-white ring-1 ring-black/10"}`}>
                {label}
              </button>
            ))}
            <button
              type="button"
              className="w-full rounded-full bg-black py-2 text-sm text-white"
              onClick={async () => {
                const res = await bb.replyPing({ ...current.ping, choice: picked });
                setNote(res?.error || "Sent. No more replies.");
                if (!res?.error) setOpen(null);
              }}
            >
              Notify
            </button>
          </div>
        )}
        {current.ping?.replyOnly && <p className="text-xs text-neutral-500">No reply on this one.</p>}
        {note && <p className="text-xs text-neutral-500">{note}</p>}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {!bb.session && <p className="text-sm text-neutral-500">Log in to see notifications.</p>}
      {bb.session && !notes.length && <p className="py-8 text-center text-sm text-neutral-500">No notifications yet.</p>}
      {notes.map((item) => (
        <button key={item.id} type="button" onClick={() => setOpen(item.id)} className="flex w-full gap-3 rounded-2xl bg-white p-3 text-left shadow-sm">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-neutral-200 text-sm font-semibold">{(item.body || "B").slice(0, 1).toUpperCase()}</span>
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-2">
              <span className="truncate font-medium">{item.body?.split(" · ")[0] || item.title}</span>
              <span className="shrink-0 text-[10px] text-neutral-400">{item.at ? prettyDate(String(item.at).slice(0, 10)) : ""}</span>
            </span>
            <span className="mt-0.5 block truncate text-sm text-neutral-500">{item.body}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function ProfileTab() {
  const bb = useBB();
  const [open, setOpen] = useState(false);
  const [seat, setSeat] = useState(null);
  const [sent, setSent] = useState("");
  if (!bb.session) {
    return (
      <div className="grid min-h-[50dvh] place-items-center text-center">
        <div>
          <h1 className="text-xl font-semibold">Your profile</h1>
          <p className="mt-2 text-sm text-neutral-500">Log in to see the tables you joined.</p>
          <Link href="/login" className="mt-4 inline-block rounded-full bg-black px-5 py-2 text-sm text-white">Log in</Link>
        </div>
      </div>
    );
  }
  const today = iso(0);
  const seats = mySeats(bb);
  const now = seats.filter((item) => item.date === today);
  const later = seats.filter((item) => item.date > today);
  if (seat) {
    return (
      <div className="space-y-3">
        <button type="button" className="text-sm text-neutral-500" onClick={() => { setSeat(null); setSent(""); }}>Back</button>
        <h2 className="text-lg font-semibold">{seat.name}</h2>
        <p className="text-sm text-neutral-500">{prettyDate(seat.date)} · {seat.time}</p>
        {seat.place && <p className="text-sm text-neutral-500">{seat.place}</p>}
        <p className="text-sm">{seat.joined} joined</p>
        {!!seat.people.length && <p className="text-xs text-neutral-500">{seat.people.join(" · ")}</p>}
        <NotifyBox
          phase={phaseOf(seat.date, seat.time)}
          onSend={async (choice) => {
            const res = await bb.sendPing({ venueId: seat.venueId, tableId: seat.tableId, eventId: seat.eventId, choice });
            setSent(res?.error || "");
            return res;
          }}
        />
        {sent && <p className="text-xs text-neutral-500">{sent}</p>}
      </div>
    );
  }
  const name = bb.session.handle || bb.session.username || "You";
  const rows = [
    ["Account settings", () => setOpen((v) => !v)],
    ["Membership", "/subscribe"],
    ["Payment methods", "/subscribe"],
    ["Language", () => bb.setLang(bb.lang === "en" ? "zh-HK" : bb.lang === "zh-HK" ? "zh" : "en")],
    ["Notifications", "/chat"],
    ["Blocked users", () => {}],
    ["Privacy", "/how"],
    ["Help", "/how"],
  ];
  const list = (title, items) => (
    <section className="mt-4">
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">{title}</h2>
      {!items.length && <p className="rounded-2xl bg-white px-4 py-3 text-sm text-neutral-500">None yet.</p>}
      <div className="space-y-2">
        {items.map((item) => (
          <button key={`${item.venueId}-${item.tableId || item.eventId}`} type="button" onClick={() => setSeat(item)} className="block w-full rounded-2xl bg-white px-4 py-3 text-left shadow-sm">
            <span className="block font-medium">{item.name}</span>
            <span className="block text-xs text-neutral-500">{prettyDate(item.date)} · {item.time} · {item.joined} joined</span>
          </button>
        ))}
      </div>
    </section>
  );
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-neutral-200 text-lg font-semibold">{name.slice(0, 1).toUpperCase()}</div>
        <div>
          <h1 className="text-lg font-semibold">{name}</h1>
          <p className="text-xs text-neutral-500">{bb.plan === "premium" ? "Premium" : bb.plan === "lite" ? "Lite" : "Free"}</p>
        </div>
      </div>
      {list("Today", now)}
      {list("Upcoming", later)}
      <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
        {rows.map(([label, dest]) => (
          typeof dest === "string" ? (
            <Link key={label} href={dest} className="flex items-center justify-between border-b border-black/5 px-4 py-3 text-sm last:border-0">
              {label}<span className="text-neutral-300">›</span>
            </Link>
          ) : (
            <button key={label} type="button" onClick={dest} className="flex w-full items-center justify-between border-b border-black/5 px-4 py-3 text-left text-sm last:border-0">
              {label}<span className="text-neutral-300">›</span>
            </button>
          )
        ))}
      </div>
      {open && (
        <div className="mt-3 rounded-2xl bg-white p-4 text-sm shadow-sm">
          <p>{bb.session.email}</p>
          <p className="text-neutral-500">{bb.session.phone || "No phone yet"}</p>
        </div>
      )}
      <button type="button" onClick={() => bb.logout()} className="mt-4 w-full rounded-2xl bg-white py-3 text-sm text-red-600 shadow-sm">Sign out</button>
    </div>
  );
}

export function PhoneScreen({ tab }) {
  return (
    <main className="min-h-dvh bg-[#f4f4f5] px-4 pb-28 pt-4 text-[#171717]">
      {tab === "home" && <HomeTab />}
      {tab === "venues" && <VenuesTab />}
      {tab === "events" && <EventsTab />}
      {tab === "chat" && <ChatTab />}
      {tab === "profile" && <ProfileTab />}
    </main>
  );
}
