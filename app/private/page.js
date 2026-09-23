"use client";

import { useState } from "react";
import { Editable, Photo, Sheet } from "@/components/Bits";
import { useBB } from "@/components/Providers";

export default function PrivatePage() {
  const { content, editing, update, act, notify, setSelectedId, selectedId } = useBB();
  const [sheet, setSheet] = useState(null);
  const copy = content.copy.private;
  const nights = content.events.filter((e) => e.kind === "private" && (editing || !e.hidden));

  async function confirmSheet() {
    const res = await act("event", sheet.id, "join");
    if (res.needLogin) {
      window.location.href = "/login";
      return;
    }
    if (res.error) notify(res.error);
    else notify("Request sent · +1 pt");
    setSheet(null);
  }

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
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {nights.map((night) => (
          <article
            key={night.id}
            onClick={() => editing && setSelectedId(night.id)}
            className={`overflow-hidden rounded-2xl border border-black/10 bg-white ${selectedId === night.id ? "ring-2 ring-ember" : ""} ${night.hidden ? "opacity-40" : ""}`}
          >
            <div className="relative aspect-[4/3]">
              <Photo src={night.imageUrl} alt={night.name} onChange={(imageUrl) => update((d) => { const item = d.events.find((x) => x.id === night.id); if (item) item.imageUrl = imageUrl; })} />
            </div>
            <button type="button" className="block w-full px-4 py-4 text-left" onClick={() => setSheet({ id: night.id, name: night.name })}>
              <div className="font-serif text-xl">
                <Editable locked={night.locked} value={night.name} onChange={(name) => update((d) => { const item = d.events.find((x) => x.id === night.id); if (item) item.name = name; })} />
              </div>
              <div className="mt-1 text-xs tracking-wide text-mute">{night.typeLabel}</div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span>{night.hostLabel}</span>
                <span className="font-medium text-ember">{night.upcomingLabel}</span>
              </div>
            </button>
          </article>
        ))}
      </div>
      <Sheet
        open={!!sheet}
        title={sheet ? sheet.name : ""}
        body="Host-led. You join the interest, not a face. The host still doesn't see your photo."
        confirmLabel="Join this night"
        onClose={() => setSheet(null)}
        onConfirm={confirmSheet}
      />
    </main>
  );
}
