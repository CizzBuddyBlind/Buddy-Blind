"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Editable, Photo } from "@/components/Bits";
import { HostBadge, PingBox, shareLink } from "@/components/Flows";
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
    <main className="bb-frame pb-28 pt-6 md:pb-16">
      <Link href="/" className="text-xs uppercase tracking-[0.14em] text-mute">{t("btn.back")} · {t("venue.back")}</Link>
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
        <div className="relative aspect-[16/9] max-h-[460px]">
          <Photo src={gallery[photo] || venue.imageUrl} alt={venue.imageAlt} onChange={(imageUrl) => update((d) => {
            const v = d.venues.find((x) => x.id === venue.id);
            if (!v) return;
            const next = [...(v.gallery || [])];
            next[photo] = imageUrl;
            v.gallery = next;
            v.galleryVersion = 2;
            if (photo === 0) v.imageUrl = imageUrl;
          })} />
        </div>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto">
        {gallery.map((src, index) => (
          <button key={src + index} type="button" onClick={() => setPhoto(index)} className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border ${photo === index ? "border-ember" : "border-white/10"}`}>
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <div className="mx-auto mt-6 max-w-2xl">
        <p className="font-serif text-3xl tracking-wide text-ember">{venue.priceTier || "$$"}</p>
        <h1 className="mt-2 font-serif text-4xl text-ember-soft">
          <Editable locked={venue.locked} value={venue.name} onChange={(name) => patch({ name })} />
        </h1>
        <p className="mt-3 text-sm text-mute">{t("venue.cuisine")} · <Editable locked={venue.locked} value={venue.cuisine || ""} onChange={(cuisine) => patch({ cuisine })} /></p>
        <p className="mt-1 text-sm text-mute">{t("venue.hours")} · <Editable locked={venue.locked} value={venue.hours || ""} onChange={(hours) => patch({ hours })} /></p>
        <p className="mt-1 text-sm text-mute">{t("venue.good")} · <Editable locked={venue.locked} value={venue.goodFor || ""} onChange={(goodFor) => patch({ goodFor })} /></p>
        {venue.petFriendly && <p className="mt-3 inline-block rounded-full bg-ember px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white">{t("venue.pet")}</p>}
        {editing && (
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!venue.petFriendly} onChange={(e) => patch({ petFriendly: e.target.checked })} />
            {t("venue.pet")}
          </label>
        )}
        <Editable
          as="p"
          className="mt-5 text-base leading-relaxed text-fg/80"
          locked={venue.locked}
          value={venue.about || ""}
          onChange={(about) => patch({ about })}
        />
        <h2 className="mt-8 font-serif text-2xl">{t("venue.where")}</h2>
        <ul className="mt-3 space-y-2 text-sm text-mute">
          {(venue.branches || []).map((branch) => (
            <li key={branch.id}>
              <Editable locked={venue.locked} value={branch.label} onChange={(label) => update((d) => {
                const v = d.venues.find((x) => x.id === venue.id);
                const b = v?.branches?.find((x) => x.id === branch.id);
                if (b) b.label = label;
              })} />
              {" · "}
              <Editable locked={venue.locked} value={branch.address} onChange={(address) => update((d) => {
                const v = d.venues.find((x) => x.id === venue.id);
                const b = v?.branches?.find((x) => x.id === branch.id);
                if (b) b.address = address;
              })} />
            </li>
          ))}
        </ul>
        {editing && (
          <button
            type="button"
            className="mt-3 rounded-full border border-white/15 px-3 py-1 text-xs"
            onClick={() => update((d) => {
              const v = d.venues.find((x) => x.id === venue.id);
              if (!v) return;
              v.branches = [...(v.branches || []), { id: `b-${Date.now().toString(36)}`, label: "NEW", address: "Hong Kong", area: v.area || "central" }];
              v.multiSeeded = true;
            })}
          >
            Add location
          </button>
        )}
        <dl className="mt-6 grid gap-2 text-sm text-mute sm:grid-cols-2">
          <div>Phone · {venue.phone || "—"}</div>
          <div>Email · {venue.email || "—"}</div>
          <div>Bookings via · {venue.contactMethod}</div>
          {venue.website && <div>{venue.website}</div>}
        </dl>
        <div className="mt-8 flex gap-3">
          <button type="button" className="flex-1 rounded-full border border-white/15 py-3 text-sm font-semibold" onClick={() => setFlow({ type: "invite", venueId: venue.id })}>{t("btn.invite")}</button>
          <button type="button" className="flex-1 rounded-full bg-fg py-3 text-sm font-semibold text-ink" onClick={() => setFlow({ type: "join", venueId: venue.id })}>{t("btn.join")}</button>
        </div>
        <h2 className="mt-8 font-serif text-2xl">{t("venue.events")}</h2>
        <div className="mt-3 space-y-3">
          {tables.map(({ table, hold }) => {
            const people = table.participants || [];
            const joined = !!(session && (people.some((p) => p.handle === session.handle) || table.hostHandle === session.handle));
            return (
              <div key={table.id} className="rounded-2xl border border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <HostBadge handle={table.hostHandle} tier={table.hostTier} />
                  <div>
                    <div className="text-sm">{table.hostHandle} {t("host.line")}</div>
                    <div className="text-xs text-mute">{prettyDate(table.dateISO, lang)} · {table.time}</div>
                  </div>
                </div>
                <p className="mt-2 text-sm text-mute">{tablePrefs(table) || "No extra preference"}</p>
                <p className="mt-1 text-sm">{hold.status === "walk-in" ? "Walk-in · restaurant will not hold the table" : `${hold.places} left · ${hold.held} seats held · ${hold.joined} in`}</p>
                <p className="text-xs text-mute">{hold.reason}</p>
                <PingBox table={{ ...table, venueId: venue.id }} joined={joined} onSend={() => bb.sendPing({ venueId: venue.id, tableId: table.id }).then((res) => res?.error && bb.notify(res.error))} />
                <div className="mt-3 flex gap-2">
                  <button type="button" className="rounded-full bg-fg px-4 py-2 text-xs font-semibold text-ink" onClick={() => setFlow({ type: "join", venueId: venue.id, tableId: table.id })}>{t("btn.join")}</button>
                  <button type="button" className="rounded-full border border-white/15 px-4 py-2 text-xs" onClick={() => shareLink(`/share/table/${venue.id}/${table.id}`, venue.name)}>{t("btn.share")}</button>
                </div>
              </div>
            );
          })}
          {tables.length === 0 && <p className="text-sm text-mute">No open table yet. INVITE starts one.</p>}
        </div>
      </div>
    </main>
  );
}
