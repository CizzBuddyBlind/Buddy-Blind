"use client";

const STEPS = [
  {
    n: "01",
    title: "See the venue",
    body: "A restaurant, or a private night. The photo is the filter. Like the light, you’ll like the night.",
  },
  {
    n: "02",
    title: "See enough to want it",
    body: "Neighborhood, vibe, time, seats left. Soho tonight or Central tomorrow. Real numbers. No faces.",
  },
  {
    n: "03",
    title: "Join",
    body: "One tap. HK$5 only when you confirm. That’s for trust, not the meal.",
  },
  {
    n: "04",
    title: "Meet",
    body: "No names before. No photos before. Show up. The restaurant is the scene. You bring the vibe.",
  },
  {
    n: "05",
    title: "Rate and comment",
    body: "Stars aren’t about looks. A short line is your reputation. Your voice matters.",
  },
  {
    n: "06",
    title: "Add a buddy",
    body: "Hey, you’re my vibe. One tap. If they say yes too, you’re buddies.",
  },
  {
    n: "07",
    title: "Create your own",
    body: "Premium. Host a private night. Meet your people. Wine, social, networking. You make the reason.",
  },
];

export default function HowPage() {
  return (
    <main className="bb-frame bg-ink pb-28 pt-16 text-fg md:pb-20">
      <p className="text-[0.72rem] uppercase tracking-[0.2em] text-ember">How it works · No meta wording</p>
      <h1 className="mt-5 max-w-4xl font-serif text-[3.4rem] leading-[0.95] text-white sm:text-6xl md:text-7xl">
        See venue,
        <br />
        see vibe, join.
      </h1>
      <ol className="mt-14 overflow-hidden rounded-[1.7rem] border border-white/15">
        {STEPS.map((step) => (
          <li key={step.n} className="grid grid-cols-[3.2rem_1fr] gap-2 border-t border-white/10 px-6 py-7 first:border-t-0 sm:px-10">
            <span className="pt-2 text-xs tracking-[0.12em] text-white/40">{step.n}</span>
            <div>
              <h2 className="font-serif text-[1.65rem] leading-tight text-white md:text-[1.85rem]">{step.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
