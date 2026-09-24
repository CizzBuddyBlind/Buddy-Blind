"use client";

import { useState } from "react";
import { useBB } from "@/components/Providers";
import { fileToCover } from "@/components/Bits";

const EMPTY = { name: "", cuisine: "", location: "", phone: "", email: "", contact: "", about: "", photos: [] };

export default function AdminPage() {
  const bb = useBB();
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const venues = bb.content?.venues || [];

  if (!bb.staff) {
    return (
      <main className="bb-frame py-20">
        <h1 className="font-serif text-4xl">Restaurants</h1>
        <p className="mt-3 text-sm text-mute">Log in as an admin to add or remove a restaurant.</p>
      </main>
    );
  }

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function add(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setBusy(true);
    const id = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `venue-${Date.now().toString(36)}`;
    bb.update((draft) => {
      draft.venues = draft.venues.filter((venue) => venue.id !== id);
      draft.venues.unshift({
        id,
        name: form.name.trim(),
        cuisine: form.cuisine.trim(),
        typeLabel: form.cuisine.trim() || "Restaurant",
        locationLabel: form.location.trim(),
        priceTier: "",
        priceLabel: "",
        hours: "",
        timeLabel: "",
        spots: 4,
        area: "central",
        tonight: false,
        locked: false,
        hidden: false,
        imageUrl: form.photos[0] || "",
        gallery: form.photos,
        imageAlt: form.name.trim(),
        about: form.about.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        contact: form.contact.trim(),
      });
    });
    await bb.publish();
    setForm(EMPTY);
    setBusy(false);
  }

  async function remove(id) {
    bb.update((draft) => {
      draft.venues = draft.venues.filter((venue) => venue.id !== id);
    });
    await bb.publish();
  }

  return (
    <main className="bb-frame pb-28 pt-10 md:pb-16">
      <p className="text-[0.72rem] uppercase tracking-[0.2em] text-ember">Admin</p>
      <h1 className="mt-3 font-serif text-5xl">Restaurants</h1>
      <form onSubmit={add} className="mt-8 grid max-w-xl gap-3">
        <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Restaurant name" className="rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm" required />
        <input value={form.cuisine} onChange={(e) => set("cuisine", e.target.value)} placeholder="Cuisine" className="rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm" />
        <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Neighbourhood · street" className="rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm" />
        <input value={form.contact} onChange={(e) => set("contact", e.target.value)} placeholder="Contact name" className="rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm" />
        <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Phone" className="rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm" />
        <input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Email" className="rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm" />
        <textarea value={form.about} onChange={(e) => set("about", e.target.value)} placeholder="Description" rows={4} className="rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm" />
        <label className="text-sm text-mute">
          Photos
          <input type="file" accept="image/*" multiple className="mt-2 block text-sm" onChange={async (e) => {
            const files = [...(e.target.files || [])];
            const photos = [];
            for (const file of files) photos.push(await fileToCover(file));
            setForm((prev) => ({ ...prev, photos: [...prev.photos, ...photos].slice(0, 8) }));
          }} />
        </label>
        {form.photos.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {form.photos.map((src) => <img key={src.slice(0, 40)} src={src} alt="" className="h-16 w-20 rounded-lg object-cover" />)}
          </div>
        )}
        <button type="submit" disabled={busy} className="rounded-full bg-white py-3 text-sm font-semibold text-black disabled:opacity-60">
          {busy ? "Saving…" : "Add restaurant"}
        </button>
      </form>
      <ul className="mt-10 max-w-xl divide-y divide-white/10">
        {venues.map((venue) => (
          <li key={venue.id} className="flex items-center justify-between gap-4 py-3">
            <div>
              <p>{venue.name}</p>
              <p className="text-xs text-mute">{venue.locationLabel}{venue.email ? ` · ${venue.email}` : ""}</p>
            </div>
            <button type="button" onClick={() => remove(venue.id)} className="text-xs uppercase tracking-[0.14em] text-ember">Delete</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
