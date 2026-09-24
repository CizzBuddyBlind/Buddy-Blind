"use client";

const STEPS = [
  {
    n: "01",
    title: "See venue / private event",
    body: "Photo is the filter. If you like the light, you’ll like the people.",
  },
  {
    n: "02",
    title: "See neighborhood / vibe / time / places left",
    body: "Soho tonight? Central tomorrow? How many seats left — real numbers.",
  },
  {
    n: "03",
    title: "Join",
    body: "One tap. HK$5 admin for trust and security. No pre-pay anxiety.",
  },
  {
    n: "04",
    title: "Meet",
    body: "No names before. No photos before. Just show up. Restaurants provide the scene, interact and connect.",
  },
  {
    n: "05",
    title: "Rate & Comment",
    body: "Stars isn’t about looks. A comment is your reputation, and you voice your own.",
  },
  {
    n: "06",
    title: "Add as buddy — Hey! You are my vibe, let's be buddies!",
    body: "One-click after. If both say yes, you’re buddies.",
  },
  {
    n: "07",
    title: "Create your own",
    body: "Premium unlocks private up to 20. Wine, industry, social, Networking — host creates attraction.",
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
