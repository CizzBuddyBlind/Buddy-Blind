"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Editable, Photo, fileToCover } from "@/components/Bits";
import { DoneShare, PayDialog, ShareSheet, rememberReturn } from "@/components/Flows";
import { useBB } from "@/components/Providers";
import { privateEditOpen, privateLockDate } from "@/lib/bible";
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
  const [editingNight, setEditingNight] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
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
  const isHost = !!(bb.session && (bb.session.handle === event.hostName || bb.session.handle === host.handle));
  const canEdit = privateEditOpen(event.dateISO);
  const lockOn = privateLockDate(event.dateISO);
  const lockLabel = lockOn
    ? new Date(`${lockOn}T12:00:00`).toLocaleDateString("en-HK", { day: "numeric", month: "short" })
    : "";

  function openEdit() {
    setDraft({
      description: event.description || "",
      aboutHost: event.aboutHost || "",
      photos: photos.slice(0, 6),
      videoUrl: event.videoUrl || "",
    });
    setEditingNight(true);
  }

  async function addEditPhoto(file) {
    if (!file || !draft || draft.photos.length >= 6) return;
    try {
      const imageUrl = await fileToCover(file);
      setDraft((current) => current ? { ...current, photos: [...current.photos, imageUrl].slice(0, 6) } : current);
    } catch {
      bb.notify("That photo didn't load. Try a JPG.");
    }
  }

  function addEditVideo(file) {
    if (!file || !draft) return;
    if (file.size > 8_000_000) {
      bb.notify("That video is too big. Keep it under 8 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setDraft((current) => current ? { ...current, videoUrl: String(reader.result || "") } : current);
    reader.onerror = () => bb.notify("That video didn't load.");
    reader.readAsDataURL(file);
  }

  async function saveEdit() {
    if (!draft) return;
    setSaving(true);
    const res = await bb.updatePrivate({
      id: event.id,
      description: draft.description,
      aboutHost: draft.aboutHost,
      gallery: draft.photos,
      videoUrl: draft.videoUrl,
    });
    setSaving(false);
    if (res?.needLogin) {
      rememberReturn();
      window.location.href = "/login";
      return;
    }
    if (!res?.ok) {
      bb.notify(res?.error || "That didn't save.");
      return;
    }
    setEditingNight(false);
    bb.notify("Updated.");
  }

  async function join() {
    setBusy(true);
    try {
      const res = await bb.joinPrivate(event.id);
      if (res.needLogin) {
        rememberReturn();
        window.location.href = "/login";
        return;
      }
      if (res.error) bb.notify(res.error === "FULL" ? "FULL. No more places." : res.error);
      else setDone(true);
      setPay(false);
    } catch {
      bb.notify("That didn't go through. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="bb-private bb-frame pb-28 pt-6 md:pb-16">
      <Link href="/private" className="text-xs uppercase tracking-[0.16em] text-mute">Go back</Link>
      <div className="mt-4 grid items-start gap-8 md:grid-cols-2">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-black/5">
            <div className="absolute inset-0">
              {slide?.type === "video" ? (
                <video key={slide.src} src={slide.src.startsWith("idb:") ? media[slide.src] || "" : slide.src} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline />
              ) : (
                <Photo src={slide?.src?.startsWith("idb:") ? media[slide.src] || "" : slide?.src || ""} alt={event.name} />
              )}
            </div>
            {slides.length > 1 && (
              <button
                type="button"
                aria-label="Next"
                onPointerDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.preventDefault();
                  const y = window.scrollY;
                  setShot((n) => (n + 1) % slides.length);
                  requestAnimationFrame(() => window.scrollTo(0, y));
                }}
                className="bb-next absolute right-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-black/55 text-white"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
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
            {isHost && (
              <button type="button" disabled={!canEdit} onClick={openEdit} className="rounded-full border border-char/20 px-5 py-3 text-sm disabled:opacity-40">
                Edit
              </button>
            )}
          </div>
          {isHost && (
            <p className="mt-4 text-sm leading-relaxed text-mute">
              {canEdit
                ? `Notice: You can update About me, the description, photos (6 max) and one video before ${lockLabel}. Place, location, date and time stay.`
                : `Notice: From ${lockLabel}, nothing can change.`}
            </p>
          )}
          {editingNight && draft && (
            <div className="mt-4 space-y-3 rounded-2xl border border-black/10 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-mute">Locked</p>
              <p className="text-sm">{event.location} · {event.dateISO} · {event.timeLabel}</p>
              <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="The night" className="h-24 w-full rounded-xl border border-black/10 px-3 py-2 text-sm" />
              <textarea value={draft.aboutHost} onChange={(e) => setDraft({ ...draft, aboutHost: e.target.value })} placeholder="About me" className="h-24 w-full rounded-xl border border-black/10 px-3 py-2 text-sm" />
              <div className="flex gap-2 overflow-x-auto">
                {draft.photos.map((src, index) => (
                  <div key={`${index}-${String(src).slice(0, 16)}`} className="relative h-16 w-20 shrink-0">
                    <img src={src.startsWith("idb:") ? media[src] || "" : src} alt="" className="h-full w-full rounded-xl object-cover" />
                    <button type="button" aria-label="Remove photo" onClick={() => setDraft({ ...draft, photos: draft.photos.filter((_, i) => i !== index) })} className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/70 text-[10px] text-white">×</button>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <label className={`rounded-full border border-black/15 px-4 py-2 text-sm ${draft.photos.length >= 6 ? "opacity-40" : ""}`}>
                  Add photo
                  <input type="file" accept="image/*" className="sr-only" disabled={draft.photos.length >= 6} onChange={(e) => { addEditPhoto(e.target.files?.[0]); e.target.value = ""; }} />
                </label>
                <label className="rounded-full border border-black/15 px-4 py-2 text-sm">
                  {draft.videoUrl ? "Replace video" : "Add video"}
                  <input type="file" accept="video/*" className="sr-only" onChange={(e) => { addEditVideo(e.target.files?.[0]); e.target.value = ""; }} />
                </label>
                {draft.videoUrl && (
                  <button type="button" className="rounded-full border border-black/15 px-4 py-2 text-sm" onClick={() => setDraft({ ...draft, videoUrl: "" })}>Remove video</button>
                )}
              </div>
              <p className="text-xs text-mute">{draft.photos.length}/6 photos · 1 video</p>
              <div className="flex gap-2">
                <button type="button" className="flex-1 rounded-full border border-black/15 py-2.5 text-sm" onClick={() => setEditingNight(false)}>Cancel</button>
                <button type="button" disabled={saving} className="flex-1 rounded-full bg-char py-2.5 text-sm font-semibold text-paper disabled:opacity-40" onClick={saveEdit}>{saving ? "Saving" : "Save"}</button>
              </div>
            </div>
          )}
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
