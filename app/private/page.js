"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Copy, Editable, Photo } from "@/components/Bits";
import { DoneShare, HostBadge, PayDialog, rememberReturn } from "@/components/Flows";
import { useBB } from "@/components/Providers";
import { translate } from "@/lib/i18n";
import { eventPhotos, eventPoster, queryHits } from "@/lib/bible";

export default function PrivatePage() {
  const bb = useBB();
  const t = (key) => translate(bb.lang, key);
  const { content, editing, update, setSelectedId, selectedId, setFlow } = bb;
  const copy = content.copy.private;
  const nights = content.events.filter((e) => e.kind === "private" && (editing || !e.hidden));
  const [q, setQ] = useState("");
  const [area, setArea] = useState("");
  const [pay, setPay] = useState(null);
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);
  const campaign = nights.find((n) => n.featured) || nights[0];
  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();
    return nights.filter((night) => {
      const blob = `${night.name} ${night.typeLabel} ${night.description || ""} ${night.forWhom || ""} ${night.hostName || ""} ${night.location || ""} ${night.ageRange || ""} ${night.timeLabel || ""}`;
      if (query && !queryHits(blob, query)) return false;
      if (area && !queryHits(`${blob} ${night.location || ""}`, area)) return false;
      return true;
    });
  }, [nights, q, area]);

  async function confirmPay() {
    if (!pay) return;
    setBusy(true);
    const res = await bb.joinPrivate(pay.id);
    setBusy(false);
    if (res.needLogin) {
      rememberReturn();
      window.location.href = "/login";
      return;
    }
    if (res.error) bb.notify(res.error === "FULL" ? "FULL. No more places." : res.error);
    else {
      setDone(pay);
      setPay(null);
    }
  }

  return (
    <main className="bb-private bb-frame pb-28 pt-10 md:pb-16">
      <section className="mx-auto max-w-2xl text-center">
        <div className="mb-6 flex justify-between text-mute">
          <Editable className="bb-kicker" value={copy.kickerLeft} onChange={(kickerLeft) => update((d) => { d.copy.private.kickerLeft = kickerLeft; })} />
          <Editable className="bb-kicker" value={copy.kickerRight} onChange={(kickerRight) => update((d) => { d.copy.private.kickerRight = kickerRight; })} />
        </div>
        <h1 className="bb-hero-title text-char">
          <Copy k="private.title" legacy={copy.title} onEnglish={(d, next) => { d.copy.private.title = next; }} />
          <br />
          <Copy k="private.accent" legacy={copy.accent} className="italic text-ember" onEnglish={(d, next) => { d.copy.private.accent = next; }} />
        </h1>
        <Copy as="p" k="private.sub" legacy={copy.sub} className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-mute" onEnglish={(d, next) => { d.copy.private.sub = next; }} />
      </section>

      {campaign && (
        <Link href={`/private/${campaign.id}`} className="bb-feature mt-8 grid h-[300px] w-full shrink-0 grid-cols-1 overflow-hidden rounded-3xl bg-char text-paper md:h-[340px] md:grid-cols-2">
          <div className="relative h-[140px] md:h-full">
            <Photo src={eventPhotos(campaign)[0] || ""} fallback={eventPoster(campaign)} alt={campaign.name} className="absolute inset-0" onChange={(imageUrl) => update((d) => { const item = d.events.find((x) => x.id === campaign.id); if (item) item.imageUrl = imageUrl; })} />
          </div>
          <div className="flex h-full flex-col justify-center overflow-hidden p-6 md:p-8">
            <p className="text-[10px] uppercase tracking-[0.16em] text-ember">{t("priv.campaign")}</p>
            <div className="bb-night-copy">
              <h2 className="bb-night-line mt-2 font-serif text-3xl">{campaign.name}</h2>
              <p className="bb-night-line mt-3 text-sm text-paper/70">{campaign.dateISO} · {campaign.timeLabel} · {campaign.spots} places</p>
              <p className="bb-night-line mt-3 line-clamp-2 text-sm text-paper/80">{campaign.description || campaign.forWhom || campaign.typeLabel}</p>
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm text-paper/70">
              <HostBadge handle={campaign.hostName || "Host"} tier={campaign.hostTier || "bronze"} />
              <span>{campaign.hostName || campaign.hostLabel}</span>
            </p>
            <span className="mt-4 inline-flex w-fit rounded-full bg-paper px-4 py-2 text-xs font-semibold text-char">JOIN</span>
          </div>
        </Link>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("priv.search")} className="flex-1 rounded-full border border-black/10 bg-white px-4 py-3 text-sm" />
        <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Location" className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm" />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-full bg-char px-4 py-2 text-sm text-paper"
          onClick={() => {
            if (!bb.session) {
              window.location.href = "/login";
              return;
            }
            setFlow({ type: "private-create" });
          }}
        >
          {t("btn.host")}
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((night) => (
          <article
            key={night.id}
            className={`bb-lift overflow-hidden rounded-2xl border border-black/10 bg-white ${selectedId === night.id ? "ring-2 ring-ember" : ""} ${night.hidden ? "opacity-40" : ""}`}
          >
            <Link href={`/private/${night.id}`} className="block" onClick={() => editing && setSelectedId(night.id)}>
              <div className="bb-zoom-wrap relative block aspect-[4/3] overflow-hidden">
                <Photo src={eventPhotos(night)[0] || ""} fallback={eventPoster(night)} alt={night.name} onChange={(imageUrl) => update((d) => { const item = d.events.find((x) => x.id === night.id); if (item) item.imageUrl = imageUrl; })} />
              </div>
              <div className="bb-night-copy px-4 pt-4">
                <div className="bb-night-line font-serif text-xl">
                  <Editable locked={night.locked} value={night.name} onChange={(name) => update((d) => { const item = d.events.find((x) => x.id === night.id); if (item) item.name = name; })} />
                </div>
                <div className="bb-night-line mt-1 text-xs tracking-wide text-mute">{night.forWhom || night.typeLabel}</div>
                <div className="bb-night-line mt-1 text-xs text-mute">{night.location || "Hong Kong"} · {night.dateISO} · {night.timeLabel}</div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 px-4 pb-4 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <HostBadge handle={night.hostName || "Host"} tier={night.hostTier || "bronze"} />
                    <span className="truncate">{night.hostName || night.hostLabel}</span>
                  </span>
                  <span className="bb-night-copy shrink-0 font-medium">{(night.spots || 0) <= 0 ? t("priv.full") : `${night.spots} places`}</span>
              </div>
            </Link>
            <div className="px-4 pb-4">
              <button
                type="button"
                className="mt-4 w-full rounded-full bg-char py-2.5 text-sm font-semibold tracking-wide text-paper"
                onClick={() => {
                  if ((night.spots || 0) <= 0) {
                    bb.notify("FULL. No more places.");
                    return;
                  }
                  setPay(night);
                }}
              >
                {(night.spots || 0) <= 0 ? t("priv.full") : "JOIN"}
              </button>
            </div>
          </article>
        ))}
      </div>
      <PayDialog
        open={!!pay}
        title={`Join · ${pay?.name || ""}`}
        lines={[pay?.name, pay?.location, `${pay?.dateISO || ""} · ${pay?.timeLabel || ""}`, pay?.forWhom || pay?.typeLabel, `${pay?.spots ?? ""} seats left`]}
        busy={busy}
        onClose={() => setPay(null)}
        onConfirm={confirmPay}
      />
      {done && (
        <DoneShare
          title={done.name}
          lines={[done.location, `${done.dateISO || ""} · ${done.timeLabel || ""}`]}
          path={`/share/private/${done.id}`}
          invite={{ name: done.name, eventId: done.id }}
          onClose={() => setDone(null)}
        />
      )}
    </main>
  );
}
