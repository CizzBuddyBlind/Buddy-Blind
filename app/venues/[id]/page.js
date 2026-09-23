"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Editable, Photo, Sheet } from "@/components/Bits";
import { useBB } from "@/components/Providers";

export default function VenuePage() {
  const { id } = useParams();
  const { content, update, act, notify } = useBB();
  const venue = content.venues.find((v) => v.id === id);
  const [sheet, setSheet] = useState(null);
  if (!venue) {
    return (
      <main className="bb-frame py-20 text-center">
        <p className="text-mute">That table isn't on the page.</p>
        <Link href="/" className="mt-4 inline-block text-ember">Back to venues</Link>
      </main>
    );
  }

  async function confirmSheet() {
    const res = await act("venue", venue.id, sheet);
    if (res.needLogin) {
      window.location.href = "/login";
      return;
    }
    if (res.error) notify(res.error);
    else notify(sheet === "invite" ? "Table opened · +2 pts" : "You're in · +1 pt");
    setSheet(null);
  }

  return (
    <main className="bb-frame pb-28 pt-6 md:pb-16">
      <Link href="/" className="text-xs uppercase tracking-[0.14em] text-mute">Venues</Link>
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
        <div className="relative aspect-[16/9] max-h-[460px]">
          <Photo src={venue.imageUrl} alt={venue.imageAlt} onChange={(imageUrl) => update((d) => { const v = d.venues.find((x) => x.id === venue.id); if (v) v.imageUrl = imageUrl; })} />
        </div>
      </div>
      <div className="mx-auto mt-6 max-w-2xl">
        <p className="text-xs tracking-[0.14em] text-mute">{venue.spots} SPOTS · {venue.timeLabel}</p>
        <h1 className="mt-2 font-serif text-4xl text-ember-soft">
          <Editable locked={venue.locked} value={venue.name} onChange={(name) => update((d) => { const v = d.venues.find((x) => x.id === venue.id); if (v) v.name = name; })} />
        </h1>
        <p className="mt-2 text-sm text-mute">{venue.typeLabel} · {venue.locationLabel} · {venue.priceLabel}</p>
        <Editable
          as="p"
          className="mt-5 text-base leading-relaxed text-fg/80"
          locked={venue.locked}
          value={venue.about || ""}
          onChange={(about) => update((d) => { const v = d.venues.find((x) => x.id === venue.id); if (v) v.about = about; })}
        />
        <div className="mt-8 flex gap-3">
          <button type="button" className="flex-1 rounded-full border border-white/15 py-3 text-sm font-semibold" onClick={() => setSheet("invite")}>INVITE</button>
          <button type="button" className="flex-1 rounded-full bg-fg py-3 text-sm font-semibold text-ink" onClick={() => setSheet("join")}>JOIN</button>
        </div>
      </div>
      <Sheet
        open={!!sheet}
        title={`${sheet === "invite" ? "Invite" : "Join"} · ${venue.name}`}
        body={sheet === "invite" ? "You host the blind table. +2 points." : "You take an open seat. +1 point. Still no faces."}
        confirmLabel={sheet === "invite" ? "Open table" : "Join"}
        onClose={() => setSheet(null)}
        onConfirm={confirmSheet}
      />
    </main>
  );
}
