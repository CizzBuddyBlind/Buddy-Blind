"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Editable, Photo, fileToCover } from "@/components/Bits";
import { shareLink } from "@/components/Flows";
import { useBB } from "@/components/Providers";

export default function PrivateDetailPage() {
  const { id } = useParams();
  const bb = useBB();
  const event = bb.content.events.find((item) => item.id === id && item.kind === "private");
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
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
      window.location.href = "/login";
      return;
    }
    if (res.error) bb.notify(res.error === "FULL" ? "FULL. No more places." : res.error);
    else bb.notify("You're in · +1 pt");
  }

  return (
    <main className="bb-frame pb-28 pt-8 md:pb-16">
      <Link href="/private" className="text-xs uppercase tracking-[0.14em] text-mute">Go back</Link>
      <div className="mt-4 overflow-hidden rounded-2xl">
        <div className="relative aspect-[16/9] max-h-[420px]">
          <Photo src={event.imageUrl} alt={event.name} onChange={(imageUrl) => bb.update((d) => {
            const item = d.events.find((x) => x.id === event.id);
            if (item) item.imageUrl = imageUrl;
          })} />
        </div>
      </div>
      <div className="mx-auto mt-6 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.14em] text-ember">{event.forWhom || event.typeLabel}</p>
        <h1 className="mt-2 font-serif text-4xl">
          <Editable value={event.name} onChange={(name) => bb.update((d) => { const item = d.events.find((x) => x.id === event.id); if (item) item.name = name; })} />
        </h1>
        <p className="mt-2 text-sm text-mute">Host · {event.hostName || event.hostLabel}</p>
        {event.showHostPhoto && event.hostPhoto && (
          <img src={event.hostPhoto} alt="" className="mt-3 h-16 w-16 rounded-full object-cover" />
        )}
        <p className="mt-3 text-sm">{event.location} · {event.dateISO} · {event.timeLabel}</p>
        <p className="mt-1 text-sm text-mute">{full ? "FULL" : `${event.spots} places`} · capacity {event.capacity || 20} including host{event.ageRange ? ` · ${event.ageRange}` : ""}</p>
        <Editable as="p" className="mt-4 text-sm leading-relaxed text-char/80" value={event.description || ""} onChange={(description) => bb.update((d) => { const item = d.events.find((x) => x.id === event.id); if (item) item.description = description; })} />
        {event.videoUrl && (
          <p className="mt-4 text-sm"><a className="underline" href={event.videoUrl} target="_blank" rel="noreferrer">Host video</a></p>
        )}
        {bb.editing && (
          <label className="mt-4 block text-xs text-mute">
            Replace event photo
            <input type="file" accept="image/*" className="mt-1 block text-xs" onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              const imageUrl = await fileToCover(file);
              bb.update((d) => { const item = d.events.find((x) => x.id === event.id); if (item) item.imageUrl = imageUrl; });
            }} />
          </label>
        )}
        <label className="mt-6 flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          <span>I understand the other guests stay unknown. The host is the only person shown.</span>
        </label>
        <div className="mt-4 flex gap-2">
          <button type="button" disabled={!checked || busy || full} onClick={join} className="rounded-full bg-char px-5 py-3 text-sm font-semibold text-paper disabled:opacity-40">
            {full ? "FULL" : "JOIN"}
          </button>
          <button type="button" className="rounded-full border border-char/20 px-5 py-3 text-sm" onClick={() => shareLink(`/share/private/${event.id}`, event.name)}>Share</button>
          <button type="button" className="rounded-full border border-char/20 px-5 py-3 text-sm" onClick={() => {
            const res = bb.inviteBuddies(event.name);
            if (res?.error) bb.notify(res.error);
          }}>Invite buddies</button>
        </div>
      </div>
    </main>
  );
}
