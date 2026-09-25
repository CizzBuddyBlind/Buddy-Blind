"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DoneShare, HostBadge, PayDialog, rememberReturn } from "@/components/Flows";
import { useBB } from "@/components/Providers";
import { bookingHold, iso, tableStart } from "@/lib/bible";

function upcoming(content) {
  const today = iso(0);
  const rows = [];
  (content.venues || []).forEach((venue) => {
    if (!venue || venue.hidden) return;
    (venue.tables || []).forEach((table) => {
      if (!table?.dateISO || table.dateISO < today) return;
      const hold = bookingHold(table);
      if (hold.status === "walk-in" || hold.closed) return;
      rows.push({
        kind: "table",
        id: table.id,
        venue,
        table,
        hold,
        joined: hold.joined,
        when: tableStart(table).getTime(),
        name: venue.name,
        image: venue.imageUrl,
        area: (venue.area || venue.locationLabel || "").toString(),
        meta: [venue.locationLabel, venue.cuisine || venue.typeLabel].filter(Boolean).join(" · "),
        about: venue.about || "",
        time: table.time || venue.timeLabel || "",
        spots: hold.places,
        dateISO: table.dateISO,
        host: table.hostHandle,
        tier: table.hostTier,
        seats: hold.original || table.capacity,
        reason: table.tableType === "blind-date" ? "blind date" : venue.cuisine || "dinner",
        hostAbout: venue.about || "",
        href: `/venues/${venue.id}`,
      });
    });
  });
  (content.events || []).forEach((event) => {
    if (!event || event.hidden || event.kind === "quick") return;
    if (event.dateISO && event.dateISO < today) return;
    const spots = Number(event.spots);
    if (Number.isFinite(spots) && spots <= 0) return;
    const joined = Math.max(1, Number(event.joined) || (event.participants || []).length || 1);
    rows.push({
      kind: "private",
      id: event.id,
      event,
      joined,
      when: event.dateISO ? new Date(`${event.dateISO}T12:00:00+08:00`).getTime() : Number.MAX_SAFE_INTEGER,
      name: event.name,
      image: event.imageUrl,
      area: event.location || "",
      meta: [event.location, event.typeLabel].filter(Boolean).join(" · "),
      about: event.description || event.forWhom || "",
      time: event.timeLabel || "",
      spots: Number.isFinite(spots) ? spots : null,
      dateISO: event.dateISO || "",
      host: event.hostName || event.hostHandle || "",
      tier: event.hostTier || "bronze",
      seats: event.capacity || event.spots,
      reason: event.typeLabel || event.forWhom || event.name,
      hostAbout: event.aboutHost || event.description || "",
      href: `/private/${event.id}`,
    });
  });
  rows.sort((a, b) => b.joined - a.joined || a.when - b.when);
  return rows;
}

function exactDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(`${isoDate}T12:00:00`);
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
  return `${wd}, ${d.getDate()} ${mon}`;
}

export default function HomePage() {
  const bb = useBB();
  const rows = useMemo(() => upcoming(bb.content), [bb.content]);
  const featured = rows[0];
  const today = iso(0);
  const events = rows.length;
  const scenes = rows.filter((row) => (row.kind === "table" ? row.table.dateISO : row.event.dateISO) === today).length;
  const stars = (bb.content.peerReviews || []).map((review) => Number(review.stars)).filter((n) => n > 0);
  const rating = stars.length ? (stars.reduce((sum, n) => sum + n, 0) / stars.length).toFixed(1) : "—";
  const hosts = new Set(rows.map((row) => (row.kind === "table" ? row.table.hostHandle : row.event.hostName)).filter(Boolean)).size;
  const [pay, setPay] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  async function confirmPay() {
    if (!pay) return;
    setBusy(true);
    const res = await bb.joinPrivate(pay.id);
    setBusy(false);
    if (res.needLogin) {
      rememberReturn();
      window.location.href = "/login";
      return;
    }
    if (res.error) bb.notify(res.error === "FULL" ? "FULL. No more places." : res.error);
    else {
      setDone(pay);
      setPay(null);
    }
  }

  function joinFeatured() {
    if (!featured) return;
    if (featured.kind === "private") {
      setPay(featured.event);
      return;
    }
    bb.setFlow({ type: "join", venueId: featured.venue.id, tableId: featured.table.id });
  }

  return (
    <main className="bb-frame pb-28 pt-6 md:pb-16 md:pt-8">
      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <section className="@container lg:sticky lg:top-16 lg:flex lg:h-[calc(100dvh-4rem)] lg:flex-col lg:justify-center">
          <p className="text-[0.68rem] uppercase tracking-[0.16em] text-white/50">
            Hong Kong · Tonight · {rows.length} blind boxes / {hosts} hosts / {scenes} scenes
          </p>
          <h1 className="mt-5 font-serif leading-[1.08] text-white">
            <span className="block whitespace-nowrap text-[12cqi]">You don't know</span>
            <span className="block whitespace-nowrap text-[12cqi] italic">who you'll meet.</span>
            <span className="block whitespace-nowrap text-[12cqi] italic text-ember">That's the point.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            Restaurants provide the scene. Private events create the reason.
            <br />
            You bring curiosity.
          </p>
          <Link href="/register" className="mt-5 inline-flex items-center rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink">
            Join Buddy →
          </Link>
          <div className="mt-16 grid grid-cols-3 gap-4 border-t border-white/15 pt-5 md:mt-[5.4rem]">
            <div>
              <p className="bb-figure text-4xl text-white">{events}</p>
              <p className="mt-2 text-[0.62rem] uppercase tracking-[0.14em] text-white/45">Total events</p>
            </div>
            <div>
              <p className="bb-figure text-4xl text-white">{scenes}</p>
              <p className="mt-2 text-[0.62rem] uppercase tracking-[0.14em] text-white/45">Scenes tonight</p>
            </div>
            <div>
              <p className="bb-figure text-4xl text-white">{rating}</p>
              <p className="mt-2 text-[0.62rem] uppercase tracking-[0.14em] text-white/45">Avg after-talk rating</p>
            </div>
          </div>
        </section>

        <section>
          <p className="mb-3 flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-white/55">
            <span className="text-ember">●</span>
            Featured tonight · The blind box we bring
          </p>
          {featured ? (
            <article className="overflow-hidden rounded-[28px] border border-white/10 bg-[#121212]">
              <Link href={featured.href} className="relative block">
                <img src={featured.image} alt="" className="aspect-[16/9] w-full object-cover" />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-black/70 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-white">
                    {[featured.area, featured.time].filter(Boolean).join(" · ")}
                  </span>
                  {featured.spots != null && (
                    <span className="rounded-full bg-ember px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[#1a1408]">
                      {featured.spots} spots left
                    </span>
                  )}
                </div>
              </Link>
              <div className="px-5 pb-6 pt-5">
                <h2 className="font-serif text-3xl text-white">{featured.name}</h2>
                <p className="mt-3 text-sm text-white/75">{exactDate(featured.dateISO)}</p>
                {featured.time && <p className="text-sm text-white/75">{featured.time}</p>}
                <div className="mt-4 text-sm leading-relaxed text-white/80">
                  <p>Join a {featured.reason}</p>
                  <p>meet new friends</p>
                  <p>no pitches, just presence.</p>
                </div>
                <div className="mt-4 flex items-start gap-3">
                  <HostBadge handle={featured.host || "?"} tier={featured.tier} />
                  <div className="text-sm leading-relaxed text-white/70">
                    <p>Hi, come join us.</p>
                    {featured.seats ? <p>A {featured.seats}-seat table.</p> : null}
                    {featured.reason ? <p>{featured.reason}</p> : null}
                  </div>
                </div>
                <button type="button" onClick={joinFeatured} className="mt-5 w-full rounded-full bg-white py-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink">
                  Join
                </button>
              </div>
            </article>
          ) : (
            <div className="rounded-[28px] border border-white/10 px-6 py-16 text-center">
              <p className="text-sm text-white/60">No table open yet.</p>
              <Link href="/venues" className="mt-4 inline-block text-sm text-ember">See the venues</Link>
            </div>
          )}
        </section>
      </div>

      <PayDialog
        open={!!pay}
        title={`Join · ${pay?.name || ""}`}
        lines={[pay?.name, pay?.location, `${pay?.dateISO || ""} · ${pay?.timeLabel || ""}`, pay?.forWhom || pay?.typeLabel]}
        busy={busy}
        onClose={() => setPay(null)}
        onConfirm={confirmPay}
      />
      {done && (
        <DoneShare
          title={done.name}
          lines={[done.location, `${done.dateISO || ""} · ${done.timeLabel || ""}`]}
          path={`/share/private/${done.id}`}
          invite={{ name: done.name, eventId: done.id }}
          onClose={() => setDone(null)}
        />
      )}
    </main>
  );
}
