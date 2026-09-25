"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Copy, Editable, Photo } from "@/components/Bits";
import { HostBadge } from "@/components/Flows";
import { useBB } from "@/components/Providers";
import { translate } from "@/lib/i18n";
import { CUISINES, iso, queryHits, soonestTable, tablePrefs } from "@/lib/bible";

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
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
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
      const rows = soonestTable(venue);
      const hasToday = rows.some((row) => row.table.dateISO === today) || /today|tonight/i.test(venue.timeLabel || "");
      const hasTonight = venue.tonight || /today|tonight|now/i.test(venue.timeLabel || "") || rows.some((row) => row.table.dateISO === today);
      if (filter === "tonight" && !hasTonight) return false;
      if (!["all", "tonight"].includes(filter) && venue.area !== filter) return false;
      if (extra.nearby && venue.area !== extra.nearby) return false;
      if (extra.cuisine && venue.cuisine !== extra.cuisine) return false;
      if (extra.when === "today" && !rows.some((row) => row.table.dateISO === today)) return false;
      if (extra.when === "upcoming" && !rows.some((row) => row.table.dateISO > today)) return false;
      if (extra.purpose === "dating" && !(venue.tables || []).some((table) => table.tableType === "blind-date" || table.orientation === "Dating")) return false;
      if (extra.purpose === "gay" && !(venue.tables || []).some((table) => table.orientation === "Gay")) return false;
      if (extra.purpose === "lesbian" && !(venue.tables || []).some((table) => table.orientation === "Lesbian")) return false;
      const blob = [
        venue.name,
        venue.cuisine,
        venue.typeLabel,
        venue.locationLabel,
        venue.about,
        venue.area,
        venue.goodFor,
        venue.priceTier,
        venue.timeLabel,
        hasTonight ? "tonight 今晚 今夜" : "",
        hasToday ? "today 今天 今日" : "",
        ...(venue.tables || []).flatMap((table) => [table.time, table.tableType, table.orientation, table.gender, table.ageRange, table.address, tablePrefs(table)]),
      ].join(" ");
      if (!queryHits(blob, query)) return false;
      return true;
    });
  }, [venues, filter, extra, query]);
  const copy = content.copy.venues;

  return (
    <main className="bb-frame pb-28 pt-10 md:pb-16">
      <section className="mx-auto max-w-2xl py-8 text-center">
        <div className="mb-7 flex justify-between gap-4 text-mute">
          <Copy k="hero.left" legacy={copy.kickerLeft} className="bb-kicker" onEnglish={(d, next) => { d.copy.venues.kickerLeft = next; }} />
          <Copy k="hero.right" legacy={copy.kickerRight} className="bb-kicker text-right" onEnglish={(d, next) => { d.copy.venues.kickerRight = next; }} />
        </div>
        <h1 className="font-serif leading-[1.02]">
          <span className="block text-3xl sm:text-4xl md:text-5xl">
            <Copy k="hero.title" legacy={copy.title} onEnglish={(d, next) => { d.copy.venues.title = next; }} />
          </span>
          <span className="mt-3 block text-5xl italic text-ember sm:text-6xl md:text-7xl">
            <Copy k="hero.accent" legacy={copy.accent} onEnglish={(d, next) => { d.copy.venues.accent = next; }} />
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-mute">
          No faces, just places.
          <br />
          Enough to WANT, enough uncertainty to be WORTH having.
        </p>
      </section>

      <div className="mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tonight, 中菜, Central, gay, wine…"
          className="w-full rounded-full border border-white/15 bg-transparent px-5 py-3 text-sm outline-none placeholder:text-mute focus:border-ember"
        />
      </div>
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

      <div className="mb-8 grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((venue) => {
          const rows = soonestTable(venue);
          const preview = rows[0];
          const more = Math.max(0, rows.length - 1);
          return (
            <article
              key={venue.id}
              onClick={(e) => {
                if (e.target.closest("button, input, label, textarea, select")) return;
                if (editing) setSelectedId(venue.id);
                router.push(`/venues/${venue.id}`);
              }}
              className={`bb-card flex h-full cursor-pointer flex-col transition ${venue.hidden ? "opacity-40" : ""} ${selectedId === venue.id ? "ring-2 ring-ember" : ""} ${venue.locked ? "ring-1 ring-white/20" : ""}`}
            >
              <Link href={`/venues/${venue.id}`} className="flex flex-1 flex-col" onClick={() => editing && setSelectedId(venue.id)}>
                <div className="bb-img">
                  <Photo
                    src={venue.imageUrl}
                    alt={venue.imageAlt}
                    onChange={(imageUrl) => update((d) => { const v = d.venues.find((x) => x.id === venue.id); if (v) { v.imageUrl = imageUrl; v.galleryVersion = 2; } })}
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[0.7rem] font-semibold text-white">{venue.spots} {t("spots")}</span>
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[0.7rem] font-semibold text-char">{venue.timeLabel}</span>
                </div>
                <div className="flex flex-1 flex-col px-4 pb-2 pt-4">
                  <h3 className="font-serif text-[1.2rem] text-ember-soft">
                    <Editable locked={venue.locked} value={venue.name} onChange={(name) => update((d) => { const v = d.venues.find((x) => x.id === venue.id); if (v) v.name = name; })} />
                  </h3>
                  <p className="mt-1 text-[0.72rem] tracking-wide text-mute">
                    <Editable locked={venue.locked} value={venue.cuisine || venue.typeLabel} onChange={(cuisine) => update((d) => { const v = d.venues.find((x) => x.id === venue.id); if (v) v.cuisine = cuisine; })} />
                  </p>
                  <p className="text-[0.72rem] tracking-wide text-mute">
                    <Editable locked={venue.locked} value={venue.locationLabel} onChange={(locationLabel) => update((d) => { const v = d.venues.find((x) => x.id === venue.id); if (v) v.locationLabel = locationLabel; })} />
                  </p>
                  <p className="mt-1 text-[0.8rem] text-mute">{venue.priceTier} · {venue.hours}</p>
                  {venue.petFriendly && <p className="mt-1 text-[0.72rem] uppercase tracking-[0.12em] text-ember">{t("venue.pet")}</p>}
                  {preview ? (
                    <div className="mb-2 mt-3 flex items-start gap-2 text-[0.75rem]">
                      <HostBadge handle={preview.table.hostHandle} tier={preview.table.hostTier} />
                      <div className="min-w-0">
                        <p className="text-mute">{(() => {
                          const d = new Date(`${preview.table.dateISO}T12:00:00`);
                          const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
                          const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"][d.getMonth()];
                          return `${wd}, ${d.getDate()} ${mon}`;
                        })()} • {preview.table.time} • {preview.hold.joined} people • {preview.hold.places} left</p>
                        <p className="mt-1 flex items-center gap-2 text-mute">
                          <span>{preview.table.tableType === "blind-date" ? "Blind date" : "Meet friends"}{more > 0 ? " + More" : ""}</span>
                          {(() => {
                            const host = preview.table.hostHandle;
                            const joiners = (preview.table.participants || []).filter((p) => p && p.handle && p.handle !== host && p.role !== "host");
                            if (!joiners.length) return null;
                            return (
                              <span className="ml-auto flex items-center">
                                {joiners.slice(0, 3).map((person) => (
                                  <span key={person.handle} className="-ml-1 first:ml-0"><HostBadge handle={person.handle} tier={person.tier || "bronze"} /></span>
                                ))}
                                {joiners.length > 3 && <span className="ml-1 text-xs text-ember">+</span>}
                              </span>
                            );
                          })()}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </Link>
              <div className="mt-auto flex gap-2.5 px-4 pb-[18px] pt-2">
                <button type="button" className="flex-1 rounded-full border border-white/15 py-2.5 text-[0.8rem] font-semibold" onClick={(e) => { e.stopPropagation(); setFlow({ type: "invite", venueId: venue.id }); }}>{t("btn.invite")}</button>
                <button type="button" className="flex-1 rounded-full bg-fg py-2.5 text-[0.8rem] font-semibold text-ink" onClick={(e) => { e.stopPropagation(); setFlow({ type: "join", venueId: venue.id }); }}>{t("btn.join")}</button>
              </div>
            </article>
          );
        })}
      </div>
      {shown.length === 0 && <p className="pb-10 text-center text-sm text-mute">{t("empty.filter")}</p>}
      <Copy as="p" k="hero.footer" legacy={copy.footer} className="pb-8 text-center text-[0.7rem] tracking-[0.08em] text-mute" onEnglish={(d, next) => { d.copy.venues.footer = next; }} />
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
