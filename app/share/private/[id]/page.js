"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { PayDialog, rememberReturn } from "@/components/Flows";
import { useBB } from "@/components/Providers";

export default function SharePrivatePage() {
  const { id } = useParams();
  const bb = useBB();
  const event = bb.content.events.find((item) => item.id === id && item.kind === "private");
  const [pay, setPay] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!bb.ready) return <main className="bb-frame py-20 text-mute">Loading…</main>;
  if (!event) {
    return (
      <main className="bb-frame py-20">
        <Link href="/private" className="text-ember">Private events</Link>
      </main>
    );
  }
  const lines = [
    event.name,
    event.location || "Hong Kong",
    `${event.dateISO || ""} · ${event.timeLabel || ""}`,
    event.forWhom || event.typeLabel,
    event.ageRange || "",
    `${event.spots} seats left`,
  ];
  async function confirm() {
    setBusy(true);
    const res = await bb.joinPrivate(event.id);
    setBusy(false);
    if (res.needLogin) {
      rememberReturn();
      window.location.href = "/login";
      return;
    }
    if (res.error) bb.notify(res.error);
    else {
      bb.notify("You're in.");
      setPay(false);
    }
  }
  return (
    <main className="bb-frame mx-auto max-w-lg pb-28 pt-12">
      <p className="text-xs uppercase tracking-[0.2em] text-ember">Come join me</p>
      <h1 className="mt-3 font-serif text-5xl">{event.name}</h1>
      <ul className="mt-8 space-y-2 text-sm text-mute">
        {lines.filter(Boolean).map((line) => <li key={line}>{line}</li>)}
      </ul>
      <p className="mt-4 text-sm leading-relaxed">{event.description}</p>
      {!bb.session && <p className="mt-6 text-sm text-mute">New here? Make a seat on this site, then join this event.</p>}
      <button type="button" className="mt-8 rounded-full bg-fg px-6 py-3 text-sm font-semibold text-ink" onClick={() => {
        if (!bb.session) {
          rememberReturn();
          window.location.href = "/login";
          return;
        }
        setPay(true);
      }}>Join</button>
      <PayDialog open={pay} title={`Join · ${event.name}`} lines={lines} busy={busy} onClose={() => setPay(false)} onConfirm={confirm} />
    </main>
  );
}
