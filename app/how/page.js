"use client";

const STEPS = [
  {
    n: "01",
    title: "See the place",
    body: "The photo is the filter. A restaurant, or a private night. Like the room, you’ll like the night.",
  },
  {
    n: "02",
    title: "See enough",
    body: "Neighbourhood, time, seats left. Soho tonight or Central tomorrow. No faces. Enough to want it.",
  },
  {
    n: "03",
    title: "Take a seat",
    body: "Join, or open the table. HK$5 only when you confirm. That’s for trust, not the meal.",
  },
  {
    n: "04",
    title: "Show up",
    body: "No names before. No photos before. The restaurant is the scene. You bring the vibe.",
  },
  {
    n: "05",
    title: "After the meal",
    body: "Stars aren’t about looks. A short line is your reputation. Your voice matters.",
  },
  {
    n: "06",
    title: "Add a buddy",
    body: "Hey, you’re my vibe. One tap. If they say yes too, you’re buddies.",
  },
  {
    n: "07",
    title: "Host the reason",
    body: "Premium. A private night, up to 20. Wine, social, a hike. You make the reason.",
  },
  {
    n: "08",
    title: "Points change the circle",
    body: "Not the price. Join adds 1. Invite adds 2. Host adds 5. No points yet, the circle stays plain. Points start at bronze. Silver at 100. Gold at 500.",
  },
];

const BADGES = [
  { letter: "B", name: "Bronze", note: "You have points", circle: "bg-[#C68642] text-[#1a1208]" },
  { letter: "S", name: "Silver", note: "100 points", circle: "bg-[#E4E7EC] text-[#1a1408]" },
  { letter: "G", name: "Gold", note: "500 points", circle: "bg-[#E6C15A] text-[#1a1408]" },
];

export default function HowPage() {
  return (
    <main className="bb-frame bg-ink pb-28 pt-10 text-fg md:pb-20">
      <div className="mx-auto w-full max-w-5xl">
      <p className="text-[0.72rem] uppercase tracking-[0.2em] text-ember">How it works</p>
      <h1 className="mt-5 max-w-4xl font-serif text-[3.4rem] leading-[0.95] text-white sm:text-6xl md:text-7xl">
        See the place.
        <br />
        <span className="italic">Take a seat.</span>
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
                        <span className="block text-xs text-white/45">{badge.note}</span>
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
    </main>
  );
}