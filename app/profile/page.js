"use client";

import Link from "next/link";
import { useState } from "react";
import { useBB } from "@/components/Providers";
import { tierFromPoints } from "@/lib/bible";
import { AGE_RANGES } from "@/lib/bible";

export default function ProfilePage() {
  const bb = useBB();
  const { session, content, social } = bb;
  const [tab, setTab] = useState("about");
  const [draft, setDraft] = useState(null);
  const [stars, setStars] = useState(5);
  const [note, setNote] = useState("");
  const [buddyName, setBuddyName] = useState("");
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
    occupation: session.occupation || "",
    neighborhood: session.neighborhood || "",
    ageRange: session.ageRange || "30–40",
    phone: session.phone || "",
  };
  const points = session.points || 0;
  const tier = tierFromPoints(points, content.pointThresholds);
  const metal = tier === "gold" ? "Gold" : tier === "silver" ? "Silver" : "Bronze";
  const buddies = (social.buddies || []).filter((b) => b.status === "accepted");
  const pending = (social.buddies || []).filter((b) => b.status === "pending");
  const reviews = [
    ...(content.reviews || []).map((r, i) => ({ id: `seed-${i}`, stars: 5, body: r.body, from: r.handle })),
    ...(social.reviews || []),
  ];
  const avg = reviews.length ? (reviews.reduce((sum, r) => sum + (r.stars || 5), 0) / reviews.length).toFixed(1) : "–";
  const unread = (social.notes || []).filter((n) => !n.read).length;

  return (
    <main className="bb-frame pb-28 pt-8 md:pb-16">
      <header className="text-center">
        <div className="relative mx-auto mb-3 h-20 w-20">
          <span className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 rounded-full bg-ember px-2 py-0.5 text-[10px] font-bold uppercase text-white">{metal}</span>
          <div className="grid h-20 w-20 place-items-center rounded-full bg-card font-serif text-3xl text-ember">
            {session.handle.slice(0, 1).toUpperCase()}
          </div>
        </div>
        <h1 className="font-serif text-[1.5rem]">{session.handle}</h1>
        <p className="mt-1 text-sm text-ember">★ {avg}</p>
        <p className="mt-1.5 mb-2 text-[0.75rem] tracking-wide text-mute">
          {buddies.length} BUDDIES · {form.ageRange} · {form.neighborhood} · {(form.occupation || "Guest").toUpperCase()}
        </p>
        <p className="mb-2 text-[0.7rem] uppercase tracking-[0.14em] text-mute">
          {session.gender || "Gender private"} · {session.role} · {session.verified ? "Verified" : "Not verified yet"}
        </p>
        <p className="mb-5 text-xs text-mute">Photos stay off the public profile. The badge shows the level, not the point count.</p>
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {["about", "buddies", "reviews", "alerts"].map((item) => (
            <button key={item} type="button" onClick={() => { setTab(item); if (item === "alerts") bb.markNotesRead(); }} className={`rounded-full border px-[18px] py-1.5 text-[0.75rem] uppercase tracking-wide ${tab === item ? "border-white bg-white text-char" : "border-white/15 text-mute"}`}>
              {item}{item === "alerts" && unread ? ` ${unread}` : ""}
            </button>
          ))}
        </div>
      </header>
      {tab === "about" && (
        <div className="mx-auto max-w-lg space-y-4">
          <div className="rounded-2xl border border-white/10 bg-card p-[18px]">
            <p className="text-[0.75rem] tracking-wide">BADGE · {metal.toUpperCase()}</p>
            <p className="mt-2 text-sm text-mute">Other people only see this badge. The number below is for you.</p>
            <p className="mt-3 text-sm">Private points · {points}. Silver {content.pointThresholds?.silver || 100} · Gold {content.pointThresholds?.gold || 500}.</p>
            <p className="mt-2 text-[0.8rem] text-mute">2 invite · 1 join · 5 create. 100 = 5% off the fee, 300 = 10%, 500 = 20%.</p>
          </div>
          <form className="space-y-2 rounded-2xl border border-white/10 bg-card p-[18px]" onSubmit={(e) => { e.preventDefault(); bb.updateProfile(form); setDraft(null); }}>
            {[
              ["handle", "Username"],
              ["gender", "Gender · optional"],
              ["occupation", "Work · optional"],
              ["neighborhood", "Lives in"],
              ["phone", "Phone"],
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
            <button type="submit" className="rounded-full bg-fg px-4 py-2 text-sm font-semibold text-ink">Save profile</button>
          </form>
          <div className="rounded-2xl border border-white/10 bg-card p-[18px] text-sm text-mute">
            <p>Plan · {bb.premium ? "Premium trial" : "Free"}</p>
            <p className="mt-2">Email · {session.email}</p>
            <Link href="/subscribe" className="mt-2 inline-block text-ember">Subscription</Link>
          </div>
          {(session.bookings || []).length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-card p-[18px]">
              <p className="text-[0.75rem] tracking-wide">YOUR TABLES</p>
              <ul className="mt-3 space-y-2 text-sm text-mute">
                {session.bookings.slice().reverse().map((b) => (
                  <li key={b.at}>{b.name} · {b.mode}{b.dateISO ? ` · ${b.dateISO} ${b.time || ""}` : ""}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {tab === "buddies" && (
        <div className="mx-auto max-w-lg space-y-4">
          <p className="text-sm text-mute">{buddies.length} buddies. A request is one line: Hey! You are my vibe, let's be buddies!</p>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!buddyName.trim()) return; bb.requestBuddy(buddyName.trim()); setBuddyName(""); }}>
            <input value={buddyName} onChange={(e) => setBuddyName(e.target.value)} placeholder="Name from a dinner" className="flex-1 rounded-full border border-white/15 bg-card px-4 py-2 text-sm" />
            <button type="submit" className="rounded-full bg-fg px-4 py-2 text-sm font-semibold text-ink">Request</button>
          </form>
          {pending.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-sm">
              <span>{b.name} · pending</span>
              <span className="flex gap-2">
                <button type="button" onClick={() => bb.respondBuddy(b.id, true)}>Accept</button>
                <button type="button" onClick={() => bb.respondBuddy(b.id, false)}>Decline</button>
              </span>
            </div>
          ))}
          <div className="grid grid-cols-4 gap-3">
            {buddies.map((b) => (
              <div key={b.id} className="grid aspect-square place-items-center rounded-full bg-card text-center text-xs text-ember">{b.name.slice(0, 1).toUpperCase()}<span className="block text-[10px] text-mute">{b.name}</span></div>
            ))}
          </div>
        </div>
      )}
      {tab === "reviews" && (
        <div className="mx-auto max-w-lg space-y-3">
          <p className="text-sm text-mute">★ {avg} from dinners. Exact points are not part of a review.</p>
          <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); bb.addReview(stars, note); setNote(""); }}>
            <select value={stars} onChange={(e) => setStars(Number(e.target.value))} className="rounded-lg border border-white/15 bg-card px-3 py-2 text-sm">
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
            </select>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="On time. Knows wine." className="w-full rounded-xl border border-white/15 bg-card px-3 py-2 text-sm" />
            <button type="submit" className="rounded-full bg-fg px-4 py-2 text-sm font-semibold text-ink">Add comment</button>
          </form>
          <ul className="space-y-3">
            {reviews.map((review) => (
              <li key={review.id || review.body} className="rounded-2xl border border-white/10 bg-card px-4 py-3 text-sm">
                <span className="text-mute">{review.from} · {"★".repeat(review.stars || 5)} · </span>{review.body}
              </li>
            ))}
          </ul>
        </div>
      )}
      {tab === "alerts" && (
        <div className="mx-auto max-w-lg space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={social.notesOn !== false} onChange={(e) => bb.toggleNotes(e.target.checked)} />
            Event reminders, 2 hours before, inside Buddy Blind
          </label>
          <p className="text-xs text-mute">Turning this off stops new in-app reminders. Email and SMS are not connected.</p>
          {(social.notes || []).length === 0 && <p className="text-sm text-mute">No reminders yet.</p>}
          {(social.notes || []).map((n) => (
            <article key={n.id} className="rounded-2xl border border-white/10 bg-card px-4 py-3">
              <p className="text-sm">{n.title}</p>
              <p className="text-sm text-mute">{n.body}</p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
