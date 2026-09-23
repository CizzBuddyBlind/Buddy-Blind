"use client";

import Link from "next/link";
import { useState } from "react";
import { useBB } from "@/components/Providers";

function tierFromPoints(points) {
  if (points >= 500) return "GOLD";
  if (points >= 100) return "SILVER";
  return "BRONZE";
}

export default function ProfilePage() {
  const { session } = useBB();
  const [tab, setTab] = useState("about");
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
  const points = session.points || 0;
  const tier = tierFromPoints(points);
  const next = tier === "GOLD" ? 500 : tier === "SILVER" ? 500 : 100;
  const pct = Math.min(100, Math.round((points / next) * 100));
  const letters = "ABCDEFGHIJKLMNO".split("");
  const reviews = [
    { handle: "Alex", body: "Easy to talk to" },
    { handle: "Mina", body: "Knows wine" },
    { handle: "Kenji", body: "On time" },
  ];

  return (
    <main className="bb-frame pb-28 pt-8 md:pb-16">
      <header className="text-center">
        <div className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full bg-card font-serif text-3xl text-ember">
          {session.handle.slice(0, 1).toUpperCase()}
        </div>
        <h1 className="font-serif text-[1.5rem]">{session.handle}</h1>
        <p className="mt-1.5 mb-2 text-[0.75rem] tracking-wide text-mute">
          {(session.bookings || []).length} TABLES · {session.ageRange} · {session.neighborhood} · {session.occupation.toUpperCase()}
        </p>
        <p className="mb-5 text-[0.7rem] uppercase tracking-[0.14em] text-ember">
          {session.role} · {session.verified ? "Verified" : "Not verified yet"}
        </p>
        <div className="mb-6 flex justify-center gap-2">
          {["about", "buddies", "reviews"].map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-full border px-[18px] py-1.5 text-[0.75rem] uppercase tracking-wide ${tab === t ? "border-white bg-white text-char" : "border-white/15 text-mute"}`}>
              {t}
            </button>
          ))}
        </div>
      </header>
      {tab === "about" && (
        <div className="mx-auto max-w-lg space-y-4">
          <div className="rounded-2xl border border-white/10 bg-card p-[18px]">
            <div className="flex justify-between text-[0.75rem] tracking-wide">
              <span>POINTS</span>
              <span>{points} / {next} · {tier}</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-ember" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-3 text-[0.8rem] leading-relaxed text-mute">2 pts invite · 1 pt join · 5 pts create. 100 pts → 5% off the table.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-card p-[18px] text-sm text-mute">
            <p>Plan · Free</p>
            <p className="mt-2">Email · {session.email}</p>
            <p className="mt-2">The same Login button is used by members, admins, and the founder. Role comes from the account, not from a separate door.</p>
          </div>
          {(session.bookings || []).length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-card p-[18px]">
              <p className="text-[0.75rem] tracking-wide">YOUR TABLES</p>
              <ul className="mt-3 space-y-2 text-sm text-mute">
                {session.bookings.slice().reverse().map((b) => (
                  <li key={b.at}>{b.name} · {b.mode}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {tab === "buddies" && (
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-3">
          {letters.map((letter) => (
            <div key={letter} className="grid aspect-square place-items-center rounded-full bg-card font-serif text-lg text-ember">{letter}</div>
          ))}
        </div>
      )}
      {tab === "reviews" && (
        <ul className="mx-auto max-w-lg space-y-3">
          {reviews.map((review) => (
            <li key={review.body} className="rounded-2xl border border-white/10 bg-card px-4 py-3 text-sm">
              <span className="text-mute">{review.handle} · </span>{review.body}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
