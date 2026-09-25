"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DoneShare, HostBadge, PayDialog, ShareSheet, rememberReturn } from "@/components/Flows";
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
        home: table.homeCard || null,
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
  const [share, setShare] = useState(false);

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
        <section className="bb-home-hero lg:sticky lg:top-16 lg:flex lg:h-[calc(100dvh-4rem)] lg:flex-col lg:justify-center">
          <p className="text-[0.68rem] uppercase tracking-[0.16em] text-white/50">
            Hong Kong · Tonight · {rows.length} blind boxes / {hosts} hosts / {scenes} scenes
          </p>
          <h1 className="mt-16 font-serif text-white md:mt-[5.4rem]">
            <span>You don't know</span>
            <span className="italic">who you'll meet.</span>
            <span className="italic text-ember">That's the point.</span>
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

        <section className="lg:flex lg:min-h-[calc(100dvh-4rem)] lg:flex-col lg:justify-center lg:py-8">
          <p className="mb-3 flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-white/55">
            <span className="text-ember">●</span>
            Featured tonight · One blind box open
          </p>
          {featured ? (
            <article className="overflow-hidden rounded-[28px] border border-white/10 bg-[#161616]">
              <div className="relative">
                <Link href={featured.href} className="block">
                  <img src={featured.image} alt="" className="aspect-[16/10] w-full object-cover" />
                </Link>
                <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-black/75 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white">{featured.home?.when || [featured.area, featured.time].filter(Boolean).join(" · ")}</span>
                  <span className="rounded-full bg-ember px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#1a1408]">{featured.home?.spots || `${featured.spots ?? 0} spots left`}</span>
                </div>
                <div className="absolute right-3 top-4">
                  <HostBadge handle={featured.host || "C"} tier={featured.tier || "bronze"} />
                </div>
                <Link href="/how" className="absolute bottom-3 left-3 grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-semibold text-ink">?</Link>
                <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/75 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white">{featured.home?.chip || featured.meta}</span>
              </div>
              <div className="px-5 pb-5 pt-5">
                <h2 className="font-serif text-[2.6rem] leading-none text-white">{featured.name}</h2>
                <p className="mt-3 text-[11px] uppercase leading-relaxed tracking-[0.14em] text-white/45">{featured.home?.meta || featured.meta}</p>
                <p className="mt-4 text-[13px] uppercase leading-relaxed tracking-[0.04em] text-white/85">{featured.home?.invite || `Join a ${featured.reason} and meet new friends — no pitches, just presence.`}</p>
                <button type="button" onClick={() => setShare(true)} className="mt-4 rounded-full border border-white/25 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">Share</button>
                <p className="mt-4 text-sm leading-relaxed text-white/75">{featured.home?.about || featured.hostAbout}</p>
                <div className="mt-5 flex items-center gap-3">
                  <button type="button" onClick={joinFeatured} className="flex-1 rounded-full bg-white px-4 py-3.5 text-[13px] font-semibold text-ink">Love it. Let's do this.</button>
                  <Link href="/venues" className="rounded-full border border-white/25 px-5 py-3.5 text-[13px] font-semibold text-white">Explore more</Link>
                </div>
                {featured.home?.foot && <p className="mt-4 text-[10px] uppercase leading-relaxed tracking-[0.08em] text-white/35">{featured.home.foot}</p>}
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

      <ShareSheet
        open={share}
        onClose={() => setShare(false)}
        lines={[featured?.name, featured?.home?.when, featured?.home?.invite]}
        path={featured?.kind === "table" ? `/share/table/${featured.venue.id}/${featured.table.id}` : `/share/private/${featured?.id || ""}`}
      />
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
