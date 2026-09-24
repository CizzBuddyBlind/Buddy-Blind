"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Editable, Photo } from "@/components/Bits";
import { PayDialog, PingBox, ShareSheet, rememberReturn } from "@/components/Flows";
import { useBB } from "@/components/Providers";

export default function PrivateDetailPage() {
  const { id } = useParams();
  const bb = useBB();
  const event = bb.content.events.find((item) => item.id === id && item.kind === "private");
  const [busy, setBusy] = useState(false);
  const [pay, setPay] = useState(false);
  const [share, setShare] = useState(false);
  if (!event) {
    return (
      <main className="bb-frame py-20">
        <Link href="/private" className="text-sm">Go back</Link>
      </main>
    );
  }
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
    else bb.notify("You're in.");
    setPay(false);
  }

  return (
    <main className="bb-frame pb-28 pt-6 md:pb-16">
      <Link href="/private" className="text-xs uppercase tracking-[0.16em] text-mute">Go back</Link>
      <div className="mt-4 grid items-start gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-[1.4rem] bg-black/5">
          <div className="relative aspect-[4/5]">
            <Photo src={event.imageUrl} alt={event.name} onChange={(imageUrl) => bb.update((d) => {
              const item = d.events.find((x) => x.id === event.id);
              if (item) item.imageUrl = imageUrl;
            })} />
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ember">{event.forWhom || event.typeLabel}</p>
          <h1 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">
            <Editable value={event.name} onChange={(name) => bb.update((d) => { const item = d.events.find((x) => x.id === event.id); if (item) item.name = name; })} />
          </h1>
          <p className="mt-3 text-sm text-mute">Host · {event.hostName || event.hostLabel}</p>
          {event.showHostPhoto && event.hostPhoto && (
            <img src={event.hostPhoto} alt="" className="mt-3 h-16 w-16 rounded-full object-cover" />
          )}
          <p className="mt-3 text-sm">{event.location} · {event.dateISO} · {event.timeLabel}</p>
          <p className="mt-1 text-sm text-mute">{full ? "Full" : `${event.spots} seats left`}{event.ageRange ? ` · ${event.ageRange}` : ""}</p>
          <Editable as="p" className="mt-6 text-base leading-relaxed" value={event.description || ""} onChange={(description) => bb.update((d) => { const item = d.events.find((x) => x.id === event.id); if (item) item.description = description; })} />
          {event.videoUrl && (
            <p className="mt-4 text-sm"><a className="underline" href={event.videoUrl} target="_blank" rel="noreferrer">Host video</a></p>
          )}
          <PingBox
            table={{ ...event, id: event.id, time: event.timeLabel, eventId: event.id }}
            joined={!!(bb.session && ((event.participants || []).some((p) => p.handle === bb.session.handle) || event.hostName === bb.session.handle))}
            onSend={() => bb.sendPing({ eventId: event.id }).then((res) => res?.error && bb.notify(res.error))}
          />
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
