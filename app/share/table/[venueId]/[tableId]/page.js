"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useBB } from "@/components/Providers";
import { HostBadge } from "@/components/Flows";
import { bookingHold, prettyDate, tablePrefs } from "@/lib/bible";
import { translate } from "@/lib/i18n";

export default function ShareTablePage() {
  const { venueId, tableId } = useParams();
  const bb = useBB();
  const t = (key) => translate(bb.lang, key);
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
  return (
    <main className="bb-frame mx-auto max-w-lg pb-28 pt-10">
      <p className="bb-kicker text-ember">Shared event</p>
      <h1 className="mt-3 font-serif text-4xl">{venue.name}</h1>
      <p className="mt-2 text-mute">{venue.locationLabel}</p>
      <div className="mt-6 flex items-center gap-3">
        <HostBadge handle={table.hostHandle} tier={table.hostTier} />
        <p>{table.hostHandle} {t("host.line")}</p>
      </div>
      <ul className="mt-6 space-y-1 text-sm text-mute">
        <li>{prettyDate(table.dateISO, bb.lang)} · {table.time}</li>
        <li>{tablePrefs(table) || "Meet friends"}</li>
        <li>{hold.places} places left · {hold.status}</li>
      </ul>
      <p className="mt-4 text-sm">{t("share.cta")}</p>
      <button type="button" className="mt-6 rounded-full bg-fg px-5 py-3 text-sm font-semibold text-ink" onClick={() => bb.setFlow({ type: "join", venueId: venue.id, tableId: table.id })}>
        {t("btn.join")}
      </button>
    </main>
  );
}
