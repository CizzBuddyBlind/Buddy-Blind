"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Editable, Photo } from "@/components/Bits";
import { HostBadge } from "@/components/Flows";
import { useBB } from "@/components/Providers";
import { translate } from "@/lib/i18n";
import { CUISINES, iso, prettyDate, soonestTable, tablePrefs } from "@/lib/bible";

const FILTERS = [
  { id: "all", key: "filter.all" },
  { id: "tst", key: "filter.tst" },
  { id: "cwb", key: "filter.cwb" },
  { id: "central", key: "filter.central" },
  { id: "tonight", key: "filter.tonight" },
];

function Home() {
  const bb = useBB();
  const { content, editing, update, setSelectedId, selectedId, setFlow, lang } = bb;
  const t = (key) => translate(lang, key);
  const params = useSearchParams();
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(params.get("when") === "today");
  const [extra, setExtra] = useState({
    nearby: "",
    cuisine: "",
    when: params.get("when") || "",
    purpose: "",
  });
  const venues = content.venues.filter((v) => editing || !v.hidden);
  const shown = useMemo(() => {
    const today = iso(0);
    return venues.filter((venue) => {
      if (filter === "tonight" && !venue.tonight && !/today|tonight|now/i.test(venue.timeLabel || "")) return false;
      if (!["all", "tonight"].includes(filter) && venue.area !== filter) return false;
      if (extra.nearby && venue.area !== extra.nearby) return false;
      if (extra.cuisine && venue.cuisine !== extra.cuisine) return false;
      const rows = soonestTable(venue);
      if (extra.when === "today" && !rows.some((row) => row.table.dateISO === today)) return false;
      if (extra.when === "upcoming" && !rows.some((row) => row.table.dateISO > today)) return false;
      if (extra.purpose === "dating" && !(venue.tables || []).some((table) => table.tableType === "blind-date" || table.orientation === "Dating")) return false;
      if (extra.purpose === "gay" && !(venue.tables || []).some((table) => table.orientation === "Gay")) return false;
      if (extra.purpose === "lesbian" && !(venue.tables || []).some((table) => table.orientation === "Lesbian")) return false;
      return true;
    });
  }, [venues, filter, extra]);
  const copy = content.copy.venues;

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
            {t(f.key)}
          </button>
        ))}
        <button type="button" onClick={() => setOpen((v) => !v)} className={`shrink-0 rounded-full border px-4 py-2 text-[0.75rem] font-medium ${open ? "border-ember text-ember" : "border-white/15 text-mute"}`}>
          {t("filter.more")}
        </button>
      </div>
      {open && (
        <div className="mb-5 grid gap-3 rounded-2xl border border-white/10 p-4 text-sm sm:grid-cols-2">
          <label className="block text-mute">{t("filter.nearby")}
            <select value={extra.nearby} onChange={(e) => setExtra({ ...extra, nearby: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-2 py-2 text-fg">
              <option value="">{t("filter.any")}</option>
              <option value="central">{t("filter.central")}</option>
              <option value="cwb">{t("filter.cwb")}</option>
              <option value="tst">{t("filter.tst")}</option>
            </select>
          </label>
          <label className="block text-mute">{t("filter.cuisine")}
            <select value={extra.cuisine} onChange={(e) => setExtra({ ...extra, cuisine: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-2 py-2 text-fg">
              <option value="">{t("filter.any")}</option>
              {CUISINES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            {[["", "filter.any"], ["today", "filter.today"], ["upcoming", "filter.upcoming"]].map(([id, key]) => (
              <button key={key} type="button" onClick={() => setExtra({ ...extra, when: id })} className={`rounded-full border px-3 py-1 ${extra.when === id ? "bg-fg text-ink" : "border-white/15"}`}>{t(key)}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {[["", "filter.any"], ["gay", "filter.gay"], ["lesbian", "filter.lesbian"], ["dating", "filter.dating"]].map(([id, key]) => (
              <button key={key} type="button" onClick={() => setExtra({ ...extra, purpose: id })} className={`rounded-full border px-3 py-1 ${extra.purpose === id ? "bg-fg text-ink" : "border-white/15"}`}>{t(key)}</button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((venue) => {
          const rows = soonestTable(venue);
          const preview = rows[0];
          const more = Math.max(0, rows.length - 1);
          return (
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
                <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[0.7rem] font-semibold text-white">{venue.spots} {t("spots")}</span>
                <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[0.7rem] font-semibold text-char">{venue.timeLabel}</span>
              </Link>
              <div className="px-4 pb-[18px] pt-4">
                <h3 className="font-serif text-[1.2rem] text-ember-soft">
                  <Editable locked={venue.locked} value={venue.name} onChange={(name) => update((d) => { const v = d.venues.find((x) => x.id === venue.id); if (v) v.name = name; })} />
                </h3>
                <p className="mt-1 text-[0.72rem] tracking-wide text-mute">
                  <Editable locked={venue.locked} value={venue.cuisine || venue.typeLabel} onChange={(cuisine) => update((d) => { const v = d.venues.find((x) => x.id === venue.id); if (v) v.cuisine = cuisine; })} />
                </p>
                <p className="text-[0.72rem] tracking-wide text-mute">
                  <Editable locked={venue.locked} value={venue.locationLabel} onChange={(locationLabel) => update((d) => { const v = d.venues.find((x) => x.id === venue.id); if (v) v.locationLabel = locationLabel; })} />
                </p>
                <p className="mt-1 text-[0.8rem] text-mute">
                  <Editable locked={venue.locked} value={venue.priceLabel} onChange={(priceLabel) => update((d) => { const v = d.venues.find((x) => x.id === venue.id); if (v) v.priceLabel = priceLabel; })} />
                </p>
                {preview && (
                  <div className="mb-3 mt-3 rounded-xl bg-white/5 px-3 py-2 text-[0.75rem]">
                    <div className="flex items-center gap-2">
                      <HostBadge handle={preview.table.hostHandle} tier={preview.table.hostTier} />
                      <span>{preview.table.hostHandle} {t("host.line")}</span>
                    </div>
                    <p className="mt-2 text-mute">{prettyDate(preview.table.dateISO, lang)} · {preview.table.time} · {preview.hold.held} people · {preview.hold.places} left</p>
                    <p className="text-mute">{tablePrefs(preview.table)}</p>
                    {more > 0 && <p className="mt-1 text-ember">+ {t("moreEvents")}</p>}
                  </div>
                )}
                <div className="mt-3 flex gap-2.5">
                  <button type="button" className="flex-1 rounded-full border border-white/15 py-2.5 text-[0.8rem] font-semibold" onClick={() => setFlow({ type: "invite", venueId: venue.id })}>{t("btn.invite")}</button>
                  <button type="button" className="flex-1 rounded-full bg-fg py-2.5 text-[0.8rem] font-semibold text-ink" onClick={() => setFlow({ type: "join", venueId: venue.id })}>{t("btn.join")}</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {shown.length === 0 && <p className="pb-10 text-center text-sm text-mute">Nothing in this filter.</p>}
      <Editable as="p" className="pb-8 text-center text-[0.7rem] tracking-[0.08em] text-mute" value={copy.footer} onChange={(footer) => update((d) => { d.copy.venues.footer = footer; })} />
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<main className="bb-frame py-20 text-mute">Loading venues…</main>}>
      <Home />
    </Suspense>
  );
}
