"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function Rich({ text }) {
  const parts = String(text).split(/(\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <strong key={index} className="font-semibold text-white">{part.slice(1, -1)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

const STEPS = [
  { n: "01", title: "Home", body: ["Start here. *You don’t know who you’ll meet. That’s the point.* Beside it, we show one event we picked: the fullest table today."] },
  { n: "02", title: "Venues", body: ["Pick from our partner restaurants. See the *place, time, and seats left — not who’s coming.*", "Join a table that already exists, invite others to one, or open your own. *You pick where and when. The people stay blind.*"] },
  { n: "03", title: "Quick Meet", body: ["For when you’re free *today* and just want someone nearby to join you.", "Maybe nobody at work is free for lunch. Maybe you want someone for a coffee or tea break, a casual after-work drink, or you’re a student looking for someone around campus to grab food with.", "*Open a seat or join one nearby.* No planning weeks ahead — just find someone who happens to be free too."] },
  { n: "04", title: "Private", body: ["This one starts with *your reason*.", "Create almost any kind of social event and decide how small or large you want it to be — *from 2 people to 20*.", "Bring IT people together for networking. Start something for lawyers, doctors, designers, founders, or whatever field you’re in.", "Create a hiking or mahjong group for people 50+ who want to expand their social circle. Host an LGBTQ+ night, or create something specifically for gay, lesbian, bi, trans, or queer people who want to meet others in their community.", "Find fellow geeks for a board-game night. Find another movie lover who actually wants to go to the cinema with you.", "*You decide the interest, activity, time, place, and number of people.*", "Others join because they’re interested in the same thing — *not because they picked your profile.*", "Hosting is *Premium*."] },
  { n: "05", title: "Me Time", body: ["Everything you’ve joined, in one place. *Today, and what’s next.*", "When the day comes, one tap tells us *I’m coming* or *I’m here*.", "Then put the app away and meet the people behind the seats."] },
  { n: "06", title: "Plan", body: ["*Free* to explore. *Lite* to comment and rate. *Premium* to host.", "Try Premium free, then stay if you want.", "Your plan unlocks features; it is separate from the *$5 administrative fee* for joining an event."] },
  { n: "07", title: "Profile", body: ["Your Buddy Blind history lives here: *your circle, points, Buddies, events you joined, and events you hosted.*", "After an event, people who actually attended the same event can *review and rate each other*."] },
  { n: "08", title: "Buddies", body: ["Met someone you actually want to see again? *Add them as a Buddy.*", "You can only add someone after you’ve both been part of the same event. That keeps Buddies about people you’ve actually met through Buddy Blind — not random profiles you found in the app.", "Once you’re Buddies, meeting again is easy. Whenever you *Invite, Join, or Host*, you can select the Buddies you want to bring along and notify them directly.", "*Meet blind once. Meet again by choice.*"] },
  { n: "09", title: "Points change the circle", body: ["Points reward you for taking part and bringing people together.", "*Join adds 1. Invite adds 2. Host adds 5.*", "More points move your circle up and give you a bigger discount."] },
  { n: "10", title: "Why the $5 administrative fee?", body: ["The $5 administrative fee helps keep Buddy Blind *accountable* when people who may not know each other are meeting in real life.", "When you join an event, your booking creates a record connecting your registered account to that specific *event, date, and time*.", "Your registered contact and verification information, together with the payment record associated with the booking, can help identify the account behind a seat if something serious happens.", "For example, if someone leaves without paying their bill, damages property, or an incident requires police involvement, Buddy Blind can identify the relevant account and event record and, where appropriate or legally required, assist the venue or authorities with information available to us.", "For that reason, the $5 administrative fee is *non-refundable once the booking is confirmed*, including if you later decide not to attend. It is attached to the confirmed booking and the accountability record created with it.", "*You may not know who’s sitting at the table. But nobody at the table is completely anonymous.*"] },
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
          <div className="bb-lead-gap max-w-2xl space-y-5 text-base leading-relaxed text-white/70">
            <p>Buddy Blind is built on one simple idea: meet people without knowing exactly who you’re going to meet.</p>
            <p>You choose the time, the place, and how many seats. You know enough to decide you want to go — but you don’t get to pre-select who sits with you. That uncertainty isn’t a bug. It’s the product. We call it the Blind Box.</p>
            <p>Show up. Talk. Discover who they are through a real meal — not a profile, not a swipe, and not endless scrolling beforehand.</p>
            <p>Buddy Blind is not a dating app. It’s a way to get more real interaction back into everyday life: dinner, lunch near work, a drink after — planned in the app, lived at the table.</p>
          </div>
        </>
      ) : (
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="mt-8 max-w-4xl font-serif text-[3.4rem] font-semibold leading-[0.95] text-white sm:text-6xl md:text-7xl">
            See venue, see vibe
            <br />
            <span className="italic text-ember">Take a seat.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/55">
            <Rich text="Pick the place, time, or interest — not the people. *Take a seat, show up, and see who you meet.*" />
          </p>
          <ol className="bb-lead-gap overflow-hidden rounded-[1.7rem] border border-white/15">
            {STEPS.map((step) => (
              <li key={step.n} className="grid grid-cols-[3.2rem_1fr] gap-2 border-t border-white/10 px-6 py-7 first:border-t-0 sm:px-10">
                <span className="pt-2 text-xs tracking-[0.12em] text-white/40">{step.n}</span>
                <div>
                  <h2 className="font-serif text-[1.65rem] font-semibold leading-tight text-white md:text-[1.85rem]">{step.title}</h2>
                  {step.body.map((line) => (
                    <p key={line} className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55"><Rich text={line} /></p>
                  ))}
                  {step.n === "09" && (
                    <div className="mt-5 flex flex-wrap gap-6">
                      {BADGES.map((badge) => (
                        <div key={badge.letter} className="flex items-center gap-3">
                          <span className={`grid h-11 w-11 place-items-center rounded-full font-serif text-lg font-semibold ring-1 ring-black/15 ${badge.circle}`}>{badge.letter}</span>
                          <span>
                            <span className="block text-sm text-white">{badge.name}</span>
                            <span className="block text-xs text-white/45"><strong className="font-semibold">{badge.points}</strong> · <strong className="font-semibold">{badge.note}</strong></span>
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
