"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useBB } from "@/components/Providers";
import { fileToCover } from "@/components/Bits";
import { CUISINES } from "@/lib/bible";
import { restaurantFields } from "../page";

function ContactPick({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {[
        ["sms", "SMS"],
        ["whatsapp", "WhatsApp"],
      ].map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`rounded-full px-4 py-2 text-sm ${value === id ? "bg-white font-semibold text-black" : "border border-white/20 text-white/70"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function RestaurantEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const bb = useBB();
  const venue = (bb.content?.venues || []).find((item) => item.id === id);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const draft = form || (venue ? {
    name: venue.name || "",
    cuisine: venue.cuisine || "Western",
    neighbourhood: venue.neighbourhood || String(venue.locationLabel || "").split("·")[0].trim(),
    address: venue.address || "",
    phone: venue.phone || "",
    email: venue.email || "",
    contactMethod: venue.contactMethod === "sms" ? "sms" : "whatsapp",
    about: venue.about || "",
    photos: (venue.gallery || []).filter(Boolean),
  } : null);

  if (!bb.ready) return null;
  if (bb.session?.role !== "admin") {
    return (
      <main className="bb-frame py-20">
        <h1 className="font-serif text-4xl">Restaurants</h1>
        <p className="mt-3 text-sm text-mute">Log in with an admin account to edit a restaurant.</p>
      </main>
    );
  }
  if (!venue || !draft) {
    return (
      <main className="bb-frame py-20">
        <p className="text-sm text-mute">That restaurant is not on the list.</p>
        <Link href="/admin" className="mt-4 inline-block text-sm text-ember">Back</Link>
      </main>
    );
  }

  function set(key, value) {
    setForm({ ...draft, [key]: value });
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    const fields = restaurantFields(draft);
    const photos = (draft.photos || []).filter(Boolean).slice(0, 8);
    bb.update((content) => {
      const row = content.venues.find((item) => item.id === venue.id);
      if (!row) return;
      Object.assign(row, fields, {
        imageUrl: photos[0] || row.imageUrl || "",
        gallery: photos.length ? photos : row.gallery,
        imageAlt: fields.name,
      });
    });
    await bb.publish();
    setBusy(false);
    router.push("/admin");
  }

  return (
    <main className="bb-frame pb-28 pt-10 md:pb-16">
      <Link href="/admin" className="text-xs uppercase tracking-[0.16em] text-white/45">Restaurants</Link>
      <h1 className="mt-3 font-serif text-5xl">{venue.name}</h1>
      <form onSubmit={save} className="mt-8 grid max-w-xl gap-3">
        <input value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="Restaurant name" className="rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm" required />
        <select value={draft.cuisine} onChange={(e) => set("cuisine", e.target.value)} className="rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm">
          {CUISINES.map((item) => <option key={item}>{item}</option>)}
        </select>
        <input value={draft.neighbourhood} onChange={(e) => set("neighbourhood", e.target.value)} placeholder="Neighbourhood" className="rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm" />
        <input value={draft.address} onChange={(e) => set("address", e.target.value)} placeholder="Full address" className="rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm" />
        <input value={draft.email} onChange={(e) => set("email", e.target.value)} placeholder="Email" className="rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm" />
        <input value={draft.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Phone" className="rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm" />
        <ContactPick value={draft.contactMethod} onChange={(contactMethod) => set("contactMethod", contactMethod)} />
        <textarea value={draft.about} onChange={(e) => set("about", e.target.value)} placeholder="Description" rows={4} className="rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm" />
        <label className="text-sm text-mute">
          Photos
          <input type="file" accept="image/*" multiple className="mt-2 block text-sm" onChange={async (e) => {
            const files = [...(e.target.files || [])];
            const photos = [];
            for (const file of files) photos.push(await fileToCover(file));
            set("photos", [...draft.photos, ...photos].slice(0, 8));
          }} />
        </label>
        {draft.photos.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {draft.photos.map((src) => <img key={String(src).slice(0, 48)} src={src} alt="" className="h-16 w-20 rounded-lg object-cover" />)}
          </div>
        )}
        <button type="submit" disabled={busy} className="rounded-full bg-white py-3 text-sm font-semibold text-black disabled:opacity-60">
          {busy ? "Saving…" : "Save restaurant"}
        </button>
      </form>
    </main>
  );
}
