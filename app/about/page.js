export default function AboutPage() {
  return (
    <main className="bb-frame bg-ink pb-28 pt-16 text-fg md:pb-20">
      <p className="text-[0.72rem] uppercase tracking-[0.2em] text-ember">About us</p>
      <h1 className="mt-5 max-w-4xl font-serif leading-[1.05]">
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
    </main>
  );
}
