"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Editable, Photo } from "@/components/Bits";
import { HostBadge, PingBox, ShareSheet } from "@/components/Flows";
import { useBB } from "@/components/Providers";
import { translate } from "@/lib/i18n";
import { bookingHold, prettyDate, tablePrefs } from "@/lib/bible";

export default function VenuePage() {
  const { id } = useParams();
  const bb = useBB();
  const { content, update, setFlow, lang, editing, session } = bb;
  const t = (key) => translate(lang, key);
  const venue = content.venues.find((v) => v.id === id);
  const [photo, setPhoto] = useState(0);
  const [share, setShare] = useState(null);
  if (!venue) {
    return (
      <main className="bb-frame py-20 text-center">
        <p className="text-mute">That restaurant isn't on the page.</p>
        <Link href="/" className="mt-4 inline-block text-ember">{t("btn.back")}</Link>
      </main>
    );
  }
  const gallery = venue.gallery?.length ? venue.gallery : [venue.imageUrl];
  const tables = (venue.tables || []).map((table) => ({ table, hold: bookingHold(table) }));

  function patch(partial) {
    update((d) => {
      const row = d.venues.find((v) => v.id === venue.id);
      if (row) Object.assign(row, partial);
    });
  }

  return (
    <main className="pb-36">
      <div className="bb-frame pt-6">
        <Link href="/" className="text-xs uppercase tracking-[0.16em] text-mute hover:text-ember">{t("btn.back")}</Link>
      </div>
      <figure className="bb-zoom-wrap bb-sheet relative mx-auto mt-4 max-w-6xl overflow-hidden px-4">
        <div className="relative aspect-[16/10] max-h-[72vh] overflow-hidden rounded-[1.6rem] bg-card">
          <Photo src={gallery[photo] || venue.imageUrl} alt={venue.imageAlt} className="bb-zoom" onChange={(imageUrl) => update((d) => {
            const v = d.venues.find((x) => x.id === venue.id);
            if (!v) return;
            const next = [...(v.gallery || [])];
            next[photo] = imageUrl;
            v.gallery = next;
            v.galleryVersion = 2;
            if (photo === 0) v.imageUrl = imageUrl;
          })} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
          <figcaption className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <p className="text-xs uppercase tracking-[0.22em] text-white/70">{venue.priceTier} · {venue.area?.toUpperCase()}</p>
            <h1 className="mt-2 max-w-3xl font-serif text-4xl text-white sm:text-6xl">
              <Editable locked={venue.locked} value={venue.name} onChange={(name) => patch({ name })} />
            </h1>
            <p className="mt-3 text-sm text-white/75">
              <Editable locked={venue.locked} value={venue.cuisine || ""} onChange={(cuisine) => patch({ cuisine })} />
              {" · "}
              <Editable locked={venue.locked} value={venue.locationLabel || ""} onChange={(locationLabel) => patch({ locationLabel })} />
            </p>
          </figcaption>
        </div>
      </figure>

      {gallery.length > 1 && (
        <div className="bb-frame mt-4 flex gap-2 overflow-x-auto">
          {gallery.map((src, index) => (
            <button key={src + index} type="button" onClick={() => setPhoto(index)} className={`h-16 w-24 shrink-0 overflow-hidden rounded-xl border ${photo === index ? "border-ember" : "border-white/10 hover:border-white/40"}`}>
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="bb-frame mx-auto mt-10 grid max-w-6xl gap-10 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <Editable as="p" className="max-w-xl font-serif text-2xl leading-snug text-fg/90" locked={venue.locked} value={venue.about || ""} onChange={(about) => patch({ about })} />
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-mute">
            {t("venue.good")} · <Editable locked={venue.locked} value={venue.goodFor || ""} onChange={(goodFor) => patch({ goodFor })} />
          </p>
          {venue.petFriendly && <p className="mt-5 inline-flex rounded-full border border-ember/40 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-ember">{t("venue.pet")}</p>}
          {editing && (
            <label className="mt-4 flex items-center gap-2 text-sm text-mute">
              <input type="checkbox" checked={!!venue.petFriendly} onChange={(e) => patch({ petFriendly: e.target.checked })} />
              {t("venue.pet")}
            </label>
          )}
        </div>
        <aside className="space-y-4 border-t border-white/10 pt-6 text-sm lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <p className="text-[11px] uppercase tracking-[0.16em] text-mute">{t("venue.hours")}</p>
          <p><Editable locked={venue.locked} value={venue.hours || ""} onChange={(hours) => patch({ hours })} /></p>
          <p className="pt-2 text-[11px] uppercase tracking-[0.16em] text-mute">{t("venue.where")}</p>
          <ul className="space-y-2 text-mute">
            {(venue.branches || []).map((branch) => (
              <li key={branch.id}>
                <span className="text-fg"><Editable locked={venue.locked} value={branch.label} onChange={(label) => update((d) => {
                  const b = d.venues.find((x) => x.id === venue.id)?.branches?.find((x) => x.id === branch.id);
                  if (b) b.label = label;
                })} /></span>
                <span className="block"><Editable locked={venue.locked} value={branch.address} onChange={(address) => update((d) => {
                  const b = d.venues.find((x) => x.id === venue.id)?.branches?.find((x) => x.id === branch.id);
                  if (b) b.address = address;
                })} /></span>
              </li>
            ))}
          </ul>
          {editing && (
            <button type="button" className="text-xs uppercase tracking-[0.14em] text-ember" onClick={() => update((d) => {
              const v = d.venues.find((x) => x.id === venue.id);
              if (!v) return;
              v.branches = [...(v.branches || []), { id: `b-${Date.now().toString(36)}`, label: "NEW", address: "Hong Kong", area: v.area || "central" }];
              v.multiSeeded = true;
            })}>Add location</button>
          )}
          <p className="pt-2 text-mute">{venue.phone || "—"} · {venue.email || "—"}</p>
        </aside>
      </div>

      <section className="bb-frame mx-auto mt-14 max-w-6xl">
        <h2 className="font-serif text-3xl">{t("venue.events")}</h2>
        <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
          {tables.map(({ table, hold }) => {
            const people = table.participants || [];
            const joined = !!(session && (people.some((p) => p.handle === session.handle) || table.hostHandle === session.handle));
            const lines = [
              venue.name,
              table.address || venue.locationLabel,
              `${prettyDate(table.dateISO, lang)} · ${table.time}`,
              tablePrefs(table) || "Meet friends",
              `${hold.places} seats left`,
            ];
            return (
              <article key={table.id} className="bb-row grid gap-4 py-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <HostBadge handle={table.hostHandle} tier={table.hostTier} />
                    <div>
                      <p className="text-sm">{table.hostHandle} {t("host.line")}</p>
                      <p className="text-xs text-mute">{prettyDate(table.dateISO, lang)} · {table.time}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-mute">{tablePrefs(table) || "Meet friends"} · {hold.places} left</p>
                  <PingBox table={{ ...table, venueId: venue.id }} joined={joined} onSend={() => bb.sendPing({ venueId: venue.id, tableId: table.id }).then((res) => res?.error && bb.notify(res.error))} />
                </div>
                <div className="flex gap-2">
                  <button type="button" className="rounded-full bg-fg px-5 py-2.5 text-xs font-semibold text-ink" onClick={() => setFlow({ type: "join", venueId: venue.id, tableId: table.id })}>{t("btn.join")} · HK$5</button>
                  <button type="button" className="rounded-full border border-white/15 px-5 py-2.5 text-xs" onClick={() => setShare({ joined, lines, path: `/share/table/${venue.id}/${table.id}` })}>{t("btn.share")}</button>
                </div>
              </article>
            );
          })}
          {tables.length === 0 && <p className="py-8 text-sm text-mute">No open table yet.</p>}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-white/10 bg-ink/90 px-4 py-3 backdrop-blur md:bottom-0">
        <div className="mx-auto flex max-w-6xl gap-3">
          <button type="button" className="flex-1 rounded-full border border-white/15 py-3 text-sm" onClick={() => setFlow({ type: "invite", venueId: venue.id })}>{t("btn.invite")} · HK$5</button>
          <button type="button" className="flex-1 rounded-full bg-fg py-3 text-sm font-semibold text-ink" onClick={() => setFlow({ type: "join", venueId: venue.id })}>{t("btn.join")} · HK$5</button>
        </div>
      </div>
      <ShareSheet open={!!share} onClose={() => setShare(null)} joined={share?.joined} lines={share?.lines || []} path={share?.path || "/"} />
    </main>
  );
}
