"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Editable, Photo } from "@/components/Bits";
import { DoneShare, PayDialog, ShareSheet, rememberReturn } from "@/components/Flows";
import { useBB } from "@/components/Providers";
import { getMedia } from "@/lib/media";

export default function PrivateDetailPage() {
  const { id } = useParams();
  const bb = useBB();
  const event = bb.content.events.find((item) => item.id === id && item.kind === "private");
  const [busy, setBusy] = useState(false);
  const [pay, setPay] = useState(false);
  const [share, setShare] = useState(false);
  const [done, setDone] = useState(false);
  const [shot, setShot] = useState(0);
  const [media, setMedia] = useState({});
  useEffect(() => {
    if (!event) return undefined;
    const urls = [event.imageUrl, event.videoUrl, ...(event.gallery || [])].filter((src) => typeof src === "string" && src.startsWith("idb:"));
    let cancel = false;
    (async () => {
      const next = {};
      for (const src of urls) next[src] = await getMedia(src.slice(4));
      if (!cancel) setMedia(next);
    })();
    return () => {
      cancel = true;
    };
  }, [event]);
  if (!event) {
    return (
      <main className="bb-frame py-20">
        <Link href="/private" className="text-sm">Go back</Link>
      </main>
    );
  }
  const photos = event.gallery?.length ? event.gallery : event.imageUrl ? [event.imageUrl] : [];
  const slides = [
    ...photos.map((src) => ({ type: "photo", src })),
    ...(event.videoUrl ? [{ type: "video", src: event.videoUrl }] : []),
  ];
  const slide = slides[shot] || slides[0];
  const host = event.hostProfile || { handle: event.hostName || "Host" };
  const initial = String(host.handle || "H").trim().slice(0, 1).toUpperCase();
  const buddyLabel = Number(host.buddies) >= 15 ? "15+" : host.buddies != null ? String(host.buddies) : "";
  const full = (event.spots || 0) <= 0;

  async function join() {
    setBusy(true);
    const res = await bb.joinPrivate(event.id);
    setBusy(false);
    if (res.needLogin) {
      rememberReturn();
      window.location.href = "/login";
      return;
    }
    if (res.error) bb.notify(res.error === "FULL" ? "FULL. No more places." : res.error);
    else setDone(true);
    setPay(false);
  }

  return (
    <main className="bb-private bb-frame pb-28 pt-6 md:pb-16">
      <Link href="/private" className="text-xs uppercase tracking-[0.16em] text-mute">Go back</Link>
      <div className="mt-4 grid items-start gap-8 md:grid-cols-2">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-black/5">
            {slide?.type === "video" ? (
              <video key={slide.src} src={slide.src.startsWith("idb:") ? media[slide.src] || "" : slide.src} className="h-full w-full object-cover" autoPlay muted loop playsInline />
            ) : (
              <Photo src={slide?.src?.startsWith("idb:") ? media[slide.src] || "" : slide?.src || ""} alt={event.name} />
            )}
            {slides.length > 1 && (
              <button type="button" aria-label="Next" onClick={() => setShot((n) => (n + 1) % slides.length)} className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-3xl leading-none text-white">
                ›
              </button>
            )}
          </div>
          {slides.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {slides.map((item, index) => (
                <button key={index} type="button" onClick={() => setShot(index)} className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border ${shot === index ? "border-ember" : "border-black/10"}`}>
                  {item.type === "video" ? <span className="grid h-full w-full place-items-center bg-char text-xs text-paper">Video</span> : <img src={item.src.startsWith("idb:") ? media[item.src] || "" : item.src} alt="" className="h-full w-full object-cover" />}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ember">{event.forWhom || event.typeLabel}</p>
          <h1 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">
            <Editable value={event.name} onChange={(name) => bb.update((d) => { const item = d.events.find((x) => x.id === event.id); if (item) item.name = name; })} />
          </h1>
          <p className="mt-3 text-sm">{event.location} · {event.dateISO} · {event.timeLabel}</p>
          <p className="mt-1 text-sm text-mute">{full ? "Full" : `${event.spots} seats left`}</p>
          <Editable as="p" className="mt-6 text-base leading-relaxed" value={event.description || ""} onChange={(description) => bb.update((d) => { const item = d.events.find((x) => x.id === event.id); if (item) item.description = description; })} />
          <div className="mt-8 border-t border-black/10 pt-6">
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-char font-serif text-xl text-paper">{initial}</div>
              <div>
                <p className="font-serif text-xl">{host.handle}</p>
                <p className="text-xs uppercase tracking-[0.14em] text-mute">Host</p>
              </div>
            </div>
            <div className="mt-4 space-y-1 text-sm text-mute">
              {host.ageRange && <p>Age · {host.ageRange}</p>}
              {host.gender && <p>Gender · {host.gender}</p>}
              {host.orientation && <p>Orientation · {host.orientation}</p>}
              {host.neighborhood && <p>Lives in · {host.neighborhood}</p>}
              {host.occupation && <p>Work · {host.occupation}</p>}
              {buddyLabel !== "" && <p className="text-char">Buddies {buddyLabel}</p>}
            </div>
            {(event.aboutHost || bb.editing) && (
              <Editable as="p" className="mt-4 text-sm leading-relaxed" value={event.aboutHost || ""} onChange={(aboutHost) => bb.update((d) => { const item = d.events.find((x) => x.id === event.id); if (item) item.aboutHost = aboutHost; })} />
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <button type="button" disabled={busy || full} onClick={() => setPay(true)} className="rounded-full bg-char px-5 py-3 text-sm font-semibold text-paper disabled:opacity-40">
              {full ? "Full" : "Join"}
            </button>
            <button type="button" className="rounded-full border border-char/20 px-5 py-3 text-sm" onClick={() => setShare(true)}>Share</button>
          </div>
        </div>
      </div>
      <PayDialog
        open={pay}
        title={`Join · ${event.name}`}
        lines={[event.name, event.location, `${event.dateISO || ""} · ${event.timeLabel || ""}`, event.forWhom, `${event.spots} seats left`]}
        busy={busy}
        onClose={() => setPay(false)}
        onConfirm={join}
      />
      {done && (
        <DoneShare
          title={event.name}
          lines={[event.location, `${event.dateISO || ""} · ${event.timeLabel || ""}`]}
          path={`/share/private/${event.id}`}
          invite={{ name: event.name, eventId: event.id }}
          onClose={() => setDone(false)}
        />
      )}
      <ShareSheet
        open={share}
        onClose={() => setShare(false)}
        joined={!!(bb.session && (event.participants || []).some((p) => p.handle === bb.session.handle))}
        path={`/share/private/${event.id}`}
        lines={[event.name, event.location || "Hong Kong", `${event.dateISO || ""} · ${event.timeLabel || ""}`, event.forWhom || event.typeLabel, `${event.spots} seats left`]}
      />
    </main>
  );
}
