"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Editable, Photo, Sheet } from "@/components/Bits";
import { useBB } from "@/components/Providers";

const FILTERS = [
  { id: "all", label: "ALL" },
  { id: "tst", label: "TST" },
  { id: "cwb", label: "CWB" },
  { id: "central", label: "CENTRAL" },
  { id: "tonight", label: "TONIGHT" },
];

export default function HomePage() {
  const { content, editing, update, setSelectedId, selectedId, act, notify } = useBB();
  const [filter, setFilter] = useState("all");
  const [sheet, setSheet] = useState(null);
  const venues = content.venues.filter((v) => editing || !v.hidden);
  const shown = useMemo(() => {
    if (filter === "tonight") return venues.filter((v) => v.tonight);
    if (filter !== "all") return venues.filter((v) => v.area === filter);
    return venues;
  }, [venues, filter]);
  const copy = content.copy.venues;

  async function confirmSheet() {
    const res = await act("venue", sheet.id, sheet.mode);
    if (res.needLogin) {
      window.location.href = "/login";
      return;
    }
    if (res.error) notify(res.error);
    else notify(sheet.mode === "invite" ? "Table opened · +2 pts" : "You're in · +1 pt");
    setSheet(null);
  }

  return (
    <main className="bb-frame pb-28 pt-6 md:pb-16">
      <section className="mx-auto max-w-2xl py-8 text-center">
        <div className="mb-7 flex justify-between gap-4 text-mute">
          <Editable className="bb-kicker" value={copy.kickerLeft} onChange={(kickerLeft) => update((d) => { d.copy.venues.kickerLeft = kickerLeft; })} />
          <Editable className="bb-kicker text-right" value={copy.kickerRight} onChange={(kickerRight) => update((d) => { d.copy.venues.kickerRight = kickerRight; })} />
        </div>
        <h1 className="bb-hero-title">
          <Editable value={copy.title} onChange={(title) => update((d) => { d.copy.venues.title = title; })} />
          <br />
          <Editable className="italic text-ember" value={copy.accent} onChange={(accent) => update((d) => { d.copy.venues.accent = accent; })} />
        </h1>
        <Editable
          as="p"
          className="mx-auto mt-4 max-w-md text-[0.9rem] leading-relaxed text-mute"
          value={copy.sub}
          onChange={(sub) => update((d) => { d.copy.venues.sub = sub; })}
        />
      </section>

      <div className="flex gap-2 overflow-x-auto pb-4">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-[0.75rem] font-medium tracking-[0.06em] ${filter === f.id ? "border-fg bg-fg text-ink" : "border-white/15 text-mute"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((venue) => (
          <article
            key={venue.id}
            onClick={() => editing && setSelectedId(venue.id)}
            className={`bb-card transition ${venue.hidden ? "opacity-40" : ""} ${selectedId === venue.id ? "ring-2 ring-ember" : ""} ${venue.locked ? "ring-1 ring-white/20" : ""}`}
          >
            <Link href={`/venues/${venue.id}`} className="bb-img block" onClick={(e) => editing && e.preventDefault()}>
              <Photo
                src={venue.imageUrl}
                alt={venue.imageAlt}
                onChange={(imageUrl) => update((d) => { const v = d.venues.find((x) => x.id === venue.id); if (v) v.imageUrl = imageUrl; })}
              />
              <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[0.7rem] font-semibold text-white">{venue.spots} SPOTS</span>
              <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[0.7rem] font-semibold text-char">{venue.timeLabel}</span>
            </Link>
            <div className="px-4 pb-[18px] pt-4">
              <h3 className="font-serif text-[1.2rem] text-ember-soft">
                <Editable locked={venue.locked} value={venue.name} onChange={(name) => update((d) => { const v = d.venues.find((x) => x.id === venue.id); if (v) v.name = name; })} />
              </h3>
              <p className="mt-1 text-[0.72rem] tracking-wide text-mute">
                <Editable locked={venue.locked} value={venue.typeLabel} onChange={(typeLabel) => update((d) => { const v = d.venues.find((x) => x.id === venue.id); if (v) v.typeLabel = typeLabel; })} />
              </p>
              <p className="text-[0.72rem] tracking-wide text-mute">
                <Editable locked={venue.locked} value={venue.locationLabel} onChange={(locationLabel) => update((d) => { const v = d.venues.find((x) => x.id === venue.id); if (v) v.locationLabel = locationLabel; })} />
              </p>
              <p className="mb-3.5 mt-1 text-[0.8rem] text-mute">
                <Editable locked={venue.locked} value={venue.priceLabel} onChange={(priceLabel) => update((d) => { const v = d.venues.find((x) => x.id === venue.id); if (v) v.priceLabel = priceLabel; })} />
              </p>
              <div className="flex gap-2.5">
                <button type="button" className="flex-1 rounded-full border border-white/15 py-2.5 text-[0.8rem] font-semibold" onClick={() => setSheet({ id: venue.id, name: venue.name, mode: "invite" })}>INVITE</button>
                <button type="button" className="flex-1 rounded-full bg-fg py-2.5 text-[0.8rem] font-semibold text-ink" onClick={() => setSheet({ id: venue.id, name: venue.name, mode: "join" })}>JOIN</button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {shown.length === 0 && <p className="pb-10 text-center text-sm text-mute">Nothing in this filter tonight.</p>}
      <Editable as="p" className="pb-8 text-center text-[0.7rem] tracking-[0.08em] text-mute" value={copy.footer} onChange={(footer) => update((d) => { d.copy.venues.footer = footer; })} />
      <Sheet
        open={!!sheet}
        title={sheet ? `${sheet.mode === "invite" ? "Invite a table" : "Join"} · ${sheet.name}` : ""}
        body={sheet?.mode === "invite" ? "You open the table. HK$5 admin fee in the real checkout. +2 points. Still no faces." : "Free. Instant. +1 point. You still don't know who sits down."}
        confirmLabel={sheet?.mode === "invite" ? "Open table" : "Join"}
        onClose={() => setSheet(null)}
        onConfirm={confirmSheet}
      />
    </main>
  );
}
