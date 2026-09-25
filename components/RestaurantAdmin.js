"use client";

import { useState } from "react";
import { useBB } from "./Providers";
import { CUISINES, prettyDate } from "@/lib/bible";
import { channelNote, notifyRestaurant } from "@/lib/notify";

export function RestaurantAdmin() {
  const bb = useBB();
  const venues = bb.content.venues;
  const [id, setId] = useState(venues[0]?.id || "");
  const venue = venues.find((v) => v.id === id) || venues[0];
  const [sending, setSending] = useState(false);
  if (!venue) return <p className="text-xs text-mute">No restaurants yet. Add a venue card first.</p>;

  function patch(partial) {
    bb.update((draft) => {
      const row = draft.venues.find((v) => v.id === venue.id);
      if (!row) return;
      Object.assign(row, partial);
    });
  }

  return (
    <div className="space-y-3 text-xs">
      <p className="bb-kicker text-mute">Restaurants</p>
      <p className="text-mute">Only an admin adds or edits a restaurant. Guests cannot list their own. Save draft, then Publish, before the public site changes.</p>
      <select value={venue.id} onChange={(e) => setId(e.target.value)} className="w-full rounded-lg border border-white/15 bg-black px-2 py-2">
        {venues.map((v) => (
          <option key={v.id} value={v.id}>{v.hidden ? "Hidden · " : ""}{v.name}</option>
        ))}
      </select>
      <label className="block">Name
        <input value={venue.name} onChange={(e) => patch({ name: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-2 py-2" />
      </label>
      <label className="block">Neighbourhood
        <input value={venue.neighbourhood || ""} onChange={(e) => patch({ neighbourhood: e.target.value, locationLabel: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-2 py-2" />
      </label>
      <label className="block">Full address
        <input value={venue.address || ""} onChange={(e) => patch({ address: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-2 py-2" />
      </label>
      <label className="block">Cuisine
        <select value={venue.cuisine || "Western"} onChange={(e) => patch({ cuisine: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-2 py-2">
          {CUISINES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label className="block">Email
        <input value={venue.email || ""} onChange={(e) => patch({ email: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-2 py-2" />
      </label>
      <label className="block">Phone
        <input value={venue.phone || ""} onChange={(e) => patch({ phone: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-2 py-2" />
      </label>
      <div className="block">Preferred contact
        <div className="mt-1 flex gap-2">
          {[
            ["sms", "SMS"],
            ["whatsapp", "WhatsApp"],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => patch({ contactMethod: id })} className={`rounded-full px-3 py-1 ${venue.contactMethod === id ? "bg-white font-semibold text-black" : "border border-white/15"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <label className="block">Hours
        <input value={venue.hours || ""} onChange={(e) => patch({ hours: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-2 py-2" />
      </label>
      <label className="block">Price
        <select value={venue.priceTier || "$$"} onChange={(e) => patch({ priceTier: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-2 py-2">
          {["$", "$$", "$$$", "$$$$"].map((p) => <option key={p}>{p}</option>)}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={!!venue.petFriendly} onChange={(e) => patch({ petFriendly: e.target.checked })} />
        Pet friendly
      </label>
      <p className="text-mute">Preview · {venue.cuisine} · {venue.priceTier} · {venue.address}{venue.petFriendly ? " · pet friendly" : ""}</p>
      <button
        type="button"
        disabled={sending}
        className="rounded-full bg-ember px-3 py-1 font-semibold text-white disabled:opacity-40"
        onClick={async () => {
          setSending(true);
          const result = await notifyRestaurant({
            venueName: venue.name,
            email: venue.email,
            phone: venue.phone,
            method: venue.contactMethod || "email",
            action: "test",
            dateISO: new Date().toISOString().slice(0, 10),
            time: "7:00 PM",
            host: bb.session?.handle || "Buddy",
            participants: 2,
            held: 4,
            status: "test",
            reason: "Test from the restaurant editor.",
            userEmail: bb.session?.email || "",
          });
          setSending(false);
          bb.notify(channelNote(result));
        }}
      >
        {sending ? "Sending…" : "Send test to this restaurant"}
      </button>
      <button type="button" className="rounded-full border border-white/15 px-3 py-1" onClick={() => bb.toggleHide("venue", venue.id)}>
        {venue.hidden ? "Activate on the site" : "Deactivate"}
      </button>
      <div className="border-t border-white/10 pt-3">
        <p className="bb-kicker text-mute">Point badges</p>
        <p className="text-mute">Bronze 100 · 5%. Silver 300 · 10%. Gold 500 · 20%. The discount is on the HK$5 fee only.</p>
        <div className="mt-2 flex gap-2">
          <label>Bronze
            <input type="number" value={bb.content.pointThresholds?.bronze || 100} onChange={(e) => bb.update((d) => { d.pointThresholds.bronze = Number(e.target.value) || 100; })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-2 py-2" />
          </label>
          <label>Silver
            <input type="number" value={bb.content.pointThresholds?.silver || 300} onChange={(e) => bb.update((d) => { d.pointThresholds.silver = Number(e.target.value) || 300; })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-2 py-2" />
          </label>
          <label>Gold
            <input type="number" value={bb.content.pointThresholds?.gold || 500} onChange={(e) => bb.update((d) => { d.pointThresholds.gold = Number(e.target.value) || 500; })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-2 py-2" />
          </label>
        </div>
      </div>
      <div className="border-t border-white/10 pt-3">
        <p className="bb-kicker text-mute">Booking log</p>
        {(bb.content.bookingLog || []).length === 0 && <p className="text-mute">No booking yet. When someone opens or joins a table, the restaurant line appears here.</p>}
        {(bb.content.bookingLog || []).slice(0, 12).map((row) => (
          <div key={row.id} className="border-b border-white/10 py-2">
            <div>{row.venue} · {row.action}</div>
            <div className="text-mute">{prettyDate(row.dateISO)} {row.time} · host {row.host}</div>
            <div className="text-mute">{row.participants} joined · hold {row.held} · original {row.original} · {row.status}</div>
            <div className="text-mute">{row.method} · {row.phone || row.email}</div>
            <div className="text-mute">{row.channelNote}</div>
            <div className="text-mute">{row.reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
