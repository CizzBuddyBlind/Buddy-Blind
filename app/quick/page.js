"use client";

import { useState } from "react";
import { Editable, Photo, Sheet } from "@/components/Bits";
import { useBB } from "@/components/Providers";

export default function QuickPage() {
  const { content, editing, update, act, notify, setSelectedId, selectedId, insertEvent } = useBB();
  const [sheet, setSheet] = useState(null);
  const copy = content.copy.quick;
  const rows = content.events.filter((e) => e.kind === "quick" && (editing || !e.hidden));

  async function confirmSheet() {
    const res = await act("event", sheet.id, sheet.mode);
    if (res.needLogin) {
      window.location.href = "/login";
      return;
    }
    if (res.error) notify(res.error);
    else notify(sheet.mode === "create" ? "You created it · +5 pts" : "Seat taken · +1 pt");
    setSheet(null);
  }

  return (
    <main className="bb-frame pb-28 pt-8 md:pb-16">
      <section className="mx-auto max-w-xl text-center">
        <h1 className="bb-hero-title text-char">
          <Editable value={copy.title} onChange={(title) => update((d) => { d.copy.quick.title = title; })} />
          <br />
          <Editable className="italic text-ember" value={copy.accent} onChange={(accent) => update((d) => { d.copy.quick.accent = accent; })} />
        </h1>
        <Editable as="p" className="mt-3 text-[0.72rem] tracking-[0.14em] text-mute" value={copy.sub} onChange={(sub) => update((d) => { d.copy.quick.sub = sub; })} />
      </section>
      <div className="mx-auto mt-8 max-w-2xl space-y-3">
        {rows.map((row) => (
          <article
            key={row.id}
            onClick={() => editing && setSelectedId(row.id)}
            className={`flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-3 ${selectedId === row.id ? "ring-2 ring-ember" : ""} ${row.hidden ? "opacity-40" : ""}`}
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
              <Photo src={row.imageUrl} alt={row.name} onChange={(imageUrl) => update((d) => { const item = d.events.find((x) => x.id === row.id); if (item) item.imageUrl = imageUrl; })} />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="font-medium">
                <Editable locked={row.locked} value={row.name} onChange={(name) => update((d) => { const item = d.events.find((x) => x.id === row.id); if (item) item.name = name; })} />
              </div>
              <div className="truncate text-xs text-mute">
                <Editable locked={row.locked} value={row.timeLabel} onChange={(timeLabel) => update((d) => { const item = d.events.find((x) => x.id === row.id); if (item) item.timeLabel = timeLabel; })} />
              </div>
              <div className="text-xs text-mute">{row.detail} · {row.spots} left</div>
            </div>
            <button type="button" className="rounded-full bg-char px-4 py-2 text-xs font-semibold text-paper" onClick={() => setSheet({ id: row.id, name: row.name, mode: "join" })}>
              JOIN
            </button>
          </article>
        ))}
      </div>
      <div className="mx-auto mt-8 max-w-xl text-center">
        <Editable as="p" className="text-sm leading-relaxed text-mute" value={copy.note} onChange={(note) => update((d) => { d.copy.quick.note = note; })} />
        <button type="button" className="mt-4 rounded-full border border-char px-5 py-2 text-sm" onClick={() => setSheet({ id: "create", name: "a quick seat", mode: "create-new" })}>
          I'm free now
        </button>
      </div>
      <Sheet
        open={!!sheet}
        title={sheet?.mode === "create-new" ? "Create a quick seat" : `Join ${sheet?.name || ""}`}
        body={sheet?.mode === "create-new" ? "If nobody joins, you were already going to eat. +5 points when you post it." : "No bio. Just a time and a place. +1 point."}
        confirmLabel={sheet?.mode === "create-new" ? "Create" : "Join"}
        onClose={() => setSheet(null)}
        onConfirm={async () => {
          if (sheet?.mode === "create-new") {
            const res = insertEvent({
              id: `quick-${Date.now().toString(36)}`,
              kind: "quick",
              name: "My table",
              typeLabel: "NOW",
              timeLabel: "NOW · NEAR ME",
              detail: "You created this",
              spots: 2,
              hidden: false,
              imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=60",
            }, 5);
            if (res.needLogin) {
              window.location.href = "/login";
              return;
            }
            notify("Quick seat posted · +5 pts");
            setSheet(null);
            return;
          }
          confirmSheet();
        }}
      />
    </main>
  );
}
