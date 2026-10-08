"use client";

import { useState } from "react";
import { Copy } from "@/components/Bits";
import { PayDialog } from "@/components/Flows";
import { QuickCard, QuickDetail, QuickStart } from "@/components/QuickStart";
import { useBB } from "@/components/Providers";
import { queryHits } from "@/lib/bible";
import { quickRows } from "@/lib/quickFeed";
import { say } from "@/lib/say";

const NEAR = [
  { q: "central", lat: 22.2819, lng: 114.155 },
  { q: "cwb", lat: 22.28, lng: 114.185 },
  { q: "tst", lat: 22.298, lng: 114.172 },
  { q: "sai kung", lat: 22.382, lng: 114.273 },
];

function nearestArea(lat, lng) {
  let best = NEAR[0];
  let bestDist = Infinity;
  NEAR.forEach((spot) => {
    const d = (spot.lat - lat) ** 2 + (spot.lng - lng) ** 2;
    if (d < bestDist) {
      best = spot;
      bestDist = d;
    }
  });
  return best.q;
}

export default function QuickPage() {
  const { content, editing, act, joinTable, notify, setSelectedId, lang, market } = useBB();
  const [sheet, setSheet] = useState(null);
  const [detail, setDetail] = useState(null);
  const [area, setArea] = useState("");
  const copy = content.copy.quick;
  const query = area.trim().toLowerCase();
  const rows = quickRows(content).filter((e) => editing || !e.hidden).filter((row) => {
    if (!query) return true;
    const blob = `${row.name} ${row.timeLabel} ${row.area || ""} ${row.detail || ""} ${row.typeLabel || ""} quick now tonight 今晚`;
    return queryHits(blob, query);
  });

  async function confirmSheet() {
    const res = sheet.source === "partner"
      ? await joinTable({ venueId: sheet.venueId, tableId: sheet.tableId })
      : await act("event", sheet.id, sheet.mode);
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
    <main className="bb-frame pb-28 pt-10 md:pb-16">
      <div className="mx-auto grid min-h-[calc(100dvh-6rem)] w-full max-w-5xl items-start gap-10 md:grid-cols-2">
        <section className="md:sticky md:top-16 md:-mt-10 md:flex md:h-[calc(100dvh-4rem)] md:flex-col md:justify-center md:pb-4">
          <div>
          <p className="text-xs uppercase tracking-[0.22em] text-mute">Quick meet</p>
          <h1 className="mt-4 font-serif text-5xl leading-[0.95] text-char md:text-6xl">
            <Copy k="quick.title" legacy={copy.title} onEnglish={(d, next) => { d.copy.quick.title = next; }} />
            <br />
            <Copy k="quick.accent" legacy={copy.accent} className="italic text-ember" onEnglish={(d, next) => { d.copy.quick.accent = next; }} />
          </h1>
          <p className="bb-lead-gap max-w-sm text-sm leading-relaxed text-mute">{say(lang, "A seat nearby. A time. No bio, no swipe. If you're free, sit down.")}</p>
          <ul className="mt-6 space-y-2 text-sm text-mute">
            <li>{say(lang, "Nearby, today")}</li>
            <li>{say(lang, "Coffee, lunch, or a drink")}</li>
            <li>{say(lang, "Join a seat, or open one")}</li>
          </ul>
          </div>
        </section>
        <section>
          <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Tonight, Central, 中環, café…" className="w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-ember" />
          <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <QuickCard
            key={row.id}
            row={row}
            onOpen={() => { if (editing) setSelectedId(row.id); setDetail(row); }}
            onJoin={() => setSheet({ id: row.id, name: row.name, mode: "join", detail: row.time || row.timeLabel || "", source: row.source, venueId: row.venueId, tableId: row.tableId })}
          />
        ))}
          </div>
          <Copy as="p" k="quick.note" legacy={copy.note} className="mt-6 text-sm leading-relaxed text-mute" onEnglish={(d, next) => { d.copy.quick.note = next; }} />
          <QuickStart locate={nearestArea} />
        </section>
      </div>
      {detail && (
        <QuickDetail
          row={detail}
          onClose={() => setDetail(null)}
          onJoin={() => { setSheet({ id: detail.id, name: detail.name, mode: "join", detail: detail.time || detail.timeLabel || "", source: detail.source, venueId: detail.venueId, tableId: detail.tableId }); setDetail(null); }}
        />
      )}
      <PayDialog
        open={sheet?.mode === "join"}
        title={`Join · ${sheet?.name || ""}`}
        lines={[sheet?.name, sheet?.detail, `${market?.fee || "HK$5"} administration fee`]}
        onClose={() => setSheet(null)}
        onConfirm={confirmSheet}
      />
    </main>
  );
}
