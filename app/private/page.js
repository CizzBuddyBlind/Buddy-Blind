"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Editable, Photo } from "@/components/Bits";
import { useBB } from "@/components/Providers";
import { translate } from "@/lib/i18n";
import { AGE_RANGES } from "@/lib/bible";

export default function PrivatePage() {
  const bb = useBB();
  const t = (key) => translate(bb.lang, key);
  const { content, editing, update, setSelectedId, selectedId, setFlow, premium } = bb;
  const copy = content.copy.private;
  const nights = content.events.filter((e) => e.kind === "private" && (editing || !e.hidden));
  const [q, setQ] = useState("");
  const [area, setArea] = useState("");
  const [age, setAge] = useState("");
  const campaign = nights.find((n) => n.featured) || nights[0];
  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();
    return nights.filter((night) => {
      const blob = `${night.name} ${night.typeLabel} ${night.description || ""} ${night.forWhom || ""} ${night.hostName || ""} ${night.location || ""}`.toLowerCase();
      if (query && !blob.includes(query)) return false;
      if (area && !blob.includes(area.toLowerCase())) return false;
      if (age && night.ageRange && night.ageRange !== age) return false;
      return true;
    });
  }, [nights, q, area, age]);

  return (
    <main className="bb-frame pb-28 pt-8 md:pb-16">
      <section className="mx-auto max-w-2xl text-center">
        <div className="mb-6 flex justify-between text-mute">
          <Editable className="bb-kicker" value={copy.kickerLeft} onChange={(kickerLeft) => update((d) => { d.copy.private.kickerLeft = kickerLeft; })} />
          <Editable className="bb-kicker text-ember" value={copy.kickerRight} onChange={(kickerRight) => update((d) => { d.copy.private.kickerRight = kickerRight; })} />
        </div>
        <h1 className="bb-hero-title text-char">
          <Editable value={copy.title} onChange={(title) => update((d) => { d.copy.private.title = title; })} />
          <br />
          <Editable className="italic text-ember" value={copy.accent} onChange={(accent) => update((d) => { d.copy.private.accent = accent; })} />
        </h1>
        <Editable as="p" className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-mute" value={copy.sub} onChange={(sub) => update((d) => { d.copy.private.sub = sub; })} />
      </section>

      {campaign && (
        <Link href={`/private/${campaign.id}`} className="mt-8 block overflow-hidden rounded-3xl bg-char text-paper">
          <div className="grid md:grid-cols-2">
            <div className="relative min-h-[220px]">
              <Photo src={campaign.imageUrl} alt={campaign.name} onChange={(imageUrl) => update((d) => { const item = d.events.find((x) => x.id === campaign.id); if (item) item.imageUrl = imageUrl; })} />
            </div>
            <div className="p-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-ember">{t("priv.campaign")}</p>
              <h2 className="mt-2 font-serif text-3xl">{campaign.name}</h2>
              <p className="mt-2 text-sm text-paper/70">{campaign.hostName || campaign.hostLabel} · {campaign.location || "Hong Kong"}</p>
              <p className="text-sm text-paper/70">{campaign.dateISO} · {campaign.timeLabel} · {campaign.spots} places</p>
              <p className="mt-3 text-sm text-paper/80">{campaign.description || campaign.forWhom || campaign.typeLabel}</p>
              <span className="mt-4 inline-block rounded-full bg-paper px-4 py-2 text-xs font-semibold text-char">JOIN</span>
            </div>
          </div>
        </Link>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("priv.search")} className="flex-1 rounded-full border border-black/10 bg-white px-4 py-3 text-sm" />
        <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Location" className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm" />
        <select value={age} onChange={(e) => setAge(e.target.value)} className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm">
          <option value="">Age</option>
          {AGE_RANGES.map((range) => <option key={range}>{range}</option>)}
        </select>
      </div>
      <div className="mt-4">
        {premium ? (
          <button type="button" className="rounded-full bg-char px-4 py-2 text-sm text-paper" onClick={() => setFlow({ type: "private-create" })}>{t("priv.create")}</button>
        ) : (
          <Link href="/subscribe" className="text-sm text-ember">{t("priv.premium")}</Link>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((night) => (
          <article
            key={night.id}
            onClick={() => editing && setSelectedId(night.id)}
            className={`overflow-hidden rounded-2xl border border-black/10 bg-white ${selectedId === night.id ? "ring-2 ring-ember" : ""} ${night.hidden ? "opacity-40" : ""}`}
          >
            <Link href={`/private/${night.id}`} className="relative block aspect-[4/3]" onClick={(e) => editing && e.preventDefault()}>
              <Photo src={night.imageUrl} alt={night.name} onChange={(imageUrl) => update((d) => { const item = d.events.find((x) => x.id === night.id); if (item) item.imageUrl = imageUrl; })} />
            </Link>
            <div className="px-4 py-4">
              <div className="font-serif text-xl">
                <Editable locked={night.locked} value={night.name} onChange={(name) => update((d) => { const item = d.events.find((x) => x.id === night.id); if (item) item.name = name; })} />
              </div>
              <div className="mt-1 text-xs tracking-wide text-mute">{night.forWhom || night.typeLabel}</div>
              <div className="mt-1 text-xs text-mute">{night.location || "Hong Kong"} · {night.dateISO} · {night.timeLabel}</div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span>{night.hostName || night.hostLabel}</span>
                <span className="font-medium text-ember">{(night.spots || 0) <= 0 ? t("priv.full") : `${night.spots} places`}</span>
              </div>
              <Link href={`/private/${night.id}`} className="mt-3 inline-block text-xs font-semibold uppercase tracking-widest">JOIN</Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
