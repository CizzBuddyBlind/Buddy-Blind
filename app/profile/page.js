"use client";

import Link from "next/link";
import { useState } from "react";
import { useBB, peopleYouCanRate } from "@/components/Providers";
import { AGE_RANGES } from "@/lib/bible";
import { JoinedEvents } from "@/components/PhoneApp";

export default function ProfilePage() {
  const bb = useBB();
  const { session, social } = bb;
  const [draft, setDraft] = useState(null);
  const [edit, setEdit] = useState(false);
  const [buddiesOpen, setBuddiesOpen] = useState(false);
  const [buddy, setBuddy] = useState(null);
  const [page, setPage] = useState(0);
  const [rateOpen, setRateOpen] = useState(false);
  const [target, setTarget] = useState(null);
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
  const initial = String(session.handle || "B").trim().slice(0, 1).toUpperCase();
  const buddyLabel = buddies.length >= 15 ? "15+" : String(buddies.length);
  const received = (bb.content.peerReviews || [])
    .filter((review) => review.to === session.handle)
    .sort((a, b) => (b.at || 0) - (a.at || 0));
  const shown = received.slice(page * 3, page * 3 + 3);
  const canRate = peopleYouCanRate(bb.content, session.handle);

  return (
    <main className="bb-frame min-h-[100dvh] bg-ink pb-28 pt-10">
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
      <section className="mt-12">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-4xl">Comments & Rating</h2>
          <button
            type="button"
            onClick={() => { setRateOpen((open) => !open); setTarget(null); setNote(""); }}
            className="rounded-full border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
          >
            Rate someone
          </button>
        </div>
        {rateOpen && (
          <div className="mt-4 rounded-2xl border border-white/10 p-4">
            {!target && (
              <>
                {!canRate.length && <p className="text-sm text-mute">No one to rate yet. It opens an hour after you sit down together.</p>}
                <div className="flex flex-wrap gap-2">
                  {canRate.map((person) => (
                    <button key={person.handle} type="button" onClick={() => setTarget(person)} className="rounded-full border border-white/15 px-4 py-2 text-sm">
                      {person.handle} · {person.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            {target && (
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const res = bb.addReview(stars, note, target.handle, target.eventId);
                  if (res?.error) {
                    bb.notify(res.error);
                    return;
                  }
                  setNote("");
                  setTarget(null);
                  setRateOpen(false);
                }}
              >
                <p className="text-sm">{target.handle}</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setStars(n)} className={`text-lg ${n <= stars ? "text-ember" : "text-white/25"}`}>★</button>
                  ))}
                </div>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="A short line" className="w-full rounded-xl border border-white/15 bg-black px-3 py-2 text-sm" />
                <div className="flex gap-2">
                  <button type="button" className="rounded-full border border-white/15 px-4 py-2 text-sm" onClick={() => setTarget(null)}>Back</button>
                  <button type="submit" className="rounded-full bg-fg px-4 py-2 text-sm font-semibold text-ink">Save</button>
                </div>
              </form>
            )}
          </div>
        )}
        <div className="mt-5 space-y-3">
          {!shown.length && <p className="text-sm text-mute">No comments yet.</p>}
          {shown.map((review) => (
            <article key={review.id} className="rounded-2xl border border-white/10 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/80">{review.from}</p>
                <p className="text-sm tracking-widest text-ember">
                  {"★★★★★".slice(0, review.stars || 0)}
                  <span className="text-white/25">{"☆☆☆☆☆".slice(review.stars || 0)}</span>
                </p>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-white/85">{review.body}</p>
            </article>
          ))}
        </div>
        {received.length > 3 && (
          <div className="mt-4 flex justify-end gap-2">
            {page > 0 && (
              <button type="button" aria-label="Previous comments" onClick={() => setPage((n) => Math.max(0, n - 1))} className="grid h-10 w-10 place-items-center rounded-full border border-white/15">‹</button>
            )}
            {(page + 1) * 3 < received.length && (
              <button type="button" aria-label="Next comments" onClick={() => setPage((n) => n + 1)} className="grid h-10 w-10 place-items-center rounded-full border border-white/15">›</button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
