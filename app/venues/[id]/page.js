"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Editable, Photo } from "@/components/Bits";
import { HostBadge, ShareSheet } from "@/components/Flows";
import { useBB } from "@/components/Providers";
import { translate } from "@/lib/i18n";
import { bookingHold, prettyDate, tablePrefs } from "@/lib/bible";

export default function VenuePage() {
  const { id } = useParams();
  const bb = useBB();
  const { content, update, setFlow, lang, editing, session, ready } = bb;
  const t = (key) => translate(lang, key);
  const venue = content.venues.find((v) => v.id === id);
  const [photo, setPhoto] = useState(0);
  const [share, setShare] = useState(null);
  if (!ready) {
    return <main className="bb-frame py-20 text-center text-mute">Loading…</main>;
  }
  if (!venue) {
    return (
      <main className="bb-frame py-20 text-center">
        <p className="text-mute">That place isn't here.</p>
        <Link href="/" className="mt-4 inline-block text-ember">{t("btn.back")}</Link>
      </main>
    );
  }
  const gallery = venue.gallery?.length ? venue.gallery : [venue.imageUrl];
  const tables = (venue.tables || [])
    .map((table) => ({ table, hold: bookingHold(table) }))
    .filter(({ hold }) => !hold.closed && hold.places > 0);
  const shot = Math.min(photo, Math.max(0, gallery.length - 1));

  function patch(partial) {
    update((d) => {
      const row = d.venues.find((v) => v.id === venue.id);
      if (row) Object.assign(row, partial);
    });
  }

  function nextPhoto() {
    setPhoto((n) => (n + 1) % gallery.length);
  }

  return (
    <main className="bb-frame pb-28 pt-6 md:pb-16">
      <Link href="/" className="text-xs uppercase tracking-[0.16em] text-mute hover:text-ember">{t("btn.back")}</Link>
      <div className="mt-4 grid items-start gap-8 md:grid-cols-2">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-card">
            <div className="absolute inset-0">
              <Photo src={gallery[shot] || venue.imageUrl} alt={venue.imageAlt} className="bb-zoom" onChange={(imageUrl) => update((d) => {
                const v = d.venues.find((x) => x.id === venue.id);
                if (!v) return;
                const next = [...(v.gallery?.length ? v.gallery : [v.imageUrl])];
                next[shot] = imageUrl;
                v.gallery = next;
                v.galleryVersion = 2;
                if (shot === 0) v.imageUrl = imageUrl;
              })} />
            </div>
            {gallery.length > 1 && (
              <button
                type="button"
                aria-label="Next photo"
                onPointerDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.preventDefault();
                  const y = window.scrollY;
                  nextPhoto();
                  requestAnimationFrame(() => window.scrollTo(0, y));
                }}
                className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur hover:bg-ember"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
              </button>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {gallery.map((src, index) => (
                <button key={src + index} type="button" onClick={() => setPhoto(index)} className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border ${shot === index ? "border-ember" : "border-white/10 hover:border-white/40"}`}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ember">
            <Editable locked={venue.locked} value={venue.cuisine || ""} onChange={(cuisine) => patch({ cuisine })} />
          </p>
          <h1 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">
            <Editable locked={venue.locked} value={venue.name} onChange={(name) => patch({ name })} />
          </h1>
          <p className="mt-3 text-sm text-mute">
            <Editable locked={venue.locked} value={venue.locationLabel || ""} onChange={(locationLabel) => patch({ locationLabel })} />
            {" · "}
            {venue.priceTier}
            {" · "}
            <Editable locked={venue.locked} value={venue.hours || ""} onChange={(hours) => patch({ hours })} />
          </p>
          {venue.petFriendly && <p className="mt-3 inline-flex rounded-full border border-ember/40 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-ember">{t("venue.pet")}</p>}
          {editing && (
            <label className="mt-3 flex items-center gap-2 text-sm text-mute">
              <input type="checkbox" checked={!!venue.petFriendly} onChange={(e) => patch({ petFriendly: e.target.checked })} />
              {t("venue.pet")}
            </label>
          )}
          <Editable as="p" className="mt-6 text-base leading-relaxed text-fg/90" locked={venue.locked} value={venue.about || ""} onChange={(about) => patch({ about })} />
          {(venue.goodFor || editing) && (
            <p className="mt-3 text-sm text-mute">
              {t("venue.good")} · <Editable locked={venue.locked} value={venue.goodFor || ""} onChange={(goodFor) => patch({ goodFor })} />
            </p>
          )}
          {(venue.branches || []).length > 0 && (
            <ul className="mt-4 space-y-1 text-sm text-mute">
              {(venue.branches || []).map((branch) => (
                <li key={branch.id}>
                  <Editable locked={venue.locked} value={branch.label} onChange={(label) => update((d) => {
                    const b = d.venues.find((x) => x.id === venue.id)?.branches?.find((x) => x.id === branch.id);
                    if (b) b.label = label;
                  })} />
                  {" · "}
                  <Editable locked={venue.locked} value={branch.address} onChange={(address) => update((d) => {
                    const b = d.venues.find((x) => x.id === venue.id)?.branches?.find((x) => x.id === branch.id);
                    if (b) b.address = address;
                  })} />
                </li>
              ))}
            </ul>
          )}
          {editing && (
            <button type="button" className="mt-3 text-xs uppercase tracking-[0.14em] text-ember" onClick={() => update((d) => {
              const v = d.venues.find((x) => x.id === venue.id);
              if (!v) return;
              v.branches = [...(v.branches || []), { id: `b-${Date.now().toString(36)}`, label: "NEW", address: "Hong Kong", area: v.area || "central" }];
              v.multiSeeded = true;
            })}>Add location</button>
          )}

          {tables.length > 0 && (
            <div className="mt-8">
              <h2 className="font-serif text-2xl">{t("venue.events")}</h2>
              <div className="mt-3 divide-y divide-white/10 border-y border-white/10">
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
                    <article key={table.id} className="bb-row py-4">
                      <div className="flex items-center gap-3">
                        <HostBadge handle={table.hostHandle} tier={table.hostTier} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm">{prettyDate(table.dateISO, lang)} · {table.time}</p>
                          <p className="text-xs text-mute">{tablePrefs(table) || "Meet friends"} · {hold.places} left</p>
                        </div>
                        <button type="button" className="rounded-full bg-fg px-4 py-2 text-xs font-semibold text-ink" onClick={() => setFlow({ type: "join", venueId: venue.id, tableId: table.id })}>{t("btn.join")}</button>
                        <button type="button" className="rounded-full border border-white/15 px-4 py-2 text-xs" onClick={() => setShare({ joined, lines, path: `/share/table/${venue.id}/${table.id}` })}>{t("btn.share")}</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button type="button" className="flex-1 rounded-full border border-white/15 py-3 text-sm" onClick={() => setFlow({ type: "invite", venueId: venue.id })}>{t("btn.invite")}</button>
            <button type="button" className="flex-1 rounded-full bg-fg py-3 text-sm font-semibold text-ink" onClick={() => setFlow({ type: "join", venueId: venue.id })}>{t("btn.join")}</button>
            <button
              type="button"
              className="flex-1 rounded-full border border-ember py-3 text-sm text-ember"
              onClick={() => {
                if (!bb.session) {
                  window.location.href = "/login";
                  return;
                }
                setFlow({ type: "private-create", venueId: venue.id });
              }}
            >
              {t("btn.host")}
            </button>
          </div>
        </div>
      </div>
      <ShareSheet open={!!share} onClose={() => setShare(null)} joined={share?.joined} lines={share?.lines || []} path={share?.path || "/"} />
    </main>
  );
}
