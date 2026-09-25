"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Editable, Photo } from "@/components/Bits";
import { HostBadge, PayDialog } from "@/components/Flows";
import { useBB } from "@/components/Providers";
import { queryHits } from "@/lib/bible";

const NEAR = [
  { q: "central", lat: 22.2819, lng: 114.155 },
  { q: "cwb", lat: 22.28, lng: 114.185 },
  { q: "tst", lat: 22.298, lng: 114.172 },
  { q: "sai kung", lat: 22.382, lng: 114.273 },
];

function placeOf(row, venues) {
  const key = String(row.name || "").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ").trim();
  const venue = (venues || []).find((item) => {
    const name = String(item.name || "").toLowerCase();
    return name === key || name.startsWith(key) || key.startsWith(name) || name.includes(key);
  });
  const branch = (venue?.branches || []).find((item) => item.address) || venue?.branches?.[0];
  return {
    id: venue?.id || "",
    name: venue?.name || row.name,
    address: branch?.address || venue?.address || venue?.locationLabel || "",
    cuisine: venue?.cuisine || row.typeLabel || "",
  };
}

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
  const router = useRouter();
  const { content, editing, update, act, notify, setSelectedId, selectedId, setFlow } = useBB();
  const [sheet, setSheet] = useState(null);
  const [area, setArea] = useState("");
  const [free, setFree] = useState(false);
  const [ask, setAsk] = useState(false);
  const [place, setPlace] = useState("");
  const [note, setNote] = useState("");
  const copy = content.copy.quick;
  const query = area.trim().toLowerCase();
  const rows = content.events.filter((e) => e.kind === "quick" && (editing || !e.hidden)).filter((row) => {
    if (!query) return true;
    const blob = `${row.name} ${row.timeLabel} ${row.area || ""} ${row.detail || ""} ${row.typeLabel || ""} quick now tonight 今晚`;
    return queryHits(blob, query);
  });
  const venues = (content.venues || []).filter((venue) => !venue.hidden || editing);
  const placeQuery = place.trim().toLowerCase();
  const matches = placeQuery
    ? venues.filter((venue) => queryHits(`${venue.name} ${venue.area || ""} ${venue.locationLabel || ""} ${venue.address || ""} ${(venue.branches || []).map((b) => `${b.label} ${b.address} ${b.area}`).join(" ")}`, placeQuery))
    : [];

  function shareLocation() {
    setAsk(false);
    if (!navigator.geolocation) {
      setNote("Location isn't available here. Type an area.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const found = nearestArea(pos.coords.latitude, pos.coords.longitude);
        setPlace(found);
        setNote("");
      },
      () => setNote("Couldn't get your location. Type an area."),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

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
    <main className="bb-frame pb-28 pt-10 md:pb-16">
      <div className="mx-auto grid w-full max-w-5xl items-start gap-10 md:grid-cols-2">
        <section className="flex flex-col justify-center py-8 md:sticky md:top-16 md:h-[calc(100dvh-4rem)]">
          <p className="text-xs uppercase tracking-[0.22em] text-mute">Quick meet</p>
          <h1 className="mt-4 font-serif text-5xl leading-[0.95] text-char md:text-6xl">
            <Copy k="quick.title" legacy={copy.title} onEnglish={(d, next) => { d.copy.quick.title = next; }} />
            <br />
            <Copy k="quick.accent" legacy={copy.accent} className="italic text-ember" onEnglish={(d, next) => { d.copy.quick.accent = next; }} />
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-mute">A seat nearby. A time. No bio, no swipe. If you're free, sit down.</p>
          <ul className="mt-6 space-y-2 text-sm text-ember">
            <li>Nearby, today</li>
            <li>Coffee, lunch, or a drink</li>
            <li>Join a seat, or open one</li>
          </ul>
        </section>
        <section>
          <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Tonight, Central, 中環, café…" className="w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-ember" />
          <div className="mt-4 space-y-3">
        {rows.map((row) => {
          const placeInfo = placeOf(row, venues);
          return (
          <article
            key={row.id}
            onClick={(e) => {
              if (e.target.closest("button, input, textarea, a")) return;
              if (editing) setSelectedId(row.id);
              if (placeInfo.id) router.push(`/venues/${placeInfo.id}`);
            }}
            className={`bb-lift flex cursor-pointer items-center gap-3 rounded-2xl border border-black/10 bg-white p-3 ${selectedId === row.id ? "ring-2 ring-ember" : ""} ${row.hidden ? "opacity-40" : ""}`}
          >
            <div className="bb-zoom-wrap h-16 w-16 shrink-0 overflow-hidden rounded-xl">
              <Photo src={row.imageUrl} alt={row.name} onChange={(imageUrl) => update((d) => { const item = d.events.find((x) => x.id === row.id); if (item) item.imageUrl = imageUrl; })} />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-2">
                <div className="min-w-0 font-medium">
                  <Editable locked={row.locked} value={placeInfo.name} onChange={(name) => update((d) => { const item = d.events.find((x) => x.id === row.id); if (item) item.name = name; })} />
                </div>
                <HostBadge handle={row.hostName || "CJ"} tier={row.hostTier || "gold"} />
              </div>
              <div className="text-xs text-mute">{placeInfo.address}</div>
              <div className="text-xs text-mute">{placeInfo.cuisine}</div>
              <div className="text-xs text-mute">{row.timeLabel} · {row.spots} left</div>
            </div>
            <button type="button" className="shrink-0 rounded-full bg-char px-4 py-2 text-xs font-semibold text-paper" onClick={() => setSheet({ id: row.id, name: placeInfo.name, mode: "join", detail: `${placeInfo.address} · ${placeInfo.cuisine}` })}>
              JOIN
            </button>
          </article>
          );
        })}
          </div>
          <Copy as="p" k="quick.note" legacy={copy.note} className="mt-6 text-sm leading-relaxed text-mute" onEnglish={(d, next) => { d.copy.quick.note = next; }} />
          <button type="button" className="mt-4 rounded-full border border-char px-5 py-2 text-sm" onClick={() => { setFree((v) => !v); setAsk(false); }}>
            I'm free now
          </button>
          {free && (
            <div className="mt-4 rounded-2xl border border-black/10 bg-white p-4">
              <p className="text-sm">Where are you?</p>
              <input value={place} onChange={(e) => { setPlace(e.target.value); setNote(""); }} placeholder="Central, CWB, TST…" className="mt-3 w-full rounded-full border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-ember" />
              <button type="button" className="mt-3 rounded-full bg-char px-4 py-2 text-xs font-semibold text-paper" onClick={() => setAsk(true)}>Nearby</button>
              {ask && (
                <div className="mt-3 rounded-xl bg-black/[0.03] p-3">
                  <p className="text-sm">Share your location? We only use it to show places near you.</p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" className="rounded-full bg-char px-4 py-2 text-xs font-semibold text-paper" onClick={shareLocation}>Share</button>
                    <button type="button" className="rounded-full border border-black/15 px-4 py-2 text-xs" onClick={() => setAsk(false)}>Not now</button>
                  </div>
                </div>
              )}
              {note && <p className="mt-3 text-sm text-mute">{note}</p>}
              {placeQuery && (
                <div className="mt-4 space-y-2">
                  {!matches.length && <p className="text-sm text-mute">Nothing there. Try another area.</p>}
                  {matches.map((venue) => (
                    <button key={venue.id} type="button" className="flex w-full items-center gap-3 rounded-xl border border-black/10 p-2 text-left" onClick={() => { setFlow({ type: "quick-invite", venueId: venue.id }); setFree(false); }}>
                      <img src={venue.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      <span>
                        <span className="block text-sm font-medium">{venue.name}</span>
                        <span className="block text-xs text-mute">{venue.locationLabel}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
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
