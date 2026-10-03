"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

const STEPS = [
  { n: "01", title: "See the place", body: "The photo is the filter. A restaurant, or a private night. Like the room, you’ll like the night." },
  { n: "02", title: "See enough", body: "Neighbourhood, time, seats left. Soho tonight or Central tomorrow. No faces. Enough to want it." },
  { n: "03", title: "Take a seat", body: "Join, or open the table. HK$5 only when you confirm. That’s for trust, not the meal." },
  { n: "04", title: "Show up", body: "No names before. No photos before. The restaurant is the scene. You bring the vibe." },
  { n: "05", title: "After the meal", body: "Stars aren’t about looks. A short line is your reputation. Your voice matters." },
  { n: "06", title: "Add a buddy", body: "Hey, you’re my vibe. One tap. If they say yes too, you’re buddies." },
  { n: "07", title: "Host the reason", body: "Premium. A private night, up to 20. Wine, social, a hike. You make the reason." },
  { n: "08", title: "Points change the circle", body: "Not the price. Join adds 1. Invite adds 2. Host adds 5. Enjoy the discount." },
];

const BADGES = [
  { letter: "B", name: "Bronze", points: "100 points", note: "5%", circle: "bb-metal-bronze" },
  { letter: "S", name: "Silver", points: "300 points", note: "10%", circle: "bb-metal-silver" },
  { letter: "G", name: "Gold", points: "500 points", note: "20%", circle: "bb-metal-gold" },
];

function AboutBody() {
  const params = useSearchParams();
  const [tab, setTab] = useState(params.get("tab") === "how" ? "how" : "about");
  return (
    <main className="bb-frame bg-ink pb-28 pt-10 text-fg md:pb-20">
      <div className="flex gap-2">
        {[
          ["about", "About us"],
          ["how", "How"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-[0.72rem] uppercase tracking-[0.16em] ${tab === id ? "bg-ember text-[#1a1408]" : "bg-white/10 text-white/70"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "about" ? (
        <>
          <h1 className="mt-8 max-w-4xl font-serif leading-[1.05]">
            <span className="block text-3xl text-white sm:text-4xl md:text-5xl">The restaurant is the setting.</span>
            <span className="mt-2 block text-3xl text-white sm:text-4xl md:text-5xl">The people are the experience.</span>
            <span className="mt-3 block text-5xl text-ember sm:text-6xl md:text-7xl">The conversation is the point.</span>
          </h1>
          <div className="mt-12 max-w-2xl space-y-5 text-base leading-relaxed text-white/70">
            <p>Buddy Blind is built on one simple idea: meet people without knowing exactly who you’re going to meet.</p>
            <p>You choose the time, the place, and how many seats. You know enough to decide you want to go — but you don’t get to pre-select who sits with you. That uncertainty isn’t a bug. It’s the product. We call it the Blind Box.</p>
            <p>Show up. Talk. Discover who they are through a real meal — not a profile, not a swipe, and not endless scrolling beforehand.</p>
            <p>Buddy Blind is not a dating app. It’s a way to get more real interaction back into everyday life: dinner, lunch near work, a drink after — planned in the app, lived at the table.</p>
          </div>
        </>
      ) : (
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="mt-8 max-w-4xl font-serif text-[3.4rem] leading-[0.95] text-white sm:text-6xl md:text-7xl">
            See venue, see vibe
            <br />
            <span className="italic text-ember">Take a seat.</span>
          </h1>
          <ol className="mt-14 overflow-hidden rounded-[1.7rem] border border-white/15">
            {STEPS.map((step) => (
              <li key={step.n} className="grid grid-cols-[3.2rem_1fr] gap-2 border-t border-white/10 px-6 py-7 first:border-t-0 sm:px-10">
                <span className="pt-2 text-xs tracking-[0.12em] text-white/40">{step.n}</span>
                <div>
                  <h2 className="font-serif text-[1.65rem] leading-tight text-white md:text-[1.85rem]">{step.title}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">{step.body}</p>
                  {step.n === "08" && (
                    <div className="mt-5 flex flex-wrap gap-6">
                      {BADGES.map((badge) => (
                        <div key={badge.letter} className="flex items-center gap-3">
                          <span className={`grid h-11 w-11 place-items-center rounded-full font-serif text-lg font-semibold ring-1 ring-black/15 ${badge.circle}`}>{badge.letter}</span>
                          <span>
                            <span className="block text-sm text-white">{badge.name}</span>
                            <span className="block text-xs text-white/45">{badge.points} · {badge.note}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </main>
  );
}

export default function AboutPage() {
  return (
    <Suspense fallback={<main className="bb-frame py-20 text-white/45">Loading…</main>}>
      <AboutBody />
    </Suspense>
  );
}
