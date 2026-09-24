"use client";

import { useState } from "react";
import { Copy, Editable, Photo, Sheet } from "@/components/Bits";
import { PayDialog } from "@/components/Flows";
import { useBB } from "@/components/Providers";
import { queryHits } from "@/lib/bible";

export default function QuickPage() {
  const { content, editing, update, act, notify, setSelectedId, selectedId, insertEvent } = useBB();
  const [sheet, setSheet] = useState(null);
  const [area, setArea] = useState("");
  const copy = content.copy.quick;
  const query = area.trim().toLowerCase();
  const rows = content.events.filter((e) => e.kind === "quick" && (editing || !e.hidden)).filter((row) => {
    if (!query) return true;
    const blob = `${row.name} ${row.timeLabel} ${row.area || ""} ${row.detail || ""} ${row.typeLabel || ""} quick now tonight 今晚`;
    return queryHits(blob, query);
  });

  async function confirmSheet() {
    const res = await act("event", sheet.id, sheet.mode);
    if (res.needLogin) {
      try { sessionStorage.setItem("bb_next", "/quick"); } catch { /* ignore */ }
      window.location.href = "/login";
      return;
    }
    if (res.error) notify(res.error);
    else notify("You're in.");
    setSheet(null);
  }

  return (
    <main className="bb-frame pb-28 pt-8 md:pb-16">
      <div className="grid items-start gap-8 md:grid-cols-2">
        <section className="text-left">
          <h1 className="font-serif text-5xl leading-[0.95] text-char md:text-7xl">
            <Copy k="quick.title" legacy={copy.title} onEnglish={(d, next) => { d.copy.quick.title = next; }} />
            <br />
            <Copy k="quick.accent" legacy={copy.accent} className="italic text-ember" onEnglish={(d, next) => { d.copy.quick.accent = next; }} />
          </h1>
          <Copy as="p" k="quick.sub" legacy={copy.sub} className="mt-4 text-sm tracking-[0.08em] text-mute" onEnglish={(d, next) => { d.copy.quick.sub = next; }} />
        </section>
        <section>
          <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Tonight, Central, 中環, café…" className="w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-ember" />
          <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <article
            key={row.id}
            onClick={() => editing && setSelectedId(row.id)}
            className={`bb-lift flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-3 ${selectedId === row.id ? "ring-2 ring-ember" : ""} ${row.hidden ? "opacity-40" : ""}`}
          >
            <div className="bb-zoom-wrap h-16 w-16 shrink-0 overflow-hidden rounded-xl">
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
            <button type="button" className="rounded-full bg-char px-4 py-2 text-xs font-semibold text-paper" onClick={() => setSheet({ id: row.id, name: row.name, mode: "join", detail: row.timeLabel })}>
              JOIN
            </button>
          </article>
        ))}
          </div>
          <Copy as="p" k="quick.note" legacy={copy.note} className="mt-6 text-sm leading-relaxed text-mute" onEnglish={(d, next) => { d.copy.quick.note = next; }} />
          <button type="button" className="mt-4 rounded-full border border-char px-5 py-2 text-sm" onClick={() => setSheet({ id: "create", name: "a quick seat", mode: "create-new" })}>
            I'm free now
          </button>
        </section>
      </div>
      <Sheet
        open={sheet?.mode === "create-new"}
        title="Create a quick seat"
        body="If nobody joins, you were already going to eat. +5 points when you post it."
        confirmLabel="Create"
        onClose={() => setSheet(null)}
        onConfirm={async () => {
          const res = await insertEvent({
            id: `quick-${Date.now().toString(36)}`,
            kind: "quick",
            name: area.trim() ? `Free in ${area.trim()}` : "My table",
            typeLabel: "NOW",
            timeLabel: `NOW · ${(area.trim() || "NEAR ME").toUpperCase()}`,
            area: area.trim().toLowerCase(),
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
        }}
      />
      <PayDialog
        open={sheet?.mode === "join"}
        title={`Join · ${sheet?.name || ""}`}
        lines={[sheet?.name, sheet?.detail, "HK$5 administration fee"]}
        onClose={() => setSheet(null)}
        onConfirm={confirmSheet}
      />
    </main>
  );
}
