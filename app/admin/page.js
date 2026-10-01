"use client";

import Link from "next/link";
import { useState } from "react";
import { useBB } from "@/components/Providers";
import { fileToCover } from "@/components/Bits";
import { CUISINES } from "@/lib/bible";
import { say } from "@/lib/say";

const EMPTY = {
  name: "",
  cuisine: "Western",
  neighbourhood: "",
  address: "",
  phone: "",
  email: "",
  contactMethod: "whatsapp",
  about: "",
  photos: [],
};

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

export function restaurantFields(form) {
  return {
    name: form.name.trim(),
    cuisine: form.cuisine.trim() || "Western",
    typeLabel: form.cuisine.trim() || "Restaurant",
    neighbourhood: form.neighbourhood.trim(),
    locationLabel: form.neighbourhood.trim(),
    address: form.address.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    contactMethod: form.contactMethod === "sms" ? "sms" : "whatsapp",
    about: form.about.trim(),
  };
}

export default function AdminPage() {
  const bb = useBB();
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const venues = bb.content?.venues || [];

  if (!bb.ready) {
    return (
      <main className="bb-frame py-20">
        <p className="text-sm text-mute">…</p>
      </main>
    );
  }
  if (bb.session?.role !== "admin" && bb.session?.role !== "founder") {
    return (
      <main data-keep className="bb-frame py-20">
        <h1 className="font-serif text-4xl">{say(bb.lang, "Restaurants")}</h1>
        <p className="mt-3 text-sm text-mute">{say(bb.lang, "Log in with an admin account to add or edit a restaurant.")}</p>
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
    const fields = restaurantFields(form);
    bb.update((draft) => {
      draft.venues = draft.venues.filter((venue) => venue.id !== id);
      draft.venues.unshift({
        id,
        ...fields,
        priceTier: "$$",
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
        imageAlt: fields.name,
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
    <main data-keep className="bb-frame pb-28 pt-10 md:pb-16">
      <p className="text-[0.72rem] uppercase tracking-[0.2em] text-ember">Admin</p>
      <h1 className="mt-3 font-serif text-5xl">{say(bb.lang, "Restaurants")}</h1>
      <form onSubmit={add} className="mt-8 grid max-w-xl gap-3">
        <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={say(bb.lang, "Restaurant name")} className="rounded-xl border border-white/15 bg-card px-4 py-3 text-sm text-fg" required />
        <select value={form.cuisine} onChange={(e) => set("cuisine", e.target.value)} className="rounded-xl border border-white/15 bg-card px-4 py-3 text-sm text-fg">
          {CUISINES.map((item) => <option key={item} value={item}>{say(bb.lang, item)}</option>)}
        </select>
        <input value={form.neighbourhood} onChange={(e) => set("neighbourhood", e.target.value)} placeholder={say(bb.lang, "Neighbourhood")} className="rounded-xl border border-white/15 bg-card px-4 py-3 text-sm text-fg" />
        <input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder={say(bb.lang, "Full address")} className="rounded-xl border border-white/15 bg-card px-4 py-3 text-sm text-fg" />
        <input value={form.email} onChange={(e) => set("email", e.target.value)} type="email" placeholder={say(bb.lang, "Email")} className="rounded-xl border border-white/15 bg-card px-4 py-3 text-sm text-fg" />
        <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder={say(bb.lang, "Phone")} className="rounded-xl border border-white/15 bg-card px-4 py-3 text-sm text-fg" />
        <ContactPick value={form.contactMethod} onChange={(contactMethod) => set("contactMethod", contactMethod)} />
        <textarea value={form.about} onChange={(e) => set("about", e.target.value)} placeholder={say(bb.lang, "Description")} rows={4} className="rounded-xl border border-white/15 bg-card px-4 py-3 text-sm text-fg" />
        <label className="text-sm text-mute">
          {say(bb.lang, "Photos")}
          <input type="file" accept="image/*" multiple className="mt-2 block text-sm" onChange={async (e) => {
            const files = [...(e.target.files || [])];
            const photos = [];
            for (const file of files) photos.push(await fileToCover(file));
            setForm((prev) => ({ ...prev, photos: [...prev.photos, ...photos].slice(0, 8) }));
          }} />
        </label>
        {form.photos.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {form.photos.map((src, index) => <img key={`${index}-${String(src).length}`} src={src} alt="" className="h-16 w-20 rounded-lg object-cover" />)}
          </div>
        )}
        <button type="submit" disabled={busy} className="rounded-full bg-white py-3 text-sm font-semibold text-black disabled:opacity-60">
          {say(bb.lang, busy ? "Saving…" : "Add restaurant")}
        </button>
      </form>
      <ul className="mt-10 max-w-xl divide-y divide-white/10">
        {venues.map((venue) => (
          <li key={venue.id} className="flex items-center gap-4 py-3">
            <Link href={`/admin/${venue.id}`} className="min-w-0 flex-1">
              <p data-keep>{venue.name}</p>
              <p className="truncate text-xs text-mute">{venue.neighbourhood || venue.locationLabel}{venue.address ? ` · ${venue.address}` : ""}</p>
            </Link>
            <button type="button" onClick={() => remove(venue.id)} className="text-xs uppercase tracking-[0.14em] text-ember">{say(bb.lang, "Delete")}</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
