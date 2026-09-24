"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useBB } from "@/components/Providers";
import { rememberReturn } from "@/components/Flows";
import { bookingHold, prettyDate, tablePrefs } from "@/lib/bible";

export default function ShareTablePage() {
  const { venueId, tableId } = useParams();
  const bb = useBB();
  const venue = bb.content.venues.find((v) => v.id === venueId);
  const table = venue?.tables?.find((item) => item.id === tableId);
  if (!bb.ready) return <main className="bb-frame py-20 text-mute">Loading…</main>;
  if (!venue || !table) {
    return (
      <main className="bb-frame py-20">
        <p>This event is not on the live page.</p>
        <Link href="/" className="mt-4 inline-block text-ember">Buddy Blind</Link>
      </main>
    );
  }
  const hold = bookingHold(table);
  const kind = table.tableType === "blind-date" ? "Blind date" : "Meet friends";
  function enter() {
    if (!bb.session) {
      rememberReturn();
      window.location.href = "/login";
      return;
    }
    bb.setFlow({ type: "join", venueId: venue.id, tableId: table.id });
  }
  return (
    <main className="bb-frame mx-auto max-w-lg pb-28 pt-12">
      <p className="text-xs uppercase tracking-[0.2em] text-ember">Come join me</p>
      <h1 className="mt-3 font-serif text-5xl">{venue.name}</h1>
      <dl className="mt-8 space-y-3 text-sm">
        <div><dt className="text-mute">Where</dt><dd>{table.address || venue.locationLabel}</dd></div>
        <div><dt className="text-mute">When</dt><dd>{prettyDate(table.dateISO, bb.lang)} · {table.time}</dd></div>
        <div><dt className="text-mute">Table</dt><dd>{kind}</dd></div>
        <div><dt className="text-mute">Preference</dt><dd>{tablePrefs(table) || "None"}</dd></div>
        <div><dt className="text-mute">Seats</dt><dd>{hold.places} left</dd></div>
      </dl>
      {!bb.session && (
        <div className="mt-8 rounded-3xl border border-white/10 p-5">
          <p className="font-serif text-2xl">Get Buddy Blind</p>
          <p className="mt-2 text-sm leading-relaxed text-mute">There is no App Store or Google Play listing yet, so this page is the download. Create a seat, then the HK$5 join opens on this same event.</p>
        </div>
      )}
      <button type="button" className="mt-8 rounded-full bg-fg px-6 py-3 text-sm font-semibold text-ink" onClick={enter}>
        {bb.session ? "Join · HK$5" : "Create a seat to join"}
      </button>
    </main>
  );
}
