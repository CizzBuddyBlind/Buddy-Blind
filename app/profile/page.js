"use client";

import Link from "next/link";
import { useState } from "react";
import { useBB } from "@/components/Providers";
import { AGE_RANGES } from "@/lib/bible";
import { JoinedEvents } from "@/components/PhoneApp";

export default function ProfilePage() {
  const bb = useBB();
  const { session, social } = bb;
  const [draft, setDraft] = useState(null);
  const [edit, setEdit] = useState(false);
  const [buddiesOpen, setBuddiesOpen] = useState(false);
  const [buddy, setBuddy] = useState(null);
  const [stars, setStars] = useState(5);
  const [note, setNote] = useState("");
  if (!session) {
    return (
      <main className="bb-frame grid min-h-[70dvh] place-items-center pb-28 text-center">
        <div>
          <p className="bb-kicker text-mute">Profile</p>
          <h1 className="mt-3 font-serif text-3xl">Log in to see your seat.</h1>
          <Link href="/login" className="mt-6 inline-block rounded-full bg-fg px-6 py-3 text-sm font-semibold text-ink">Login</Link>
        </div>
      </main>
    );
  }
  const form = draft || {
    handle: session.handle,
    gender: session.gender || "",
    orientation: session.orientation || "",
    occupation: session.occupation || "",
    neighborhood: session.neighborhood || "",
    ageRange: session.ageRange || "30–40",
  };
  const buddies = (social.buddies || []).filter((b) => b.status === "accepted");
  const pending = (social.buddies || []).filter((b) => b.status === "pending");
  const reviews = [
    ...(bb.content.reviews || []).map((r, i) => ({ id: `seed-${i}`, stars: 5, body: r.body, from: r.handle })),
    ...(social.reviews || []),
  ];
  const initial = String(session.handle || "B").trim().slice(0, 1).toUpperCase();
  const buddyLabel = buddies.length >= 15 ? "15+" : String(buddies.length);

  return (
    <main className="bb-frame min-h-[100dvh] bg-ink pb-28 pt-8">
      <div className="grid items-start gap-8 md:grid-cols-2">
        <section>
          <div className="grid h-20 w-20 place-items-center rounded-full bg-card font-serif text-3xl">{initial}</div>
          <h1 className="mt-3 font-serif text-2xl">{session.handle}</h1>
          <div className="mt-4 space-y-1 text-sm text-mute">
            <p>Age · {form.ageRange || "—"}</p>
            <p>Gender · {form.gender || "—"}</p>
            <p>Orientation · {form.orientation || "—"}</p>
            <p>Lives in · {form.neighborhood || "—"}</p>
            <p>Work · {form.occupation || "—"}</p>
            <p className="pt-1 text-fg">Buddies {buddyLabel}</p>
          </div>
          <div className="mt-5 space-y-2">
            {reviews.map((review) => (
              <p key={review.id || review.body} className="rounded-2xl border border-white/10 bg-card px-4 py-3 text-sm">
                “{review.body}”
              </p>
            ))}
            <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); bb.addReview(stars, note); setNote(""); }}>
              <select value={stars} onChange={(e) => setStars(Number(e.target.value))} className="rounded-lg border border-white/15 bg-card px-3 py-2 text-sm">
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
              </select>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="A short comment" className="w-full rounded-xl border border-white/15 bg-card px-3 py-2 text-sm" />
              <button type="submit" className="rounded-full border border-white/15 px-4 py-2 text-sm">Add comment</button>
            </form>
          </div>
          <button type="button" className="mt-5 rounded-full bg-fg px-5 py-2 text-sm font-semibold text-ink" onClick={() => setBuddiesOpen((v) => !v)}>
            Buddies
          </button>
          {buddiesOpen && !buddy && (
            <div className="mt-3">
              {!buddies.length && !pending.length && <p className="text-sm text-mute">No buddies yet.</p>}
              <div className="flex flex-wrap gap-2">
                {pending.map((b) => (
                  <button key={b.id} type="button" title={`${b.name} · waiting`} onClick={() => setBuddy(b)} className="grid h-11 w-11 place-items-center rounded-full border border-dashed border-white/25 text-sm text-mute">
                    {b.name.slice(0, 1).toUpperCase()}
                  </button>
                ))}
                {buddies.map((b) => (
                  <button key={b.id} type="button" title={b.name} onClick={() => setBuddy(b)} className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-card font-serif text-lg">
                    {b.name.slice(0, 1).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
          {buddy && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-card p-4">
              <button type="button" className="text-xs text-mute" onClick={() => setBuddy(null)}>Back</button>
              <div className="mt-3 grid h-14 w-14 place-items-center rounded-full bg-black font-serif text-2xl">{buddy.name.slice(0, 1).toUpperCase()}</div>
              <h2 className="mt-3 font-serif text-2xl">{buddy.name}</h2>
              <p className="mt-1 text-sm text-mute">{buddy.status === "pending" ? "Waiting" : "Your buddy"}</p>
              {buddy.area && <p className="mt-2 text-sm">{buddy.area}</p>}
              {buddy.note && <p className="text-sm text-mute">{buddy.note}</p>}
              {buddy.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button type="button" className="rounded-full bg-fg px-3 py-1 text-sm text-ink" onClick={() => { bb.respondBuddy(buddy.id, true); setBuddy(null); }}>Accept</button>
                  <button type="button" className="rounded-full border border-white/15 px-3 py-1 text-sm" onClick={() => { bb.respondBuddy(buddy.id, false); setBuddy(null); }}>No</button>
                </div>
              )}
            </div>
          )}
          <button type="button" className="mt-4 block text-xs text-mute" onClick={() => setEdit((v) => !v)}>{edit ? "Close" : "Edit details"}</button>
          {edit && (
            <form className="mt-3 space-y-2" onSubmit={(e) => { e.preventDefault(); bb.updateProfile(form); setDraft(null); setEdit(false); }}>
              {[
                ["handle", "Username"],
                ["gender", "Gender"],
                ["orientation", "Orientation"],
                ["occupation", "Work"],
                ["neighborhood", "Lives in"],
              ].map(([key, label]) => (
                <label key={key} className="block text-xs text-mute">{label}
                  <input value={form[key]} onChange={(e) => setDraft({ ...form, [key]: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-fg" />
                </label>
              ))}
              <label className="block text-xs text-mute">Age range
                <select value={form.ageRange} onChange={(e) => setDraft({ ...form, ageRange: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-fg">
                  {!AGE_RANGES.includes(form.ageRange) && <option>{form.ageRange}</option>}
                  {AGE_RANGES.map((range) => <option key={range}>{range}</option>)}
                </select>
              </label>
              <button type="submit" className="rounded-full bg-fg px-4 py-2 text-sm font-semibold text-ink">Save</button>
            </form>
          )}
        </section>
        <section>
          <JoinedEvents />
        </section>
      </div>
    </main>
  );
}
