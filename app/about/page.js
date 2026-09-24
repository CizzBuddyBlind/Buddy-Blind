import { MoveBox } from "@/components/MoveBox";

export default function AboutPage() {
  return (
    <main className="bb-frame bg-ink pb-28 pt-16 text-fg md:pb-20">
      <MoveBox id="about-kicker">
        <p className="text-[0.72rem] uppercase tracking-[0.2em] text-ember">About us</p>
      </MoveBox>
      <div className="mt-5 max-w-4xl font-serif leading-[1.05]">
        <MoveBox id="about-line-1">
          <p className="text-3xl text-white sm:text-4xl md:text-5xl">The restaurant is the setting.</p>
        </MoveBox>
        <MoveBox id="about-line-2" className="mt-2">
          <p className="text-3xl text-white sm:text-4xl md:text-5xl">The people are the experience.</p>
        </MoveBox>
        <MoveBox id="about-line-3" className="mt-3">
          <p className="text-5xl text-ember sm:text-6xl md:text-7xl">The conversation is the point.</p>
        </MoveBox>
      </div>
      <div className="mt-12 max-w-2xl space-y-5 text-base leading-relaxed text-white/70">
        <MoveBox id="about-p1">
          <p>Buddy Blind is built on one simple idea: meet people without knowing exactly who you’re going to meet.</p>
        </MoveBox>
        <MoveBox id="about-p2">
          <p>You choose the time, the place, and how many seats. You know enough to decide you want to go — but you don’t get to pre-select who sits with you. That uncertainty isn’t a bug. It’s the product. We call it the Blind Box.</p>
        </MoveBox>
        <MoveBox id="about-p3">
          <p>Show up. Talk. Discover who they are through a real meal — not a profile, not a swipe, and not endless scrolling beforehand.</p>
        </MoveBox>
        <MoveBox id="about-p4">
          <p>Buddy Blind is not a dating app. It’s a way to get more real interaction back into everyday life: dinner, lunch near work, a drink after — planned in the app, lived at the table.</p>
        </MoveBox>
      </div>
    </main>
  );
}
