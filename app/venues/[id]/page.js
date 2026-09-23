"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Editable, Photo } from "@/components/Bits";
import { HostBadge, shareLink } from "@/components/Flows";
import { useBB } from "@/components/Providers";
import { bookingHold, prettyDate, tablePrefs } from "@/lib/bible";

export default function VenuePage() {
  const { id } = useParams();
  const { content, update, setFlow, lang } = useBB();
  const venue = content.venues.find((v) => v.id === id);
  const [photo, setPhoto] = useState(0);
  if (!venue) {
    return (
      <main className="bb-frame py-20 text-center">
        <p className="text-mute">That table isn't on the page.</p>
        <Link href="/" className="mt-4 inline-block text-ember">Go back</Link>
      </main>
    );
  }
  const gallery = venue.gallery?.length ? venue.gallery : [venue.imageUrl];
  const tables = (venue.tables || []).map((table) => ({ table, hold: bookingHold(table) }));

  return (
    <main className="bb-frame pb-28 pt-6 md:pb-16">
      <Link href="/" className="text-xs uppercase tracking-[0.14em] text-mute">Go back · Venues</Link>
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
        <div className="relative aspect-[16/9] max-h-[460px]">
          <Photo src={gallery[photo] || venue.imageUrl} alt={venue.imageAlt} onChange={(imageUrl) => update((d) => {
            const v = d.venues.find((x) => x.id === venue.id);
            if (!v) return;
            v.imageUrl = imageUrl;
            v.gallery = [imageUrl, ...(v.gallery || []).slice(1)];
          })} />
        </div>
      </div>
      {gallery.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {gallery.map((src, index) => (
            <button key={src + index} type="button" onClick={() => setPhoto(index)} className={`h-16 w-24 overflow-hidden rounded-lg border ${photo === index ? "border-ember" : "border-white/10"}`}>
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="mx-auto mt-6 max-w-2xl">
        <p className="text-xs tracking-[0.14em] text-mute">{venue.cuisine} · {venue.priceTier} · {venue.hours}</p>
        <h1 className="mt-2 font-serif text-4xl text-ember-soft">
          <Editable locked={venue.locked} value={venue.name} onChange={(name) => update((d) => { const v = d.venues.find((x) => x.id === venue.id); if (v) v.name = name; })} />
        </h1>
        <p className="mt-2 text-sm text-mute">{venue.typeLabel} · {venue.locationLabel}</p>
        <Editable
          as="p"
          className="mt-5 text-base leading-relaxed text-fg/80"
          locked={venue.locked}
          value={venue.about || ""}
          onChange={(about) => update((d) => { const v = d.venues.find((x) => x.id === venue.id); if (v) v.about = about; })}
        />
        <dl className="mt-6 grid gap-2 text-sm text-mute sm:grid-cols-2">
          <div>Address · {venue.address}</div>
          <div>Phone · {venue.phone || "—"}</div>
          <div>Email · {venue.email || "—"}</div>
          <div>Bookings via · {venue.contactMethod}</div>
          {(venue.branches || []).length > 1 && (
            <div className="sm:col-span-2">Branches · {venue.branches.map((b) => `${b.label} ${b.address}`).join(" · ")}</div>
          )}
        </dl>
        <h2 className="mt-8 font-serif text-2xl">Available events</h2>
        <div className="mt-3 space-y-3">
          {tables.map(({ table, hold }) => (
            <div key={table.id} className="rounded-2xl border border-white/10 p-4">
              <div className="flex items-center gap-3">
                <HostBadge handle={table.hostHandle} tier={table.hostTier} />
                <div>
                  <div className="text-sm">{table.hostHandle} invites you.</div>
                  <div className="text-xs text-mute">{prettyDate(table.dateISO, lang)} · {table.time}</div>
                </div>
              </div>
              <p className="mt-2 text-sm text-mute">{tablePrefs(table) || "Meet friends"} · {hold.places} left · hold {hold.held} / original {hold.original}</p>
              <p className="text-xs text-mute">{hold.reason}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" disabled={hold.closed} className="rounded-full bg-fg px-4 py-2 text-xs font-semibold text-ink disabled:opacity-40" onClick={() => setFlow({ type: "join", venueId: venue.id, tableId: table.id })}>JOIN</button>
                <button type="button" className="rounded-full border border-white/15 px-4 py-2 text-xs" onClick={() => shareLink(`/share/table/${venue.id}/${table.id}`, `${venue.name} · ${table.time}`)}>Share</button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex gap-3">
          <button type="button" className="flex-1 rounded-full border border-white/15 py-3 text-sm font-semibold" onClick={() => setFlow({ type: "invite", venueId: venue.id })}>INVITE</button>
          <button type="button" className="flex-1 rounded-full bg-fg py-3 text-sm font-semibold text-ink" onClick={() => setFlow({ type: "join", venueId: venue.id })}>JOIN</button>
        </div>
      </div>
    </main>
  );
}
